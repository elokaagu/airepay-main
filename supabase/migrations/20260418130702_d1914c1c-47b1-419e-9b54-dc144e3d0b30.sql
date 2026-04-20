-- Add Saturn Protocol cap and Trust Mode to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS saturn_cap_pct integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS trust_mode text NOT NULL DEFAULT 'pilot';

-- Hard-cap Saturn between 0 and 40 (per PRD v5)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_saturn_cap_pct_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_saturn_cap_pct_check
  CHECK (saturn_cap_pct >= 0 AND saturn_cap_pct <= 40);

-- Restrict trust_mode to the three modes
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_trust_mode_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_trust_mode_check
  CHECK (trust_mode IN ('pilot', 'copilot', 'auto'));