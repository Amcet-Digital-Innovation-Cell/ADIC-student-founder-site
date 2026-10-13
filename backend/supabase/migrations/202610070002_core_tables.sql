-- =============================================================
-- Migration: Core Application Tables
-- Created:   2026-10-07
-- Tables:
--   1. founder_logins       – login session history for founders
--   2. student_logins       – login session history for students
--   3. requirements         – posted internship / role requirements
--   4. applications         – student applications to requirements
--   5. edc_activity_log     – full audit history of EDC actions
-- =============================================================

-- ---------------------------------------------------------
-- 1. FOUNDER LOGIN HISTORY
-- ---------------------------------------------------------
create table if not exists public.founder_logins (
  id            uuid        primary key default gen_random_uuid(),
  founder_id    uuid        not null references auth.users (id) on delete cascade,
  email         text        not null,
  ip_address    inet,
  user_agent    text,
  login_at      timestamptz not null default now(),
  logout_at     timestamptz,
  session_token text,
  status        text        not null default 'success'
                             check (status in ('success', 'failed', 'expired'))
);

comment on table public.founder_logins is 'Tracks every login event for founder accounts.';

alter table public.founder_logins enable row level security;

create policy "Founders can view own login history"
  on public.founder_logins for select
  using (auth.uid() = founder_id);

create policy "Service role can insert founder logins"
  on public.founder_logins for insert
  with check (true);

create index if not exists idx_founder_logins_founder_id on public.founder_logins (founder_id);
create index if not exists idx_founder_logins_login_at   on public.founder_logins (login_at desc);

-- ---------------------------------------------------------
-- 2. STUDENT LOGIN HISTORY
-- ---------------------------------------------------------
create table if not exists public.student_logins (
  id            uuid        primary key default gen_random_uuid(),
  student_id    uuid        not null references auth.users (id) on delete cascade,
  email         text        not null,
  ip_address    inet,
  user_agent    text,
  login_at      timestamptz not null default now(),
  logout_at     timestamptz,
  session_token text,
  status        text        not null default 'success'
                             check (status in ('success', 'failed', 'expired'))
);

comment on table public.student_logins is 'Tracks every login event for student accounts.';

alter table public.student_logins enable row level security;

create policy "Students can view own login history"
  on public.student_logins for select
  using (auth.uid() = student_id);

create policy "Service role can insert student logins"
  on public.student_logins for insert
  with check (true);

create index if not exists idx_student_logins_student_id on public.student_logins (student_id);
create index if not exists idx_student_logins_login_at   on public.student_logins (login_at desc);

-- ---------------------------------------------------------
-- 3. REQUIREMENTS (Posted Internship / Roles)
-- ---------------------------------------------------------
create table if not exists public.requirements (
  id               text        primary key,
  founder_id       uuid        references auth.users (id) on delete set null,
  founder_email    text        not null,
  company          text        not null,
  role             text        not null,
  stack            text[]      not null default '{}',
  location         text        not null default 'Remote',
  stipend          text        not null default 'Unpaid',
  blurb            text        not null default '',
  status           text        not null default 'OPEN'
                                check (status in ('OPEN', 'CLOSING SOON', 'CLOSED')),
  approval_status  text        not null default 'PENDING_APPROVAL'
                                check (approval_status in ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
  approved_by      text,
  approved_at      timestamptz,
  rejection_reason text,
  edc_notes        text,
  is_urgent        boolean     not null default false,
  posted           text        not null default 'Just now',
  posted_date      timestamptz not null default now(),
  deadline         timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.requirements is 'Internship / role requirements posted by founders, reviewed by EDC.';

alter table public.requirements enable row level security;

create policy "Public can view approved requirements"
  on public.requirements for select
  using (approval_status = 'APPROVED');

create policy "Founders can view own requirements"
  on public.requirements for select
  using (auth.uid() = founder_id);

create policy "Founders can insert requirements"
  on public.requirements for insert
  with check (auth.uid() = founder_id);

create policy "Founders can update own pending requirements"
  on public.requirements for update
  using (auth.uid() = founder_id and approval_status = 'PENDING_APPROVAL');

create policy "Service role has full access to requirements"
  on public.requirements for all
  using (true)
  with check (true);

create index if not exists idx_requirements_founder_id      on public.requirements (founder_id);
create index if not exists idx_requirements_approval_status on public.requirements (approval_status);
create index if not exists idx_requirements_posted_date     on public.requirements (posted_date desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_requirements_updated_at on public.requirements;
create trigger trg_requirements_updated_at
  before update on public.requirements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 4. APPLICATIONS (Student → Requirement)
-- ---------------------------------------------------------
create table if not exists public.applications (
  id              uuid        primary key default gen_random_uuid(),
  requirement_id  text        not null references public.requirements (id) on delete cascade,
  founder_id      uuid        references auth.users (id) on delete set null,
  founder_email   text,
  applicant_id    uuid        not null references auth.users (id) on delete cascade,
  applicant_name  text        not null,
  applicant_email text        not null,
  role_title      text        not null,
  company_name    text        not null,
  department      text,
  college         text,
  linkedin_url    text,
  github_url      text,
  portfolio_url   text,
  skills          text[],
  note            text,
  resume_path     text,
  status          text        not null default 'Pending'
                               check (status in ('Pending','Reviewing','Interviewing','Accepted','Selected','Rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.applications is 'Student applications submitted for a posted requirement.';

alter table public.applications enable row level security;

create policy "Students can view own applications"
  on public.applications for select
  using (auth.uid() = applicant_id);

create policy "Founders can view applications for own requirements"
  on public.applications for select
  using (auth.uid() = founder_id);

create policy "Students can insert applications"
  on public.applications for insert
  with check (auth.uid() = applicant_id);

create policy "Founders can update application status"
  on public.applications for update
  using (auth.uid() = founder_id);

create policy "Service role has full access to applications"
  on public.applications for all
  using (true)
  with check (true);

create index if not exists idx_applications_requirement_id on public.applications (requirement_id);
create index if not exists idx_applications_applicant_id   on public.applications (applicant_id);
create index if not exists idx_applications_founder_id     on public.applications (founder_id);

drop trigger if exists trg_applications_updated_at on public.applications;
create trigger trg_applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 5. EDC ACTIVITY LOG (Full Audit / History)
-- ---------------------------------------------------------
create table if not exists public.edc_activity_log (
  id          uuid        primary key default gen_random_uuid(),
  edc_user_id uuid        references auth.users (id) on delete set null,
  edc_email   text,
  -- Action performed
  action      text        not null,
  -- Affected entity
  entity_type text,
  entity_id   text,
  -- Human-readable summary
  description text,
  -- Before / after snapshots for full auditability
  before_state jsonb,
  after_state  jsonb,
  -- Extra context (IP address, browser, etc.)
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

comment on table public.edc_activity_log is 'Immutable audit log of every action performed by EDC users.';

alter table public.edc_activity_log enable row level security;

create policy "EDC users can view activity log"
  on public.edc_activity_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'edc'
    )
  );

create policy "Service role can insert activity log entries"
  on public.edc_activity_log for insert
  with check (true);

create index if not exists idx_edc_activity_log_edc_user_id on public.edc_activity_log (edc_user_id);
create index if not exists idx_edc_activity_log_action      on public.edc_activity_log (action);
create index if not exists idx_edc_activity_log_entity      on public.edc_activity_log (entity_type, entity_id);
create index if not exists idx_edc_activity_log_created_at  on public.edc_activity_log (created_at desc);

-- Auto-log when a requirement approval status changes
create or replace function public.log_requirement_approval_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.approval_status is distinct from new.approval_status then
    insert into public.edc_activity_log (
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

drop trigger if exists trg_log_requirement_approval on public.requirements;
create trigger trg_log_requirement_approval
  after update on public.requirements
  for each row execute function public.log_requirement_approval_change();
