/**
 * Blog reuses the generic, content-agnostic SEO helpers that already power the
 * Thoughts surface (hreflang alternates, canonical URLs, OG locale codes, and
 * HTML→description extraction). Re-exported here so blog modules import from a
 * single, intention-revealing path instead of reaching into the thoughts lib.
 */
export {
  OG_LOCALE_MAP,
  buildDescription,
  canonicalFor,
  htmlToPlainText,
  localeAlternates,
  preferredContentLocale,
} from '@/lib/thoughts/seo'
