create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'founder', 'edc')),
  full_name text not null default '',
  student_profile jsonb,
  founder_profile jsonb,
  edc_profile jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  profile_role text := new.raw_user_meta_data ->> 'role';
begin
  if profile_role not in ('student', 'founder', 'edc') or profile_role is null then
    profile_role := 'student';
  end if;

  insert into public.profiles (
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
    case when profile_role = 'edc' then coalesce(new.raw_user_meta_data -> 'edcProfile', '{}'::jsonb) end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();