// Mock financial state for the Aire agent.
// All numbers are illustrative; no real bank/DeFi integration in v1.

export type GoalId = "house" | "remittance" | "vacation" | "yield";

export type Goal = {
  id: GoalId;
  label: string;
  tagline: string;
  priority: "P0" | "P1" | "P2" | "Engine";
  target: number;
  current: number;
  monthly: number;
  // For time-bound goals
  daysToGoal?: number;
  // Engine-specific
  apr?: number;
};

export const STATE = {
  netIncome: 6000,
  fixedCosts: 3120, // rent + bills + insurance
  monthlyRemittance: 600,
  expectedLeakage: 1480, // historical avg discretionary
  surplusThisMonth: 200,
  riskCoefficient: 0.18, // % of house fund allowed in DeFi
};

export const GOALS: Goal[] = [
  {
    id: "house",
    label: "Buying a home",
    tagline: "30-year mortgage · DC area",
    priority: "P1",
    target: 64000,
    current: 18420,
    monthly: 800,
    daysToGoal: 412,
  },
  {
    id: "remittance",
    label: "Family in Lagos",
    tagline: "Sent every month · must",
    priority: "P0",
    target: 7200,
    current: 4800,
    monthly: 600,
  },
  {
    id: "vacation",
    label: "Lisbon · September",
    tagline: "Treat yourself",
    priority: "P2",
    target: 3800,
    current: 1240,
    monthly: 220,
    daysToGoal: 184,
  },
  {
    id: "yield",
    label: "Savings booster",
    tagline: "Earning interest on spare cash",
    priority: "Engine",
    target: 0,
    current: 2640,
    monthly: 0,
    apr: 14.2,
  },
];

// Ripple math: how many days each $1 of surplus shaves off the house goal.
// Derived from monthly cadence: 1 day ≈ monthly / 30.
export function rippleDays(amount: number, opt: "house" | "vacation" | "yield"): number {
  const house = GOALS.find((g) => g.id === "house")!;
  const vac = GOALS.find((g) => g.id === "vacation")!;
  if (opt === "house") return Math.round((amount / house.monthly) * 30);
  if (opt === "vacation") return Math.round((amount / vac.monthly) * 30);
  // yield: project compounding over remaining days then translate back into house days
  const days = house.daysToGoal ?? 412;
  const yrs = days / 365;
  const grown = amount * Math.pow(1 + 0.142, yrs);
  return Math.round((grown / house.monthly) * 30);
}

export const AGENT_BRIEF = [
  {
    tag: "MOVE",
    text: "You have $200 spare this month. Putting it toward the house saves 6 days.",
  },
  {
    tag: "SAVINGS",
    text: "Your spare cash is earning 14.2% a year — about 9 points more than a typical savings account.",
  },
  {
    tag: "SAFETY",
    text: "Safety cap: 18% of your home savings. Currently at 14.3%. Room to add: $2,360.",
  },
];

export const RECENT_RIPPLES = [
  { date: "Apr 12", action: "Put $180 toward home", delta: "-5 days" },
  { date: "Apr 09", action: "Switched to a better savings rate", delta: "+0.4% / yr" },
  { date: "Apr 03", action: "Sent money to family · Lagos", delta: "Done" },
  { date: "Mar 28", action: "Paused holiday saving", delta: "-12 days to home" },
];
