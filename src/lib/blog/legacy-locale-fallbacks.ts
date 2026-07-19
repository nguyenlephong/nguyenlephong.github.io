import type { Locale } from '@/i18n/routing'

export interface LegacyBlogLocaleFallback {
  locale: Locale
  category: string
  slug: string
  targetLocale: Locale
}

/**
 * Narrow compatibility routes for previously indexable locale mistakes. These
 * pages are redirects, not authored variants, and must stay out of sitemap and
 * hreflang output.
 */
export const LEGACY_BLOG_LOCALE_FALLBACKS = [
  {
    locale: 'en',
    category: 'ai',
    slug: 'ai-ideas-bloom-inside-everyday-work',
    targetLocale: 'vi',
  },
] as const satisfies readonly LegacyBlogLocaleFallback[]

export function getLegacyBlogLocaleFallback(
  locale: string,
  category: string,
  slug: string,
): LegacyBlogLocaleFallback | null {
  return (
    LEGACY_BLOG_LOCALE_FALLBACKS.find(
      (entry) =>
        entry.locale === locale &&
        entry.category === category &&
        entry.slug === slug,
    ) ?? null
  )
}
