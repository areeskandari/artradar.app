-- Add "prize" as a collaboration category
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE collaborations DROP CONSTRAINT IF EXISTS collaborations_category_check;
ALTER TABLE collaborations ADD CONSTRAINT collaborations_category_check
  CHECK (category IN ('open_call', 'competition', 'prize'));
