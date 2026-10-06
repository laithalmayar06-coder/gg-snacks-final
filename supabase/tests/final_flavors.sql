-- STAGING ONLY, after revised 007 on the anonymous-insert schema. All fixtures roll back.
begin;

do $$
declare
  expected record;
begin
  for expected in
    select * from (values
      ('pop-g','flavor-1','White Cheese','جبنة بيضاء'),
      ('pop-g','flavor-2','Sour Cream & Onion','كريمة حامضة وبصل'),
      ('pop-g','flavor-3','Hot & Sweet','حار وحلو'),
      ('trigger','flavor-1','Chicken Noodles','نودلز الدجاج'),
      ('trigger','flavor-2','Vegetable Noodles','نودلز الخضار'),
      ('trigger','flavor-3','Taco','تاكو'),
      ('trigger','flavor-4','Sushi','سوشي')
    ) as names(product_slug, flavor_slug, name_en, name_ar)
  loop
    if not exists (
      select 1 from public.flavors f join public.products p on p.id = f.product_id
      where p.slug = expected.product_slug and f.slug = expected.flavor_slug
        and f.name_en = expected.name_en and f.name_ar = expected.name_ar
        and f.is_placeholder = false
    ) then
      raise exception 'FAIL: CMS mapping for %/%', expected.product_slug, expected.flavor_slug;
    end if;
  end loop;
  if has_table_privilege('anon', 'public.ratings', 'SELECT')
    or not has_any_column_privilege('anon', 'public.ratings', 'INSERT')
    or has_any_column_privilege('authenticated', 'public.ratings', 'INSERT') then
    raise exception 'FAIL: existing direct ratings grants changed';
  end if;
end $$;

select set_config('gg.flavor_test_marker', 'final-flavors-test-' || gen_random_uuid()::text, true);
set local role anon;
do $$
declare
  product text;
  flavor text;
  invalid record;
  marker text := current_setting('gg.flavor_test_marker');
begin
  insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
    values ('trigger','flavor-4',5,marker,'ar','qr');

  -- All twelve existing QR combinations remain valid.
  foreach product in array array['pop-g','trigger','loots','x-stix'] loop
    foreach flavor in array array['flavor-1','flavor-2','flavor-3'] loop
      insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
        values (product,flavor,4,marker,'en','qr');
    end loop;
  end loop;

  -- Preserve the original nullable language/comment behavior and default source.
  insert into public.ratings(product_slug,flavor_slug,rating)
    values ('trigger','flavor-4',1);

  foreach product in array array['pop-g','loots','x-stix','unknown'] loop
    begin
      insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
        values (product,'flavor-4',5,marker,'en','qr');
      raise exception 'FAIL: fourth flavor accepted for %', product;
    exception when insufficient_privilege then null; end;
  end loop;
  foreach flavor in array array['flavor-5','flavor-04','sushi'] loop
    begin
      insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
        values ('trigger',flavor,5,marker,'en','qr');
      raise exception 'FAIL: unsupported TRIGGER flavor % accepted', flavor;
    exception when insufficient_privilege then null; end;
  end loop;

  -- Keep all original rating, comment, language, source and product validation.
  for invalid in select * from (values
    ('trigger',0,marker,'en','qr'),
    ('trigger',6,marker,'en','qr'),
    ('trigger',5,repeat('x',1001),'en','qr'),
    ('trigger',5,marker,'xx','qr'),
    ('trigger',5,marker,'en','other'),
    ('unknown',5,marker,'en','qr')
  ) as cases(product_slug,rating,comment,language,source) loop
    begin
      insert into public.ratings(product_slug,flavor_slug,rating,comment,language,source)
        values (invalid.product_slug,'flavor-1',invalid.rating,invalid.comment,invalid.language,invalid.source);
      raise exception 'FAIL: invalid rating request accepted';
    exception when insufficient_privilege or check_violation then null; end;
  end loop;
  begin
    perform 1 from public.ratings limit 1;
    raise exception 'FAIL: anonymous SELECT permitted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$
begin
  if (select count(*) from public.ratings where comment = current_setting('gg.flavor_test_marker')) <> 13 then
    raise exception 'FAIL: unexpected accepted rating count';
  end if;
  if not exists (
    select 1 from public.ratings
    where comment = current_setting('gg.flavor_test_marker')
      and product_slug = 'trigger' and flavor_slug = 'flavor-4'
      and rating = 5 and language = 'ar' and source = 'qr'
  ) then
    raise exception 'FAIL: Sushi rating was not stored correctly';
  end if;
end $$;
rollback;
