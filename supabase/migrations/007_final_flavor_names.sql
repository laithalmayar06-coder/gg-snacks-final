begin;

-- Target the existing anonymous-insert schema; fail atomically if it has changed.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'ratings'
      and policyname = 'Anonymous rating inserts' and cmd = 'INSERT'
      and permissive = 'PERMISSIVE' and roles = array['anon']::name[]
  ) then
    raise exception 'Expected the existing anon-only Anonymous rating inserts policy; review the live schema';
  end if;
  if (select count(*) from public.products where slug in ('pop-g','trigger')) <> 2
    or (select count(*) from public.flavors f
        join public.products p on p.id = f.product_id
        where p.slug in ('pop-g','trigger') and f.slug in ('flavor-1','flavor-2','flavor-3')) <> 6 then
    raise exception 'Expected POP-G and TRIGGER with their original three CMS flavors';
  end if;
end $$;

-- Preserve IDs, slugs, images, colors, descriptions, ordering and active states.
update public.flavors f
set name_en = names.name_en, name_ar = names.name_ar, is_placeholder = false
from public.products p,
  (values
    ('pop-g','flavor-1','White Cheese','جبنة بيضاء'),
    ('pop-g','flavor-2','Sour Cream & Onion','كريمة حامضة وبصل'),
    ('pop-g','flavor-3','Hot & Sweet','حار وحلو'),
    ('trigger','flavor-1','Chicken Noodles','نودلز الدجاج'),
    ('trigger','flavor-2','Vegetable Noodles','نودلز الخضار'),
    ('trigger','flavor-3','Taco','تاكو')
  ) as names(product_slug, flavor_slug, name_en, name_ar)
where p.id = f.product_id and p.slug = names.product_slug and f.slug = names.flavor_slug;

-- New Sushi entry; preserve any existing record identity and presentation settings.
insert into public.flavors (product_id,slug,name_en,name_ar,accent,is_active,is_placeholder,display_order)
select id, 'flavor-4', 'Sushi', 'سوشي', accent, true, false, 3
from public.products where slug = 'trigger'
on conflict (product_id,slug) do update
set name_en = excluded.name_en, name_ar = excluded.name_ar, is_placeholder = false;

-- Keep every existing validation rule, role and grant. Only TRIGGER gets flavor-4.
alter policy "Anonymous rating inserts"
  on public.ratings
  with check (
    rating between 1 and 5
    and (comment is null or char_length(comment) <= 1000)
    and (language is null or language in ('en', 'ar'))
    and source = 'qr'
    and product_slug in ('loots', 'trigger', 'x-stix', 'pop-g')
    and (
      flavor_slug in ('flavor-1', 'flavor-2', 'flavor-3')
      or (product_slug = 'trigger' and flavor_slug = 'flavor-4')
    )
  );

commit;
