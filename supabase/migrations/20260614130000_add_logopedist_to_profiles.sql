-- Let a *patient* profile point at the *pro* profile that follows them
-- (their logopedist / speech therapist).
--
-- This is profile state, not a security boundary, so no dedicated RLS policy is
-- needed: a patient sets it on their own row via the existing
-- "Users can update own profile" policy, and reads the candidate pros via the
-- open SELECT policy on profiles. NULL means "not chosen yet" and, for patient
-- accounts, drives the onboarding gate the same way a missing account_type does.
--
-- ON DELETE SET NULL: if the chosen pro's profile is removed, the patient is
-- left without a logopedist (and re-prompted) rather than pointing at a ghost.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logopedist_id uuid
  REFERENCES public.profiles(id) ON DELETE SET NULL;
