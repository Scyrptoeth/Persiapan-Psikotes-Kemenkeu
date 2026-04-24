create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  display_name text not null default 'Peserta',
  role text not null default 'user' check (role in ('user', 'superadmin')),
  is_active boolean not null default true,
  current_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_agent text,
  ip_address inet,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.profiles
  drop constraint if exists profiles_current_session_id_fkey;

alter table public.profiles
  add constraint profiles_current_session_id_fkey
  foreign key (current_session_id)
  references public.app_sessions(id)
  on delete set null;

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('tambah', 'kurang', 'kali', 'bagi', 'mix')),
  package_number integer not null check (package_number between 1 and 10),
  score integer not null check (score between 0 and 40),
  total_questions integer not null default 40,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  blank_count integer not null default 0,
  elapsed_seconds integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists app_sessions_user_id_created_at_idx
  on public.app_sessions(user_id, created_at desc);

create index if not exists attempts_user_package_idx
  on public.attempts(user_id, category, package_number, submitted_at desc);

create index if not exists attempts_submitted_at_idx
  on public.attempts(submitted_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'superadmin'
      and is_active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.app_sessions enable row level security;
alter table public.attempts enable row level security;

drop policy if exists "profiles_select_self_or_superadmin" on public.profiles;
create policy "profiles_select_self_or_superadmin"
on public.profiles
for select
using (id = auth.uid() or public.is_superadmin());

drop policy if exists "sessions_select_self_or_superadmin" on public.app_sessions;
create policy "sessions_select_self_or_superadmin"
on public.app_sessions
for select
using (user_id = auth.uid() or public.is_superadmin());

drop policy if exists "attempts_select_self_or_superadmin" on public.attempts;
create policy "attempts_select_self_or_superadmin"
on public.attempts
for select
using (user_id = auth.uid() or public.is_superadmin());

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.app_sessions to authenticated;
grant select on public.attempts to authenticated;
grant execute on function public.is_superadmin() to authenticated;

