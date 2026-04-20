import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/plomo/PageShell";
import manifestoCover from "@/assets/manifesto-cover.jpg";
import { POSTS } from "@/lib/posts";

import { BlurImage } from "@/components/plomo/BlurImage";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Notes from the Aire team" },
      {
        name: "description",
        content:
          "Short reads on goals, trade-offs, earning more on savings, and building a money helper you can actually trust.",
      },
      { property: "og:title", content: "Resources — Aire" },
      {
        property: "og:description",
        content:
          "How we think about goals, money, and building a helper worth trusting with the things that matter.",
      },
    ],
  }),
  component: ResourcesPage,
});

const FEATURED_POST = POSTS.find((p) => p.manifesto) ?? POSTS[0];
const OTHER_POSTS = POSTS.filter((p) => p.slug !== FEATURED_POST.slug);


function ResourcesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Resources"
        title={
          <>
            Notes from the team building{" "}
            <span className="text-orange">a money helper you can trust.</span>
          </>
        }
        lede="Short reads on goals, trade-offs, and the boring-but-important work of keeping your money moving in the right direction."
      />

      <section>
        <div className="mx-auto max-w-[1500px] px-10 py-24">
          {/* Featured */}
          <Link
            to="/blog/$slug"
            params={{ slug: FEATURED_POST.slug }}
            className="group block overflow-hidden rounded-2xl border border-border-strong bg-surface transition-colors hover:border-orange"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <BlurImage
                  src={FEATURED_POST.cover ?? manifestoCover.src}
                  alt={`${FEATURED_POST.title} — cover`}
                  width={1280}
                  height={960}
                  aspect="aspect-[4/3] lg:aspect-auto lg:h-full"
                  wrapperClassName="rounded-none"
                  className="transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col justify-center gap-6 p-10 lg:col-span-7">
                <div className="flex items-center gap-4 text-[12px] uppercase tracking-wider">
                  <span className="text-orange">{FEATURED_POST.category}</span>
                  <span className="text-muted-foreground">{FEATURED_POST.date}</span>
                  <span className="text-muted-foreground">· {FEATURED_POST.readMinutes} min</span>
                </div>
                <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.08] tracking-tight transition-colors group-hover:text-orange">
                  {FEATURED_POST.title}
                </h2>
                <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {FEATURED_POST.excerpt}
                </p>
                <span className="text-[13px] text-foreground">
                  Read it →
                </span>
              </div>
            </div>
          </Link>

          {/* Grid */}
          <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {OTHER_POSTS.map((a) => (
              <Link
                key={a.slug}
                to="/blog/$slug"
                params={{ slug: a.slug }}
                className="group flex h-full flex-col justify-between bg-background p-8 transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider">
                  <span className="text-orange">{a.category}</span>
                  <span className="text-muted-foreground">{a.date}</span>
                </div>
                <h3 className="mt-16 font-display text-[20px] font-medium leading-snug tracking-tight transition-colors group-hover:text-orange">
                  {a.title}
                </h3>
                <div className="mt-6 text-[12px] text-muted-foreground">
                  {a.readMinutes} min read
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
