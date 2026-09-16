begin;

-- Uses existing membership. Never expose staff_users or accept a caller-supplied user id.
create function public.cms_staff_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.staff_users where user_id = (select auth.uid()) $$;
revoke all on function public.cms_staff_role() from public, anon;
grant execute on function public.cms_staff_role() to authenticated;

create function public.cms_safe_url(value text, asset boolean default false) returns boolean
language sql immutable set search_path = '' as $$
  select value is null or value = '' or value ~ '^https?://[^[:space:]]+$'
    or (asset and value ~ '^/[^/[:space:]][^[:space:]]*$')
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  name_en text not null check (length(trim(name_en)) between 1 and 150),
  name_ar text not null check (length(trim(name_ar)) between 1 and 150),
  description_en text not null default '' check (length(description_en) <= 10000),
  description_ar text not null default '' check (length(description_ar) <= 10000),
  size_en text not null default '', size_ar text not null default '',
  ingredients_en text not null default '', ingredients_ar text not null default '',
  allergens_en text not null default '', allergens_ar text not null default '',
  nutrition_en text not null default '', nutrition_ar text not null default '',
  image_url text check (public.cms_safe_url(image_url, true)),
  accent text not null default '#00cfff' check (accent ~ '^#[0-9a-fA-F]{6}$'),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order between 0 and 10000),
  updated_at timestamptz not null default now()
);
create table public.flavors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  name_en text not null check (length(trim(name_en)) between 1 and 150),
  name_ar text not null check (length(trim(name_ar)) between 1 and 150),
  description_en text not null default '' check (length(description_en) <= 10000),
  description_ar text not null default '' check (length(description_ar) <= 10000),
  image_url text check (public.cms_safe_url(image_url, true)),
  accent text not null default '#00cfff' check (accent ~ '^#[0-9a-fA-F]{6}$'),
  is_active boolean not null default true,
  is_placeholder boolean not null default false,
  display_order integer not null default 0 check (display_order between 0 and 10000),
  updated_at timestamptz not null default now(),
  unique (product_id, slug)
);
create index on public.flavors(product_id);
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name_en text not null check (length(trim(name_en)) between 1 and 150),
  name_ar text not null check (length(trim(name_ar)) between 1 and 150),
  city_en text not null check (length(trim(city_en)) between 1 and 150),
  city_ar text not null check (length(trim(city_ar)) between 1 and 150),
  district_en text not null check (length(trim(district_en)) between 1 and 150),
  district_ar text not null check (length(trim(district_ar)) between 1 and 150),
  address_en text not null default '', address_ar text not null default '',
  online_url text check (public.cms_safe_url(online_url)),
  map_url text check (public.cms_safe_url(map_url)),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order between 0 and 10000),
  updated_at timestamptz not null default now()
);
create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('about','story','vision','mission','values','why-1','why-2','why-3','why-4')),
  title_en text not null default '', title_ar text not null default '',
  body_en text not null default '' check (length(body_en) <= 20000),
  body_ar text not null default '' check (length(body_ar) <= 20000),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order between 0 and 10000),
  updated_at timestamptz not null default now()
);
create table public.tournament_content (
  id integer primary key default 1 check (id = 1),
  title_en text not null default '', title_ar text not null default '',
  registration_date date, tournament_date date,
  game_en text not null default '', game_ar text not null default '',
  prize_en text not null default '', prize_ar text not null default '',
  description_en text not null default '', description_ar text not null default '',
  rules_en text not null default '', rules_ar text not null default '',
  registration_en text not null default '', registration_ar text not null default '',
  stream_url text check (public.cms_safe_url(stream_url)),
  status text not null default 'coming-soon' check (status in ('coming-soon','announced','completed')),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  check (registration_date is null or tournament_date is null or registration_date <= tournament_date)
);
create table public.contact_settings (
  id integer primary key default 1 check (id = 1),
  email text not null default '' check (email = '' or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null default '', whatsapp text not null default '',
  instagram text check (public.cms_safe_url(instagram)),
  tiktok text check (public.cms_safe_url(tiktok)),
  x text check (public.cms_safe_url(x)),
  youtube text check (public.cms_safe_url(youtube)),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Slugs and parent identities are permanent: renaming labels must not break printed URLs.
create function public.cms_protect_identity() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id then raise exception 'CMS ids are immutable'; end if;
  if tg_table_name in ('products','flavors') and (to_jsonb(new)->>'slug') is distinct from (to_jsonb(old)->>'slug') then
    raise exception 'Catalog slugs are immutable; change the display name instead';
  end if;
  if tg_table_name = 'flavors' and (to_jsonb(new)->>'product_id') is distinct from (to_jsonb(old)->>'product_id') then
    raise exception 'Flavor parent is immutable';
  end if;
  new.updated_at = clock_timestamp();
  return new;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['products','flavors','stores','site_content','tournament_content','contact_settings'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update on public.%I to authenticated', table_name);
    execute format('grant all on public.%I to service_role', table_name);
    execute format('create policy "Staff read CMS" on public.%I for select to authenticated using ((select public.cms_staff_role()) in (''viewer'', ''admin''))', table_name);
    execute format('create policy "Admin insert CMS" on public.%I for insert to authenticated with check ((select public.cms_staff_role()) = ''admin'')', table_name);
    execute format('create policy "Admin update CMS" on public.%I for update to authenticated using ((select public.cms_staff_role()) = ''admin'') with check ((select public.cms_staff_role()) = ''admin'')', table_name);
    -- Catalog data is public, including archived entries needed by stable product URLs.
    -- Other inactive content (drafts/stores/settings) is never publicly readable.
    execute format('create policy "Public CMS read" on public.%I for select to anon, authenticated using (%s)', table_name, case when table_name in ('products','flavors') then 'true' else 'is_active' end);
    execute format('create trigger cms_identity before update on public.%I for each row execute function public.cms_protect_identity()', table_name);
  end loop;
end $$;
-- Only stores may be physically deleted. Catalog entries use enable/disable instead.
grant delete on public.stores to authenticated;
create policy "Admin delete stores" on public.stores for delete to authenticated
using ((select public.cms_staff_role()) = 'admin');

insert into public.products (slug,name_en,name_ar,accent,display_order) values
 ('pop-g','POP-G','POP-G','#63ddff',0), ('trigger','TRIGGER','TRIGGER','#ff945b',1),
 ('loots','LOOTS','LOOTS','#ce99ff',2), ('x-stix','X-STIX','X-STIX','#cee96e',3);
insert into public.flavors (product_id,slug,name_en,name_ar,accent,is_placeholder,display_order)
select p.id, 'flavor-' || n, 'Flavor 0' || n, 'النكهة 0' || n, p.accent, true, n - 1
from public.products p cross join generate_series(1,3) n;
insert into public.site_content (key) values ('about'),('story'),('vision'),('mission'),('values'),('why-1'),('why-2'),('why-3'),('why-4');
insert into public.tournament_content (id) values (1);
insert into public.contact_settings (id) values (1);

-- This migration deliberately leaves ratings, its INSERT policy, staff_users, and auth unchanged.
commit;
