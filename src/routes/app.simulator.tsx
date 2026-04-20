import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  listGoals,
  logRipple,
  rippleDays,
  type Goal,
} from "@/lib/goals-api";

export const Route = createFileRoute("/app/simulator")({
  component: Simulator,
});

function Simulator() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(200);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const g = await listGoals();
      setGoals(g);
      const ns = g.find((x) => x.is_north_star) ?? g.find((x) => x.priority === "P1");
      if (ns) setTargetId(ns.id);
      const src = g.find((x) => x.priority === "P2") ?? g.find((x) => x.id !== ns?.id);
      if (src) setSourceId(src.id);
      setLoading(false);
    })();
  }, []);

  const target = useMemo(
    () => goals.find((g) => g.id === targetId),
    [goals, targetId],
  );
  const source = useMemo(
    () => goals.find((g) => g.id === sourceId),
    [goals, sourceId],
  );

  const targetMonthly = Number(target?.monthly ?? 0);
  const daysSavedOnTarget = rippleDays(amount, targetMonthly);
  const sourceMonthly = Number(source?.monthly ?? 0);
  const daysCostOnSource = rippleDays(amount, sourceMonthly);

  const apply = async () => {
    if (!user || !target) return;
    setBusy(true);
    try {
      await logRipple(user.id, {
        goal_id: target.id,
        action: source
          ? `Moved $${amount} from ${source.label} into ${target.label}`
          : `Added $${amount} to ${target.label}`,
        amount,
        days_delta: -daysSavedOnTarget,
        tag: "SWAP",
      });
      setSavedMsg(`Done — ${target.label} is now ${daysSavedOnTarget} days closer.`);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="px-10 py-10 text-[13px] text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="px-10 py-10">
      <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
        Compare
      </div>
      <h1 className="mt-3 font-display text-[32px] font-medium tracking-tight">
        What does $<span className="tabular-nums">{amount}</span> cost you?
      </h1>
      <p className="mt-3 max-w-md text-[14px] text-muted-foreground">
        Move money between goals and see how many days it adds (or shaves off)
        your big goal.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Controls */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border-strong bg-surface p-6">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Amount
            </label>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-[44px] font-medium tabular-nums">
                ${amount}
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={2000}
              step={20}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-4 w-full accent-orange"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>$20</span>
              <span>$2,000</span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <GoalSelect
              label="Add to"
              goals={goals}
              value={targetId}
              onChange={setTargetId}
            />
            <GoalSelect
              label="Take from (optional)"
              goals={goals.filter((g) => g.id !== targetId)}
              value={sourceId}
              onChange={setSourceId}
              allowNone
            />
          </div>

          <button
            onClick={apply}
            disabled={busy || !target}
            className="mt-8 w-full rounded-md bg-orange px-5 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : "Make the swap"}
          </button>
          {savedMsg && (
            <div className="mt-4 rounded-md border border-border-strong bg-surface px-4 py-3 text-[13px]">
              {savedMsg}
            </div>
          )}
        </div>

        {/* Result */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border-strong bg-surface-invert p-8 text-foreground-invert">
            <div className="text-[11px] uppercase tracking-wider opacity-60">
              The trade-off
            </div>
            <div className="mt-4 grid grid-cols-2 gap-8">
              <Metric
                label={target?.label ?? "Adding to"}
                value={`-${daysSavedOnTarget}d`}
                hint="closer"
              />
              {source && (
                <Metric
                  label={source.label}
                  value={`+${daysCostOnSource}d`}
                  hint="further away"
                />
              )}
            </div>
            <p className="mt-10 max-w-md text-[14px] leading-relaxed opacity-80">
              {target
                ? `Adding $${amount} to ${target.label} brings it ${daysSavedOnTarget} days closer.${
                    source
                      ? ` It pushes ${source.label} back by ${daysCostOnSource} days.`
                      : ""
                  }`
                : "Pick a goal to add to and we'll show the trade-off."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalSelect({
  label,
  goals,
  value,
  onChange,
  allowNone,
}: {
  label: string;
  goals: Goal[];
  value: string | null;
  onChange: (v: string | null) => void;
  allowNone?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-2 block w-full rounded-md border border-border-strong bg-background px-4 py-3 text-[14px] outline-none focus:border-orange"
      >
        {allowNone && <option value="">— none —</option>}
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider opacity-60">
        {label}
      </div>
      <div className="mt-3 font-display text-[40px] font-medium tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[12px] opacity-60">{hint}</div>
    </div>
  );
}
