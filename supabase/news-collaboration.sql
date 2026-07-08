-- Link news posts to collaborations (open calls / competitions)
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS related_collaboration_id uuid
  REFERENCES collaborations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_news_related_collaboration_id ON news(related_collaboration_id);
