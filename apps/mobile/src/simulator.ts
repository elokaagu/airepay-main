export type Goal = {
  id: string;
  label: string;
  monthly: number;
  priority: "P0" | "P1" | "P2" | "Engine";
  isNorthStar?: boolean;
};

export const seedGoals: Goal[] = [
  { id: "g1", label: "Emergency buffer", monthly: 300, priority: "P1", isNorthStar: true },
  { id: "g2", label: "Rent cushion", monthly: 220, priority: "P2" },
  { id: "g3", label: "Travel fund", monthly: 180, priority: "P0" },
  { id: "g4", label: "Growth engine", monthly: 450, priority: "Engine" },
];

export function rippleDays(amount: number, monthly: number): number {
  if (!monthly || monthly <= 0) return 0;
  return Math.round((amount / monthly) * 30);
}
