export const KEEP_ON_YOUR_RADAR = {
  slug: 'keep-on-your-radar',
  title: 'Keep Art Radar on your radar.',
  eyebrow: 'Our very first Art Radar event is here.',
  tagline: 'Art · Walk · Talk',
  description:
    'Walk with us through Alserkal Avenue. One path, five galleries, and we walk it together. This is Art Radar, a community by vin.meet — meet people who live for art. Saturday, November 7th, 5 PM, at the entrance of Leila Heller Gallery.',
  startDate: '2026-11-07T17:00:00+04:00',
  dateLabel: 'Saturday, November 7th',
  timeLabel: '5 PM',
  locationLabel: 'Entrance of Leila Heller Gallery, Alserkal Avenue',
  joinUrl: 'https://vinmeet.io/meets/a95ecb2a-b732-4abc-a9ad-6a7285ea4a07',
  detailsUrl: 'https://www.instagram.com/reels/DfKPDpuO_Ie/',
  bannerSrc: '/images/banners/keep-on-your-radar.png',
  mapSrc: '/images/banners/keep-on-your-radar-map.jpg',
  mapAlt: 'Art Radar walk map of Alserkal Avenue — five galleries from Leila Heller to Efie Gallery',
  photos: [
    {
      src: '/images/banners/keep-on-your-radar-poster.png',
      alt: 'Keep on your radar — Saturday 7 November, 5 PM at Leila Heller Gallery, Alserkal Avenue',
    },
    {
      src: '/images/banners/keep-on-your-radar-walk.jpg',
      alt: 'Art Radar walk at Alserkal Avenue, Dubai — one path, five galleries',
    },
  ],
  communityBy: 'vin.meet',
  communityHandle: 'vin.meet',
  communityUrl: 'https://vinmeet.io',
  partner: {
    name: 'Nightjar Coffee Roasters',
    handle: 'nightjar.coffee',
    href: 'https://www.instagram.com/nightjar.coffee/',
    imageSrc: '/images/banners/keep-on-your-radar-nightjar.jpg',
    imageAlt: 'Art Radar × Nightjar — coffee roasters at our first event',
    title: 'Nightjar Coffee Roasters is with Art Radar at our first event.',
    body: [
      'Join us this Saturday, 7 November at 5 PM for Art Talk & Walk at Alserkal Avenue.',
      'Art Radar members enjoy 20% off the hot coffee bar at Nightjar — mention you’re with Art Radar and show your coded label.',
    ],
  },
  galleries: [
    { slug: 'leila-heller-gallery', name: 'Leila Heller Gallery', handle: 'leilahellergallery', href: '/galleries/leila-heller-gallery', external: false },
    { slug: 'the-third-line', name: 'The Third Line Gallery', handle: 'thethirdlinedxb', href: '/galleries/the-third-line', external: false },
    { slug: 'ishara-art-foundation', name: 'Ishara Art Foundation', handle: 'isharaartfoundation', href: '/galleries/ishara-art-foundation', external: false },
    { slug: 'firetti-contemporary', name: 'Firetti Contemporary', handle: 'firetticontemporary', href: 'https://www.instagram.com/firetticontemporary/', external: true },
    { slug: 'efie-gallery', name: 'Efie Gallery', handle: 'efiegallery', href: 'https://www.instagram.com/efiegallery/', external: true },
  ],
} as const
