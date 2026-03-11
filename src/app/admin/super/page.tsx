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

  const [galleriesRes, artistsRes, eventsRes, newsRes, subscribersRes] = await Promise.all([
    supabase.from('galleries').select('*').order('name'),
    supabase.from('artists').select('*').order('name'),
    supabase.from('events').select('*, gallery:galleries(name)').order('start_date', { ascending: false }),
    supabase.from('news').select('*').order('publish_date', { ascending: false }),
    supabase.from('subscribers').select('*').order('created_at', { ascending: false }).limit(50),
  ])

  return (
    <SuperAdminClient
      galleries={galleriesRes.data || []}
      artists={artistsRes.data || []}
      events={eventsRes.data || []}
      news={newsRes.data || []}
      subscribers={subscribersRes.data || []}
    />
  )
}
