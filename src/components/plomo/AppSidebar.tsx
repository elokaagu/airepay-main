import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "./theme-provider";

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: "/app", label: "Home", end: true },
  { to: "/app/goals", label: "Goals" },
  { to: "/app/wishlist", label: "Wishlist" },
  { to: "/app/bond", label: "Bond" },
  { to: "/app/simulator", label: "Compare" },
  { to: "/app/yield", label: "Earn" },
  { to: "/app/marketplace", label: "Connect apps" },
  { to: "/app/settings", label: "Settings" },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, end?: boolean) =>
    end ? path === to : path === to || path.startsWith(to + "/");

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col self-start border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-7 pb-7 pt-8">
        <Link to="/" className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path
              d="M5 4 L5 20 M5 4 C 12 4 18 7 18 12 C 18 17 12 20 5 20"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[18px] font-medium tracking-tight">Aire</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV.map((n) => {
          const active = isActive(n.to, n.end);
          return (
            <Link
              key={n.to}
              to={n.to as "/app"}
              className={[
                "block rounded-md px-3 py-2 text-[14px] transition-colors",
                active
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              ].join(" ")}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-background p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-[13px] font-medium text-primary-foreground">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] text-foreground">
              {user?.email}
            </div>
            <button
              onClick={signOut}
              className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
