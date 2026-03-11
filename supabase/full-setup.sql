-- Dubai Art Radar — Full database setup
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query (paste all, then Run).
-- After it succeeds: create a user in Authentication → Users, then run the admin INSERT at the bottom.

-- ========== SCHEMA ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE event_artists (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, artist_id)
);

CREATE TABLE gallery_artists (
  gallery_id uuid REFERENCES galleries(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (gallery_id, artist_id)
);

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

CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  source_type text CHECK (source_type IN ('gallery', 'event', 'artist', 'newsletter')),
  source_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('super_admin', 'gallery_admin', 'artist')),
  gallery_id uuid REFERENCES galleries(id) ON DELETE SET NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_gallery_id ON events(gallery_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_galleries_area ON galleries(area);
CREATE INDEX idx_galleries_type ON galleries(type);
CREATE INDEX idx_galleries_featured ON galleries(is_featured);
CREATE INDEX idx_news_publish_date ON news(publish_date);

ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read galleries" ON galleries FOR SELECT USING (true);
CREATE POLICY "Public can read artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public can read event_artists" ON event_artists FOR SELECT USING (true);
CREATE POLICY "Public can read gallery_artists" ON gallery_artists FOR SELECT USING (true);
CREATE POLICY "Public can read published news" ON news FOR SELECT USING (publish_date <= now());
CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

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
CREATE POLICY "Users can read own admin profile" ON admin_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admin manages all profiles" ON admin_profiles FOR ALL
  USING (public.is_super_admin());

-- ========== SEED DATA ==========
INSERT INTO galleries (id, name, slug, description, address, area, type, website, instagram, email, phone, submission_policy, founded_year, logo_url, cover_image_url, is_featured, subscription_active) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Leila Heller Gallery', 'leila-heller-gallery', 'One of the leading international contemporary art galleries, with a strong focus on Middle Eastern and Central Asian artists.', 'Gate Village, Building 4, DIFC', 'DIFC', 'gallery', 'https://leilahellergallery.com', '@leilahellergallery', 'info@leilahellergallery.com', '+971 4 325 1900', 'Submissions are open year-round. Email a portfolio PDF with artist statement.', 2015, NULL, NULL, true, true),
  ('11111111-0002-0002-0002-000000000002', 'Alserkal Avenue', 'alserkal-avenue', 'A warehouse arts district in Al Quoz that is home to over 50 leading contemporary art galleries, art spaces, and creative enterprises.', 'Street 8, Al Quoz Industrial Area 1', 'Alserkal Avenue', 'gallery', 'https://alserkalavenue.ae', '@alserkalavenue', 'info@alserkalavenue.ae', '+971 4 333 3464', 'Contact individual galleries within the district for submission policies.', 2008, NULL, NULL, true, true),
  ('11111111-0003-0003-0003-000000000003', 'Dubai Museum of the Future', 'dubai-museum-of-the-future', 'A living museum dedicated to hosting and developing visions of the future through immersive exhibitions and experiences.', 'Sheikh Zayed Rd, Trade Centre', 'Downtown', 'museum', 'https://museumofthefuture.ae', '@museumofthefuture', 'info@museumofthefuture.ae', '+971 4 524 7777', 'No external submissions. All content is curated internally.', 2022, NULL, NULL, true, true),
  ('11111111-0004-0004-0004-000000000004', 'Isabelle van den Eynde Gallery', 'isabelle-van-den-eynde', 'Contemporary art gallery representing established and emerging artists from the Middle East, North Africa, and South Asia.', 'Unit 14, Alserkal Avenue, Al Quoz', 'Alserkal Avenue', 'gallery', 'https://ivde.net', '@ivdegallery', 'info@ivde.net', '+971 4 323 5052', 'Submissions reviewed twice a year. Submit via email with portfolio PDF.', 2010, NULL, NULL, false, true),
  ('11111111-0005-0005-0005-000000000005', 'The Third Line', 'the-third-line', 'Contemporary art gallery focusing on artists working in and from the Middle East, North Africa, and the broader Islamic world.', 'Unit 5, Street 6, Al Quoz', 'Alserkal Avenue', 'gallery', 'https://thethirdline.com', '@thethirdline', 'info@thethirdline.com', '+971 4 341 1367', 'Submissions accepted via email portfolio. Review takes 2-3 months.', 2005, NULL, NULL, false, true),
  ('11111111-0006-0006-0006-000000000006', 'Opera Gallery Dubai', 'opera-gallery-dubai', 'International contemporary art gallery representing masters and emerging artists with works spanning from Impressionism to contemporary art.', 'Gate Village 3, DIFC', 'DIFC', 'gallery', 'https://operagallery.com', '@operagallery', 'dubai@operagallery.com', '+971 4 323 0909', 'Contact the gallery directly. Preference for established mid-career artists.', 2002, NULL, NULL, false, false),
  ('11111111-0007-0007-0007-000000000007', 'Etihad Modern Art Gallery', 'etihad-modern-art', 'Showcasing contemporary Emirati and regional artists alongside international talent. Known for supporting local creative talent.', 'Trade Centre Area, Downtown Dubai', 'Downtown', 'gallery', 'https://etihadmodern.ae', '@etihadmodernart', 'info@etihadmodern.ae', '+971 4 321 4567', 'Open submissions for Emirati and GCC artists. No international submissions at this time.', 2014, NULL, NULL, false, false),
  ('11111111-0008-0008-0008-000000000008', 'Mohammed Bin Rashid Library', 'mbr-library', 'A world-class library and cultural hub on the Dubai Creek waterfront, housing art exhibitions, cultural events, and learning spaces.', 'Dubai Creek, Bur Dubai', 'Downtown', 'library', 'https://mbrlib.ae', '@mbr_library', 'info@mbrlib.ae', '+971 4 247 0000', 'Exhibitions by invitation only or through cultural institution partnerships.', 2022, NULL, NULL, true, true),
  ('11111111-0009-0009-0009-000000000009', 'Majlis Gallery', 'majlis-gallery', 'Dubai''s oldest established art gallery, specializing in works by Middle Eastern artists as well as international artists inspired by the region.', 'Al Fahidi Historical Neighbourhood, Bur Dubai', 'Downtown', 'gallery', 'https://majlisgallery.com', '@majlisgallery', 'info@majlisgallery.com', '+971 4 353 6233', 'Accepting submissions from established artists. Portfolio review required.', 1989, NULL, NULL, false, false),
  ('11111111-0010-0010-0010-000000000010', 'Warehouse421', 'warehouse421', 'A multidisciplinary arts space located in Mina Zayed port that showcases experimental and contemporary art from the Arab world.', 'Mina Zayed, Abu Dhabi', 'Abu Dhabi', 'museum', 'https://warehouse421.ae', '@warehouse421', 'info@warehouse421.ae', '+971 2 641 8888', 'Open call submissions twice yearly. Check website for current open calls.', 2015, NULL, NULL, false, true);

INSERT INTO artists (id, name, slug, nationality, city, bio, website, instagram, open_to_collaboration, is_verified, pro_subscription_active) VALUES
  ('22222222-0001-0001-0001-000000000001', 'Ebtisam AbdulAziz', 'ebtisam-abdulaziz', 'Emirati', 'Dubai', 'Pioneering Emirati conceptual artist whose work explores language, identity, and the female experience through photography, installation, and video.', NULL, '@ebtisam_abdulaziz', false, true, true),
  ('22222222-0002-0002-0002-000000000002', 'Hassan Sharif', 'hassan-sharif', 'Emirati', 'Dubai', 'Legendary Emirati artist known as the father of contemporary art in the UAE. Works across drawing, painting, sculpture, and installation.', NULL, '@hassansharif_art', false, true, true),
  ('22222222-0003-0003-0003-000000000003', 'Shirin Neshat', 'shirin-neshat', 'Iranian', 'New York', 'Internationally acclaimed Iranian-American visual artist and filmmaker known for her explorations of Islamic society, feminism, and exile.', 'https://shirinneshat.com', '@shirinneshatofficial', false, true, true),
  ('22222222-0004-0004-0004-000000000004', 'Ayman Zedani', 'ayman-zedani', 'Saudi', 'Dubai', 'Saudi multidisciplinary artist working in sculpture, installation, and public art. Known for blending traditional Islamic patterns with contemporary forms.', NULL, '@aymanzedani', true, true, true),
  ('22222222-0005-0005-0005-000000000005', 'Nadia Kaabi-Linke', 'nadia-kaabi-linke', 'Tunisian-Ukrainian', 'Dubai', 'Conceptual artist working at the intersection of sociopolitical issues and aesthetics through installation, drawing, and photography.', 'https://nadiakaabilinke.com', '@nadiakaabilinke', true, true, true),
  ('22222222-0006-0006-0006-000000000006', 'Tarek Al-Ghoussein', 'tarek-al-ghoussein', 'Kuwaiti-Palestinian', 'Dubai', 'Photographer and conceptual artist exploring themes of identity, displacement, and belonging through self-portrait series in desolate landscapes.', NULL, '@tareka_g', false, false, false),
  ('22222222-0007-0007-0007-000000000007', 'Rokni Haerizadeh', 'rokni-haerizadeh', 'Iranian', 'Dubai', 'Iranian artist known for large-scale figurative paintings and animations that respond to current events, mixing traditional miniature painting with pop imagery.', NULL, '@roknihaerizadeh', true, true, true),
  ('22222222-0008-0008-0008-000000000008', 'Ramin Haerizadeh', 'ramin-haerizadeh', 'Iranian', 'Dubai', 'Iranian artist working in photography, video, and performance. Collaborates frequently with his brother Rokni and artist Hesam Rahmanian.', NULL, '@raminhaerizadeh', true, true, true),
  ('22222222-0009-0009-0009-000000000009', 'Monira Al Qadiri', 'monira-al-qadiri', 'Kuwaiti', 'Dubai', 'Artist working in video, sculpture, and performance exploring themes of Gulf heritage, oil culture, and mourning rituals.', 'https://moniraalqadiri.com', '@moniraalqadiri', true, true, true),
  ('22222222-0010-0010-0010-000000000010', 'Maitha Hamdan', 'maitha-hamdan', 'Emirati', 'Dubai', 'Emirati visual artist and cultural practitioner exploring themes of cultural identity and memory. Known for intricate calligraphy-inspired installations.', NULL, '@maithahamdan', true, false, false),
  ('22222222-0011-0011-0011-000000000011', 'Faig Ahmed', 'faig-ahmed', 'Azerbaijani', 'Dubai', 'Contemporary artist known for deconstructing traditional Azerbaijani carpet patterns into fluid, pixelated, or melting forms.', 'https://faigahmed.com', '@faigahmedart', true, true, true),
  ('22222222-0012-0012-0012-000000000012', 'Sophia Al-Maria', 'sophia-al-maria', 'Qatari-American', 'Dubai', 'Artist, filmmaker, and author who coined the term ''Gulf Futurism''. Works in video, installation, and writing exploring technology and Arab culture.', 'https://sophiaalaria.com', '@sophia_al_maria', false, true, true),
  ('22222222-0013-0013-0013-000000000013', 'Wael Shawky', 'wael-shawky', 'Egyptian', 'Dubai', 'Egyptian artist known for video works and epic theatrical productions exploring Islamic history and Arab identity through puppets, drawings, and performance.', NULL, '@waelshawky', false, true, true),
  ('22222222-0014-0014-0014-000000000014', 'Moza Al Matrooshi', 'moza-al-matrooshi', 'Emirati', 'Dubai', 'Emerging Emirati sculptor and installation artist exploring themes of sustainability, craft, and the relationship between nature and urban environments.', NULL, '@mozaalmatrooshi', true, false, false),
  ('22222222-0015-0015-0015-000000000015', 'Khalil Rabah', 'khalil-rabah', 'Palestinian', 'Dubai', 'Artist working with found objects, archives, and institutional critique. Known for re-imagining museum collections through a Palestinian political lens.', NULL, '@khalilrabah', true, true, true);

INSERT INTO events (id, title, slug, description, start_date, end_date, opening_date, location, gallery_id, event_type, ticket_info, vip_access, image_url, is_featured) VALUES
  ('33333333-0001-0001-0001-000000000001', 'Echoes of Tomorrow', 'echoes-of-tomorrow', 'A sweeping survey of contemporary Gulf art exploring how artists from the region are imagining and critiquing the future. Featuring 12 artists across painting, sculpture, and video installation.', '2026-03-01 10:00:00+04', '2026-04-15 18:00:00+04', '2026-02-28 19:00:00+04', 'Leila Heller Gallery, Gate Village 4, DIFC', '11111111-0001-0001-0001-000000000001', 'exhibition', 'Free entry', false, NULL, true),
  ('33333333-0002-0002-0002-000000000002', 'Dubai Art Week 2026', 'dubai-art-week-2026', 'The premier annual celebration of the UAE art scene, featuring gallery nights, artist talks, open studios, and special exhibitions across the city.', '2026-03-10 09:00:00+04', '2026-03-16 21:00:00+04', NULL, 'Various venues across Dubai', NULL, 'art_fair', 'Various pricing — some events free', true, NULL, true),
  ('33333333-0003-0003-0003-000000000003', 'Geometry of the Soul', 'geometry-of-the-soul', 'Ayman Zedani''s first major solo exhibition in Dubai, presenting new sculptures and site-specific installations that merge Islamic geometric patterns with futurist aesthetics.', '2026-03-05 10:00:00+04', '2026-05-01 18:00:00+04', '2026-03-04 19:30:00+04', 'The Third Line, Al Quoz', '11111111-0005-0005-0005-000000000005', 'exhibition', 'Free entry', false, NULL, true),
  ('33333333-0004-0004-0004-000000000004', 'Artist Talk: Monira Al Qadiri on Gulf Futurism', 'artist-talk-monira-al-qadiri', 'In conversation with cultural critic Rahel Aima, artist Monira Al Qadiri discusses her practice, the aesthetics of oil culture, and what Gulf Futurism means today.', '2026-03-12 18:30:00+04', '2026-03-12 20:30:00+04', NULL, 'Alserkal Avenue, Community Hall', '11111111-0002-0002-0002-000000000002', 'talk', 'AED 50 — register online', false, NULL, false),
  ('33333333-0005-0005-0005-000000000005', 'Threads of Memory', 'threads-of-memory', 'Faig Ahmed''s latest body of work challenges the familiar forms of traditional carpets, weaving digital aesthetics into ancient craft. A meditation on identity and transformation.', '2026-02-15 10:00:00+04', '2026-03-30 18:00:00+04', '2026-02-14 19:00:00+04', 'Isabelle van den Eynde Gallery, Alserkal Avenue', '11111111-0004-0004-0004-000000000004', 'exhibition', 'Free entry', false, NULL, false),
  ('33333333-0006-0006-0006-000000000006', 'Silk Road Now: Contemporary Connections', 'silk-road-now', 'A group exhibition examining how artists across the historic Silk Road corridor are responding to trade, migration, and cultural exchange in the 21st century.', '2026-03-20 10:00:00+04', '2026-06-01 18:00:00+04', '2026-03-19 19:00:00+04', 'Opera Gallery, Gate Village 3, DIFC', '11111111-0006-0006-0006-000000000006', 'exhibition', 'Free entry', false, NULL, false),
  ('33333333-0007-0007-0007-000000000007', 'Opening Night: Ebtisam AbdulAziz', 'opening-ebtisam-abdulaziz', 'Private opening night for the new exhibition by pioneering Emirati artist Ebtisam AbdulAziz. Exclusive access to the artist and curators.', '2026-03-25 19:00:00+04', '2026-03-25 22:00:00+04', NULL, 'Majlis Gallery, Al Fahidi', '11111111-0009-0009-0009-000000000009', 'opening', 'Invitation only', true, NULL, false),
  ('33333333-0008-0008-0008-000000000008', 'Photography Masterclass: Tarek Al-Ghoussein', 'photography-masterclass-tarek', 'A two-day intensive masterclass with internationally renowned photographer Tarek Al-Ghoussein, focusing on conceptual photography and self-portraiture.', '2026-04-05 10:00:00+04', '2026-04-06 17:00:00+04', NULL, 'Alserkal Avenue, Workshop Space B', '11111111-0002-0002-0002-000000000002', 'workshop', 'AED 800 for both days — limited to 15 participants', false, NULL, false),
  ('33333333-0009-0009-0009-000000000009', 'The Weight of Words: Nadia Kaabi-Linke', 'weight-of-words', 'An immersive solo exhibition exploring linguistic and physical borders. Kaabi-Linke''s large-scale installations use text, trace, and material to question systems of inclusion and exclusion.', '2026-03-15 10:00:00+04', '2026-05-15 18:00:00+04', '2026-03-14 19:00:00+04', 'Warehouse421, Abu Dhabi', '11111111-0010-0010-0010-000000000010', 'exhibition', 'AED 25 per person', false, NULL, true),
  ('33333333-0010-0010-0010-000000000010', 'Gulf Futures Forum', 'gulf-futures-forum', 'A two-day symposium bringing together artists, curators, critics, and cultural policymakers to discuss the future of the Gulf art scene. Keynotes, panels, and performances.', '2026-04-10 09:00:00+04', '2026-04-11 19:00:00+04', NULL, 'Mohammed Bin Rashid Library, Dubai Creek', '11111111-0008-0008-0008-000000000008', 'talk', 'AED 200 for both days — AED 100 for single day', true, NULL, false),
  ('33333333-0011-0011-0011-000000000011', 'Carpet as Canvas', 'carpet-as-canvas', 'A group show bringing together artists who use the carpet and textile as their primary medium, exploring the intersection of craft, tradition, and contemporary art.', '2026-04-01 10:00:00+04', '2026-05-30 18:00:00+04', '2026-03-31 19:00:00+04', 'Etihad Modern Art Gallery, Downtown', '11111111-0007-0007-0007-000000000007', 'exhibition', 'Free entry', false, NULL, false),
  ('33333333-0012-0012-0012-000000000012', 'Sound and Fury: Live Performance Night', 'sound-and-fury-performance', 'An evening of live performance art, sound installations, and experimental video by five emerging artists from the UAE and wider Gulf region.', '2026-03-22 20:00:00+04', '2026-03-22 23:00:00+04', NULL, 'Alserkal Avenue, A4 Space', '11111111-0002-0002-0002-000000000002', 'performance', 'AED 75 at the door', false, NULL, false),
  ('33333333-0013-0013-0013-000000000013', 'Rokni & Ramin: Double Vision', 'rokni-ramin-double-vision', 'The first joint exhibition in Dubai by brothers Rokni and Ramin Haerizadeh, featuring new paintings, animations, and collaborative installations created during their Dubai residency.', '2026-05-10 10:00:00+04', '2026-07-01 18:00:00+04', '2026-05-09 19:30:00+04', 'The Third Line, Al Quoz', '11111111-0005-0005-0005-000000000005', 'exhibition', 'Free entry', true, NULL, true),
  ('33333333-0014-0014-0014-000000000014', 'Khalil Rabah: The Palestine Museum (Dubai Edition)', 'khalil-rabah-palestine-museum', 'An ongoing conceptual museum project by Palestinian artist Khalil Rabah, reimagined and reinstalled for a Dubai context. The work challenges ideas of nationhood, collection, and cultural heritage.', '2026-03-08 10:00:00+04', '2026-04-30 18:00:00+04', '2026-03-07 19:00:00+04', 'Leila Heller Gallery, DIFC', '11111111-0001-0001-0001-000000000001', 'exhibition', 'Free entry', false, NULL, false),
  ('33333333-0015-0015-0015-000000000015', 'Young Collectors Evening', 'young-collectors-evening', 'An exclusive evening for art collectors under 40, featuring curator-led tours, artist introductions, and a selection of affordable works by emerging regional artists.', '2026-03-18 19:00:00+04', '2026-03-18 22:00:00+04', NULL, 'Opera Gallery, DIFC', '11111111-0006-0006-0006-000000000006', 'opening', 'AED 150 — includes champagne reception', true, NULL, false),
  ('33333333-0016-0016-0016-000000000016', 'Moza Al Matrooshi: Grown Here', 'moza-al-matrooshi-grown-here', 'A debut solo exhibition by Emirati sculptor Moza Al Matrooshi, presenting works that explore the relationship between organic growth, traditional craft, and Dubai''s rapid urbanisation.', '2026-06-01 10:00:00+04', '2026-07-15 18:00:00+04', '2026-05-31 19:00:00+04', 'Alserkal Avenue, Gallery Space', '11111111-0002-0002-0002-000000000002', 'exhibition', 'Free entry', false, NULL, false),
  ('33333333-0017-0017-0017-000000000017', 'Printmaking Workshop: Arabic Calligraphy Monoprints', 'printmaking-workshop-calligraphy', 'A hands-on workshop exploring the crossover between traditional Arabic calligraphy and modern printmaking techniques. No prior experience required.', '2026-03-28 10:00:00+04', '2026-03-28 16:00:00+04', NULL, 'Mohammed Bin Rashid Library, Art Studios', '11111111-0008-0008-0008-000000000008', 'workshop', 'AED 350 including materials', false, NULL, false),
  ('33333333-0018-0018-0018-000000000018', 'Sophia Al-Maria: Black Friday Redux', 'sophia-al-maria-black-friday', 'A new video installation by Gulf Futurism pioneer Sophia Al-Maria, examining consumer culture, digital identity, and the aesthetics of the mall in the post-pandemic Gulf.', '2026-04-15 10:00:00+04', '2026-06-15 18:00:00+04', '2026-04-14 19:00:00+04', 'Isabelle van den Eynde Gallery, Alserkal', '11111111-0004-0004-0004-000000000004', 'exhibition', 'Free entry', false, NULL, false),
  ('33333333-0019-0019-0019-000000000019', 'Art Dubai 2026 Preview Dinner', 'art-dubai-2026-preview-dinner', 'An exclusive VIP preview dinner and private viewing on the eve of Art Dubai 2026, with collectors, artists, and gallerists from across the globe.', '2026-03-11 19:30:00+04', '2026-03-11 23:00:00+04', NULL, 'Madinat Jumeirah, Arena', NULL, 'opening', 'By invitation only', true, NULL, true),
  ('33333333-0020-0020-0020-000000000020', 'Wael Shawky: Drama 1882', 'wael-shawky-drama-1882', 'The UAE premiere of Wael Shawky''s acclaimed epic trilogy, a staged opera retelling the story of the 1882 Urabi Revolt through puppetry, costumes, and classical Arabic music.', '2026-03-13 19:00:00+04', '2026-03-14 21:00:00+04', NULL, 'Alserkal Avenue, A4 Space', '11111111-0002-0002-0002-000000000002', 'performance', 'AED 120 per night, AED 200 for both nights', true, NULL, true);

INSERT INTO event_artists (event_id, artist_id) VALUES
  ('33333333-0001-0001-0001-000000000001', '22222222-0001-0001-0001-000000000001'),
  ('33333333-0001-0001-0001-000000000001', '22222222-0010-0010-0010-000000000010'),
  ('33333333-0001-0001-0001-000000000001', '22222222-0014-0014-0014-000000000014'),
  ('33333333-0003-0003-0003-000000000003', '22222222-0004-0004-0004-000000000004'),
  ('33333333-0004-0004-0004-000000000004', '22222222-0009-0009-0009-000000000009'),
  ('33333333-0005-0005-0005-000000000005', '22222222-0011-0011-0011-000000000011'),
  ('33333333-0006-0006-0006-000000000006', '22222222-0003-0003-0003-000000000003'),
  ('33333333-0006-0006-0006-000000000006', '22222222-0015-0015-0015-000000000015'),
  ('33333333-0007-0007-0007-000000000007', '22222222-0001-0001-0001-000000000001'),
  ('33333333-0008-0008-0008-000000000008', '22222222-0006-0006-0006-000000000006'),
  ('33333333-0009-0009-0009-000000000009', '22222222-0005-0005-0005-000000000005'),
  ('33333333-0011-0011-0011-000000000011', '22222222-0011-0011-0011-000000000011'),
  ('33333333-0013-0013-0013-000000000013', '22222222-0007-0007-0007-000000000007'),
  ('33333333-0013-0013-0013-000000000013', '22222222-0008-0008-0008-000000000008'),
  ('33333333-0014-0014-0014-000000000014', '22222222-0015-0015-0015-000000000015'),
  ('33333333-0018-0018-0018-000000000018', '22222222-0012-0012-0012-000000000012'),
  ('33333333-0016-0016-0016-000000000016', '22222222-0014-0014-0014-000000000014'),
  ('33333333-0020-0020-0020-000000000020', '22222222-0013-0013-0013-000000000013');

INSERT INTO gallery_artists (gallery_id, artist_id) VALUES
  ('11111111-0001-0001-0001-000000000001', '22222222-0003-0003-0003-000000000003'),
  ('11111111-0001-0001-0001-000000000001', '22222222-0015-0015-0015-000000000015'),
  ('11111111-0004-0004-0004-000000000004', '22222222-0005-0005-0005-000000000005'),
  ('11111111-0004-0004-0004-000000000004', '22222222-0012-0012-0012-000000000012'),
  ('11111111-0005-0005-0005-000000000005', '22222222-0004-0004-0004-000000000004'),
  ('11111111-0005-0005-0005-000000000005', '22222222-0007-0007-0007-000000000007'),
  ('11111111-0005-0005-0005-000000000005', '22222222-0008-0008-0008-000000000008'),
  ('11111111-0006-0006-0006-000000000006', '22222222-0011-0011-0011-000000000011'),
  ('11111111-0007-0007-0007-000000000007', '22222222-0001-0001-0001-000000000001'),
  ('11111111-0007-0007-0007-000000000007', '22222222-0010-0010-0010-000000000010'),
  ('11111111-0009-0009-0009-000000000009', '22222222-0002-0002-0002-000000000002'),
  ('11111111-0010-0010-0010-000000000010', '22222222-0009-0009-0009-000000000009'),
  ('11111111-0002-0002-0002-000000000002', '22222222-0006-0006-0006-000000000006'),
  ('11111111-0002-0002-0002-000000000002', '22222222-0013-0013-0013-000000000013'),
  ('11111111-0008-0008-0008-000000000008', '22222222-0014-0014-0014-000000000014');

INSERT INTO news (id, title, slug, content, related_gallery_id, related_artist_id, publish_date) VALUES
  ('44444444-0001-0001-0001-000000000001', 'Dubai Art Week 2026 Announces Record Participation', 'dubai-art-week-2026-record', '<h2>Record numbers for the region''s premier art event</h2><p>Dubai Art Week 2026 has announced its most ambitious programme yet, with over 80 galleries, museums, and arts institutions participating across the emirate. This year''s edition focuses on the theme of "Crossings" — exploring migration, trade routes, and cultural exchange in the contemporary Gulf.</p><p>The week-long celebration begins on March 10th and features a special collaboration between the Mohammed Bin Rashid Library and Alserkal Avenue, creating a cultural corridor from the Creek to Al Quoz.</p><p>Highlights include a new commission by Monira Al Qadiri for the Dubai Fountain, a major retrospective of Hassan Sharif''s work at the MBR Library, and the debut of three new galleries in the DIFC district.</p>', '11111111-0002-0002-0002-000000000002', NULL, '2026-03-01 09:00:00+04'),
  ('44444444-0002-0002-0002-000000000002', 'Leila Heller Gallery Expands to New Alserkal Space', 'leila-heller-alserkal-expansion', '<h2>Iconic DIFC gallery opens second Dubai location</h2><p>Leila Heller Gallery has announced the opening of a second Dubai space in Alserkal Avenue, set to launch in September 2026. The new 800-square-metre space will focus exclusively on emerging artists from the MENA region and Central Asia.</p><p>Gallery director Leila Heller said the expansion reflects the "extraordinary energy" coming from the regional art scene. The Alserkal space will host four to six exhibitions per year, with a focus on first-time solo shows by artists under 35.</p><p>The new space will also include a dedicated residency studio for two artists per season, selected through an open application process.</p>', '11111111-0001-0001-0001-000000000001', NULL, '2026-02-20 10:00:00+04'),
  ('44444444-0003-0003-0003-000000000003', 'Ebtisam AbdulAziz Represents UAE at Venice Biennale 2026', 'ebtisam-abdulaziz-venice-2026', '<h2>Pioneering Emirati artist chosen for national pavilion</h2><p>The UAE pavilion at the 2026 Venice Biennale will be represented by pioneering conceptual artist Ebtisam AbdulAziz, it has been announced by the UAE Ministry of Culture. AbdulAziz, one of the UAE''s most internationally recognized artists, will present a new commission titled "Unwritten," exploring the politics of language, memory, and erasure.</p><p>The announcement has been widely celebrated by the Dubai art community. The Third Line gallery, which represents AbdulAziz, called it "a landmark moment for Emirati art and its place in the global conversation."</p><p>The Venice Biennale opens on April 19th, 2026, with the UAE Pavilion located in the Arsenale.</p>', NULL, '22222222-0001-0001-0001-000000000001', '2026-02-15 09:00:00+04'),
  ('44444444-0004-0004-0004-000000000004', 'Alserkal Avenue Launches New Arts Residency Programme', 'alserkal-residency-programme-2026', '<h2>Six international artists to receive studios and stipends</h2><p>Alserkal Avenue has announced the launch of its most ambitious residency programme to date, offering six international artists a three-month residency in Dubai including a studio, living stipend, and production support.</p><p>The 2026 cohort includes artists from Egypt, Pakistan, South Korea, Brazil, and the Netherlands. Each artist will engage with the Dubai community through open studio days, public talks, and a final group exhibition in November 2026.</p><p>Applications for the 2027 residency will open in October 2026. Alserkal Avenue has allocated AED 500,000 for the programme, funded by a combination of gallery partners and the Dubai Culture & Arts Authority.</p>', '11111111-0002-0002-0002-000000000002', NULL, '2026-02-10 11:00:00+04'),
  ('44444444-0005-0005-0005-000000000005', 'Mohammed Bin Rashid Library Unveils Major Hassan Sharif Archive', 'mbr-library-hassan-sharif-archive', '<h2>Landmark archive opens to researchers and the public</h2><p>The Mohammed Bin Rashid Library has unveiled a comprehensive archive dedicated to the late Hassan Sharif, widely regarded as the father of contemporary art in the UAE. The archive includes over 4,000 works on paper, notebooks, correspondence, and documentation of major installations spanning five decades of the artist''s practice.</p><p>The archive, developed in partnership with the Hassan Sharif Foundation, will be accessible to researchers by appointment and will feature a permanent rotating display in the library''s Cultural Gallery on the fourth floor.</p><p>A major retrospective exhibition drawing from the archive is planned for late 2026, in collaboration with several international institutions.</p>', '11111111-0008-0008-0008-000000000008', '22222222-0002-0002-0002-000000000002', '2026-01-25 09:00:00+04');

-- ========== AFTER RUNNING THIS ==========
-- 1. Go to Authentication → Users and create a user (or use an existing one).
-- 2. Copy that user's UUID (id).
-- 3. Run this in a NEW query (replace YOUR_USER_UUID with the actual id):
--
--   INSERT INTO admin_profiles (id, role) VALUES ('YOUR_USER_UUID', 'super_admin');
--
-- 4. Run `supabase/storage-setup.sql` to create image buckets and policies.
