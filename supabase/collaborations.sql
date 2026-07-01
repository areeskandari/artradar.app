-- Collaborations (Open Calls & Competitions)
-- Run in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS collaborations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('open_call', 'competition')),
  description text,
  cover_image_url text,
  photos jsonb DEFAULT '[]'::jsonb,
  external_link text,
  deadline timestamptz,
  contact_info text,
  is_featured boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collaborations_category ON collaborations(category);
CREATE INDEX IF NOT EXISTS idx_collaborations_deadline ON collaborations(deadline);
CREATE INDEX IF NOT EXISTS idx_collaborations_featured ON collaborations(is_featured);

ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read collaborations" ON collaborations;
CREATE POLICY "Public can read collaborations" ON collaborations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage collaborations" ON collaborations;
CREATE POLICY "Admins can manage collaborations" ON collaborations FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role = 'super_admin'));

-- Storage bucket for collaboration images
INSERT INTO storage.buckets (id, name, public)
VALUES ('collaboration-images', 'collaboration-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read collaboration images" ON storage.objects;
CREATE POLICY "Public can read collaboration images" ON storage.objects
FOR SELECT USING (bucket_id = 'collaboration-images');

DROP POLICY IF EXISTS "Super admin manages collaboration images" ON storage.objects;
CREATE POLICY "Super admin manages collaboration images" ON storage.objects
FOR ALL
USING (public.is_super_admin() AND bucket_id = 'collaboration-images')
WITH CHECK (public.is_super_admin() AND bucket_id = 'collaboration-images');
