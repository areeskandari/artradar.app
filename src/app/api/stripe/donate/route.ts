import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { PAYMENTS_DISABLED } from '@/lib/constants'

const MIN_CENTS = 100   // $1
const MAX_CENTS = 10_000_000 // $100,000

export async function POST(req: NextRequest) {
  try {
    if (PAYMENTS_DISABLED) {
      return NextResponse.json({ error: 'Donations are temporarily disabled' }, { status: 503 })
    }

    const body = await req.json()
    const amountDollars = typeof body.amount === 'number' ? body.amount : parseFloat(body.amount)
    if (Number.isNaN(amountDollars) || amountDollars <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount' }, { status: 400 })
    }

    const amountCents = Math.round(amountDollars * 100)
    if (amountCents < MIN_CENTS) {
      return NextResponse.json({ error: 'Minimum donation is $1' }, { status: 400 })
    }
    if (amountCents > MAX_CENTS) {
      return NextResponse.json({ error: 'Maximum donation is $100,000' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'Donation to Art Radar',
              description: 'Support Dubai’s art scene — free guides, events, and gallery directory.',
              images: process.env.NEXT_PUBLIC_SITE_URL ? [`${process.env.NEXT_PUBLIC_SITE_URL}/icon.svg`] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { type: 'donation' },
      success_url: `${siteUrl}/donate?success=1`,
      cancel_url: `${siteUrl}/donate?cancelled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Donate checkout error:', err)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
