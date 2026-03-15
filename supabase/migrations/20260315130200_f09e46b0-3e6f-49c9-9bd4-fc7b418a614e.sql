
CREATE TABLE public.word_sign_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_sign_id uuid REFERENCES public.word_signs(id) ON DELETE CASCADE NOT NULL,
  video_url text NOT NULL,
  source text NOT NULL DEFAULT 'mot-signe',
  source_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.word_sign_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view word sign variants"
  ON public.word_sign_variants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert word sign variants"
  ON public.word_sign_variants FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update word sign variants"
  ON public.word_sign_variants FOR UPDATE TO authenticated
  USING (true);
