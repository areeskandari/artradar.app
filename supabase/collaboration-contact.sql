-- Collaboration contact CTAs (email + WhatsApp)
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS contact_whatsapp text;
