export const REACTION_KEYS = ['like', 'love', 'insightful', 'clap'] as const

export type ReactionKey = (typeof REACTION_KEYS)[number]
export type ReactionCounts = Record<ReactionKey, number>

export interface PostStats {
  views: number
  shares: number
  reactions: ReactionCounts
}

export interface ReactionChange {
  previous: ReactionKey | null
  next: ReactionKey | null
}

export function isReactionKey(value: unknown): value is ReactionKey {
  return (
    typeof value === 'string' &&
    (REACTION_KEYS as readonly string[]).includes(value)
  )
}

export function emptyReactions(): ReactionCounts {
  return { like: 0, love: 0, insightful: 0, clap: 0 }
}

export function emptyPostStats(): PostStats {
  return { views: 0, shares: 0, reactions: emptyReactions() }
}

function normaliseCounter(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0
}

export function normalisePostStats(
  data: Record<string, unknown> | undefined,
): PostStats {
  const rawReactions =
    data?.['reactions'] && typeof data['reactions'] === 'object'
      ? (data['reactions'] as Record<string, unknown>)
      : {}

  return {
    views: normaliseCounter(data?.['views']),
    shares: normaliseCounter(data?.['shares']),
    reactions: {
      like: normaliseCounter(rawReactions['like']),
      love: normaliseCounter(rawReactions['love']),
      insightful: normaliseCounter(rawReactions['insightful']),
      clap: normaliseCounter(rawReactions['clap']),
    },
  }
}
