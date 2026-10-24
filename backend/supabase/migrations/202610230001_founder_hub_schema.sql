-- ================================================================
-- Migration: Move project tables into the `founder_hub` schema
-- Date:      2026-10-23
-- Project:   Founder Hub (ADIC Student Founder Site)
-- ================================================================
--
-- PURPOSE
-- -------
-- This migration isolates all Founder Hub tables, functions, and
-- triggers from the shared `public` schema into a dedicated
-- `founder_hub` schema, while keeping everything inside the same
-- Supabase project.
--
-- SAFETY RULES
-- ------------
-- No tables are dropped, truncated, or recreated.
-- Data is preserved — ALTER TABLE ... SET SCHEMA only moves the
--   table definition; rows are untouched.
-- All FK references between tables in this project are preserved
--   automatically (they move together into the same schema).
-- FKs to auth.users (external schema) remain valid.
-- RLS is re-enabled on every table after the move.
-- Existing policies are dropped and recreated under the new schema.
--
-- EXECUTION INSTRUCTIONS
-- ----------------------
-- 1. Open Supabase Dashboard → SQL Editor
--    https://supabase.com/dashboard/project/ukqhurekyqqapedrslws
-- 2. Paste this entire file into the editor.
-- 3. Review every block carefully before running.
-- 4. Click Run — the entire file runs in one transaction.
-- 5. After success, go to Project Settings → Data API → Exposed schemas
--    and add "founder_hub". Click Save.
-- 6. Verify tables appear under founder_hub in Table Editor.
-- ================================================================

begin;

-- ================================================================
-- STEP 1: Create the schema
-- ================================================================
create schema if not exists founder_hub;

comment on schema founder_hub is
  'Project-specific schema for the Founder Hub / ADIC Student Founder site.';

-- ================================================================
-- STEP 2: Grant usage on the schema to Supabase built-in roles
-- ================================================================
grant usage on schema founder_hub to anon;
grant usage on schema founder_hub to authenticated;
grant usage on schema founder_hub to service_role;

-- ================================================================
-- STEP 3: Move tables from public → founder_hub
-- Order: profiles → requirements → applications (FK dep) → the rest
-- ================================================================
alter table if exists public.profiles         set schema founder_hub;
alter table if exists public.requirements      set schema founder_hub;
alter table if exists public.applications      set schema founder_hub;
alter table if exists public.founder_logins    set schema founder_hub;
alter table if exists public.student_logins    set schema founder_hub;
alter table if exists public.edc_activity_log  set schema founder_hub;

-- ================================================================
-- STEP 4: Grant table-level permissions
-- ================================================================
grant select, insert, update            on founder_hub.profiles         to authenticated;
grant select, insert, update, delete    on founder_hub.profiles         to service_role;

grant select                            on founder_hub.requirements      to anon;
grant select, insert, update            on founder_hub.requirements      to authenticated;
grant select, insert, update, delete    on founder_hub.requirements      to service_role;

grant select, insert, update            on founder_hub.applications      to authenticated;
grant select, insert, update, delete    on founder_hub.applications      to service_role;

grant select                            on founder_hub.founder_logins    to authenticated;
grant select, insert, update, delete    on founder_hub.founder_logins    to service_role;

grant select                            on founder_hub.student_logins    to authenticated;
grant select, insert, update, delete    on founder_hub.student_logins    to service_role;

grant select                            on founder_hub.edc_activity_log  to authenticated;
grant select, insert                    on founder_hub.edc_activity_log  to service_role;

-- ================================================================
-- STEP 5: Default privileges for future objects in this schema
-- ================================================================
alter default privileges in schema founder_hub
  grant select on tables to anon;

alter default privileges in schema founder_hub
  grant select, insert, update on tables to authenticated;

alter default privileges in schema founder_hub
  grant select, insert, update, delete on tables to service_role;

alter default privileges in schema founder_hub
  grant usage, select on sequences to authenticated;

alter default privileges in schema founder_hub
  grant usage, select on sequences to service_role;

alter default privileges in schema founder_hub
  grant execute on functions to authenticated;

alter default privileges in schema founder_hub
  grant execute on functions to service_role;

-- ================================================================
-- STEP 6: Re-enable RLS on all tables
-- ================================================================
alter table founder_hub.profiles         enable row level security;
alter table founder_hub.requirements      enable row level security;
alter table founder_hub.applications      enable row level security;
alter table founder_hub.founder_logins    enable row level security;
alter table founder_hub.student_logins    enable row level security;
alter table founder_hub.edc_activity_log  enable row level security;

-- ================================================================
-- STEP 7: Drop existing policies (recreated cleanly below)
-- ================================================================
drop policy if exists "Public can view approved requirements"        on founder_hub.requirements;
drop policy if exists "Founders can view own requirements"           on founder_hub.requirements;
drop policy if exists "Founders can insert requirements"             on founder_hub.requirements;
drop policy if exists "Founders can update own pending requirements" on founder_hub.requirements;
drop policy if exists "Service role has full access to requirements" on founder_hub.requirements;

drop policy if exists "Students can view own applications"                  on founder_hub.applications;
drop policy if exists "Founders can view applications for own requirements" on founder_hub.applications;
drop policy if exists "Students can insert applications"                    on founder_hub.applications;
drop policy if exists "Founders can update application status"              on founder_hub.applications;
drop policy if exists "Service role has full access to applications"        on founder_hub.applications;

drop policy if exists "Founders can view own login history"    on founder_hub.founder_logins;
drop policy if exists "Service role can insert founder logins" on founder_hub.founder_logins;

drop policy if exists "Students can view own login history"    on founder_hub.student_logins;
drop policy if exists "Service role can insert student logins" on founder_hub.student_logins;

drop policy if exists "EDC users can view activity log"              on founder_hub.edc_activity_log;
drop policy if exists "Service role can insert activity log entries" on founder_hub.edc_activity_log;

-- ================================================================
-- STEP 8: Recreate RLS policies under the new schema
-- ================================================================

-- profiles
create policy "Users can view own profile"
  on founder_hub.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on founder_hub.profiles for update
  using (auth.uid() = id);

-- requirements
create policy "Public can view approved requirements"
  on founder_hub.requirements for select
  using (approval_status = 'APPROVED');

create policy "Founders can view own requirements"
  on founder_hub.requirements for select
  using (auth.uid() = founder_id);

create policy "Founders can insert requirements"
  on founder_hub.requirements for insert
  with check (auth.uid() = founder_id);

create policy "Founders can update own pending requirements"
  on founder_hub.requirements for update
  using (auth.uid() = founder_id and approval_status = 'PENDING_APPROVAL');

create policy "Service role has full access to requirements"
  on founder_hub.requirements for all
  using (true)
  with check (true);

-- applications
create policy "Students can view own applications"
  on founder_hub.applications for select
  using (auth.uid() = applicant_id);

create policy "Founders can view applications for own requirements"
  on founder_hub.applications for select
  using (auth.uid() = founder_id);

create policy "Students can insert applications"
  on founder_hub.applications for insert
  with check (auth.uid() = applicant_id);

create policy "Founders can update application status"
  on founder_hub.applications for update
  using (auth.uid() = founder_id);

create policy "Service role has full access to applications"
  on founder_hub.applications for all
  using (true)
  with check (true);

-- founder_logins
create policy "Founders can view own login history"
  on founder_hub.founder_logins for select
  using (auth.uid() = founder_id);

create policy "Service role can insert founder logins"
  on founder_hub.founder_logins for insert
  with check (true);

-- student_logins
create policy "Students can view own login history"
  on founder_hub.student_logins for select
  using (auth.uid() = student_id);

create policy "Service role can insert student logins"
  on founder_hub.student_logins for insert
  with check (true);

-- edc_activity_log
-- NOTE: references founder_hub.profiles (not public.profiles — corrected from original)
create policy "EDC users can view activity log"
  on founder_hub.edc_activity_log for select
  using (
    exists (
      select 1
      from founder_hub.profiles p
      where p.id = auth.uid() and p.role = 'edc'
    )
  );

create policy "Service role can insert activity log entries"
  on founder_hub.edc_activity_log for insert
  with check (true);

-- ================================================================
-- STEP 9: Recreate functions in founder_hub
-- ================================================================

create or replace function founder_hub.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_requirements_updated_at on founder_hub.requirements;
create trigger trg_requirements_updated_at
  before update on founder_hub.requirements
  for each row execute function founder_hub.set_updated_at();

drop trigger if exists trg_applications_updated_at on founder_hub.applications;
create trigger trg_applications_updated_at
  before update on founder_hub.applications
  for each row execute function founder_hub.set_updated_at();

-- ================================================================
-- STEP 10: Update approval-change audit trigger
-- (now inserts into founder_hub.edc_activity_log)
-- ================================================================

create or replace function founder_hub.log_requirement_approval_change()
returns trigger
language plpgsql
security definer
set search_path = founder_hub, pg_temp
as $$
begin
  if old.approval_status is distinct from new.approval_status then
    insert into founder_hub.edc_activity_log (
      action, entity_type, entity_id, description, before_state, after_state
    ) values (
      case new.approval_status
        when 'APPROVED' then 'REQUIREMENT_APPROVED'
        when 'REJECTED' then 'REQUIREMENT_REJECTED'
        else 'REQUIREMENT_STATUS_CHANGED'
      end,
      'requirement',
      new.id,
      'Requirement "' || new.role || '" at ' || new.company ||
        ' changed from ' || old.approval_status || ' to ' || new.approval_status,
      jsonb_build_object('approval_status', old.approval_status, 'edc_notes', old.edc_notes),
      jsonb_build_object(
        'approval_status', new.approval_status,
        'approved_by',     new.approved_by,
        'approved_at',     new.approved_at,
        'rejection_reason',new.rejection_reason,
        'edc_notes',       new.edc_notes
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_requirement_approval on founder_hub.requirements;
create trigger trg_log_requirement_approval
  after update on founder_hub.requirements
  for each row execute function founder_hub.log_requirement_approval_change();

-- ================================================================
-- STEP 11: Update the auth signup trigger
-- (now inserts into founder_hub.profiles instead of public.profiles)
-- The trigger itself stays on auth.users; only the function body changes.
-- ================================================================

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = founder_hub, public, pg_temp
as $$
declare
  profile_role text := new.raw_user_meta_data ->> 'role';
begin
  if profile_role not in ('student', 'founder', 'edc') or profile_role is null then
    profile_role := 'student';
  end if;

  insert into founder_hub.profiles (
    id,
    role,
    full_name,
    student_profile,
    founder_profile,
    edc_profile
  )
  values (
    new.id,
    profile_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when profile_role = 'student' then coalesce(new.raw_user_meta_data -> 'studentProfile', '{}'::jsonb) end,
    case when profile_role = 'founder' then coalesce(new.raw_user_meta_data -> 'founderProfile', '{}'::jsonb) end,
    case when profile_role = 'edc'     then coalesce(new.raw_user_meta_data -> 'edcProfile',     '{}'::jsonb) end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

-- ================================================================
-- OPTIONAL CLEANUP: Remove now-orphaned public functions
-- Uncomment and run ONLY after verifying nothing else in the
-- Supabase project uses these public schema functions.
-- ================================================================
-- drop function if exists public.set_updated_at() cascade;
-- drop function if exists public.log_requirement_approval_change() cascade;
-- (public.create_profile_for_auth_user is intentionally kept in public)

-- ================================================================
-- VERIFICATION QUERIES
-- Uncomment and run individually to confirm the migration succeeded.
-- ================================================================

-- Tables in founder_hub:
-- select tablename from pg_tables where schemaname = 'founder_hub';

-- RLS policies in founder_hub:
-- select tablename, policyname, cmd from pg_policies where schemaname = 'founder_hub';

-- Functions in founder_hub:
-- select routine_name from information_schema.routines where routine_schema = 'founder_hub';

-- ================================================================
-- DASHBOARD STEP (MANUAL — required after this script runs)
-- ================================================================
-- 1. Go to: https://supabase.com/dashboard/project/ukqhurekyqqapedrslws
-- 2. Navigate to: Project Settings → Data API → Exposed Schemas
-- 3. Add: founder_hub
-- 4. Click: Save
-- PostgREST will reload automatically and start accepting
-- supabase.schema("founder_hub").from(...) requests.
-- ================================================================

commit;
