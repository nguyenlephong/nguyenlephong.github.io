#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import nextEnv from '@next/env'

import { createArtifactIndex } from './lib/artifact-index.mjs'
import { applyContentSecurityPolicy } from './lib/content-security-policy.mjs'
import {
  recoverStaleOgTransactions,
  withPostbuildTransformLock,
} from './lib/og-artifact-transaction.mjs'
import { generateOfflineArtifacts } from './postbuild-offline.mjs'
import { normalizeStaticOgArtifacts } from './postbuild-og.mjs'

const OUT_DIR = path.resolve(process.env.OG_OUT_DIR ?? path.join(process.cwd(), 'out'))
const NEXT_DIR = path.resolve(process.env.NEXT_BUILD_DIR ?? path.join(process.cwd(), '.next'))

export async function runPostbuildTransforms({
  acquireLock = true,
  nextDir = NEXT_DIR,
  outDir = OUT_DIR,
} = {}) {
  const transform = async () => {
    try {
      await fs.access(outDir)
    } catch {
      return { skipped: true }
    }

    await recoverStaleOgTransactions(outDir)
    await gateAdsTxt(outDir)
    const artifactIndex = await createArtifactIndex(outDir)
    const og = await normalizeStaticOgArtifacts({
      acquireLock: false,
      outDir,
      artifactIndex,
      nextDir,
      recoverTransactions: false,
    })
    // After OG (it rewrites flight data), before offline (it fingerprints final HTML).
    const csp = await applyContentSecurityPolicy(artifactIndex, cspBuildOptions())
    const offline = await generateOfflineArtifacts({ outDir, artifactIndex })

    return {
      skipped: false,
      og,
      csp,
      offline,
      inventory: artifactIndex.metrics(),
    }
  }

  if (!acquireLock) return transform()
  return withPostbuildTransformLock(outDir, transform)
}

// MEP-66: public/ads.txt is kept in the repo but ships only while AdSense is on,
// using the same GOOGLE_THIRD_PARTY flag as src/lib/public-third-party.ts.
export async function gateAdsTxt(
  outDir,
  enabled = process.env.GOOGLE_THIRD_PARTY === 'on',
) {
  if (!enabled) await fs.rm(path.join(outDir, 'ads.txt'), { force: true })
}

// MEP-75: the policy allows only what this build ships. Next loads .env* inside its own
// process; load them the same way so Firebase and App Check match the client bundle.
export function cspBuildOptions(env = loadBuildEnv()) {
  const firestore = Boolean(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      env.NEXT_PUBLIC_FIREBASE_APP_ID,
  )
  return {
    firestore,
    appCheck: firestore && Boolean(env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY?.trim()),
    googleThirdParty: env.GOOGLE_THIRD_PARTY === 'on',
  }
}

function loadBuildEnv() {
  const quiet = { info() {}, error: console.error }
  return { ...nextEnv.loadEnvConfig(process.cwd(), false, quiet).combinedEnv, ...process.env }
}

export function reportPostbuildResult(result, { outDir = OUT_DIR } = {}) {
  if (result.skipped) {
    console.warn(`[postbuild] skip: ${outDir} does not exist`)
    return
  }

  console.log(
    `[postbuild] normalized ${result.og.renamed.length} OG file(s), deduplicated ` +
      `${result.og.deduplicated.length} file(s) / ${result.og.savedBytes} byte(s), rewrote ` +
      `${result.og.updatedHtml} HTML and ${result.og.updatedText} text metadata file(s)`,
  )
  console.log(
    `[postbuild] CSP meta on ${result.csp.pages} page(s), at most ${result.csp.maxHashes} script hash(es) per page`,
  )
  console.log(
    `[postbuild] offline shell ${result.offline.manifest.shared.shell.length} file(s), ` +
      `${result.offline.manifest.shared.runtimeAssets.length} runtime asset(s) cached on demand`,
  )
  console.log(
    `[postbuild] artifact inventory walks=${result.inventory.walks} files=${result.inventory.files} ` +
    `diskReads=${result.inventory.diskReads} cacheHits=${result.inventory.cacheHits}`,
  )
}

async function main() {
  const result = await runPostbuildTransforms()
  reportPostbuildResult(result)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[postbuild] failed:', error)
    process.exitCode = 1
  })
}
