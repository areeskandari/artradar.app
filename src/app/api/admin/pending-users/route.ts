import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/** GET: List auth users who don't have an admin_profiles row (super_admin only). */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = await createAdminClient()
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers({ per_page: 1000 })
    if (listError) {
      console.error('listUsers error:', listError)
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
    }

    const { data: profiles } = await admin.from('admin_profiles').select('id')
    const assignedIds = new Set((profiles || []).map((p) => p.id))

    const pending = (users || [])
      .filter((u) => !assignedIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? undefined,
        created_at: u.created_at,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ pending })
  } catch (e) {
    console.error('pending-users error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
