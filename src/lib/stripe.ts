import Stripe from 'stripe'

let _stripe: Stripe | null = null

/** Lazy-init Stripe so build can complete without STRIPE_SECRET_KEY. */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, {
      apiVersion: '2026-02-25.clover' as const,
    })
  }
  return _stripe
}

/** Price IDs – read at runtime so build does not require them. */
export function getStripePrices() {
  return {
    GALLERY_MONTHLY: process.env.STRIPE_GALLERY_MONTHLY_PRICE_ID!,
    FEATURE_EVENT: process.env.STRIPE_FEATURE_EVENT_PRICE_ID!,
    ARTIST_PRO: process.env.STRIPE_ARTIST_PRO_PRICE_ID!,
  }
}
