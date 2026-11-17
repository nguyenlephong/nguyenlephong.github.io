import { routing, type Locale } from '@/i18n/routing'

/**
 * Blog translations that predate the native EN/VI rewrite (MEP-84..89). Their
 * files stay in content/blog-data/<locale> for MEP-92 to re-translate, but no
 * route renders them: old article URLs show a noindex fallback with EN/VI links
 * and the locale drops out of listings, feeds, search, sitemap and hreflang.
 * Remove a locale from this list once its re-translation ships.
 */
export const HIDDEN_BLOG_LOCALES: readonly Locale[] = ['ja', 'zh', 'ko', 'fr']

export function isBlogLocaleHidden(locale: string): boolean {
  return HIDDEN_BLOG_LOCALES.some((hidden) => hidden === locale)
}

/** Route locales whose blog content is published. */
export const BLOG_CONTENT_LOCALES: readonly Locale[] = routing.locales.filter(
  (locale) => !isBlogLocaleHidden(locale),
)

export function visibleBlogLocales(locales: readonly Locale[]): Locale[] {
  return locales.filter((locale) => !isBlogLocaleHidden(locale))
}
