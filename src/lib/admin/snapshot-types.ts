/** Shape written by scripts/lib/admin-snapshot.mjs (schemaVersion 1). */
export type AdminReactionKey = 'like' | 'love' | 'insightful' | 'clap'

export interface AdminPostRow {
  id: string
  title: string
  category: string
  date: string | null
  listed: boolean
  views: number
  shares: number
  reactions: Record<AdminReactionKey, number>
  reactionTotal: number
}

export interface AdminCategoryRow {
  category: string
  title: string
  posts: number
  views: number
  shares: number
  reactions: number
}

export interface AdminLabelledCount {
  label: string
  count: number
}

export interface AdminPostHogBlock {
  status: 'ok' | 'stale' | 'unavailable'
  updatedAt?: string
  lastAttemptAt?: string
  error?: string
  windowDays?: number
  pageviewsByDay?: Array<{ day: string; count: number }>
  sources?: AdminLabelledCount[]
  countries?: AdminLabelledCount[]
  devices?: AdminLabelledCount[]
  locales?: AdminLabelledCount[]
  readCompletion?: { views: number; completes: number; rate: number | null }
  webVitals?: Array<{ name: string; p75: number; samples: number }>
}

export interface AdminSnapshot {
  schemaVersion: 1
  generatedAt: string
  firestore: {
    updatedAt: string
    totals: { posts: number; views: number; shares: number; reactions: number }
    posts: AdminPostRow[]
    leastViewed: string[]
    neverViewed: string[]
    categories: AdminCategoryRow[]
    reactions: Record<AdminReactionKey, number>
  }
  posthog: AdminPostHogBlock
}
