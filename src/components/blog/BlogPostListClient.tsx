'use client'

import { useEffect, useState } from 'react'
import {
  getPostStats,
  postStatsId,
} from '@/lib/firebase/postStats'
import BlogPostCard from './BlogPostCard'
import type { BlogAccent, BlogPostMeta } from '@/lib/blog/types'

interface CardMeta {
  post: BlogPostMeta
  accent: BlogAccent
  categoryTitle: string
  readingLabel: string
}

interface BlogPostListClientProps {
  cards: CardMeta[]
  locale: string
  viewsLabel: string
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number
}

/**
 * Renders the blog post card list and, after mount, fetches per-post view
 * counts from Firestore in parallel. Cards whose views meet the threshold
 * get an inline view badge; others render identically to the server output
 * (no hydration mismatch).
 */
export default function BlogPostListClient({
  cards,
  locale,
  viewsLabel,
  viewThreshold = 100,
}: BlogPostListClientProps) {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchAll() {
      const entries = await Promise.all(
        cards.map(async ({ post }) => {
          const id = postStatsId(post.category, post.slug)
          const stats = await getPostStats(id)
          return stats ? ([post.slug, stats.views] as const) : null
        }),
      )
      const counts: Record<string, number> = {}
      for (const entry of entries) {
        if (entry && entry[1] >= viewThreshold) counts[entry[0]] = entry[1]
      }
      setViewCounts(counts)
    }

    fetchAll()
  // cards identity is stable (same reference from server render), safe to
  // omit from the dep array after first mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewThreshold])

  return (
    <div className="blog-post-list">
      {cards.map(({ post, accent, categoryTitle, readingLabel }) => (
        <BlogPostCard
          key={post.slug}
          post={post}
          accent={accent}
          categoryTitle={categoryTitle}
          locale={locale}
          readingLabel={readingLabel}
          viewCount={viewCounts[post.slug]}
          viewsLabel={viewsLabel}
        />
      ))}
    </div>
  )
}
