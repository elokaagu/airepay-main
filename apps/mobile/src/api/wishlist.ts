import { supabase } from "../supabase";
import type { WishlistItem } from "../types";

export async function listWishlist(): Promise<WishlistItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...(row as WishlistItem),
    alternatives: Array.isArray((row as WishlistItem).alternatives) ? (row as WishlistItem).alternatives : [],
  }));
}

export async function createWishlistItem(
  userId: string,
  input: { name: string; brand?: string | null; price: number; url?: string | null },
) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({
      user_id: userId,
      name: input.name,
      brand: input.brand ?? null,
      price: input.price,
      url: input.url ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function updateWishlistItem(id: string, patch: Partial<WishlistItem>) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("wishlist_items")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function deleteWishlistItem(id: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) throw error;
}

export async function requestVerdict(itemId: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.functions.invoke("wishlist-verdict", {
    body: { item_id: itemId },
  });
  if (error) throw error;
  return data as Partial<WishlistItem>;
}
