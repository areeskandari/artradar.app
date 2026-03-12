'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Input'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DonateFormProps {
  suggestedAmounts: number[]
}

export function DonateForm({ suggestedAmounts }: DonateFormProps) {
  const searchParams = useSearchParams()
  const [amount, setAmount] = useState<string>('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const cancelled = searchParams.get('cancelled')
    if (success === '1') {
      setMessage({ type: 'success', text: 'Thank you for your donation. Your support means a lot to us.' })
    } else if (cancelled === '1') {
      setMessage({ type: 'error', text: 'Donation was cancelled. No charge was made.' })
    }
  }, [searchParams])

  function selectPreset(value: number) {
    setSelectedPreset(value)
    setAmount(String(value))
  }

  function handleCustomChange(value: string) {
    setAmount(value)
    const num = parseFloat(value)
    setSelectedPreset(suggestedAmounts.includes(num) ? num : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    const value = parseFloat(amount)
    if (Number.isNaN(value) || value < 1) {
      setMessage({ type: 'error', text: 'Please enter at least $1.' })
      return
    }
    if (value > 100_000) {
      setMessage({ type: 'error', text: 'Maximum donation is $100,000.' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong.' })
        setLoading(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setMessage({ type: 'error', text: 'Could not start checkout.' })
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            message.type === 'success' && 'bg-green-50 text-green-800 border border-green-200',
            message.type === 'error' && 'bg-red-50 text-red-800 border border-red-200'
          )}
        >
          {message.text}
        </div>
      )}

      <div>
        <Label>Choose an amount (USD)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {suggestedAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => selectPreset(value)}
              className={cn(
                'py-3 px-4 rounded-lg border text-sm font-medium transition-colors',
                selectedPreset === value
                  ? 'border-gold-500 bg-gold-50 text-gold-800'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-gold-300 hover:bg-gold-50/50'
              )}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="custom-amount">Or enter a custom amount ($)</Label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-ink-500">$</span>
          <Input
            id="custom-amount"
            type="number"
            min={1}
            max={100000}
            step={1}
            placeholder="e.g. 25"
            value={amount}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="max-w-[140px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={loading || !amount || parseFloat(amount) < 1}
        className="w-full sm:w-auto min-w-[200px]"
      >
        {loading ? (
          'Redirecting to checkout…'
        ) : (
          <>
            <Heart size={18} className="shrink-0" />
            Donate ${amount ? parseFloat(amount).toFixed(0) : '—'}
          </>
        )}
      </Button>
    </form>
  )
}
