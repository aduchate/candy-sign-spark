-- Create table for news articles
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  source_url TEXT UNIQUE,
  category TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view articles
CREATE POLICY "Anyone can view news articles" 
  ON public.news_articles 
  FOR SELECT 
  USING (true);

-- Only admins can insert articles
CREATE POLICY "Admins can insert news articles" 
  ON public.news_articles 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update articles
CREATE POLICY "Admins can update news articles" 
  ON public.news_articles 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete articles
CREATE POLICY "Admins can delete news articles" 
  ON public.news_articles 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_category ON public.news_articles(category);

-- Add unique constraint on source_url
CREATE UNIQUE INDEX idx_news_articles_source_url ON public.news_articles(source_url);