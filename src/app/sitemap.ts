import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/seo.config'
import { routing } from '@/i18n/routing'

export const dynamic = 'force-static'

const PATHS: Array<{ path: string; priority: number; freq: 'weekly' | 'monthly' }> = [
  { path: '', priority: 1, freq: 'weekly' },
  { path: '/apps', priority: 0.9, freq: 'weekly' },
  { path: '/about', priority: 0.8, freq: 'monthly' },
  { path: '/cv', priority: 0.8, freq: 'monthly' },
  { path: '/gallery', priority: 0.7, freq: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const { path, priority, freq } of PATHS) {
    const languages: Record<string, string> = {}
    for (const locale of routing.locales) {
      languages[locale] = `${SITE_URL}/${locale}${path}`
    }
    languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${path}`

    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: freq,
        priority,
        alternates: { languages },
      })
    }
  }

  return entries
}
