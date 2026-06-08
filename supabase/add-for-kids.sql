-- Add "for kids" flag to galleries and events
ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS is_for_kids boolean DEFAULT false;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_for_kids boolean DEFAULT false;

COMMENT ON COLUMN galleries.is_for_kids IS 'Show on the For Kids page';
COMMENT ON COLUMN events.is_for_kids IS 'Show on the For Kids page (events section)';
