#!/usr/bin/env node
/**
 * Post-build step for static export on GitHub Pages.
 *
 * Next.js writes `opengraph-image` files without a `.png` extension.
 * GitHub Pages serves un-extensioned files as `application/octet-stream`,
 * which causes Facebook/Twitter/LinkedIn scrapers to reject the image.
 *
 * This script:
 *   1. Renames every `out/.../opengraph-image` file (and its `.body` cousin
 *      if present) to `opengraph-image.png`.
 *   2. Rewrites every emitted `*.html` file to point at the new `.png`
 *      URL (preserving the `?hash` cache buster Next appends).
 * Article OG images are committed static assets under `public/og`, so this
 * post-build step only needs to normalize the few remaining route-level OG
 * files that Next emits.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve(process.env.OG_OUT_DIR ?? path.join(process.cwd(), 'out'))
const MAX_RENAME_LOGS = 40

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else {
      files.push(full)
    }
  }
  return files
}

async function renameOgFiles(files) {
  const renamed = []
  for (const file of files) {
    const base = path.basename(file)
    if (base === 'opengraph-image' || base === 'twitter-image') {
      const target = `${file}.png`
      await fs.rename(file, target)
      renamed.push({ from: file, to: target })
    }
  }
  return renamed
}

function htmlCandidatesForOgRoutes(files) {
  const candidates = new Set()
  for (const file of files) {
    const base = path.basename(file)
    if (
      base !== 'opengraph-image' &&
      base !== 'opengraph-image.png' &&
      base !== 'twitter-image' &&
      base !== 'twitter-image.png'
    ) {
      continue
    }

    const routeDir = path.dirname(file)
    if (routeDir === OUT_DIR) {
      candidates.add(path.join(OUT_DIR, 'index.html'))
      continue
    }

    candidates.add(`${routeDir}.html`)
    candidates.add(path.join(routeDir, 'index.html'))
  }
  return [...candidates]
}

async function rewriteHtml(files) {
  let updated = 0
  for (const file of htmlCandidatesForOgRoutes(files)) {
    let original
    try {
      original = await fs.readFile(file, 'utf8')
    } catch (err) {
      if (err?.code === 'ENOENT') continue
      throw err
    }
    let next = original
    // Match the URL exactly so we only touch our OG endpoints and preserve
    // the query string Next appends for cache busting.
    next = next.replace(
      /(\/(?:[a-z0-9_-]+\/)*opengraph-image)(\?[^"'\s>]*)?(?=["'\s>])/gi,
      '$1.png$2'
    )
    next = next.replace(
      /(\/(?:[a-z0-9_-]+\/)*twitter-image)(\?[^"'\s>]*)?(?=["'\s>])/gi,
      '$1.png$2'
    )
    if (next !== original) {
      await fs.writeFile(file, next, 'utf8')
      updated += 1
    }
  }
  return updated
}

async function main() {
  try {
    await fs.access(OUT_DIR)
  } catch {
    console.warn(`[postbuild-og] skip: ${OUT_DIR} does not exist`)
    return
  }

  const files = await walk(OUT_DIR)
  const renamed = await renameOgFiles(files)
  const updatedHtml = await rewriteHtml(files)

  console.log(
    `[postbuild-og] renamed ${renamed.length} OG file(s), rewrote ${updatedHtml} HTML file(s)`
  )
  for (const r of renamed.slice(0, MAX_RENAME_LOGS)) {
    console.log(`  ${path.relative(OUT_DIR, r.from)} → ${path.relative(OUT_DIR, r.to)}`)
  }
  if (renamed.length > MAX_RENAME_LOGS) {
    console.log(`  ... ${renamed.length - MAX_RENAME_LOGS} more file(s) omitted`)
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error('[postbuild-og] failed:', err)
    process.exit(1)
  })
