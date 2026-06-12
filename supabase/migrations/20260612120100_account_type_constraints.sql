-- Enforce mutual exclusivity: a user may hold AT MOST ONE of (pro, patient).
-- admin / user rows are untouched (not covered by the predicate).
CREATE UNIQUE INDEX IF NOT EXISTS one_account_type_per_user
  ON public.user_roles (user_id)
  WHERE role IN ('pro', 'patient');

-- Atomic self-service setter for the caller's own account type.
-- SECURITY DEFINER: this function runs as the function owner and therefore
-- BYPASSES RLS on user_roles. It is the ONLY non-admin path allowed to
-- INSERT/DELETE user_roles rows — there is no self-INSERT or self-DELETE
-- policy for ordinary users (only admins can write user_roles via RLS).
-- A broad self-INSERT policy would risk admin self-escalation, so we use a
-- guarded definer function instead. It hard-rejects any role other than
-- pro/patient, so it can never grant admin.
CREATE OR REPLACE FUNCTION public.set_account_type(_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _role NOT IN ('pro', 'patient') THEN
    RAISE EXCEPTION 'invalid account type: %', _role;
  END IF;

  -- DELETE first (then INSERT) so switching pro<->patient cannot transiently
  -- violate the one_account_type_per_user unique index. Both run in one
  -- implicit transaction, so the swap is atomic.
  DELETE FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('pro', 'patient');

  INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), _role);
END;
$$;

-- Only logged-in users may call it; never anon/public.
REVOKE EXECUTE ON FUNCTION public.set_account_type(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_account_type(public.app_role) TO authenticated;
