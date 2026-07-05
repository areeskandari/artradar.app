-- Collaboration region tags (GCC, Europe, USA, Canada)
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS regions jsonb DEFAULT '[]'::jsonb;
