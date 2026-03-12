-- Seed mock random lat/lng for galleries and events (Dubai area)
-- Run in Supabase SQL editor after add-lat-lng.sql

-- Dubai approximate bounds: lat 24.95–25.35, lng 55.0–55.6

-- Galleries: set random lat/lng where NULL
UPDATE galleries
SET
  lat = 24.95 + (0.4 * random()),
  lng = 55.0 + (0.6 * random())
WHERE lat IS NULL OR lng IS NULL;

-- Events: set random lat/lng where NULL
UPDATE events
SET
  lat = 24.95 + (0.4 * random()),
  lng = 55.0 + (0.6 * random())
WHERE lat IS NULL OR lng IS NULL;
