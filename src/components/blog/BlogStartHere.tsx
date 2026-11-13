'use client'

import IntentPrefetchLink from '@/components/navigation/IntentPrefetchLink'
import { track } from '@/lib/analytics'

export interface BlogStartHereItem {
  slug: string
  category: string
  title: string
  reason: string
  /** Pre-formatted "Category · 12 min read". */
  meta: string
}

interface BlogStartHereProps {
  heading: string
  items: readonly BlogStartHereItem[]
  locale: string
}

/** Curated entry points above the archive; clicks reuse `blog_card_click`. */
export default function BlogStartHere({ heading, items, locale }: BlogStartHereProps) {
  if (items.length === 0) return null

  return (
    <section className="blog-start" aria-labelledby="blog-start-heading">
      <h2 id="blog-start-heading" className="blog-start__title">
        {heading}
      </h2>
      <ul className="blog-start__list">
        {items.map((item) => (
          <li key={item.slug} className="blog-start__item">
            <IntentPrefetchLink
              href={`/blog/${item.category}/${item.slug}`}
              locale={locale}
              className="blog-start__link"
              onClick={() => {
                track('blog_card_click', {
                  content_surface: 'blog',
                  content_category: item.category,
                  content_slug: item.slug,
                  source: 'blog_featured',
                })
              }}
            >
              <span className="blog-start__post">{item.title}</span>
              <span className="blog-start__reason">{item.reason}</span>
              <span className="blog-start__meta">{item.meta}</span>
            </IntentPrefetchLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
