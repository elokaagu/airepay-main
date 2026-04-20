import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Aire" },
      {
        name: "description",
        content:
          "Simple pricing for households. Pay a small share of what Aire handles for you — only when it actually moves money.",
      },
      { property: "og:title", content: "Pricing — Aire" },
      {
        property: "og:description",
        content:
          "Two plans. No seat fees. No hidden charges. You only pay when Aire does the work.",
      },
    ],
  }),
  component: PricingPage,
});

const FEATURES_BASIC = [
  "Up to 5 goals",
  "Built-in safety caps",
  "Weekly summary of what Aire did",
  "Standard savings boost (up to 4.5% / yr)",
  "Email support",
];

const FEATURES_CREDIT = [
  "Unlimited goals & dependents",
  "Priority money moves",
  "Higher savings boost (up to 5.4% / yr)",
  "Bill, subscription & FX negotiation",
  "Dedicated support contact",
  "API & webhook access",
];

function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Simple, fair pricing for{" "}
            <span className="text-orange">people and partners.</span>
          </>
        }
        lede="No seat fees. No 'budget exceeded' shame. You pay a small share of what Aire actually handles for you — and nothing when it doesn't."
      />

      <section>
        <div className="mx-auto max-w-[1300px] px-10 py-24">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Basic */}
            <div className="rounded-2xl bg-surface p-10">
              <div className="flex items-start justify-between">
                <h2 className="font-display text-[28px] font-medium tracking-tight">
                  Basic
                </h2>
                <span className="rounded-md bg-background px-3 py-1.5 font-mono text-[13px]">
                  1.5%
                </span>
              </div>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                Get started with Aire. Connect your accounts, set your big
                goal, and let Aire handle each paycheck for you.
              </p>
              <ul className="mt-10 space-y-3 text-[14px] text-muted-foreground">
                {FEATURES_BASIC.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 rounded-full bg-foreground/60" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-12">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-[13px] font-medium transition-colors hover:bg-surface-2"
                >
                  Get started →
                </Link>
              </div>
            </div>

            {/* Plus */}
            <div className="rounded-2xl bg-surface-invert p-10 text-foreground-invert">
              <div className="flex items-start justify-between">
                <h2 className="font-display text-[28px] font-medium tracking-tight">
                  Plus
                </h2>
                <span className="rounded-md bg-foreground-invert/10 px-3 py-1.5 font-mono text-[13px]">
                  3%
                </span>
              </div>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed opacity-70">
                Want more speed? Aire unlocks higher savings rates and more
                moves a month — so your money grows a little faster.
              </p>
              <ul className="mt-10 space-y-3 text-[14px] opacity-80">
                {FEATURES_CREDIT.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 rounded-full bg-current opacity-60" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-12">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-md bg-foreground-invert/10 px-5 py-3 text-[13px] font-medium transition-colors hover:bg-foreground-invert/15"
                >
                  Get started →
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-[13px] text-muted-foreground">
            Both plans cap fees once you cross a household amount. We grow
            only when you do.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
