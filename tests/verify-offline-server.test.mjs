import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { resolveFile, routeCandidates } from '../scripts/verify-offline.mjs'

test('offline verifier resolves only files contained by the real output directory', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'offline-server-test-'))
  const outDir = path.join(fixtureRoot, 'out')
  const outsideFile = path.join(fixtureRoot, 'package.json')
  const indexFile = path.join(outDir, 'en', 'index.html')

  try {
    await fs.mkdir(path.dirname(indexFile), { recursive: true })
    await Promise.all([
      fs.writeFile(indexFile, '<title>safe</title>', 'utf8'),
      fs.writeFile(outsideFile, '{"private":true}', 'utf8'),
    ])

    assert.equal(await resolveFile('/en', outDir), await fs.realpath(indexFile))
    assert.equal(await resolveFile('/%2e%2e/package.json', outDir), null)
    assert.equal(await resolveFile('/%2e%2e%2fpackage.json', outDir), null)
    assert.deepEqual(routeCandidates('/%E0%A4%A'), [])
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true })
  }
})

test('offline verifier rejects an in-tree symlink that resolves outside output', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'offline-server-link-test-'))
  const outDir = path.join(fixtureRoot, 'out')
  const outsideFile = path.join(fixtureRoot, 'outside.txt')
  const linkedFile = path.join(outDir, 'linked.txt')

  try {
    await fs.mkdir(outDir, { recursive: true })
    await fs.writeFile(outsideFile, 'private', 'utf8')
    await fs.symlink(outsideFile, linkedFile, 'file')

    assert.equal(await resolveFile('/linked.txt', outDir), null)
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true })
  }
})
