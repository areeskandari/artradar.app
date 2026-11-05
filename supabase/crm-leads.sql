-- CRM leads from special event landing pages.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'keep-on-your-radar',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);

ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert crm_leads" ON crm_leads;
CREATE POLICY "Anyone can insert crm_leads"
  ON crm_leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read crm_leads" ON crm_leads;
CREATE POLICY "Admins can read crm_leads"
  ON crm_leads FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "Admins can delete crm_leads" ON crm_leads;
CREATE POLICY "Admins can delete crm_leads"
  ON crm_leads FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

COMMENT ON TABLE crm_leads IS 'Event landing CRM captures (name, phone, email); Super Admin CRM tab.';
