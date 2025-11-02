-- Create word categories table
CREATE TABLE public.word_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create junction table for word_sign to categories (many-to-many)
CREATE TABLE public.word_sign_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_sign_id UUID NOT NULL REFERENCES public.word_signs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.word_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(word_sign_id, category_id)
);

-- Enable RLS on both tables
ALTER TABLE public.word_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_sign_categories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view categories
CREATE POLICY "Anyone can view word categories" 
  ON public.word_categories 
  FOR SELECT 
  USING (true);

-- Allow anyone to view word_sign_categories
CREATE POLICY "Anyone can view word sign categories" 
  ON public.word_sign_categories 
  FOR SELECT 
  USING (true);

-- Only authenticated users can insert categories
CREATE POLICY "Authenticated users can insert word categories" 
  ON public.word_categories 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can manage word_sign_categories
CREATE POLICY "Authenticated users can insert word sign categories" 
  ON public.word_sign_categories 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete word sign categories" 
  ON public.word_sign_categories 
  FOR DELETE 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_word_sign_categories_word_sign_id ON public.word_sign_categories(word_sign_id);
CREATE INDEX idx_word_sign_categories_category_id ON public.word_sign_categories(category_id);

-- Insert common categories based on existing lessons
INSERT INTO public.word_categories (name, description) VALUES
  ('Alphabet', 'Lettres de l''alphabet'),
  ('Nombres', 'Chiffres et nombres'),
  ('Salutations', 'Formules de politesse et salutations'),
  ('Animaux', 'Noms d''animaux'),
  ('Couleurs', 'Les différentes couleurs'),
  ('Famille', 'Membres de la famille'),
  ('Émotions', 'Expressions d''émotions et sentiments'),
  ('Nourriture', 'Aliments et boissons'),
  ('Jouets', 'Jeux et jouets'),
  ('Vocabulaire professionnel', 'Termes liés au travail'),
  ('Dates et temps', 'Jours, mois, heures'),
  ('Urgence', 'Mots pour situations d''urgence'),
  ('Vie quotidienne', 'Mots du quotidien'),
  ('Verbes', 'Actions et verbes'),
  ('Adjectifs', 'Qualificatifs')
ON CONFLICT (name) DO NOTHING;