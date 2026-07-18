'use client'

import { LuEye } from 'react-icons/lu'
import IntentPrefetchLink from '@/components/navigation/IntentPrefetchLink'
import { track } from '@/lib/analytics'
import type { BlogAccent } from '@/lib/blog/types'
import type { BlogSearchItem } from '@/lib/content/search-index'
import { formatCount } from '@/lib/firebase/postStats'

interface BlogPostCardProps {
  post: BlogSearchItem
  /** Accent family from the owning category, drives the chip color */
  accent: BlogAccent
  /** Translated category name shown as a chip */
  categoryTitle: string
  /** Active locale, used to format the publish date */
  locale: string
  /** Locale that owns the linked article body. Defaults to the active locale. */
  contentLocale?: string
  /** Pre-translated reading-time string, e.g. "12 min read" */
  readingLabel: string
  /** View count injected client-side; shown only when >= 100 */
  viewCount?: number
  /** Translated "views" label */
  viewsLabel?: string
  /** Listing surface that produced this card click. */
  source?: string
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default function BlogPostCard({
  post,
  accent,
  categoryTitle,
  locale,
  contentLocale = locale,
  readingLabel,
  viewCount,
  viewsLabel,
  source = 'blog_list',
}: BlogPostCardProps) {
  return (
    <article className={`blog-card blog-card--${accent}`}>
      <IntentPrefetchLink
        href={`/blog/${post.category}/${post.slug}`}
        locale={contentLocale}
        className="blog-card__link"
        onClick={() => {
          track('blog_card_click', {
            content_surface: 'blog',
            content_category: post.category,
            content_slug: post.slug,
            source,
          })
        }}
      >
        <div className="blog-card__body">
          <span className="blog-card__kicker">{categoryTitle}</span>
          <h3 className="blog-card__title">{post.title}</h3>
          <p className="blog-card__summary">{post.summary}</p>
          <div className="blog-card__meta">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingLabel}</span>
            {typeof viewCount === 'number' && viewCount >= 100 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="blog-card__views">
                  <LuEye aria-hidden="true" />
                  {formatCount(viewCount)}{viewsLabel ? ` ${viewsLabel}` : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </IntentPrefetchLink>
    </article>
  )
}
