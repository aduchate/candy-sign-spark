-- Persist a patient's post-consultation follow-up so it survives refresh AND
-- can be reviewed (read-only) by the pro they chose as healthcare provider.
--
-- Two tables, both owned by the patient (user_id). The chosen pro gets an extra
-- SELECT-only path; pros have no write policy, so read-only is enforced by the
-- database, not just the UI.

-- Per-patient checked state for the (hardcoded) checklist items. A row exists
-- only while an item is checked; unchecking deletes the row.
CREATE TABLE public.post_consultation_checklist (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

-- Free-form feedback notes the patient records after a consultation.
CREATE TABLE public.post_consultation_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_consultation_notes_user
  ON public.post_consultation_notes (user_id, created_at DESC);

-- Is the caller the healthcare provider chosen by `patient`?
-- SECURITY DEFINER so the RLS policies below can consult profiles without the
-- caller needing (or recursing through) profiles RLS. Mirrors has_role.
CREATE OR REPLACE FUNCTION public.is_healthcare_provider_of(patient UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = patient AND p.healthcare_provider_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_healthcare_provider_of(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_healthcare_provider_of(UUID) TO authenticated;

-- RLS: post_consultation_checklist
ALTER TABLE public.post_consultation_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own checklist"
  ON public.post_consultation_checklist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view their patients' checklist"
  ON public.post_consultation_checklist
  FOR SELECT TO authenticated
  USING (public.is_healthcare_provider_of(user_id));

-- RLS: post_consultation_notes
ALTER TABLE public.post_consultation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own notes"
  ON public.post_consultation_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view their patients' notes"
  ON public.post_consultation_notes
  FOR SELECT TO authenticated
  USING (public.is_healthcare_provider_of(user_id));
