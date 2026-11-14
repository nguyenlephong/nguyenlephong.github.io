type ScrollSubscriber = () => void

const subscribers = new Set<ScrollSubscriber>()

function notify(): void {
  subscribers.forEach((subscriber) => subscriber())
}

/**
 * Article widgets (reading tracker, reader cluster, share rail) share one
 * passive `scroll` listener on window instead of registering one each.
 */
export function subscribeWindowScroll(subscriber: ScrollSubscriber): () => void {
  if (subscribers.size === 0) {
    window.addEventListener('scroll', notify, { passive: true })
  }
  subscribers.add(subscriber)

  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) window.removeEventListener('scroll', notify)
  }
}
