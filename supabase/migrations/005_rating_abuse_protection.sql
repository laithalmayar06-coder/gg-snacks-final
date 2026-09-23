begin;

-- Private transient counters; no identifier is added to existing rating rows.
create schema if not exists rating_security;
revoke all on schema rating_security from public, anon, authenticated;
create table rating_security.source_limits (
  source_hash text primary key check (source_hash ~ '^[0-9a-f]{64}$'),
  accepted_at timestamptz[] not null default '{}',
  expires_at timestamptz not null default now() + interval '1 hour'
);
alter table rating_security.source_limits enable row level security;
revoke all on rating_security.source_limits from public, anon, authenticated;
create index on rating_security.source_limits(expires_at);

create function public.submit_anonymous_rating(
  p_source_hash text, p_product text, p_flavor text, p_rating integer,
  p_comment text, p_language text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  recent timestamptz[];
  recent_minute timestamptz[];
  current_time_utc timestamptz;
  wait_seconds integer := 0;
begin
  if p_source_hash is null or p_source_hash !~ '^[0-9a-f]{64}$'
    or p_product is null or p_product not in ('loots','trigger','x-stix','pop-g')
    or p_flavor is null or p_flavor not in ('flavor-1','flavor-2','flavor-3')
    or p_rating is null or p_rating not between 1 and 5
    or (p_comment is not null and char_length(p_comment) > 1000)
    or p_language is null or p_language not in ('en','ar') then
    raise exception 'Invalid rating request' using errcode = '22023';
  end if;

  insert into rating_security.source_limits(source_hash) values (p_source_hash)
    on conflict (source_hash) do nothing;
  select accepted_at into recent from rating_security.source_limits
    where source_hash = p_source_hash for update;
  -- Read time after obtaining the lock so concurrent requests use committed state.
  current_time_utc := clock_timestamp();
  select coalesce(array_agg(t order by t), '{}'::timestamptz[]) into recent
    from unnest(recent) t where t > current_time_utc - interval '1 hour';
  select coalesce(array_agg(t order by t), '{}'::timestamptz[]) into recent_minute
    from unnest(recent) t where t > current_time_utc - interval '1 minute';
  if cardinality(recent) > 0 then
    wait_seconds := greatest(0, ceil(extract(epoch from (recent[cardinality(recent)] + interval '10 seconds' - current_time_utc)))::integer);
  end if;
  if cardinality(recent_minute) >= 5 then
    wait_seconds := greatest(wait_seconds, ceil(extract(epoch from (recent_minute[1] + interval '1 minute' - current_time_utc)))::integer);
  end if;
  if cardinality(recent) >= 30 then
    wait_seconds := greatest(wait_seconds, ceil(extract(epoch from (recent[1] + interval '1 hour' - current_time_utc)))::integer);
  end if;
  if wait_seconds > 0 then
    return jsonb_build_object('accepted', false, 'retry_after', wait_seconds);
  end if;

  insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
    values (p_product,p_flavor,p_rating,nullif(btrim(p_comment),''),p_language,'qr');
  update rating_security.source_limits
    set accepted_at = array_append(recent,current_time_utc), expires_at = current_time_utc + interval '1 hour'
    where source_hash = p_source_hash;
  return jsonb_build_object('accepted', true);
end $$;
revoke all on function public.submit_anonymous_rating(text,text,text,integer,text,text) from public, anon, authenticated;
grant execute on function public.submit_anonymous_rating(text,text,text,integer,text,text) to service_role;

-- Schedule hourly using Supabase Cron; only the limiter metadata is removed.
create function public.purge_rating_limits() returns void
language sql security definer set search_path = '' as $$
  delete from rating_security.source_limits where expires_at < now();
$$;
revoke all on function public.purge_rating_limits() from public, anon, authenticated;
grant execute on function public.purge_rating_limits() to service_role;

-- Closing BOTH the column grant and policy prevents bypass through the REST API.
revoke insert on public.ratings from anon, authenticated;
revoke insert (product_slug,flavor_slug,rating,comment,language,source) on public.ratings from anon, authenticated;
drop policy "Anonymous rating inserts" on public.ratings;
commit;
