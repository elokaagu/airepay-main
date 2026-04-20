import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "signup" || search.mode === "magic"
      ? search.mode
      : "password") as Mode,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Aire" },
      { name: "description", content: "Sign in to your Aire account." },
    ],
  }),
  component: AuthPage,
});

type Mode = "password" | "magic" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { mode: initialMode } = Route.useSearch() as { mode: Mode };
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/app" });
  }, [loading, session, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        setMsg("Check your inbox for a sign-in link.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        setMsg("Account created. Check your email to confirm, then sign in.");
        setMode("password");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : "Something went wrong.";
      setErr(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
      <Link
        to="/"
        className="absolute left-8 top-7 flex items-center gap-2 text-foreground"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M5 4 L5 20 M5 4 C 12 4 18 7 18 12 C 18 17 12 20 5 20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[16px] font-medium tracking-tight">aire</span>
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
          {mode === "signup" ? "Create account" : "Sign in"}
        </div>
        <h1 className="mt-4 font-display text-[36px] font-medium leading-tight tracking-tight">
          {mode === "signup"
            ? "Set up your Aire."
            : "Welcome back."}
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          {mode === "magic"
            ? "We'll email you a one-time link."
            : "Use a password, or sign in with a one-time email link."}
        </p>

        <form onSubmit={submit} className="mt-10 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="mt-2 block w-full rounded-md border border-border-strong bg-background px-4 py-3 text-[14px] outline-none focus:border-orange"
            />
          </div>

          {mode !== "magic" && (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 block w-full rounded-md border border-border-strong bg-background px-4 py-3 text-[14px] outline-none focus:border-orange"
              />
            </div>
          )}

          {err && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
              {err}
            </div>
          )}
          {msg && (
            <div className="rounded-md border border-border-strong bg-surface px-4 py-3 text-[13px] text-foreground">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-orange px-7 py-3.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy
              ? "…"
              : mode === "magic"
                ? "Email me a link"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-[12px] text-muted-foreground">
          <button
            onClick={() => {
              setErr(null);
              setMsg(null);
              setMode(mode === "magic" ? "password" : "magic");
            }}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {mode === "magic" ? "Use password instead" : "Email me a link"}
          </button>
          <button
            onClick={() => {
              setErr(null);
              setMsg(null);
              setMode(mode === "signup" ? "password" : "signup");
            }}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {mode === "signup" ? "I already have an account" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
