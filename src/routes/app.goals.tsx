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

export const Route = createFileRoute("/app/goals")({
  component: GoalsPage,
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

function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const g = await listGoals();
    setGoals(g);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-10 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
            Goals
          </div>
          <h1 className="mt-3 font-display text-[32px] font-medium tracking-tight">
            What you're working toward.
          </h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground"
        >
          + New goal
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Goal</th>
              <th className="px-5 py-3 text-right">Saved</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Per month</th>
              <th className="px-5 py-3 text-right">Days left</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : goals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                  No goals yet. Add your first one.
                </td>
              </tr>
            ) : (
              goals.map((g) => (
                <tr
                  key={g.id}
                  className="border-t border-border hover:bg-surface"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-[11px] text-orange">
                      {priorityLabel(g.priority)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground">
                      {g.label}
                      {g.is_north_star && (
                        <span className="ml-2 rounded-full border border-border-strong px-2 py-[1px] text-[10px] uppercase tracking-wider text-muted-foreground">
                          Big goal
                        </span>
                      )}
                    </div>
                    {g.tagline && (
                      <div className="text-[11px] text-muted-foreground">
                        {g.tagline}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">
                    ${Number(g.current_amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                    ${Number(g.target).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                    ${Number(g.monthly).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                    {g.days_to_goal ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setEditing(g)}
                      className="text-[12px] text-muted-foreground hover:text-orange"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete "${g.label}"?`)) {
                          await deleteGoal(g.id);
                          refresh();
                        }
                      }}
                      className="ml-4 text-[12px] text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && user && (
        <GoalDialog
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
          userId={user.id}
        />
      )}
    </div>
  );
}

function GoalDialog({
  goal,
  onClose,
  onSaved,
  userId,
}: {
  goal: Goal | null;
  onClose: () => void;
  onSaved: () => void;
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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
      />
      {/* Sheet */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-border-strong bg-background shadow-2xl animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-orange">
              {goal ? "Editing" : "Create"}
            </div>
            <h2 className="mt-2 font-display text-[24px] font-medium tracking-tight">
              {goal ? "Edit goal" : "New goal"}
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

        <div className="flex-1 space-y-6 overflow-y-auto px-8 py-7">
          <Field label="Goal">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Down payment"
              className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
            />
          </Field>

          <Field label="A short reminder (optional)">
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A line that reminds you why"
              className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
            />
          </Field>

          <Field label="Type">
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={[
                    "rounded-md border px-3 py-2 text-[12px]",
                    priority === p
                      ? "border-orange text-orange"
                      : "border-border-strong text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {priorityLabel(p)}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Saved so far ($)">
              <NumberField value={current} onChange={setCurrent} />
            </Field>
            <Field label="Total needed ($)">
              <NumberField value={target} onChange={setTarget} />
            </Field>
            <Field label="Per month ($)">
              <NumberField value={monthly} onChange={setMonthly} />
            </Field>
          </div>

          <Field label="Days until you need it (optional)">
            <input
              type="number"
              value={days}
              onChange={(e) =>
                setDays(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] tabular-nums outline-none focus:border-orange"
            />
          </Field>

          <label className="flex items-center gap-3 text-[13px]">
            <input
              type="checkbox"
              checked={isNorthStar}
              onChange={(e) => setIsNorthStar(e.target.checked)}
              className="h-4 w-4 rounded border-border-strong"
            />
            This is my big goal
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-8 py-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy || !label.trim()}
            className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save goal"}
          </button>
        </div>
      </aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
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
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] tabular-nums outline-none focus:border-orange"
    />
  );
}
