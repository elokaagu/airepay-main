import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listGoals, type Goal } from "@/lib/goals-api";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/m/yield")({
  component: MobileYield,
});

type Venue = {
  id: "aave" | "hyperliquid" | "hysa";
  name: string;
  short: string;
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
    short: "Aave",
    apr: 9.1,
    riskLabel: "Lower",
    riskBlurb:
      "Lend digital dollars on a popular crypto app. Higher reward than a bank, but not bank-protected.",
    mechanism: "Lending",
    defi: true,
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid — pro vault",
    short: "Hyperliquid",
    apr: 14.2,
    riskLabel: "Medium",
    riskBlurb:
      "A pro trading vault that aims for high returns. The rate is bigger but the balance can dip.",
    mechanism: "Pro vault",
    defi: true,
  },
  {
    id: "hysa",
    name: "High-yield savings",
    short: "Bank HYSA",
    apr: 4.5,
    riskLabel: "None",
    riskBlurb:
      "A normal high-yield savings account. Bank-protected up to $250k. Lower rate, zero crypto risk.",
    mechanism: "Bank",
    defi: false,
  },
];

function MobileYield() {
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
      <div className="px-5 py-6 text-[13px] text-white/55">Loading…</div>
    );
  }

  return (
    <div className="px-4 pb-6 text-white">
      {/* Hero — earning */}
      <section className="pb-5 pt-6 text-center">
        <div className="text-[13px] font-medium text-white/70">
          Currently earning
        </div>
        <div className="mt-2 flex items-end justify-center">
          <span
            className="font-display text-[64px] font-extrabold leading-none tracking-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            ${Math.floor(inEngine).toLocaleString()}
          </span>
          <span className="mb-2 ml-0.5 text-[20px] font-semibold text-white/80">
            .{(inEngine % 1).toFixed(2).slice(2)}
          </span>
        </div>
        <div className="mt-2 text-[12px] text-white/45">
          ${headroom.toLocaleString()} room left under your safety cap
        </div>
      </section>

      {/* Safety cap card */}
      <section className="rounded-2xl bg-white/[0.06] p-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Safety cap
          </span>
          <span className="text-[11px] text-white/55 tabular-nums">
            {saturnCapPct}% of {houseFund?.label ?? "big goal"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Goal" value={`$${houseAmount.toLocaleString()}`} />
          <Stat label="Cap" value={`$${ceiling.toLocaleString()}`} />
          <Stat label="Earning" value={`$${inEngine.toLocaleString()}`} />
        </div>
        <div className="mt-4 h-[8px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-700"
            style={{ width: `${used * 100}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-white/45">
          {Math.round(used * 100)}% used
        </div>
      </section>

      {/* Venues */}
      <section className="mt-6">
        <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wider text-white/50">
          Where to park your cash
        </h2>
        <div className="mt-3 space-y-2.5">
          {VENUES.map((v) => {
            const blocked = v.defi && headroom <= 0;
            return (
              <article
                key={v.id}
                className="rounded-2xl bg-white/[0.06] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                        {v.mechanism}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-[1px] text-[9px] font-semibold uppercase tracking-wider">
                        {v.riskLabel} risk
                      </span>
                    </div>
                    <h3 className="mt-1 text-[16px] font-semibold tracking-tight">
                      {v.short}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[28px] font-extrabold leading-none tabular-nums">
                      {v.apr.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-[10px] text-white/45">a year</div>
                  </div>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-white/55">
                  {v.riskBlurb}
                </p>
                <button
                  onClick={() => setInstructionFor(v)}
                  disabled={blocked}
                  className={[
                    "mt-4 w-full rounded-full py-3.5 text-[14px] font-semibold active:scale-[0.98]",
                    blocked
                      ? "cursor-not-allowed bg-white/[0.06] text-white/40"
                      : "bg-white text-black",
                  ].join(" ")}
                >
                  {blocked ? "Safety cap reached" : "Show me how"}
                </button>
              </article>
            );
          })}
        </div>
        <p className="mt-4 px-1 text-[11px] text-white/40">
          Rates are examples. Aire gives the steps — you make the move
          yourself.
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
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div className="mt-1 font-display text-[16px] font-bold tabular-nums">
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
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-[#111] text-white shadow-2xl animate-in slide-in-from-bottom duration-300"
        role="dialog"
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-white/15" />
        </div>
        <div className="flex items-start justify-between px-5 pb-3 pt-3">
          <div className="min-w-0 pr-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              You stay in control
            </div>
            <h2 className="mt-1 line-clamp-2 text-[18px] font-semibold tracking-tight">
              {venue.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
          <div className="rounded-2xl bg-white/[0.06] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
              How much to move
            </div>
            <div className="mt-1 font-display text-[36px] font-extrabold tabular-nums">
              ${amount.toLocaleString()}
            </div>
            {venue.defi && (
              <div className="text-[11px] text-white/45">
                ${headroom.toLocaleString()} room left under the cap
              </div>
            )}
            <input
              type="range"
              min={100}
              max={Math.max(100, venue.defi ? headroom : 10000)}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 h-6 w-full accent-white"
            />
          </div>

          <div>
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Step-by-step
            </div>
            <ol className="mt-2 space-y-2">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-2xl bg-white/[0.06] p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-white/[0.06] p-4 text-[12px] leading-relaxed text-white/60">
            <strong className="text-white">A heads-up.</strong>{" "}
            {venue.defi
              ? "Crypto apps can lose value or have bugs. Aire only shows the steps — your money never passes through us."
              : "Bank rates change. Double-check the current rate before moving money."}
          </div>
        </div>

        <div
          className="border-t border-white/5 px-5 py-4"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={onClose}
            className="w-full rounded-full bg-white py-3.5 text-[14px] font-semibold text-black"
          >
            Got it
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
      `Aire will spot the new balance the next time it syncs.`,
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
