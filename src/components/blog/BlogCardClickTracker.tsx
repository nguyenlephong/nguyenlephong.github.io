'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

/**
 * One delegated listener reports `blog_card_click` for every server-rendered
 * `BlogPostCard` link (`data-blog-card`), so the cards ship no client code.
 */
export function useBlogCardClickTracking(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('a[data-blog-card]')
      if (!link) return

      track('blog_card_click', {
        content_surface: 'blog',
        content_category: link.dataset['blogCardCategory'] ?? null,
        content_slug: link.dataset['blogCard'] ?? null,
        source: link.dataset['blogCardSource'] ?? 'blog_list',
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}

/** Server pages mount this next to their card grid. */
export default function BlogCardClickTracker(): null {
  useBlogCardClickTracking()
  return null
}
