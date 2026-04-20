import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { rippleDays, STATE } from "@/lib/plomo-data";

type Allocation = "house" | "vacation" | "yield";

const OPTIONS: { id: Allocation; label: string; sub: string }[] = [
  { id: "house", label: "Home savings", sub: "Move in sooner" },
  { id: "vacation", label: "Holiday", sub: "Upgrade your trip" },
  { id: "yield", label: "Grow it", sub: "Earn 14.2% a year" },
];

export function RippleSimulator() {
  const [amount, setAmount] = useState(STATE.surplusThisMonth);
  const [choice, setChoice] = useState<Allocation>("house");

  const days = rippleDays(amount, choice);
  const baseDays = 412;
  const newDays = choice === "vacation" ? baseDays : baseDays - days;

  return (
    <section className="relative">
      {/* Inverted-contrast panel: dark patch in light mode, light patch in dark mode */}
      <div className="bg-surface-invert text-foreground-invert">
        <div className="mx-auto max-w-[1500px] px-10 py-28">
          <div className="flex items-end justify-between">
            <div className="max-w-2xl">
              <div className="text-[13px] opacity-60">Try it yourself</div>
              <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
                What does each dollar buy you?
              </h2>
            </div>
            <div className="hidden font-mono text-[12px] opacity-50 md:block">
              02
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Mockup card — uses inverted surface for contrast */}
            <div className="stack-card relative rounded-2xl border border-current/15 bg-foreground-invert p-7 text-foreground-invert/0">
              <div className="text-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-[15px]">Spare cash this month</span>
                  <span className="rounded-full border border-border-strong px-3 py-1 text-[11px] text-muted-foreground">
                    Live
                  </span>
                </div>

                <div className="mt-8 flex items-baseline justify-between">
                  <span className="font-display text-[44px] font-medium tabular-nums">
                    ${amount}
                  </span>
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    / $
                    {(
                      STATE.netIncome -
                      STATE.fixedCosts -
                      STATE.monthlyRemittance
                    ).toLocaleString()}{" "}
                    left over
                  </span>
                </div>

                <div className="mt-6">
                  <input
                    type="range"
                    min={0}
                    max={1200}
                    step={20}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="plomo-slider w-full"
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>$0</span>
                    <span>$600</span>
                    <span>$1,200</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                  {OPTIONS.map((opt) => {
                    const active = choice === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setChoice(opt.id)}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          active
                            ? "border-foreground bg-surface-2"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <div className="text-[12px] font-medium text-foreground">
                          {opt.label}
                        </div>
                        <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Outcome panel — text uses inverted foreground */}
            <div className="flex flex-col justify-center">
              <div className="text-[13px] opacity-60">Here's what happens</div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${choice}-${amount}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <div className="font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1] tracking-tight">
                    {choice === "vacation" ? "+" : "−"}
                    <span className="text-orange">{days}</span>{" "}
                    <span className="opacity-50">days</span>
                  </div>
                  <p className="mt-5 max-w-md text-[15px] opacity-70">
                    {choice === "house" &&
                      `Putting $${amount} toward your home moves you in ${days} days sooner.`}
                    {choice === "vacation" &&
                      `Your Lisbon trip arrives ${days} days earlier — and you can upgrade once you hit $1,800.`}
                    {choice === "yield" &&
                      `$${amount} growing at 14.2% a year, then put toward your home — that's ${days} days off your move-in date.`}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex items-center justify-between border-t border-current/15 pt-6">
                <span className="text-[13px] opacity-60">Move-in date</span>
                <span className="text-[14px] tabular-nums">
                  <span className="opacity-50 line-through">{baseDays}d</span> →{" "}
                  <span className="font-medium">{newDays}d</span>
                </span>
              </div>

              <button className="mt-8 self-start rounded-md bg-orange px-7 py-3.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Do it
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .plomo-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          background: var(--secondary);
          border-radius: 999px;
          outline: none;
        }
        .plomo-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 999px;
          background: var(--foreground);
          cursor: grab;
          transition: transform 0.15s;
        }
        .plomo-slider::-webkit-slider-thumb:active { transform: scale(1.1); cursor: grabbing; }
        .plomo-slider::-moz-range-thumb {
          height: 18px; width: 18px; border: none;
          border-radius: 999px; background: var(--foreground);
          cursor: grab;
        }
      `}</style>
    </section>
  );
}
