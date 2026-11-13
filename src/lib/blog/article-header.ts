/**
 * Display helpers for the blog article header and tag row. The full `summary`
 * stays the SEO description; the header shows only its first sentence so the
 * body starts on the first screen (MEP-39).
 */

// A sentence ends at . ! ? before whitespace and a capital, digit or quote,
// never right after a short abbreviation ("vs.", "e.g.") or a dotted initialism
// ("U.S.", "U.K."), or at a CJK full stop.
const FIRST_SENTENCE =
  /^[\s\S]*?(?:(?<!\b(?:vs|e\.g|i\.e|etc|cf|Mr|Ms|Dr|\p{Lu}\.\p{Lu}))[.!?](?=\s+[\p{Lu}\p{N}"“‘(]|\s*$)|[。！？])/u

export function articleDek(summary: string): string {
  const text = summary.trim()
  return FIRST_SENTENCE.exec(text)?.[0].trim() ?? text
}

const POPULAR_TAG_LIMIT = 12

/** The archive's tag chips: most used first, ties alphabetical. */
export function popularTags(
  posts: readonly { tags: readonly string[] }[],
  limit = POPULAR_TAG_LIMIT,
): string[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag)
}

export interface ArticleTagLink {
  tag: string
  href: string
}

/**
 * Tag links into the archive. The explorer restores `?tag=` only for its
 * popular chips, so any other tag opens as a search query instead. A tag that
 * repeats the category name adds nothing next to the breadcrumb and is dropped.
 */
export function articleTagLinks(
  tags: readonly string[],
  categoryNames: readonly string[],
  archiveTags: readonly string[],
): ArticleTagLink[] {
  const normalize = (value: string) => value.trim().toLocaleLowerCase()
  const categories = new Set(categoryNames.map(normalize))
  return tags
    .filter((tag) => !categories.has(normalize(tag)))
    .map((tag) => ({
      tag,
      href: `/blog?${archiveTags.includes(tag) ? 'tag' : 'q'}=${encodeURIComponent(tag)}`,
    }))
}
