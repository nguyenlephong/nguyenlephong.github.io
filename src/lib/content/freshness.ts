import { createHash } from 'node:crypto'
import {
  lstatSync,
  realpathSync,
  readdirSync,
  watch,
  type FSWatcher,
} from 'node:fs'
import path from 'node:path'

const DEFAULT_POLL_INTERVAL_MS = 5_000
const TRACKER_PROTOCOL = 1
const TRACKER_REGISTRY_KEY = Symbol.for(
  'nguyenlephong.content-version-trackers.v1',
)

interface RegisteredTracker {
  protocol: number
  isClosed: boolean
  close(): void
}

type TrackerRegistry = Map<string, ContentVersionTracker & RegisteredTracker>

export interface ContentVersionTrackerOptions {
  /** Bounded stat-only fallback when a platform drops an fs.watch event. */
  pollIntervalMs?: number
}

/**
 * A cheap invalidation signal for file-backed content catalogs.
 *
 * `fs.watch` makes normal edits visible immediately without touching every
 * body on each request. A throttled mtime/size fingerprint is the fallback for
 * editors or filesystems that coalesce/drop watch events. It reads no content
 * bytes and runs at most once per configured interval.
 */
export class ContentVersionTracker {
  readonly protocol = TRACKER_PROTOCOL

  private readonly root: string
  private readonly pollIntervalMs: number
  private version = 0
  private fingerprint: string | null = null
  private nextPollAt = 0
  private watcher: FSWatcher | null = null
  private closed = false

  constructor(root: string, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
    if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 0) {
      throw new RangeError('Content version poll interval must be non-negative')
    }
    this.root = root
    this.pollIntervalMs = pollIntervalMs
    this.startWatcher()
  }

  get isClosed(): boolean {
    return this.closed
  }

  currentVersion(): number {
    if (this.closed) return this.version

    const now = Date.now()
    if (now >= this.nextPollAt) {
      this.nextPollAt = now + this.pollIntervalMs
      const nextFingerprint = fingerprintJsonTree(this.root)
      if (
        this.fingerprint !== null &&
        nextFingerprint !== this.fingerprint
      ) {
        this.version += 1
      }
      this.fingerprint = nextFingerprint
    }

    return this.version
  }

  invalidate(): void {
    this.version += 1
    this.fingerprint = null
    this.nextPollAt = 0
  }

  close(): void {
    this.closed = true
    this.watcher?.close()
    this.watcher = null
  }

  private startWatcher(): void {
    try {
      this.watcher = watch(
        this.root,
        { persistent: false, recursive: true },
        (_eventType, filename) => {
          if (filename && !filename.toString().endsWith('.json')) return
          this.version += 1
          this.fingerprint = null
          this.nextPollAt = Date.now() + this.pollIntervalMs
        },
      )
      this.watcher.on('error', () => {
        this.watcher?.close()
        this.watcher = null
        this.nextPollAt = 0
      })
    } catch {
      // The bounded fingerprint poll remains active on unsupported filesystems.
      this.watcher = null
    }
  }
}

/** Shared across HMR module instances so reloads do not leak duplicate watchers. */
export function getContentVersionTracker(
  root: string,
  options: ContentVersionTrackerOptions = {},
): ContentVersionTracker {
  const resolvedRoot = path.resolve(root)
  let canonicalRoot = resolvedRoot
  try {
    canonicalRoot = realpathSync.native(resolvedRoot)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  const globalWithRegistry = globalThis as typeof globalThis & {
    [TRACKER_REGISTRY_KEY]?: TrackerRegistry
  }
  const registry =
    globalWithRegistry[TRACKER_REGISTRY_KEY] ?? new Map<string, ContentVersionTracker & RegisteredTracker>()
  globalWithRegistry[TRACKER_REGISTRY_KEY] = registry

  const existing = registry.get(canonicalRoot)
  if (existing?.protocol === TRACKER_PROTOCOL && !existing.isClosed) {
    return existing
  }
  existing?.close()

  const tracker = new ContentVersionTracker(
    canonicalRoot,
    options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
  )
  registry.set(canonicalRoot, tracker)
  return tracker
}

function fingerprintJsonTree(root: string): string {
  const hash = createHash('sha256')
  const visit = (directory: string): void => {
    let entries
    try {
      entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
        a.name.localeCompare(b.name),
      )
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
      throw error
    }

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolutePath)
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue

      try {
        const stat = lstatSync(absolutePath, { bigint: true })
        hash.update(path.relative(root, absolutePath))
        hash.update('\0')
        hash.update(stat.size.toString())
        hash.update('\0')
        hash.update(stat.mtimeNs.toString())
        hash.update('\0')
        hash.update(stat.ctimeNs.toString())
        hash.update('\n')
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    }
  }

  visit(root)
  return hash.digest('hex')
}
