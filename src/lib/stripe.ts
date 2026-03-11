import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as const,
})

export const STRIPE_PRICES = {
  GALLERY_MONTHLY: process.env.STRIPE_GALLERY_MONTHLY_PRICE_ID!,
  FEATURE_EVENT: process.env.STRIPE_FEATURE_EVENT_PRICE_ID!,
  ARTIST_PRO: process.env.STRIPE_ARTIST_PRO_PRICE_ID!,
}
