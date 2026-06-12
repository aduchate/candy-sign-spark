CREATE UNIQUE INDEX IF NOT EXISTS one_account_type_per_user
  ON public.user_roles (user_id)
  WHERE role IN ('pro', 'patient');

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

  DELETE FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('pro', 'patient');

  INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), _role);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_account_type(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_account_type(public.app_role) TO authenticated;