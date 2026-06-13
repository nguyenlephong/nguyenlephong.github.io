import { Link } from '@/i18n/navigation'
import type { BlogPostMeta } from '@/lib/blog/types'

export interface BlogRelatedPostItem {
  post: BlogPostMeta
  categoryTitle: string
  readingLabel: string
}

interface BlogRelatedPostsProps {
  heading: string
  intro: string
  items: BlogRelatedPostItem[]
}

export default function BlogRelatedPosts({
  heading,
  intro,
  items,
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
