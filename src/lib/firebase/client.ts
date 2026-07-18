/**
 * Lazy, client-only Firebase initialiser.
 *
 * The whole Firebase SDK is loaded through dynamic `import()` so it lands in its
 * own code-split chunk — it never touches the main/landing bundle and only
 * downloads when a visitor actually interacts with the blog engagement widgets.
 *
 * Everything no-ops gracefully when the `NEXT_PUBLIC_FIREBASE_*` env vars are
 * missing, so the site keeps working before the project is configured. Stats
 * code must never break the reading experience.
 */
import type { FirebaseApp } from 'firebase/app'
import type { Firestore } from 'firebase/firestore'
import { bootstrapAppCheckToken } from './app-check-bootstrap'
import {
  activateAppCheck,
  createInitialAppCheckStatus,
  engagementWritesAllowed,
  failAppCheck,
  parseAppCheckMode,
  type FirebaseAppCheckStatus,
} from './app-check-policy'

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function readConfig(): FirebaseConfig | null {
  const apiKey = process.env['NEXT_PUBLIC_FIREBASE_API_KEY']
  const projectId = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']
  const appId = process.env['NEXT_PUBLIC_FIREBASE_APP_ID']

  // The three values above are the minimum needed for Firestore to work.
  if (!apiKey || !projectId || !appId) return null

  return {
    apiKey,
    authDomain:
      process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ??
      `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ??
      `${projectId}.appspot.com`,
    messagingSenderId:
      process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    appId,
  }
}

/** True when the env is wired up — lets callers skip work without importing the SDK. */
export function isFirebaseConfigured(): boolean {
  return readConfig() !== null
}

let dbPromise: Promise<Firestore | null> | null = null

const appCheckSiteKey =
  process.env['NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY']?.trim() ?? ''
let appCheckStatus = createInitialAppCheckStatus(
  parseAppCheckMode(process.env['NEXT_PUBLIC_FIREBASE_APPCHECK_MODE']),
  appCheckSiteKey,
)

/** Current status; `active` means initial App Check token acquisition succeeded. */
export function getFirebaseAppCheckStatus(): Readonly<FirebaseAppCheckStatus> {
  return appCheckStatus
}

/** Policy gate used by every engagement mutation after `getDb()` settles. */
export function areFirebaseEngagementWritesEnabled(): boolean {
  return engagementWritesAllowed(getFirebaseAppCheckStatus())
}

async function initialiseAppCheck(app: FirebaseApp): Promise<void> {
  if (!appCheckSiteKey || appCheckStatus.mode === 'invalid') return

  if (await bootstrapAppCheckToken(app, appCheckSiteKey)) {
    appCheckStatus = activateAppCheck(appCheckStatus)
  } else {
    appCheckStatus = failAppCheck(appCheckStatus)
  }
}

/**
 * Returns a memoised Firestore instance, or `null` when unconfigured or when
 * called on the server (static export has no client runtime there).
 */
export function getDb(): Promise<Firestore | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (dbPromise) return dbPromise

  dbPromise = (async () => {
    const config = readConfig()
    if (!config) {
      if (appCheckStatus.state === 'pending') {
        appCheckStatus = failAppCheck(appCheckStatus)
      }
      return null
    }

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app')

      const app: FirebaseApp = getApps().length
        ? getApp()
        : initializeApp(config)
      // Firebase requires App Check to be initialized before Firestore access.
      await initialiseAppCheck(app)
      const { getFirestore } = await import('firebase/firestore')
      return getFirestore(app)
    } catch {
      if (appCheckStatus.state === 'pending') {
        appCheckStatus = failAppCheck(appCheckStatus)
      }
      // Network/SDK failure must not surface to the reader.
      return null
    }
  })()

  return dbPromise
}
