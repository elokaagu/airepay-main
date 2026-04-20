import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";


export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "What Aire does — Products" },
      {
        name: "description",
        content:
          "Set goals, compare any choice in days not dollars, earn more on what you save, keep a wishlist honest, and share a goal with someone you trust.",
      },
      { property: "og:title", content: "Products — Aire" },
      {
        property: "og:description",
        content:
          "Five simple tools. One assistant for the goals that actually matter.",
      },
    ],
  }),
  component: ProductsPage,
});

const MODULES = [
  {
    code: "01",
    name: "Goals",
    tag: "Must · Should · Nice",
    blurb:
      "Tell Aire what matters most. Bills and the people you support come first — always. Everything else gets balanced around them.",
    bullets: [
      "Pick one north-star goal Aire protects",
      "Mark the rest as Must, Should or Nice",
      "A short daily update tells you why each move was made",
    ],
  },
  {
    code: "02",
    name: "Compare",
    tag: "Try before you spend",
    blurb:
      "Every dollar moves your move-in date. Want to spend $200 on dinner out? See exactly how many days that adds to your home plan.",
    bullets: [
      "See the cost of a choice in days, not just dollars",
      "Try things like 'what if I cancel Lisbon?'",
      "Includes the interest you'd have earned",
    ],
  },
  {
    code: "03",
    name: "Earn",
    tag: "More on what's left",
    blurb:
      "Spare cash earns. Aire finds a safe rate on your savings and only moves things when it's worth it — extra earnings show up as days off your goal.",
    bullets: [
      "Up to ~14% a year on cash savings (example rate)",
      "Caps how much sits in any one place",
      "Switches automatically when better, safer rates appear",
    ],
  },
  {
    code: "04",
    name: "Wishlist",
    tag: "Honest second opinion",
    blurb:
      "Drop a link, a price, or a photo. Aire tells you what it would cost your real goal — in days — and quietly suggests a cheaper alternative if there is one.",
    bullets: [
      "A clear go / wait / skip verdict",
      "Shows the impact on your north-star goal",
      "Saves you from the 'add to cart' spiral",
    ],
  },
  {
    code: "05",
    name: "Bond",
    tag: "Share with one person",
    blurb:
      "Save toward something with a partner, parent or close friend. You both see the same goal, the same number, and what it would take to finish.",
    bullets: [
      "Invite one person you trust",
      "Share a single goal — not your whole account",
      "Either side can leave at any time",
    ],
  },
];

function ProductsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Products"
        title={
          <>
            <span className="text-orange">Five simple tools.</span> One
            assistant.
          </>
        }
        lede="Aire isn't another app to log into. It's a quiet helper that watches your money and moves it where it does the most for you — without surprises."
      />

      <section>
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <article
                key={m.code}
                className="bg-background p-10 transition-colors hover:bg-surface"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {m.code}
                  </span>
                  <span className="rounded-full border border-border-strong px-3 py-1 text-[11px] text-muted-foreground">
                    {m.tag}
                  </span>
                </div>
                <h2 className="mt-8 font-display text-[28px] font-medium leading-tight tracking-tight">
                  {m.name}
                </h2>
                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                  {m.blurb}
                </p>
                <ul className="mt-8 space-y-3">
                  {m.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-[13px] text-foreground"
                    >
                      <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-orange" />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight tracking-tight">
            Why Aire feels different from your budgeting app.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                k: "Most apps",
                v: "Tell you what you spent last week. Reactive. A bit guilt-trippy.",
              },
              {
                k: "Aire",
                v: "Tells you where you're heading and what each choice costs. Adjusts when life changes.",
              },
              {
                k: "The shift",
                v: "From 'track every coffee' to 'are we still on track for the home?'",
              },
            ].map((b) => (
              <div key={b.k} className="border-t border-border-strong pt-6">
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
                  {b.k}
                </div>
                <p className="mt-3 text-[15px] leading-relaxed">{b.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
