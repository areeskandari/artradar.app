-- Collaboration attachments (PDF, Word, etc.)
-- Run in Supabase Dashboard → SQL Editor if table already exists

ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public)
VALUES ('collaboration-attachments', 'collaboration-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read collaboration attachments" ON storage.objects;
CREATE POLICY "Public can read collaboration attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'collaboration-attachments');

DROP POLICY IF EXISTS "Super admin manages collaboration attachments" ON storage.objects;
CREATE POLICY "Super admin manages collaboration attachments" ON storage.objects
FOR ALL
USING (public.is_super_admin() AND bucket_id = 'collaboration-attachments')
WITH CHECK (public.is_super_admin() AND bucket_id = 'collaboration-attachments');
