/**
 * Compatibility exports for older content modules. Locale identity lives at
 * the neutral SEO boundary; only HTML description extraction remains shared
 * with the legacy Thoughts helper.
 */
export {
  buildDescription,
  htmlToPlainText,
} from '@/lib/thoughts/seo'
export {
  OG_LOCALE_MAP,
  canonicalFor,
  localeAlternates,
  localizedPageIdentity,
  ogLocaleFor,
  preferredContentLocale,
} from '@/lib/seo/locale'
