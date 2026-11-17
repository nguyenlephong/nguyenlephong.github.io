#!/usr/bin/env node
/**
 * MEP-90: build the /admin insight snapshot and write it to adminVault/{ADMIN_VAULT_ID}.
 * Runs in .github/workflows/admin-snapshot.yml with the Firebase Admin SDK, which
 * bypasses Firestore rules (clients can only `get` the vault document).
 *
 * Env:
 *   FIREBASE_SERVICE_ACCOUNT   service account JSON (needs Firestore read/write)
 *   ADMIN_VAULT_ID             output of scripts/admin-vault-id.mjs
 *   POSTHOG_PERSONAL_API_KEY   personal API key with query:read (optional; block goes stale without it)
 *   POSTHOG_PROJECT_ID         numeric PostHog project id
 *   POSTHOG_HOST               defaults to https://us.posthog.com
 *   ADMIN_SNAPSHOT_DEPS        folder whose node_modules holds firebase-admin (workflow-only install)
 *   FIRESTORE_EMULATOR_HOST    local runs against the emulator; FIREBASE_PROJECT_ID then names the project
 *
 * Flags: --dry-run builds and measures the snapshot without writing it.
 * Logs carry counts only: never the vault id, keys or the snapshot itself.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ADMIN_VAULT_COLLECTION, isAdminVaultId } from '../src/lib/admin/vault-id.mjs'
import {
  assertSnapshotFits,
  buildContentCatalog,
  buildFirestoreInsights,
  buildPostHogInsights,
  mergeSnapshot,
  runPostHogQueries,
} from './lib/admin-snapshot.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_POSTHOG_HOST = 'https://us.posthog.com'

function log(message) {
  console.log(`[admin-snapshot] ${message}`)
}

function loadFirebaseAdmin() {
  const depsDir = process.env.ADMIN_SNAPSHOT_DEPS
  const require = createRequire(
    depsDir ? path.join(path.resolve(depsDir), 'package.json') : import.meta.url,
  )
  return {
    app: require('firebase-admin/app'),
    firestore: require('firebase-admin/firestore'),
  }
}

function initialiseFirestore({ app, firestore }) {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-admin-snapshot'
    return firestore.getFirestore(app.initializeApp({ projectId }))
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  let serviceAccount
  try {
    serviceAccount = JSON.parse(raw)
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON')
  }
  return firestore.getFirestore(
    app.initializeApp({
      credential: app.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    }),
  )
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), 'utf8'))
}

async function collectPostHog() {
  try {
    const results = await runPostHogQueries({
      fetch: globalThis.fetch,
      host: process.env.POSTHOG_HOST || DEFAULT_POSTHOG_HOST,
      projectId: process.env.POSTHOG_PROJECT_ID,
      apiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    })
    return { posthog: buildPostHogInsights(results), posthogError: null }
  } catch (error) {
    return { posthog: null, posthogError: error }
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const vaultId = process.env.ADMIN_VAULT_ID?.trim()
  if (!isAdminVaultId(vaultId)) {
    throw new Error('ADMIN_VAULT_ID must be the 64-char hex output of scripts/admin-vault-id.mjs')
  }

  const db = initialiseFirestore(loadFirebaseAdmin())
  const now = new Date()
  const [blogIndex, notesIndex, statsSnapshot, previousSnapshot] = await Promise.all([
    readJson('content/blog-data/_index.json'),
    readJson('content/notes-data/_index.json'),
    db.collection('postStats').get(),
    db.collection(ADMIN_VAULT_COLLECTION).doc(vaultId).get(),
  ])

  const catalog = buildContentCatalog(blogIndex, notesIndex, now.toISOString().slice(0, 10))
  const firestore = buildFirestoreInsights(
    statsSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })),
    catalog,
  )
  const { posthog, posthogError } = await collectPostHog()
  const snapshot = mergeSnapshot({
    previous: previousSnapshot.exists ? previousSnapshot.data() : null,
    firestore,
    posthog,
    posthogError,
    now,
  })
  const bytes = assertSnapshotFits(snapshot)

  log(
    `${statsSnapshot.size} postStats docs, ${firestore.posts.length} ranked posts, ` +
      `posthog ${snapshot.posthog.status}, ${bytes} bytes`,
  )
  if (snapshot.posthog.status !== 'ok') log(`posthog: ${snapshot.posthog.error}`)
  if (dryRun) {
    log('dry run: nothing written')
    return
  }
  await db.collection(ADMIN_VAULT_COLLECTION).doc(vaultId).set(snapshot)
  log('snapshot written')
}

main().catch((error) => {
  console.error(`[admin-snapshot] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
