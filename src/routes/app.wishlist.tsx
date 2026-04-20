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
import { listGoals, createGoal, type Goal } from "@/lib/goals-api";

export const Route = createFileRoute("/app/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [thinkingId, setThinkingId] = useState<string | null>(null);

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
    // Kick off verdict
    setThinkingId(item.id);
    try {
      const v = await requestVerdict(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...v } : i)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setThinkingId(null);
    }
  };

  const handleRecompute = async (id: string) => {
    setThinkingId(id);
    try {
      const v = await requestVerdict(id);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...v } : i)));
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
    await refresh();
  };

  const handleDefer = async (item: WishlistItem) => {
    await updateWishlistItem(item.id, { status: "deferred" });
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: "deferred" } : i)),
    );
  };

  const handleRemove = async (item: WishlistItem) => {
    await deleteWishlistItem(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const total = items
    .filter((i) => i.status === "considering" || i.status === "planning")
    .reduce((s, i) => s + Number(i.price), 0);

  return (
    <div className="px-10 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
            Wishlist
          </div>
          <h1 className="mt-3 font-display text-[32px] font-medium tracking-tight">
            Things you're thinking about.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
            See the trade-off before you spend. Aire shows what each purchase
            does to your goals — so you can buy on purpose, not on impulse.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground"
        >
          + Add item
        </button>
      </div>

      <div className="mt-6 flex gap-6 border-y border-border py-4 text-[13px]">
        <Stat label="Items" value={items.length.toString()} />
        <Stat
          label="Total considered"
          value={`$${total.toLocaleString()}`}
        />
        <Stat
          label="Deferred"
          value={items.filter((i) => i.status === "deferred").length.toString()}
        />
      </div>

      {loading ? (
        <div className="mt-10 text-[13px] text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState onAdd={() => setCreating(true)} />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              thinking={thinkingId === item.id}
              onPlan={() => handlePlanFor(item)}
              onDefer={() => handleDefer(item)}
              onRemove={() => handleRemove(item)}
              onRecompute={() => handleRecompute(item.id)}
            />
          ))}
        </div>
      )}

      {creating && (
        <CreateModal onClose={() => setCreating(false)} onSave={handleAdd} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-[20px] tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-orange/10 text-orange flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mt-5 font-display text-[20px]">Nothing on the list yet</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] text-muted-foreground">
        Add the next thing you're tempted to buy. Aire will tell you what it
        does to your plan before you commit.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground"
      >
        Add your first item
      </button>
    </div>
  );
}

function verdictStyles(v: WishlistItem["verdict"]) {
  switch (v) {
    case "go":
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-600 dark:text-emerald-400",
        label: "Go for it",
      };
    case "caution":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-600 dark:text-amber-400",
        label: "Pause",
      };
    case "defer":
      return {
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-600 dark:text-rose-400",
        label: "Defer",
      };
    default:
      return {
        bg: "bg-muted",
        border: "border-border",
        text: "text-muted-foreground",
        label: "Thinking…",
      };
  }
}

function WishlistCard({
  item,
  thinking,
  onPlan,
  onDefer,
  onRemove,
  onRecompute,
}: {
  item: WishlistItem;
  thinking: boolean;
  onPlan: () => void;
  onDefer: () => void;
  onRemove: () => void;
  onRecompute: () => void;
}) {
  const v = verdictStyles(item.verdict);
  const isDone = item.status === "deferred" || item.status === "purchased";

  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-7 ${isDone ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {item.brand && (
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {item.brand}
            </div>
          )}
          <h3 className="mt-1.5 font-display text-[24px] leading-tight tracking-tight">
            {item.name}
          </h3>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              View source ↗
            </a>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-[28px] tabular-nums">
            ${Number(item.price).toLocaleString()}
          </div>
          {item.status === "deferred" && (
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Deferred
            </div>
          )}
        </div>
      </div>

      {/* Verdict */}
      <div
        className={`mt-5 rounded-xl border ${v.border} ${v.bg} p-4`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${v.text}`}
          >
            {thinking ? "Thinking…" : v.label}
          </span>
        </div>
        <p className="mt-1.5 text-[14px] leading-snug">
          {thinking
            ? "Aire is checking the impact on your goals…"
            : (item.verdict_text ??
              "Add a goal so Aire can model the trade-off.")}
        </p>
      </div>

      {/* Alternatives */}
      {item.alternatives.length > 0 && !thinking && (
        <div className="mt-5 space-y-2">
          {item.alternatives.map((alt, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-[13px]">{alt.label}</div>
                {alt.detail && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {alt.detail}
                  </div>
                )}
              </div>
              <div
                className={`shrink-0 text-[13px] tabular-nums ${
                  alt.days_delta > 14
                    ? "text-rose-500"
                    : alt.days_delta > 0
                      ? "text-amber-500"
                      : "text-emerald-600"
                }`}
              >
                {alt.days_delta > 0 ? "+" : ""}
                {alt.days_delta}d
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        {!isDone && (
          <>
            <button
              onClick={onPlan}
              className="flex-1 rounded-md bg-foreground px-4 py-2.5 text-[13px] font-medium text-background"
            >
              Plan for it
            </button>
            <button
              onClick={onDefer}
              className="rounded-md border border-border px-4 py-2.5 text-[13px]"
            >
              Defer
            </button>
          </>
        )}
        <button
          onClick={onRecompute}
          disabled={thinking}
          className="rounded-md border border-border px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Recompute"
        >
          ↻
        </button>
        <button
          onClick={onRemove}
          className="rounded-md border border-border px-3 py-2.5 text-[13px] text-muted-foreground hover:text-rose-500"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function CreateModal({
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-[22px] tracking-tight">
          Add to wishlist
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Aire will check the impact and suggest alternatives.
        </p>

        <div className="mt-5 space-y-3">
          <Field
            label="What is it?"
            value={name}
            onChange={setName}
            placeholder="Cloud Sectional Sofa"
          />
          <Field
            label="Brand (optional)"
            value={brand}
            onChange={setBrand}
            placeholder="Restoration Hardware"
          />
          <Field
            label="Price"
            value={price}
            onChange={setPrice}
            placeholder="4800"
            type="number"
          />
          <Field
            label="Link (optional)"
            value={url}
            onChange={setUrl}
            placeholder="https://…"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2.5 text-[13px]"
          >
            Cancel
          </button>
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
            className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
          >
            Add & analyse
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-orange"
      />
    </label>
  );
}
