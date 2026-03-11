'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // e.g. send to Sentry, LogRocket, etc.
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="font-serif text-2xl text-ink-900 mb-2">Something went wrong</h1>
        <p className="text-ink-600 text-sm mb-6">
          We couldn’t load this page. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary" className="inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Try again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
