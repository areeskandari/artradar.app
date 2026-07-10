import type { Metadata } from 'next'
import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist on Art Radar. Browse galleries, events, and artists in Dubai and MENA.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink-100 border border-ink-200 mb-6">
          <FileQuestion className="w-8 h-8 text-ink-600" />
        </div>
        <h1 className="type-h2 mb-2">Page not found</h1>
        <p className="type-small text-ink-600 mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
