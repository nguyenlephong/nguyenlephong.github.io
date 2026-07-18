#!/usr/bin/env node
/**
 * Post-build step for static export on GitHub Pages.
 *
 * Next.js writes `opengraph-image` files without a `.png` extension.
 * GitHub Pages serves un-extensioned files as `application/octet-stream`,
 * which causes Facebook/Twitter/LinkedIn scrapers to reject the image.
 *
 * This script:
 *   1. Renames every `out/.../opengraph-image[-hash]` file (and its `.body`
 *      cousin if present) to `opengraph-image[-hash].png`.
 *   2. Rewrites every emitted `*.html` file to point at the new `.png`
 *      URL (preserving the `?hash` cache buster Next appends).
 * Article OG images are generated under `public/og` and published through the
 * media pipeline, so this step only normalizes route-level files Next emits.
 */
import { promises as fs } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createArtifactIndex } from './lib/artifact-index.mjs'

const OUT_DIR = path.resolve(process.env.OG_OUT_DIR ?? path.join(process.cwd(), 'out'))
const MAX_RENAME_LOGS = 40
const DEFAULT_METADATA_CONCURRENCY = 32
const OG_ARTIFACT_PATTERN = /^(opengraph-image|twitter-image)(-[a-z0-9]+)?(?:\.body)?$/i
const FINAL_OG_ARTIFACT_PATTERN = /^((?:opengraph-image|twitter-image)(?:-[a-z0-9]+)?)\.png$/i
const OG_METADATA_CONSUMER_EXTENSIONS = new Set(['.html', '.txt'])
const OG_URL_PATTERN =
  /(?<![a-z0-9_./:-])((?:https?:\/\/[a-z0-9.-]+(?::\d+)?)?)(\/(?:[a-z0-9._~-]+\/)*((?:opengraph-image|twitter-image)(?:-[a-z0-9]+)?))(\?[^"'\\\s<>]*)?(?=\\?["']|["'\s<>),\]}]|$)/gi

function metadataConcurrency() {
  const value = Number(process.env.POSTBUILD_METADATA_CONCURRENCY ?? DEFAULT_METADATA_CONCURRENCY)
  if (!Number.isFinite(value) || value < 1) return DEFAULT_METADATA_CONCURRENCY
  return Math.trunc(value)
}

async function mapWithConcurrency(items, concurrency, task) {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1))
  let cursor = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const index = cursor
        cursor += 1
        await task(items[index])
      }
    }),
  )
}

async function renameOgFiles(artifactIndex) {
  const renamed = []
  for (const file of artifactIndex.files()) {
    const base = path.posix.basename(file)
    const match = base.match(OG_ARTIFACT_PATTERN)
    if (!match) continue

    const target = path.posix.join(
      path.posix.dirname(file),
      `${match[1]}${match[2] ?? ''}.png`,
    )
    if (artifactIndex.has(target)) {
      throw new Error(
        `[postbuild-og] refusing to overwrite existing normalized OG artifact: ${artifactIndex.resolve(target)}`,
      )
    }
    await artifactIndex.rename(file, target)
    renamed.push({ from: file, to: target })
  }
  return renamed
}

function artifactUrl(file) {
  return `/${file}`
}

async function buildOgUrlMappings({ artifactIndex, renamed }) {
  const normalizedFiles = new Set(renamed.map(({ to }) => to))
  for (const file of artifactIndex.files()) {
    if (FINAL_OG_ARTIFACT_PATTERN.test(path.posix.basename(file))) normalizedFiles.add(file)
  }

  const exact = new Map()
  const candidatesByStem = new Map()
  for (const file of [...normalizedFiles].sort()) {
    const match = path.posix.basename(file).match(FINAL_OG_ARTIFACT_PATTERN)
    if (!match) continue

    const finalUrl = artifactUrl(file)
    const sourceUrl = finalUrl.slice(0, -'.png'.length)
    const existing = exact.get(sourceUrl)
    if (existing && existing !== finalUrl) {
      throw new Error(`[postbuild-og] conflicting normalized OG route: ${sourceUrl}`)
    }
    exact.set(sourceUrl, finalUrl)

    const content = await artifactIndex.readBuffer(file)
    const digest = createHash('sha256').update(content).digest('hex')
    const stem = match[1].toLowerCase()
    const candidates = candidatesByStem.get(stem) ?? []
    candidates.push({ digest, finalUrl })
    candidatesByStem.set(stem, candidates)
  }

  const sharedByStem = new Map()
  for (const [stem, candidates] of candidatesByStem) {
    if (new Set(candidates.map(({ digest }) => digest)).size !== 1) continue
    const finalUrl = candidates.map(({ finalUrl: value }) => value).sort()[0]
    sharedByStem.set(stem, finalUrl)
  }

  return { exact, sharedByStem }
}

function rewriteOgUrls(content, mappings) {
  return content.replace(
    OG_URL_PATTERN,
    (match, origin, sourceUrl, stem, query = '') => {
      const target = mappings.exact.get(sourceUrl) ?? mappings.sharedByStem.get(stem.toLowerCase())
      return target ? `${origin}${target}${query}` : match
    },
  )
}

async function rewriteMetadataConsumers(artifactIndex, mappings) {
  const updated = { html: 0, text: 0 }
  const consumers = artifactIndex.files().filter((file) =>
    OG_METADATA_CONSUMER_EXTENSIONS.has(path.posix.extname(file).toLowerCase()),
  )

  await mapWithConcurrency(consumers, metadataConcurrency(), async (file) => {
    const extension = path.posix.extname(file).toLowerCase()
    const original = await artifactIndex.readText(file)
    const next = rewriteOgUrls(original, mappings)
    if (next !== original) {
      await artifactIndex.write(file, next)
      if (extension === '.html') updated.html += 1
      else updated.text += 1
    }
  })
  return updated
}

export async function normalizeStaticOgArtifacts({ outDir = OUT_DIR, artifactIndex } = {}) {
  try {
    await fs.access(outDir)
  } catch {
    return { skipped: true, renamed: [], updatedHtml: 0, updatedText: 0 }
  }

  const index = artifactIndex ?? (await createArtifactIndex(outDir))
  if (path.resolve(index.root) !== path.resolve(outDir)) {
    throw new Error('[postbuild-og] artifact index root does not match outDir')
  }
  const renamed = await renameOgFiles(index)
  const mappings = await buildOgUrlMappings({ artifactIndex: index, renamed })
  const updated = await rewriteMetadataConsumers(index, mappings)

  return {
    skipped: false,
    renamed: renamed.map(({ from, to }) => ({
      from: index.resolve(from),
      to: index.resolve(to),
    })),
    updatedHtml: updated.html,
    updatedText: updated.text,
  }
}

async function main() {
  const result = await normalizeStaticOgArtifacts()
  if (result.skipped) {
    console.warn(`[postbuild-og] skip: ${OUT_DIR} does not exist`)
    return
  }

  const { renamed, updatedHtml, updatedText } = result

  console.log(
    `[postbuild-og] renamed ${renamed.length} OG file(s), rewrote ${updatedHtml} HTML and ${updatedText} text metadata file(s)`
  )
  for (const r of renamed.slice(0, MAX_RENAME_LOGS)) {
    console.log(`  ${path.relative(OUT_DIR, r.from)} → ${path.relative(OUT_DIR, r.to)}`)
  }
  if (renamed.length > MAX_RENAME_LOGS) {
    console.log(`  ... ${renamed.length - MAX_RENAME_LOGS} more file(s) omitted`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('[postbuild-og] failed:', err)
    process.exitCode = 1
  })
}
