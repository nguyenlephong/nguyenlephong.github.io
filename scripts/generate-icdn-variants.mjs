#!/usr/bin/env node
// Writes 480w and 800w WebP variants next to each content image in the dom-pub
// icdn checkout and records them in config/icdn-responsive-variants.json.
// The site adds srcset only for images listed there, so publish the dom-pub
// variants first, then commit the manifest.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = process.cwd()
const DOM_PUB_DIR = path.resolve(process.env.DOM_PUB_DIR ?? path.join(ROOT, '..', 'dom-pub'))
const MANIFEST_PATH = path.join(ROOT, 'config/icdn-responsive-variants.json')
const CONTENT_DIRS = ['blogs', 'notes', 'gallery']
// 800 rather than 960: a 390px phone at DPR 2 needs 780px, and 960w WebP of the
// 1600px article art is 38-44 KiB against the 35 KiB per-image target (800w: 32-35).
export const VARIANT_WIDTHS = [480, 800]
const WEBP_QUALITY = Number(process.env.ICDN_VARIANT_QUALITY ?? 78)
const VARIANT_SUFFIX = /-\d+w\.webp$/i

export function variantWidthsFor(width) {
  return VARIANT_WIDTHS.filter((candidate) => candidate < width)
}

export function variantPath(filePath, width) {
  return filePath.replace(/\.webp$/i, `-${width}w.webp`)
}

/** Manifest key: the URL-encoded path below icdn/, as media URLs spell it. */
export function manifestKey(icdnDir, filePath) {
  return path.relative(icdnDir, filePath).split(path.sep).map(encodeURIComponent).join('/')
}

async function walkWebp(dir) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walkWebp(full)))
    else if (entry.isFile() && /\.webp$/i.test(entry.name) && !VARIANT_SUFFIX.test(entry.name)) files.push(full)
  }
  return files
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function generateVariants({
  icdnDir = path.join(DOM_PUB_DIR, 'icdn'),
  manifestPath = MANIFEST_PATH,
  force = false,
} = {}) {
  let previous = {}
  try {
    previous = JSON.parse(await fs.readFile(manifestPath, 'utf8')).images ?? {}
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  // shortcut: entries for images missing from a partial checkout are kept as they are.
  const images = { ...previous }
  let written = 0
  for (const dir of CONTENT_DIRS) {
    for (const file of await walkWebp(path.join(icdnDir, dir))) {
      const { width, height } = await sharp(file).metadata()
      const widths = variantWidthsFor(width)
      for (const target of widths) {
        const output = variantPath(file, target)
        if (!force && (await exists(output))) continue
        await sharp(file).resize({ width: target }).webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(output)
        written += 1
      }
      const key = manifestKey(icdnDir, file)
      if (widths.length > 0) images[key] = { width, height, widths }
      else delete images[key]
    }
  }

  const sorted = Object.fromEntries(Object.entries(images).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
  await fs.writeFile(manifestPath, `${JSON.stringify({ schemaVersion: 1, images: sorted }, null, 2)}\n`)
  return { written, images: sorted }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateVariants({ force: process.argv.includes('--force') })
    .then(({ written, images }) => {
      console.log(`[icdn-variants] wrote ${written} variant files; ${Object.keys(images).length} images listed`)
    })
    .catch((error) => {
      console.error('[icdn-variants] failed:', error)
      process.exit(1)
    })
}
