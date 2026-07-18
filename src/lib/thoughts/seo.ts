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

export {
  OG_LOCALE_MAP,
  canonicalFor,
  localeAlternates,
  localizedPageIdentity,
  ogLocaleFor,
  preferredContentLocale,
} from '@/lib/seo/locale'
