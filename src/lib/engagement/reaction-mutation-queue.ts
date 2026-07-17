import type { ReactionKey } from './domain'

export interface ReactionMutationSettlement {
  committed: ReactionKey | null
  requested: ReactionKey | null
  succeeded: boolean
  version: number
}

interface ReactionMutationQueueOptions {
  initialCommitted: ReactionKey | null
  mutate: (
    previous: ReactionKey | null,
    next: ReactionKey | null,
  ) => Promise<boolean>
  /**
   * Publishes durable browser state after every successful remote transition.
   * This callback is intentionally independent from UI lifecycle: a request
   * that settles after its component unmounts still owns its committed state.
   */
  onCommitted: (committed: ReactionKey | null) => void
  onLatestSettled: (settlement: ReactionMutationSettlement) => void
}

/**
 * Serializes optimistic reaction intents against the last committed server
 * state. Every successful transition publishes its committed state, while only
 * the newest queued intent may reconcile UI. This keeps durable storage aligned
 * with the server without letting a late failure roll back a newer click.
 */
export class ReactionMutationQueue {
  private committed: ReactionKey | null
  private latestVersion = 0
  private tail: Promise<void> = Promise.resolve()
  private readonly mutate: ReactionMutationQueueOptions['mutate']
  private readonly onCommitted: ReactionMutationQueueOptions['onCommitted']
  private readonly onLatestSettled: ReactionMutationQueueOptions['onLatestSettled']

  constructor(options: ReactionMutationQueueOptions) {
    this.committed = options.initialCommitted
    this.mutate = options.mutate
    this.onCommitted = options.onCommitted
    this.onLatestSettled = options.onLatestSettled
  }

  enqueue(requested: ReactionKey | null): number {
    const version = ++this.latestVersion

    this.tail = this.tail.then(async () => {
      const previous = this.committed
      let succeeded = previous === requested

      if (!succeeded) {
        try {
          succeeded = await this.mutate(previous, requested)
        } catch {
          succeeded = false
        }
      }

      if (succeeded) {
        this.committed = requested
        this.onCommitted(this.committed)
      }

      if (version === this.latestVersion) {
        this.onLatestSettled({
          committed: this.committed,
          requested,
          succeeded,
          version,
        })
      }
    })

    return version
  }

  /** Exposed for deterministic tests and graceful callers that need draining. */
  async whenIdle(): Promise<void> {
    await this.tail
  }
}
