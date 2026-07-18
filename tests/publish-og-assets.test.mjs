import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import test from 'node:test'

import sharp from 'sharp'

import {
  getPublicationLockPath,
  githubRepositoryFromRemote,
  parsePublisherArgs,
  publishOgAssets,
} from '../scripts/publish-og-assets.mjs'
import { renderOgJpeg, validateOgImage } from '../scripts/lib/og-image-conversion.mjs'

const execFileAsync = promisify(execFile)

async function git(cwd, args) {
  return execFileAsync('git', ['-C', cwd, ...args], { encoding: 'utf8' })
}

async function commitAll(cwd, message = 'test fixture') {
  await git(cwd, ['add', '-A'])
  await git(cwd, ['commit', '-m', message, '--quiet'])
}

async function initializeRepository(directory, origin) {
  await git(directory, ['init', '--quiet'])
  await git(directory, ['config', 'user.name', 'OG Publisher Test'])
  await git(directory, ['config', 'user.email', 'og-publisher@example.test'])
  await git(directory, ['remote', 'add', 'origin', origin])
}

async function createFixture(t, { blogCount = 2, notesCount = 1, existingBlogSlugs = [] } = {}) {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'publish-og-assets-'))
  const siteDir = path.join(fixtureRoot, 'site')
  const domPubDir = path.join(fixtureRoot, 'dom-pub')
  await Promise.all([
    fs.mkdir(path.join(siteDir, 'config'), { recursive: true }),
    fs.mkdir(path.join(siteDir, 'public/blog-data'), { recursive: true }),
    fs.mkdir(path.join(siteDir, 'public/notes-data'), { recursive: true }),
    fs.mkdir(path.join(siteDir, 'public/og/blog'), { recursive: true }),
    fs.mkdir(path.join(siteDir, 'public/og/notes'), { recursive: true }),
    fs.mkdir(path.join(domPubDir, 'icdn/og/blogs'), { recursive: true }),
    fs.mkdir(path.join(domPubDir, 'icdn/og/notes'), { recursive: true }),
  ])

  const contract = {
    schemaVersion: 1,
    remoteTreeUrl: 'https://api.github.com/repos/nguyenlephong/dom-pub/git/trees/main?recursive=1',
    liveBaseUrl: 'https://nguyenlephong.github.io/dom-pub/icdn',
    articleOg: {
      blog: {
        sourceIndex: 'public/blog-data/_index.json',
        sourceDirectory: 'public/og/blog',
        sourceExtension: '.png',
        publicPathPrefix: '/og/blogs',
        publicationDirectory: 'og/blogs',
        publicationExtension: '.jpg',
        publicationFormat: 'jpeg',
      },
      notes: {
        sourceIndex: 'public/notes-data/_index.json',
        sourceDirectory: 'public/og/notes',
        sourceExtension: '.png',
        publicPathPrefix: '/og/notes',
        publicationDirectory: 'og/notes',
        publicationExtension: '.jpg',
        publicationFormat: 'jpeg',
      },
    },
  }
  const blogSlugs = Array.from({ length: blogCount }, (_, index) => `blog-post-${index + 1}`)
  const noteSlugs = Array.from({ length: notesCount }, (_, index) => `note-post-${index + 1}`)
  const png = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 10, g: 30, b: 60, alpha: 0.8 },
    },
  }).png().toBuffer()
  const jpeg = await renderOgJpeg(png)

  await Promise.all([
    fs.writeFile(path.join(siteDir, 'config/media-publication.json'), JSON.stringify(contract)),
    fs.writeFile(
      path.join(siteDir, 'public/blog-data/_index.json'),
      JSON.stringify({ posts: blogSlugs.map((slug) => ({ slug })) }),
    ),
    fs.writeFile(
      path.join(siteDir, 'public/notes-data/_index.json'),
      JSON.stringify({ posts: noteSlugs.map((slug) => ({ slug })) }),
    ),
    fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/.gitkeep'), ''),
    fs.writeFile(path.join(domPubDir, 'icdn/og/notes/.gitkeep'), ''),
    ...blogSlugs.map((slug) => fs.writeFile(path.join(siteDir, `public/og/blog/${slug}.png`), png)),
    ...noteSlugs.map((slug) => fs.writeFile(path.join(siteDir, `public/og/notes/${slug}.png`), png)),
    ...existingBlogSlugs.map((slug) =>
      fs.writeFile(path.join(domPubDir, `icdn/og/blogs/${slug}.jpg`), jpeg),
    ),
  ])

  await Promise.all([
    initializeRepository(siteDir, 'git@github.com:nguyenlephong/nguyenlephong.github.io.git'),
    initializeRepository(domPubDir, 'https://github.com/nguyenlephong/dom-pub.git'),
  ])
  await Promise.all([commitAll(siteDir), commitAll(domPubDir)])
  t.after(() => fs.rm(fixtureRoot, { recursive: true, force: true }))

  return { blogSlugs, contract, domPubDir, fixtureRoot, jpeg, noteSlugs, png, siteDir }
}

async function stagingEntries(domPubDir) {
  return (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.og-publish-stage-'))
}

async function assertMissing(filePath) {
  await assert.rejects(fs.access(filePath), { code: 'ENOENT' })
}

async function coloredJpeg({ r, g, b }) {
  return sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r, g, b },
    },
  }).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
}

async function publicationLockArtifacts(domPubDir) {
  const lockPath = await getPublicationLockPath(domPubDir)
  return (await fs.readdir(path.dirname(lockPath))).filter((entry) =>
    entry.startsWith(path.basename(lockPath)),
  )
}

test('parses only exact GitHub HTTPS, SSH URL, and scp-style origins', () => {
  for (const remote of [
    'https://github.com/nguyenlephong/dom-pub.git',
    'ssh://git@github.com/nguyenlephong/dom-pub.git',
    'git@github.com:nguyenlephong/dom-pub.git',
  ]) {
    assert.equal(githubRepositoryFromRemote(remote), 'nguyenlephong/dom-pub')
  }

  for (const remote of [
    'https://evilgithub.com/nguyenlephong/dom-pub.git',
    'https://github.com.evil.example/nguyenlephong/dom-pub.git',
    'ssh://git@evilgithub.com/nguyenlephong/dom-pub.git',
    'git@evilgithub.com:nguyenlephong/dom-pub.git',
    'http://github.com/nguyenlephong/dom-pub.git',
    'https://github.com/nguyenlephong/dom-pub/extra.git',
    'https://github.com/nguyenlephong/dom-pub.git?mirror=evil',
  ]) {
    assert.equal(githubRepositoryFromRemote(remote), null)
  }
})

test('publishes a 65-asset blog-only addition without touching notes or deleting files', async (t) => {
  const { blogSlugs, domPubDir, siteDir } = await createFixture(t, { blogCount: 65 })
  const notesMarker = path.join(domPubDir, 'icdn/og/notes/.gitkeep')
  const notesBefore = await fs.readFile(notesMarker)

  const summary = await publishOgAssets({
    rootDir: siteDir,
    domPubDir,
    surface: 'blog',
    missingOnly: true,
  })

  assert.deepEqual(summary, {
    surface: 'blog',
    mode: 'published',
    expected: 65,
    added: 65,
    changed: 0,
    unchanged: 0,
    skipped: 0,
    deleted: 0,
  })
  assert.deepEqual(await fs.readFile(notesMarker), notesBefore)
  assert.deepEqual(await stagingEntries(domPubDir), [])
  await assertMissing(await getPublicationLockPath(domPubDir))
  assert.deepEqual(await publicationLockArtifacts(domPubDir), [])
  for (const slug of blogSlugs) {
    await validateOgImage(path.join(domPubDir, `icdn/og/blogs/${slug}.jpg`), {
      format: 'jpeg',
      label: slug,
    })
  }
})

test('missing-only skips existing valid files and never overwrites them', async (t) => {
  const { blogSlugs, domPubDir, jpeg, siteDir } = await createFixture(t, {
    blogCount: 2,
    existingBlogSlugs: ['blog-post-1'],
  })
  const existingPath = path.join(domPubDir, 'icdn/og/blogs/blog-post-1.jpg')
  const before = await fs.readFile(existingPath)

  const summary = await publishOgAssets({
    rootDir: siteDir,
    domPubDir,
    surface: 'blog',
    missingOnly: true,
  })

  assert.equal(summary.added, 1)
  assert.equal(summary.skipped, 1)
  assert.equal(summary.changed, 0)
  assert.equal(summary.deleted, 0)
  assert.deepEqual(await fs.readFile(existingPath), before)
  assert.deepEqual(before, jpeg)
  assert.ok(await fs.stat(path.join(domPubDir, `icdn/og/blogs/${blogSlugs[1]}.jpg`)))
})

test('missing-only refuses a destination created after preflight instead of overwriting it', async (t) => {
  const { domPubDir, jpeg, siteDir } = await createFixture(t, { blogCount: 1 })
  const destination = path.join(domPubDir, 'icdn/og/blogs/blog-post-1.jpg')

  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      missingOnly: true,
      beforeOperation: async ({ operation }) => {
        if (operation === 'install') await fs.writeFile(destination, jpeg)
      },
    }),
    /destination changed after preflight; refusing overwrite/,
  )

  assert.deepEqual(await fs.readFile(destination), jpeg)
  assert.deepEqual(await stagingEntries(domPubDir), [])
})

test('dry-run reports exact changes without writing to dom-pub', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, { blogCount: 3 })

  const summary = await publishOgAssets({
    rootDir: siteDir,
    domPubDir,
    surface: 'blog',
    missingOnly: true,
    dryRun: true,
  })

  assert.equal(summary.added, 3)
  assert.equal(summary.deleted, 0)
  assert.deepEqual(await stagingEntries(domPubDir), [])
  assert.deepEqual(
    (await fs.readdir(path.join(domPubDir, 'icdn/og/blogs'))).sort(),
    ['.gitkeep'],
  )
  assert.equal((await git(domPubDir, ['status', '--porcelain=v1'])).stdout, '')
})

test('a partial install failure rolls additions back and removes staging', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, { blogCount: 2 })
  let installs = 0

  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      beforeOperation: async ({ operation }) => {
        if (operation !== 'install') return
        installs += 1
        if (installs === 2) throw new Error('fault injection: second install failed')
      },
    }),
    /fault injection: second install failed/,
  )

  assert.deepEqual(
    (await fs.readdir(path.join(domPubDir, 'icdn/og/blogs'))).sort(),
    ['.gitkeep'],
  )
  assert.deepEqual(await stagingEntries(domPubDir), [])
  assert.equal((await git(domPubDir, ['status', '--porcelain=v1'])).stdout, '')
})

test('a partial replacement failure restores changed files byte-for-byte', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, {
    blogCount: 2,
    existingBlogSlugs: ['blog-post-1', 'blog-post-2'],
  })
  const replacementFixture = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 180, g: 20, b: 30 },
    },
  }).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
  const destinations = [
    path.join(domPubDir, 'icdn/og/blogs/blog-post-1.jpg'),
    path.join(domPubDir, 'icdn/og/blogs/blog-post-2.jpg'),
  ]
  await Promise.all(destinations.map((destination) => fs.writeFile(destination, replacementFixture)))
  await commitAll(domPubDir, 'different valid publications')
  const before = await Promise.all(destinations.map((destination) => fs.readFile(destination)))
  let installs = 0

  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      beforeOperation: async ({ operation }) => {
        if (operation !== 'install') return
        installs += 1
        if (installs === 2) throw new Error('fault injection: replacement failed')
      },
    }),
    /fault injection: replacement failed/,
  )

  assert.deepEqual(await fs.readFile(destinations[0]), before[0])
  assert.deepEqual(await fs.readFile(destinations[1]), before[1])
  assert.deepEqual(await stagingEntries(domPubDir), [])
  assert.equal((await git(domPubDir, ['status', '--porcelain=v1'])).stdout, '')
})

test('an exclusive checkout lock rejects a second concurrent publisher', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
  let releaseFirst
  let markEntered
  const gate = new Promise((resolve) => {
    releaseFirst = resolve
  })
  const entered = new Promise((resolve) => {
    markEntered = resolve
  })

  const first = publishOgAssets({
    rootDir: siteDir,
    domPubDir,
    surface: 'blog',
    beforeOperation: async ({ operation }) => {
      if (operation !== 'install') return
      markEntered()
      await gate
    },
  })
  await Promise.race([
    entered,
    first.then(() => {
      throw new Error('first publisher finished before reaching the lock contention gate')
    }),
  ])

  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      dryRun: true,
      recoverStaleLock: true,
    }),
    /publication lock is active.*wait for that publisher to finish/,
  )

  releaseFirst()
  const summary = await first
  assert.equal(summary.added, 1)
  await assertMissing(await getPublicationLockPath(domPubDir))
  assert.deepEqual(await stagingEntries(domPubDir), [])
})

test('stale lock recovery is explicit, local-only, and age-gated', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
  const lockPath = await getPublicationLockPath(domPubDir)
  const now = Date.parse('2026-07-18T04:00:00.000Z')
  const staleOwner = {
    schemaVersion: 1,
    token: 'stale-owner-token',
    pid: 424242,
    hostname: 'fixture-host',
    startedAt: new Date(now - 60_000).toISOString(),
    surface: 'blog',
    siteRoot: siteDir,
  }
  await fs.writeFile(lockPath, `${JSON.stringify(staleOwner)}\n`)
  const lockOptions = {
    hostname: 'fixture-host',
    now: () => now,
    staleAfterMs: 1_000,
    isProcessAlive: async () => false,
  }

  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      dryRun: true,
      lockOptions,
    }),
    /stale publication lock.*rerun with --recover-stale-lock/,
  )
  assert.equal(JSON.parse(await fs.readFile(lockPath, 'utf8')).token, staleOwner.token)

  const summary = await publishOgAssets({
    rootDir: siteDir,
    domPubDir,
    surface: 'blog',
    dryRun: true,
    recoverStaleLock: true,
    lockOptions,
  })
  assert.equal(summary.added, 1)
  await assertMissing(lockPath)

  const recentOwner = {
    ...staleOwner,
    token: 'recent-owner-token',
    startedAt: new Date(now - 500).toISOString(),
  }
  await fs.writeFile(lockPath, `${JSON.stringify(recentOwner)}\n`)
  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      dryRun: true,
      recoverStaleLock: true,
      lockOptions,
    }),
    /owner is not running but the lock is only 0s old.*wait until 1s/,
  )
  assert.equal(JSON.parse(await fs.readFile(lockPath, 'utf8')).token, recentOwner.token)
  await fs.unlink(lockPath)

  const foreignOwner = { ...staleOwner, token: 'foreign-owner-token', hostname: 'other-host' }
  await fs.writeFile(lockPath, `${JSON.stringify(foreignOwner)}\n`)
  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      dryRun: true,
      recoverStaleLock: true,
      lockOptions,
    }),
    /belongs to another host.*recover it manually only after verifying that host/,
  )
  assert.equal(JSON.parse(await fs.readFile(lockPath, 'utf8')).token, foreignOwner.token)
  await fs.unlink(lockPath)

  await fs.writeFile(lockPath, '{incomplete')
  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      dryRun: true,
      recoverStaleLock: true,
      lockOptions,
    }),
    /lock metadata is invalid.*remove it manually only after proving no publisher is running/,
  )
  assert.equal(await fs.readFile(lockPath, 'utf8'), '{incomplete')
})

test('rollback preserves a foreign destination change and the original backup', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, {
    blogCount: 2,
    existingBlogSlugs: ['blog-post-1', 'blog-post-2'],
  })
  const original = await coloredJpeg({ r: 180, g: 20, b: 30 })
  const foreign = await coloredJpeg({ r: 20, g: 180, b: 30 })
  const firstDestination = path.join(domPubDir, 'icdn/og/blogs/blog-post-1.jpg')
  const secondDestination = path.join(domPubDir, 'icdn/og/blogs/blog-post-2.jpg')
  await Promise.all([
    fs.writeFile(firstDestination, original),
    fs.writeFile(secondDestination, original),
  ])
  await commitAll(domPubDir, 'seed original publications')
  const lockPath = await getPublicationLockPath(domPubDir)
  let installs = 0
  let failure

  try {
    await publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      beforeOperation: async ({ operation }) => {
        if (operation !== 'install') return
        installs += 1
        if (installs === 2) {
          await fs.writeFile(firstDestination, foreign)
          throw new Error('fault injection: fail after foreign change')
        }
      },
    })
  } catch (error) {
    failure = error
  }

  assert.ok(failure instanceof AggregateError)
  assert.equal(typeof failure.recoveryPath, 'string')
  assert.ok(
    failure.errors.some((error) => /destination changed after install; refusing rollback/.test(error.message)),
  )
  assert.deepEqual(await fs.readFile(firstDestination), foreign)
  assert.deepEqual(await fs.readFile(secondDestination), original)
  assert.deepEqual(
    await fs.readFile(path.join(failure.recoveryPath, 'backup/blog-post-1.jpg')),
    original,
  )
  assert.ok((await stagingEntries(domPubDir)).includes(path.basename(failure.recoveryPath)))
  await assertMissing(lockPath)
})

test('staging cleanup failure keeps published data and releases the checkout lock', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
  const destination = path.join(domPubDir, 'icdn/og/blogs/blog-post-1.jpg')
  const lockPath = await getPublicationLockPath(domPubDir)
  let failure

  try {
    await publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      removeStagingImpl: async () => {
        throw new Error('fault injection: cleanup failed')
      },
    })
  } catch (error) {
    failure = error
  }

  assert.match(failure?.message ?? '', /staging cleanup failed/)
  assert.equal(typeof failure.recoveryPath, 'string')
  await validateOgImage(destination, { format: 'jpeg', label: 'published after cleanup failure' })
  assert.ok((await stagingEntries(domPubDir)).includes(path.basename(failure.recoveryPath)))
  await assertMissing(lockPath)
})

test('lock cleanup never deletes a foreign replacement lock', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
  const lockPath = await getPublicationLockPath(domPubDir)
  const foreignOwner = {
    schemaVersion: 1,
    token: 'foreign-release-owner',
    pid: process.pid,
    hostname: os.hostname(),
    startedAt: new Date().toISOString(),
    surface: 'notes',
    siteRoot: '/foreign',
  }

  await assert.rejects(
    publishOgAssets({
      rootDir: siteDir,
      domPubDir,
      surface: 'blog',
      dryRun: true,
      beforeLockRelease: async () => {
        await fs.writeFile(lockPath, `${JSON.stringify(foreignOwner)}\n`)
      },
    }),
    /lock ownership changed before release; foreign lock was preserved/,
  )

  assert.equal(JSON.parse(await fs.readFile(lockPath, 'utf8')).token, foreignOwner.token)
  assert.deepEqual(await stagingEntries(domPubDir), [])
})

test('rejects traversal and symlinked publication roots before staging', async (t) => {
  await t.test('contract traversal', async (t) => {
    const { contract, domPubDir, siteDir } = await createFixture(t)
    contract.articleOg.blog.publicationDirectory = '../escape'
    await fs.writeFile(path.join(siteDir, 'config/media-publication.json'), JSON.stringify(contract))
    await commitAll(siteDir, 'malicious contract')

    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /must be a safe repository-relative path/,
    )
    assert.deepEqual(await stagingEntries(domPubDir), [])
  })

  await t.test('symlinked destination', async (t) => {
    const { domPubDir, fixtureRoot, siteDir } = await createFixture(t)
    const publicationRoot = path.join(domPubDir, 'icdn/og/blogs')
    const externalRoot = path.join(fixtureRoot, 'external-blog-output')
    await fs.rm(publicationRoot, { recursive: true })
    await fs.mkdir(externalRoot)
    await fs.symlink(externalRoot, publicationRoot, 'dir')
    await commitAll(domPubDir, 'symlink destination')

    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /blog publication directory must not contain symlinks/,
    )
    assert.deepEqual(await fs.readdir(externalRoot), [])
    assert.deepEqual(await stagingEntries(domPubDir), [])
  })

  await t.test('symlinked namespace component', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t)
    const ogRoot = path.join(domPubDir, 'icdn/og')
    const aliasRoot = path.join(domPubDir, 'icdn/og-alias')
    await fs.rename(ogRoot, aliasRoot)
    await fs.symlink('og-alias', ogRoot, 'dir')
    await commitAll(domPubDir, 'symlink namespace')

    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /blog publication directory must not contain symlinks/,
    )
    assert.deepEqual(await stagingEntries(domPubDir), [])
  })
})

test('rejects wrong origins, nested roots, and dirty source or destination repositories', async (t) => {
  await t.test('wrong dom-pub origin', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t)
    await git(domPubDir, ['remote', 'set-url', 'origin', 'git@github.com:someone/else.git'])
    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /expected origin nguyenlephong\/dom-pub/,
    )
  })

  await t.test('lookalike GitHub hostname', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t)
    await git(domPubDir, [
      'remote',
      'set-url',
      'origin',
      'https://evilgithub.com/nguyenlephong/dom-pub.git',
    ])
    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /expected origin nguyenlephong\/dom-pub, received unknown/,
    )
  })

  await t.test('nested checkout path', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t)
    await assert.rejects(
      publishOgAssets({
        rootDir: siteDir,
        domPubDir: path.join(domPubDir, 'icdn'),
        surface: 'blog',
        dryRun: true,
      }),
      /dom-pub checkout is not the repository root/,
    )
  })

  await t.test('dirty dom-pub', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t)
    await fs.writeFile(path.join(domPubDir, 'dirty.txt'), 'uncommitted')
    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /dom-pub checkout must be clean/,
    )
    assert.deepEqual(await stagingEntries(domPubDir), [])
  })

  await t.test('dirty source checkout', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t)
    await fs.writeFile(path.join(siteDir, 'dirty.txt'), 'uncommitted')
    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /site checkout must be clean/,
    )
    assert.deepEqual(await stagingEntries(domPubDir), [])
  })
})

test('fails closed for invalid PNG sources, existing JPEGs, and converter output', async (t) => {
  await t.test('invalid PNG source', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
    await fs.writeFile(path.join(siteDir, 'public/og/blog/blog-post-1.png'), 'not png')
    await commitAll(siteDir, 'invalid source')
    await assert.rejects(
      publishOgAssets({ rootDir: siteDir, domPubDir, surface: 'blog', dryRun: true }),
      /does not have a valid PNG signature/,
    )
  })

  await t.test('invalid existing JPEG', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
    await fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/blog-post-1.jpg'), 'not jpeg')
    await commitAll(domPubDir, 'invalid destination')
    await assert.rejects(
      publishOgAssets({
        rootDir: siteDir,
        domPubDir,
        surface: 'blog',
        missingOnly: true,
        dryRun: true,
      }),
      /does not have a valid JPEG signature/,
    )
  })

  await t.test('invalid converter output', async (t) => {
    const { domPubDir, siteDir } = await createFixture(t, { blogCount: 1 })
    await assert.rejects(
      publishOgAssets({
        rootDir: siteDir,
        domPubDir,
        surface: 'blog',
        dryRun: true,
        renderImpl: async () => Buffer.from('not jpeg'),
      }),
      /does not have a valid JPEG signature/,
    )
    assert.deepEqual(await stagingEntries(domPubDir), [])
  })
})

test('CLI parser requires scoped arguments and rejects unknown or duplicate flags', () => {
  assert.deepEqual(
    parsePublisherArgs([
      '--surface',
      'blog',
      '--dom-pub',
      '../dom-pub',
      '--missing-only',
      '--dry-run',
      '--recover-stale-lock',
    ]),
    {
      surface: 'blog',
      domPubDir: '../dom-pub',
      missingOnly: true,
      dryRun: true,
      recoverStaleLock: true,
    },
  )
  assert.throws(() => parsePublisherArgs(['--wat']), /unknown argument/)
  assert.throws(
    () => parsePublisherArgs(['--surface', 'blog', '--surface', 'notes', '--dom-pub', 'x']),
    /duplicate flag/,
  )
  assert.throws(() => parsePublisherArgs(['--surface', 'gallery', '--dom-pub', 'x']), /blog, notes/)
  assert.throws(() => parsePublisherArgs(['--surface', 'blog']), /--dom-pub is required/)
})
