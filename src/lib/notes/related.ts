import { rankRelated } from '@/lib/content/related'
import type { NoteMeta } from './types'

/**
 * Related notes: same topic and shared tags first, newest as the tiebreaker.
 * `exclude` keeps prev/next notes out so the page links to more distinct notes.
 */
export function getRelatedNotes(
  current: NoteMeta,
  notes: readonly NoteMeta[],
  limit = 5,
  exclude?: ReadonlySet<string>,
): NoteMeta[] {
  const toCandidate = (note: NoteMeta) => ({ ...note, group: note.topic })
  const ranked = rankRelated(
    toCandidate(current),
    notes.map(toCandidate),
    { limit, exclude },
  )
  const bySlug = new Map(notes.map((note) => [note.slug, note]))
  return ranked.flatMap((item) => bySlug.get(item.slug) ?? [])
}
