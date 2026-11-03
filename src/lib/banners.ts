import { KEEP_ON_YOUR_RADAR } from '@/lib/keep-on-your-radar'
import { isSpecialEventEnabled } from '@/lib/special-events'

export interface PageBannerItem {
  id: string
  imageSrc: string
  alt: string
  href?: string
  name?: string
  date?: string
  location?: string
}

const KEEP_ON_YOUR_RADAR_BANNER: PageBannerItem = {
  id: KEEP_ON_YOUR_RADAR.slug,
  imageSrc: KEEP_ON_YOUR_RADAR.bannerSrc,
  alt: KEEP_ON_YOUR_RADAR.title,
  href: `/events/${KEEP_ON_YOUR_RADAR.slug}`,
  name: KEEP_ON_YOUR_RADAR.title,
  date: `${KEEP_ON_YOUR_RADAR.dateLabel} · ${KEEP_ON_YOUR_RADAR.timeLabel}`,
  location: KEEP_ON_YOUR_RADAR.locationLabel,
}

export async function getEventsPageBanners(): Promise<PageBannerItem[]> {
  const enabled = await isSpecialEventEnabled(KEEP_ON_YOUR_RADAR.slug)
  return enabled ? [KEEP_ON_YOUR_RADAR_BANNER] : []
}
