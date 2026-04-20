import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Aire" },
      {
        name: "description",
        content:
          "Aire is a money assistant for the things that actually matter — your home, the people you support, and your savings.",
      },
      { property: "og:title", content: "About Aire" },
      {
        property: "og:description",
        content:
          "Why we're building a money helper that focuses on where you're going, not just what you spent.",
      },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  {
    n: "01",
    k: "Where you're going matters more",
    v: "We don't measure a feature by clicks — we measure it by how much closer it gets you to what you actually want.",
  },
  {
    n: "02",
    k: "Family first, always",
    v: "If you support people, that money never gets traded away for a higher return. Full stop.",
  },
  {
    n: "03",
    k: "Safety nets, not roadblocks",
    v: "We cap risk so a bad day can't wipe you out — but we never stop you from doing what you want with your money.",
  },
  {
    n: "04",
    k: "Adjust, don't scold",
    v: "Life changes. So does the plan. You'll never get a 'you blew the budget' notification.",
  },
];

function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About"
        title={
          <>
            We make managing money{" "}
            <span className="text-orange">feel less like a job.</span>
          </>
        }
        lede="Aire started with a simple idea: people don't need another budgeting app to nag them. They need a helper that actually moves the money for them and keeps them on track."
      />

      <section>
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
                Why we exist
              </div>
              <h2 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.1] tracking-tight">
                Help people go from{" "}
                <span className="text-orange">getting by</span> to{" "}
                <span className="text-orange">getting ahead.</span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[16px] leading-[1.7] text-muted-foreground">
                Most people aren't just paying their own bills. They're sending
                money home, saving for a holiday, running a side hustle, and
                quietly hoping to own a place one day. The tools out there make
                them juggle all of it in a spreadsheet — after the fact.
              </p>
              <p className="mt-6 text-[16px] leading-[1.7] text-muted-foreground">
                Aire is the helper they should have had from the start. One
                that treats family obligations as sacred, the home as the big
                target, and the savings boost as the thing that gets them there
                a little faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
            How we work
          </div>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="bg-background p-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {p.n}
                  </span>
                  <h3 className="font-display text-[22px] font-medium tracking-tight">
                    {p.k}
                  </h3>
                </div>
                <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
                  {p.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1500px] px-10 py-24 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-tight">
            Want to read more?
          </h2>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/blog"
              className="rounded-md border border-border-strong px-6 py-3 text-[14px] transition-colors hover:bg-surface"
            >
              Read the blog
            </Link>
            <Link
              to="/careers"
              className="rounded-md bg-orange px-6 py-3 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              See open jobs
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
