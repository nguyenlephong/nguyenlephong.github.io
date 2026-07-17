import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { replaceOwnedDirectories, syncIcdnAssets } from '../scripts/sync-icdn-assets.mjs'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

async function withFixture(run) {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-icdn-test-'))
  const root = path.join(fixtureRoot, 'site')
  const domPubDir = path.join(fixtureRoot, 'dom-pub')
  await Promise.all([
    fs.mkdir(root, { recursive: true }),
    fs.mkdir(path.join(domPubDir, 'icdn', 'blogs'), { recursive: true }),
  ])

  try {
    await run({ fixtureRoot, root, domPubDir })
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true })
  }
}

test('icdn sync leaves the target untouched when a source directory is absent', async () => {
  await withFixture(async ({ root, domPubDir }) => {
    const marker = path.join(domPubDir, 'icdn', 'blogs', 'keep.txt')
    await fs.writeFile(marker, 'do not delete', 'utf8')

    await assert.rejects(
      syncIcdnAssets({
        root,
        domPubDir,
        allowTestFixture: true,
        directoryGroups: [{ sourceDir: 'public/assets/blog', targetDir: 'blogs', kind: 'webp' }],
        localMappings: [],
        legacyMappings: [],
        ownedDirs: ['blogs'],
      }),
      /preflight failed; missing source directories/,
    )

    assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
    assert.deepEqual(
      (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-')),
      [],
      'read-only preflight must not leave staging or backup directories',
    )
  })
})

test('icdn sync leaves the target untouched when an explicit source file is absent', async () => {
  await withFixture(async ({ root, domPubDir }) => {
    const marker = path.join(domPubDir, 'icdn', 'blogs', 'keep.txt')
    await fs.writeFile(marker, 'do not delete', 'utf8')

    await assert.rejects(
      syncIcdnAssets({
        root,
        domPubDir,
        allowTestFixture: true,
        directoryGroups: [],
        localMappings: [{ from: 'missing.png', to: 'blogs/missing.webp' }],
        legacyMappings: [],
        ownedDirs: ['blogs'],
      }),
      /preflight failed; missing source files/,
    )

    assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
  })
})

test('icdn sync refuses an empty source directory before staging', async () => {
  await withFixture(async ({ root, domPubDir }) => {
    const marker = path.join(domPubDir, 'icdn', 'blogs', 'keep.txt')
    await Promise.all([
      fs.mkdir(path.join(root, 'public', 'assets', 'blog'), {
        recursive: true,
      }),
      fs.writeFile(marker, 'do not delete', 'utf8'),
    ])

    await assert.rejects(
      syncIcdnAssets({
        root,
        domPubDir,
        allowTestFixture: true,
        directoryGroups: [{ sourceDir: 'public/assets/blog', targetDir: 'blogs', kind: 'webp' }],
        localMappings: [],
        legacyMappings: [],
        ownedDirs: ['blogs'],
      }),
      /preflight failed; source directories contain no images/,
    )

    assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
    assert.deepEqual(
      (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-')),
      [],
    )
  })
})

test('icdn sync rejects invalid batch sizes before staging or source discovery', async (t) => {
  for (const batchSize of [0, -1, Number.NaN]) {
    await t.test(String(batchSize), async () => {
      await withFixture(async ({ root, domPubDir }) => {
        const marker = path.join(domPubDir, 'icdn', 'blogs', 'keep.txt')
        await fs.writeFile(marker, 'do not delete', 'utf8')

        await assert.rejects(
          syncIcdnAssets({
            root,
            domPubDir,
            allowTestFixture: true,
            directoryGroups: [
              {
                sourceDir: 'public/assets/blog',
                targetDir: 'blogs',
                kind: 'webp',
              },
            ],
            localMappings: [],
            legacyMappings: [],
            ownedDirs: ['blogs'],
            batchSize,
          }),
          /ICDN_SYNC_BATCH_SIZE must be a finite positive integer/,
        )

        assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
        assert.deepEqual(
          (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-')),
          [],
          'invalid configuration must fail before creating staging or backup directories',
        )
      })
    })
  }
})

test('icdn sync requires the expected repository identity outside explicit temp fixtures', async () => {
  await withFixture(async ({ root, domPubDir }) => {
    const marker = path.join(domPubDir, 'icdn', 'blogs', 'keep.txt')
    await fs.writeFile(marker, 'do not delete', 'utf8')

    await assert.rejects(
      syncIcdnAssets({
        root,
        domPubDir,
        directoryGroups: [],
        localMappings: [],
        legacyMappings: [],
        ownedDirs: ['blogs'],
      }),
      /must be the nguyenlephong\/dom-pub checkout/,
    )

    assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
    assert.deepEqual(
      (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-')),
      [],
    )
  })
})

test('icdn sync rejects symlinked DOM_PUB_DIR, icdn, and owned roots before staging', async (t) => {
  await t.test('DOM_PUB_DIR alias', async () => {
    await withFixture(async ({ fixtureRoot, root, domPubDir }) => {
      const linkedDomPub = path.join(fixtureRoot, 'dom-pub-link')
      const marker = path.join(domPubDir, 'icdn', 'blogs', 'keep.txt')
      await Promise.all([fs.symlink(domPubDir, linkedDomPub, 'dir'), fs.writeFile(marker, 'do not delete', 'utf8')])

      await assert.rejects(
        syncIcdnAssets({
          root,
          domPubDir: linkedDomPub,
          allowTestFixture: true,
          directoryGroups: [],
          localMappings: [],
          legacyMappings: [],
          ownedDirs: ['blogs'],
        }),
        /DOM_PUB_DIR.*(?:symlink|not a directory)/,
      )
      assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
    })
  })

  await t.test('icdn target', async () => {
    await withFixture(async ({ root, domPubDir }) => {
      const icdnDir = path.join(domPubDir, 'icdn')
      const realIcdnDir = path.join(domPubDir, 'icdn-real')
      const marker = path.join(realIcdnDir, 'blogs', 'keep.txt')
      await fs.rename(icdnDir, realIcdnDir)
      await fs.symlink(realIcdnDir, icdnDir, 'dir')
      await fs.writeFile(marker, 'do not delete', 'utf8')

      await assert.rejects(
        syncIcdnAssets({
          root,
          domPubDir,
          allowTestFixture: true,
          directoryGroups: [],
          localMappings: [],
          legacyMappings: [],
          ownedDirs: ['blogs'],
        }),
        /ICDN target.*(?:symlink|not a directory)/,
      )
      assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
    })
  })

  await t.test('owned target', async () => {
    await withFixture(async ({ fixtureRoot, root, domPubDir }) => {
      const ownedDir = path.join(domPubDir, 'icdn', 'blogs')
      const externalDir = path.join(fixtureRoot, 'external-blogs')
      const marker = path.join(externalDir, 'keep.txt')
      await fs.rm(ownedDir, { recursive: true })
      await fs.mkdir(externalDir, { recursive: true })
      await fs.writeFile(marker, 'do not delete', 'utf8')
      await fs.symlink(externalDir, ownedDir, 'dir')

      await assert.rejects(
        syncIcdnAssets({
          root,
          domPubDir,
          allowTestFixture: true,
          directoryGroups: [],
          localMappings: [],
          legacyMappings: [],
          ownedDirs: ['blogs'],
        }),
        /owned target blogs.*(?:symlink|not a directory)/,
      )
      assert.equal(await fs.readFile(marker, 'utf8'), 'do not delete')
    })
  })
})

test('icdn sync stages a complete replacement and preserves unowned files', async () => {
  await withFixture(async ({ root, domPubDir }) => {
    const sourceDir = path.join(root, 'public', 'assets', 'blog')
    const sourceFile = path.join(sourceDir, 'new-image.png')
    const oldMarker = path.join(domPubDir, 'icdn', 'blogs', 'old.txt')
    const unownedMarker = path.join(domPubDir, 'icdn', 'manual.txt')
    await fs.mkdir(sourceDir, { recursive: true })
    await Promise.all([
      fs.writeFile(sourceFile, ONE_PIXEL_PNG),
      fs.writeFile(oldMarker, 'old', 'utf8'),
      fs.writeFile(unownedMarker, 'preserve', 'utf8'),
    ])

    const result = await syncIcdnAssets({
      root,
      domPubDir,
      allowTestFixture: true,
      directoryGroups: [{ sourceDir: 'public/assets/blog', targetDir: 'blogs', kind: 'webp' }],
      localMappings: [],
      legacyMappings: [],
      ownedDirs: ['blogs'],
      batchSize: 1,
    })

    assert.equal(result.converted, 1)
    assert.equal(await fs.readFile(unownedMarker, 'utf8'), 'preserve')
    await assert.rejects(fs.access(oldMarker))
    const output = path.join(domPubDir, 'icdn', 'blogs', 'new-image.webp')
    assert.ok((await fs.stat(output)).size > 0)
    assert.deepEqual(
      (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-')),
      [],
    )
  })
})

test('owned-directory replacement restores every original after a partial swap failure', async () => {
  await withFixture(async ({ domPubDir }) => {
    const icdnDir = path.join(domPubDir, 'icdn')
    const stagingIcdnDir = path.join(domPubDir, '.test-stage', 'icdn')
    const oldBlog = path.join(icdnDir, 'blogs', 'old-blog.txt')
    const oldNote = path.join(icdnDir, 'notes', 'old-note.txt')
    const stagedBlog = path.join(stagingIcdnDir, 'blogs', 'new-blog.txt')
    const stagedNote = path.join(stagingIcdnDir, 'notes', 'new-note.txt')

    await Promise.all([
      fs.mkdir(path.dirname(oldNote), { recursive: true }),
      fs.mkdir(path.dirname(stagedBlog), { recursive: true }),
      fs.mkdir(path.dirname(stagedNote), { recursive: true }),
    ])
    await Promise.all([
      fs.writeFile(oldBlog, 'old blog', 'utf8'),
      fs.writeFile(oldNote, 'old note', 'utf8'),
      fs.writeFile(stagedBlog, 'new blog', 'utf8'),
      fs.writeFile(stagedNote, 'new note', 'utf8'),
    ])

    await assert.rejects(
      replaceOwnedDirectories({
        stagingIcdnDir,
        icdnDir,
        domPubDir,
        ownedDirs: ['blogs', 'notes'],
        beforeOperation: async ({ operation, ownedDir }) => {
          if (operation === 'install' && ownedDir === 'notes') {
            throw new Error('fault injection: publish failed')
          }
        },
      }),
      /fault injection: publish failed/,
    )

    assert.equal(await fs.readFile(oldBlog, 'utf8'), 'old blog')
    assert.equal(await fs.readFile(oldNote, 'utf8'), 'old note')
    await assert.rejects(fs.access(path.join(icdnDir, 'blogs', 'new-blog.txt')))
    assert.deepEqual(
      (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-backup-')),
      [],
    )
  })
})

test('owned-directory replacement preserves the backup and reports its path after incomplete rollback', async () => {
  await withFixture(async ({ domPubDir }) => {
    const icdnDir = path.join(domPubDir, 'icdn')
    const stagingIcdnDir = path.join(domPubDir, '.test-stage', 'icdn')
    const oldBlog = path.join(icdnDir, 'blogs', 'old-blog.txt')
    const oldNote = path.join(icdnDir, 'notes', 'old-note.txt')
    const stagedBlog = path.join(stagingIcdnDir, 'blogs', 'new-blog.txt')
    const stagedNote = path.join(stagingIcdnDir, 'notes', 'new-note.txt')

    await Promise.all([
      fs.mkdir(path.dirname(oldNote), { recursive: true }),
      fs.mkdir(path.dirname(stagedBlog), { recursive: true }),
      fs.mkdir(path.dirname(stagedNote), { recursive: true }),
    ])
    await Promise.all([
      fs.writeFile(oldBlog, 'old blog', 'utf8'),
      fs.writeFile(oldNote, 'old note', 'utf8'),
      fs.writeFile(stagedBlog, 'new blog', 'utf8'),
      fs.writeFile(stagedNote, 'new note', 'utf8'),
    ])

    let failure
    try {
      await replaceOwnedDirectories({
        stagingIcdnDir,
        icdnDir,
        domPubDir,
        ownedDirs: ['blogs', 'notes'],
        beforeOperation: async ({ operation, ownedDir, target }) => {
          if (operation === 'install' && ownedDir === 'notes') {
            throw new Error('fault injection: publish failed')
          }
          if (operation === 'rollback-restore' && target === path.join(icdnDir, 'blogs')) {
            throw new Error('fault injection: rollback failed')
          }
        },
      })
    } catch (error) {
      failure = error
    }

    assert.ok(failure instanceof AggregateError)
    assert.match(failure.message, /rollback was incomplete/)
    assert.equal(typeof failure.recoveryPath, 'string')
    assert.match(failure.message, new RegExp(failure.recoveryPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.equal(
      await fs.readFile(path.join(failure.recoveryPath, 'blogs', 'old-blog.txt'), 'utf8'),
      'old blog',
      'the failed rollback backup must remain available for manual recovery',
    )
    assert.equal(await fs.readFile(oldNote, 'utf8'), 'old note')
    await assert.rejects(fs.access(oldBlog))
    assert.deepEqual(
      (await fs.readdir(domPubDir)).filter((entry) => entry.startsWith('.icdn-backup-')),
      [path.basename(failure.recoveryPath)],
    )
  })
})
