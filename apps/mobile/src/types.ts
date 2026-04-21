export type GoalPriority = "P0" | "P1" | "P2" | "Engine";

export type Goal = {
  id: string;
  user_id: string;
  label: string;
  tagline: string | null;
  priority: GoalPriority;
  target: number;
  current_amount: number;
  monthly: number;
  days_to_goal: number | null;
  apr: number | null;
  is_north_star: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Ripple = {
  id: string;
  user_id: string;
  goal_id: string | null;
  action: string;
  amount: number;
  days_delta: number;
  tag: string;
  created_at: string;
};

export type WishlistStatus =
  | "considering"
  | "planning"
  | "deferred"
  | "purchased"
  | "dismissed";

export type WishlistVerdict = "go" | "caution" | "defer" | "pending";

export type WishlistAlternative = {
  label: string;
  days_delta: number;
  detail?: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  brand: string | null;
  name: string;
  price: number;
  url: string | null;
  image_url: string | null;
  notes: string | null;
  status: WishlistStatus;
  verdict: WishlistVerdict;
  verdict_text: string | null;
  impact_days: number | null;
  impact_goal_id: string | null;
  fundable_months: number | null;
  alternatives: WishlistAlternative[];
  position: number;
  created_at: string;
  updated_at: string;
};

export type TrustMode = "pilot" | "copilot" | "auto";

export type BondStatus = "pending" | "active" | "ended";

export type Bond = {
  id: string;
  inviter_id: string;
  partner_id: string | null;
  partner_email: string;
  partner_label: string | null;
  status: BondStatus;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
};

export type BondInvite = {
  id: string;
  bond_id: string;
  inviter_id: string;
  invitee_email: string;
  token: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
};

export type BondSharedGoal = {
  id: string;
  bond_id: string;
  goal_id: string;
  shared_by: string;
  created_at: string;
};
