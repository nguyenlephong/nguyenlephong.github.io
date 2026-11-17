import { getTranslations } from 'next-intl/server'
import { LOCALE_LABELS, type Locale } from '@/i18n/routing'
import { BLOG_CONTENT_LOCALES } from '@/lib/blog/locale-visibility'
import LocalizedArticleFallback from '@/components/content/LocalizedArticleFallback'

interface HiddenBlogLocaleNoticeProps {
  locale: Locale
  /** Blog collection path without locale, e.g. `/blog` or `/blog/ai`. */
  path: `/blog${string}`
  /** Heading; defaults to the localized blog title. */
  title?: string
  /** Category accent family from the blog index. */
  accent?: string
}

/** Blog collections in a hidden locale (MEP-91): a short notice with EN/VI links, never an empty list. */
export default async function HiddenBlogLocaleNotice({
  locale,
  path,
  title,
  accent = 'ocean',
}: HiddenBlogLocaleNoticeProps) {
  const fallbackT = await getTranslations({ locale, namespace: 'ContentFallback' })
  const blogT = await getTranslations({ locale, namespace: 'Pages.blog' })

  return (
    <LocalizedArticleFallback
      articlePath={path}
      availableVariants={BLOG_CONTENT_LOCALES.map((contentLocale) => ({
        label: fallbackT('action', { language: LOCALE_LABELS[contentLocale].name }),
        locale: contentLocale,
      }))}
      // .blog-category carries the accent tokens on site colors; .blog-article needs reader.css.
      className={`blog-category blog-category--${accent}`}
      requestedLocale={locale}
      slug={path}
      surface="blog"
      title={title ?? blogT('title')}
      titleLocale={locale}
      labels={{
        description: fallbackT('description'),
        eyebrow: fallbackT('eyebrow'),
      }}
    />
  )
}
