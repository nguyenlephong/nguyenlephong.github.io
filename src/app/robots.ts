import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/seo.config'
import { routing } from '@/i18n/routing'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const heartbeatsBlocks = routing.locales.flatMap((l) => [
    `/${l}/heartbeats`,
    `/${l}/heartbeats/`,
  ])
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/api/', ...heartbeatsBlocks],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
