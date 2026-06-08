import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Linkedin } from 'lucide-react'
import { PageHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'About',
  description: 'Art Radar is a curated guide to Dubai’s galleries, artists, exhibitions, and cultural events. Our mission and what you’ll find.',
  keywords: ['Art Radar', 'Dubai art guide', 'about Art Radar', 'UAE art scene'],
  openGraph: {
    title: 'About | Art Radar',
    description: 'Art Radar is a curated guide to Dubai’s galleries, artists, exhibitions, and cultural events.',
    url: '/about',
  },
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
}

const TEAM_MEMBERS = [
  {
    name: 'Elnaz Rajabian',
    role: 'Co-Founder & CEO',
    bio: 'Art curator and manager with 13+ years in exhibitions and gallery operations across Dubai and internationally.',
    photo: '/team/elnaz-rajabian.png',
    linkedin: 'https://www.linkedin.com/in/elnaz-rajabyan/',
  },
  {
    name: 'Are Eskandari',
    role: 'Co-Founder & Product',
    bio: 'Builds the platform and shapes how Art Radar helps people discover Dubai\u2019s art scene.',
    photo: '/team/are-eskandari.png',
    linkedin: 'https://www.linkedin.com/in/areeskandari/',
  },
] as const

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Our story"
        title="About Art Radar"
        description="A curated guide to Dubai's galleries, artists, exhibitions, and cultural events — built for people who want to discover what's on, save time, and explore with confidence."
      />

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-card border border-ink-200 rounded-xl p-6 sm:p-8 space-y-4">
          <h2 className="type-h4">Our mission</h2>
          <p className="type-body">
            Make Dubai&rsquo;s art scene easier to navigate — a clean directory, a reliable calendar, and an editorial feed that highlights the most
            relevant openings and announcements.
          </p>
          <p className="type-body">
            We focus on clarity: accurate dates, verified listings, and the right context (where, when, what type of event, and who is exhibiting).
          </p>

          <div className="pt-6 border-t border-ink-200">
            <h3 className="type-h4 mb-4">The team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEAM_MEMBERS.map((member) => (
                <div key={member.linkedin} className="flex items-start gap-4 border border-ink-200 rounded-xl p-4 bg-ink-50">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-ink-100 shrink-0">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover object-top"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="type-h4">{member.name}</p>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-400 hover:text-gold-600 transition-colors"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        <Linkedin size={16} />
                      </a>
                    </div>
                    <p className="type-small text-gold-600 mb-1">{member.role}</p>
                    <p className="type-small text-ink-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-ink-200 rounded-xl p-6 sm:p-8">
          <h2 className="type-h4 mb-4">What you&rsquo;ll find on Art Radar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Galleries directory',
                desc: 'A searchable list of galleries, museums, and cultural spaces across DIFC, Alserkal Avenue, Downtown, and beyond.',
              },
              {
                title: 'Events calendar',
                desc: 'Exhibitions, talks, workshops, openings, performances — with dates, locations, and ticket/admission info.',
              },
              {
                title: 'Artist profiles',
                desc: 'Artist pages with bio, links, and connected exhibitions/events to understand context and practice quickly.',
              },
              {
                title: 'News & updates',
                desc: 'Short editorial posts: opening announcements, programme highlights, and key art-world updates in the UAE.',
              },
            ].map((c) => (
              <div key={c.title} className="border border-ink-200 rounded-xl p-4 bg-ink-50">
                <p className="type-h4 mb-1">{c.title}</p>
                <p className="type-small text-ink-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-ink-200 rounded-xl p-6 sm:p-8 space-y-4">
          <h2 className="type-h4">How listings work (mock policy)</h2>
          <div className="type-small text-ink-700 space-y-3">
            <p>
              - <span className="text-ink-900 font-medium">Galleries</span>: We prioritise accuracy (address, area, links, submission policy when
              available). Updates are welcome anytime.
            </p>
            <p>
              - <span className="text-ink-900 font-medium">Events</span>: Please include title, opening date (if any), exhibition period, location,
              and a press image link or uploaded image. We can also list free RSVP/ticket links.
            </p>
            <p>
              - <span className="text-ink-900 font-medium">Artists</span>: Bios can be short or detailed. We recommend 120–250 words plus links.
            </p>
            <p className="text-xs text-ink-500">
              This is mock text for now — you can replace it with your real editorial and submission rules later.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-300 text-ink-700 hover:bg-ink-50 hover:border-ink-400 transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

