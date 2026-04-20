import { useMemo, useState } from "react";
import type { Goal, Ripple } from "@/lib/goals-api";

type Range = 30 | 90 | 365;

export function GoalGrowthChart({
  goal,
  ripples,
}: {
  goal: Goal;
  ripples: Ripple[];
}) {
  const [range, setRange] = useState<Range>(30);

  const { points, minY, maxY, projected, lastValue, delta } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - range);

    const monthly = Number(goal.monthly) || 0;
    const dailyRate = monthly / 30;
    const current = Number(goal.current_amount) || 0;

    // Build a per-day series. We model historical balance as:
    // current - (days_remaining * dailyRate) - sum(ripple deltas after that day)
    // For simplicity, walk forward from start using dailyRate, adjusted by ripples.
    const days = range;
    const series: { date: Date; value: number }[] = [];

    // Compute ripple impact per day (in $) — SPEND subtracts, SWAP adds
    const rippleByDay = new Map<string, number>();
    for (const r of ripples) {
      if (r.goal_id !== goal.id) continue;
      const d = new Date(r.created_at);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const sign = r.tag === "SWAP" ? 1 : r.tag === "SPEND" ? -1 : 1;
      rippleByDay.set(
        key,
        (rippleByDay.get(key) ?? 0) + sign * Number(r.amount || 0),
      );
    }

    // Back-cast: starting value = current - dailyRate * days - sum(ripples in window)
    let totalRipplesInWindow = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      totalRipplesInWindow += rippleByDay.get(key) ?? 0;
    }
    let value = current - dailyRate * days - totalRipplesInWindow;

    for (let i = 0; i <= days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      if (i > 0) {
        value += dailyRate;
        value += rippleByDay.get(key) ?? 0;
      }
      series.push({ date: new Date(d), value: Math.max(0, value) });
    }

    const target = Number(goal.target) || 0;
    const values = series.map((s) => s.value);
    const minY = Math.min(...values, 0);
    const maxY = Math.max(...values, target || 1, current);

    const lastValue = series[series.length - 1].value;
    const firstValue = series[0].value;
    const delta = lastValue - firstValue;

    return {
      points: series,
      minY,
      maxY,
      projected: target > 0 && dailyRate > 0
        ? Math.ceil((target - current) / dailyRate)
        : null,
      lastValue,
      delta,
    };
  }, [goal, ripples, range]);

  const W = 800;
  const H = 220;
  const PAD_X = 0;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 28;

  const xFor = (i: number) =>
    PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2);
  const yFor = (v: number) => {
    const range = maxY - minY || 1;
    return PAD_TOP + (1 - (v - minY) / range) * (H - PAD_TOP - PAD_BOTTOM);
  };

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(2)} ${yFor(p.value).toFixed(2)}`)
    .join(" ");

  const areaPath =
    `${linePath} L ${xFor(points.length - 1).toFixed(2)} ${(H - PAD_BOTTOM).toFixed(2)} ` +
    `L ${xFor(0).toFixed(2)} ${(H - PAD_BOTTOM).toFixed(2)} Z`;

  const fmtMoney = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // X axis ticks: 4 evenly spaced labels
  const tickIdxs = [0, Math.floor(points.length / 3), Math.floor((2 * points.length) / 3), points.length - 1];

  const ranges: Range[] = [30, 90, 365];

  return (
    <section className="mt-12 rounded-2xl border border-border-strong bg-surface p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
            {goal.label} · projected balance
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-[36px] font-medium tabular-nums">
              ${Math.round(lastValue).toLocaleString()}
            </span>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                delta >= 0 ? "text-orange" : "text-muted-foreground"
              }`}
            >
              {delta >= 0 ? "↗" : "↘"} {fmtMoney(Math.abs(delta))} · {range}d
            </span>
          </div>
          {projected !== null && (
            <div className="mt-1 text-[12px] text-muted-foreground">
              At your current pace, you hit{" "}
              <span className="text-foreground tabular-nums">
                ${Number(goal.target).toLocaleString()}
              </span>{" "}
              in about{" "}
              <span className="text-foreground tabular-nums">{projected}</span> days.
            </div>
          )}
        </div>
        <div className="flex rounded-md border border-border-strong p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-[5px] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
                range === r
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === 365 ? "1y" : `${r}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-[220px] w-full"
        >
          <defs>
            <linearGradient id="goalGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--orange)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* target line */}
          {Number(goal.target) > 0 && (
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={yFor(Number(goal.target))}
              y2={yFor(Number(goal.target))}
              stroke="var(--border)"
              strokeDasharray="3 4"
              strokeWidth="1"
            />
          )}

          <path d={areaPath} fill="url(#goalGrowthFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--orange)"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* end dot */}
          <circle
            cx={xFor(points.length - 1)}
            cy={yFor(lastValue)}
            r="3.5"
            fill="var(--orange)"
          />

          {/* x-axis labels */}
          {tickIdxs.map((i) => (
            <text
              key={i}
              x={xFor(i)}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
              fill="var(--muted-foreground)"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              {fmtDate(points[i].date)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
