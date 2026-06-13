import type { BlogPostMeta } from './types'

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
    .replace(/[\u0300-\u036f]/g, '')
}

function meaningfulTags(post: BlogPostMeta): Set<string> {
  return new Set(
    post.tags
      .map(normalizeTag)
      .filter((tag) => tag.length > 0 && !GENERIC_TAGS.has(tag)),
  )
}

function seriesDistanceScore(current: BlogPostMeta, candidate: BlogPostMeta) {
  if (!current.series || current.series !== candidate.series) return 0
  const currentOrder = current.seriesOrder
  const candidateOrder = candidate.seriesOrder
  if (!currentOrder || !candidateOrder) return 10

  const distance = Math.abs(currentOrder - candidateOrder)
  return 12 + Math.max(0, 5 - distance)
}

export function getRelatedPosts(
  current: BlogPostMeta,
  posts: BlogPostMeta[],
  limit = 4,
): BlogPostMeta[] {
  const currentTags = meaningfulTags(current)

  return posts
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const candidateTags = meaningfulTags(post)
      let tagOverlap = 0
      for (const tag of candidateTags) {
        if (currentTags.has(tag)) tagOverlap += 1
      }

      const score =
        seriesDistanceScore(current, post) +
        tagOverlap * 4 +
        (post.category === current.category ? 3 : 0) +
        (post.featured ? 0.5 : 0)

      return { post, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.post.date.localeCompare(a.post.date)
    })
    .slice(0, limit)
    .map(({ post }) => post)
}
