import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { normalizeStaticOgArtifacts } from '../scripts/postbuild-og.mjs'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

async function createFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'postbuild-og-'))
  const outDir = path.join(root, 'out')
  await fs.mkdir(path.join(outDir, 'en', 'blog'), { recursive: true })
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  return outDir
}

test('normalizes hashed Next 16 OG artifacts and preserves metadata query strings', async (t) => {
  const outDir = await createFixture(t)
  const openGraphArtifact = path.join(outDir, 'en/blog/opengraph-image-sqz7no')
  const twitterArtifact = path.join(outDir, 'en/blog/twitter-image-a1b2c3.body')
  const htmlPath = path.join(outDir, 'en/blog.html')

  await Promise.all([
    fs.writeFile(openGraphArtifact, ONE_PIXEL_PNG),
    fs.writeFile(twitterArtifact, ONE_PIXEL_PNG),
    fs.writeFile(
      htmlPath,
      [
        '<meta property="og:image" content="https://example.com/en/blog/opengraph-image-sqz7no?abc123">',
        '<meta name="twitter:image" content="/en/blog/twitter-image-a1b2c3?def456">',
        '<script>self.__next_f.push([\\"/en/blog/opengraph-image-sqz7no?abc123\\",\\"/en/blog/twitter-image-a1b2c3\\"])</script>',
      ].join(''),
      'utf8',
    ),
  ])

  const result = await normalizeStaticOgArtifacts({ outDir })

  assert.equal(result.skipped, false)
  assert.equal(result.renamed.length, 2)
  assert.equal(result.updatedHtml, 1)
  assert.equal(result.updatedText, 0)
  await assert.rejects(fs.access(openGraphArtifact))
  await assert.rejects(fs.access(twitterArtifact))
  assert.deepEqual(await fs.readFile(`${openGraphArtifact}.png`), ONE_PIXEL_PNG)
  assert.deepEqual(
    await fs.readFile(path.join(outDir, 'en/blog/twitter-image-a1b2c3.png')),
    ONE_PIXEL_PNG,
  )

  const html = await fs.readFile(htmlPath, 'utf8')
  assert.match(html, /opengraph-image-sqz7no\.png\?abc123/)
  assert.match(html, /twitter-image-a1b2c3\.png\?def456/)
  assert.equal(html.match(/opengraph-image-sqz7no\.png\?abc123/g)?.length, 2)
  assert.match(html, /twitter-image-a1b2c3\.png\\"/)
})

test('normalizes a hashed root OG artifact without double-extending existing PNGs', async (t) => {
  const outDir = await createFixture(t)
  const rootArtifact = path.join(outDir, 'opengraph-image-1t30ir')
  const existingPng = path.join(outDir, 'twitter-image.png')
  const htmlPath = path.join(outDir, 'index.html')

  await Promise.all([
    fs.writeFile(rootArtifact, ONE_PIXEL_PNG),
    fs.writeFile(existingPng, ONE_PIXEL_PNG),
    fs.writeFile(
      htmlPath,
      '<meta property="og:image" content="/opengraph-image-1t30ir"><meta name="twitter:image" content="/twitter-image.png">',
      'utf8',
    ),
  ])

  const result = await normalizeStaticOgArtifacts({ outDir })
  const html = await fs.readFile(htmlPath, 'utf8')

  assert.equal(result.renamed.length, 1)
  assert.match(html, /\/opengraph-image-1t30ir\.png/)
  assert.match(html, /\/twitter-image\.png/)
  assert.doesNotMatch(html, /\.png\.png/)
})

test('rewrites shared 404, offline, category, and RSC metadata consumers', async (t) => {
  const outDir = await createFixture(t)
  const rootArtifact = path.join(outDir, 'opengraph-image.png')
  const localeArtifact = path.join(outDir, 'en/opengraph-image-1t30ir')
  const categoryArtifact = path.join(
    outDir,
    'en/blog/architecture/opengraph-image-po70a1',
  )
  const paths = {
    notFound: path.join(outDir, '404.html'),
    internalNotFound: path.join(outDir, '_not-found.html'),
    offlineHtml: path.join(outDir, 'en/offline.html'),
    offlineRsc: path.join(outDir, 'en/offline.txt'),
    categoryHtml: path.join(outDir, 'fr/blog/ai.html'),
    categoryRsc: path.join(outDir, 'fr/blog/ai.txt'),
    runtimeChunk: path.join(outDir, 'runtime.js'),
  }

  await Promise.all([
    fs.mkdir(path.dirname(categoryArtifact), { recursive: true }),
    fs.mkdir(path.dirname(paths.categoryHtml), { recursive: true }),
  ])
  await Promise.all([
    fs.writeFile(rootArtifact, ONE_PIXEL_PNG),
    fs.writeFile(localeArtifact, ONE_PIXEL_PNG),
    fs.writeFile(categoryArtifact, ONE_PIXEL_PNG),
    fs.writeFile(
      paths.notFound,
      '<meta property="og:image" content="https://example.com/opengraph-image?root">',
    ),
    fs.writeFile(
      paths.internalNotFound,
      '<meta name="twitter:image" content="/opengraph-image">',
    ),
    fs.writeFile(
      paths.offlineHtml,
      '<meta property="og:image" content="/en/opengraph-image-1t30ir?offline">',
    ),
    fs.writeFile(
      paths.offlineRsc,
      '[\\"https://example.com/en/opengraph-image-1t30ir?offline\\"]',
    ),
    fs.writeFile(
      paths.categoryHtml,
      '<meta property="og:image" content="https://example.com/fr/blog/ai/opengraph-image-po70a1?category">',
    ),
    fs.writeFile(
      paths.categoryRsc,
      '["/fr/blog/ai/opengraph-image-po70a1?category"]',
    ),
    fs.writeFile(
      paths.runtimeChunk,
      'const route = "/fr/blog/ai/opengraph-image-po70a1?category";',
    ),
  ])

  const result = await normalizeStaticOgArtifacts({ outDir })

  assert.equal(result.renamed.length, 2)
  assert.equal(result.updatedHtml, 4)
  assert.equal(result.updatedText, 2)
  assert.match(await fs.readFile(paths.notFound, 'utf8'), /\/opengraph-image\.png\?root/)
  assert.match(await fs.readFile(paths.internalNotFound, 'utf8'), /\/opengraph-image\.png/)
  assert.match(
    await fs.readFile(paths.offlineHtml, 'utf8'),
    /\/en\/opengraph-image-1t30ir\.png\?offline/,
  )
  assert.match(
    await fs.readFile(paths.offlineRsc, 'utf8'),
    /\/en\/opengraph-image-1t30ir\.png\?offline\\"/,
  )
  for (const consumer of [paths.categoryHtml, paths.categoryRsc]) {
    assert.match(
      await fs.readFile(consumer, 'utf8'),
      /\/en\/blog\/architecture\/opengraph-image-po70a1\.png\?category/,
    )
  }
  assert.match(
    await fs.readFile(paths.runtimeChunk, 'utf8'),
    /\/fr\/blog\/ai\/opengraph-image-po70a1\?category/,
  )
})

test('does not share a hashed route when emitted artifacts have different content', async (t) => {
  const outDir = await createFixture(t)
  const enArtifact = path.join(outDir, 'en/blog/opengraph-image-samehash')
  const viArtifact = path.join(outDir, 'vi/blog/opengraph-image-samehash')
  const unmatchedConsumer = path.join(outDir, 'fr/blog.html')

  await Promise.all([
    fs.mkdir(path.dirname(viArtifact), { recursive: true }),
    fs.mkdir(path.dirname(unmatchedConsumer), { recursive: true }),
  ])
  await Promise.all([
    fs.writeFile(enArtifact, ONE_PIXEL_PNG),
    fs.writeFile(viArtifact, Buffer.concat([ONE_PIXEL_PNG, Buffer.from('different')])),
    fs.writeFile(
      unmatchedConsumer,
      '<meta property="og:image" content="/fr/blog/opengraph-image-samehash">',
    ),
  ])

  const result = await normalizeStaticOgArtifacts({ outDir })

  assert.equal(result.updatedHtml, 0)
  assert.match(
    await fs.readFile(unmatchedConsumer, 'utf8'),
    /\/fr\/blog\/opengraph-image-samehash/,
  )
})
