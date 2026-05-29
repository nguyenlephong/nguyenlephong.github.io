import { Link } from '@/i18n/navigation'
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
    <Link
      href={`/blog/${category.slug}`}
      className={`blog-cat-card blog-cat-card--${category.accent}`}
    >
      <span className="blog-cat-card__dot" aria-hidden="true" />
      <h2 className="blog-cat-card__title">{category.title}</h2>
      <p className="blog-cat-card__tagline">{category.tagline}</p>
      <span className="blog-cat-card__count">{countLabel}</span>
    </Link>
  )
}
