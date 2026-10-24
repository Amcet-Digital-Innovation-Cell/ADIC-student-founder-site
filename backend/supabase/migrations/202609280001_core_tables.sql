create table if not exists public.requirements (
  id text primary key,
  company text not null default '',
  role text not null default '',
  stack text[] not null default '{}',
  location text not null default 'Remote',
  stipend text not null default 'Unpaid',
  status text not null default 'OPEN',
  approval_status text not null default 'PENDING_APPROVAL',
  approved_by text,
  approved_at timestamptz,
  posted text not null default 'Just now',
  posted_date timestamptz not null default now(),
  deadline timestamptz,
  is_urgent boolean not null default false,
  founder_email text,
  founder_id uuid references auth.users (id) on delete set null,
  blurb text not null default '',
  edc_notes text,
  rejection_reason text
);

create table if not exists public.applications (
  id uuid primary key,
  requirement_id text references public.requirements (id) on delete set null,
  founder_email text,
  founder_id uuid references auth.users (id) on delete set null,
  applicant_id uuid references auth.users (id) on delete set null,
  applicant_name text not null default '',
  applicant_email text not null default '',
  role_title text,
  company_name text,
  department text,
  college text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  skills text[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  status text,
  resume_path text
);

alter table public.requirements enable row level security;
alter table public.applications enable row level security;

create index if not exists requirements_approval_status_idx
  on public.requirements (approval_status);

create index if not exists applications_requirement_id_idx
  on public.applications (requirement_id);

create index if not exists applications_applicant_email_idx
  on public.applications (applicant_email);

create index if not exists applications_founder_email_idx
  on public.applications (founder_email);