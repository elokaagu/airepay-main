import { motion } from "framer-motion";
import { GOALS, type Goal } from "@/lib/plomo-data";
import { NumberTicker } from "@/components/magicui/number-ticker";

export function GoalsGrid() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1500px] px-10 py-28">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[13px] text-muted-foreground">Your goals</div>
            <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
              Four goals. One assistant.
            </h2>
          </div>
          <div className="hidden font-mono text-[12px] text-muted-foreground md:block">
            01 / 04
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((g, i) => (
            <GoalCard key={g.id} goal={g} index={i} />
          ))}
        </div>
      </div>
      <div className="border-t border-border" />
    </section>
  );
}

function GoalCard({ goal, index }: { goal: Goal; index: number }) {
  const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-border-strong"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">{goal.priority}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          0{index + 1}
        </span>
      </div>

      <h3 className="mt-10 font-display text-[22px] font-medium leading-tight tracking-tight">
        {goal.label}
      </h3>
      <p className="mt-1.5 text-[13px] text-muted-foreground">{goal.tagline}</p>

      <div className="mt-auto pt-10">
        {goal.id === "yield" ? (
          <>
            <div className="font-display text-[40px] font-medium tabular-nums">
              <NumberTicker value={goal.apr ?? 0} decimalPlaces={1} suffix="%" />
            </div>
            <div className="text-[12px] text-muted-foreground">a year · on cash savings</div>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[28px] font-medium tabular-nums">
                $<NumberTicker value={goal.current} />
              </span>
              <span className="text-[12px] text-muted-foreground tabular-nums">
                / ${goal.target.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.2 + index * 0.06 }}
                className="h-full rounded-full bg-foreground"
              />
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground">
              {goal.daysToGoal
                ? `${goal.daysToGoal} days to go`
                : `$${goal.monthly}/mo · always on`}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  index,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  index?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div className="max-w-2xl">
        <div className="text-[13px] text-muted-foreground">{eyebrow}</div>
        <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
          {title}
        </h2>
        {desc && (
          <p className="mt-5 max-w-lg text-[15px] text-muted-foreground">
            {desc}
          </p>
        )}
      </div>
      {index && (
        <div className="hidden font-mono text-[12px] text-muted-foreground md:block">
          {index}
        </div>
      )}
    </div>
  );
}
