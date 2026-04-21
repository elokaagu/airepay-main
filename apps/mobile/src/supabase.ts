import { createClient } from "@supabase/supabase-js";

function trimEnv(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

const supabaseUrl = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabasePublishableKey = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabasePublishableKey!)
  : null;
