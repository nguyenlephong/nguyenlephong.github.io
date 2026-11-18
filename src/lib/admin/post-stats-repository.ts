/**
 * Reads every postStats document for /admin with the same lazy Firestore Lite
 * client as article engagement. The counters are public (see firestore.rules);
 * the list query must carry a limit the rules accept.
 */
import { getDb } from '@/lib/firebase/client'

export const POST_STATS_LIST_LIMIT = 2000

export type PostStatsLoad =
  | { status: 'ok'; docs: Array<{ id: string; data: unknown }>; truncated: boolean }
  | { status: 'unavailable'; reason: 'not_configured' | 'request_failed' }

// Dev-only hook for local screenshots against the Firestore emulator; the
// NODE_ENV check removes it from the production export.
const DEV_EMULATOR_HOST =
  process.env.NODE_ENV === 'development'
    ? process.env['NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST']
    : undefined
let emulatorConnected = false

export async function fetchAllPostStats(): Promise<PostStatsLoad> {
  const db = await getDb()
  if (!db) return { status: 'unavailable', reason: 'not_configured' }
  try {
    const { collection, connectFirestoreEmulator, getDocs, limit, query } = await import(
      'firebase/firestore/lite'
    )
    if (process.env.NODE_ENV === 'development' && DEV_EMULATOR_HOST && !emulatorConnected) {
      const [host = 'localhost', port = '8080'] = DEV_EMULATOR_HOST.split(':')
      connectFirestoreEmulator(db, host, Number(port))
      emulatorConnected = true
    }
    const snapshot = await getDocs(query(collection(db, 'postStats'), limit(POST_STATS_LIST_LIMIT)))
    return {
      status: 'ok',
      docs: snapshot.docs.map((entry) => ({ id: entry.id, data: entry.data() })),
      truncated: snapshot.size >= POST_STATS_LIST_LIMIT,
    }
  } catch {
    return { status: 'unavailable', reason: 'request_failed' }
  }
}
