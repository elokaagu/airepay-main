import { supabase } from "../supabase";
import type { Goal, Ripple } from "../types";

export async function listGoals(): Promise<Goal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function listRipples(limit = 8): Promise<Ripple[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ripples")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Ripple[];
}

export async function createGoal(
  userId: string,
  input: Partial<Goal> & { label: string; priority: Goal["priority"] },
) {
  if (!supabase) throw new Error("Supabase not configured");
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
  if (!supabase) throw new Error("Supabase not configured");
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
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
