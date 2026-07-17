import { routing, type Locale } from '@/i18n/routing'
import { SITE_URL } from '@/app/seo.config'

const MAX_DESC = 160

/** Strip HTML tags and decode a few common entities; collapse whitespace. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildDescription(html: string, max = MAX_DESC): string {
  const plain = htmlToPlainText(html)
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/**
 * Returns an alternates.languages map covering every supported locale, plus
 * x-default pointing at the default-locale variant. Pass the suffix after the
 * locale segment (e.g. "/thoughts" or "/thoughts/<slug>").
 */
export function localeAlternates(
  pathAfterLocale: string,
  locales: readonly string[] = routing.locales,
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const l of locales) {
    map[l] = `${SITE_URL}/${l}${pathAfterLocale}`
  }
  const defaultLocale = preferredContentLocale(locales)
  map['x-default'] = `${SITE_URL}/${defaultLocale}${pathAfterLocale}`
  return map
}

/** Selects the stable default among real content variants. */
export function preferredContentLocale<T extends string>(locales: readonly T[]): T {
  const siteDefault = locales.find((locale) => locale === routing.defaultLocale)
  return siteDefault ?? locales[0] ?? (routing.defaultLocale as T)
}

export function canonicalFor(locale: string, pathAfterLocale: string): string {
  return `${SITE_URL}/${locale}${pathAfterLocale}`
}

export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  vi: 'vi_VN',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  fr: 'fr_FR',
}
