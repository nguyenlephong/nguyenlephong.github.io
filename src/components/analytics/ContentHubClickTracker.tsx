'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

type HubKind = 'blog_series' | 'notes_topic'

function numericData(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  return Number(value)
}

/**
 * Delegated tracking keeps every hub link as plain server-rendered HTML while
 * preserving the established card/pagination events alongside the new hub
 * taxonomy.
 */
export default function ContentHubClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>(
        'a[data-content-hub-action]',
      )
      if (!link) return

      const action = link.dataset['contentHubAction']
      const kind = link.dataset['contentHubKind'] as HubKind | undefined
      const hubId = link.dataset['contentHubId']
      if (!kind || !hubId) return

      const page = numericData(link.dataset['contentHubPage'])
      const destinationPage = numericData(
        link.dataset['contentHubDestinationPage'],
      )
      const common = {
        content_hub_kind: kind,
        content_hub_id: hubId,
        content_hub_page: page,
      }

      if (action === 'catalog') {
        track('content_hub_click', {
          ...common,
          source: link.dataset['source'],
        })
        return
      }

      if (action === 'article') {
        track('content_hub_article_click', {
          ...common,
          content_slug: link.dataset['contentSlug'],
          position: numericData(link.dataset['contentPosition']),
        })
        track(kind === 'blog_series' ? 'blog_card_click' : 'notes_card_click', {
          content_surface: kind === 'blog_series' ? 'blog' : 'notes',
          content_category: link.dataset['contentCategory'] ?? null,
          content_slug: link.dataset['contentSlug'],
          source: kind,
        })
        return
      }

      if (action === 'pagination') {
        const properties = {
          ...common,
          destination_page: destinationPage,
          target_page: destinationPage,
          content_surface: kind === 'blog_series' ? 'blog' : 'notes',
          source: kind,
        }
        track('content_hub_page_change', properties)
        track('explorer_page_change', properties)
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
