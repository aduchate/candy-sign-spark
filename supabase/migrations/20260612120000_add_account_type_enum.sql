-- Add the two account-type values to the existing app_role enum.
-- NOTE: these values cannot be USED (in indexes, policies, function bodies)
-- in this same transaction — that is done in the next migration.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'patient';
