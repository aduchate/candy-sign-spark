-- Add category column to word_signs table
ALTER TABLE word_signs 
ADD COLUMN category text DEFAULT 'A1';

-- Update all existing records to A1
UPDATE word_signs 
SET category = 'A1' 
WHERE category IS NULL;

-- Make category not null after setting defaults
ALTER TABLE word_signs 
ALTER COLUMN category SET NOT NULL;