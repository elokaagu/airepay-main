import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
  type Goal,
  type GoalPriority,
} from "@/lib/goals-api";

export const Route = createFileRoute("/m/goals")({
  component: MobileGoals,
});

const PRIORITIES: GoalPriority[] = ["P0", "P1", "P2", "Engine"];

function priorityLabel(p: GoalPriority): string {
  switch (p) {
    case "P0":
      return "Must do";
    case "P1":
      return "Big goal";
    case "P2":
      return "Fun money";
    case "Engine":
      return "Earning interest";
  }
}

function priorityEmoji(p: GoalPriority): string {
  switch (p) {
    case "P0":
      return "🛡";
    case "P1":
      return "🎯";
    case "P2":
      return "🎁";
    case "Engine":
      return "⚡";
  }
}

function MobileGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = async () => setGoals(await listGoals());

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const total = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  return (
    <div className="px-4 pb-6 text-white">
      {/* Hero — total saved */}
      <section className="pb-5 pt-6 text-center">
        <div className="text-[13px] font-medium text-white/70">
          Total saved · USD
        </div>
        <div className="mt-2 flex items-end justify-center">
          <span
            className="font-display text-[64px] font-extrabold leading-none tracking-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            ${Math.floor(total).toLocaleString()}
          </span>
          <span className="mb-2 ml-0.5 text-[20px] font-semibold text-white/80">
            .{(total % 1).toFixed(2).slice(2)}
          </span>
        </div>
        <div className="mt-2 text-[12px] text-white/45">
          Across {goals.length} goal{goals.length === 1 ? "" : "s"}
        </div>
      </section>

      {/* Goals list */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="rounded-2xl bg-white/[0.06] p-5 text-[13px] text-white/55">
            Loading…
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-[13px] text-white/55">
            No goals yet. Add your first one.
          </div>
        ) : (
          goals.map((g) => (
            <button
              key={g.id}
              onClick={() => setEditing(g)}
              className="block w-full rounded-2xl bg-white/[0.06] p-5 text-left active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[18px]">
                  {priorityEmoji(g.priority)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                      {priorityLabel(g.priority)}
                    </span>
                    {g.is_north_star && (
                      <span className="rounded-full bg-white/10 px-2 py-[1px] text-[9px] font-semibold uppercase tracking-wider">
                        Big
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-[16px] font-semibold tracking-tight">
                    {g.label}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[18px] font-bold tabular-nums">
                    ${Number(g.current_amount).toLocaleString()}
                  </div>
                  {Number(g.target) > 0 && (
                    <div className="text-[11px] text-white/45 tabular-nums">
                      / ${Number(g.target).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              {Number(g.target) > 0 && (
                <div className="mt-4 h-[5px] w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: `${Math.min(
                        100,
                        (Number(g.current_amount) / Number(g.target)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              )}
              <div className="mt-3 flex justify-between text-[11px] text-white/45">
                <span>${Number(g.monthly).toLocaleString()}/mo</span>
                <span>{g.days_to_goal ?? "—"} days left</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Floating add button (above tab bar) */}
      <button
        onClick={() => setCreating(true)}
        aria-label="New goal"
        className="fixed bottom-[110px] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-2xl active:scale-95"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {(creating || editing) && user && (
        <GoalSheet
          goal={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            await refresh();
            setCreating(false);
            setEditing(null);
          }}
          onDeleted={async () => {
            await refresh();
            setEditing(null);
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}

function GoalSheet({
  goal,
  onClose,
  onSaved,
  onDeleted,
  userId,
}: {
  goal: Goal | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  userId: string;
}) {
  const [label, setLabel] = useState(goal?.label ?? "");
  const [tagline, setTagline] = useState(goal?.tagline ?? "");
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority ?? "P1");
  const [target, setTarget] = useState<number>(Number(goal?.target ?? 0));
  const [current, setCurrent] = useState<number>(
    Number(goal?.current_amount ?? 0),
  );
  const [monthly, setMonthly] = useState<number>(Number(goal?.monthly ?? 0));
  const [days, setDays] = useState<number | "">(goal?.days_to_goal ?? "");
  const [isNorthStar, setIsNorthStar] = useState(goal?.is_north_star ?? false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        label,
        tagline: tagline || null,
        priority,
        target,
        current_amount: current,
        monthly,
        days_to_goal: days === "" ? null : Number(days),
        is_north_star: isNorthStar,
      };
      if (goal) {
        await updateGoal(goal.id, payload);
      } else {
        await createGoal(userId, { ...payload });
      }
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!goal) return;
    if (!confirm(`Delete "${goal.label}"?`)) return;
    await deleteGoal(goal.id);
    onDeleted();
  };

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
        <div className="flex items-center justify-between px-5 pb-3 pt-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              {goal ? "Editing" : "Create"}
            </div>
            <h2 className="mt-1 text-[20px] font-semibold tracking-tight">
              {goal ? "Edit goal" : "New goal"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-5">
          <Field label="Goal">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Down payment"
              className="block w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none ring-1 ring-transparent focus:ring-white/30"
            />
          </Field>
          <Field label="A short reminder (optional)">
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A line that reminds you why"
              className="block w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none ring-1 ring-transparent focus:ring-white/30"
            />
          </Field>
          <Field label="Type">
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={[
                    "rounded-full px-3.5 py-2 text-[12px] font-semibold",
                    priority === p
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/80",
                  ].join(" ")}
                >
                  {priorityLabel(p)}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Saved ($)">
              <NumberField value={current} onChange={setCurrent} />
            </Field>
            <Field label="Target ($)">
              <NumberField value={target} onChange={setTarget} />
            </Field>
            <Field label="Per month ($)">
              <NumberField value={monthly} onChange={setMonthly} />
            </Field>
            <Field label="Days needed">
              <input
                type="number"
                value={days}
                onChange={(e) =>
                  setDays(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="block w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-[15px] tabular-nums outline-none ring-1 ring-transparent focus:ring-white/30"
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3.5 text-[14px]">
            <input
              type="checkbox"
              checked={isNorthStar}
              onChange={(e) => setIsNorthStar(e.target.checked)}
              className="h-5 w-5 rounded"
            />
            This is my big goal
          </label>
          {goal && (
            <button
              onClick={remove}
              className="w-full rounded-full bg-white/[0.06] py-3.5 text-[13px] font-semibold text-[#ef4444]"
            >
              Delete this goal
            </button>
          )}
        </div>

        <div
          className="border-t border-white/5 bg-[#111] px-5 py-4"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={save}
            disabled={busy || !label.trim()}
            className="w-full rounded-full bg-white py-3.5 text-[14px] font-semibold text-black active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Saving…" : goal ? "Save changes" : "Create goal"}
          </button>
        </div>
      </aside>
    </>
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
      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function NumberField({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="block w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-[15px] tabular-nums outline-none ring-1 ring-transparent focus:ring-white/30"
    />
  );
}
