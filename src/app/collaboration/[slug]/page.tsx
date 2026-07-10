import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ExternalLink, Mail, Star, Download, MessageCircle } from 'lucide-react'
import { getCollaborationBySlug, getNewsByCollaborationId } from '@/lib/data/queries'
import { CollaborationCategoryBadge } from '@/components/ui/CollaborationCategoryBadge'
import { CollaborationRegionBadges } from '@/components/ui/CollaborationRegionBadges'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NewsCard } from '@/components/cards/NewsCard'
import {
  appendCollaborationUtm,
  formatDate,
  formatFileSize,
  getAttachmentExtension,
  getCollaborationContactLinks,
  getPlaceholderImage,
  isDeadlineOpen,
  stripHtml,
} from '@/lib/utils'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema, collaborationSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getCollaborationBySlug(slug)
  if (!item) return {}
  const description = stripHtml(item.description)?.slice(0, 160) || `${item.title} — Art Radar`
  const imageUrl = item.cover_image_url || getPlaceholderImage('collaboration', slug)
  return {
    title: item.title,
    description,
    openGraph: {
      title: `${item.title} | Art Radar`,
      description,
      url: `/collaboration/${slug}`,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: item.title }],
    },
    twitter: { card: 'summary_large_image', title: item.title, description },
    alternates: { canonical: `/collaboration/${slug}` },
  }
}

export default async function CollaborationDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getCollaborationBySlug(slug)
  if (!item) notFound()

  const relatedNews = await getNewsByCollaborationId(item.id)

  const imageSrc = item.cover_image_url || getPlaceholderImage('collaboration', item.slug)
  const open = isDeadlineOpen(item.deadline)
  const externalUrl = item.external_link
    ? appendCollaborationUtm(item.external_link, item.category, item.slug)
    : null
  const extraPhotos = item.photos.filter((url) => url && url !== item.cover_image_url)
  const applyLabel =
    item.category === 'competition'
      ? 'Enter Competition'
      : item.category === 'prize'
        ? 'Apply for Prize'
        : 'Apply / Submit'
  const contact = getCollaborationContactLinks(item)
  const hasContactCta = contact.mailtoUrl || contact.whatsappUrl
  const contactNotes = item.contact_info?.trim()
  const showContactNotes = contactNotes && contactNotes !== contact.email && contactNotes !== contact.whatsapp

  return (
    <div className="animate-fade-in">
      <JsonLd
        data={[
          collaborationSchema(item),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            {
              name: item.category === 'prize' ? 'Prizes' : item.category === 'competition' ? 'Competitions' : 'Open Calls',
              path:
                item.category === 'prize'
                  ? '/collaboration/prizes'
                  : item.category === 'competition'
                    ? '/collaboration/competitions'
                    : '/collaboration/open-calls',
            },
            { name: item.title, path: `/collaboration/${item.slug}` },
          ]),
        ]}
      />
      <div className="relative h-72 sm:h-[28rem] overflow-hidden bg-ink-900">
        <Image src={imageSrc} alt={item.title} fill className="object-cover opacity-85" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap gap-2 mb-4">
            <CollaborationCategoryBadge category={item.category} />
            <CollaborationRegionBadges regions={item.regions} />
            {item.is_featured && (
              <Badge variant="featured">
                <Star size={10} fill="currentColor" /> Featured
              </Badge>
            )}
            {!open && <Badge className="bg-ink-700 text-white border-ink-800">Closed</Badge>}
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-white leading-tight max-w-3xl">
            {item.title}
          </h1>
          {item.deadline && (
            <p className="mt-3 text-white/80 flex items-center gap-2 text-sm sm:text-base">
              <Clock size={16} />
              {open ? 'Deadline' : 'Closed on'}: {formatDate(item.deadline, 'EEEE, dd MMM yyyy')}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 min-w-0">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {item.description && (
              <div>
                <h2 className="type-h2 mb-4">About</h2>
                <div
                  className="prose-art max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
            )}

            {item.attachments.length > 0 && (
              <div>
                <h2 className="type-h2 mb-4">Attachments</h2>
                <ul className="space-y-2">
                  {item.attachments.map((att) => (
                    <li key={att.url}>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={att.name}
                        className="flex items-center gap-3 p-4 rounded-lg border border-ink-200 bg-card hover:border-gold-300 hover:bg-gold-50/50 transition-colors group"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-ink-100 text-xs font-semibold text-ink-600 group-hover:bg-gold-100 group-hover:text-gold-800">
                          {getAttachmentExtension(att.name)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-ink-900 truncate group-hover:text-gold-700">
                            {att.name}
                          </span>
                          {att.size ? (
                            <span className="text-xs text-ink-500">{formatFileSize(att.size)}</span>
                          ) : null}
                        </span>
                        <Download size={16} className="shrink-0 text-ink-400 group-hover:text-gold-600" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {extraPhotos.length > 0 && (
              <div>
                <h2 className="type-h2 mb-4">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {extraPhotos.map((url, i) => (
                    <div key={url} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-ink-100">
                      <Image
                        src={url}
                        alt={`${item.title} — photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedNews.length > 0 && (
              <div>
                <h2 className="type-h2 mb-4">Related News</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {relatedNews.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5 min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card border border-ink-200 rounded-xl p-5 shadow-sm">
              {externalUrl ? (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="gold" className="w-full text-base py-3">
                    {applyLabel} <ExternalLink size={16} />
                  </Button>
                </a>
              ) : (
                <p className="text-sm text-ink-500 text-center">No application link provided.</p>
              )}
              {item.deadline && (
                <div className="mt-4 pt-4 border-t border-ink-100 flex items-start gap-3 text-sm">
                  <Calendar size={16} className="text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-ink-500 uppercase tracking-wider font-medium mb-0.5">
                      Submission deadline
                    </p>
                    <p className={open ? 'text-ink-900 font-medium' : 'text-ink-500'}>
                      {formatDate(item.deadline, 'EEEE, dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {(hasContactCta || contactNotes) && (
              <div className="bg-ink-50 border border-ink-200 rounded-xl p-5">
                <h3 className="font-medium text-ink-900 mb-3 flex items-center gap-2">
                  <Mail size={16} className="text-gold-500" /> Contact
                </h3>
                {hasContactCta && (
                  <div className="flex flex-col gap-2 mb-3">
                    {contact.mailtoUrl && (
                      <a href={contact.mailtoUrl}>
                        <Button variant="primary" className="w-full">
                          <Mail size={16} /> Email {contact.email}
                        </Button>
                      </a>
                    )}
                    {contact.whatsappUrl && (
                      <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white border-[#25D366]">
                          <MessageCircle size={16} /> WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                )}
                {(showContactNotes || (!hasContactCta && contactNotes)) && (
                  <p className="text-sm text-ink-600 whitespace-pre-line">{contactNotes}</p>
                )}
              </div>
            )}

            <div className="bg-ink-50 border border-ink-200 rounded-xl p-5 text-sm text-ink-600">
              <p className="mb-3">Questions about this listing?</p>
              <Link href="/contact" className="text-gold-600 hover:text-gold-700 font-medium">
                Contact Art Radar →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
