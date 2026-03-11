import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Globe, Instagram, CheckCircle, Users, ExternalLink } from 'lucide-react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/cards/EventCard'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { Badge } from '@/components/ui/Badge'
import { getPlaceholderImage, stripHtml } from '@/lib/utils'
import type { Gallery, Event } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createPublicDataClient()
  const { data: artist } = await supabase.from('artists').select('name, bio, profile_image_url').eq('slug', slug).single()
  if (!artist) return {}
  const description = stripHtml(artist.bio)?.slice(0, 160) || `Artist profile: ${artist.name} — Art Radar`
  const imageUrl = artist.profile_image_url || getPlaceholderImage('artist', slug)
  return {
    title: artist.name,
    description,
    openGraph: {
      title: `${artist.name} | Art Radar`,
      description,
      url: `/artists/${slug}`,
      type: 'profile',
      images: [{ url: imageUrl, width: 600, height: 600, alt: artist.name }],
    },
    twitter: { card: 'summary_large_image', title: artist.name, description },
    alternates: { canonical: `/artists/${slug}` },
  }
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createPublicDataClient()

  const { data: artist } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!artist) notFound()

  const [galleryLinks, eventLinks] = await Promise.all([
    supabase.from('gallery_artists').select('gallery:galleries(*)').eq('artist_id', artist.id),
    supabase
      .from('event_artists')
      .select('event:events(*, gallery:galleries(id, name, slug))')
      .eq('artist_id', artist.id),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const galleries = ((galleryLinks.data || []).map((r: any) => r.gallery)) as Gallery[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = ((eventLinks.data || []).map((r: any) => r.event)) as Event[]

  const imageSrc = artist.profile_image_url || getPlaceholderImage('artist', artist.slug)

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-ink-100 max-w-xs mx-auto lg:max-w-full">
                <Image src={imageSrc} alt={artist.name} fill className="object-cover object-top" sizes="(max-width: 1024px) 50vw, 25vw" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl text-ink-900">{artist.name}</h1>
                  {artist.is_verified && <CheckCircle size={18} className="text-blue-500" />}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {artist.pro_subscription_active && <Badge variant="pro">PRO</Badge>}
                  {artist.is_verified && <Badge variant="verified">Verified</Badge>}
                  {artist.open_to_collaboration && (
                    <Badge className="bg-green-50 border-green-200 text-green-700">
                      <Users size={10} /> Open to Collab
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-ink-500">
                  {[artist.nationality, artist.city].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink-600 hover:text-gold-600 transition-colors">
                    <Globe size={14} className="text-gold-500" /> Website <ExternalLink size={11} />
                  </a>
                )}
                {artist.instagram && (
                  <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink-600 hover:text-gold-600 transition-colors">
                    <Instagram size={14} className="text-gold-500" /> {artist.instagram} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-10">
            {artist.bio && (
              <div>
                <h2 className="font-serif text-2xl text-ink-900 mb-3">About</h2>
                <div className="gold-divider w-24 mb-4" />
                <div
                  className="prose-art max-w-none"
                  dangerouslySetInnerHTML={{ __html: artist.bio }}
                />
              </div>
            )}

            {galleries.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-900 mb-4">Galleries</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleries.map((gallery) => (
                    <GalleryCard key={gallery.id} gallery={gallery} />
                  ))}
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-900 mb-4">Exhibitions & Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
