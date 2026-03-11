import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type SourceType = 'gallery' | 'event' | 'artist' | 'news'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('admin_profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const sourceType = body?.sourceType as SourceType | undefined

  const admin = await createAdminClient()

  const types: SourceType[] = sourceType ? [sourceType] : ['gallery', 'event', 'artist', 'news']
  let total = 0

  for (const t of types) {
    const table = t === 'gallery' ? 'galleries' : t === 'event' ? 'events' : t === 'artist' ? 'artists' : 'news'
    const { data, error } = await admin.from(table).select('id').limit(5000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    for (const row of data || []) {
      const { error: rpcErr } = await admin.rpc('refresh_rag_document', {
        p_source_type: t,
        p_source_id: row.id,
      })
      if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 })
      total += 1
    }
  }

  return NextResponse.json({ backfilled: total })
}

