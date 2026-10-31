/**
 * Deterministic "related reading" ranking shared by blog posts and notes.
 *
 * Every article should link to a few nearby articles so a crawler can walk
 * from one article to the next. Ranking order: same series, shared meaningful
 * tags, same category/topic, then newest first. When fewer than `minimum`
 * candidates score above zero the list is topped up with the newest remaining
 * articles, so no article is ever left without outgoing related links.
 */

export interface RelatedCandidate {
  slug: string
  /** ISO date (yyyy-mm-dd), used as the newest-first tiebreaker. */
  date: string
  tags: readonly string[]
  /** Blog category or notes topic. */
  group?: string
  series?: string
  seriesOrder?: number
  featured?: boolean
}

export interface RelatedOptions {
  /** Upper bound of returned items. Defaults to 5. */
  limit?: number
  /** Lower bound; topped up with newest articles when scores run dry. */
  minimum?: number
  /** Slugs already linked elsewhere on the page (for example prev/next). */
  exclude?: ReadonlySet<string>
}

const GENERIC_TAGS = new Set([
  'ai',
  'career',
  'future of work',
  'software architecture',
  'software development',
  'system design',
  'team collaboration',
  'ways of working',
])

function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Each article page ranks every other article, so a tag list would otherwise be
// normalised O(articles) times per build. Memoise by slug + tag content.
const tagSetCache = new Map<string, Set<string>>()

function meaningfulTags(item: RelatedCandidate): Set<string> {
  const cacheKey = `${item.slug} ${item.tags.join('')}`
  const cached = tagSetCache.get(cacheKey)
  if (cached) return cached

  const set = new Set(
    item.tags
      .map(normalizeTag)
      .filter((tag) => tag.length > 0 && !GENERIC_TAGS.has(tag)),
  )
  tagSetCache.set(cacheKey, set)
  return set
}

function seriesDistanceScore(
  current: RelatedCandidate,
  candidate: RelatedCandidate,
): number {
  if (!current.series || current.series !== candidate.series) return 0
  const currentOrder = current.seriesOrder
  const candidateOrder = candidate.seriesOrder
  if (!currentOrder || !candidateOrder) return 10

  const distance = Math.abs(currentOrder - candidateOrder)
  return 12 + Math.max(0, 5 - distance)
}

export function scoreRelated(
  current: RelatedCandidate,
  candidate: RelatedCandidate,
): number {
  const currentTags = meaningfulTags(current)
  let tagOverlap = 0
  for (const tag of meaningfulTags(candidate)) {
    if (currentTags.has(tag)) tagOverlap += 1
  }

  return (
    seriesDistanceScore(current, candidate) +
    tagOverlap * 4 +
    (current.group && candidate.group === current.group ? 3 : 0) +
    (candidate.featured ? 0.5 : 0)
  )
}

function newestFirst(a: RelatedCandidate, b: RelatedCandidate): number {
  return b.date.localeCompare(a.date)
}

export function rankRelated<T extends RelatedCandidate>(
  current: RelatedCandidate,
  candidates: readonly T[],
  { limit = 5, minimum = 3, exclude }: RelatedOptions = {},
): T[] {
  const pool = candidates.filter(
    (candidate) =>
      candidate.slug !== current.slug && !exclude?.has(candidate.slug),
  )

  const scored = pool
    .map((candidate) => ({ candidate, score: scoreRelated(current, candidate) }))
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : newestFirst(a.candidate, b.candidate),
    )

  const picked = scored
    .filter(({ score }) => score > 0)
    .slice(0, limit)
    .map(({ candidate }) => candidate)

  if (picked.length >= minimum) return picked

  const taken = new Set(picked.map((item) => item.slug))
  const fill = pool
    .filter((candidate) => !taken.has(candidate.slug))
    .sort(newestFirst)
    .slice(0, minimum - picked.length)
  return [...picked, ...fill]
}
