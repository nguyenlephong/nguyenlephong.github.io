import type { BlogPostMeta } from './types'

export interface CategoryNeighbors {
  prev: BlogPostMeta | null
  next: BlogPostMeta | null
}

/**
 * Chronological neighbours inside a category, used when a post has no series.
 * `prev` is the next older post and `next` the next newer one.
 */
export function getCategoryNeighbors(
  slug: string,
  category: string,
  posts: readonly BlogPostMeta[],
): CategoryNeighbors {
  const inCategory = posts
    .filter((post) => post.category === category)
    .sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug))
  const index = inCategory.findIndex((post) => post.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: inCategory[index - 1] ?? null,
    next: inCategory[index + 1] ?? null,
  }
}
