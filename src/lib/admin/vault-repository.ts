/**
 * Reads adminVault/{vaultId} with the same lazy Firestore Lite client as article
 * engagement. A wrong password derives a valid but unknown id, which the rules
 * allow to `get` and which simply does not exist.
 */
import { getDb } from '@/lib/firebase/client'
import type { AdminSnapshot } from './snapshot-types'
import { ADMIN_VAULT_COLLECTION, isAdminVaultId } from './vault-id.mjs'

export type AdminVaultLookup =
  | { status: 'found'; snapshot: AdminSnapshot }
  | { status: 'not_found' }
  | { status: 'unavailable'; reason: 'not_configured' | 'request_failed' | 'unsupported' }

function isSnapshot(value: unknown): value is AdminSnapshot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AdminSnapshot>
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.generatedAt === 'string' &&
    Array.isArray(candidate.firestore?.posts) &&
    typeof candidate.posthog?.status === 'string'
  )
}

// Dev-only hook for local screenshots against the Firestore emulator; the
// NODE_ENV check removes it from the production export.
const DEV_EMULATOR_HOST =
  process.env.NODE_ENV === 'development'
    ? process.env['NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST']
    : undefined
let emulatorConnected = false

export async function fetchAdminSnapshot(vaultId: string): Promise<AdminVaultLookup> {
  if (!isAdminVaultId(vaultId)) return { status: 'not_found' }
  const db = await getDb()
  if (!db) return { status: 'unavailable', reason: 'not_configured' }
  try {
    if (process.env.NODE_ENV === 'development' && DEV_EMULATOR_HOST && !emulatorConnected) {
      const { connectFirestoreEmulator } = await import('firebase/firestore/lite')
      const [host = 'localhost', port = '8080'] = DEV_EMULATOR_HOST.split(':')
      connectFirestoreEmulator(db, host, Number(port))
      emulatorConnected = true
    }
    const { doc, getDoc } = await import('firebase/firestore/lite')
    const snapshot = await getDoc(doc(db, ADMIN_VAULT_COLLECTION, vaultId))
    if (!snapshot.exists()) return { status: 'not_found' }
    const data: unknown = snapshot.data()
    return isSnapshot(data)
      ? { status: 'found', snapshot: data }
      : { status: 'unavailable', reason: 'unsupported' }
  } catch {
    return { status: 'unavailable', reason: 'request_failed' }
  }
}
