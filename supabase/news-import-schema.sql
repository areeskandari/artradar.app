-- Run in Supabase SQL editor to enable automated news imports.
-- Adds source tracking and deduplication by original article URL.

ALTER TABLE news ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE news ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_auto_imported boolean DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_news_source_url ON news (source_url) WHERE source_url IS NOT NULL;
