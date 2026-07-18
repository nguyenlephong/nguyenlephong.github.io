#!/usr/bin/env node
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { constants as fsConstants, promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import {
  expectedArticleOgPublications,
  loadMediaPublicationContract,
} from './lib/media-publication-contract.mjs'
import { githubRepositoryFromRemote } from './lib/github-origin.mjs'
import {
  DEFAULT_OG_JPEG_QUALITY,
  renderOgJpeg,
  validateOgImage,
} from './lib/og-image-conversion.mjs'
import {
  acquirePublicationLock,
  PUBLICATION_LOCK_FILENAME,
  releasePublicationLock,
} from './lib/publication-lock.mjs'

const EXPECTED_SITE_REPOSITORY = 'nguyenlephong/nguyenlephong.github.io'
const EXPECTED_DOM_PUB_REPOSITORY = 'nguyenlephong/dom-pub'
const SUPPORTED_SURFACES = new Set(['blog', 'notes'])
const SURFACE_NAMESPACES = {
  blog: 'og/blogs',
  notes: 'og/notes',
}
const execFileAsync = promisify(execFile)

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function isStrictlyInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function assertStrictlyInside(parentPath, candidatePath, label) {
  if (!isStrictlyInside(parentPath, candidatePath)) {
    throw new Error(`[publish-og] safety check failed; ${label} escapes ${parentPath}`)
  }
}

async function lstatOrNull(filePath) {
  try {
    return await fs.lstat(filePath)
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

async function assertCanonicalDirectory(filePath, label) {
  const resolvedPath = path.resolve(filePath)
  const stats = await lstatOrNull(resolvedPath)
  if (stats?.isSymbolicLink()) {
    throw new Error(`[publish-og] safety check failed; ${label} must not be a symlink: ${resolvedPath}`)
  }
  if (!stats?.isDirectory()) {
    throw new Error(`[publish-og] safety check failed; ${label} is not a directory: ${resolvedPath}`)
  }
  return fs.realpath(resolvedPath)
}

async function assertCanonicalDescendantDirectory(parentRealPath, relativePath, label) {
  let currentPath = parentRealPath
  for (const segment of relativePath.split('/')) {
    currentPath = path.join(currentPath, segment)
    const stats = await lstatOrNull(currentPath)
    if (stats?.isSymbolicLink()) {
      throw new Error(`[publish-og] safety check failed; ${label} must not contain symlinks: ${currentPath}`)
    }
    if (!stats?.isDirectory()) {
      throw new Error(`[publish-og] safety check failed; ${label} is not a directory: ${currentPath}`)
    }
  }

  const realPath = await fs.realpath(currentPath)
  assertStrictlyInside(parentRealPath, realPath, label)
  return realPath
}

export { githubRepositoryFromRemote }

async function runGit(cwd, args) {
  try {
    return await execFileAsync('git', ['-C', cwd, ...args], { encoding: 'utf8' })
  } catch (error) {
    throw new Error(`[publish-og] git ${args.join(' ')} failed for ${cwd}`, { cause: error })
  }
}

async function validateGitCheckout({ directory, expectedRepository, label, requireClean = true }) {
  const realPath = await assertCanonicalDirectory(directory, label)
  const [{ stdout: topLevel }, { stdout: remoteUrl }] = await Promise.all([
    runGit(realPath, ['rev-parse', '--show-toplevel']),
    runGit(realPath, ['remote', 'get-url', 'origin']),
  ])

  const topLevelRealPath = await fs.realpath(topLevel.trim())
  if (topLevelRealPath !== realPath) {
    throw new Error(`[publish-og] safety check failed; ${label} is not the repository root: ${realPath}`)
  }

  const repository = githubRepositoryFromRemote(remoteUrl)
  if (repository !== expectedRepository) {
    throw new Error(
      `[publish-og] safety check failed; ${label} expected origin ${expectedRepository}, received ${repository ?? 'unknown'}`,
    )
  }
  if (requireClean) {
    const { stdout: status } = await runGit(realPath, [
      'status',
      '--porcelain=v1',
      '--untracked-files=all',
    ])
    if (!status.trim()) return realPath
    throw new Error(
      `[publish-og] safety check failed; ${label} must be clean before publication:\n${status.trim()}`,
    )
  }

  return realPath
}

export async function getPublicationLockPath(domPubRoot) {
  const { stdout } = await runGit(domPubRoot, ['rev-parse', '--absolute-git-dir'])
  const gitDirectory = await assertCanonicalDirectory(stdout.trim(), 'dom-pub git directory')
  return path.join(gitDirectory, PUBLICATION_LOCK_FILENAME)
}

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function validateSourceFile(sourcePath, sourceRoot, entry) {
  const stats = await lstatOrNull(sourcePath)
  if (stats?.isSymbolicLink()) {
    throw new Error(`[publish-og] source must not be a symlink: ${toPosix(entry.sourcePath)}`)
  }
  if (!stats?.isFile()) {
    throw new Error(`[publish-og] missing source PNG: ${toPosix(entry.sourcePath)}`)
  }
  const realPath = await fs.realpath(sourcePath)
  assertStrictlyInside(sourceRoot, realPath, `source ${entry.sourcePath}`)
  const bytes = await fs.readFile(realPath)
  await validateOgImage(bytes, { format: 'png', label: entry.sourcePath })
  return { bytes, realPath }
}

async function validateDestinationFile(destinationPath, surfaceRoot, entry) {
  const stats = await lstatOrNull(destinationPath)
  if (!stats) return { exists: false, digest: null }
  if (stats.isSymbolicLink()) {
    throw new Error(`[publish-og] destination must not be a symlink: icdn/${entry.key}`)
  }
  if (!stats.isFile()) {
    throw new Error(`[publish-og] destination is not a regular file: icdn/${entry.key}`)
  }

  const realPath = await fs.realpath(destinationPath)
  assertStrictlyInside(surfaceRoot, realPath, `destination icdn/${entry.key}`)
  await validateOgImage(realPath, { format: 'jpeg', label: `icdn/${entry.key}` })
  const bytes = await fs.readFile(realPath)
  return { exists: true, digest: digest(bytes) }
}

async function preflightPublication({ rootDir, domPubRoot, surface }) {
  if (!SUPPORTED_SURFACES.has(surface)) {
    throw new Error(`[publish-og] --surface must be one of: blog, notes`)
  }

  const [siteRoot, validatedDomPubRoot] = await Promise.all([
    validateGitCheckout({
      directory: rootDir,
      expectedRepository: EXPECTED_SITE_REPOSITORY,
      label: 'site checkout',
    }),
    validateGitCheckout({
      directory: domPubRoot,
      expectedRepository: EXPECTED_DOM_PUB_REPOSITORY,
      label: 'dom-pub checkout',
    }),
  ])
  if (validatedDomPubRoot !== domPubRoot) {
    throw new Error('[publish-og] safety check failed; canonical dom-pub root changed while locked')
  }
  if (siteRoot === validatedDomPubRoot) {
    throw new Error('[publish-og] safety check failed; site and dom-pub checkouts must be different repositories')
  }

  const contract = await loadMediaPublicationContract(siteRoot)
  const publication = contract.articleOg[surface]
  const expectedNamespace = SURFACE_NAMESPACES[surface]
  if (publication.publicationDirectory !== expectedNamespace) {
    throw new Error(
      `[publish-og] safety check failed; ${surface} publication namespace must be ${expectedNamespace}`,
    )
  }
  if (
    publication.sourceExtension !== '.png' ||
    publication.publicationExtension !== '.jpg' ||
    publication.publicationFormat !== 'jpeg'
  ) {
    throw new Error(`[publish-og] safety check failed; ${surface} must publish PNG sources as .jpg JPEG files`)
  }

  const sourceRoot = await assertCanonicalDescendantDirectory(
    siteRoot,
    publication.sourceDirectory,
    `${surface} source directory`,
  )

  const icdnRoot = await assertCanonicalDescendantDirectory(domPubRoot, 'icdn', 'dom-pub icdn directory')
  const surfaceDirectoryPath = path.join(icdnRoot, publication.publicationDirectory)
  const surfaceRoot = await assertCanonicalDescendantDirectory(
    icdnRoot,
    publication.publicationDirectory,
    `${surface} publication directory`,
  )

  const expected = await expectedArticleOgPublications({
    rootDir: siteRoot,
    contract,
    surface,
  })
  if (expected.length === 0) {
    throw new Error(`[publish-og] preflight failed; ${surface} has no expected OG publications`)
  }

  const plans = []
  const destinations = new Set()
  for (const entry of expected) {
    if (entry.surface !== surface || !entry.key.startsWith(`${expectedNamespace}/`)) {
      throw new Error(`[publish-og] safety check failed; publication entry escaped ${surface}: ${entry.key}`)
    }

    const sourcePath = path.resolve(siteRoot, entry.sourcePath)
    assertStrictlyInside(sourceRoot, sourcePath, `source ${entry.sourcePath}`)
    const source = await validateSourceFile(sourcePath, sourceRoot, entry)

    const destinationPath = path.resolve(icdnRoot, entry.key)
    assertStrictlyInside(surfaceRoot, destinationPath, `destination icdn/${entry.key}`)
    if (path.dirname(destinationPath) !== surfaceRoot) {
      throw new Error(`[publish-og] safety check failed; nested publication paths are not allowed: ${entry.key}`)
    }
    if (destinations.has(destinationPath)) {
      throw new Error(`[publish-og] preflight failed; duplicate destination: icdn/${entry.key}`)
    }
    destinations.add(destinationPath)

    const destination = await validateDestinationFile(destinationPath, surfaceRoot, entry)
    plans.push({
      entry,
      sourceBytes: source.bytes,
      sourcePath: source.realPath,
      destinationPath,
      destination,
    })
  }

  return { domPubRoot, plans, surfaceDirectoryPath, surfaceRoot }
}

async function renderPlan(plan, renderImpl, quality) {
  const output = await renderImpl(plan.sourceBytes, { quality })
  if (!Buffer.isBuffer(output) && !(output instanceof Uint8Array)) {
    throw new Error(`[publish-og] converter returned a non-buffer for ${plan.entry.sourcePath}`)
  }
  const bytes = Buffer.from(output)
  await validateOgImage(bytes, { format: 'jpeg', label: `converted ${plan.entry.sourcePath}` })
  return { bytes, digest: digest(bytes) }
}

async function assertPublicationRootUnchanged(surfaceDirectoryPath, surfaceRoot, surface) {
  const currentSurfaceRoot = await assertCanonicalDirectory(
    surfaceDirectoryPath,
    `${surface} publication directory`,
  )
  if (currentSurfaceRoot !== surfaceRoot) {
    throw new Error(
      `[publish-og] destination root changed after preflight; refusing publication: ${surfaceDirectoryPath}`,
    )
  }
}

async function assertDestinationUnchanged(plan, surfaceDirectoryPath, surfaceRoot) {
  await assertPublicationRootUnchanged(
    surfaceDirectoryPath,
    surfaceRoot,
    plan.entry.surface,
  )
  const current = await validateDestinationFile(
    plan.destinationPath,
    surfaceRoot,
    plan.entry,
  )
  if (current.exists !== plan.destination.exists || current.digest !== plan.destination.digest) {
    throw new Error(
      `[publish-og] destination changed after preflight; refusing overwrite: icdn/${plan.entry.key}`,
    )
  }
}

async function quarantineDestinationForRollback(
  plan,
  stagingRoot,
  surfaceDirectoryPath,
  surfaceRoot,
) {
  await assertPublicationRootUnchanged(
    surfaceDirectoryPath,
    surfaceRoot,
    plan.entry.surface,
  )
  const quarantinePath = path.join(stagingRoot, 'rollback-current', `${plan.entry.slug}.jpg`)
  assertStrictlyInside(stagingRoot, quarantinePath, 'rollback quarantine')
  await fs.mkdir(path.dirname(quarantinePath), { recursive: true })
  try {
    await fs.rename(plan.destinationPath, quarantinePath)
  } catch (error) {
    throw new Error(
      `[publish-og] destination disappeared or changed before rollback; refusing destructive recovery: icdn/${plan.entry.key}. Preserve ${stagingRoot}`,
      { cause: error },
    )
  }

  const stats = await lstatOrNull(quarantinePath)
  const currentDigest = stats?.isFile() && !stats.isSymbolicLink()
    ? digest(await fs.readFile(quarantinePath))
    : null
  return { currentDigest, quarantinePath }
}

async function restoreQuarantinedFile(quarantinePath, destinationPath) {
  await fs.link(quarantinePath, destinationPath)
  await fs.unlink(quarantinePath)
}

function createSummary(surface, dryRun, plans) {
  const summary = {
    surface,
    mode: dryRun ? 'dry-run' : 'published',
    expected: plans.length,
    added: 0,
    changed: 0,
    unchanged: 0,
    skipped: 0,
    deleted: 0,
  }
  for (const plan of plans) summary[plan.action] += 1
  return summary
}

async function installPlans({
  plans,
  stagingRoot,
  surfaceDirectoryPath,
  surfaceRoot,
  beforeOperation,
}) {
  const installable = plans.filter((plan) => plan.action === 'added' || plan.action === 'changed')
  const backupRoot = path.join(stagingRoot, 'backup')
  const installed = []

  for (const plan of installable) {
    if (plan.action !== 'changed') continue
    const backupPath = path.join(backupRoot, `${plan.entry.slug}.jpg`)
    await fs.mkdir(path.dirname(backupPath), { recursive: true })
    await fs.copyFile(plan.destinationPath, backupPath, fsConstants.COPYFILE_EXCL)
    const backupDigest = digest(await fs.readFile(backupPath))
    if (backupDigest !== plan.destination.digest) {
      throw new Error(`[publish-og] backup verification failed before install: icdn/${plan.entry.key}`)
    }
    plan.backupPath = backupPath
  }

  try {
    for (const plan of installable) {
      await beforeOperation({ operation: 'install', plan })
      await assertDestinationUnchanged(plan, surfaceDirectoryPath, surfaceRoot)
      await fs.rename(plan.stagedPath, plan.destinationPath)
      plan.installedDigest = plan.digest
      installed.push(plan)
    }
    for (const plan of installed) {
      await beforeOperation({ operation: 'verify-installed', plan })
      const current = await validateDestinationFile(
        plan.destinationPath,
        surfaceRoot,
        plan.entry,
      )
      if (!current.exists || current.digest !== plan.installedDigest) {
        throw new Error(`[publish-og] destination changed during publication: icdn/${plan.entry.key}`)
      }
    }
  } catch (error) {
    const rollbackErrors = []
    for (const plan of installed.reverse()) {
      try {
        await beforeOperation({ operation: 'rollback', plan })
        const { currentDigest, quarantinePath } = await quarantineDestinationForRollback(
          plan,
          stagingRoot,
          surfaceDirectoryPath,
          surfaceRoot,
        )
        if (currentDigest !== plan.installedDigest) {
          try {
            await restoreQuarantinedFile(quarantinePath, plan.destinationPath)
          } catch (restoreError) {
            throw new AggregateError(
              [restoreError],
              `[publish-og] destination changed after install and could not be restored without overwriting another file: icdn/${plan.entry.key}. Foreign bytes remain at ${quarantinePath}`,
            )
          }
          throw new Error(
            `[publish-og] destination changed after install; refusing rollback to avoid data loss: icdn/${plan.entry.key}. Preserve ${stagingRoot} and reconcile the foreign change manually`,
          )
        }
        if (plan.action === 'added') {
          await fs.unlink(quarantinePath)
        } else {
          try {
            await fs.link(plan.backupPath, plan.destinationPath)
          } catch (restoreError) {
            throw new Error(
              `[publish-og] original backup could not be restored without overwriting a concurrent file: icdn/${plan.entry.key}. Preserve ${stagingRoot}`,
              { cause: restoreError },
            )
          }
          await fs.unlink(plan.backupPath)
          await fs.unlink(quarantinePath)
        }
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }
    if (rollbackErrors.length > 0) {
      const aggregate = new AggregateError(
        [error, ...rollbackErrors],
        `[publish-og] publication failed and rollback was incomplete; recovery files remain at ${stagingRoot}`,
      )
      aggregate.recoveryPath = stagingRoot
      throw aggregate
    }
    throw error
  }
}

async function runLockedPublication({
  rootDir,
  domPubRoot,
  surface,
  missingOnly,
  dryRun,
  quality,
  renderImpl,
  beforeOperation,
  removeStagingImpl,
}) {
  const { plans, surfaceDirectoryPath, surfaceRoot } = await preflightPublication({
    rootDir,
    domPubRoot,
    surface,
  })

  const processed = []
  if (dryRun) {
    for (const plan of plans) {
      if (missingOnly && plan.destination.exists) {
        processed.push({ ...plan, action: 'skipped' })
        continue
      }
      const rendered = await renderPlan(plan, renderImpl, quality)
      const action = !plan.destination.exists
        ? 'added'
        : rendered.digest === plan.destination.digest
          ? 'unchanged'
          : 'changed'
      processed.push({ ...plan, ...rendered, action })
    }
    return createSummary(surface, true, processed)
  }

  const stagingRoot = await fs.mkdtemp(path.join(domPubRoot, '.og-publish-stage-'))
  let result
  let operationError
  try {
    const outputRoot = path.join(stagingRoot, 'output')
    await fs.mkdir(outputRoot, { recursive: true })
    for (const plan of plans) {
      if (missingOnly && plan.destination.exists) {
        processed.push({ ...plan, action: 'skipped' })
        continue
      }

      const rendered = await renderPlan(plan, renderImpl, quality)
      const action = !plan.destination.exists
        ? 'added'
        : rendered.digest === plan.destination.digest
          ? 'unchanged'
          : 'changed'
      const processedPlan = { ...plan, ...rendered, action }
      if (action === 'added' || action === 'changed') {
        processedPlan.stagedPath = path.join(outputRoot, `${plan.entry.slug}.jpg`)
        assertStrictlyInside(stagingRoot, processedPlan.stagedPath, 'staged output')
        await fs.writeFile(processedPlan.stagedPath, rendered.bytes, { flag: 'wx' })
        await validateOgImage(processedPlan.stagedPath, {
          format: 'jpeg',
          label: `staged ${plan.entry.key}`,
        })
      }
      processed.push(processedPlan)
    }

    await installPlans({
      plans: processed,
      stagingRoot,
      surfaceDirectoryPath,
      surfaceRoot,
      beforeOperation,
    })
    result = createSummary(surface, false, processed)
  } catch (error) {
    operationError = error
  }

  const preserveForRecovery = Boolean(operationError?.recoveryPath)
  let cleanupError
  if (!preserveForRecovery) {
    try {
      await removeStagingImpl(stagingRoot, { recursive: true, force: true })
    } catch (error) {
      cleanupError = new Error(
        `[publish-og] staging cleanup failed; preserve and inspect ${stagingRoot}`,
        { cause: error },
      )
      cleanupError.recoveryPath = stagingRoot
    }
  }

  if (operationError && cleanupError) {
    const aggregate = new AggregateError(
      [operationError, cleanupError],
      `[publish-og] publication and staging cleanup failed; recovery files remain at ${stagingRoot}`,
    )
    aggregate.recoveryPath = stagingRoot
    throw aggregate
  }
  if (operationError) throw operationError
  if (cleanupError) throw cleanupError
  return result
}

export async function publishOgAssets({
  rootDir = process.cwd(),
  domPubDir,
  surface,
  missingOnly = false,
  dryRun = false,
  recoverStaleLock = false,
  quality = Number(process.env.ICDN_OG_JPEG_QUALITY ?? DEFAULT_OG_JPEG_QUALITY),
  renderImpl = renderOgJpeg,
  beforeOperation = async () => {},
  beforeLockRelease = async () => {},
  removeStagingImpl = fs.rm,
  lockOptions = {},
} = {}) {
  if (!domPubDir) throw new Error('[publish-og] --dom-pub is required')
  if (
    typeof missingOnly !== 'boolean' ||
    typeof dryRun !== 'boolean' ||
    typeof recoverStaleLock !== 'boolean'
  ) {
    throw new Error('[publish-og] missingOnly, dryRun, and recoverStaleLock must be boolean values')
  }
  if (!SUPPORTED_SURFACES.has(surface)) {
    throw new Error('[publish-og] --surface must be one of: blog, notes')
  }

  const resolvedRootDir = path.resolve(rootDir)
  const domPubRoot = await validateGitCheckout({
    directory: path.resolve(domPubDir),
    expectedRepository: EXPECTED_DOM_PUB_REPOSITORY,
    label: 'dom-pub checkout',
    requireClean: false,
  })
  const lockPath = await getPublicationLockPath(domPubRoot)
  const lock = await acquirePublicationLock({
    ...lockOptions,
    lockPath,
    surface,
    siteRoot: resolvedRootDir,
    recoverStaleLock,
  })

  let result
  let operationError
  try {
    result = await runLockedPublication({
      rootDir: resolvedRootDir,
      domPubRoot,
      surface,
      missingOnly,
      dryRun,
      quality,
      renderImpl,
      beforeOperation,
      removeStagingImpl,
    })
  } catch (error) {
    operationError = error
  }

  const releaseErrors = []
  try {
    await beforeLockRelease({ lock, operationError })
  } catch (error) {
    releaseErrors.push(error)
  }
  try {
    await releasePublicationLock(lock)
  } catch (error) {
    releaseErrors.push(error)
  }

  if (operationError && releaseErrors.length > 0) {
    const aggregate = new AggregateError(
      [operationError, ...releaseErrors],
      '[publish-og] publication failed and lock cleanup also failed; inspect every reported recovery path',
    )
    aggregate.recoveryPath = operationError.recoveryPath ?? releaseErrors.find((error) => error?.recoveryPath)?.recoveryPath
    throw aggregate
  }
  if (operationError) throw operationError
  if (releaseErrors.length === 1) throw releaseErrors[0]
  if (releaseErrors.length > 1) {
    throw new AggregateError(releaseErrors, '[publish-og] publication lock cleanup failed')
  }
  return result
}

export function parsePublisherArgs(argv) {
  const options = { missingOnly: false, dryRun: false, recoverStaleLock: false }
  const seen = new Set()

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (
      argument === '--missing-only' ||
      argument === '--dry-run' ||
      argument === '--recover-stale-lock'
    ) {
      if (seen.has(argument)) throw new Error(`[publish-og] duplicate flag: ${argument}`)
      seen.add(argument)
      const optionName = {
        '--missing-only': 'missingOnly',
        '--dry-run': 'dryRun',
        '--recover-stale-lock': 'recoverStaleLock',
      }[argument]
      options[optionName] = true
      continue
    }
    if (argument === '--surface' || argument === '--dom-pub') {
      if (seen.has(argument)) throw new Error(`[publish-og] duplicate flag: ${argument}`)
      seen.add(argument)
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error(`[publish-og] ${argument} requires a value`)
      }
      options[argument === '--surface' ? 'surface' : 'domPubDir'] = value
      index += 1
      continue
    }
    throw new Error(`[publish-og] unknown argument: ${argument}`)
  }

  if (!options.surface) throw new Error('[publish-og] --surface is required')
  if (!SUPPORTED_SURFACES.has(options.surface)) {
    throw new Error('[publish-og] --surface must be one of: blog, notes')
  }
  if (!options.domPubDir) throw new Error('[publish-og] --dom-pub is required')
  return options
}

function printSummary(summary) {
  console.log(
    `[publish-og] surface=${summary.surface} mode=${summary.mode} expected=${summary.expected} added=${summary.added} changed=${summary.changed} unchanged=${summary.unchanged} skipped=${summary.skipped} deleted=${summary.deleted}`,
  )
}

async function main() {
  const options = parsePublisherArgs(process.argv.slice(2))
  const summary = await publishOgAssets(options)
  printSummary(summary)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[publish-og] failed:', error)
    process.exitCode = 1
  })
}
