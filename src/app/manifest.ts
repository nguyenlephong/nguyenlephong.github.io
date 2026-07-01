import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nguyen Le Phong',
    short_name: 'Phong',
    description:
      'A personal site with essays, notes, and technical writing that stays readable offline.',
    start_url: '/en',
    scope: '/',
    display: 'standalone',
    background_color: '#fafaf7',
    theme_color: '#0f1115',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  }
}
