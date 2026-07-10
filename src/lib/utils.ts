import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import type { EventType, GalleryArea, GalleryType, CollaborationCategory, CollaborationRegion } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Strip HTML tags for use in meta description / plain text. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export function formatDate(date: string | null, formatStr = 'dd MMM yyyy'): string {
  if (!date) return ''
  try {
    return format(parseISO(date), formatStr)
  } catch {
    return ''
  }
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return ''
  if (!end) return formatDate(start)

  const startDate = parseISO(start)
  const endDate = parseISO(end)

  if (format(startDate, 'MMM yyyy') === format(endDate, 'MMM yyyy')) {
    return `${format(startDate, 'dd')}–${format(endDate, 'dd MMM yyyy')}`
  }
  return `${format(startDate, 'dd MMM')} – ${format(endDate, 'dd MMM yyyy')}`
}

export function isEventActive(start: string | null, end: string | null): boolean {
  if (!start || !end) return false
  const now = new Date()
  return !isBefore(now, parseISO(start)) && !isAfter(now, parseISO(end))
}

export function isEventUpcoming(start: string | null): boolean {
  if (!start) return false
  return isAfter(parseISO(start), new Date())
}

export function getPlaceholderImage(type: 'gallery' | 'event' | 'artist' | 'news' | 'collaboration', seed?: string): string {
  const seeds: Record<string, number> = {
    gallery: 1,
    event: 2,
    artist: 3,
    news: 4,
    collaboration: 5,
  }
  return `https://picsum.photos/seed/${seed || seeds[type]}/800/600`
}

export const GALLERY_AREAS: { value: GalleryArea; label: string }[] = [
  { value: 'DIFC', label: 'DIFC' },
  { value: 'Alserkal Avenue', label: 'Alserkal Avenue' },
  { value: 'Downtown', label: 'Downtown' },
  { value: 'JBR', label: 'JBR' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Other', label: 'Other' },
]

export const GALLERY_TYPES: { value: GalleryType; label: string }[] = [
  { value: 'gallery', label: 'Gallery' },
  { value: 'museum', label: 'Museum' },
  { value: 'library', label: 'Library' },
]

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'talk', label: 'Talk' },
  { value: 'art_fair', label: 'Art Fair' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'opening', label: 'Opening' },
  { value: 'performance', label: 'Performance' },
]

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; short?: string; bg: string; color: string }
> = {
  exhibition: { label: 'Exhibition', short: 'Exhib', bg: 'bg-ink-100', color: 'text-ink-800 border-ink-200' },
  talk: { label: 'Talk', bg: 'bg-gold-50', color: 'text-gold-800 border-gold-200' },
  art_fair: { label: 'Art Fair', bg: 'bg-terracotta-50', color: 'text-terracotta-800 border-terracotta-200' },
  workshop: { label: 'Workshop', bg: 'bg-ink-50', color: 'text-ink-700 border-ink-200' },
  opening: { label: 'Opening', bg: 'bg-gold-100', color: 'text-gold-900 border-gold-300' },
  performance: { label: 'Performance', bg: 'bg-ink-100', color: 'text-ink-800 border-ink-200' },
}

export const COLLABORATION_CATEGORIES: { value: CollaborationCategory; label: string }[] = [
  { value: 'open_call', label: 'Open Call' },
  { value: 'competition', label: 'Competition' },
  { value: 'prize', label: 'Prize' },
]

export const COLLABORATION_REGIONS: { value: CollaborationRegion; label: string }[] = [
  { value: 'gcc', label: 'GCC' },
  { value: 'europe', label: 'EUROPE' },
  { value: 'usa', label: 'USA' },
  { value: 'canada', label: 'CANADA' },
]

export const COLLABORATION_REGION_CONFIG: Record<
  CollaborationRegion,
  { label: string; bg: string; color: string }
> = {
  gcc: { label: 'GCC', bg: 'bg-gold-100', color: 'text-gold-900 border-gold-300' },
  europe: { label: 'EUROPE', bg: 'bg-ink-100', color: 'text-ink-900 border-ink-300' },
  usa: { label: 'USA', bg: 'bg-terracotta-100', color: 'text-terracotta-900 border-terracotta-300' },
  canada: { label: 'CANADA', bg: 'bg-teal-50', color: 'text-teal-900 border-teal-300' },
}

export const COLLABORATION_CATEGORY_CONFIG: Record<
  CollaborationCategory,
  { label: string; bg: string; color: string }
> = {
  open_call: { label: 'Open Call', bg: 'bg-gold-50', color: 'text-gold-800 border-gold-200' },
  competition: { label: 'Competition', bg: 'bg-terracotta-50', color: 'text-terracotta-800 border-terracotta-200' },
  prize: { label: 'Prize', bg: 'bg-teal-50', color: 'text-teal-800 border-teal-200' },
}

export function isDeadlineOpen(deadline: string | null): boolean {
  if (!deadline) return true
  return isAfter(parseISO(deadline), new Date())
}

/** Append Art Radar UTM params to external collaboration links. */
export function appendCollaborationUtm(
  url: string,
  category: CollaborationCategory,
  slug: string
): string {
  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('utm_source')) parsed.searchParams.set('utm_source', 'artradar')
    if (!parsed.searchParams.has('utm_medium')) parsed.searchParams.set('utm_medium', 'collaboration')
    if (!parsed.searchParams.has('utm_campaign')) parsed.searchParams.set('utm_campaign', category)
    if (!parsed.searchParams.has('utm_content')) parsed.searchParams.set('utm_content', slug)
    return parsed.toString()
  } catch {
    return url
  }
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getAttachmentExtension(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()?.toUpperCase() : ''
  return ext || 'FILE'
}

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/

export function extractEmailFromText(text: string): string | null {
  const match = text.match(EMAIL_REGEX)
  return match ? match[0] : null
}

export function extractPhoneFromText(text: string): string | null {
  const match = text.match(PHONE_REGEX)
  return match ? match[0].trim() : null
}

export function normalizeWhatsAppNumber(input: string): string {
  return input.replace(/\D/g, '')
}

export function buildCollaborationMailtoUrl(email: string, title: string): string {
  const subject = encodeURIComponent(`Inquiry: ${title}`)
  const body = encodeURIComponent(
    `Hi,\n\nI'm interested in "${title}" on Art Radar.\n\n`
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
}

export function buildCollaborationWhatsAppUrl(phone: string, title: string): string {
  const digits = normalizeWhatsAppNumber(phone)
  const text = encodeURIComponent(
    `Hi, I'm interested in "${title}" listed on Art Radar. Could you share more details?`
  )
  return `https://wa.me/${digits}?text=${text}`
}

export function getCollaborationContactLinks(
  item: {
    title: string
    contact_email?: string | null
    contact_whatsapp?: string | null
    contact_info?: string | null
  }
) {
  const email =
    item.contact_email?.trim() ||
    (item.contact_info ? extractEmailFromText(item.contact_info) : null)
  const whatsapp =
    item.contact_whatsapp?.trim() ||
    (item.contact_info ? extractPhoneFromText(item.contact_info) : null)

  return {
    email: email || null,
    whatsapp: whatsapp || null,
    mailtoUrl: email ? buildCollaborationMailtoUrl(email, item.title) : null,
    whatsappUrl: whatsapp ? buildCollaborationWhatsAppUrl(whatsapp, item.title) : null,
  }
}
