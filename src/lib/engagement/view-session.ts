export const VIEW_INCREMENT_MAX_ATTEMPTS = 2

interface SessionViewOptions {
  key: string
  isViewed: () => boolean
  markViewed: () => void
  increment: () => Promise<boolean>
}

const recordedInRuntime = new Set<string>()
const inFlightViews = new Map<string, Promise<boolean>>()
const attemptsByKey = new Map<string, number>()

/**
 * Records at most one successful view for a browser session.
 *
 * The durable marker is committed only after the remote increment reports
 * success. Concurrent React initialisation shares one in-flight mutation. A
 * failed attempt stays unmarked for one later mount, while retries are capped
 * across the current page runtime. We never immediately retry the non-idempotent
 * Firestore increment after an ambiguous acknowledgement failure.
 */
export function recordSessionView({
  key,
  isViewed,
  markViewed,
  increment,
}: SessionViewOptions): Promise<boolean> {
  if (recordedInRuntime.has(key) || isViewed()) return Promise.resolve(true)

  const inFlight = inFlightViews.get(key)
  if (inFlight) return inFlight

  const attempts = attemptsByKey.get(key) ?? 0
  if (attempts >= VIEW_INCREMENT_MAX_ATTEMPTS) return Promise.resolve(false)
  attemptsByKey.set(key, attempts + 1)

  const operation = (async () => {
    if (recordedInRuntime.has(key) || isViewed()) return true

    let succeeded = false
    try {
      succeeded = await increment()
    } catch {
      // Provider adapters normally return false. Keep this boundary fail-soft
      // if a future implementation unexpectedly rejects instead.
    }

    if (succeeded) {
      recordedInRuntime.add(key)
      try {
        markViewed()
      } catch {
        // Runtime memory still prevents a duplicate when storage is unavailable.
      }
    }
    return succeeded
  })()

  inFlightViews.set(key, operation)
  const clearInFlight = () => {
    if (inFlightViews.get(key) === operation) inFlightViews.delete(key)
  }
  void operation.then(clearInFlight, clearInFlight)
  return operation
}
