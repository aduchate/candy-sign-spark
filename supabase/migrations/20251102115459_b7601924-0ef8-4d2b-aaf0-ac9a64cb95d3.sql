-- Make category, level, and age_group columns nullable in lessons table
ALTER TABLE public.lessons 
ALTER COLUMN category DROP NOT NULL,
ALTER COLUMN level DROP NOT NULL,
ALTER COLUMN age_group DROP NOT NULL;