import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/plomo/PageShell";
import { getPostBySlug, POSTS, TONE_BG } from "@/lib/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Article — Aire" }] };
    return {
      meta: [
        { title: `${post.title} — Aire` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        ...(post.cover
          ? [
              { property: "og:image", content: post.cover },
              { name: "twitter:image", content: post.cover },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-10 py-32 text-center">
        <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
          404
        </div>
        <h1 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight">
          We couldn't find that article.
        </h1>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-[14px] underline-offset-4 hover:underline"
        >
          ← Back to all writing
        </Link>
      </div>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-10 py-32 text-center">
        <h1 className="font-display text-[28px] font-medium tracking-tight">
          Something went wrong.
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">{error.message}</p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-[14px] underline-offset-4 hover:underline"
        >
          ← Back to all writing
        </Link>
      </div>
    </PageShell>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const post = getPostBySlug(slug)!;
  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <PageShell>
      <article>
        {/* Header */}
        <header className="border-b border-border">
          <div className="mx-auto max-w-[820px] px-10 pb-12 pt-20 lg:pt-28">
            <Link
              to="/blog"
              className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              ← All writing
            </Link>
            <div className="mt-10 flex flex-wrap items-center gap-4 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-orange">{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{post.date}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{post.readMinutes} min read</span>
            </div>
            <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.04] tracking-tight">
              {post.title}
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-10 flex items-center gap-3 text-[13px] text-muted-foreground">
              <span className="text-foreground">{post.author}</span>
            </div>
          </div>
        </header>

        {/* Cover */}
        {post.cover ? (
          <div className="mx-auto max-w-[1100px] px-10 pt-12">
            <img
              src={post.cover}
              alt=""
              width={1280}
              height={720}
              loading="eager"
              className="aspect-[16/9] w-full rounded-2xl object-cover"
            />
          </div>
        ) : (
          <div className="mx-auto max-w-[1100px] px-10 pt-12">
            <div
              className={`flex aspect-[16/9] w-full items-center justify-center rounded-2xl ${TONE_BG[post.tone]}`}
            >
              <div className="h-20 w-20 rounded-md bg-background/40 backdrop-blur-sm" />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="mx-auto max-w-[720px] px-10 py-20">
          <div className="space-y-7 text-[17px] leading-[1.75] text-foreground/90">
            {post.body.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="!mt-14 font-display text-[26px] font-medium leading-tight tracking-tight text-foreground"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="!my-10 border-l-2 border-orange pl-6 font-display text-[22px] leading-snug tracking-tight text-foreground"
                  >
                    "{block.text}"
                    {block.cite && (
                      <cite className="mt-3 block text-[13px] not-italic text-muted-foreground">
                        — {block.cite}
                      </cite>
                    )}
                  </blockquote>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="list-disc space-y-3 pl-6">
                    {block.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{block.text}</p>;
            })}
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-[1100px] px-10 py-20">
          <div className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            Keep reading
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block"
              >
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt=""
                    width={640}
                    height={360}
                    loading="lazy"
                    className="aspect-[16/9] w-full rounded-xl object-cover transition-opacity group-hover:opacity-90"
                  />
                ) : (
                  <div
                    className={`flex aspect-[16/9] items-center justify-center rounded-xl ${TONE_BG[p.tone]}`}
                  >
                    <div className="h-14 w-14 rounded-md bg-background/40 backdrop-blur-sm" />
                  </div>
                )}
                <div className="mt-5 text-[12px] uppercase tracking-[0.18em] text-orange">
                  {p.category}
                </div>
                <h3 className="mt-3 font-display text-[22px] font-medium leading-tight tracking-tight transition-colors group-hover:text-orange">
                  {p.title}
                </h3>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  {p.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
