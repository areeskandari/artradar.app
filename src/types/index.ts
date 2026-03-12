export type GalleryArea = 'Downtown' | 'DIFC' | 'Alserkal Avenue' | 'JBR' | 'Abu Dhabi' | 'Other'
export type GalleryType = 'gallery' | 'museum' | 'library'
export type EventType = 'exhibition' | 'talk' | 'art_fair' | 'workshop' | 'opening' | 'performance'
export type AdminRole = 'super_admin' | 'gallery_admin' | 'artist'
export type SourceType = 'gallery' | 'event' | 'artist' | 'newsletter'

export interface Gallery {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  area: GalleryArea | null
  type: GalleryType | null
  website: string | null
  instagram: string | null
  email: string | null
  phone: string | null
  submission_policy: string | null
  founded_year: number | null
  logo_url: string | null
  cover_image_url: string | null
  social_links: Record<string, string>
  is_featured: boolean
  subscription_active: boolean
  subscription_ends_at: string | null
  stripe_customer_id: string | null
  created_at: string
  lat: number | null
  lng: number | null
  // Computed/joined fields
  upcoming_events_count?: number
  events?: Event[]
  artists?: Artist[]
}

export interface Artist {
  id: string
  name: string
  slug: string
  nationality: string | null
  city: string | null
  bio: string | null
  website: string | null
  instagram: string | null
  profile_image_url: string | null
  open_to_collaboration: boolean
  is_verified: boolean
  pro_subscription_active: boolean
  pro_ends_at: string | null
  stripe_customer_id: string | null
  created_at: string
  // Joined fields
  galleries?: Gallery[]
  events?: Event[]
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  start_date: string | null
  end_date: string | null
  opening_date: string | null
  location: string | null
  gallery_id: string | null
  event_type: EventType | null
  ticket_info: string | null
  vip_access: boolean
  image_url: string | null
  external_link: string | null
  created_by: string | null
  is_featured: boolean
  created_at: string
  lat: number | null
  lng: number | null
  // Joined fields
  gallery?: Gallery
  artists?: Artist[]
}

export interface NewsPost {
  id: string
  title: string
  slug: string
  content: string | null
  cover_image_url: string | null
  related_gallery_id: string | null
  related_artist_id: string | null
  publish_date: string
  created_at: string
  // Joined fields
  related_gallery?: Gallery
  related_artist?: Artist
}

export interface Subscriber {
  id: string
  name: string
  email: string
  phone: string | null
  source_type: SourceType | null
  source_id: string | null
  created_at: string
}

export interface AdminProfile {
  id: string
  role: AdminRole
  gallery_id: string | null
  artist_id: string | null
  created_at: string
}
