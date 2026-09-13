begin;

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz default now()
);

alter table public.staff_users enable row level security;
revoke all on table public.staff_users from public, anon, authenticated;
grant select on table public.staff_users to service_role;
grant select on table public.ratings to service_role;

-- No client policies: membership is read only by the server-side Edge Function.
-- Existing ratings grants and INSERT policy remain unchanged.
commit;
