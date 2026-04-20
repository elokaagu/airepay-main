import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  listGoals,
  logRipple,
  rippleDays,
  type Goal,
} from "@/lib/goals-api";

export const Route = createFileRoute("/m/simulator")({
  component: MobileSimulator,
});

function MobileSimulator() {
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
      const ns =
        g.find((x) => x.is_north_star) ?? g.find((x) => x.priority === "P1");
      if (ns) setTargetId(ns.id);
      const src =
        g.find((x) => x.priority === "P2") ?? g.find((x) => x.id !== ns?.id);
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
      setSavedMsg(`Done — ${target.label} is ${daysSavedOnTarget}d closer.`);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 py-6 text-[13px] text-white/55">Loading…</div>
    );
  }

  return (
    <div className="px-4 pb-6 text-white">
      {/* Hero — amount */}
      <section className="pb-5 pt-6 text-center">
        <div className="text-[13px] font-medium text-white/70">Compare</div>
        <div className="mt-2 flex items-end justify-center">
          <span
            className="font-display text-[72px] font-extrabold leading-none tracking-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            ${amount}
          </span>
        </div>
        <div className="mt-2 text-[12px] text-white/45">
          Move it between goals and see the trade-off
        </div>
      </section>

      {/* Slider */}
      <section className="rounded-2xl bg-white/[0.06] p-5">
        <input
          type="range"
          min={20}
          max={2000}
          step={20}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="h-6 w-full accent-white"
        />
        <div className="mt-1 flex justify-between text-[10px] text-white/45 tabular-nums">
          <span>$20</span>
          <span>$2,000</span>
        </div>
      </section>

      {/* Selectors */}
      <section className="mt-3 space-y-2.5">
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
      </section>

      {/* Trade-off card — inverted */}
      <section className="mt-5 rounded-2xl bg-white p-5 text-black">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-black/50">
          The trade-off
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <Metric
            label={target?.label ?? "Adding to"}
            value={`-${daysSavedOnTarget}d`}
            hint="closer"
            positive
          />
          {source && (
            <Metric
              label={source.label}
              value={`+${daysCostOnSource}d`}
              hint="further"
            />
          )}
        </div>
        <p className="mt-5 text-[12px] leading-relaxed text-black/60">
          {target
            ? `Adding $${amount} to ${target.label} brings it ${daysSavedOnTarget}d closer${
                source
                  ? `. Pushes ${source.label} back ${daysCostOnSource}d.`
                  : "."
              }`
            : "Pick a goal to add to."}
        </p>
      </section>

      <button
        onClick={apply}
        disabled={busy || !target}
        className="mt-5 w-full rounded-full bg-white py-3.5 text-[14px] font-semibold text-black active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? "Saving…" : "Make the swap"}
      </button>
      {savedMsg && (
        <div className="mt-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-center text-[13px] text-white/80">
          {savedMsg}
        </div>
      )}
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
    <div className="rounded-2xl bg-white/[0.06] px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </div>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full appearance-none bg-transparent text-[16px] font-semibold outline-none"
      >
        {allowNone && (
          <option value="" className="bg-[#111]">
            — none —
          </option>
        )}
        {goals.map((g) => (
          <option key={g.id} value={g.id} className="bg-[#111]">
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
  positive,
}: {
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}) {
  return (
    <div>
      <div className="line-clamp-1 text-[10px] font-semibold uppercase tracking-wider text-black/45">
        {label}
      </div>
      <div
        className={[
          "mt-2 font-display text-[30px] font-extrabold tabular-nums",
          positive ? "text-[#16a34a]" : "text-black",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-black/55">{hint}</div>
    </div>
  );
}
