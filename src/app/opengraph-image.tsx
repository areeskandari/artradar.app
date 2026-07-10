import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo'

export const alt = SITE_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2416 50%, #1a1a1a 100%)',
          color: '#faf8f5',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            marginBottom: 24,
            lineHeight: 1.1,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            width: 80,
            height: 2,
            background: '#c9a227',
            marginBottom: 28,
          }}
        />
        <div
          style={{
            fontSize: 28,
            color: '#d4cfc7',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size }
  )
}
