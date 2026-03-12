-- Add latitude and longitude for map placement (galleries and events)
-- Run in Supabase SQL editor

-- Galleries: exact place on map
ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

COMMENT ON COLUMN galleries.lat IS 'Latitude for map (e.g. 25.2048)';
COMMENT ON COLUMN galleries.lng IS 'Longitude for map (e.g. 55.2708)';

-- Events: can have their own venue coordinates (or use gallery’s)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

COMMENT ON COLUMN events.lat IS 'Latitude for map';
COMMENT ON COLUMN events.lng IS 'Longitude for map';
