-- Create a table for donation pages content
CREATE TABLE IF NOT EXISTS public.donation_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view donation pages" 
ON public.donation_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert donation pages" 
ON public.donation_pages 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update donation pages" 
ON public.donation_pages 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete donation pages" 
ON public.donation_pages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));