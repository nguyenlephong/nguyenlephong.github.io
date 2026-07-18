import { SITE_URL } from '@/app/seo.config'
import { routing, type Locale } from '@/i18n/routing'

export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  vi: 'vi_VN',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  fr: 'fr_FR',
}

function assertLocalizedPath(pathAfterLocale: string): void {
  if (!pathAfterLocale.startsWith('/')) {
    throw new Error(`Localized SEO paths must start with "/": ${pathAfterLocale}`)
  }
}

/** Selects the stable default among real content variants. */
export function preferredContentLocale<T extends string>(locales: readonly T[]): T {
  const siteDefault = locales.find((locale) => locale === routing.defaultLocale)
  return siteDefault ?? locales[0] ?? (routing.defaultLocale as T)
}

export function canonicalFor(locale: string, pathAfterLocale: string): string {
  assertLocalizedPath(pathAfterLocale)
  return `${SITE_URL}/${locale}${pathAfterLocale}`
}

/**
 * Returns an alternates.languages map covering the supplied content locales,
 * plus x-default pointing at their preferred canonical variant.
 */
export function localeAlternates(
  pathAfterLocale: string,
  locales: readonly string[] = routing.locales,
): Record<string, string> {
  assertLocalizedPath(pathAfterLocale)
  const map: Record<string, string> = {}
  for (const locale of locales) {
    map[locale] = canonicalFor(locale, pathAfterLocale)
  }
  map['x-default'] = canonicalFor(preferredContentLocale(locales), pathAfterLocale)
  return map
}

export function ogLocaleFor(locale: string): string {
  return OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP[routing.defaultLocale]
}

export interface LocalizedPageIdentity {
  canonical: string
  languages: Record<string, string>
  ogLocale: string
  alternateOgLocales: string[]
}

/** One locale-aware identity shared by canonical, Open Graph, and JSON-LD. */
export function localizedPageIdentity(
  locale: string,
  pathAfterLocale: string,
  locales: readonly string[] = routing.locales,
): LocalizedPageIdentity {
  return {
    canonical: canonicalFor(locale, pathAfterLocale),
    languages: localeAlternates(pathAfterLocale, locales),
    ogLocale: ogLocaleFor(locale),
    alternateOgLocales: locales.filter((candidate) => candidate !== locale).map(ogLocaleFor),
  }
}
