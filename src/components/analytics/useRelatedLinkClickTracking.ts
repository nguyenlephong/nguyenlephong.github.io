'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import { authorClickProperties } from '@/components/analytics/article-author-click'

type RelatedKind = 'related' | 'prev' | 'next'

/**
 * One delegated listener for the related-reading block and the prev/next
 * navigation of an article. It lives in the existing reading-tracker boundary
 * so the server-rendered link markup needs no client component of its own.
 *
 * Blog keeps its original `blog_related_click` contract (and properties); notes
 * emit `notes_related_click`. `link_kind` separates related cards from prev/next.
 * Byline and author-box links (`data-author-link`) emit one `blog_author_click`
 * on both surfaces.
 */
export function useRelatedLinkClickTracking(
  surface: 'blog' | 'notes',
  sourceCategory: string,
  sourceSlug: string,
): void {
  useEffect(() => {
    const eventName =
      surface === 'notes' ? 'notes_related_click' : 'blog_related_click'

    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return

      const authorLink = target.closest<HTMLAnchorElement>('a[data-author-link]')
      if (authorLink) {
        const properties = authorClickProperties(
          surface,
          sourceCategory,
          sourceSlug,
          authorLink.dataset['authorLink'],
        )
        if (properties) track('blog_author_click', { ...properties })
        return
      }

      const link = target.closest<HTMLAnchorElement>('a[data-related-link]')
      if (!link) return

      const targetSlug = link.dataset['relatedTargetSlug']
      if (!targetSlug) return

      track(eventName, {
        content_surface: surface,
        source_category: sourceCategory,
        source_slug: sourceSlug,
        target_category: link.dataset['relatedTargetCategory'] ?? null,
        target_slug: targetSlug,
        link_kind: (link.dataset['relatedLink'] as RelatedKind | undefined) ?? 'related',
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [surface, sourceCategory, sourceSlug])
}
