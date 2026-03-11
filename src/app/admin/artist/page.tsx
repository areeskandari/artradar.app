import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArtistAdminClient } from './ArtistAdminClient'

export default async function ArtistAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['artist', 'super_admin'].includes(profile.role)) {
    redirect('/admin')
  }

  const artistId = profile.artist_id

  const { data: artist } = artistId
    ? await supabase.from('artists').select('*').eq('id', artistId).single()
    : { data: null }

  if (!artist) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-ink-900 mb-2">No Artist Profile</h1>
        <p className="text-ink-500">Contact a super admin to create your artist profile.</p>
      </div>
    )
  }

  return <ArtistAdminClient artist={artist} />
}
