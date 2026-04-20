import { createFileRoute, useSearch } from "@tanstack/react-router";
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

export const Route = createFileRoute("/app/bond")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: BondPage,
});

function BondPage() {
  const { user } = useAuth();
  const search = useSearch<{ token?: string }>({ from: "/app/bond" });
  const [bond, setBond] = useState<Bond | null>(null);
  const [invite, setInvite] = useState<BondInvite | null>(null);
  const [myGoals, setMyGoals] = useState<Goal[]>([]);
  const [partnerGoals, setPartnerGoals] = useState<Goal[]>([]);
  const [shared, setShared] = useState<BondSharedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [acceptMsg, setAcceptMsg] = useState<string | null>(null);

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

  // Accept token from URL
  useEffect(() => {
    if (!search.token || !user) return;
    (async () => {
      try {
        await acceptInviteByToken(search.token!);
        setAcceptMsg("Bond accepted ✦ you're now sharing goals.");
        await refresh();
      } catch (e: any) {
        setAcceptMsg(e?.message ?? "Could not accept invite");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.token, user?.id]);

  if (loading) {
    return (
      <div className="px-8 py-12 text-[13px] text-muted-foreground">
        Loading bond…
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      <header className="mb-8 max-w-2xl">
        <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Bond
        </div>
        <h1 className="text-[34px] font-medium tracking-tight">
          Save with someone you trust.
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Share specific goals with a partner — combined contributions, shared
          progress, no shared income or expenses.
        </p>
      </header>

      {acceptMsg && (
        <div className="mb-6 max-w-2xl rounded-lg border border-orange/40 bg-orange/10 p-4 text-[13px] text-foreground">
          {acceptMsg}
        </div>
      )}

      {!bond && (
        <InviteForm
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
        <PendingInvite
          bond={bond}
          invite={invite}
          onCancel={async () => {
            setBusy(true);
            try {
              await endBond(bond.id);
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {bond && bond.status === "active" && (
        <ActiveBond
          bond={bond}
          myGoals={myGoals}
          partnerGoals={partnerGoals}
          shared={shared}
          busy={busy}
          onShare={async (goalId) => {
            if (!user) return;
            setBusy(true);
            try {
              await shareGoal(bond.id, goalId, user.id);
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
          onUnshare={async (goalId) => {
            setBusy(true);
            try {
              await unshareGoal(bond.id, goalId);
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
          onEnd={async () => {
            if (!confirm("End this bond? Shared goals will become private again.")) return;
            setBusy(true);
            try {
              await endBond(bond.id);
              await refresh();
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </div>
  );
}

function InviteForm({
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
      className="max-w-xl rounded-2xl border border-border bg-surface p-6"
    >
      <div className="mb-1 text-[15px] font-medium">Invite a partner</div>
      <p className="mb-5 text-[13px] text-muted-foreground">
        They'll get a private link. Only goals you both choose to share are visible.
        Income, expenses, and other goals stay private.
      </p>
      <label className="mb-3 block">
        <span className="mb-1 block text-[12px] uppercase tracking-wider text-muted-foreground">
          Their email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[14px] outline-none focus:border-foreground"
          placeholder="partner@example.com"
        />
      </label>
      <label className="mb-5 block">
        <span className="mb-1 block text-[12px] uppercase tracking-wider text-muted-foreground">
          Nickname (optional)
        </span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[14px] outline-none focus:border-foreground"
          placeholder="e.g. Sam"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-foreground px-5 py-2 text-[13px] font-medium text-background disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create invite"}
      </button>
    </form>
  );
}

function PendingInvite({
  bond,
  invite,
  onCancel,
}: {
  bond: Bond;
  invite: BondInvite;
  onCancel: () => void;
}) {
  const link = `${window.location.origin}/app/bond?token=${invite.token}`;
  const [copied, setCopied] = useState(false);
  return (
    <div className="max-w-xl rounded-2xl border border-border bg-surface p-6">
      <div className="mb-1 text-[15px] font-medium">
        Waiting for {bond.partner_label || bond.partner_email}
      </div>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Share this link with them. They'll need to sign in with{" "}
        <span className="text-foreground">{bond.partner_email}</span> to accept.
      </p>
      <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-[12px]">
        <code className="truncate flex-1 font-mono">{link}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="text-[12px] text-muted-foreground">
        Expires {new Date(invite.expires_at).toLocaleDateString()}
      </div>
      <button
        onClick={onCancel}
        className="mt-5 text-[12px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Cancel invite
      </button>
    </div>
  );
}

function ActiveBond({
  bond,
  myGoals,
  partnerGoals,
  shared,
  busy,
  onShare,
  onUnshare,
  onEnd,
}: {
  bond: Bond;
  myGoals: Goal[];
  partnerGoals: Goal[];
  shared: BondSharedGoal[];
  busy: boolean;
  onShare: (goalId: string) => void;
  onUnshare: (goalId: string) => void;
  onEnd: () => void;
}) {
  const sharedIds = useMemo(() => new Set(shared.map((s) => s.goal_id)), [shared]);
  const sharedMy = myGoals.filter((g) => sharedIds.has(g.id));
  const sharedPartner = partnerGoals.filter((g) => sharedIds.has(g.id));

  // Pair my goals with partner goals by label match for combined view
  const pairings = sharedMy.map((mine) => {
    const partner = sharedPartner.find(
      (p) => p.label.trim().toLowerCase() === mine.label.trim().toLowerCase(),
    );
    const calc = combinedDaysSaved(
      mine.target,
      mine.current_amount + (partner?.current_amount ?? 0),
      mine.monthly,
      partner?.monthly ?? 0,
    );
    return { mine, partner, ...calc };
  });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Bonded with
            </div>
            <div className="text-[18px] font-medium">
              {bond.partner_label || bond.partner_email}
            </div>
          </div>
          <button
            onClick={onEnd}
            className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            End bond
          </button>
        </div>
      </div>

      {pairings.length > 0 && (
        <section>
          <h2 className="mb-3 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Combined progress
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pairings.map((p) => (
              <div
                key={p.mine.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="mb-1 text-[15px] font-medium">{p.mine.label}</div>
                <div className="mb-3 text-[12px] text-muted-foreground">
                  ${(p.mine.current_amount + (p.partner?.current_amount ?? 0)).toLocaleString()}
                  {" / "}${p.mine.target.toLocaleString()}
                </div>
                {p.partner ? (
                  <div className="space-y-1 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Solo timeline</span>
                      <span>{p.soloDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Together</span>
                      <span className="text-foreground">{p.bondedDays} days</span>
                    </div>
                    <div className="mt-2 rounded-md bg-orange/10 px-3 py-2 text-[12px] text-orange">
                      ✦ {p.daysSaved} days saved together
                    </div>
                  </div>
                ) : (
                  <div className="text-[12px] text-muted-foreground">
                    Partner hasn't shared a matching goal yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Your goals
        </h2>
        <div className="space-y-2">
          {myGoals.map((g) => {
            const isShared = sharedIds.has(g.id);
            return (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div>
                  <div className="text-[14px]">{g.label}</div>
                  <div className="text-[12px] text-muted-foreground">
                    ${g.current_amount.toLocaleString()} / ${g.target.toLocaleString()}
                  </div>
                </div>
                <button
                  disabled={busy}
                  onClick={() => (isShared ? onUnshare(g.id) : onShare(g.id))}
                  className={[
                    "rounded-full px-4 py-1.5 text-[12px] font-medium",
                    isShared
                      ? "border border-border text-muted-foreground hover:text-foreground"
                      : "bg-foreground text-background",
                  ].join(" ")}
                >
                  {isShared ? "Shared" : "Share"}
                </button>
              </div>
            );
          })}
          {myGoals.length === 0 && (
            <div className="text-[13px] text-muted-foreground">
              You don't have any goals yet.
            </div>
          )}
        </div>
      </section>

      {sharedPartner.length > 0 && (
        <section>
          <h2 className="mb-3 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            {bond.partner_label || "Partner"}'s shared goals
          </h2>
          <div className="space-y-2">
            {sharedPartner.map((g) => (
              <div
                key={g.id}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="text-[14px]">{g.label}</div>
                <div className="text-[12px] text-muted-foreground">
                  ${g.current_amount.toLocaleString()} / ${g.target.toLocaleString()} · ${g.monthly}/mo
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
