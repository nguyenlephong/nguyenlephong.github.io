import { getContentBuildDate } from '@/lib/content/publication'

/**
 * Returns the latest valid source date that is not later than the build date.
 * Future editorial dates are left untouched in source, but are omitted from
 * sitemap/hub freshness signals until that date arrives. The default shares
 * the exact CONTENT_BUILD_DATE used by route publication, so one export cannot
 * disagree with itself when it runs across UTC midnight.
 */
export function latestNonFutureDate(
  values: readonly (string | undefined)[],
  now = new Date(getContentBuildDate()),
): Date | undefined {
  const cutoff = now.getTime()
  if (Number.isNaN(cutoff)) return undefined

  let latest: Date | undefined
  for (const value of values) {
    if (!value) continue
    const candidate = new Date(value)
    const timestamp = candidate.getTime()
    if (Number.isNaN(timestamp) || timestamp > cutoff) continue
    if (!latest || timestamp > latest.getTime()) latest = candidate
  }
  return latest
}
