import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";
import { POSTS, TONE_BG } from "@/lib/posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Writing — Aire" },
      {
        name: "description",
        content:
          "Stories from the Aire team on saving, sending money home, and building a money assistant that actually helps.",
      },
      { property: "og:title", content: "Aire — Writing" },
      {
        property: "og:description",
        content:
          "Notes from the people building a friendlier way to handle your money.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const featured = POSTS.find((p) => p.manifesto) ?? POSTS[0];
  const rest = POSTS.filter((p) => p.slug !== featured.slug);

  return (
    <PageShell>
      <PageHero
        eyebrow="Writing"
        title={
          <>
            Notes from the people{" "}
            <span className="text-orange">building it.</span>
          </>
        }
        lede="Longer reads, build notes, and the occasional honest opinion from the team behind Aire."
      />

      {/* Featured / manifesto */}
      <section>
        <div className="mx-auto max-w-[1300px] px-10 pt-20">
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {featured.cover ? (
                <img
                  src={featured.cover}
                  alt=""
                  width={1280}
                  height={960}
                  loading="eager"
                  className="aspect-[4/3] h-full w-full object-cover md:aspect-auto"
                />
              ) : (
                <div
                  className={`flex aspect-[4/3] items-center justify-center md:aspect-auto ${TONE_BG[featured.tone]}`}
                >
                  <div className="h-20 w-20 rounded-md bg-background/40 backdrop-blur-sm" />
                </div>
              )}
              <div className="flex flex-col justify-center p-10 md:p-14">
                <div className="flex flex-wrap items-center gap-4 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="text-orange">{featured.category}</span>
                  <span>{featured.date}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                  <span>{featured.readMinutes} min</span>
                </div>
                <h2 className="mt-6 font-display text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.05] tracking-tight transition-colors group-hover:text-orange">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium underline-offset-4 group-hover:underline">
                  Read manifesto →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Rest */}
      <section>
        <div className="mx-auto max-w-[1100px] px-10 py-20">
          <div className="mb-10 text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            More writing
          </div>
          <ul className="divide-y divide-border">
            {rest.map((p) => (
              <li key={p.slug} className="py-12 first:pt-0 last:pb-0">
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group grid grid-cols-1 items-start gap-10 md:grid-cols-[280px_1fr]"
                >
                  {p.cover ? (
                    <img
                      src={p.cover}
                      alt=""
                      width={560}
                      height={420}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg ${TONE_BG[p.tone]}`}
                    >
                      <div className="h-16 w-16 rounded-md bg-background/30 backdrop-blur-sm" />
                    </div>
                  )}
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.18em] text-orange">
                      {p.category}
                    </div>
                    <h2 className="mt-3 font-display text-[26px] font-medium leading-tight tracking-tight transition-colors group-hover:text-orange">
                      {p.title}
                    </h2>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                      {p.excerpt}
                    </p>
                    <div className="mt-6 flex items-center gap-3 text-[13px] text-muted-foreground">
                      <span>{p.author}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      <span>{p.date}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      <span>{p.readMinutes} min</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
