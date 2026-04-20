-- Tie wishlist rows to auth users (was missing FK in original migration)
alter table public.wishlist_items
  drop constraint if exists wishlist_items_user_id_fkey;

alter table public.wishlist_items
  add constraint wishlist_items_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
