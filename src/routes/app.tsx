import {
  createFileRoute,
  Outlet,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/plomo/AppSidebar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "Aire · Engine" }],
  }),
  component: AppLayout,
});

function AppLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [onboardChecked, setOnboardChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  // Check onboarding once per session — not on every route change
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
    // Only depend on the user id, not the whole session object
  }, [loading, session?.user.id, navigate]);

  if (loading || !session || !onboardChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-[13px] text-muted-foreground">
        Loading…
      </div>
    );
  }

  // During onboarding, render full-bleed (no sidebar)
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}

// Re-export so children share access if needed
export { redirect };
