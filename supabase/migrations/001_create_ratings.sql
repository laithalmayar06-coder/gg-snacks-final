begin;

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  flavor_slug text not null,
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  language text,
  source text default 'qr',
  created_at timestamptz default now()
);

alter table public.ratings enable row level security;

revoke all on table public.ratings from public, anon, authenticated;
grant usage on schema public to anon;
grant insert (product_slug, flavor_slug, rating, comment, language, source)
  on public.ratings to anon;

create policy "Anonymous rating inserts"
  on public.ratings for insert to anon
  with check (
    rating between 1 and 5
    and (comment is null or char_length(comment) <= 1000)
    and (language is null or language in ('en', 'ar'))
    and source = 'qr'
    and product_slug in ('loots', 'trigger', 'x-stix', 'pop-g')
    and flavor_slug in ('flavor-1', 'flavor-2', 'flavor-3')
  );

commit;
