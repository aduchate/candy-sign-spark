-- Move "type de compte" (pro/patient) off the user_roles security-role
-- machinery and onto a plain profile column.
--
-- account_type is UI/profile state, not a security boundary: it gates only
-- which dashboard sections are shown, and is never referenced by any RLS
-- policy. Storing it in user_roles forced it through a SECURITY DEFINER RPC, a
-- partial unique index, and a SEPARATE client-side cache that raced against
-- auth hydration (the role read could resolve to an empty list before the
-- session was ready, sending users back to onboarding even though their role
-- existed). A column read alongside the rest of the profile removes that race.

-- 1. Add the column. NULL means "not chosen yet" (drives the onboarding gate).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text
  CHECK (account_type IN ('pro', 'patient'));

-- 2. Backfill from any existing pro/patient role rows so current users keep
--    their choice.
UPDATE public.profiles p
  SET account_type = ur.role::text
  FROM public.user_roles ur
  WHERE ur.user_id = p.id
    AND ur.role IN ('pro', 'patient');

-- 3. Retire the role-based machinery now that nothing reads it.
DROP FUNCTION IF EXISTS public.set_account_type(public.app_role);
DROP INDEX IF EXISTS public.one_account_type_per_user;
DELETE FROM public.user_roles WHERE role IN ('pro', 'patient');

-- NOTE: the 'pro'/'patient' values remain in the app_role enum. PostgreSQL
-- cannot drop enum values without recreating the type, and leaving them unused
-- is harmless.
