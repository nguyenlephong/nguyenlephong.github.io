/**
 * Deduplicates provider document ids and applies the caller-owned read budget.
 * This module stays provider-free so archive code can bound work without
 * pulling the Firebase adapter into its initial chunk.
 */
export function boundPostStatsIds(
  ids: readonly string[],
  limit: number,
): string[] {
  if (!Number.isSafeInteger(limit) || limit <= 0) return []
  return [...new Set(ids.filter(Boolean))].slice(0, limit)
}
