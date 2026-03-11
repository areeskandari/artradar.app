import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { product_type, entity_id } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const priceMap: Record<string, string> = {
      gallery_subscription: STRIPE_PRICES.GALLERY_MONTHLY,
      feature_event: STRIPE_PRICES.FEATURE_EVENT,
      artist_pro: STRIPE_PRICES.ARTIST_PRO,
    }

    const modeMap: Record<string, 'subscription' | 'payment'> = {
      gallery_subscription: 'subscription',
      feature_event: 'payment',
      artist_pro: 'subscription',
    }

    const price = priceMap[product_type]
    if (!price) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: modeMap[product_type],
      payment_method_types: ['card'],
      line_items: [{ price, quantity: 1 }],
      metadata: { product_type, entity_id, user_id: user.id },
      success_url: `${siteUrl}/admin?payment=success`,
      cancel_url: `${siteUrl}/admin?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
