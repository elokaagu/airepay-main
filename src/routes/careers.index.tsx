import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHero } from "@/components/plomo/PageShell";
import { ROLES, rolesByCategory } from "@/lib/roles";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Jobs at Aire" },
      {
        name: "description",
        content:
          "Open jobs at Aire. We're a small team building a money helper for real life. Engineers, designers, and ops welcome.",
      },
      { property: "og:title", content: "Jobs at Aire" },
      {
        property: "og:description",
        content:
          "Help us build a money helper that actually works for the people who need it most.",
      },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const total = ROLES.length;
  const grouped = rolesByCategory();

  return (
    <PageShell>
      <PageHero
        eyebrow="Jobs"
        title={
          <>
            Help us build something{" "}
            <span className="text-orange">people actually use.</span>
          </>
        }
        lede="Plomo is a small team that ships carefully. We hire people who'd rather get the basics right once than ship ten half-baked things."
      />

      <section className="bg-surface">
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-[28px] font-medium tracking-tight">
                  Open jobs
                </h2>
                <span className="font-mono text-[14px] text-muted-foreground">
                  {total}
                </span>
              </div>
              <p className="mt-6 max-w-[240px] text-[14px] leading-relaxed text-muted-foreground">
                Brooklyn · Lisbon · remote-friendly across UTC-5 to UTC+2.
              </p>
            </div>

            <div className="space-y-14">
              {grouped.map(({ category, roles }) => (
                <div key={category}>
                  <div className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
                    {category}
                  </div>
                  <ul className="mt-6 divide-y divide-border border-y border-border">
                    {roles.map((r, i) => (
                      <motion.li
                        key={r.slug}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: 0.4,
                          delay: i * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          to="/careers/$slug"
                          params={{ slug: r.slug }}
                          className="group flex items-center justify-between py-5 transition-colors hover:bg-background/40"
                        >
                          <span className="font-display text-[20px] font-medium tracking-tight">
                            {r.title}
                            {r.tag && (
                              <span className="ml-2 text-muted-foreground">
                                {r.tag}
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
