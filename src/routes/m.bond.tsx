import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  acceptInviteByToken,
  combinedDaysSaved,
  createBondInvite,
  endBond,
  getActiveBond,
  listBondGoals,
  listInviteForBond,
  listSharedGoals,
  shareGoal,
  unshareGoal,
  type Bond,
  type BondInvite,
  type BondSharedGoal,
} from "@/lib/bond-api";
import { listGoals, type Goal } from "@/lib/goals-api";

export const Route = createFileRoute("/m/bond")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: MobileBondPage,
});

function MobileBondPage() {
  const { user } = useAuth();
  const search = useSearch<{ token?: string }>({ from: "/m/bond" });
  const [bond, setBond] = useState<Bond | null>(null);
  const [invite, setInvite] = useState<BondInvite | null>(null);
  const [myGoals, setMyGoals] = useState<Goal[]>([]);
  const [partnerGoals, setPartnerGoals] = useState<Goal[]>([]);
  const [shared, setShared] = useState<BondSharedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = async () => {
    const b = await getActiveBond();
    setBond(b);
    const goals = await listGoals();
    setMyGoals(goals.filter((g) => g.user_id === user?.id));
    if (b) {
      const [inv, sg, all] = await Promise.all([
        listInviteForBond(b.id),
        listSharedGoals(b.id),
        listBondGoals(b.id),
      ]);
      setInvite(inv);
      setShared(sg);
      setPartnerGoals(all.filter((g) => g.user_id !== user?.id));
    } else {
      setInvite(null);
      setShared([]);
      setPartnerGoals([]);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!search.token || !user) return;
    (async () => {
      try {
        await acceptInviteByToken(search.token!);
        setMsg("Bond accepted ✦");
        await refresh();
      } catch (e: any) {
        setMsg(e?.message ?? "Could not accept invite");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.token, user?.id]);

  const sharedIds = useMemo(() => new Set(shared.map((s) => s.goal_id)), [shared]);

  if (loading) {
    return <div className="p-6 text-[13px] text-white/60">Loading…</div>;
  }

  return (
    <div className="px-4 pt-2">
      <h1 className="mb-1 text-[28px] font-semibold tracking-tight">Bond</h1>
      <p className="mb-5 text-[13px] text-white/60">
        Share goals with a partner. Income & expenses stay private.
      </p>

      {msg && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-[13px]">
          {msg}
        </div>
      )}

      {!bond && (
        <MobileInviteForm
          busy={busy}
          onSubmit={async (email, label) => {
            if (!user) return;
            setBusy(true);
            try {
              await createBondInvite(user.id, email, label);
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {bond && bond.status === "pending" && invite && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-1 text-[15px] font-semibold">
            Invite sent to {bond.partner_label || bond.partner_email}
          </div>
          <p className="mb-3 text-[12px] text-white/60">
            Share this link. They'll sign in with{" "}
            <span className="text-white">{bond.partner_email}</span>.
          </p>
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-black/40 p-2">
            <code className="flex-1 truncate font-mono text-[11px] text-white/70">
              {`${window.location.origin}/m/bond?token=${invite.token}`}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/m/bond?token=${invite.token}`,
                );
                setMsg("Link copied");
              }}
              className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black"
            >
              Copy
            </button>
          </div>
          <button
            onClick={async () => {
              setBusy(true);
              try {
                await endBond(bond.id);
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
            className="text-[11px] uppercase tracking-wider text-white/50"
          >
            Cancel invite
          </button>
        </div>
      )}

      {bond && bond.status === "active" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/50">
              Bonded with
            </div>
            <div className="text-[17px] font-semibold">
              {bond.partner_label || bond.partner_email}
            </div>
          </div>

          {/* Combined view */}
          {(() => {
            const sharedMy = myGoals.filter((g) => sharedIds.has(g.id));
            const sharedPartner = partnerGoals.filter((g) => sharedIds.has(g.id));
            const pairings = sharedMy.map((mine) => {
              const partner = sharedPartner.find(
                (p) =>
                  p.label.trim().toLowerCase() === mine.label.trim().toLowerCase(),
              );
              const calc = combinedDaysSaved(
                mine.target,
                mine.current_amount + (partner?.current_amount ?? 0),
                mine.monthly,
                partner?.monthly ?? 0,
              );
              return { mine, partner, ...calc };
            });
            if (pairings.length === 0) return null;
            return (
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-white/50">
                  Together
                </div>
                {pairings.map((p) => (
                  <div
                    key={p.mine.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="text-[15px] font-semibold">{p.mine.label}</div>
                    <div className="mb-3 text-[12px] text-white/60">
                      ${(p.mine.current_amount + (p.partner?.current_amount ?? 0)).toLocaleString()} / ${p.mine.target.toLocaleString()}
                    </div>
                    {p.partner ? (
                      <>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-white/60">Solo</span>
                          <span>{p.soloDays} days</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-white/60">Together</span>
                          <span>{p.bondedDays} days</span>
                        </div>
                        <div className="mt-2 rounded-xl bg-[#ef4444]/10 px-3 py-2 text-[12px] text-[#ff8a8a]">
                          ✦ {p.daysSaved} days saved together
                        </div>
                      </>
                    ) : (
                      <div className="text-[12px] text-white/50">
                        Partner hasn't matched this goal yet.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wider text-white/50">
              Your goals
            </div>
            <div className="space-y-2">
              {myGoals.map((g) => {
                const isShared = sharedIds.has(g.id);
                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div>
                      <div className="text-[14px]">{g.label}</div>
                      <div className="text-[11px] text-white/50">
                        ${g.current_amount.toLocaleString()} / ${g.target.toLocaleString()}
                      </div>
                    </div>
                    <button
                      disabled={busy}
                      onClick={async () => {
                        if (!user) return;
                        setBusy(true);
                        try {
                          if (isShared) await unshareGoal(bond.id, g.id);
                          else await shareGoal(bond.id, g.id, user.id);
                          await refresh();
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className={[
                        "rounded-full px-3.5 py-1.5 text-[11px] font-semibold",
                        isShared
                          ? "border border-white/20 text-white/70"
                          : "bg-white text-black",
                      ].join(" ")}
                    >
                      {isShared ? "Shared" : "Share"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={async () => {
              if (!confirm("End this bond?")) return;
              setBusy(true);
              try {
                await endBond(bond.id);
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
            className="mt-4 text-[11px] uppercase tracking-wider text-white/40"
          >
            End bond
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/m" className="text-[12px] text-white/40">
          Back to home
        </Link>
      </div>
    </div>
  );
}

function MobileInviteForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (email: string, label?: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim()) return;
        onSubmit(email.trim(), label.trim() || undefined);
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
    >
      <div className="mb-3 text-[15px] font-semibold">Invite a partner</div>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="partner@example.com"
        className="mb-2 w-full rounded-xl bg-black/40 px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/30"
      />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Nickname (optional)"
        className="mb-4 w-full rounded-xl bg-black/40 px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/30"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-white py-3 text-[14px] font-semibold text-black disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create invite"}
      </button>
    </form>
  );
}
