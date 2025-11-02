-- Add image_url column to job_listings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_listings' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.job_listings 
    ADD COLUMN image_url TEXT;
  END IF;
END $$;