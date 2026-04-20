import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative bg-surface">
      <div className="mx-auto max-w-[1500px] px-10 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <h3 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.05] tracking-tight">
              <span className="text-orange">Stop juggling apps.</span> Start
              getting there.
            </h3>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mt-10 inline-block rounded-md bg-orange px-7 py-3.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get early access
            </Link>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
              What it does
            </div>
            <ul className="mt-4 space-y-3 text-[14px]">
              <li>Plans your goals</li>
              <li>Shows what each choice costs</li>
              <li>Keeps your savings safe</li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
              Coming soon
            </div>
            <ul className="mt-4 space-y-3 text-[14px] text-muted-foreground">
              <li>Smart tax help</li>
              <li>Credit score tips</li>
              <li>Group savings</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-10 py-6 text-[12px] text-muted-foreground">
          <span>© 2026 Aire · Money that works for you</span>
          <span>Built for real life</span>
        </div>
      </div>
    </footer>
  );
}
