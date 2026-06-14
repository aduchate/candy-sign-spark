ALTER TABLE public.word_signs ADD COLUMN IF NOT EXISTS profession text;
CREATE INDEX IF NOT EXISTS idx_word_signs_profession ON public.word_signs(profession);