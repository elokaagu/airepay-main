import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { createGoal, type GoalPriority } from "@/lib/goals-api";

export const Route = createFileRoute("/app/onboarding")({
  component: Onboarding,
});

const STEPS = ["Welcome", "Your name", "Your big goal", "Family & must-pays", "All set"] as const;

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(user?.email?.split("@")[0] ?? "");
  const [goalLabel, setGoalLabel] = useState("Buying a home");
  const [goalTarget, setGoalTarget] = useState(64000);
  const [goalMonthly, setGoalMonthly] = useState(800);
  const [goalDays, setGoalDays] = useState(412);
  const [hasDuty, setHasDuty] = useState(true);
  const [dutyLabel, setDutyLabel] = useState("Family · monthly");
  const [dutyMonthly, setDutyMonthly] = useState(600);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    try {
      // Update profile
      await supabase
        .from("profiles")
        .update({ display_name: name, onboarded: true })
        .eq("id", user.id);

      // Create main goal
      await createGoal(user.id, {
        label: goalLabel,
        tagline: "Your big goal",
        priority: "P1" as GoalPriority,
        target: goalTarget,
        current_amount: 0,
        monthly: goalMonthly,
        days_to_goal: goalDays,
        is_north_star: true,
        position: 1,
      });

      // Optional must-do
      if (hasDuty && dutyLabel.trim()) {
        await createGoal(user.id, {
          label: dutyLabel,
          tagline: "Always covered first",
          priority: "P0" as GoalPriority,
          target: dutyMonthly * 12,
          current_amount: 0,
          monthly: dutyMonthly,
          position: 0,
        });
      }

      // Savings booster placeholder
      await createGoal(user.id, {
        label: "Spare cash earning interest",
        tagline: "Money you haven't assigned yet, quietly growing",
        priority: "Engine" as GoalPriority,
        target: 0,
        current_amount: 0,
        monthly: 0,
        apr: 14.2,
        position: 9,
      });

      navigate({ to: "/app" });
      // Hard reload so the layout re-checks onboarded flag cleanly
      setTimeout(() => window.location.reload(), 50);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[680px] flex-col px-8 py-12">
      <div className="flex items-center gap-3">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={[
              "h-[3px] flex-1 rounded-full transition-colors",
              i <= step ? "bg-orange" : "bg-border",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </div>

      <div className="mt-12 flex-1">
        {step === 0 && (
          <Section
            title="Welcome to Aire."
            lede="A few quick questions and you'll be set up. You can change anything later."
          />
        )}

        {step === 1 && (
          <Section title="What should we call you?">
            <Input
              label="Your name"
              value={name}
              onChange={setName}
              placeholder="Eloka"
            />
          </Section>
        )}

        {step === 2 && (
          <Section
            title="What's the big thing you're saving for?"
            lede="The one thing Aire should help you stay on track for. A home, a sabbatical, starting a business — anything with a date attached."
          >
            <Input label="What is it?" value={goalLabel} onChange={setGoalLabel} />
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="How much you need ($)"
                value={goalTarget}
                onChange={setGoalTarget}
              />
              <NumberInput
                label="You can save per month ($)"
                value={goalMonthly}
                onChange={setGoalMonthly}
              />
              <NumberInput
                label="By when (days)"
                value={goalDays}
                onChange={setGoalDays}
              />
            </div>
          </Section>
        )}

        {step === 3 && (
          <Section
            title="Anyone you support each month?"
            lede="Money sent to family back home, dependents, tithing — Aire treats these as untouchable and never suggests cutting them."
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHasDuty(true)}
                className={[
                  "rounded-md border px-4 py-2 text-[13px]",
                  hasDuty
                    ? "border-orange text-orange"
                    : "border-border-strong text-muted-foreground",
                ].join(" ")}
              >
                Yes
              </button>
              <button
                onClick={() => setHasDuty(false)}
                className={[
                  "rounded-md border px-4 py-2 text-[13px]",
                  !hasDuty
                    ? "border-orange text-orange"
                    : "border-border-strong text-muted-foreground",
                ].join(" ")}
              >
                Not right now
              </button>
            </div>
            {hasDuty && (
              <>
                <Input
                  label="Who or what is it?"
                  value={dutyLabel}
                  onChange={setDutyLabel}
                />
                <NumberInput
                  label="How much per month ($)"
                  value={dutyMonthly}
                  onChange={setDutyMonthly}
                />
              </>
            )}
          </Section>
        )}

        {step === 4 && (
          <Section
            title="You're all set."
            lede="We've added your big goal, anyone you support, and a place for spare cash to grow. You can edit, add, or remove anything anytime."
          >
            <ul className="mt-4 divide-y divide-border border-y border-border text-[14px]">
              <li className="flex justify-between py-3">
                <span>{goalLabel}</span>
                <span className="font-mono text-[11px] text-orange">Big goal</span>
              </li>
              {hasDuty && (
                <li className="flex justify-between py-3">
                  <span>{dutyLabel}</span>
                  <span className="font-mono text-[11px] text-orange">Must do · always covered</span>
                </li>
              )}
              <li className="flex justify-between py-3">
                <span>Spare cash earning interest</span>
                <span className="font-mono text-[11px] text-orange">Quietly growing</span>
              </li>
            </ul>
          </Section>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={step === 0}
          className="text-[13px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="rounded-md bg-orange px-6 py-3 text-[13px] font-medium text-primary-foreground"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={busy}
            className="rounded-md bg-orange px-6 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Setting things up…" : "Open Aire"}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-[36px] font-medium leading-tight tracking-tight">
        {title}
      </h1>
      {lede && (
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {lede}
        </p>
      )}
      <div className="mt-10 space-y-6">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 block w-full rounded-md border border-border-strong bg-background px-4 py-3 text-[14px] outline-none focus:border-orange"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 block w-full rounded-md border border-border-strong bg-background px-4 py-3 text-[14px] tabular-nums outline-none focus:border-orange"
      />
    </div>
  );
}
