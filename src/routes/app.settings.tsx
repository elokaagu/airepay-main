import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

type TrustMode = "pilot" | "copilot" | "auto";

const TRUST_MODES: { id: TrustMode; label: string; blurb: string }[] = [
  {
    id: "pilot",
    label: "Ask me first",
    blurb:
      "Aire suggests every move. You approve before anything happens. This is the default.",
  },
  {
    id: "copilot",
    label: "Run my rules",
    blurb:
      "Aire handles the moves you've already pre-approved, and asks for the rest. Unlocks after you accept 10 of Aire's suggestions.",
  },
  {
    id: "auto",
    label: "Take the wheel",
    blurb:
      "Aire acts on its own — but only inside your safety cap — and tells you what it did. Unlocks after 30 days on Run my rules.",
  },
];

function SettingsPage() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saturnCap, setSaturnCap] = useState<number>(20);
  const [trustMode, setTrustMode] = useState<TrustMode>("pilot");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, saturn_cap_pct, trust_mode")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? "");
        setSaturnCap(
          typeof data?.saturn_cap_pct === "number" ? data.saturn_cap_pct : 20,
        );
        setTrustMode(((data?.trust_mode as TrustMode) ?? "pilot"));
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        saturn_cap_pct: saturnCap,
        trust_mode: trustMode,
      })
      .eq("id", user.id);
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Saved.");
  };

  return (
    <div className="px-10 py-10">
      <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
        Settings
      </div>
      <h1 className="mt-3 font-display text-[32px] font-medium tracking-tight">
        Your account.
      </h1>

      <div className="mt-10 max-w-[640px] space-y-10">
        {/* Identity */}
        <section className="space-y-6">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <div className="mt-2 rounded-md border border-border bg-surface px-4 py-3 text-[14px] text-muted-foreground">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Your name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2 block w-full rounded-md border border-border-strong bg-background px-4 py-3 text-[14px] outline-none focus:border-orange"
            />
          </div>
        </section>

        {/* Safety cap */}
        <section className="rounded-2xl border border-border-strong bg-surface p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-orange">
                Safety cap
              </div>
              <h2 className="mt-2 font-display text-[20px] font-medium tracking-tight">
                How much of your big goal can earn extra interest?
              </h2>
            </div>
            <span className="font-display text-[28px] font-medium tabular-nums">
              {saturnCap}%
            </span>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            The most we'll ever suggest moving into higher-paying crypto
            options. The hard limit is 40%, no matter what — so the bulk of
            your goal stays safely in your bank.
          </p>

          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={saturnCap}
            onChange={(e) => setSaturnCap(Number(e.target.value))}
            className="mt-6 w-full accent-orange"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>0%</span>
            <span>20% · default</span>
            <span>40% · max</span>
          </div>
        </section>

        {/* Trust Mode */}
        <section>
          <div className="text-[11px] uppercase tracking-[0.2em] text-orange">
            How Aire works for you
          </div>
          <h2 className="mt-2 font-display text-[20px] font-medium tracking-tight">
            How much can Aire do on its own?
          </h2>

          <div className="mt-5 space-y-3">
            {TRUST_MODES.map((m) => {
              const active = trustMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTrustMode(m.id)}
                  className={[
                    "block w-full rounded-xl border p-5 text-left transition-colors",
                    active
                      ? "border-orange bg-surface"
                      : "border-border-strong hover:border-orange/40",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[16px] font-medium tracking-tight">
                      {m.label}
                    </span>
                    <span
                      className={[
                        "h-3 w-3 rounded-full",
                        active ? "bg-orange" : "bg-surface-2",
                      ].join(" ")}
                    />
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {m.blurb}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
          {msg && (
            <span className="text-[12px] text-muted-foreground">{msg}</span>
          )}
        </div>

        <div className="border-t border-border pt-8">
          <button
            onClick={signOut}
            className="text-[13px] text-muted-foreground hover:text-destructive"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
