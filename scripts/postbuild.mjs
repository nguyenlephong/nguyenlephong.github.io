#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createArtifactIndex } from './lib/artifact-index.mjs'
import { generateOfflineArtifacts } from './postbuild-offline.mjs'
import { normalizeStaticOgArtifacts } from './postbuild-og.mjs'

const OUT_DIR = path.resolve(process.env.OG_OUT_DIR ?? path.join(process.cwd(), 'out'))

export async function runPostbuildTransforms({ outDir = OUT_DIR } = {}) {
  try {
    await fs.access(outDir)
  } catch {
    return { skipped: true }
  }

  const artifactIndex = await createArtifactIndex(outDir)
  const og = await normalizeStaticOgArtifacts({ outDir, artifactIndex })
  const offline = await generateOfflineArtifacts({ outDir, artifactIndex })

  return {
    skipped: false,
    og,
    offline,
    inventory: artifactIndex.metrics(),
  }
}

async function main() {
  const result = await runPostbuildTransforms()
  if (result.skipped) {
    console.warn(`[postbuild] skip: ${OUT_DIR} does not exist`)
    return
  }

  console.log(
    `[postbuild] normalized ${result.og.renamed.length} OG file(s), rewrote ` +
      `${result.og.updatedHtml} HTML and ${result.og.updatedText} text metadata file(s)`,
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[postbuild] failed:', error)
    process.exitCode = 1
  })
}
