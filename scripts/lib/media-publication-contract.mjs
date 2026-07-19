import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  isContentPublishedAtBuildDate,
  resolveContentBuildDate,
} from '../../src/lib/content/publication-contract.mjs'
import {
  assertGlobalArticleSlugUniqueness,
  validateAuthoredArticleSlugUniqueness,
} from './article-slug-contract.mjs'

const CONTRACT_PATH = 'config/media-publication.json'
const PUBLIC_CONTRACT_PATH = 'config/media-publication-public.json'
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

function isStrictlyInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

async function readSourceIndex(rootDir, relativePath, surface) {
  const canonicalRoot = await fs.realpath(path.resolve(rootDir))
  const rootStats = await fs.lstat(canonicalRoot)
  if (!rootStats.isDirectory()) {
    throw new Error('[media-publication] rootDir must resolve to a directory')
  }

  const sourceIndexPath = path.resolve(canonicalRoot, relativePath)
  const sourceStats = await fs.lstat(sourceIndexPath)
  if (sourceStats.isSymbolicLink()) {
    throw new Error(`[media-publication] ${surface} sourceIndex must not be a symlink`)
  }
  if (!sourceStats.isFile()) {
    throw new Error(`[media-publication] ${surface} sourceIndex must be a regular file`)
  }

  const canonicalSourceIndex = await fs.realpath(sourceIndexPath)
  if (!isStrictlyInside(canonicalRoot, canonicalSourceIndex)) {
    throw new Error(`[media-publication] ${surface} sourceIndex escapes the canonical site root`)
  }
  return JSON.parse(await fs.readFile(canonicalSourceIndex, 'utf8'))
}

function assertPrunePolicy(surface, policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new Error(`[media-publication] articleOg.${surface}.prunePolicy must be an object`)
  }
  if (!Number.isSafeInteger(policy.maxDeleteCount) || policy.maxDeleteCount < 1) {
    throw new Error(
      `[media-publication] articleOg.${surface}.prunePolicy.maxDeleteCount must be a positive integer`,
    )
  }
  if (
    typeof policy.maxDeletePercent !== 'number' ||
    !Number.isFinite(policy.maxDeletePercent) ||
    policy.maxDeletePercent <= 0 ||
    policy.maxDeletePercent > 100
  ) {
    throw new Error(
      `[media-publication] articleOg.${surface}.prunePolicy.maxDeletePercent must be in (0, 100]`,
    )
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
  assertPrunePolicy(surface, publication.prunePolicy)
}

function validatePublicProjection(surface, publication, projection) {
  if (!projection || typeof projection !== 'object' || Array.isArray(projection)) {
    throw new Error(`[media-publication] public articleOg.${surface} must be an object`)
  }
  const expectedKeys = ['localPathPrefix', 'publicPathPrefix', 'publicationExtension']
  const actualKeys = Object.keys(projection).sort((left, right) => left.localeCompare(right))
  const sortedExpectedKeys = [...expectedKeys].sort((left, right) => left.localeCompare(right))
  if (JSON.stringify(actualKeys) !== JSON.stringify(sortedExpectedKeys)) {
    throw new Error(
      `[media-publication] public articleOg.${surface} must contain only ${expectedKeys.join(', ')}`,
    )
  }
  const expectedLocalPrefix = `/${publication.sourceDirectory.replace(/^public\//, '')}`
  if (projection.localPathPrefix !== expectedLocalPrefix) {
    throw new Error(
      `[media-publication] public articleOg.${surface}.localPathPrefix must match ${expectedLocalPrefix}`,
    )
  }
  if (projection.publicPathPrefix !== publication.publicPathPrefix) {
    throw new Error(
      `[media-publication] public articleOg.${surface}.publicPathPrefix must match the build contract`,
    )
  }
  if (projection.publicationExtension !== publication.publicationExtension) {
    throw new Error(
      `[media-publication] public articleOg.${surface}.publicationExtension must match the build contract`,
    )
  }
}

export async function loadMediaPublicationContract(rootDir = process.cwd()) {
  const contractPath = path.resolve(rootDir, CONTRACT_PATH)
  const publicContractPath = path.resolve(rootDir, PUBLIC_CONTRACT_PATH)
  const [contract, publicContract] = await Promise.all([
    fs.readFile(contractPath, 'utf8').then(JSON.parse),
    fs.readFile(publicContractPath, 'utf8').then(JSON.parse),
  ])

  if (contract.schemaVersion !== 1) {
    throw new Error(`[media-publication] unsupported schema version: ${String(contract.schemaVersion)}`)
  }
  if (!contract.articleOg || typeof contract.articleOg !== 'object') {
    throw new Error('[media-publication] articleOg publications are required')
  }
  if (publicContract.schemaVersion !== 1) {
    throw new Error(
      `[media-publication] unsupported public schema version: ${String(publicContract.schemaVersion)}`,
    )
  }
  if (!publicContract.articleOg || typeof publicContract.articleOg !== 'object') {
    throw new Error('[media-publication] public articleOg projections are required')
  }

  const surfaces = Object.entries(contract.articleOg)
  if (surfaces.length === 0) throw new Error('[media-publication] at least one article OG surface is required')

  const publicationDirectories = new Set()
  for (const [surface, publication] of surfaces) {
    validateSurface(surface, publication)
    validatePublicProjection(surface, publication, publicContract.articleOg[surface])
    if (publicationDirectories.has(publication.publicationDirectory)) {
      throw new Error(
        `[media-publication] duplicate publication directory: ${publication.publicationDirectory}`,
      )
    }
    publicationDirectories.add(publication.publicationDirectory)
  }
  const publicSurfaces = Object.keys(publicContract.articleOg).sort((left, right) =>
    left.localeCompare(right),
  )
  const buildSurfaces = surfaces
    .map(([surface]) => surface)
    .sort((left, right) => left.localeCompare(right))
  if (JSON.stringify(publicSurfaces) !== JSON.stringify(buildSurfaces)) {
    throw new Error('[media-publication] public and build articleOg surfaces must match exactly')
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

export async function articleOgPublicationInventory({
  rootDir = process.cwd(),
  contract,
  surface: requestedSurface,
  contentBuildDate,
} = {}) {
  const resolvedContract = contract ?? (await loadMediaPublicationContract(rootDir))
  const resolvedBuildDate = resolveContentBuildDate(
    contentBuildDate ?? process.env.CONTENT_BUILD_DATE,
  )
  const known = []
  const keys = new Set()
  const indexesBySurface = new Map()

  if (requestedSurface && !Object.hasOwn(resolvedContract.articleOg, requestedSurface)) {
    throw new Error(`[media-publication] unknown article OG surface: ${requestedSurface}`)
  }

  for (const [surface, publication] of Object.entries(resolvedContract.articleOg)) {
    const index = await readSourceIndex(rootDir, publication.sourceIndex, surface)
    indexesBySurface.set(surface, index)
  }
  await validateAuthoredArticleSlugUniqueness({ rootDir })
  assertGlobalArticleSlugUniqueness(
    Object.entries(resolvedContract.articleOg).map(([surface, publication]) => ({
      index: indexesBySurface.get(surface),
      source: publication.sourceIndex,
      surface,
    })),
  )

  for (const [surface, publication] of Object.entries(resolvedContract.articleOg)) {
    if (requestedSurface && surface !== requestedSurface) continue
    const index = indexesBySurface.get(surface)
    for (const post of index.posts) {
      const slug = post?.slug
      if (typeof slug !== 'string' || !SAFE_SLUG_PATTERN.test(slug)) {
        throw new Error(`[media-publication] ${surface} contains an invalid post slug`)
      }
      let published
      try {
        published = isContentPublishedAtBuildDate(post, resolvedBuildDate)
      } catch (error) {
        throw new Error(
          `[media-publication] invalid publication metadata for ${surface}/${slug}: ${error instanceof Error ? error.message : error}`,
          { cause: error },
        )
      }
      const key = `${publication.publicationDirectory}/${slug}${publication.publicationExtension}`
      if (keys.has(key)) throw new Error(`[media-publication] duplicate publication key: ${key}`)
      keys.add(key)
      known.push({
        surface,
        slug,
        key,
        published,
        publicPath: `${publication.publicPathPrefix}/${slug}${publication.publicationExtension}`,
        sourcePath: `${publication.sourceDirectory}/${slug}${publication.sourceExtension}`,
      })
    }
  }

  return {
    expected: known.filter((entry) => entry.published),
    known,
  }
}

export async function expectedArticleOgPublications(options = {}) {
  const { expected } = await articleOgPublicationInventory(options)
  return expected.map(({
    published: _published,
    ...entry
  }) => entry)
}
