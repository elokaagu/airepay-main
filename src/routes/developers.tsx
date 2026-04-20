import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";
import { AnimatedCodeBlock } from "@/components/plomo/AnimatedCodeBlock";
import { motion } from "framer-motion";


export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Developers — Aire API" },
      {
        name: "description",
        content:
          "Add goal-based money tools to your product. The Aire API lets you set goals, compare any choice in days, and check a wishlist purchase over a clean REST + websocket interface.",
      },
      { property: "og:title", content: "Developers — Aire API" },
      {
        property: "og:description",
        content:
          "REST + websocket API for goals, compare, earn and wishlist. Typed SDKs in TypeScript, Python, and Swift.",
      },
    ],
  }),
  component: DevelopersPage,
});

const ENDPOINTS = [
  { method: "POST", path: "/v1/goals", desc: "Add a goal with importance + target" },
  { method: "GET", path: "/v1/goals/:id/compare", desc: "Compare a change in days, not dollars" },
  { method: "POST", path: "/v1/wishlist", desc: "Get a verdict on a potential purchase" },
  { method: "GET", path: "/v1/earn/rates", desc: "Best safe savings rates today" },
  { method: "WS", path: "/v1/stream", desc: "Live updates, ripples and safety alerts" },
];

const SAMPLE = `import { Aire } from "@aire/sdk";

const aire = new Aire({ apiKey: process.env.AIRE_KEY });

// Set a goal — what you want, not how to get there.
const house = await aire.goals.create({
  label: "Buying a home",
  importance: "should",
  target: 64_000,
  byDate: "2027-06-01",
});

// What does $200 cost me?
const { daysDelta } = await aire.compare({
  goal: house.id,
  delta: -200,
});

console.log(\`Spending $200 pushes the move-in by \${daysDelta} days\`);`;

function DevelopersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Developers"
        title={
          <>
            A friendly API built around{" "}
            <span className="text-orange">goals — not transactions.</span>
          </>
        }
        lede="Most money APIs are built around moving cash and pulling balances. Aire's API is built around the goals people actually have. Plug it into your product and ship features users feel."
      />

      <section>
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-16 px-10 py-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
              Endpoints
            </div>
            <h2 className="mt-4 font-display text-[32px] font-medium tracking-tight">
              Five things, one engine.
            </h2>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {ENDPOINTS.map((e, i) => (
                <motion.li
                  key={e.path}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-5 py-4 font-mono text-[13px]"
                >
                  <span className="w-12 text-orange">{e.method}</span>
                  <span className="text-foreground">{e.path}</span>
                  <span className="ml-auto hidden text-muted-foreground md:inline">
                    {e.desc}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border-strong bg-surface-invert p-2 text-foreground-invert">
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-orange" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong opacity-60" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong opacity-60" />
                <span className="ml-3 font-mono text-[11px] opacity-60">
                  compare.ts
                </span>
              </div>
              <AnimatedCodeBlock
                code={SAMPLE}
                duration={3}
                className="rounded-xl bg-background/5 p-6 text-[12.5px] leading-[1.75]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-px overflow-hidden border-x border-b border-border bg-border md:grid-cols-3">
          {[
            { k: "TypeScript", v: "First-class. Fully typed responses." },
            { k: "Python", v: "Async client with clean models." },
            { k: "Swift", v: "iOS SDK that works with Combine." },
          ].map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background p-10"
            >
              <div className="font-mono text-[12px] text-orange">SDK</div>
              <div className="mt-4 font-display text-[24px] font-medium tracking-tight">
                {s.k}
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">{s.v}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
