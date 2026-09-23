begin;
create table public.enquiries (
 id uuid primary key default gen_random_uuid(),
 enquiry_type text not null check (enquiry_type in ('general','distribution','retail','partnership','creator','sponsorship','media')),
 name text not null check (char_length(btrim(name)) between 1 and 200),
 company text check (char_length(company) <= 200),
 email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text check (char_length(phone) <= 30),
 message text not null check (char_length(btrim(message)) between 1 and 3000),
 language text not null check (language in ('en','ar')),
 created_at timestamptz not null default now(),
 status text not null default 'new' check (status in ('new','in-progress','resolved'))
);
create index enquiries_created_at_idx on public.enquiries (created_at desc, id desc);
alter table public.enquiries enable row level security;
revoke all on public.enquiries from public, anon, authenticated;
grant select on public.enquiries to authenticated;
grant update (status) on public.enquiries to authenticated;
grant insert on public.enquiries to service_role;
create policy "AAL2 staff read enquiries" on public.enquiries for select to authenticated
 using ((select public.cms_staff_role()) in ('admin','viewer') and (select auth.jwt()->>'aal') = 'aal2');
create policy "AAL2 admin update enquiry status" on public.enquiries for update to authenticated
 using ((select public.cms_staff_role()) = 'admin' and (select auth.jwt()->>'aal') = 'aal2')
 with check ((select public.cms_staff_role()) = 'admin' and (select auth.jwt()->>'aal') = 'aal2');
commit;