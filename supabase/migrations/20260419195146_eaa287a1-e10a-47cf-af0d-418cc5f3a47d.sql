-- Helper function to safely get current user's email (bypasses auth.users RLS issue)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

-- Drop and recreate bond_invites policies that reference auth.users
DROP POLICY IF EXISTS "Invitee can accept/decline invites" ON public.bond_invites;
DROP POLICY IF EXISTS "Invitee can view invites to their email" ON public.bond_invites;

CREATE POLICY "Invitee can view invites to their email"
ON public.bond_invites
FOR SELECT
USING (invitee_email = public.current_user_email());

CREATE POLICY "Invitee can accept/decline invites"
ON public.bond_invites
FOR UPDATE
USING (invitee_email = public.current_user_email());

-- Drop and recreate bonds policy that references auth.users
DROP POLICY IF EXISTS "Users can view bonds invited to their email" ON public.bonds;

CREATE POLICY "Users can view bonds invited to their email"
ON public.bonds
FOR SELECT
USING (status = 'pending'::bond_status AND partner_email = public.current_user_email());