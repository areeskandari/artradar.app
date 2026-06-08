import localFont from 'next/font/local'

export const notoSerif = localFont({
  src: [
    { path: '../fonts/noto-serif/noto-serif-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-600-italic.woff2', weight: '600', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-600-italic.woff2', weight: '600', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/noto-serif/noto-serif-latin-700-italic.woff2', weight: '700', style: 'italic' },
    { path: '../fonts/noto-serif/noto-serif-latin-ext-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-noto-serif',
  display: 'swap',
})
