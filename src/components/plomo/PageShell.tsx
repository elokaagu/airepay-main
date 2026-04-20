import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  bannerSrc,
  bannerAlt,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: string;
  bannerSrc?: string;
  bannerAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {bannerSrc ? (
        <>
          <img
            src={bannerSrc}
            alt={bannerAlt ?? ""}
            width={1920}
            height={800}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70 dark:opacity-25"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"
          />
        </>
      ) : (
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(700px_circle_at_30%_50%,white,transparent)]",
            "fill-foreground/10",
          )}
        />
      )}
      <div className="relative mx-auto max-w-[1500px] px-10 pb-24 pt-20 lg:pt-28">
        <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
          {eyebrow}
        </div>
        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.25rem,5vw,4.25rem)] font-medium leading-[1.04] tracking-tight">
          {title}
        </h1>
        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {lede}
        </p>
      </div>
    </section>
  );
}
