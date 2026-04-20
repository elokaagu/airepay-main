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
import { supabase } from "@/integrations/supabase/client";
import { GoalGrowthChart } from "@/components/plomo/GoalGrowthChart";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      setDisplayName(data?.display_name ?? null);
    })();
  }, [user]);

  const northStar =
    goals.find((g) => g.is_north_star) ??
    goals.find((g) => g.priority === "P1") ??
    goals[0];

  const lifestyleGoal = useMemo(
    () => goals.find((g) => g.priority === "P2"),
    [goals],
  );

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  const firstName =
    (displayName?.trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="px-10 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
            Today
          </div>
          <h1 className="mt-3 font-display text-[36px] font-medium leading-tight tracking-tight">
            Hi {firstName} — here's how things are looking.
          </h1>
        </div>
        <Link
          to="/app/goals"
          className="rounded-md border border-border-strong px-4 py-2 text-[13px] hover:border-orange hover:text-orange"
        >
          + Add a goal
        </Link>
      </div>

      {/* Big goal */}
      {northStar ? (
        <section className="mt-12 rounded-2xl border border-border-strong bg-surface p-8">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-wider text-muted-foreground">
              Your big goal
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {northStar.days_to_goal ?? "—"} days to go
            </span>
          </div>
          <h2 className="mt-3 font-display text-[28px] font-medium tracking-tight">
            {northStar.label}
          </h2>
          <div className="mt-8 flex items-baseline justify-between">
            <span className="font-display text-[44px] font-medium tracking-tight tabular-nums">
              ${Number(northStar.current_amount).toLocaleString()}
            </span>
            <span className="text-muted-foreground tabular-nums">
              / ${Number(northStar.target).toLocaleString()}
            </span>
          </div>
          <ProgressBar
            pct={
              Number(northStar.target) > 0
                ? (Number(northStar.current_amount) / Number(northStar.target)) * 100
                : 0
            }
          />
        </section>
      ) : null}

      {/* Projected growth chart */}
      {northStar && <GoalGrowthChart goal={northStar} ripples={ripples} />}

      {!northStar && (
        <section className="mt-12 rounded-2xl border border-dashed border-border-strong p-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            No goals yet. Add your first one to get started.
          </p>
          <Link
            to="/app/goals"
            className="mt-6 inline-block rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            Add a goal
          </Link>
        </section>
      )}

      {/* Velocity + Goals + Ripples */}
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="font-display text-[20px] font-medium tracking-tight">
            Goals
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {loading ? (
              <div className="bg-background p-6 text-[13px] text-muted-foreground">
                Loading…
              </div>
            ) : (
              goals.map((g) => <GoalCard key={g.id} g={g} />)
            )}
          </div>
          <div className="mt-6 text-[12px] text-muted-foreground">
            Total saved across goals:{" "}
            <span className="text-foreground tabular-nums">
              ${totalSaved.toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          {northStar && user && (
            <VelocityPanel
              northStar={northStar}
              lifestyle={lifestyleGoal}
              userId={user.id}
              onChanged={refresh}
            />
          )}

          <h3 className="mt-12 font-display text-[20px] font-medium tracking-tight">
            Recent activity
          </h3>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {ripples.length === 0 ? (
              <li className="py-4 text-[13px] text-muted-foreground">
                Nothing yet. Try a "what if" above to see how a spend or a swap changes your timeline.
              </li>
            ) : (
              ripples.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-3 text-[13px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-orange">
                      {r.tag}
                    </span>
                    <span>{r.action}</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {r.days_delta > 0 ? "+" : ""}
                    {r.days_delta}d
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function VelocityPanel({
  northStar,
  lifestyle,
  userId,
  onChanged,
}: {
  northStar: Goal;
  lifestyle: Goal | undefined;
  userId: string;
  onChanged: () => Promise<void>;
}) {
  const [spend, setSpend] = useState<number>(200);
  const [busy, setBusy] = useState(false);

  const monthly = Number(northStar.monthly) || 0;
  const dailyRate = monthly / 30;
  const daysImpact = rippleDays(spend, monthly); // positive = days pushed back

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
  };

  const pivot = async () => {
    if (!lifestyle || !canPivot) return;
    setBusy(true);
    await Promise.all([
      updateGoal(lifestyle.id, {
        current_amount: lifestyleHas - spend,
      }),
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
  };

  return (
    <section className="rounded-2xl border border-border-strong bg-surface p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-orange">
          Pace · live
        </span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          ${dailyRate.toFixed(2)}/day toward {northStar.label}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[18px] font-medium tracking-tight">
        What if you spent…
      </h3>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Aire doesn't track every coffee. It just tells you what a spend costs in days.
      </p>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-display text-[36px] font-medium tabular-nums">
          ${spend}
        </span>
        <span className="text-[12px] text-muted-foreground">this weekend</span>
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        step={25}
        value={spend}
        onChange={(e) => setSpend(Number(e.target.value))}
        className="mt-3 w-full accent-orange"
      />

      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          What this means
        </div>
        {monthly > 0 ? (
          <p className="mt-2 text-[14px] leading-relaxed">
            Your{" "}
            <span className="text-orange">{northStar.label}</span> date moves back by{" "}
            <span className="font-display text-[20px] tabular-nums">
              {daysImpact}
            </span>{" "}
            day{daysImpact === 1 ? "" : "s"}.
          </p>
        ) : (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Add a monthly amount to this goal to see how spends change your timeline.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={pivot}
          disabled={!canPivot || busy}
          className="rounded-md bg-orange px-4 py-2.5 text-[12px] font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {lifestyle
            ? `Cover it from ${lifestyle.label} instead`
            : "Add a fun-money goal to swap from"}
        </button>
        <button
          type="button"
          onClick={logSpend}
          disabled={busy || spend <= 0}
          className="rounded-md border border-border-strong px-4 py-2.5 text-[12px] hover:border-orange hover:text-orange disabled:opacity-40"
        >
          Spend it anyway
        </button>
      </div>

      {!canPivot && lifestyle && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {lifestyle.label} only has ${lifestyleHas.toLocaleString()} —
          not enough to cover this.
        </p>
      )}
    </section>
  );
}

function labelForPriority(p: Goal["priority"]) {
  switch (p) {
    case "P0":
      return "Must do";
    case "P1":
      return "Big goal";
    case "P2":
      return "Fun money";
    case "Engine":
      return "Earning interest";
    default:
      return p;
  }
}

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="mt-5">
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-700"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground tabular-nums">
        <span className="text-foreground">{clamped.toFixed(0)}% saved</span>
      </div>
    </div>
  );
}

function GoalCard({ g }: { g: Goal }) {
  const pct =
    Number(g.target) > 0
      ? (Number(g.current_amount) / Number(g.target)) * 100
      : 0;
  return (
    <div className="bg-background p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-orange">{labelForPriority(g.priority)}</span>
        {g.apr !== null && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {g.apr}% / yr
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-[18px] font-medium tracking-tight">
        {g.label}
      </div>
      {g.tagline && (
        <div className="mt-1 text-[12px] text-muted-foreground">{g.tagline}</div>
      )}
      <div className="mt-6 flex items-baseline justify-between">
        <span className="font-display text-[22px] font-medium tabular-nums">
          ${Number(g.current_amount).toLocaleString()}
        </span>
        {Number(g.target) > 0 && (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            / ${Number(g.target).toLocaleString()}
          </span>
        )}
      </div>
      {Number(g.target) > 0 && (
        <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-foreground"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}
