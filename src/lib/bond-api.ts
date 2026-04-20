import { supabase } from "@/integrations/supabase/client";
import type { Goal } from "./goals-api";

export type BondStatus = "pending" | "active" | "ended";

export type Bond = {
  id: string;
  inviter_id: string;
  partner_id: string | null;
  partner_email: string;
  partner_label: string | null;
  status: BondStatus;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
};

export type BondInvite = {
  id: string;
  bond_id: string;
  inviter_id: string;
  invitee_email: string;
  token: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
};

export type BondSharedGoal = {
  id: string;
  bond_id: string;
  goal_id: string;
  shared_by: string;
  created_at: string;
};

export async function listMyBonds(): Promise<Bond[]> {
  const { data, error } = await supabase
    .from("bonds")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Bond[];
}

export async function getActiveBond(): Promise<Bond | null> {
  const bonds = await listMyBonds();
  return bonds.find((b) => b.status === "active") ?? bonds.find((b) => b.status === "pending") ?? null;
}

export async function createBondInvite(
  inviterId: string,
  partnerEmail: string,
  partnerLabel?: string,
): Promise<{ bond: Bond; invite: BondInvite }> {
  const email = partnerEmail.trim().toLowerCase();
  const { data: bond, error: bondErr } = await supabase
    .from("bonds")
    .insert({
      inviter_id: inviterId,
      partner_email: email,
      partner_label: partnerLabel ?? null,
      status: "pending",
    })
    .select()
    .single();
  if (bondErr) throw bondErr;

  const { data: invite, error: inviteErr } = await supabase
    .from("bond_invites")
    .insert({
      bond_id: bond.id,
      inviter_id: inviterId,
      invitee_email: email,
    })
    .select()
    .single();
  if (inviteErr) throw inviteErr;

  return { bond: bond as Bond, invite: invite as BondInvite };
}

export async function listInviteForBond(bondId: string): Promise<BondInvite | null> {
  const { data, error } = await supabase
    .from("bond_invites")
    .select("*")
    .eq("bond_id", bondId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as BondInvite | null;
}

export async function acceptInviteByToken(token: string): Promise<string> {
  const { data, error } = await supabase.rpc("accept_bond_invite", {
    p_token: token,
  });
  if (error) throw error;
  return data as string;
}

export async function endBond(bondId: string) {
  const { error } = await supabase
    .from("bonds")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", bondId);
  if (error) throw error;
}

export async function listSharedGoals(bondId: string): Promise<BondSharedGoal[]> {
  const { data, error } = await supabase
    .from("bond_shared_goals")
    .select("*")
    .eq("bond_id", bondId);
  if (error) throw error;
  return (data ?? []) as BondSharedGoal[];
}

export async function shareGoal(bondId: string, goalId: string, sharedBy: string) {
  const { error } = await supabase.from("bond_shared_goals").insert({
    bond_id: bondId,
    goal_id: goalId,
    shared_by: sharedBy,
  });
  if (error) throw error;
}

export async function unshareGoal(bondId: string, goalId: string) {
  const { error } = await supabase
    .from("bond_shared_goals")
    .delete()
    .eq("bond_id", bondId)
    .eq("goal_id", goalId);
  if (error) throw error;
}

export async function listBondGoals(bondId: string): Promise<Goal[]> {
  const shared = await listSharedGoals(bondId);
  if (shared.length === 0) return [];
  const ids = shared.map((s) => s.goal_id);
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as Goal[];
}

// Pure math: combined savings — when two people contribute monthly to the same goal,
// the time-to-goal scales inversely with total monthly. Returns days saved vs solo.
export function combinedDaysSaved(
  target: number,
  current: number,
  myMonthly: number,
  partnerMonthly: number,
): { soloDays: number; bondedDays: number; daysSaved: number } {
  const remaining = Math.max(0, target - current);
  const solo = myMonthly > 0 ? Math.round((remaining / myMonthly) * 30) : 0;
  const bonded =
    myMonthly + partnerMonthly > 0
      ? Math.round((remaining / (myMonthly + partnerMonthly)) * 30)
      : solo;
  return { soloDays: solo, bondedDays: bonded, daysSaved: Math.max(0, solo - bonded) };
}
