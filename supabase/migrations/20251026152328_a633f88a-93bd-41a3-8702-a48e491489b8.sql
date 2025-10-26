-- Créer le bucket de stockage pour les vidéos LSFB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lsfb-videos',
  'lsfb-videos',
  true,
  10485760, -- 10MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/gif']
);

-- Table pour stocker les signes de l'alphabet
CREATE TABLE public.alphabet_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  letter TEXT NOT NULL UNIQUE CHECK (letter ~ '^[A-Z]$'),
  video_url TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour stocker les signes de mots
CREATE TABLE public.word_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  video_url TEXT NOT NULL,
  source_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche rapide des mots (insensible à la casse)
CREATE UNIQUE INDEX idx_word_signs_word_lower ON public.word_signs (LOWER(word));
CREATE INDEX idx_word_signs_word ON public.word_signs (word);

-- Activer RLS
ALTER TABLE public.alphabet_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_signs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour alphabet_signs (lecture publique)
CREATE POLICY "Anyone can view alphabet signs"
ON public.alphabet_signs
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert alphabet signs"
ON public.alphabet_signs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update alphabet signs"
ON public.alphabet_signs
FOR UPDATE
TO authenticated
USING (true);

-- Politiques RLS pour word_signs (lecture publique)
CREATE POLICY "Anyone can view word signs"
ON public.word_signs
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert word signs"
ON public.word_signs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update word signs"
ON public.word_signs
FOR UPDATE
TO authenticated
USING (true);

-- Politiques RLS pour le bucket lsfb-videos
CREATE POLICY "Anyone can view LSFB videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lsfb-videos');

CREATE POLICY "Authenticated users can upload LSFB videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lsfb-videos');

-- Trigger pour updated_at sur alphabet_signs
CREATE TRIGGER update_alphabet_signs_updated_at
BEFORE UPDATE ON public.alphabet_signs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pour updated_at sur word_signs
CREATE TRIGGER update_word_signs_updated_at
BEFORE UPDATE ON public.word_signs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();