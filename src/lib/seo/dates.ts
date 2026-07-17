/**
 * Returns the latest valid source date that is not later than `now`.
 * Future editorial dates are left untouched in source, but are omitted from
 * sitemap/hub freshness signals until that date arrives. This avoids inventing
 * a clamped modification date while keeping the build deterministic in tests.
 */
export function latestNonFutureDate(
  values: readonly (string | undefined)[],
  now = new Date(),
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
