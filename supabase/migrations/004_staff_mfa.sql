begin;

-- Tighten only privileged policies. Public reads and anonymous ratings are unchanged.
-- cms_staff_role() remains available at AAL1 for the allowlisted enrollment flow.
do $$ declare table_name text; begin
  foreach table_name in array array['products','flavors','stores','site_content','tournament_content','contact_settings'] loop
    execute format('alter policy "Staff read CMS" on public.%I using ((select public.cms_staff_role()) in (''viewer'', ''admin'') and (select auth.jwt()->>''aal'') = ''aal2'')', table_name);
    execute format('alter policy "Admin insert CMS" on public.%I with check ((select public.cms_staff_role()) = ''admin'' and (select auth.jwt()->>''aal'') = ''aal2'')', table_name);
    execute format('alter policy "Admin update CMS" on public.%I using ((select public.cms_staff_role()) = ''admin'' and (select auth.jwt()->>''aal'') = ''aal2'') with check ((select public.cms_staff_role()) = ''admin'' and (select auth.jwt()->>''aal'') = ''aal2'')', table_name);
  end loop;
end $$;
alter policy "Admin delete stores" on public.stores
  using ((select public.cms_staff_role()) = 'admin' and (select auth.jwt()->>'aal') = 'aal2');
commit;
