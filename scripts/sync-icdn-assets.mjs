#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const DOM_PUB_DIR = path.resolve(process.env.DOM_PUB_DIR ?? path.join(ROOT, '..', 'dom-pub'))
const ICDN_DIR = path.join(DOM_PUB_DIR, 'icdn')
const WEBP_QUALITY = Number(process.env.ICDN_WEBP_QUALITY ?? 82)
const OG_JPEG_QUALITY = Number(process.env.ICDN_OG_JPEG_QUALITY ?? 86)
const BATCH_SIZE = Number(process.env.ICDN_SYNC_BATCH_SIZE ?? 8)

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

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
  await sharp(from)
    .rotate()
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(to)
}

async function convertToOgJpeg(from, to) {
  await ensureParent(to)
  await sharp(from)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: OG_JPEG_QUALITY, mozjpeg: true })
    .toFile(to)
}

async function removeOwnedDirs() {
  for (const dir of ['blogs', 'notes', 'gallery', 'og']) {
    await fs.rm(path.join(ICDN_DIR, dir), { recursive: true, force: true })
  }
}

async function buildJobs() {
  const jobs = []

  for (const [sourceDir, targetDir] of [
    ['public/assets/blog', 'blogs'],
    ['public/assets/notes', 'notes'],
    ['public/assets/photos', 'gallery/photos'],
  ]) {
    const absoluteSourceDir = path.join(ROOT, sourceDir)
    for (const file of await walk(absoluteSourceDir)) {
      const relative = path.relative(absoluteSourceDir, file)
      jobs.push({
        kind: 'webp',
        from: file,
        to: path.join(ICDN_DIR, targetDir, replaceExtension(relative, 'webp')),
      })
    }
  }

  for (const [sourceDir, targetDir] of [
    ['public/og/blog', 'og/blogs'],
    ['public/og/notes', 'og/notes'],
  ]) {
    const absoluteSourceDir = path.join(ROOT, sourceDir)
    for (const file of await walk(absoluteSourceDir)) {
      const relative = path.relative(absoluteSourceDir, file)
      jobs.push({
        kind: 'og',
        from: file,
        to: path.join(ICDN_DIR, targetDir, replaceExtension(relative, 'jpg')),
      })
    }
  }

  for (const mapping of LOCAL_GALLERY_ASSETS) {
    jobs.push({
      kind: 'webp',
      from: path.join(ROOT, mapping.from),
      to: path.join(ICDN_DIR, mapping.to),
    })
  }

  for (const mapping of LEGACY_GALLERY_ASSETS) {
    jobs.push({
      kind: 'webp',
      from: path.join(DOM_PUB_DIR, mapping.from),
      to: path.join(ICDN_DIR, mapping.to),
    })
  }

  return jobs
}

async function runBatches(jobs) {
  let converted = 0
  let skipped = 0

  for (let index = 0; index < jobs.length; index += BATCH_SIZE) {
    const batch = jobs.slice(index, index + BATCH_SIZE)
    await Promise.all(
      batch.map(async (job) => {
        if (!(await exists(job.from))) {
          skipped += 1
          console.warn(`[sync-icdn] missing ${toPosix(path.relative(ROOT, job.from))}`)
          return
        }

        if (job.kind === 'og') {
          await convertToOgJpeg(job.from, job.to)
        } else {
          await convertToWebp(job.from, job.to)
        }
        converted += 1
      }),
    )

    if (converted % 100 < BATCH_SIZE || index + BATCH_SIZE >= jobs.length) {
      console.log(`[sync-icdn] converted ${converted}/${jobs.length}`)
    }
  }

  return { converted, skipped }
}

async function main() {
  if (!(await exists(DOM_PUB_DIR))) {
    console.error(`[sync-icdn] missing dom-pub directory: ${DOM_PUB_DIR}`)
    process.exit(1)
  }

  await removeOwnedDirs()
  const jobs = await buildJobs()
  const result = await runBatches(jobs)
  console.log(
    `[sync-icdn] wrote ${result.converted} asset(s) to ${toPosix(
      path.relative(ROOT, ICDN_DIR),
    )}${result.skipped ? `, skipped ${result.skipped}` : ''}`,
  )
}

main().catch((error) => {
  console.error('[sync-icdn] failed:', error)
  process.exit(1)
})
