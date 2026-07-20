'use client'

import IntentPrefetchLink from '@/components/navigation/IntentPrefetchLink'
import { track } from '@/lib/analytics'
import type { BlogCategoryMeta } from '@/lib/blog/types'

interface BlogCategoryCardProps {
  category: BlogCategoryMeta
  /** Pre-translated post-count line, e.g. "1 article" */
  countLabel: string
}

export default function BlogCategoryCard({
  category,
  countLabel,
}: BlogCategoryCardProps) {
  return (
    <IntentPrefetchLink
      href={`/blog/${category.slug}`}
      className={`blog-cat-card blog-cat-card--${category.accent}`}
      onClick={() => {
        track('blog_category_click', {
          content_surface: 'blog',
          content_category: category.slug,
          source: 'blog_index',
        })
      }}
    >
      <span className="blog-cat-card__dot" aria-hidden="true" />
      <h2 className="blog-cat-card__title">{category.title}</h2>
      <p className="blog-cat-card__tagline">{category.tagline}</p>
      <span className="blog-cat-card__count">{countLabel}</span>
    </IntentPrefetchLink>
  )
}
