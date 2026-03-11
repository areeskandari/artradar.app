-- Run this in Supabase Dashboard → SQL Editor if data exists in tables but doesn't show on the site.
-- Cause: Row Level Security (RLS) is ON but no policy allows anonymous SELECT.
-- This adds "Public can read" policies so the app (using anon key) can read data.

-- Galleries
DROP POLICY IF EXISTS "Public can read galleries" ON galleries;
CREATE POLICY "Public can read galleries" ON galleries FOR SELECT USING (true);

-- Artists
DROP POLICY IF EXISTS "Public can read artists" ON artists;
CREATE POLICY "Public can read artists" ON artists FOR SELECT USING (true);

-- Events
DROP POLICY IF EXISTS "Public can read events" ON events;
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);

-- Event-artist join
DROP POLICY IF EXISTS "Public can read event_artists" ON event_artists;
CREATE POLICY "Public can read event_artists" ON event_artists FOR SELECT USING (true);

-- Gallery-artist join
DROP POLICY IF EXISTS "Public can read gallery_artists" ON gallery_artists;
CREATE POLICY "Public can read gallery_artists" ON gallery_artists FOR SELECT USING (true);

-- News (allows all rows; seed uses future publish_date so we allow read for all)
DROP POLICY IF EXISTS "Public can read published news" ON news;
CREATE POLICY "Public can read published news" ON news FOR SELECT USING (true);
