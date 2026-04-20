import { motion } from "framer-motion";
import { SectionHead } from "./GoalsGrid";
import { AGENT_BRIEF, RECENT_RIPPLES } from "@/lib/plomo-data";

export function YieldEngine() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1500px] px-10 py-28">
        <SectionHead
          eyebrow="Make your savings work"
          title="Spare cash, growing safely"
          desc="Money you don't need right now earns more than a regular savings account. We watch the rates and cap how much can sit in any one place — so you sleep easy."
          index="04"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* APR comparison */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-surface p-8">
              <div className="flex items-end justify-between">
              <div>
                  <div className="text-[13px] text-muted-foreground">
                    Interest rate
                  </div>
                  <div className="mt-2 font-display text-[28px] font-medium leading-tight tracking-tight">
                    Aire <span className="text-orange">+9.1 pts</span>{" "}
                    <span className="text-muted-foreground">vs your bank</span>
                  </div>
                </div>
                <span className="ticker-pulse rounded-full border border-border-strong px-3 py-1 text-[11px] text-muted-foreground">
                  Live
                </span>
              </div>

              <div className="mt-10 space-y-5">
                <Bar label="Aire · cash savings" value={14.2} max={16} highlight />
                <Bar label="Yotta savings" value={5.1} max={16} />
                <Bar label="Marcus savings" value={4.4} max={16} />
                <Bar label="4-week T-Bills" value={5.3} max={16} />
              </div>

              <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
                <Cell k="Safety cap" v="18%" sub="of home savings" />
                <Cell k="Working for you" v="14.3%" sub="$2,640 earning" />
                <Cell k="Room to add" v="$2,360" sub="before the cap" />
              </div>
            </div>
          </div>

          {/* Agent brief + ripple log */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">
                  Today's update
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  3 things
                </span>
              </div>
              <div className="space-y-5">
                {AGENT_BRIEF.map((b, i) => (
                  <motion.div
                    key={b.tag + i}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="border-l border-border-strong pl-4"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {b.tag}
                    </div>
                    <div className="mt-1 text-[14px] leading-relaxed">
                      {b.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-7">
              <div className="mb-4 text-[13px] text-muted-foreground">
                Recent moves
              </div>
              <div className="divide-y divide-border">
                {RECENT_RIPPLES.map((r) => (
                  <div
                    key={r.date}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {r.date}
                      </div>
                      <div className="mt-0.5 text-[14px]">{r.action}</div>
                    </div>
                    <span className="text-[13px] tabular-nums text-orange">
                      {r.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border" />
    </section>
  );
}

function Bar({
  label,
  value,
  max,
  highlight,
}: {
  label: string;
  value: number;
  max: number;
  highlight?: boolean;
}) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px]">{label}</span>
        <span
          className={`text-[13px] tabular-nums ${highlight ? "text-orange" : "text-muted-foreground"}`}
        >
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-[4px] overflow-hidden rounded-full bg-surface-2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: highlight ? "var(--orange)" : "var(--border-strong)",
          }}
        />
      </div>
    </div>
  );
}

function Cell({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="bg-surface p-5">
      <div className="text-[11px] text-muted-foreground">{k}</div>
      <div className="mt-1 font-display text-[22px] font-medium tabular-nums">
        {v}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
