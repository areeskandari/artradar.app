-- Dubai Art Radar — Supabase Storage setup
-- Run in Supabase Dashboard → SQL Editor

-- Buckets (public read)
insert into storage.buckets (id, name, public)
values
  ('gallery-images', 'gallery-images', true),
  ('event-images', 'event-images', true),
  ('artist-images', 'artist-images', true),
  ('news-images', 'news-images', true)
on conflict (id) do nothing;

-- Objects policies
-- Public read for these buckets
drop policy if exists "Public can read gallery images" on storage.objects;
create policy "Public can read gallery images" on storage.objects
for select using (bucket_id in ('gallery-images', 'event-images', 'artist-images', 'news-images'));

-- Super admin can upload/update/delete
drop policy if exists "Super admin manages images" on storage.objects;
create policy "Super admin manages images" on storage.objects
for all
using (public.is_super_admin() and bucket_id in ('gallery-images', 'event-images', 'artist-images', 'news-images'))
with check (public.is_super_admin() and bucket_id in ('gallery-images', 'event-images', 'artist-images', 'news-images'));

