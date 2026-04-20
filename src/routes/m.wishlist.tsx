import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  createWishlistItem,
  deleteWishlistItem,
  listWishlist,
  requestVerdict,
  updateWishlistItem,
  type WishlistItem,
} from "@/lib/wishlist-api";
import { createGoal, listGoals, type Goal } from "@/lib/goals-api";

export const Route = createFileRoute("/m/wishlist")({
  component: MobileWishlist,
});

function MobileWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [thinkingId, setThinkingId] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<WishlistItem | null>(null);

  const refresh = async () => {
    const [w, g] = await Promise.all([listWishlist(), listGoals()]);
    setItems(w);
    setGoals(g);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleAdd = async (input: {
    name: string;
    brand: string;
    price: number;
    url: string;
  }) => {
    if (!user) return;
    const item = await createWishlistItem(user.id, input);
    setCreating(false);
    setItems((prev) => [item, ...prev]);
    setThinkingId(item.id);
    try {
      const v = await requestVerdict(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...v } : i)),
      );
    } finally {
      setThinkingId(null);
    }
  };

  const handlePlanFor = async (item: WishlistItem) => {
    if (!user) return;
    const monthly = Math.max(50, Math.ceil(item.price / 6));
    await createGoal(user.id, {
      label: item.name,
      tagline: item.brand ?? null,
      priority: "P2",
      target: item.price,
      current_amount: 0,
      monthly,
      is_north_star: false,
      position: goals.length,
    });
    await updateWishlistItem(item.id, { status: "planning" });
    setOpenItem(null);
    await refresh();
  };

  const handleDefer = async (item: WishlistItem) => {
    await updateWishlistItem(item.id, { status: "deferred" });
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: "deferred" } : i)),
    );
    setOpenItem(null);
  };

  const handleRemove = async (item: WishlistItem) => {
    await deleteWishlistItem(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setOpenItem(null);
  };

  const total = items
    .filter((i) => i.status === "considering" || i.status === "planning")
    .reduce((s, i) => s + Number(i.price), 0);

  return (
    <div className="px-4 pb-6 text-white">
      {/* Hero */}
      <section className="pb-5 pt-6 text-center">
        <div className="text-[13px] font-medium text-white/70">
          On your wishlist
        </div>
        <div className="mt-2 flex items-end justify-center">
          <span
            className="font-display text-[60px] font-extrabold leading-none tracking-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            ${Math.floor(total).toLocaleString()}
          </span>
        </div>
        <div className="mt-2 text-[12px] text-white/45">
          {items.length} item{items.length === 1 ? "" : "s"} considered
        </div>
      </section>

      {/* Add button */}
      <button
        onClick={() => setCreating(true)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[15px] font-semibold text-black"
      >
        <span className="text-[18px] leading-none">+</span> Add to wishlist
      </button>

      {loading ? (
        <div className="py-10 text-center text-[13px] text-white/50">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
          <div className="text-[14px] font-medium">Nothing here yet</div>
          <p className="mt-2 text-[12px] text-white/50">
            Add what you're tempted to buy — Aire will model the impact before
            you do.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setOpenItem(item)}
              className="block w-full rounded-2xl bg-white/[0.06] p-5 text-left transition-colors active:bg-white/[0.09]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {item.brand && (
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      {item.brand}
                    </div>
                  )}
                  <div className="mt-1 truncate font-display text-[18px] leading-tight">
                    {item.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[18px] tabular-nums">
                    ${Number(item.price).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <VerdictPill
                  verdict={item.verdict}
                  thinking={thinkingId === item.id}
                />
                {item.status === "deferred" && (
                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/55">
                    Deferred
                  </span>
                )}
                {item.status === "planning" && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Saving
                  </span>
                )}
              </div>

              {item.verdict_text && thinkingId !== item.id && (
                <p className="mt-3 text-[13px] leading-snug text-white/70">
                  {item.verdict_text}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {creating && (
        <CreateSheet onClose={() => setCreating(false)} onSave={handleAdd} />
      )}

      {openItem && (
        <DetailSheet
          item={openItem}
          thinking={thinkingId === openItem.id}
          onClose={() => setOpenItem(null)}
          onPlan={() => handlePlanFor(openItem)}
          onDefer={() => handleDefer(openItem)}
          onRemove={() => handleRemove(openItem)}
        />
      )}
    </div>
  );
}

function VerdictPill({
  verdict,
  thinking,
}: {
  verdict: WishlistItem["verdict"];
  thinking: boolean;
}) {
  if (thinking) {
    return (
      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
        Thinking…
      </span>
    );
  }
  const map: Record<
    WishlistItem["verdict"],
    { label: string; cls: string }
  > = {
    go: {
      label: "Go for it",
      cls: "bg-emerald-500/15 text-emerald-300",
    },
    caution: {
      label: "Pause",
      cls: "bg-amber-500/15 text-amber-300",
    },
    defer: {
      label: "Defer",
      cls: "bg-rose-500/15 text-rose-300",
    },
    pending: {
      label: "Pending",
      cls: "bg-white/10 text-white/60",
    },
  };
  const v = map[verdict];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function CreateSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (input: {
    name: string;
    brand: string;
    price: number;
    url: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("");
  const valid = name.trim().length > 0 && Number(price) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-[24px] bg-[#111] p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <h2 className="font-display text-[22px]">Add to wishlist</h2>
        <p className="mt-1 text-[13px] text-white/55">
          Aire will model the impact on your goals.
        </p>
        <div className="mt-5 space-y-3">
          <MField label="What is it?" value={name} onChange={setName} />
          <MField label="Brand" value={brand} onChange={setBrand} />
          <MField
            label="Price"
            value={price}
            onChange={setPrice}
            type="number"
          />
          <MField label="Link (optional)" value={url} onChange={setUrl} />
        </div>
        <button
          disabled={!valid}
          onClick={() =>
            onSave({
              name: name.trim(),
              brand: brand.trim(),
              price: Number(price),
              url: url.trim(),
            })
          }
          className="mt-5 w-full rounded-2xl bg-white py-4 text-[15px] font-semibold text-black disabled:opacity-50"
        >
          Add & analyse
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl py-3 text-[14px] text-white/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DetailSheet({
  item,
  thinking,
  onClose,
  onPlan,
  onDefer,
  onRemove,
}: {
  item: WishlistItem;
  thinking: boolean;
  onClose: () => void;
  onPlan: () => void;
  onDefer: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-[24px] bg-[#111] p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        {item.brand && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            {item.brand}
          </div>
        )}
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[24px] leading-tight">
            {item.name}
          </h2>
          <div className="font-display text-[24px] tabular-nums">
            ${Number(item.price).toLocaleString()}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/[0.06] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
            {thinking
              ? "Thinking…"
              : item.verdict === "defer"
                ? "Aire suggests deferring"
                : item.verdict === "caution"
                  ? "Worth a beat"
                  : "Go for it"}
          </div>
          <p className="mt-1.5 text-[14px] leading-snug">
            {thinking
              ? "Aire is checking the impact on your goals…"
              : (item.verdict_text ?? "Set a goal so Aire can model this.")}
          </p>
        </div>

        {item.alternatives.length > 0 && !thinking && (
          <div className="mt-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-white/45">
              Other ways
            </div>
            {item.alternatives.map((alt, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="text-[13px]">{alt.label}</div>
                  {alt.detail && (
                    <div className="mt-0.5 text-[11px] text-white/45">
                      {alt.detail}
                    </div>
                  )}
                </div>
                <div
                  className={`shrink-0 text-[13px] tabular-nums ${
                    alt.days_delta > 14
                      ? "text-rose-400"
                      : alt.days_delta > 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {alt.days_delta > 0 ? "+" : ""}
                  {alt.days_delta}d
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onDefer}
            className="rounded-2xl border border-white/15 py-3.5 text-[14px] text-white/85"
          >
            Defer
          </button>
          <button
            onClick={onPlan}
            className="rounded-2xl bg-white py-3.5 text-[14px] font-semibold text-black"
          >
            Plan for it
          </button>
        </div>
        <button
          onClick={onRemove}
          className="mt-2 w-full rounded-2xl py-3 text-[13px] text-rose-400"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function MField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-white/45">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none focus:border-white/30"
      />
    </label>
  );
}
