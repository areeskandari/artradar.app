import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SuperAdminClient } from './SuperAdminClient'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    redirect('/admin')
  }

  const [galleriesRes, artistsRes, eventsRes, newsRes, subscribersRes, galleryArtistsRes, eventArtistsRes, galleryAreasRes] = await Promise.all([
    supabase.from('galleries').select('*').order('name'),
    supabase.from('artists').select('*').order('name'),
    supabase.from('events').select('*, gallery:galleries(name)').order('start_date', { ascending: false }),
    supabase.from('news').select('*').order('publish_date', { ascending: false }),
    supabase.from('subscribers').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('gallery_artists').select('gallery_id, artist_id'),
    supabase.from('event_artists').select('event_id, artist_id'),
    supabase.from('gallery_areas').select('*').order('sort_order').order('label'),
  ])

  const galleryArtists: Record<string, string[]> = {}
  for (const row of galleryArtistsRes.data || []) {
    const gid = row.gallery_id as string
    if (!galleryArtists[gid]) galleryArtists[gid] = []
    galleryArtists[gid].push(row.artist_id as string)
  }
  const eventArtists: Record<string, string[]> = {}
  for (const row of eventArtistsRes.data || []) {
    const eid = row.event_id as string
    if (!eventArtists[eid]) eventArtists[eid] = []
    eventArtists[eid].push(row.artist_id as string)
  }

  type GalleryAreaRow = { id: string; value: string; label: string; sort_order: number }
  const galleryAreasList = (galleryAreasRes.data || []) as GalleryAreaRow[]

  return (
    <SuperAdminClient
      galleries={galleriesRes.data || []}
      artists={artistsRes.data || []}
      events={eventsRes.data || []}
      news={newsRes.data || []}
      subscribers={subscribersRes.data || []}
      galleryArtists={galleryArtists}
      eventArtists={eventArtists}
      galleryAreas={galleryAreasList}
    />
  )
}
