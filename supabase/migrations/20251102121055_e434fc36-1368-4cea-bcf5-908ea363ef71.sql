-- Drop the existing check constraint
ALTER TABLE exercises 
DROP CONSTRAINT exercises_type_check;

-- Add the updated check constraint with 'quiz' as a valid type
ALTER TABLE exercises 
ADD CONSTRAINT exercises_type_check 
CHECK (type = ANY (ARRAY['multiple_choice'::text, 'sentence_ordering'::text, 'word_match'::text, 'quiz'::text]));