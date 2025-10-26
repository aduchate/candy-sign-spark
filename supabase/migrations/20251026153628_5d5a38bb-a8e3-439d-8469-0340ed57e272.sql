-- Create enum for CECRL levels
CREATE TYPE public.cecrl_level AS ENUM ('A1', 'A2', 'B1', 'B2');

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  level public.cecrl_level NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('enfant', 'adulte')),
  category TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'sentence_ordering', 'word_match')),
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update user_progress table
ALTER TABLE public.user_progress 
  ADD COLUMN exercise_id UUID REFERENCES public.exercises(id),
  ADD COLUMN attempts INTEGER DEFAULT 0,
  ADD COLUMN best_time INTEGER,
  ADD COLUMN level public.cecrl_level;

-- Enable RLS on new tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons (everyone can view)
CREATE POLICY "Anyone can view lessons"
  ON public.lessons
  FOR SELECT
  USING (true);

-- RLS Policies for exercises (everyone can view)
CREATE POLICY "Anyone can view exercises"
  ON public.exercises
  FOR SELECT
  USING (true);

-- Update trigger for lessons
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add profile preference for age group
ALTER TABLE public.profiles 
  ADD COLUMN preferred_age_group TEXT CHECK (preferred_age_group IN ('enfant', 'adulte')) DEFAULT 'adulte';