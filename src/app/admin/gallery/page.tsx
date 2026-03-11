import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GalleryAdminClient } from './GalleryAdminClient'
import type { Artist } from '@/types'

export default async function GalleryAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['gallery_admin', 'super_admin'].includes(profile.role)) {
    redirect('/admin')
  }

  // For super admin, they can pick any gallery — for now show first
  const galleryId = profile.gallery_id

  const { data: gallery } = galleryId
    ? await supabase.from('galleries').select('*').eq('id', galleryId).single()
    : await supabase.from('galleries').select('*').order('name').limit(1).single()

  if (!gallery) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-ink-900 mb-2">No Gallery Assigned</h1>
        <p className="text-ink-500">Contact your super admin to be assigned to a gallery.</p>
      </div>
    )
  }

  const [eventsRes, subscribersRes, artistsRes] = await Promise.all([
    supabase.from('events').select('*').eq('gallery_id', gallery.id).order('start_date', { ascending: false }),
    supabase.from('subscribers').select('*').eq('source_type', 'gallery').eq('source_id', gallery.id).order('created_at', { ascending: false }),
    supabase.from('gallery_artists').select('artist:artists(*)').eq('gallery_id', gallery.id),
  ])

  return (
    <GalleryAdminClient
      gallery={gallery}
      events={eventsRes.data || []}
      subscribers={subscribersRes.data || []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      artists={((artistsRes.data || []) as any[]).map((r: any) => r.artist) as Artist[]}
    />
  )
}
