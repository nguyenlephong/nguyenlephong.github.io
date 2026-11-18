export type AdminReactionKey = 'like' | 'love' | 'insightful' | 'clap'

/** Trimmed catalog shapes; the server component passes only these fields. */
export interface AdminBlogIndex {
  categories: Array<{ slug: string; title: string }>
  posts: Array<{ slug: string; category: string; title: string; date: string }>
}
export interface AdminNotesIndex {
  posts: Array<{ slug: string; title: string; date: string }>
}

export interface AdminCatalogEntry {
  title: string
  category: string
  categoryTitle: string
  date: string
}

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

export interface AdminInsights {
  totals: { posts: number; views: number; shares: number; reactions: number }
  posts: AdminPostRow[]
  leastViewed: string[]
  neverViewed: string[]
  categories: AdminCategoryRow[]
  reactions: Record<AdminReactionKey, number>
}

export declare const REACTION_KEYS: readonly AdminReactionKey[]
export declare const LEAST_VIEWED_LIMIT: number

export declare function normalisePostStats(data: unknown): {
  views: number
  shares: number
  reactions: Record<AdminReactionKey, number>
}

export declare function buildContentCatalog(
  blogIndex: AdminBlogIndex | null | undefined,
  notesIndex: AdminNotesIndex | null | undefined,
  asOfDay: string,
): Map<string, AdminCatalogEntry>

export declare function buildFirestoreInsights(
  statsDocs: Array<{ id: string; data: unknown }>,
  catalog: Map<string, AdminCatalogEntry>,
): AdminInsights
