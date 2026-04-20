import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHead } from "./GoalsGrid";

type Choice = "push-house" | "skip-vacation" | "tap-yield";

const CHOICES: { id: Choice; title: string; sub: string; impact: string }[] = [
  {
    id: "push-house",
    title: "Take it from your home savings",
    sub: "You'll move in 12 days later",
    impact: "+12 days",
  },
  {
    id: "skip-vacation",
    title: "Skip this month's holiday saving",
    sub: "Lisbon pushed out 3 weeks",
    impact: "Home plan safe",
  },
  {
    id: "tap-yield",
    title: "Pull from your savings boost",
    sub: "A small dip in interest earned",
    impact: "−0.4% / yr",
  },
];

export function Negotiator() {
  const [picked, setPicked] = useState<Choice | null>(null);

  return (
    <section className="relative">
      <div className="mx-auto max-w-[1500px] px-10 py-28">
        <SectionHead
          eyebrow="When life happens"
          title="A surprise bill, sorted"
          desc="Your car needs $500 of repairs. Aire shows you the trade-offs before moving a dollar — and the money you send home is never on the table."
          index="03"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Shock card */}
          <div className="lg:col-span-5">
            <div className="stack-card rounded-2xl border border-border bg-surface p-7">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">
                  Surprise expense
                </span>
                <span className="rounded-full border border-border-strong px-3 py-1 text-[11px] text-muted-foreground">
                  Unplanned
                </span>
              </div>

              <div className="mt-8 font-display text-[28px] font-medium leading-tight tracking-tight">
                Car repair
              </div>
              <div className="mt-1 font-display text-[44px] font-medium tabular-nums">
                $500
              </div>

              <div className="mt-8 space-y-3 border-t border-border pt-6">
                <Row k="Take-home pay" v="$6,000" />
                <Row k="Bills & rent" v="$3,120" />
                <Row k="Family · must send" v="$600" lock />
                <Row k="Surprise" v="$500" />
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[12px] text-muted-foreground">Left to plan with</span>
                  <span className="text-[14px] font-medium tabular-nums">$1,780</span>
                </div>
              </div>
            </div>
          </div>

          {/* Choice list */}
          <div className="lg:col-span-7">
            <div className="space-y-3">
              {CHOICES.map((c) => {
                const active = picked === c.id;
                return (
                  <motion.button
                    key={c.id}
                    onClick={() => setPicked(c.id)}
                    whileHover={{ x: 2 }}
                    className={`flex w-full items-center justify-between rounded-2xl border bg-surface p-6 text-left transition-all ${
                      active ? "border-orange" : "border-border hover:border-border-strong"
                    }`}
                  >
                    <div>
                      <div className="text-[17px] font-medium">{c.title}</div>
                      <div className="mt-1 text-[13px] text-muted-foreground">
                        {c.sub}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[14px] tabular-nums ${active ? "text-orange" : "text-foreground"}`}>
                        {c.impact}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        change
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              <AnimatePresence>
                {picked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center justify-between rounded-2xl border border-orange/40 bg-surface-2 p-5">
                      <div className="flex items-center gap-3">
                        <span className="ticker-pulse h-1.5 w-1.5 rounded-full bg-orange" />
                        <span className="text-[13px] text-muted-foreground">
                          Plan ready · just confirm
                        </span>
                      </div>
                      <button className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground">
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border" />
    </section>
  );
}

function Row({ k, v, lock }: { k: string; v: string; lock?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
        {k}
        {lock && (
          <span className="rounded-full border border-border-strong px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
            Must
          </span>
        )}
      </span>
      <span className="text-[13px] tabular-nums">{v}</span>
    </div>
  );
}
