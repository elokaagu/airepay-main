import { supabase } from "../supabase";
import type { TrustMode } from "../types";

export type ProfileSettings = {
  display_name: string;
  saturn_cap_pct: number;
  trust_mode: TrustMode;
};

export async function getProfileSettings(userId: string): Promise<ProfileSettings> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name,saturn_cap_pct,trust_mode")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return {
    display_name: data?.display_name ?? "",
    saturn_cap_pct: typeof data?.saturn_cap_pct === "number" ? data.saturn_cap_pct : 20,
    trust_mode: (data?.trust_mode as TrustMode) ?? "pilot",
  };
}

export async function saveProfileSettings(userId: string, settings: ProfileSettings) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("profiles")
    .update(settings)
    .eq("id", userId);
  if (error) throw error;
}
