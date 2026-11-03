import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SPECIAL_EVENT_PAGES } from '@/lib/special-events'

/** POST: Toggle a special event page on/off (super_admin only). Body: { slug: string, enabled: boolean } */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
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
    const { slug, enabled } = body as { slug?: string; enabled?: boolean }
    const known = SPECIAL_EVENT_PAGES.some((event) => event.slug === slug)

    if (!slug || !known || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid slug or enabled' }, { status: 400 })
    }

    const { error } = await supabase.from('special_events').upsert({
      slug,
      enabled,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json(
        {
          error: error.message.includes('special_events')
            ? 'Run supabase/special-events.sql in the Supabase SQL editor, then try again.'
            : error.message,
        },
        { status: 500 }
      )
    }

    revalidatePath('/events')
    revalidatePath(`/events/${slug}`)
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ ok: true, slug, enabled })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
