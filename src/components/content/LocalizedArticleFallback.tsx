'use client'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { track } from '@/lib/analytics'

type Surface = 'blog' | 'notes'

interface LocalizedArticleFallbackProps {
  articlePath: string
  availableVariants: Array<{ label: string; locale: Locale }>
  className: string
  requestedLocale: Locale
  slug: string
  surface: Surface
  title: string
  labels: {
    description: string
    eyebrow: string
  }
}

export default function LocalizedArticleFallback({
  articlePath,
  availableVariants,
  className,
  requestedLocale,
  slug,
  surface,
  title,
  labels,
}: LocalizedArticleFallbackProps) {
  return (
    <main className={className} data-content-locale-fallback="true">
      <section className="blog-locale-fallback" aria-labelledby="content-fallback-title">
        <p className="blog-locale-fallback__eyebrow">{labels.eyebrow}</p>
        <h1 id="content-fallback-title" className="blog-locale-fallback__title">
          {title}
        </h1>
        <p className="blog-locale-fallback__description">{labels.description}</p>
        <ul className="blog-locale-fallback__actions">
          {availableVariants.map(({ label, locale }) => {
            return (
              <li key={locale}>
                <Link
                  className="blog-locale-fallback__link"
                  href={articlePath}
                  locale={locale}
                  hrefLang={locale}
                  onClick={() =>
                    track('content_fallback_language_click', {
                      from_locale: requestedLocale,
                      slug,
                      surface,
                      to_locale: locale,
                    })
                  }
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
