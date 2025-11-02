-- Add unique constraint on source_url to prevent duplicate job listings
ALTER TABLE job_listings ADD CONSTRAINT job_listings_source_url_key UNIQUE (source_url);