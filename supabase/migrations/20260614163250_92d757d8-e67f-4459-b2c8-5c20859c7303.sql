CREATE TABLE public.glossary_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  normalized TEXT NOT NULL,
  category TEXT NOT NULL,
  definition TEXT,
  video_url TEXT NOT NULL,
  source_url TEXT,
  source TEXT NOT NULL DEFAULT 'mot-signe.be',
  gloss TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX glossary_signs_category_idx ON public.glossary_signs(category);
CREATE INDEX glossary_signs_normalized_idx ON public.glossary_signs(normalized);
CREATE UNIQUE INDEX glossary_signs_unique_idx ON public.glossary_signs(category, normalized, external_id);

GRANT SELECT ON public.glossary_signs TO anon, authenticated;
GRANT ALL ON public.glossary_signs TO service_role;

ALTER TABLE public.glossary_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Glossary signs are publicly readable"
  ON public.glossary_signs FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage glossary signs"
  ON public.glossary_signs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER glossary_signs_updated_at
  BEFORE UPDATE ON public.glossary_signs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();