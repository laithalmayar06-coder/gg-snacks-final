-- Run in staging after 003, 004 and 006. Does not require rating migration 005.
begin;
insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000601'),
 ('00000000-0000-0000-0000-000000000602'),
 ('00000000-0000-0000-0000-000000000603');
insert into public.staff_users(user_id,role) values
 ('00000000-0000-0000-0000-000000000601','admin'),
 ('00000000-0000-0000-0000-000000000602','viewer');
insert into public.enquiries(id,enquiry_type,name,email,message,language)
 values ('00000000-0000-0000-0000-000000000604','general','Fixture','fixture@example.test','Private fixture','en');
set local role anon;
do $$ begin
 begin perform * from public.enquiries; raise exception 'Anonymous read allowed'; exception when insufficient_privilege then null; end;
 begin update public.enquiries set status='resolved'; raise exception 'Anonymous update allowed'; exception when insufficient_privilege then null; end;
 begin delete from public.enquiries; raise exception 'Anonymous delete allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.enquiries(enquiry_type,name,email,message,language) values ('general','Test','test@example.test','Test','en'); raise exception 'Direct anonymous insert allowed'; exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000603","aal":"aal2"}',true);
do $$ begin
 if exists(select 1 from public.enquiries) then raise exception 'Nonstaff read allowed'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000601","aal":"aal1"}',true);
do $$ declare n integer; begin
 if exists(select 1 from public.enquiries) then raise exception 'AAL1 staff read allowed'; end if;
 update public.enquiries set status='resolved'; get diagnostics n = row_count;
 if n <> 0 then raise exception 'AAL1 staff update allowed'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000602","aal":"aal2"}',true);
do $$ declare n integer; begin
 if not exists(select 1 from public.enquiries where id='00000000-0000-0000-0000-000000000604') then raise exception 'Viewer cannot read'; end if;
 update public.enquiries set status='resolved'; get diagnostics n = row_count;
 if n <> 0 then raise exception 'Viewer update allowed'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000601","aal":"aal2"}',true);
do $$ declare n integer; begin
 update public.enquiries set status='in-progress' where id='00000000-0000-0000-0000-000000000604'; get diagnostics n = row_count;
 if n <> 1 then raise exception 'Admin status update failed'; end if;
 begin update public.enquiries set message='Changed'; raise exception 'Admin content edit allowed'; exception when insufficient_privilege then null; end;
 begin update public.enquiries set status='invalid'; raise exception 'Invalid status allowed'; exception when check_violation then null; end;
 begin delete from public.enquiries; raise exception 'Admin deletion allowed'; exception when insufficient_privilege then null; end;
end $$;
rollback;