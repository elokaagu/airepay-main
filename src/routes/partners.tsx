import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";


export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — Aire works with the apps you already use" },
      {
        name: "description",
        content:
          "Aire connects to your bank, the apps you use to send money home, and trusted savings options. One smart layer over the tools you already know.",
      },
      { property: "og:title", content: "Partners — Aire" },
      {
        property: "og:description",
        content:
          "Banks, money-sending apps, and savings options that Aire works with — one assistant on top of the tools you already use.",
      },
    ],
  }),
  component: PartnersPage,
});

const TIERS = [
  {
    label: "Banks & accounts",
    items: [
      { name: "Plaid", note: "Connect your bank" },
      { name: "Mercury", note: "Everyday checking" },
      { name: "Treasury Prime", note: "Bank partners" },
      { name: "Fireblocks", note: "Secure custody" },
    ],
  },
  {
    label: "Send money home",
    items: [
      { name: "Sendwave", note: "USA → West Africa" },
      { name: "Wise", note: "Multi-currency transfers" },
      { name: "Bitso", note: "USD → Mexico" },
      { name: "LemFi", note: "Diaspora transfers" },
    ],
  },
  {
    label: "Earn on what's left",
    items: [
      { name: "Aave", note: "Cash savings" },
      { name: "Morpho", note: "Smart cash savings" },
      { name: "Pendle", note: "Lock in a rate" },
      { name: "Hyperliquid", note: "Higher-yield cash" },
    ],
  },
];

function PartnersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Partners"
        title={
          <>
            One assistant.{" "}
            <span className="text-orange">All the apps you already use.</span>
          </>
        }
        lede="Aire doesn't replace your bank or your money-sending app. It connects them and quietly moves money around — keeping you on track for the goal that matters most."
      />

      <section>
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          <div className="space-y-20">
            {TIERS.map((tier) => (
              <div key={tier.label}>
                <div className="flex items-baseline justify-between border-b border-border pb-6">
                  <h2 className="font-display text-[28px] font-medium tracking-tight">
                    {tier.label}
                  </h2>
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {tier.items.length} live
                  </span>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
                  {tier.items.map((p) => (
                    <div
                      key={p.name}
                      className="flex flex-col justify-between bg-background p-7 transition-colors hover:bg-surface"
                    >
                      <span className="font-display text-[20px] font-medium tracking-tight">
                        {p.name}
                      </span>
                      <span className="mt-12 text-[12px] uppercase tracking-wider text-muted-foreground">
                        {p.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-invert text-foreground-invert">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-10 py-24 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
              Want Aire to work with your app?
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed opacity-70">
              We're slowly adding more banks, transfer services and savings
              options. If your product helps people pay bills, send money home,
              or save for something big — we'd love to talk.
            </p>
          </div>
          <div className="md:col-span-5 md:pt-2">
            <button className="rounded-md bg-orange px-7 py-3.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Get in touch
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
