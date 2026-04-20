-- Wishlist items table
create type public.wishlist_status as enum ('considering', 'planning', 'deferred', 'purchased', 'dismissed');
create type public.wishlist_verdict as enum ('go', 'caution', 'defer', 'pending');

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand text,
  name text not null,
  price numeric not null default 0,
  url text,
  image_url text,
  notes text,
  status public.wishlist_status not null default 'considering',
  verdict public.wishlist_verdict not null default 'pending',
  verdict_text text,
  impact_days integer,
  impact_goal_id uuid references public.goals(id) on delete set null,
  fundable_months numeric,
  alternatives jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlist_items enable row level security;

create policy "Users can view own wishlist items"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own wishlist items"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own wishlist items"
  on public.wishlist_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own wishlist items"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);

create trigger update_wishlist_items_updated_at
  before update on public.wishlist_items
  for each row execute function public.update_updated_at_column();

create index idx_wishlist_items_user on public.wishlist_items(user_id, position, created_at desc);