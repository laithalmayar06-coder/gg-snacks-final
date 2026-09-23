-- Staging/local only, AFTER migrations 001-005. Fixtures are rolled back.
begin;
insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000501'),
 ('00000000-0000-0000-0000-000000000502'),
 ('00000000-0000-0000-0000-000000000503');
insert into public.staff_users(user_id,role) values
 ('00000000-0000-0000-0000-000000000501','admin'),
 ('00000000-0000-0000-0000-000000000502','viewer');
insert into public.stores(name_en,name_ar,city_en,city_ar,district_en,district_ar,is_active)
values ('MFA private fixture','اختبار','Test','اختبار','Test','اختبار',false);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000501","aal":"aal1"}',true);
do $$ declare table_name text; affected integer; begin
  if public.cms_staff_role() is distinct from 'admin' then raise exception 'AAL1 enrollment membership unavailable'; end if;
  foreach table_name in array array['products','flavors','stores','site_content','tournament_content','contact_settings'] loop
    execute format('update public.%I set updated_at=updated_at',table_name);
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'AAL1 update allowed: %',table_name; end if;
  end loop;
  if exists(select 1 from public.stores where name_en='MFA private fixture') then raise exception 'AAL1 private read allowed'; end if;
  begin
    insert into public.products(slug,name_en,name_ar) values ('mfa-forbidden','Test','اختبار');
    raise exception 'AAL1 insert allowed';
  exception when insufficient_privilege then null; end;
  delete from public.stores where name_en='MFA private fixture';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'AAL1 delete allowed'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000502","aal":"aal2"}',true);
do $$ declare table_name text; affected integer; begin
  if not exists(select 1 from public.stores where name_en='MFA private fixture') then raise exception 'AAL2 viewer cannot read'; end if;
  foreach table_name in array array['products','flavors','stores','site_content','tournament_content','contact_settings'] loop
    execute format('update public.%I set updated_at=updated_at',table_name);
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Viewer update allowed: %',table_name; end if;
  end loop;
  begin
    insert into public.products(slug,name_en,name_ar) values ('mfa-viewer-forbidden','Test','اختبار');
    raise exception 'Viewer insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000501","aal":"aal2"}',true);
insert into public.products(slug,name_en,name_ar,is_active) values ('mfa-catalog-fixture','Test','اختبار',false);
insert into public.flavors(product_id,slug,name_en,name_ar)
select id,'mfa-flavor','Test','اختبار' from public.products where slug='mfa-catalog-fixture';
do $$ declare table_name text; affected integer; begin
  foreach table_name in array array['products','flavors','stores','site_content','tournament_content','contact_settings'] loop
    execute format('update public.%I set updated_at=updated_at',table_name);
    get diagnostics affected = row_count;
    if affected = 0 then raise exception 'AAL2 admin cannot update: %',table_name; end if;
  end loop;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000503","aal":"aal2"}',true);
do $$ begin
  if public.cms_staff_role() is not null then raise exception 'Nonstaff membership'; end if;
  begin
    insert into public.products(slug,name_en,name_ar) values ('mfa-nonstaff-forbidden','Test','اختبار');
    raise exception 'Nonstaff insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claims','{}',true);
do $$ begin
  if not exists(select 1 from public.products where slug='mfa-catalog-fixture') then raise exception 'Public archived catalog read changed'; end if;
  if exists(select 1 from public.stores where name_en='MFA private fixture') then raise exception 'Public private read allowed'; end if;
  begin
    perform 1 from public.staff_users;
    raise exception 'Staff membership leaked';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.ratings;
    raise exception 'Ratings read leaked';
  exception when insufficient_privilege then null; end;
end $$;
-- Anonymous customers now submit through submit-rating, not directly to the table.
do $$ begin
  begin
    insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
      values ('loots','flavor-1',5,'MFA rollback test','en','qr');
    raise exception 'Direct rating insert bypass allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000501","aal":"aal2"}',true);
do $$ declare affected integer; begin
  delete from public.stores where name_en='MFA private fixture';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'AAL2 admin delete failed'; end if;
end $$;
reset role;
rollback;
