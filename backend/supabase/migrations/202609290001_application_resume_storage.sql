alter table public.applications
  add column if not exists applicant_id uuid references auth.users (id) on delete set null,
  add column if not exists founder_id uuid references auth.users (id) on delete set null,
  add column if not exists resume_path text;

alter table public.requirements
  add column if not exists founder_id uuid references auth.users (id) on delete set null;

create index if not exists applications_applicant_id_idx
  on public.applications (applicant_id);

create index if not exists applications_founder_id_idx
  on public.applications (founder_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-files', 'application-files', false, 5242880, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;