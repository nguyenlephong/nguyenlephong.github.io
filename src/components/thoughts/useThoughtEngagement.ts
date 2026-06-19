'use client'

import { usePostEngagement } from '@/components/blog/usePostEngagement'

/**
 * Thoughts track only views + shares (no reactions). Thin wrapper over the
 * shared {@link usePostEngagement} hook so the view-load / session-guard logic
 * lives in exactly one place; `thought` keeps the legacy storage-key prefix.
 */
export function useThoughtEngagement(slug: string) {
  const { views, ready, recordShare } = usePostEngagement('thoughts', slug, {
    withReactions: false,
    storageNamespace: 'thought',
  })
  return { views, ready, recordShare }
}
