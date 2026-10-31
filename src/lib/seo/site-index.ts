/**
 * Pure grouping helpers for the crawlable per-locale site index. They only
 * depend on structural shapes so node:test can run them without the content
 * catalog.
 */

export const SITE_INDEX_PATH = '/sitemap'

export interface IndexedPost {
  slug: string
  category: string
  title: string
}

export interface IndexedCategory {
  slug: string
  title: string
}

export interface PostGroup<P extends IndexedPost> {
  category: IndexedCategory
  posts: P[]
}

/** Groups posts by category in catalog order; categories without posts are skipped. */
export function groupPostsByCategory<P extends IndexedPost>(
  posts: readonly P[],
  categories: readonly IndexedCategory[],
): PostGroup<P>[] {
  const known = new Set(categories.map((category) => category.slug))
  const groups = categories.map((category) => ({
    category,
    posts: posts.filter((post) => post.category === category.slug),
  }))
  // A post whose category is missing from the catalog must still be linked.
  const orphanSlugs = [
    ...new Set(
      posts.filter((post) => !known.has(post.category)).map((p) => p.category),
    ),
  ]
  for (const slug of orphanSlugs) {
    groups.push({
      category: { slug, title: slug },
      posts: posts.filter((post) => post.category === slug),
    })
  }
  return groups.filter((group) => group.posts.length > 0)
}

export interface IndexedNote {
  slug: string
  title: string
  topic?: string
}

export interface IndexedTopic {
  id: string
  label: string
}

export interface NoteGroup<N extends IndexedNote> {
  /** Topic id, or null for notes without a topic. */
  topic: string | null
  label: string | null
  /** True when the topic has a dedicated indexable hub page. */
  hasHub: boolean
  notes: N[]
}

/**
 * Groups notes by topic. Topics with a hub come first in hub order, then the
 * remaining topics in catalog order, then untopiced notes.
 */
export function groupNotesByTopic<N extends IndexedNote>(
  notes: readonly N[],
  topics: readonly IndexedTopic[],
  hubTopics: readonly string[],
): NoteGroup<N>[] {
  const hubSet = new Set(hubTopics)
  const labels = new Map(topics.map((topic) => [topic.id, topic.label]))
  const order = [
    ...hubTopics,
    ...topics.map((topic) => topic.id).filter((id) => !hubSet.has(id)),
  ]
  const seen = new Set(order)
  for (const note of notes) {
    if (note.topic && !seen.has(note.topic)) {
      seen.add(note.topic)
      order.push(note.topic)
    }
  }

  const groups: NoteGroup<N>[] = order.map((topic) => ({
    topic,
    label: labels.get(topic) ?? topic,
    hasHub: hubSet.has(topic),
    notes: notes.filter((note) => note.topic === topic),
  }))
  groups.push({
    topic: null,
    label: null,
    hasHub: false,
    notes: notes.filter((note) => !note.topic),
  })
  return groups.filter((group) => group.notes.length > 0)
}

/** Page numbers 2..N of a static archive; page 1 is the listing itself. */
export function archivePageNumbers(totalPages: number): number[] {
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2)
}
