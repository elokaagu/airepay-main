-- ============ Helpers ============
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ goals ============
create type public.goal_priority as enum ('P0', 'P1', 'P2', 'Engine');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  tagline text,
  priority public.goal_priority not null default 'P1',
  target numeric(14,2) not null default 0,
  current_amount numeric(14,2) not null default 0,
  monthly numeric(14,2) not null default 0,
  days_to_goal integer,
  apr numeric(6,2),
  is_north_star boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals(user_id);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals"
  on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals"
  on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals"
  on public.goals for delete using (auth.uid() = user_id);

create trigger update_goals_updated_at
  before update on public.goals
  for each row execute function public.update_updated_at_column();

-- ============ ripples (agent decisions / accepted pivots) ============
create table public.ripples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  action text not null,
  amount numeric(14,2) not null default 0,
  days_delta integer not null default 0,
  tag text not null default 'PIVOT',
  created_at timestamptz not null default now()
);

create index ripples_user_id_created_idx on public.ripples(user_id, created_at desc);

alter table public.ripples enable row level security;

create policy "Users can view own ripples"
  on public.ripples for select using (auth.uid() = user_id);
create policy "Users can insert own ripples"
  on public.ripples for insert with check (auth.uid() = user_id);
create policy "Users can delete own ripples"
  on public.ripples for delete using (auth.uid() = user_id);
