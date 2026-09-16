-- Run AFTER migration 003 in a local/staging Supabase database or SQL editor.
-- Every test fixture is rolled back. Never substitutes for existing production backups.
begin;
insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000401'),
 ('00000000-0000-0000-0000-000000000402'),
 ('00000000-0000-0000-0000-000000000403');
insert into public.staff_users(user_id,role) values
 ('00000000-0000-0000-0000-000000000401','admin'),
 ('00000000-0000-0000-0000-000000000402','viewer');
set local role anon;
do $$ begin
  begin
    insert into public.products(slug,name_en,name_ar) values ('cms-rls-test','Test','اختبار');
    raise exception 'FAIL: anonymous insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000403',true);
do $$ begin
  if public.cms_staff_role() is not null then raise exception 'FAIL: nonstaff role'; end if;
  begin
    insert into public.products(slug,name_en,name_ar) values ('cms-rls-test','Test','اختبار');
    raise exception 'FAIL: nonstaff insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000402',true);
do $$ declare affected integer; begin
  if public.cms_staff_role() <> 'viewer' then raise exception 'FAIL: viewer role'; end if;
  update public.products set name_en = 'Unauthorized change';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: viewer update allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000401',true);
insert into public.products(slug,name_en,name_ar) values ('cms-rls-test','Test','اختبار');
insert into public.flavors(product_id,slug,name_en,name_ar)
select id,'test-flavor','Test flavor','نكهة' from public.products where slug='cms-rls-test';
update public.products set name_en='Edited display name' where slug='cms-rls-test';
do $$ begin
  if not exists(select 1 from public.products where slug='cms-rls-test' and name_en='Edited display name') then raise exception 'FAIL: admin update'; end if;
  begin
    update public.products set slug='changed-url' where slug='cms-rls-test';
    raise exception 'FAIL: slug changed';
  exception when raise_exception then
    if sqlerrm = 'FAIL: slug changed' then raise; end if;
  end;
  begin
    delete from public.products where slug='cms-rls-test';
    raise exception 'FAIL: catalog delete allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into public.stores(name_en,name_ar,city_en,city_ar,district_en,district_ar,is_active)
values ('CMS private test','اختبار','Test','اختبار','Test','اختبار',false);
update public.site_content set body_en='CMS test text',body_ar='نص تجريبي' where key='about';
update public.tournament_content set title_en='CMS event',title_ar='فعالية' where id=1;
update public.contact_settings set email='test@example.test' where id=1;
reset role;
set local role anon;
do $$ begin
  if exists(select 1 from public.stores where name_en='CMS private test') then raise exception 'FAIL: inactive store exposed'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000401',true);
delete from public.stores where name_en='CMS private test';
reset role;
rollback;
