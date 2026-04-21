import { supabase } from "../supabase";
import type { Bond, BondInvite, BondSharedGoal, Goal } from "../types";

export async function getActiveBond(): Promise<Bond | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("bonds").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const bonds = (data ?? []) as Bond[];
  return bonds.find((b) => b.status === "active") ?? bonds.find((b) => b.status === "pending") ?? null;
}

export async function createBondInvite(inviterId: string, partnerEmail: string, partnerLabel?: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data: bond, error: bondErr } = await supabase
    .from("bonds")
    .insert({
      inviter_id: inviterId,
      partner_email: partnerEmail.trim().toLowerCase(),
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
      invitee_email: partnerEmail.trim().toLowerCase(),
    })
    .select()
    .single();
  if (inviteErr) throw inviteErr;
  return { bond: bond as Bond, invite: invite as BondInvite };
}

export async function listInviteForBond(bondId: string): Promise<BondInvite | null> {
  if (!supabase) return null;
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

export async function acceptInviteByToken(token: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.rpc("accept_bond_invite", { p_token: token });
  if (error) throw error;
}

export async function endBond(bondId: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("bonds")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", bondId);
  if (error) throw error;
}

export async function listSharedGoals(bondId: string): Promise<BondSharedGoal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("bond_shared_goals").select("*").eq("bond_id", bondId);
  if (error) throw error;
  return (data ?? []) as BondSharedGoal[];
}

export async function shareGoal(bondId: string, goalId: string, userId: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("bond_shared_goals").insert({ bond_id: bondId, goal_id: goalId, shared_by: userId });
  if (error) throw error;
}

export async function unshareGoal(bondId: string, goalId: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("bond_shared_goals").delete().eq("bond_id", bondId).eq("goal_id", goalId);
  if (error) throw error;
}

export async function listBondGoals(bondId: string): Promise<Goal[]> {
  if (!supabase) return [];
  const shared = await listSharedGoals(bondId);
  if (shared.length === 0) return [];
  const ids = shared.map((s) => s.goal_id);
  const { data, error } = await supabase.from("goals").select("*").in("id", ids);
  if (error) throw error;
  return (data ?? []) as Goal[];
}
