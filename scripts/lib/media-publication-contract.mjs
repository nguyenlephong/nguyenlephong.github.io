import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  isContentPublishedAtBuildDate,
  resolveContentBuildDate,
} from '../../src/lib/content/publication-contract.mjs'

const CONTRACT_PATH = 'config/media-publication.json'
const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SAFE_RELATIVE_PATH_PATTERN = /^[A-Za-z0-9._/-]+$/

function assertRelativePath(value, label) {
  if (
    typeof value !== 'string' ||
    !value ||
    path.isAbsolute(value) ||
    !SAFE_RELATIVE_PATH_PATTERN.test(value) ||
    value.split('/').some((segment) => segment === '..' || segment === '')
  ) {
    throw new Error(`[media-publication] ${label} must be a safe repository-relative path`)
  }
}

function assertExtension(value, label) {
  if (typeof value !== 'string' || !/^\.[a-z0-9]+$/i.test(value)) {
    throw new Error(`[media-publication] ${label} must be a file extension`)
  }
}

function validateSurface(surface, publication) {
  if (!publication || typeof publication !== 'object' || Array.isArray(publication)) {
    throw new Error(`[media-publication] articleOg.${surface} must be an object`)
  }

  assertRelativePath(publication.sourceIndex, `articleOg.${surface}.sourceIndex`)
  assertRelativePath(publication.sourceDirectory, `articleOg.${surface}.sourceDirectory`)
  assertRelativePath(publication.publicationDirectory, `articleOg.${surface}.publicationDirectory`)
  assertExtension(publication.sourceExtension, `articleOg.${surface}.sourceExtension`)
  assertExtension(publication.publicationExtension, `articleOg.${surface}.publicationExtension`)

  if (
    typeof publication.publicPathPrefix !== 'string' ||
    !publication.publicPathPrefix.startsWith('/') ||
    publication.publicPathPrefix.endsWith('/') ||
    publication.publicPathPrefix.includes('..')
  ) {
    throw new Error(`[media-publication] articleOg.${surface}.publicPathPrefix must be an absolute path prefix`)
  }
  if (publication.publicationFormat !== 'jpeg') {
    throw new Error(`[media-publication] articleOg.${surface}.publicationFormat must be jpeg`)
  }
}

export async function loadMediaPublicationContract(rootDir = process.cwd()) {
  const contractPath = path.resolve(rootDir, CONTRACT_PATH)
  const contract = JSON.parse(await fs.readFile(contractPath, 'utf8'))

  if (contract.schemaVersion !== 1) {
    throw new Error(`[media-publication] unsupported schema version: ${String(contract.schemaVersion)}`)
  }
  if (!contract.articleOg || typeof contract.articleOg !== 'object') {
    throw new Error('[media-publication] articleOg publications are required')
  }

  const surfaces = Object.entries(contract.articleOg)
  if (surfaces.length === 0) throw new Error('[media-publication] at least one article OG surface is required')

  const publicationDirectories = new Set()
  for (const [surface, publication] of surfaces) {
    validateSurface(surface, publication)
    if (publicationDirectories.has(publication.publicationDirectory)) {
      throw new Error(
        `[media-publication] duplicate publication directory: ${publication.publicationDirectory}`,
      )
    }
    publicationDirectories.add(publication.publicationDirectory)
  }

  if (typeof contract.remoteTreeUrl !== 'string' || new URL(contract.remoteTreeUrl).protocol !== 'https:') {
    throw new Error('[media-publication] remoteTreeUrl must be an HTTPS URL')
  }
  if (typeof contract.liveBaseUrl !== 'string') {
    throw new Error('[media-publication] liveBaseUrl must be an HTTPS URL')
  }
  const liveBaseUrl = new URL(contract.liveBaseUrl)
  if (
    liveBaseUrl.protocol !== 'https:' ||
    liveBaseUrl.username ||
    liveBaseUrl.password ||
    liveBaseUrl.search ||
    liveBaseUrl.hash
  ) {
    throw new Error('[media-publication] liveBaseUrl must be a credential-free HTTPS URL')
  }
  contract.liveBaseUrl = liveBaseUrl.href.replace(/\/+$/, '')

  return contract
}

export async function expectedArticleOgPublications({
  rootDir = process.cwd(),
  contract,
  surface: requestedSurface,
  contentBuildDate,
} = {}) {
  const resolvedContract = contract ?? (await loadMediaPublicationContract(rootDir))
  const resolvedBuildDate = resolveContentBuildDate(
    contentBuildDate ?? process.env.CONTENT_BUILD_DATE,
  )
  const expected = []
  const keys = new Set()

  if (requestedSurface && !Object.hasOwn(resolvedContract.articleOg, requestedSurface)) {
    throw new Error(`[media-publication] unknown article OG surface: ${requestedSurface}`)
  }

  for (const [surface, publication] of Object.entries(resolvedContract.articleOg)) {
    if (requestedSurface && surface !== requestedSurface) continue
    const indexPath = path.resolve(rootDir, publication.sourceIndex)
    const index = JSON.parse(await fs.readFile(indexPath, 'utf8'))
    if (!Array.isArray(index.posts)) {
      throw new Error(`[media-publication] ${publication.sourceIndex} must contain a posts array`)
    }

    const surfaceSlugs = new Set()
    for (const post of index.posts) {
      const slug = post?.slug
      if (typeof slug !== 'string' || !SAFE_SLUG_PATTERN.test(slug)) {
        throw new Error(`[media-publication] ${surface} contains an invalid post slug`)
      }
      if (surfaceSlugs.has(slug)) {
        throw new Error(`[media-publication] ${surface} contains duplicate slug: ${slug}`)
      }
      surfaceSlugs.add(slug)

      let published
      try {
        published = isContentPublishedAtBuildDate(post, resolvedBuildDate)
      } catch (error) {
        throw new Error(
          `[media-publication] invalid publication metadata for ${surface}/${slug}: ${error instanceof Error ? error.message : error}`,
          { cause: error },
        )
      }
      if (!published) continue

      const key = `${publication.publicationDirectory}/${slug}${publication.publicationExtension}`
      if (keys.has(key)) throw new Error(`[media-publication] duplicate publication key: ${key}`)
      keys.add(key)
      expected.push({
        surface,
        slug,
        key,
        publicPath: `${publication.publicPathPrefix}/${slug}${publication.publicationExtension}`,
        sourcePath: `${publication.sourceDirectory}/${slug}${publication.sourceExtension}`,
      })
    }
  }

  return expected
}
