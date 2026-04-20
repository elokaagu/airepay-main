import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  listGoals,
  listRipples,
  logRipple,
  rippleDays,
  updateGoal,
  type Goal,
  type Ripple,
} from "@/lib/goals-api";
import { useAuth } from "@/lib/auth-context";
import { GoalGrowthChart } from "@/components/plomo/GoalGrowthChart";

export const Route = createFileRoute("/m/")({
  component: MobileHome,
});

function MobileHome() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  const refresh = async () => {
    const [g, r] = await Promise.all([listGoals(), listRipples(8)]);
    setGoals(g);
    setRipples(r);
  };

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const northStar =
    goals.find((g) => g.is_north_star) ??
    goals.find((g) => g.priority === "P1") ??
    goals[0];

  const lifestyleGoal = useMemo(
    () => goals.find((g) => g.priority === "P2"),
    [goals],
  );

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  if (loading) {
    return (
      <div className="px-5 py-10 text-[13px] text-white/60">Loading…</div>
    );
  }

  if (!northStar) {
    return (
      <div className="px-5 py-10">
        <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-[14px] text-white/60">
            No goals yet. Add your first one to get started.
          </p>
          <Link
            to="/m/goals"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black"
          >
            Add a goal
          </Link>
        </div>
      </div>
    );
  }

  const saved = Number(northStar.current_amount);
  const target = Number(northStar.target);
  const dollars = Math.floor(saved).toLocaleString();
  const cents = (saved % 1).toFixed(2).slice(2); // "00"

  return (
    <div className="px-4 pb-6">
      {/* Hero — centered balance like Revolut */}
      <section className="pt-8 pb-6">
        <div className="flex items-center justify-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px]">
            🎯
          </span>
          <span className="text-[14px] font-medium text-white/90">
            {northStar.label} · USD
          </span>
        </div>
        <div className="mt-2 flex items-end justify-center">
          <span
            className="font-display text-[80px] font-extrabold leading-none tracking-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            ${dollars}
          </span>
          <span className="mb-3 ml-0.5 text-[22px] font-semibold text-white/80">
            .{cents}
          </span>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            to="/m/goals"
            className="rounded-full bg-white/10 px-5 py-2 text-[13px] font-semibold text-white"
          >
            Goals
          </Link>
        </div>
        {target > 0 && (
          <div className="mt-3 text-center text-[12px] text-white/45 tabular-nums">
            of ${target.toLocaleString()} ·{" "}
            {Math.min(100, Math.round((saved / target) * 100))}% there
          </div>
        )}
      </section>

      {/* Pagination dots — purely decorative, hints at swipeable accounts */}
      <div className="mb-6 flex justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>

      {/* Action row — circular grey buttons */}
      <section className="grid grid-cols-4 gap-2">
        <ActionButton
          label="Add"
          onClick={() => {}}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <ActionButton
          label="Compare"
          onClick={() => setWhatIfOpen(true)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M5 8h11l-3-3M19 16H8l3 3"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <ActionLink
          to="/m/goals"
          label="Goals"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M5 21V8l7-4 7 4v13M9 21v-6h6v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <ActionLink
          to="/m/yield"
          label="More"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <circle cx="6" cy="12" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="18" cy="12" r="1.6" fill="currentColor" />
            </svg>
          }
        />
      </section>

      {/* Promo card — Earn more callout (like Wealth Protection card) */}
      <section className="mt-6 rounded-2xl bg-white/[0.06] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M12 3v18M7 7h7a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold leading-tight tracking-tight">
              Put idle savings to work
            </h3>
            <p className="mt-1.5 text-[13px] leading-snug text-white/60">
              Earn up to 9% a year on dollars you're not using. You stay in
              control — Aire never moves money for you.
            </p>
          </div>
        </div>
        <Link
          to="/m/yield"
          className="mt-4 block w-full rounded-full bg-white py-3.5 text-center text-[14px] font-semibold text-black"
        >
          Show me how
        </Link>
      </section>

      {/* Growth chart card */}
      <section className="mt-3">
        <GoalGrowthChart goal={northStar} ripples={ripples} />
      </section>

      {/* Recent activity — Revolut transaction-row style */}
      <section className="mt-6 rounded-2xl bg-white/[0.06]">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-white/50">
            Recent activity
          </h3>
          <span className="text-[11px] text-white/40 tabular-nums">
            ${totalSaved.toLocaleString()} saved
          </span>
        </div>
        <ul>
          {ripples.length === 0 ? (
            <li className="px-5 py-5 text-[13px] text-white/55">
              Nothing yet. Tap Compare above to see how a spend or swap shifts
              your timeline.
            </li>
          ) : (
            ripples.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 border-t border-white/5 px-5 py-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <ActivityIcon tag={r.tag} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold leading-tight">
                    {r.action}
                  </div>
                  <div className="mt-1 text-[11px] text-white/45">
                    {formatTime(r.created_at)} · {r.tag}
                  </div>
                </div>
                <span
                  className={[
                    "text-[14px] font-semibold tabular-nums",
                    r.days_delta < 0 ? "text-[#22c55e]" : "text-white/80",
                  ].join(" ")}
                >
                  {r.days_delta > 0 ? "+" : ""}
                  {r.days_delta}d
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      {whatIfOpen && user && (
        <WhatIfSheet
          northStar={northStar}
          lifestyle={lifestyleGoal}
          userId={user.id}
          onClose={() => setWhatIfOpen(false)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 active:scale-95"
    >
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white/10 text-white">
        {icon}
      </span>
      <span className="text-[12px] font-semibold tracking-tight">{label}</span>
    </button>
  );
}

function ActionLink({
  to,
  label,
  icon,
}: {
  to: "/m/goals" | "/m/yield" | "/m/simulator" | "/m/settings";
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 active:scale-95">
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white/10 text-white">
        {icon}
      </span>
      <span className="text-[12px] font-semibold tracking-tight">{label}</span>
    </Link>
  );
}

function ActivityIcon({ tag }: { tag: string }) {
  if (tag === "SWAP") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 8h11l-3-3M19 16H8l3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tag === "SPEND") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 5v14M5 12l7 7 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function WhatIfSheet({
  northStar,
  lifestyle,
  userId,
  onClose,
  onChanged,
}: {
  northStar: Goal;
  lifestyle: Goal | undefined;
  userId: string;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [spend, setSpend] = useState<number>(200);
  const [busy, setBusy] = useState(false);

  const monthly = Number(northStar.monthly) || 0;
  const dailyRate = monthly / 30;
  const daysImpact = rippleDays(spend, monthly);

  const lifestyleHas = Number(lifestyle?.current_amount ?? 0);
  const canPivot = !!lifestyle && lifestyleHas >= spend && spend > 0;

  const logSpend = async () => {
    if (spend <= 0) return;
    setBusy(true);
    await logRipple(userId, {
      goal_id: northStar.id,
      action: `Spent $${spend} — ${northStar.label} pushed back ${daysImpact}d`,
      amount: spend,
      days_delta: daysImpact,
      tag: "SPEND",
    });
    setBusy(false);
    await onChanged();
    onClose();
  };

  const pivot = async () => {
    if (!lifestyle || !canPivot) return;
    setBusy(true);
    await Promise.all([
      updateGoal(lifestyle.id, { current_amount: lifestyleHas - spend }),
      updateGoal(northStar.id, {
        current_amount: Number(northStar.current_amount) + spend,
      }),
      logRipple(userId, {
        goal_id: northStar.id,
        action: `Moved $${spend} from ${lifestyle.label} into ${northStar.label}. Stayed on track.`,
        amount: spend,
        days_delta: -daysImpact,
        tag: "SWAP",
      }),
    ]);
    setBusy(false);
    await onChanged();
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-[#111] text-white shadow-2xl animate-in slide-in-from-bottom duration-300"
        role="dialog"
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-white/15" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Compare
            </div>
            <h2 className="mt-1 text-[20px] font-semibold tracking-tight">
              What does a spend cost?
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-[11px] uppercase tracking-wider text-white/45">
              Spend
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-[44px] font-bold tabular-nums">
                ${spend}
              </span>
              <span className="ml-2 text-[12px] text-white/45">
                this weekend
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={25}
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              className="mt-3 h-6 w-full accent-white"
            />
            <div className="mt-3 text-[12px] text-white/55 tabular-nums">
              You currently save ${dailyRate.toFixed(2)}/day toward{" "}
              {northStar.label}.
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/[0.06] p-5">
            <div className="text-[11px] uppercase tracking-wider text-white/45">
              What this means
            </div>
            {monthly > 0 ? (
              <p className="mt-2 text-[15px] leading-snug">
                Your <span className="font-semibold">{northStar.label}</span>{" "}
                date moves back by{" "}
                <span className="text-[22px] font-bold tabular-nums">
                  {daysImpact}
                </span>{" "}
                day{daysImpact === 1 ? "" : "s"}.
              </p>
            ) : (
              <p className="mt-2 text-[12px] text-white/55">
                Add a monthly amount to this goal to see how spends change your
                timeline.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={pivot}
            disabled={!canPivot || busy}
            className="mt-4 w-full rounded-full bg-white py-3.5 text-[14px] font-semibold text-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {lifestyle
              ? `Cover it from ${lifestyle.label}`
              : "Add a fun-money goal to swap from"}
          </button>
          <button
            type="button"
            onClick={logSpend}
            disabled={busy || spend <= 0}
            className="mt-2 w-full rounded-full border border-white/15 py-3.5 text-[14px] font-semibold active:scale-[0.98] disabled:opacity-40"
          >
            Spend it anyway
          </button>
        </div>
      </aside>
    </>
  );
}
