import { cache } from 'react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { KEEP_ON_YOUR_RADAR } from '@/lib/keep-on-your-radar'

export const SPECIAL_EVENT_PAGES = [
  {
    slug: KEEP_ON_YOUR_RADAR.slug,
    title: KEEP_ON_YOUR_RADAR.title,
    path: `/events/${KEEP_ON_YOUR_RADAR.slug}`,
  },
] as const

export type SpecialEventSlug = (typeof SPECIAL_EVENT_PAGES)[number]['slug']

export const getSpecialEventFlags = cache(async (): Promise<Record<string, boolean>> => {
  const defaults = Object.fromEntries(SPECIAL_EVENT_PAGES.map((event) => [event.slug, true])) as Record<string, boolean>

  try {
    const supabase = await createPublicDataClient()
    const { data, error } = await supabase.from('special_events').select('slug, enabled')
    if (error || !data) return defaults

    const flags = { ...defaults }
    for (const row of data as { slug: string; enabled: boolean }[]) {
      if (row.slug in flags) flags[row.slug] = row.enabled
    }
    return flags
  } catch {
    return defaults
  }
})

export async function isSpecialEventEnabled(slug: SpecialEventSlug): Promise<boolean> {
  const flags = await getSpecialEventFlags()
  return flags[slug] !== false
}
