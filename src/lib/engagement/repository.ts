import type { PostStats, ReactionChange } from './domain'

/**
 * Provider-neutral boundary for best-effort public engagement counters.
 *
 * Implementations must fail soft: reads return an empty result and mutations
 * return failure rather than surfacing provider errors to article rendering.
 */
export interface EngagementRepository {
  getStats(id: string): Promise<PostStats | null>
  getStatsByIds(
    ids: readonly string[],
    limit: number,
  ): Promise<Map<string, PostStats>>
  recordView(id: string): Promise<void>
  recordShare(id: string): Promise<boolean>
  changeReaction(id: string, change: ReactionChange): Promise<boolean>
}
