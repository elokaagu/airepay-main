import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/plomo/theme-provider";

export const Route = createFileRoute("/m/settings")({
  component: MobileSettings,
});

type TrustMode = "pilot" | "copilot" | "auto";

const TRUST_MODES: { id: TrustMode; label: string; blurb: string }[] = [
  {
    id: "pilot",
    label: "Ask me first",
    blurb: "Aire suggests every move. You approve before anything happens.",
  },
  {
    id: "copilot",
    label: "Run my rules",
    blurb:
      "Aire handles pre-approved moves and asks for the rest. Unlocks after 10 accepted suggestions.",
  },
  {
    id: "auto",
    label: "Take the wheel",
    blurb:
      "Aire acts on its own — but only inside your safety cap. Unlocks after 30 days on Run my rules.",
  },
];

function MobileSettings() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
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

  const initial = (displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="px-4 pb-6 text-white">
      {/* Profile hero */}
      <section className="flex flex-col items-center pb-6 pt-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-[30px] font-bold">
          {initial}
        </div>
        <div className="mt-3 text-[18px] font-semibold tracking-tight">
          {displayName || "Hi there"}
        </div>
        <div className="text-[12px] text-white/45">{user?.email}</div>
      </section>

      {/* Identity */}
      <section className="space-y-2.5">
        <Field label="Your name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="block w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none ring-1 ring-transparent focus:ring-white/30"
          />
        </Field>
      </section>

      {/* Appearance */}
      <section className="mt-3 rounded-2xl bg-white/[0.06] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
              Appearance
            </div>
            <div className="mt-1 text-[16px] font-semibold tracking-tight">
              {theme === "dark" ? "Dark" : "Light"} mode
            </div>
          </div>
          <button
            onClick={toggle}
            className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold"
          >
            Switch
          </button>
        </div>
      </section>

      {/* Safety cap */}
      <section className="mt-3 rounded-2xl bg-white/[0.06] p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Safety cap
            </div>
            <h2 className="mt-1 text-[15px] font-semibold tracking-tight">
              How much can earn extra interest?
            </h2>
          </div>
          <span className="font-display text-[26px] font-bold tabular-nums">
            {saturnCap}%
          </span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/55">
          The most we'll suggest moving into higher-paying crypto. Hard limit
          is 40%.
        </p>
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={saturnCap}
          onChange={(e) => setSaturnCap(Number(e.target.value))}
          className="mt-4 h-6 w-full accent-white"
        />
        <div className="mt-1 flex justify-between text-[10px] text-white/45 tabular-nums">
          <span>0%</span>
          <span>20% · default</span>
          <span>40% · max</span>
        </div>
      </section>

      {/* Trust mode */}
      <section className="mt-6">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          How much can Aire do on its own?
        </div>
        <div className="mt-3 space-y-2.5">
          {TRUST_MODES.map((m) => {
            const active = trustMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setTrustMode(m.id)}
                className={[
                  "block w-full rounded-2xl p-5 text-left transition-colors",
                  active ? "bg-white text-black" : "bg-white/[0.06] text-white",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold tracking-tight">
                    {m.label}
                  </span>
                  <span
                    className={[
                      "h-3 w-3 rounded-full",
                      active ? "bg-black" : "bg-white/20",
                    ].join(" ")}
                  />
                </div>
                <p
                  className={[
                    "mt-2 text-[12px] leading-relaxed",
                    active ? "text-black/60" : "text-white/55",
                  ].join(" ")}
                >
                  {m.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={save}
        disabled={busy}
        className="mt-5 w-full rounded-full bg-white py-3.5 text-[14px] font-semibold text-black active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
      {msg && (
        <div className="mt-3 text-center text-[12px] text-white/55">{msg}</div>
      )}

      <button
        onClick={signOut}
        className="mt-8 w-full rounded-full bg-white/[0.06] py-3.5 text-[14px] font-semibold text-[#ef4444]"
      >
        Sign out
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="px-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
