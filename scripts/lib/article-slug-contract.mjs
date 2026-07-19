import { promises as fs } from 'node:fs'
import path from 'node:path'

const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ARTICLE_SURFACES = [
  { directory: 'content/blog-data', surface: 'blog' },
  { directory: 'content/notes-data', surface: 'notes' },
]

function validatedPosts(index, label, { optional = false } = {}) {
  const posts = index?.posts
  if (optional && posts === undefined) return []
  if (!Array.isArray(posts)) {
    throw new Error(`[content-slug] ${label} must contain a posts array`)
  }
  return posts
}

function validatedSlug(post, label) {
  const slug = post?.slug
  if (typeof slug !== 'string' || !SAFE_SLUG_PATTERN.test(slug)) {
    throw new Error(`[content-slug] ${label} contains an invalid slug`)
  }
  return slug
}

async function readIndex(indexPath, label, { optional = false } = {}) {
  let stats
  try {
    stats = await fs.lstat(indexPath)
  } catch (error) {
    if (optional && error?.code === 'ENOENT') return null
    throw error
  }
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw new Error(`[content-slug] ${label} must be a regular non-symlink file`)
  }
  try {
    return JSON.parse(await fs.readFile(indexPath, 'utf8'))
  } catch (error) {
    throw new Error(
      `[content-slug] ${label} must contain valid JSON: ${error instanceof Error ? error.message : error}`,
      { cause: error },
    )
  }
}

export function assertGlobalArticleSlugUniqueness(surfaceIndexes) {
  const ownerBySlug = new Map()
  const slugsBySurface = new Map()

  for (const { index, source, surface } of surfaceIndexes) {
    const surfaceSlugs = new Set()
    for (const post of validatedPosts(index, source)) {
      const slug = validatedSlug(post, source)
      if (surfaceSlugs.has(slug)) {
        throw new Error(`[content-slug] duplicate ${surface} slug "${slug}" in ${source}`)
      }
      surfaceSlugs.add(slug)

      const owner = ownerBySlug.get(slug)
      if (owner && owner.surface !== surface) {
        throw new Error(
          `[content-slug] Blog and Notes slugs must be globally unique; ` +
            `"${slug}" appears in ${owner.source} and ${source}`,
        )
      }
      ownerBySlug.set(slug, { source, surface })
    }
    slugsBySurface.set(surface, surfaceSlugs)
  }

  return slugsBySurface
}

export async function validateAuthoredArticleSlugUniqueness({
  rootDir = process.cwd(),
} = {}) {
  const surfaceIndexes = []
  for (const { directory, surface } of ARTICLE_SURFACES) {
    const source = `${directory}/_index.json`
    surfaceIndexes.push({
      index: await readIndex(path.join(rootDir, source), source),
      source,
      surface,
    })
  }

  const canonicalSlugs = assertGlobalArticleSlugUniqueness(surfaceIndexes)
  let localizedIndexCount = 0
  for (const { directory, surface } of ARTICLE_SURFACES) {
    const absoluteDirectory = path.join(rootDir, directory)
    const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const source = `${directory}/${entry.name}/_index.json`
      const index = await readIndex(path.join(rootDir, source), source, { optional: true })
      if (!index) continue
      localizedIndexCount += 1

      const localizedSlugs = new Set()
      for (const post of validatedPosts(index, source, { optional: true })) {
        const slug = validatedSlug(post, source)
        if (localizedSlugs.has(slug)) {
          throw new Error(`[content-slug] duplicate localized ${surface} slug "${slug}" in ${source}`)
        }
        localizedSlugs.add(slug)
        if (!canonicalSlugs.get(surface)?.has(slug)) {
          throw new Error(
            `[content-slug] localized ${surface} slug "${slug}" in ${source} ` +
              'does not exist in its canonical index',
          )
        }
      }
    }
  }

  return {
    blog: canonicalSlugs.get('blog')?.size ?? 0,
    localizedIndexes: localizedIndexCount,
    notes: canonicalSlugs.get('notes')?.size ?? 0,
  }
}
