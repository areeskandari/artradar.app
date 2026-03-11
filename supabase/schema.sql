-- Dubai Art Radar — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- GALLERIES
CREATE TABLE galleries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  address text,
  area text CHECK (area IN ('Downtown', 'DIFC', 'Alserkal Avenue', 'JBR', 'Abu Dhabi', 'Other')),
  type text CHECK (type IN ('gallery', 'museum', 'library')),
  website text,
  instagram text,
  email text,
  phone text,
  submission_policy text,
  founded_year int,
  logo_url text,
  cover_image_url text,
  social_links jsonb DEFAULT '{}',
  is_featured boolean DEFAULT false,
  subscription_active boolean DEFAULT false,
  subscription_ends_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

-- ARTISTS
CREATE TABLE artists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  nationality text,
  city text,
  bio text,
  website text,
  instagram text,
  profile_image_url text,
  open_to_collaboration boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  pro_subscription_active boolean DEFAULT false,
  pro_ends_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

-- EVENTS
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  opening_date timestamptz,
  location text,
  gallery_id uuid REFERENCES galleries(id) ON DELETE SET NULL,
  event_type text CHECK (event_type IN ('exhibition', 'talk', 'art_fair', 'workshop', 'opening', 'performance')),
  ticket_info text,
  vip_access boolean DEFAULT false,
  image_url text,
  external_link text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- EVENT ↔ ARTIST (many-to-many)
CREATE TABLE event_artists (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, artist_id)
);

-- GALLERY ↔ ARTIST (many-to-many)
CREATE TABLE gallery_artists (
  gallery_id uuid REFERENCES galleries(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (gallery_id, artist_id)
);

-- NEWS
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  cover_image_url text,
  related_gallery_id uuid REFERENCES galleries(id) ON DELETE SET NULL,
  related_artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  publish_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- SUBSCRIBERS
CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  source_type text CHECK (source_type IN ('gallery', 'event', 'artist', 'newsletter')),
  source_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ADMIN PROFILES
CREATE TABLE admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('super_admin', 'gallery_admin', 'artist')),
  gallery_id uuid REFERENCES galleries(id) ON DELETE SET NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_events_gallery_id ON events(gallery_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_galleries_area ON galleries(area);
CREATE INDEX idx_galleries_type ON galleries(type);
CREATE INDEX idx_galleries_featured ON galleries(is_featured);
CREATE INDEX idx_news_publish_date ON news(publish_date);

-- Row Level Security
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read galleries" ON galleries FOR SELECT USING (true);
CREATE POLICY "Public can read artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public can read event_artists" ON event_artists FOR SELECT USING (true);
CREATE POLICY "Public can read gallery_artists" ON gallery_artists FOR SELECT USING (true);
CREATE POLICY "Public can read published news" ON news FOR SELECT USING (publish_date <= now());

-- Subscribers: anyone can insert
CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

-- Helper: check if current user is super_admin without triggering RLS recursion on admin_profiles
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Admin policies (simplified — use service role key in API routes for admin operations)
CREATE POLICY "Admins can manage galleries" ON galleries FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('super_admin', 'gallery_admin') AND (gallery_id = galleries.id OR role = 'super_admin')));

CREATE POLICY "Admins can manage events" ON events FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('super_admin', 'gallery_admin')));

CREATE POLICY "Super admins can manage news" ON news FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role = 'super_admin'));

CREATE POLICY "Super admins can manage artists" ON artists FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role = 'super_admin'));

CREATE POLICY "Artists can manage own profile" ON artists FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE artist_id = artists.id));

CREATE POLICY "Admins can view subscribers" ON subscribers FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_profiles WHERE role IN ('super_admin', 'gallery_admin')));

CREATE POLICY "Users can read own admin profile" ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

-- Use function to avoid recursion: policy on admin_profiles must not query admin_profiles directly
CREATE POLICY "Super admin manages all profiles" ON admin_profiles FOR ALL
  USING (public.is_super_admin());

-- Storage buckets & policies (recommended)
-- Run `supabase/storage-setup.sql` in Supabase SQL Editor.
