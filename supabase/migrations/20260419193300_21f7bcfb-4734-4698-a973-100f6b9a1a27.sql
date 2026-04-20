-- gen_random_bytes() requires pgcrypto (not enabled by default on new projects)
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Enum for bond status
create type public.bond_status as enum ('pending', 'active', 'ended');
create type public.bond_invite_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'expired');

-- Bonds: a relationship between two users
create table public.bonds (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null,
  partner_id uuid,
  partner_email text not null,
  partner_label text,
  status public.bond_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz
);

-- Invites with tokens
create table public.bond_invites (
  id uuid primary key default gen_random_uuid(),
  bond_id uuid not null references public.bonds(id) on delete cascade,
  inviter_id uuid not null,
  invitee_email text not null,
  token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  status public.bond_invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- Shared goals within a bond
create table public.bond_shared_goals (
  id uuid primary key default gen_random_uuid(),
  bond_id uuid not null references public.bonds(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  shared_by uuid not null,
  created_at timestamptz not null default now(),
  unique (bond_id, goal_id)
);

-- Indexes
create index idx_bonds_inviter on public.bonds(inviter_id);
create index idx_bonds_partner on public.bonds(partner_id);
create index idx_bonds_partner_email on public.bonds(partner_email);
create index idx_bond_invites_bond on public.bond_invites(bond_id);
create index idx_bond_invites_email on public.bond_invites(invitee_email);
create index idx_bond_shared_goals_bond on public.bond_shared_goals(bond_id);
create index idx_bond_shared_goals_goal on public.bond_shared_goals(goal_id);

-- Enable RLS
alter table public.bonds enable row level security;
alter table public.bond_invites enable row level security;
alter table public.bond_shared_goals enable row level security;

-- BOND POLICIES
create policy "Bond members can view bond"
on public.bonds for select
using (auth.uid() = inviter_id or auth.uid() = partner_id);

create policy "Users can view bonds invited to their email"
on public.bonds for select
using (status = 'pending' and partner_email = (select email from auth.users where id = auth.uid()));

create policy "Inviter can create bonds"
on public.bonds for insert
with check (auth.uid() = inviter_id);

create policy "Bond members can update bond"
on public.bonds for update
using (auth.uid() = inviter_id or auth.uid() = partner_id);

create policy "Bond members can delete bond"
on public.bonds for delete
using (auth.uid() = inviter_id or auth.uid() = partner_id);

-- BOND INVITE POLICIES
create policy "Inviter can view own invites"
on public.bond_invites for select
using (auth.uid() = inviter_id);

create policy "Invitee can view invites to their email"
on public.bond_invites for select
using (invitee_email = (select email from auth.users where id = auth.uid()));

create policy "Inviter can create invites"
on public.bond_invites for insert
with check (auth.uid() = inviter_id);

create policy "Inviter can cancel invites"
on public.bond_invites for update
using (auth.uid() = inviter_id);

create policy "Invitee can accept/decline invites"
on public.bond_invites for update
using (invitee_email = (select email from auth.users where id = auth.uid()));

-- BOND SHARED GOALS POLICIES
create policy "Bond members can view shared goals"
on public.bond_shared_goals for select
using (
  exists (
    select 1 from public.bonds b
    where b.id = bond_shared_goals.bond_id
      and b.status = 'active'
      and (b.inviter_id = auth.uid() or b.partner_id = auth.uid())
  )
);

create policy "Goal owner can share goal in own bond"
on public.bond_shared_goals for insert
with check (
  auth.uid() = shared_by
  and exists (
    select 1 from public.bonds b
    where b.id = bond_shared_goals.bond_id
      and b.status = 'active'
      and (b.inviter_id = auth.uid() or b.partner_id = auth.uid())
  )
  and exists (
    select 1 from public.goals g
    where g.id = bond_shared_goals.goal_id
      and g.user_id = auth.uid()
  )
);

create policy "Goal owner can unshare goal"
on public.bond_shared_goals for delete
using (auth.uid() = shared_by);

-- Cross-bond goal visibility: partners can view each other's shared goals
create policy "Bond partners can view each others shared goals"
on public.goals for select
using (
  exists (
    select 1
    from public.bond_shared_goals sg
    join public.bonds b on b.id = sg.bond_id
    where sg.goal_id = goals.id
      and b.status = 'active'
      and (
        (b.inviter_id = auth.uid() and b.partner_id = goals.user_id)
        or (b.partner_id = auth.uid() and b.inviter_id = goals.user_id)
      )
  )
);

-- Trigger for updated_at on bonds
create trigger update_bonds_updated_at
before update on public.bonds
for each row
execute function public.update_updated_at_column();

-- Function: accept invite (atomic) — links partner_id and activates bond
create or replace function public.accept_bond_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_user_email text;
begin
  select email into v_user_email from auth.users where id = auth.uid();
  if v_user_email is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invite from public.bond_invites
  where token = p_token and status = 'pending' and expires_at > now();

  if not found then
    raise exception 'Invite not found or expired';
  end if;

  if lower(v_invite.invitee_email) <> lower(v_user_email) then
    raise exception 'Invite is for a different email';
  end if;

  update public.bond_invites
  set status = 'accepted', accepted_at = now()
  where id = v_invite.id;

  update public.bonds
  set partner_id = auth.uid(), status = 'active', updated_at = now()
  where id = v_invite.bond_id;

  return v_invite.bond_id;
end;
$$;
