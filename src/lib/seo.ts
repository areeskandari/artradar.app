import type { Artist, Collaboration, Event, Gallery, NewsPost } from '@/types'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://artradar.app'
export const SITE_NAME = 'Art Radar'

export const SITE_DESCRIPTION =
  'Art Radar is a curated guide to galleries, exhibitions, artists, and cultural events in Dubai, Abu Dhabi, and the wider MENA region.'

export const SITE_TAGLINE =
  'Your reference for art, galleries, and artists across Dubai, Abu Dhabi, and MENA.'

export const AI_CRAWLER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Bytespider',
  'CCBot',
] as const

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Art Radar?',
    answer:
      'Art Radar is a free online guide to the art scene in Dubai, Abu Dhabi, and the wider MENA region. It lists galleries, exhibitions, artists, open calls, competitions, prizes, and art news in one searchable directory and calendar.',
  },
  {
    question: 'Where can I find art exhibitions in Dubai?',
    answer:
      'Browse the Art Radar events calendar at artradar.app/events or the homepage section “This week in Dubai.” Filter by area (DIFC, Alserkal Avenue, Downtown, JBR, Abu Dhabi), event type, and date to find current and upcoming exhibitions.',
  },
  {
    question: 'What art prizes and competitions are listed in the UAE?',
    answer:
      'Art Radar tracks open calls, competitions, and prizes across the UAE and wider MENA region at artradar.app/collaboration/prizes, artradar.app/collaboration/competitions, and artradar.app/collaboration/open-calls. Each listing includes deadlines, regions, and application links where available.',
  },
  {
    question: 'How do I find UAE galleries and artists?',
    answer:
      'Use the galleries directory at artradar.app/galleries to search by name, area, or venue type (gallery, museum, library). Artist profiles are at artradar.app/artists, with bios and linked exhibitions. Both directories are updated as new listings are added.',
  },
  {
    question: 'Is Art Radar free to use?',
    answer:
      'Yes. Browsing galleries, events, artists, news, and collaboration listings on Art Radar is free. Galleries and artists can contact Art Radar to request listing updates or new entries.',
  },
  {
    question: 'What areas does Art Radar cover?',
    answer:
      'Art Radar focuses on Dubai and Abu Dhabi, with listings across DIFC, Alserkal Avenue, Downtown, JBR, and other UAE areas. Collaboration listings may also cover the wider GCC, Europe, North America, and Canada when organisers specify those regions.',
  },
]

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    description: SITE_DESCRIPTION,
    sameAs: [] as string[],
  }
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/ask?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function eventSchema(event: Event) {
  const gallery = event.gallery
  return {
    '@type': 'Event',
    name: event.title,
    description: event.description || undefined,
    startDate: event.start_date || event.opening_date || undefined,
    endDate: event.end_date || undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: event.image_url || absoluteUrl(`/events/${event.slug}`),
    url: absoluteUrl(`/events/${event.slug}`),
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location,
          address: gallery?.address
            ? {
                '@type': 'PostalAddress',
                streetAddress: gallery.address,
                addressLocality: gallery.area || 'Dubai',
                addressCountry: 'AE',
              }
            : undefined,
        }
      : gallery?.name
        ? { '@type': 'Place', name: gallery.name }
        : undefined,
    organizer: gallery
      ? { '@type': 'Organization', name: gallery.name, url: absoluteUrl(`/galleries/${gallery.slug}`) }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}

export function personSchema(artist: Artist) {
  return {
    '@type': 'Person',
    name: artist.name,
    description: artist.bio || undefined,
    image: artist.profile_image_url || undefined,
    url: absoluteUrl(`/artists/${artist.slug}`),
    jobTitle: 'Artist',
    nationality: artist.nationality || undefined,
    homeLocation: artist.city ? { '@type': 'Place', name: artist.city } : undefined,
    sameAs: [artist.website, artist.instagram].filter(Boolean) as string[],
  }
}

export function gallerySchema(gallery: Gallery) {
  return {
    '@type': 'ArtGallery',
    name: gallery.name,
    description: gallery.description || undefined,
    image: gallery.cover_image_url || gallery.logo_url || undefined,
    url: absoluteUrl(`/galleries/${gallery.slug}`),
    address: gallery.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: gallery.address,
          addressLocality: gallery.area || 'Dubai',
          addressCountry: 'AE',
        }
      : undefined,
    telephone: gallery.phone || undefined,
    email: gallery.email || undefined,
    sameAs: [gallery.website, gallery.instagram].filter(Boolean) as string[],
  }
}

export function articleSchema(post: NewsPost) {
  return {
    '@type': 'Article',
    headline: post.title,
    description: post.content?.slice(0, 300) || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.publish_date,
    dateModified: post.created_at,
    url: absoluteUrl(`/news/${post.slug}`),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
  }
}

export function collaborationSchema(item: Collaboration) {
  return {
    '@type': 'Event',
    name: item.title,
    description: item.description || undefined,
    startDate: item.created_at,
    endDate: item.deadline || undefined,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: item.deadline ? 'https://schema.org/EventScheduled' : undefined,
    image: item.cover_image_url || undefined,
    url: absoluteUrl(`/collaboration/${item.slug}`),
    organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}

export function buildLlmsTxt(): string {
  const pages = [
    { path: '/', desc: 'Homepage — galleries, events, artists, news, and map for Dubai and MENA art' },
    { path: '/galleries', desc: 'Searchable directory of galleries, museums, and libraries' },
    { path: '/events', desc: 'Exhibitions, talks, workshops, openings, and performances calendar' },
    { path: '/artists', desc: 'Artist profiles with bios and linked exhibitions' },
    { path: '/news', desc: 'Art news and editorial updates from the UAE art scene' },
    { path: '/collaboration/open-calls', desc: 'Open calls for artists and curators' },
    { path: '/collaboration/competitions', desc: 'Art competitions across UAE and MENA' },
    { path: '/collaboration/prizes', desc: 'Art prizes and awards in the Emirates and region' },
    { path: '/map', desc: 'Map of galleries and events across Dubai' },
    { path: '/timeline', desc: 'Chronological view of art events and milestones' },
    { path: '/ask', desc: 'AI assistant for questions about Dubai art scene' },
    { path: '/about', desc: 'About Art Radar — mission, team, and editorial policy' },
    { path: '/for-galleries', desc: 'Information for galleries listing on Art Radar' },
    { path: '/contact', desc: 'Contact Art Radar for listings and questions' },
  ]

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

${SITE_DESCRIPTION}

## Key pages

${pages.map((p) => `- [${absoluteUrl(p.path)}](${absoluteUrl(p.path)}) — ${p.desc}`).join('\n')}

## What Art Radar covers

- **Galleries**: DIFC, Alserkal Avenue, Downtown, JBR, Abu Dhabi, and other UAE areas
- **Events**: Exhibitions, talks, art fairs, workshops, openings, performances
- **Artists**: Profiles with bios and exhibition history
- **Collaborations**: Open calls, competitions, and prizes in UAE and MENA
- **News**: Opening announcements and art-world updates

## Contact

- Website: ${SITE_URL}
- Email: hello@dubaiartradar.com
`
}
