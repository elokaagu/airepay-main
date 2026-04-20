import { supabase } from "@/integrations/supabase/client";

export type WishlistStatus =
  | "considering"
  | "planning"
  | "deferred"
  | "purchased"
  | "dismissed";

export type WishlistVerdict = "go" | "caution" | "defer" | "pending";

export type WishlistAlternative = {
  label: string;
  days_delta: number; // negative = better, positive = worse
  detail?: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  brand: string | null;
  name: string;
  price: number;
  url: string | null;
  image_url: string | null;
  notes: string | null;
  status: WishlistStatus;
  verdict: WishlistVerdict;
  verdict_text: string | null;
  impact_days: number | null;
  impact_goal_id: string | null;
  fundable_months: number | null;
  alternatives: WishlistAlternative[];
  position: number;
  created_at: string;
  updated_at: string;
};

export async function listWishlist(): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d: any) => ({
    ...d,
    alternatives: Array.isArray(d.alternatives) ? d.alternatives : [],
  })) as WishlistItem[];
}

export async function createWishlistItem(
  userId: string,
  input: {
    name: string;
    brand?: string | null;
    price: number;
    url?: string | null;
    image_url?: string | null;
    notes?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({
      user_id: userId,
      name: input.name,
      brand: input.brand ?? null,
      price: input.price,
      url: input.url ?? null,
      image_url: input.image_url ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function updateWishlistItem(
  id: string,
  patch: Partial<WishlistItem>,
) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .update(patch as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function deleteWishlistItem(id: string) {
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) throw error;
}

export type WishlistVerdictResult = {
  verdict: WishlistVerdict;
  verdict_text: string;
  impact_days: number;
  impact_goal_id: string | null;
  fundable_months: number;
  alternatives: WishlistAlternative[];
};

export async function requestVerdict(itemId: string): Promise<WishlistVerdictResult> {
  const { data, error } = await supabase.functions.invoke("wishlist-verdict", {
    body: { item_id: itemId },
  });
  if (error) throw error;
  return data as WishlistVerdictResult;
}
