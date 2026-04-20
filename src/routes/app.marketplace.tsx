import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/marketplace")({
  component: MarketplacePage,
});

type Provider = {
  id: string;
  name: string;
  category: "Banking" | "Transfers" | "Savings" | "Cards";
  blurb: string;
  status: "available" | "coming-soon";
};

const PROVIDERS: Provider[] = [
  {
    id: "plaid",
    name: "Plaid",
    category: "Banking",
    blurb:
      "Link checking and savings accounts at 12,000+ banks across the US, Canada, and Europe.",
    status: "available",
  },
  {
    id: "chase",
    name: "Chase",
    category: "Banking",
    blurb:
      "Connect your Chase checking, savings, and credit accounts directly.",
    status: "coming-soon",
  },
  {
    id: "bofa",
    name: "Bank of America",
    category: "Banking",
    blurb: "Pull balances and transactions from your BofA accounts.",
    status: "coming-soon",
  },
  {
    id: "wise",
    name: "Wise",
    category: "Transfers",
    blurb:
      "Send money home at the real exchange rate. Aire schedules transfers for you.",
    status: "coming-soon",
  },
  {
    id: "remitly",
    name: "Remitly",
    category: "Transfers",
    blurb: "Family transfers across 170+ countries with locked-in rates.",
    status: "coming-soon",
  },
  {
    id: "wealthfront",
    name: "Wealthfront Cash",
    category: "Savings",
    blurb: "Park your safety bucket at a high-yield rate.",
    status: "coming-soon",
  },
  {
    id: "marcus",
    name: "Marcus by Goldman Sachs",
    category: "Savings",
    blurb: "Move spare cash into a Marcus high-yield savings account.",
    status: "coming-soon",
  },
  {
    id: "amex",
    name: "American Express",
    category: "Cards",
    blurb: "Read card balances and statement dates so bills go out on time.",
    status: "coming-soon",
  },
];

const CATEGORIES: Provider["category"][] = [
  "Banking",
  "Transfers",
  "Savings",
  "Cards",
];

function MarketplacePage() {
  return (
    <div className="px-10 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
            Connect apps
          </div>
          <h1 className="mt-3 font-display text-[32px] font-medium leading-tight tracking-tight">
            Hook up your bank, savings and transfer apps.
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Aire works alongside the apps you already use. Link them once and
            we'll keep an eye on your goals in the background — without ever
            moving money on your behalf.
          </p>
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const items = PROVIDERS.filter((p) => p.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-12">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-[18px] font-medium tracking-tight">
                {cat}
              </h2>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {items.length}{" "}
                {items.length === 1 ? "provider" : "providers"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  className="group flex flex-col rounded-xl border border-border-strong bg-surface p-6 transition-colors hover:border-orange/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-[14px] font-medium text-foreground">
                      {p.name.charAt(0)}
                    </div>
                    <span
                      className={[
                        "rounded-full border px-2.5 py-[3px] font-mono text-[10px] uppercase tracking-wider",
                        p.status === "available"
                          ? "border-orange/60 text-orange"
                          : "border-border text-muted-foreground",
                      ].join(" ")}
                    >
                      {p.status === "available" ? "Available" : "Coming soon"}
                    </span>
                  </div>

                  <div className="mt-5 font-display text-[18px] font-medium tracking-tight">
                    {p.name}
                  </div>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                    {p.blurb}
                  </p>

                  <button
                    disabled={p.status !== "available"}
                    className={[
                      "mt-6 self-start rounded-md px-4 py-2 text-[12px] font-medium transition-opacity",
                      p.status === "available"
                        ? "bg-orange text-primary-foreground hover:opacity-90"
                        : "border border-border text-muted-foreground",
                    ].join(" ")}
                  >
                    {p.status === "available" ? "Connect" : "Notify me"}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-14 max-w-xl text-[12px] leading-relaxed text-muted-foreground">
        Aire never moves money without your approval. Connections are
        read-only until you explicitly authorize a transfer.
      </p>
    </div>
  );
}
