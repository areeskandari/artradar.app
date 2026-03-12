-- Gallery areas: manageable list for super admin (add, edit, remove)
-- Run after schema.sql. This drops the hardcoded CHECK on galleries.area so areas come from this table.

CREATE TABLE IF NOT EXISTS gallery_areas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Seed current areas (match previous CHECK values)
INSERT INTO gallery_areas (value, label, sort_order) VALUES
  ('DIFC', 'DIFC', 1),
  ('Alserkal Avenue', 'Alserkal Avenue', 2),
  ('Downtown', 'Downtown', 3),
  ('JBR', 'JBR', 4),
  ('Abu Dhabi', 'Abu Dhabi', 5),
  ('Other', 'Other', 6)
ON CONFLICT (value) DO NOTHING;

-- Allow galleries.area to be any text (values validated in app from gallery_areas)
ALTER TABLE galleries DROP CONSTRAINT IF EXISTS galleries_area_check;

-- RLS: public read; write only for super_admin (checked via admin_profiles)
ALTER TABLE gallery_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read gallery_areas" ON gallery_areas FOR SELECT USING (true);

CREATE POLICY "Allow insert gallery_areas for super_admin"
  ON gallery_areas FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
CREATE POLICY "Allow update gallery_areas for super_admin"
  ON gallery_areas FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
CREATE POLICY "Allow delete gallery_areas for super_admin"
  ON gallery_areas FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

COMMENT ON TABLE gallery_areas IS 'Gallery area options; managed in Super Admin Settings.';
