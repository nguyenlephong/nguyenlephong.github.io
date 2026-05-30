'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { usePostEngagement } from './usePostEngagement'

type EngagementValue = ReturnType<typeof usePostEngagement>

const EngagementContext = createContext<EngagementValue | null>(null)

/**
 * Loads a post's engagement state once and shares it with every widget on the
 * page (top-of-article view count, floating share dock, bottom reaction bar).
 * One Firestore read, one per-session view increment — no matter how many
 * consumers render.
 */
export function EngagementProvider({
  category,
  slug,
  children,
}: {
  category: string
  slug: string
  children: ReactNode
}) {
  const value = usePostEngagement(category, slug)
  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  )
}

/** Consume the shared engagement state. Returns null outside a provider. */
export function useEngagement(): EngagementValue | null {
  return useContext(EngagementContext)
}
