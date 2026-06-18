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
 *   3. In targeted/cache-only OG builds, restores skipped dynamic OG images
 *      from `public/og-cache` so deployed pages still have image files.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve(process.env.OG_OUT_DIR ?? path.join(process.cwd(), 'out'))
const CACHE_DIR = path.resolve(
  process.env.OG_CACHE_DIR ?? path.join(process.cwd(), 'public', 'og-cache'),
)
const MAX_RENAME_LOGS = 40
const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const RESTORE_CACHE =
  process.argv.includes('--restore-cache') ||
  process.env.OG_BUILD_MODE === 'targeted' ||
  process.env.OG_BUILD_MODE === 'skip'
const STRICT_CACHE =
  process.argv.includes('--strict-cache') || process.env.OG_CACHE_STRICT === '1'

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return walk(full)
      return [full]
    })
  )
  return files.flat()
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

function readJson(file) {
  return fs.readFile(file, 'utf8').then((raw) => JSON.parse(raw))
}

function contentLocale(locale) {
  return locale === 'vi' ? 'vi' : 'en'
}

function noteLocales(post) {
  return post.locales ?? ['vi']
}

async function buildRestorableOgEntries() {
  const entries = []
  const baseBlog = await readJson(
    path.join(process.cwd(), 'public', 'blog-data', '_index.json'),
  )
  const baseNotes = await readJson(
    path.join(process.cwd(), 'public', 'notes-data', '_index.json'),
  )
  const categories = baseBlog.categories.map((category) => category.slug)
  const posts = baseBlog.posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }))

  for (const locale of LOCALES) {
    for (const category of categories) {
      entries.push({
        route: `/${locale}/blog/${category}/opengraph-image.png`,
        prefix: `blog-cat-${category}-${locale}-`,
      })
    }

    for (const { category, slug } of posts) {
      entries.push({
        route: `/${locale}/blog/${category}/${slug}/opengraph-image.png`,
        prefix: `blog-post-${category}-${slug}-${locale}-`,
      })
    }

    const eff = contentLocale(locale)
    for (const post of baseNotes.posts) {
      if (!noteLocales(post).includes(eff)) continue
      entries.push({
        route: `/${locale}/notes/${post.slug}/opengraph-image.png`,
        prefix: `notes-post-${locale}-${post.slug}-`,
      })
    }
  }

  return entries
}

async function readOgCacheIndex() {
  let files
  try {
    files = await fs.readdir(CACHE_DIR, { withFileTypes: true })
  } catch (err) {
    if (err?.code === 'ENOENT') return []
    throw err
  }

  const index = []
  for (const entry of files) {
    if (!entry.isFile()) continue
    if (!entry.name.endsWith('.png')) continue
    const full = path.join(CACHE_DIR, entry.name)
    const stat = await fs.stat(full)
    index.push({ name: entry.name, file: full, mtimeMs: stat.mtimeMs })
  }

  return index
}

function newestCacheFile(cacheIndex, prefix) {
  const candidates = cacheIndex.filter((entry) => entry.name.startsWith(prefix))
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs)
  return candidates[0]?.file ?? null
}

async function restoreOgCache() {
  const entries = await buildRestorableOgEntries()
  const cacheIndex = await readOgCacheIndex()
  let restored = 0
  let skippedExisting = 0
  const missing = []

  for (const entry of entries) {
    const target = path.join(OUT_DIR, entry.route)
    try {
      await fs.access(target)
      skippedExisting += 1
      continue
    } catch {
      // missing target: restore from cache below
    }

    const cached = newestCacheFile(cacheIndex, entry.prefix)
    if (!cached) {
      missing.push(entry)
      continue
    }

    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.copyFile(cached, target)
    restored += 1
  }

  if (missing.length > 0) {
    const preview = missing
      .slice(0, MAX_RENAME_LOGS)
      .map((entry) => `  ${entry.route} (cache prefix: ${entry.prefix})`)
      .join('\n')
    console.warn(
      `[postbuild-og] missing ${missing.length} cached dynamic OG image(s)\n${preview}`,
    )
    if (missing.length > MAX_RENAME_LOGS) {
      console.warn(`  ... ${missing.length - MAX_RENAME_LOGS} more file(s) omitted`)
    }
    if (STRICT_CACHE) {
      throw new Error(
        'Missing cached OG image(s). Run a full build or target the changed route.',
      )
    }
  }

  console.log(
    `[postbuild-og] restored ${restored} cached OG file(s), kept ${skippedExisting} generated OG file(s)`,
  )
}

async function rewriteHtml(files) {
  let updated = 0
  for (const file of files) {
    if (!file.endsWith('.html')) continue
    const original = await fs.readFile(file, 'utf8')
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
  if (RESTORE_CACHE) await restoreOgCache()

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

main().catch((err) => {
  console.error('[postbuild-og] failed:', err)
  process.exit(1)
})
