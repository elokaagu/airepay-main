import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listGoals, type Goal } from "@/lib/goals-api";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/yield")({
  component: YieldPage,
});

type Venue = {
  id: "aave" | "hyperliquid" | "hysa";
  name: string;
  asset: string;
  apr: number;
  riskLabel: string;
  riskBlurb: string;
  mechanism: string;
  defi: boolean;
};

const VENUES: Venue[] = [
  {
    id: "aave",
    name: "Aave — earn on dollars",
    asset: "USDC",
    apr: 9.1,
    riskLabel: "Lower",
    riskBlurb:
      "Lend out digital dollars on a popular crypto app. Higher reward than a bank, but it's not bank-protected — your money sits in software.",
    mechanism: "Lending",
    defi: true,
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid — pro vault",
    asset: "USDC",
    apr: 14.2,
    riskLabel: "Medium",
    riskBlurb:
      "A pro trading vault that aims for high returns. The rate is bigger, but the balance can dip in bad weeks.",
    mechanism: "Pro vault",
    defi: true,
  },
  {
    id: "hysa",
    name: "High-yield savings (safe option)",
    asset: "USD",
    apr: 4.5,
    riskLabel: "None",
    riskBlurb:
      "A normal high-yield savings account. Bank-protected up to $250k. Lower rate, zero crypto risk.",
    mechanism: "Bank account",
    defi: false,
  },
];

function YieldPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saturnCapPct, setSaturnCapPct] = useState<number>(20);
  const [instructionFor, setInstructionFor] = useState<Venue | null>(null);

  useEffect(() => {
    listGoals().then((g) => {
      setGoals(g);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("saturn_cap_pct")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (typeof data?.saturn_cap_pct === "number") {
          setSaturnCapPct(data.saturn_cap_pct);
        }
      });
  }, [user]);

  const houseFund = useMemo(
    () =>
      goals.find((g) => g.is_north_star) ??
      goals.find((g) => g.priority === "P1"),
    [goals],
  );

  const houseAmount = Number(houseFund?.current_amount ?? 0);
  const ceiling = Math.round((houseAmount * saturnCapPct) / 100);
  const inEngine = Number(
    goals.find((g) => g.priority === "Engine")?.current_amount ?? 0,
  );
  const headroom = Math.max(0, ceiling - inEngine);
  const used = ceiling > 0 ? Math.min(1, inEngine / ceiling) : 0;

  if (loading) {
    return (
      <div className="px-10 py-10 text-[13px] text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="px-10 py-10">
      <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
        Earn
      </div>
      <h1 className="mt-3 font-display text-[32px] font-medium tracking-tight">
        Put idle savings to work, safely.
      </h1>
      <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
        Aire compares the best places to park your cash — from regular
        high-yield savings to higher-paying crypto options. You decide where
        it goes; Aire never moves money for you.
      </p>

      {/* Safety cap */}
      <section className="mt-12 rounded-2xl border border-border-strong bg-surface p-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.2em] text-orange">
            Safety cap · live
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {saturnCapPct}% of {houseFund?.label ?? "your big goal"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-8">
          <Stat label="Big-goal balance" value={`$${houseAmount.toLocaleString()}`} />
          <Stat label="Safety cap" value={`$${ceiling.toLocaleString()}`} />
          <Stat
            label="Already earning"
            value={`$${inEngine.toLocaleString()}`}
          />
        </div>

        <div className="mt-6 h-[8px] w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-orange transition-[width] duration-700"
            style={{ width: `${used * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>
            {Math.round(used * 100)}% of cap used · ${headroom.toLocaleString()} room left
          </span>
          <a
            href="/app/settings"
            className="text-[12px] text-muted-foreground underline-offset-4 hover:text-orange hover:underline"
          >
            Change cap →
          </a>
        </div>
      </section>

      {/* Venue cards */}
      <section className="mt-12">
        <h2 className="font-display text-[22px] font-medium tracking-tight">
          Where to park your cash
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {VENUES.map((v) => {
            const blocked = v.defi && headroom <= 0;
            return (
              <article
                key={v.id}
                className="flex flex-col rounded-2xl border border-border-strong bg-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-orange">
                    {v.mechanism}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {v.riskLabel} risk
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[18px] font-medium tracking-tight">
                  {v.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-[36px] font-medium tabular-nums">
                    {v.apr.toFixed(1)}%
                  </span>
                  <span className="text-[12px] text-muted-foreground">a year</span>
                </div>
                <p className="mt-3 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                  {v.riskBlurb}
                </p>
                <button
                  onClick={() => setInstructionFor(v)}
                  disabled={blocked}
                  className={[
                    "mt-5 rounded-md px-4 py-2.5 text-[12px] font-medium transition-colors",
                    blocked
                      ? "cursor-not-allowed border border-border bg-surface-2 text-muted-foreground"
                      : "bg-orange text-primary-foreground hover:opacity-90",
                  ].join(" ")}
                >
                  {blocked ? "Safety cap reached" : "Show me how"}
                </button>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">
          Rates shown are examples. Aire gives you a step-by-step guide —
          you make the move yourself. Your money never goes through Aire.
        </p>
      </section>

      {instructionFor && (
        <InstructionSheet
          venue={instructionFor}
          headroom={headroom}
          onClose={() => setInstructionFor(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-[24px] font-medium tabular-nums">
        {value}
      </div>
    </div>
  );
}

function InstructionSheet({
  venue,
  headroom,
  onClose,
}: {
  venue: Venue;
  headroom: number;
  onClose: () => void;
}) {
  const suggested =
    venue.defi && headroom > 0
      ? Math.min(2000, Math.floor(headroom / 100) * 100)
      : 1000;
  const [amount, setAmount] = useState<number>(suggested);

  const steps = buildSteps(venue, amount);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-border-strong bg-background shadow-2xl animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-orange">
              How to do this · you stay in control
            </div>
            <h2 className="mt-2 font-display text-[22px] font-medium tracking-tight">
              {venue.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-8 py-7">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              How much to move
            </label>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-[36px] font-medium tabular-nums">
                ${amount.toLocaleString()}
              </span>
              {venue.defi && (
                <span className="text-[11px] text-muted-foreground">
                  · ${headroom.toLocaleString()} room left under the cap
                </span>
              )}
            </div>
            <input
              type="range"
              min={100}
              max={Math.max(100, venue.defi ? headroom : 10000)}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-4 w-full accent-orange"
            />
          </div>

          <div>
            <h3 className="font-display text-[16px] font-medium tracking-tight">
              Step-by-step
            </h3>
            <ol className="mt-4 space-y-4">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-xl border border-border bg-surface p-4"
                >
                  <span className="font-mono text-[11px] text-orange">
                    0{i + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border-strong bg-surface-2 p-5 text-[12px] leading-relaxed text-muted-foreground">
            <strong className="text-foreground">A heads-up.</strong>{" "}
            {venue.defi
              ? "Crypto apps can lose value or have bugs. Aire only shows you the steps — your money never passes through us, and you do every action yourself."
              : "Bank rates change. Double-check the current rate with your bank before moving money."}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-8 py-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}

function buildSteps(v: Venue, amount: number): string[] {
  const fmt = `$${amount.toLocaleString()}`;
  if (v.id === "aave") {
    return [
      `Open your crypto wallet (like MetaMask or Rabby) and check that you have ${fmt} in USDC on Ethereum.`,
      `Go to app.aave.com and connect your wallet. Make sure you're on the Ethereum network.`,
      `Find the Supply panel, choose USDC, and enter ${fmt}.`,
      `Approve USDC, then confirm the transaction in your wallet.`,
      `Aire will spot the new balance the next time it syncs and add it to your "earning" total.`,
    ];
  }
  if (v.id === "hyperliquid") {
    return [
      `Move ${fmt} of USDC from Arbitrum to Hyperliquid using their bridge at app.hyperliquid.xyz/bridge.`,
      `Open the Hyperliquid app and go to Vaults → HLP.`,
      `Tap Deposit, enter ${fmt}, and review the recent performance chart.`,
      `Confirm the deposit. Note: it takes about 4 days to withdraw if you change your mind.`,
      `Aire will pick up the new balance on the next refresh.`,
    ];
  }
  return [
    `Open your bank app and find your high-yield savings account.`,
    `Start a transfer of ${fmt} from your checking into the savings account.`,
    `Confirm. The money usually arrives in 1–2 business days.`,
    `Aire will spot the new balance through your linked bank.`,
  ];
}
