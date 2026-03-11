import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/** POST: Assign admin role to a user (super_admin only). Body: { userId: string, role: 'super_admin' | 'gallery_admin' | 'artist', galleryId?: string, artistId?: string } */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { userId, role, galleryId, artistId } = body as {
      userId: string
      role: 'super_admin' | 'gallery_admin' | 'artist'
      galleryId?: string
      artistId?: string
    }

    if (!userId || !role || !['super_admin', 'gallery_admin', 'artist'].includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { error } = await admin.from('admin_profiles').insert({
      id: userId,
      role,
      gallery_id: role === 'gallery_admin' ? galleryId || null : null,
      artist_id: role === 'artist' ? artistId || null : null,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'User already has an admin profile' }, { status: 409 })
      }
      console.error('assign-role insert error:', error)
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('assign-role error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
