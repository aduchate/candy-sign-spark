
CREATE TABLE public.consultation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_summaries TO authenticated;
GRANT ALL ON public.consultation_summaries TO service_role;

ALTER TABLE public.consultation_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own summaries"
  ON public.consultation_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Provider can view summaries of their patients"
  ON public.consultation_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id AND public.is_healthcare_provider_of(patient_id));

CREATE POLICY "Provider can insert summaries for their patients"
  ON public.consultation_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = provider_id AND public.is_healthcare_provider_of(patient_id));

CREATE POLICY "Provider can update own summaries"
  ON public.consultation_summaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Provider can delete own summaries"
  ON public.consultation_summaries FOR DELETE
  TO authenticated
  USING (auth.uid() = provider_id);

CREATE TRIGGER consultation_summaries_updated_at
  BEFORE UPDATE ON public.consultation_summaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
