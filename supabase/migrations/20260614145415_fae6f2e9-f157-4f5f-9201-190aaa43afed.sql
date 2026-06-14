CREATE TABLE public.post_consultation_checklist (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_consultation_checklist TO authenticated;
GRANT ALL ON public.post_consultation_checklist TO service_role;

CREATE TABLE public.post_consultation_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_consultation_notes TO authenticated;
GRANT ALL ON public.post_consultation_notes TO service_role;

CREATE INDEX idx_post_consultation_notes_user
  ON public.post_consultation_notes (user_id, created_at DESC);

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