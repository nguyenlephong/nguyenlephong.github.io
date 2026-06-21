'use client'

import { Link } from '@/i18n/navigation'
import type { BlogPostMeta } from '@/lib/blog/types'
import { track } from '@/lib/analytics'

export interface BlogRelatedPostItem {
  post: BlogPostMeta
  categoryTitle: string
  readingLabel: string
}

interface BlogRelatedPostsProps {
  heading: string
  intro: string
  items: BlogRelatedPostItem[]
  sourceCategory: string
  sourceSlug: string
}

export default function BlogRelatedPosts({
  heading,
  intro,
  items,
  sourceCategory,
  sourceSlug,
}: BlogRelatedPostsProps) {
  if (items.length === 0) return null

  return (
    <section className="blog-related" aria-labelledby="blog-related-heading">
      <div className="blog-related__head">
        <h2 id="blog-related-heading" className="blog-related__title">
          {heading}
        </h2>
        <p className="blog-related__intro">{intro}</p>
      </div>
      <div className="blog-related__grid">
        {items.map(({ post, categoryTitle, readingLabel }) => (
          <Link
            key={post.slug}
            href={`/blog/${post.category}/${post.slug}`}
            className="blog-related__card"
            onClick={() => {
              track('blog_related_click', {
                content_surface: 'blog',
                source_category: sourceCategory,
                source_slug: sourceSlug,
                target_category: post.category,
                target_slug: post.slug,
              })
            }}
          >
            <span className="blog-related__body">
              <span className="blog-related__kicker">{categoryTitle}</span>
              <span className="blog-related__card-title">{post.title}</span>
              <span className="blog-related__summary">{post.summary}</span>
              <span className="blog-related__meta">{readingLabel}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
