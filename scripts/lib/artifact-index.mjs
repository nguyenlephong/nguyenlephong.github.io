import { promises as fs } from 'node:fs'
import path from 'node:path'

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function normalizeRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0 || path.isAbsolute(value)) {
    throw new Error(`[artifact-index] expected a non-empty relative path, received ${String(value)}`)
  }

  const normalized = toPosix(path.normalize(value)).replace(/^\.\//, '')
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`[artifact-index] path escapes the artifact root: ${value}`)
  }
  return normalized
}

async function scanFiles(rootDir, metrics) {
  const files = new Set()
  const pending = ['']

  while (pending.length > 0) {
    const relativeDirectory = pending.pop()
    const directory = relativeDirectory ? path.join(rootDir, relativeDirectory) : rootDir
    const entries = await fs.readdir(directory, { withFileTypes: true })
    metrics.directories += 1

    for (const entry of entries) {
      const relativePath = relativeDirectory
        ? path.posix.join(toPosix(relativeDirectory), entry.name)
        : entry.name
      if (entry.isDirectory()) pending.push(relativePath)
      else files.add(relativePath)
    }
  }

  metrics.files = files.size
  return files
}

/**
 * Build one mutable inventory for all post-build transforms.
 *
 * Paths at this seam are always POSIX-style and relative to rootDir. Reads are
 * cached, while writes, renames, and removals keep the inventory coherent for
 * the next transform without another filesystem walk.
 */
export async function createArtifactIndex(rootDir) {
  const root = path.resolve(rootDir)
  const metrics = {
    walks: 1,
    directories: 0,
    files: 0,
    diskReads: 0,
    cacheHits: 0,
    writes: 0,
    renames: 0,
    removes: 0,
  }
  const files = await scanFiles(root, metrics)
  const contentCache = new Map()

  const resolve = (relativePath) => path.join(root, normalizeRelativePath(relativePath))

  const index = {
    root,

    files() {
      return [...files].sort((left, right) => left.localeCompare(right))
    },

    has(relativePath) {
      return files.has(normalizeRelativePath(relativePath))
    },

    resolve,

    async readBuffer(relativePath) {
      const normalized = normalizeRelativePath(relativePath)
      const cached = contentCache.get(normalized)
      if (cached) {
        metrics.cacheHits += 1
        return cached
      }
      if (!files.has(normalized)) {
        const error = new Error(`[artifact-index] file is not in the inventory: ${normalized}`)
        error.code = 'ENOENT'
        throw error
      }
      const content = await fs.readFile(resolve(normalized))
      metrics.diskReads += 1
      contentCache.set(normalized, content)
      return content
    },

    async readText(relativePath) {
      return (await index.readBuffer(relativePath)).toString('utf8')
    },

    async write(relativePath, content) {
      const normalized = normalizeRelativePath(relativePath)
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content)
      await fs.mkdir(path.dirname(resolve(normalized)), { recursive: true })
      await fs.writeFile(resolve(normalized), buffer)
      files.add(normalized)
      contentCache.set(normalized, buffer)
      metrics.files = files.size
      metrics.writes += 1
    },

    async rename(from, to) {
      const source = normalizeRelativePath(from)
      const target = normalizeRelativePath(to)
      if (!files.has(source)) {
        throw new Error(`[artifact-index] cannot rename missing file: ${source}`)
      }
      if (files.has(target)) {
        throw new Error(`[artifact-index] refusing to overwrite indexed file: ${target}`)
      }

      await fs.rename(resolve(source), resolve(target))
      files.delete(source)
      files.add(target)
      if (contentCache.has(source)) {
        contentCache.set(target, contentCache.get(source))
        contentCache.delete(source)
      }
      metrics.renames += 1
    },

    async removeTree(relativePath) {
      const normalized = normalizeRelativePath(relativePath).replace(/\/$/, '')
      await fs.rm(resolve(normalized), { recursive: true, force: true })
      const prefix = `${normalized}/`
      let removed = 0
      for (const file of [...files]) {
        if (file !== normalized && !file.startsWith(prefix)) continue
        files.delete(file)
        contentCache.delete(file)
        removed += 1
      }
      metrics.files = files.size
      metrics.removes += removed
    },

    metrics() {
      return { ...metrics }
    },
  }

  return index
}
