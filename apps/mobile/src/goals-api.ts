import { supabase } from "./supabase";
import type { Goal } from "./simulator";

export async function listGoals(): Promise<Goal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("goals")
    .select("id,label,monthly,priority,is_north_star")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((goal) => ({
    id: String(goal.id),
    label: String(goal.label),
    monthly: Number(goal.monthly ?? 0),
    priority: (goal.priority as Goal["priority"]) ?? "P0",
    isNorthStar: Boolean(goal.is_north_star),
  }));
}

export async function logRipple(
  userId: string,
  input: {
    goalId?: string | null;
    action: string;
    amount?: number;
    daysDelta?: number;
    tag?: string;
  },
) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("ripples").insert({
    user_id: userId,
    goal_id: input.goalId ?? null,
    action: input.action,
    amount: input.amount ?? 0,
    days_delta: input.daysDelta ?? 0,
    tag: input.tag ?? "SWAP",
  });
  if (error) throw error;
}
