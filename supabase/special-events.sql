-- Special event landing pages: super admin on/off (banner + public route).
-- Run in the Supabase SQL editor after schema.sql.

CREATE TABLE IF NOT EXISTS special_events (
  slug text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO special_events (slug, enabled) VALUES
  ('keep-on-your-radar', true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read special_events" ON special_events;
CREATE POLICY "Allow read special_events" ON special_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow upsert special_events for super_admin" ON special_events;
CREATE POLICY "Allow insert special_events for super_admin"
  ON special_events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
CREATE POLICY "Allow update special_events for super_admin"
  ON special_events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

COMMENT ON TABLE special_events IS 'On/off flags for hardcoded special event pages; managed in Super Admin Settings.';
