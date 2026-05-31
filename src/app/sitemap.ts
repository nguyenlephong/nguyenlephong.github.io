import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/seo.config'
import { routing } from '@/i18n/routing'
import { listThoughtSlugs } from '@/lib/thoughts/data'
import { listCategorySlugs, listCategoryPostPairs } from '@/lib/blog/data'
import { listNoteSlugs } from '@/lib/notes/data'

export const dynamic = 'force-static'

const PATHS: Array<{ path: string; priority: number; freq: 'weekly' | 'monthly' }> = [
  { path: '', priority: 1, freq: 'weekly' },
  { path: '/apps', priority: 0.9, freq: 'weekly' },
  { path: '/blog', priority: 0.9, freq: 'weekly' },
  { path: '/about', priority: 0.8, freq: 'monthly' },
  { path: '/cv', priority: 0.8, freq: 'monthly' },
  { path: '/gallery', priority: 0.7, freq: 'monthly' },
  { path: '/thoughts', priority: 0.85, freq: 'weekly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  const pushPath = (
    path: string,
    priority: number,
    freq: 'weekly' | 'monthly',
  ) => {
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

  for (const { path, priority, freq } of PATHS) pushPath(path, priority, freq)

  // Per-thought entries: one per (locale, slug) with hreflang cluster
  for (const slug of listThoughtSlugs()) {
    pushPath(`/thoughts/${slug}`, 0.7, 'monthly')
  }

  // Blog category landings + per-post entries (each with hreflang cluster)
  for (const category of listCategorySlugs()) {
    pushPath(`/blog/${category}`, 0.7, 'weekly')
  }
  for (const { category, slug } of listCategoryPostPairs()) {
    pushPath(`/blog/${category}/${slug}`, 0.8, 'monthly')
  }

  // Notes: Vietnamese-only — canonical at /vi/notes/...
  for (const slug of listNoteSlugs()) {
    const canonical = `${SITE_URL}/vi/notes/${slug}`
    entries.push({
      url: canonical,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: { languages: { vi: canonical, 'x-default': canonical } },
    })
  }

  return entries
}
