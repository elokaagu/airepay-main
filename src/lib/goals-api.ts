import { supabase } from "@/integrations/supabase/client";

export type GoalPriority = "P0" | "P1" | "P2" | "Engine";

export type Goal = {
  id: string;
  user_id: string;
  label: string;
  tagline: string | null;
  priority: GoalPriority;
  target: number;
  current_amount: number;
  monthly: number;
  days_to_goal: number | null;
  apr: number | null;
  is_north_star: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Ripple = {
  id: string;
  user_id: string;
  goal_id: string | null;
  action: string;
  amount: number;
  days_delta: number;
  tag: string;
  created_at: string;
};

export async function listGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function createGoal(
  userId: string,
  input: Partial<Goal> & { label: string; priority: GoalPriority },
) {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      label: input.label,
      tagline: input.tagline ?? null,
      priority: input.priority,
      target: input.target ?? 0,
      current_amount: input.current_amount ?? 0,
      monthly: input.monthly ?? 0,
      days_to_goal: input.days_to_goal ?? null,
      apr: input.apr ?? null,
      is_north_star: input.is_north_star ?? false,
      position: input.position ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Goal;
}

export async function updateGoal(id: string, patch: Partial<Goal>) {
  const { data, error } = await supabase
    .from("goals")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Goal;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

export async function listRipples(limit = 12): Promise<Ripple[]> {
  const { data, error } = await supabase
    .from("ripples")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Ripple[];
}

export async function logRipple(
  userId: string,
  input: {
    goal_id?: string | null;
    action: string;
    amount?: number;
    days_delta?: number;
    tag?: string;
  },
) {
  const { data, error } = await supabase
    .from("ripples")
    .insert({
      user_id: userId,
      goal_id: input.goal_id ?? null,
      action: input.action,
      amount: input.amount ?? 0,
      days_delta: input.days_delta ?? 0,
      tag: input.tag ?? "PIVOT",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Ripple;
}

// Pure math: how many days each $1 of surplus shaves off a monthly goal
export function rippleDays(amount: number, monthly: number): number {
  if (!monthly || monthly <= 0) return 0;
  return Math.round((amount / monthly) * 30);
}

export async function getProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function setOnboarded(value = true) {
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded: value })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}
