import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = {
  id: string;
  label: string;
  python: string[];
  typescript: string[];
};

const STEPS: Step[] = [
  {
    id: "create",
    label: "Set a goal",
    python: [
      'goal = await aire.goals.create(',
      '    name="House down payment",',
      '    target=120_000,',
      '    by_date_days=540,',
      '    importance="must",',
      ')',
    ],
    typescript: [
      "const goal = await aire.goals.create({",
      '  name: "House down payment",',
      "  target: 120_000,",
      "  byDateDays: 540,",
      '  importance: "must",',
      "});",
    ],
  },
  {
    id: "route",
    label: "Plan the money",
    python: [
      'plan = await aire.engine.plan(',
      '    income=8_400,',
      '    must_pay=["rent", "family"],',
      '    min_savings_rate=0.045,',
      ')',
    ],
    typescript: [
      "const plan = await aire.engine.plan({",
      "  income: 8_400,",
      '  mustPay: ["rent", "family"],',
      "  minSavingsRate: 0.045,",
      "});",
    ],
  },
  {
    id: "execute",
    label: "Run it & get a recap",
    python: [
      'await aire.run(plan)',
      '',
      'recap = await aire.recap.weekly(',
      '    goals=[goal.id],',
      ')',
    ],
    typescript: [
      "await aire.run(plan);",
      "",
      "const recap = await aire.recap.weekly({",
      "  goals: [goal.id],",
      "});",
    ],
  },
];

const LANGS = ["Python", "TypeScript"] as const;
type Lang = (typeof LANGS)[number];

export function AgentApi() {
  const [activeId, setActiveId] = useState<string>(STEPS[0].id);
  const [lang, setLang] = useState<Lang>("Python");

  const active = STEPS.find((s) => s.id === activeId)!;
  const lines = lang === "Python" ? active.python : active.typescript;
  const fileName = lang === "Python" ? "orchestrate.py" : "orchestrate.ts";

  return (
    <section className="border-t border-border">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-0 px-0 lg:grid-cols-[1fr_360px]">
        {/* Left: blurred sky panel with code window */}
        <div className="relative isolate overflow-hidden bg-surface-2 px-10 py-24 lg:px-16 lg:py-32">
          {/* Soft blue cloud field */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 gradient-warm opacity-[0.55]" />
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[oklch(0.92_0.04_245)] opacity-70 blur-3xl" />
            <div className="absolute right-10 top-32 h-96 w-96 rounded-full bg-[oklch(0.95_0.02_90)] opacity-60 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[oklch(0.88_0.06_245)] opacity-70 blur-3xl" />
            {/* Grain */}
            <div
              className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
              }}
            />
          </div>

          {/* Code window */}
          <div className="mx-auto w-full max-w-[640px] rounded-md bg-[oklch(0.99_0_0)] shadow-[0_30px_80px_-20px_rgba(20,40,80,0.35)]">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-[oklch(0.92_0_0)] px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.005_90)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.005_90)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.005_90)]" />
              </div>
              <span className="font-mono text-[12px] text-[oklch(0.55_0_0)]">
                {fileName}
              </span>
            </div>

            {/* Code body */}
            <div className="px-5 py-7 font-mono text-[13.5px] leading-[1.9] text-[oklch(0.18_0_0)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeId}-${lang}`}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
                  }}
                >
                  {lines.map((line, i) => (
                    <motion.div
                      key={i}
                      className="flex gap-5"
                      variants={{
                        hidden: { opacity: 0, x: -8, filter: "blur(4px)" },
                        show: {
                          opacity: 1,
                          x: 0,
                          filter: "blur(0px)",
                          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                    >
                      <span className="w-6 select-none text-right text-[oklch(0.7_0_0)] tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="whitespace-pre">{line || "\u00A0"}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Lang tabs */}
            <div className="flex items-center gap-1 border-t border-[oklch(0.92_0_0)] px-3 py-2.5">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded px-3 py-1.5 text-[12px] transition-colors ${
                    lang === l
                      ? "bg-[oklch(0.95_0_0)] text-[oklch(0.13_0_0)]"
                      : "text-[oklch(0.55_0_0)] hover:text-[oklch(0.13_0_0)]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: steps */}
        <div className="flex flex-col justify-between bg-background px-10 py-24 lg:py-32">
          <div>
            {/* Tiny brand mark */}
            <div className="mb-16 h-3 w-3 bg-foreground" />

            <ul className="space-y-7">
              {STEPS.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setActiveId(s.id)}
                      className={`text-left font-display text-[28px] leading-tight tracking-tight transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-16 max-w-[260px] text-[14px] leading-relaxed text-muted-foreground">
            Set goals, plan the money, run it — all from one simple API.
          </p>
        </div>
      </div>
    </section>
  );
}
