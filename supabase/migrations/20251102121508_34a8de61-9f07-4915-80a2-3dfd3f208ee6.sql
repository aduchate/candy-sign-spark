-- Drop the existing check constraint
ALTER TABLE exercises 
DROP CONSTRAINT exercises_type_check;

-- Add the updated check constraint with the four types including association
ALTER TABLE exercises 
ADD CONSTRAINT exercises_type_check 
CHECK (type = ANY (ARRAY['true_false'::text, 'multiple_choice'::text, 'sentence_ordering'::text, 'association'::text]));