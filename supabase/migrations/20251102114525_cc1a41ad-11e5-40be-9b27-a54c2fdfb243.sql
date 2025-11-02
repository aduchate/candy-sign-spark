-- Add is_quiz column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN is_quiz boolean NOT NULL DEFAULT false;