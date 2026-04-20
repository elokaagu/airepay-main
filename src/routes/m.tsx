import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactElement } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/m")({
  head: () => ({
    meta: [
      { title: "Aire · Mobile" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#000000" },
    ],
  }),
  component: MobileLayout,
});

const TABS: {
  to: "/m" | "/m/goals" | "/m/wishlist" | "/m/bond" | "/m/settings";
  label: string;
  end?: boolean;
  icon: (active: boolean) => ReactElement;
}[] = [
  {
    to: "/m",
    label: "Home",
    end: true,
    icon: () => (
      // Stylized "K" mark, echoes the Revolut R wordmark slot
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <path
          d="M7 4v16M7 12c5 0 8-3 11-8M7 12c5 0 8 3 11 8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/m/goals",
    label: "Goals",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: "/m/wishlist",
    label: "Wishlist",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <path
          d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/m/bond",
    label: "Bond",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <path
          d="M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 12h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/m/settings",
    label: "You",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function MobileLayout() {
  const { session, loading, user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [onboardChecked, setOnboardChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (loading || !session) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      const onboarded = data?.onboarded ?? false;
      setNeedsOnboarding(!onboarded);
      setOnboardChecked(true);
      if (!onboarded && window.location.pathname !== "/app/onboarding") {
        navigate({ to: "/app/onboarding" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session?.user.id, navigate]);

  if (loading || !session || !onboardChecked || needsOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-[13px] text-white/60">
        Loading…
      </div>
    );
  }

  const isActive = (to: string, end?: boolean) =>
    end ? path === to : path === to || path.startsWith(to + "/");

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-[480px] flex-col bg-black text-white">
      {/* Top bar — avatar · search · stats · card */}
      <header className="sticky top-0 z-30 flex items-center gap-2.5 bg-black/90 px-4 pb-3 pt-3 backdrop-blur-md">
        <Link
          to="/m/settings"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[14px] font-semibold text-white"
        >
          {initial}
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-black" />
        </Link>

        <Link
          to="/m/simulator"
          className="flex h-11 flex-1 items-center gap-2 rounded-full bg-white/10 px-4 text-left text-[14px] text-white/60"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Search
        </Link>

        <Link
          to="/m/simulator"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
          aria-label="Compare scenarios"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
            <path
              d="M5 20V10M12 20V4M19 20v-7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        <Link
          to="/app"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
          aria-label="Desktop view"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
            <rect
              x="3"
              y="6"
              width="18"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </Link>
      </header>

      {/* Scrollable main */}
      <main className="flex-1 overflow-y-auto pb-[calc(110px+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      {/* Floating pill bottom tab bar */}
      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] justify-center px-3"
        style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
      >
        <ul className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.07] p-1.5 backdrop-blur-2xl">
          {TABS.map((t) => {
            const active = isActive(t.to, t.end);
            const showDot = false;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={[
                    "relative flex flex-col items-center justify-center gap-[2px] rounded-full px-3.5 py-2 transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/85",
                  ].join(" ")}
                >
                  {showDot && !active && (
                    <span className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                  )}
                  {t.icon(active)}
                  <span className="text-[10px] font-semibold leading-none tracking-tight">
                    {t.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
