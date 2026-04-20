import { motion } from "framer-motion";
import { GOALS } from "@/lib/plomo-data";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";

export function Hero() {
  const house = GOALS.find((g) => g.id === "house")!;
  const pct = Math.round((house.current / house.target) * 100);

  return (
    <section className="relative overflow-hidden">
      {/* Magic UI — subtle dot pattern with radial mask */}
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "fill-foreground/10",
        )}
      />

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-10 pb-20 pt-20 lg:grid-cols-2 lg:gap-20 lg:pt-28">
        {/* Left: headline */}
        <div className="flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.02] tracking-tight"
          >
            <span className="text-orange">Aire</span> looks after the home, the
            people you support, and your{" "}
            <span className="font-script text-[1.3em] font-normal italic">savings</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-muted-foreground"
          >
            One smart assistant that balances your bills, the money you send
            home, and growing what's left — so you stop juggling spreadsheets
            and actually get there.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <button className="rounded-md bg-orange px-7 py-3.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              See how it works
            </button>
          </motion.div>
        </div>

        {/* Right: mockup */}
        <div className="relative flex items-center">
          <div className="absolute right-[-10%] top-1/2 hidden h-[60%] w-[80%] -translate-y-1/2 rounded-2xl gradient-warm opacity-90 blur-[2px] lg:block" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="stack-card relative z-10 w-full overflow-hidden rounded-2xl border border-border-strong bg-background p-7"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-foreground">Saving for a home</span>
              <span className="rounded-full border border-border-strong px-3 py-1 text-[11px] text-muted-foreground">
                On track
              </span>
            </div>

            <div className="mt-10 flex items-baseline justify-between">
              <span className="font-display text-[44px] font-medium tracking-tight tabular-nums">
                $
                <NumberTicker
                  value={house.current}
                  className="font-display text-[44px] font-medium"
                />
              </span>
              <span className="text-[15px] text-muted-foreground tabular-nums">
                / ${house.target.toLocaleString()}
              </span>
            </div>

            <div className="mt-5 h-[6px] w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                className="h-full rounded-full bg-foreground"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">
                <span className="text-foreground tabular-nums">{pct}%</span> Saved
              </span>
              <span className="text-muted-foreground">
                <span className="text-foreground tabular-nums">412</span> days
                to go
              </span>
            </div>

            {/* Magic UI — animated border beam */}
            <BorderBeam size={120} duration={9} colorFrom="var(--orange)" />
          </motion.div>
        </div>
      </div>

    </section>
  );
}
