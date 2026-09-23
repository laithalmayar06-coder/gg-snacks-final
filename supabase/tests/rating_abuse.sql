-- Run in staging after migration 005. No persistent fixtures; all changes roll back.
begin;
set local role anon;
do $$ begin
  begin
    insert into public.ratings(product_slug,flavor_slug,rating,source) values ('loots','flavor-1',5,'qr');
    raise exception 'FAIL: direct anonymous insert';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.ratings;
    raise exception 'FAIL: public ratings read';
  exception when insufficient_privilege then null; end;
  begin
    perform public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
    raise exception 'FAIL: public privileged RPC';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from rating_security.source_limits;
    raise exception 'FAIL: source metadata exposed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  begin
    perform public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
    raise exception 'FAIL: authenticated limiter bypass';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.ratings;
    raise exception 'FAIL: direct staff ratings read';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Reserved fixture counters cannot affect normal HMAC source keys.
delete from rating_security.source_limits where source_hash in (repeat('a',64), repeat('b',64));
set local role service_role;
do $$ declare result jsonb; begin
  result := public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
  if (result->>'accepted')::boolean is distinct from true then raise exception 'FAIL: valid submission'; end if;
  result := public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
  if (result->>'accepted')::boolean is distinct from false or (result->>'retry_after')::integer < 1 then raise exception 'FAIL: rapid repeat'; end if;
  result := public.submit_anonymous_rating(repeat('b',64),'pop-g','flavor-3',1,'optional comment','ar');
  if (result->>'accepted')::boolean is distinct from true then raise exception 'FAIL: independent source'; end if;
  begin
    perform public.submit_anonymous_rating(repeat('a',64),'invalid','flavor-1',5,null,'en');
    raise exception 'FAIL: malformed route accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',6,null,'en');
    raise exception 'FAIL: invalid score accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,repeat('x',1001),'en');
    raise exception 'FAIL: long comment accepted';
  exception when invalid_parameter_value then null; end;
  -- Dashboard's server role still has its existing read grant.
  perform 1 from public.ratings limit 1;
end $$;
reset role;
update rating_security.source_limits set accepted_at = array[
  now()-interval '50 seconds',now()-interval '40 seconds',now()-interval '30 seconds',
  now()-interval '20 seconds',now()-interval '11 seconds'
] where source_hash=repeat('a',64);
set local role service_role;
do $$ declare result jsonb; begin
  result := public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
  if (result->>'accepted')::boolean is distinct from false then raise exception 'FAIL: minute limit'; end if;
end $$;
reset role;
update rating_security.source_limits set accepted_at = array(
  select now()-interval '59 minutes'+n*interval '1 minute' from generate_series(0,29) n
) where source_hash=repeat('a',64);
set local role service_role;
do $$ declare result jsonb; begin
  result := public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
  if (result->>'accepted')::boolean is distinct from false then raise exception 'FAIL: hour limit'; end if;
end $$;
reset role;
update rating_security.source_limits set accepted_at=array[now()-interval '61 minutes'],expires_at=now()-interval '1 minute' where source_hash=repeat('a',64);
set local role service_role;
do $$ declare result jsonb; begin
  result := public.submit_anonymous_rating(repeat('a',64),'loots','flavor-1',5,null,'en');
  if (result->>'accepted')::boolean is distinct from true then raise exception 'FAIL: recovery after expiry'; end if;
end $$;
reset role;
update rating_security.source_limits set expires_at=now()-interval '1 minute' where source_hash=repeat('b',64);
select public.purge_rating_limits();
do $$ begin
  if exists(select 1 from rating_security.source_limits where source_hash=repeat('b',64)) then raise exception 'FAIL: expiry cleanup'; end if;
end $$;
rollback;
