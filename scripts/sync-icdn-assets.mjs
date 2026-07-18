#!/usr/bin/env node
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { githubRepositoryFromRemote } from './lib/github-origin.mjs'

const ROOT = process.cwd()
const DOM_PUB_DIR = path.resolve(process.env.DOM_PUB_DIR ?? path.join(ROOT, '..', 'dom-pub'))
const ICDN_DIR = path.join(DOM_PUB_DIR, 'icdn')
const WEBP_QUALITY = Number(process.env.ICDN_WEBP_QUALITY ?? 82)
const BATCH_SIZE = Number(process.env.ICDN_SYNC_BATCH_SIZE ?? 8)
const EXPECTED_SITE_REPOSITORY = 'nguyenlephong/nguyenlephong.github.io'
const EXPECTED_DOM_PUB_REPOSITORY = 'nguyenlephong/dom-pub'
const execFileAsync = promisify(execFile)
const DEPRECATION_NOTICE =
  '[sync-icdn] deprecated legacy full sync; article OG assets are exclusively owned by publish-og-assets.mjs'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])
const OWNED_DIRS = ['blogs', 'notes', 'gallery']

const DIRECTORY_GROUPS = [
  { sourceDir: 'public/assets/blog', targetDir: 'blogs', kind: 'webp' },
  { sourceDir: 'public/assets/notes', targetDir: 'notes', kind: 'webp' },
  {
    sourceDir: 'public/assets/photos',
    targetDir: 'gallery/photos',
    kind: 'webp',
  },
]

const LEGACY_GALLERY_ASSETS = [
  {
    from: 'shared/images/cv/images/me/certificate-test.JPG',
    to: 'gallery/certificates/tester-certificate.webp',
  },
  {
    from: 'shared/images/cv/images/me/DSC_1507.JPG',
    to: 'gallery/activities/desk-working.webp',
  },
  {
    from: 'shared/images/cv/images/me/best_rookie.jpeg',
    to: 'gallery/awards/best-rookie.webp',
  },
  {
    from: 'shared/images/cv/images/me/certificate_splus.jpeg',
    to: 'gallery/awards/splus-certificate.webp',
  },
  {
    from: 'shared/images/cv/images/me/award_prime.jpeg',
    to: 'gallery/awards/primedata-award.webp',
  },
  {
    from: 'shared/images/cv/images/project/chess_games.jpg',
    to: 'gallery/projects/chess-games.webp',
  },
  {
    from: 'shared/images/cv/images/project/wat_overview.png',
    to: 'gallery/projects/wat-overview.webp',
  },
  {
    from: 'shared/images/cv/images/me/essay-group.JPG',
    to: 'gallery/projects/essay-group.webp',
  },
  {
    from: 'shared/images/cv/images/me/drone.JPG',
    to: 'gallery/projects/drone-team.webp',
  },
  {
    from: 'shared/images/cv/images/me/drone_dev.jpeg',
    to: 'gallery/projects/drone-development.webp',
  },
]

const LOCAL_GALLERY_ASSETS = [
  {
    from: 'public/assets/photos/cert_verygood.JPG',
    to: 'gallery/certificates/very-good-degree.webp',
  },
  {
    from: 'public/assets/photos/scoreboard.jpeg',
    to: 'gallery/certificates/scoreboard.webp',
  },
  {
    from: 'public/assets/photos/ComplianceRefreshTraining.png',
    to: 'gallery/certificates/compliance-refresh-training.webp',
  },
  {
    from: 'public/assets/photos/CybersecurityRefreshTraining.png',
    to: 'gallery/certificates/cybersecurity-refresh-training.webp',
  },
  {
    from: 'public/assets/photos/medal_uprace.jpeg',
    to: 'gallery/awards/uprace-medals.webp',
  },
  {
    from: 'public/assets/photos/uprace_cert.PNG',
    to: 'gallery/awards/uprace-323km-certificate.webp',
  },
  {
    from: 'public/assets/photos/trekking_penang_hill.jpeg',
    to: 'gallery/awards/trekking-penang-hill.webp',
  },
]

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function replaceExtension(relativePath, extension) {
  const parsed = path.parse(relativePath)
  return path.join(parsed.dir, `${parsed.name}.${extension}`)
}

function isImage(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function walk(dir) {
  if (!(await exists(dir))) return []

  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (entry.isFile() && isImage(full)) {
      files.push(full)
    }
  }
  return files
}

async function ensureParent(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

async function convertToWebp(from, to) {
  await ensureParent(to)
  await sharp(from).rotate().webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(to)
}

async function assertDirectory(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

async function assertFile(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch {
    return false
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

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function assertPathInside(parentPath, candidatePath, label) {
  if (!isPathInside(parentPath, candidatePath)) {
    throw new Error(`[sync-icdn] safety check failed; ${label} escapes ${parentPath}`)
  }
}

async function assertCanonicalDirectory(filePath, label) {
  const resolvedPath = path.resolve(filePath)
  const stats = await lstatOrNull(resolvedPath)
  if (stats?.isSymbolicLink()) {
    throw new Error(`[sync-icdn] safety check failed; ${label} must not be a symlink: ${resolvedPath}`)
  }
  if (!stats?.isDirectory()) {
    throw new Error(`[sync-icdn] safety check failed; ${label} is not a directory: ${resolvedPath}`)
  }

  return fs.realpath(resolvedPath)
}

async function assertOptionalOwnedDirectory(filePath, parentRealPath, label) {
  const stats = await lstatOrNull(filePath)
  if (!stats) return
  if (stats.isSymbolicLink()) {
    throw new Error(`[sync-icdn] safety check failed; ${label} must not be a symlink: ${filePath}`)
  }
  if (!stats.isDirectory()) {
    throw new Error(`[sync-icdn] safety check failed; ${label} is not a directory: ${filePath}`)
  }
  const realPath = await fs.realpath(filePath)
  assertPathInside(parentRealPath, realPath, label)
}

async function validateGitCheckout({ directory, expectedRepository, label, allowTestFixture }) {
  const realPath = await assertCanonicalDirectory(directory, label)
  if (allowTestFixture) {
    const tempRealPath = await fs.realpath(os.tmpdir())
    assertPathInside(tempRealPath, realPath, 'test fixture')
    return realPath
  }

  let topLevelResult
  let remoteUrlResult
  let statusResult
  try {
    ;[topLevelResult, remoteUrlResult, statusResult] = await Promise.all([
      execFileAsync('git', ['-C', realPath, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }),
      execFileAsync('git', ['-C', realPath, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }),
      execFileAsync('git', ['-C', realPath, 'status', '--porcelain=v1', '--untracked-files=all'], {
        encoding: 'utf8',
      }),
    ])
  } catch (error) {
    throw new Error(
      `[sync-icdn] safety check failed; ${label} must be the ${expectedRepository} checkout`,
      { cause: error },
    )
  }

  const repositoryRealPath = await fs.realpath(topLevelResult.stdout.trim())
  if (repositoryRealPath !== realPath) {
    throw new Error(`[sync-icdn] safety check failed; ${label} is not the repository root: ${realPath}`)
  }
  const repository = githubRepositoryFromRemote(remoteUrlResult.stdout)
  if (repository !== expectedRepository) {
    throw new Error(
      `[sync-icdn] safety check failed; ${label} expected origin ${expectedRepository}, received ${repository ?? 'unknown'}`,
    )
  }
  if (statusResult.stdout.trim()) {
    throw new Error(`[sync-icdn] safety check failed; ${label} must be clean before full replacement`)
  }
  return realPath
}

async function validateDomPubTarget({ domPubDir, ownedDirs, allowTestFixture }) {
  const domPubRealPath = await validateGitCheckout({
    directory: domPubDir,
    expectedRepository: EXPECTED_DOM_PUB_REPOSITORY,
    label: 'DOM_PUB_DIR',
    allowTestFixture,
  })

  const expectedIcdnDir = path.join(domPubRealPath, 'icdn')
  const icdnRealPath = await assertCanonicalDirectory(expectedIcdnDir, 'ICDN target')
  assertPathInside(domPubRealPath, icdnRealPath, 'ICDN target')

  for (const ownedDir of ownedDirs) {
    await assertOptionalOwnedDirectory(path.join(icdnRealPath, ownedDir), icdnRealPath, `owned target ${ownedDir}`)
  }

  return { domPubRealPath, icdnRealPath }
}

async function validateReplacementTargets({ stagingIcdnDir, icdnDir, domPubDir, ownedDirs }) {
  const domPubRealPath = await assertCanonicalDirectory(domPubDir, 'DOM_PUB_DIR')
  const icdnRealPath = await assertCanonicalDirectory(icdnDir, 'ICDN target')
  const stagingRealPath = await assertCanonicalDirectory(stagingIcdnDir, 'ICDN staging target')

  if (icdnRealPath !== path.join(domPubRealPath, 'icdn')) {
    throw new Error('[sync-icdn] safety check failed; ICDN target must be DOM_PUB_DIR/icdn')
  }
  assertPathInside(domPubRealPath, stagingRealPath, 'ICDN staging target')

  for (const ownedDir of ownedDirs) {
    await assertOptionalOwnedDirectory(path.join(icdnRealPath, ownedDir), icdnRealPath, `owned target ${ownedDir}`)
    const stagedOwnedDir = path.join(stagingRealPath, ownedDir)
    await assertCanonicalDirectory(stagedOwnedDir, `staged owned target ${ownedDir}`)
    assertPathInside(stagingRealPath, await fs.realpath(stagedOwnedDir), `staged owned target ${ownedDir}`)
  }
}

function assertTargetInsideIcdn(icdnDir, targetPath) {
  const relative = path.relative(icdnDir, targetPath)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`[sync-icdn] invalid target outside icdn: ${targetPath}`)
  }
  const [namespace] = relative.split(path.sep)
  if (namespace.toLowerCase() === 'og') {
    throw new Error(
      '[sync-icdn] article OG namespace is exclusively owned by publish-og-assets.mjs',
    )
  }
}

function assertOwnedDirectories(ownedDirs) {
  if (ownedDirs.length === 0) {
    throw new Error('[sync-icdn] preflight failed; no owned directories configured')
  }

  const unique = new Set()
  for (const ownedDir of ownedDirs) {
    if (
      typeof ownedDir !== 'string' ||
      !ownedDir ||
      ownedDir === '.' ||
      ownedDir === '..' ||
      path.basename(ownedDir) !== ownedDir
    ) {
      throw new Error(`[sync-icdn] preflight failed; invalid owned directory: ${ownedDir}`)
    }
    if (ownedDir.toLowerCase() === 'og') {
      throw new Error(
        '[sync-icdn] article OG namespace is exclusively owned by publish-og-assets.mjs',
      )
    }
    if (unique.has(ownedDir)) {
      throw new Error(`[sync-icdn] preflight failed; duplicate owned directory: ${ownedDir}`)
    }
    unique.add(ownedDir)
  }
}

function assertBatchSize(batchSize) {
  if (!Number.isFinite(batchSize) || !Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error(
      `[sync-icdn] preflight failed; ICDN_SYNC_BATCH_SIZE must be a finite positive integer, received: ${String(batchSize)}`,
    )
  }
}

export async function buildJobs({
  root = ROOT,
  domPubDir = DOM_PUB_DIR,
  icdnDir = ICDN_DIR,
  directoryGroups = DIRECTORY_GROUPS,
  localMappings = LOCAL_GALLERY_ASSETS,
  legacyMappings = LEGACY_GALLERY_ASSETS,
} = {}) {
  const missingDirectories = []
  for (const group of directoryGroups) {
    const sourceDir = path.join(root, group.sourceDir)
    if (!(await assertDirectory(sourceDir))) missingDirectories.push(sourceDir)
  }
  if (missingDirectories.length > 0) {
    throw new Error(
      `[sync-icdn] preflight failed; missing source directories:\n${missingDirectories
        .map((filePath) => `- ${toPosix(filePath)}`)
        .join('\n')}`,
    )
  }

  const jobs = []
  const emptyDirectories = []

  for (const { sourceDir, targetDir, kind } of directoryGroups) {
    if (kind !== 'webp') {
      throw new Error(`[sync-icdn] preflight failed; unsupported legacy conversion kind: ${kind}`)
    }
    const absoluteSourceDir = path.join(root, sourceDir)
    const sourceFiles = await walk(absoluteSourceDir)
    if (sourceFiles.length === 0) emptyDirectories.push(absoluteSourceDir)

    for (const file of sourceFiles) {
      const relative = path.relative(absoluteSourceDir, file)
      jobs.push({
        kind,
        from: file,
        to: path.join(
          icdnDir,
          targetDir,
          replaceExtension(relative, 'webp'),
        ),
      })
    }
  }
  if (emptyDirectories.length > 0) {
    throw new Error(
      `[sync-icdn] preflight failed; source directories contain no images:\n${emptyDirectories
        .map((filePath) => `- ${toPosix(filePath)}`)
        .join('\n')}`,
    )
  }

  for (const mapping of localMappings) {
    jobs.push({
      kind: 'webp',
      from: path.join(root, mapping.from),
      to: path.join(icdnDir, mapping.to),
    })
  }

  for (const mapping of legacyMappings) {
    jobs.push({
      kind: 'webp',
      from: path.join(domPubDir, mapping.from),
      to: path.join(icdnDir, mapping.to),
    })
  }

  const missingFiles = []
  const destinations = new Set()
  for (const job of jobs) {
    assertTargetInsideIcdn(icdnDir, job.to)
    if (!(await assertFile(job.from))) missingFiles.push(job.from)

    const destination = path.resolve(job.to)
    if (destinations.has(destination)) {
      throw new Error(`[sync-icdn] preflight failed; duplicate target: ${toPosix(job.to)}`)
    }
    destinations.add(destination)
  }
  if (missingFiles.length > 0) {
    throw new Error(
      `[sync-icdn] preflight failed; missing source files:\n${missingFiles
        .map((filePath) => `- ${toPosix(filePath)}`)
        .join('\n')}`,
    )
  }
  if (jobs.length === 0) {
    throw new Error('[sync-icdn] preflight failed; no source assets found')
  }

  return jobs
}

async function runBatches(jobs, batchSize = BATCH_SIZE) {
  let converted = 0

  for (let index = 0; index < jobs.length; index += batchSize) {
    const batch = jobs.slice(index, index + batchSize)
    await Promise.all(
      batch.map(async (job) => {
        await convertToWebp(job.from, job.to)
        converted += 1
      }),
    )

    if (converted % 100 < batchSize || index + batchSize >= jobs.length) {
      console.log(`[sync-icdn] converted ${converted}/${jobs.length}`)
    }
  }

  return { converted }
}

export async function replaceOwnedDirectories({
  stagingIcdnDir,
  icdnDir,
  domPubDir,
  ownedDirs,
  fullReplace = false,
  beforeOperation = async () => {},
}) {
  if (fullReplace !== true) {
    throw new Error('[sync-icdn] destructive replacement requires explicit --full-replace opt-in')
  }
  assertOwnedDirectories(ownedDirs)
  await validateReplacementTargets({
    stagingIcdnDir,
    icdnDir,
    domPubDir,
    ownedDirs,
  })
  const backupRoot = await fs.mkdtemp(path.join(domPubDir, '.icdn-backup-'))
  const backedUp = []
  const installed = []
  let removeBackup = false

  try {
    await fs.mkdir(icdnDir, { recursive: true })

    for (const ownedDir of ownedDirs) {
      const staged = path.join(stagingIcdnDir, ownedDir)
      const target = path.join(icdnDir, ownedDir)
      const backup = path.join(backupRoot, ownedDir)

      if (await exists(target)) {
        await ensureParent(backup)
        await beforeOperation({
          operation: 'backup',
          ownedDir,
          source: target,
          target: backup,
        })
        await fs.rename(target, backup)
        backedUp.push({ target, backup })
      }

      await beforeOperation({
        operation: 'install',
        ownedDir,
        source: staged,
        target,
      })
      await fs.rename(staged, target)
      installed.push(target)
    }
    removeBackup = true
  } catch (error) {
    const rollbackErrors = []

    for (const target of installed.reverse()) {
      try {
        await beforeOperation({ operation: 'rollback-remove', target })
        await fs.rm(target, { recursive: true, force: true })
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }
    for (const { target, backup } of backedUp.reverse()) {
      try {
        await ensureParent(target)
        await beforeOperation({
          operation: 'rollback-restore',
          source: backup,
          target,
        })
        await fs.rename(backup, target)
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }

    if (rollbackErrors.length > 0) {
      const rollbackFailure = new AggregateError(
        [error, ...rollbackErrors],
        `[sync-icdn] replacement failed and rollback was incomplete; backups preserved for manual recovery at: ${backupRoot}`,
      )
      rollbackFailure.recoveryPath = backupRoot
      throw rollbackFailure
    }
    removeBackup = true
    throw error
  } finally {
    // An incomplete rollback needs the backup tree for manual recovery. Only
    // successful publication or a fully successful rollback may remove it.
    if (removeBackup) {
      await fs.rm(backupRoot, { recursive: true, force: true })
    }
  }
}

export async function syncIcdnAssets({
  root = ROOT,
  domPubDir = DOM_PUB_DIR,
  directoryGroups = DIRECTORY_GROUPS,
  localMappings = LOCAL_GALLERY_ASSETS,
  legacyMappings = LEGACY_GALLERY_ASSETS,
  ownedDirs = OWNED_DIRS,
  batchSize = BATCH_SIZE,
  allowTestFixture = false,
  fullReplace = false,
} = {}) {
  if (fullReplace !== true) {
    throw new Error('[sync-icdn] destructive replacement requires explicit --full-replace opt-in')
  }
  if (!(await assertDirectory(domPubDir))) {
    throw new Error(`[sync-icdn] missing dom-pub directory: ${domPubDir}`)
  }
  assertOwnedDirectories(ownedDirs)
  assertBatchSize(batchSize)

  const siteRealPath = await validateGitCheckout({
    directory: root,
    expectedRepository: EXPECTED_SITE_REPOSITORY,
    label: 'source checkout',
    allowTestFixture,
  })

  const { domPubRealPath, icdnRealPath: icdnDir } = await validateDomPubTarget({
    domPubDir,
    ownedDirs,
    allowTestFixture,
  })
  // Preflight is read-only: an absent source must not create, delete, or rename
  // anything in the sibling dom-pub checkout.
  const validatedJobs = await buildJobs({
    root: siteRealPath,
    domPubDir,
    icdnDir,
    directoryGroups,
    localMappings,
    legacyMappings,
  })
  const stagingRoot = await fs.mkdtemp(path.join(domPubRealPath, '.icdn-sync-'))
  const stagingIcdnDir = path.join(stagingRoot, 'icdn')

  try {
    const jobs = validatedJobs.map((job) => ({
      ...job,
      to: path.join(stagingIcdnDir, path.relative(icdnDir, job.to)),
    }))
    await Promise.all(ownedDirs.map((ownedDir) => fs.mkdir(path.join(stagingIcdnDir, ownedDir), { recursive: true })))
    const result = await runBatches(jobs, batchSize)

    // Staging lives beside dom-pub so each directory install uses a same-volume rename.
    await replaceOwnedDirectories({
      stagingIcdnDir,
      icdnDir,
      domPubDir: domPubRealPath,
      ownedDirs,
      fullReplace: true,
    })

    return { ...result, icdnDir }
  } finally {
    await fs.rm(stagingRoot, { recursive: true, force: true })
  }
}

export function parseSyncArgs(argv) {
  let fullReplace = false
  for (const argument of argv) {
    if (argument !== '--full-replace') {
      throw new Error(`[sync-icdn] unknown argument: ${argument}`)
    }
    if (fullReplace) throw new Error('[sync-icdn] duplicate flag: --full-replace')
    fullReplace = true
  }
  if (!fullReplace) {
    throw new Error('[sync-icdn] destructive replacement requires explicit --full-replace opt-in')
  }
  return { fullReplace }
}

async function main() {
  console.warn(DEPRECATION_NOTICE)
  const options = parseSyncArgs(process.argv.slice(2))
  const result = await syncIcdnAssets(options)

  console.log(`[sync-icdn] wrote ${result.converted} asset(s) to ${toPosix(path.relative(ROOT, result.icdnDir))}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[sync-icdn] failed:', error)
    process.exitCode = 1
  })
}
