import { createClient } from "@supabase/supabase-js";

function trimEnv(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

const url = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_URL);
const key = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const hasSupabaseConfig = Boolean(url && key);
export const supabase = hasSupabaseConfig ? createClient(url!, key!) : null;
