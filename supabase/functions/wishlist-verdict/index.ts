// Wishlist AI verdict — calculates impact of a wishlist purchase on user's goals
// and returns a verdict + alternative ways to fund it.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function rippleDays(amount: number, monthly: number): number {
  if (!monthly || monthly <= 0) return 0;
  return Math.round((amount / monthly) * 30);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { item_id } = await req.json();
    if (!item_id) {
      return new Response(JSON.stringify({ error: "item_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load item + user's goals
    const { data: item, error: itemErr } = await admin
      .from("wishlist_items")
      .select("*")
      .eq("id", item_id)
      .eq("user_id", user.id)
      .single();
    if (itemErr || !item) throw itemErr ?? new Error("Item not found");

    const { data: goals } = await admin
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("is_north_star", { ascending: false })
      .order("position", { ascending: true });

    const northStar =
      goals?.find((g: any) => g.is_north_star) ??
      goals?.find((g: any) => g.priority === "P1") ??
      goals?.[0] ??
      null;

    // Compute impact deterministically
    const monthly = Number(northStar?.monthly ?? 0);
    const price = Number(item.price ?? 0);
    const impactDays = northStar ? rippleDays(price, monthly) : 0;
    const fundableMonths = monthly > 0 ? Math.max(0.1, price / monthly) : 0;

    // Build alternatives
    const alternatives = [
      {
        label: "Buy now, take from surplus",
        days_delta: impactDays,
        detail: northStar
          ? `Pushes ${northStar.label} back ${impactDays} days`
          : "Pushes your goal back",
      },
      {
        label: `Save $${Math.ceil(price / 6)}/mo for 6 months first`,
        days_delta: Math.round(impactDays * 0.15),
        detail: "Builds a side pocket without touching the main plan",
      },
      {
        label: "Buy pre-loved (~60% of price)",
        days_delta: Math.round(impactDays * 0.6),
        detail: `Same item, ~$${Math.round(price * 0.6).toLocaleString()}`,
      },
      {
        label: "Wait until next paycheck surplus",
        days_delta: 0,
        detail: "Zero impact on any goal",
      },
    ];

    // Decide verdict from impact
    let verdict: "go" | "caution" | "defer" = "go";
    if (impactDays > 60) verdict = "defer";
    else if (impactDays > 14) verdict = "caution";

    // Optional AI-written copy
    let verdictText = "";
    if (LOVABLE_API_KEY) {
      try {
        const prompt = `You are Aire, a calm, plain-spoken money copilot. A user is considering buying:

Item: ${item.brand ? item.brand + " — " : ""}${item.name}
Price: $${price}

Their main goal is "${northStar?.label ?? "no goal set"}" funded at $${monthly}/mo. Buying this would push that goal back ${impactDays} days. The verdict is "${verdict}".

Write ONE sentence (max 22 words), warm but honest, that explains the trade-off in human terms. No emojis, no markdown, no quotes. Mention the goal name and the days.`;

        const aiResp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "user", content: prompt }],
            }),
          },
        );
        if (aiResp.ok) {
          const aiData = await aiResp.json();
          verdictText = aiData?.choices?.[0]?.message?.content?.trim() ?? "";
        } else if (aiResp.status === 429 || aiResp.status === 402) {
          // soft-fail, fall through to deterministic copy
        }
      } catch (e) {
        console.error("AI verdict fail:", e);
      }
    }

    if (!verdictText) {
      verdictText = northStar
        ? verdict === "defer"
          ? `Buying now pushes ${northStar.label} back ${impactDays} days — Aire suggests deferring.`
          : verdict === "caution"
            ? `This nudges ${northStar.label} back ${impactDays} days. Worth a beat.`
            : `Fundable in ${fundableMonths.toFixed(1)} months from surplus without touching ${northStar.label}.`
        : `Set a goal first so Aire can model the trade-off.`;
    }

    // Persist verdict on the item
    await admin
      .from("wishlist_items")
      .update({
        verdict,
        verdict_text: verdictText,
        impact_days: impactDays,
        impact_goal_id: northStar?.id ?? null,
        fundable_months: fundableMonths,
        alternatives,
      })
      .eq("id", item_id);

    return new Response(
      JSON.stringify({
        verdict,
        verdict_text: verdictText,
        impact_days: impactDays,
        impact_goal_id: northStar?.id ?? null,
        fundable_months: fundableMonths,
        alternatives,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("wishlist-verdict error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
