type PostHogCaptureResult = {
  properties?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Sanitize URL-bearing properties added by either PostHog or custom events.
 * This function is intentionally self-contained because its source is embedded
 * into the official PostHog loader's `before_send` callback.
 */
export function sanitizePostHogCaptureResult(
  captureResult: PostHogCaptureResult | null | undefined,
  removeLocationFields = false,
): PostHogCaptureResult | null | undefined {
  if (!captureResult || typeof captureResult !== 'object') return captureResult

  const normalizeKey = (key: string): string => key.replace(/^\$/, '').toLowerCase()
  const sensitiveSearchKeys = new Set([
    'q',
    'query',
    'search',
    'search_query',
    'search_term',
  ])
  const isLocationKey = (key: string): boolean => {
    const normalized = normalizeKey(key)
    return (
      normalized === 'url' ||
      normalized === 'path' ||
      normalized === 'pathname' ||
      normalized === 'referrer' ||
      normalized === 'referring_domain' ||
      normalized.endsWith('_url') ||
      normalized.endsWith('_path') ||
      normalized.endsWith('_pathname') ||
      normalized.endsWith('_referrer') ||
      normalized.endsWith('_referring_domain')
    )
  }
  const stripQueryAndHash = (value: unknown): unknown => {
    if (typeof value !== 'string') return value
    const suffixIndex = value.search(/[?#]/)
    return suffixIndex === -1 ? value : value.slice(0, suffixIndex)
  }
  const scrub = (value: unknown, parentKey?: string): unknown => {
    if (Array.isArray(value)) return value.map((item) => scrub(item, parentKey))
    if (value && typeof value === 'object') {
      return Object.entries(value).reduce<Record<string, unknown>>((safe, [key, item]) => {
        const normalized = normalizeKey(key)
        if (sensitiveSearchKeys.has(normalized)) return safe
        if (removeLocationFields && isLocationKey(key)) return safe
        safe[key] = scrub(item, key)
        return safe
      }, {})
    }
    return parentKey && isLocationKey(parentKey) ? stripQueryAndHash(value) : value
  }

  return Object.assign({}, captureResult, {
    properties: scrub(captureResult.properties ?? {}) as Record<string, unknown>,
  })
}

export function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>,
  removeLocationFields = false,
): Record<string, unknown> {
  return (
    sanitizePostHogCaptureResult({ properties }, removeLocationFields)?.properties ?? {}
  )
}

export function getPostHogBeforeSendSource(removeLocationFields: boolean): string {
  return `function(captureResult) { return (${sanitizePostHogCaptureResult.toString()})(captureResult, ${JSON.stringify(removeLocationFields)}); }`
}
