import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { createArtifactIndex } from '../scripts/lib/artifact-index.mjs'
import { normalizeStaticOgArtifacts } from '../scripts/postbuild-og.mjs'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
const SITE_ORIGIN = 'https://example.com'

async function createFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'postbuild-og-'))
  const outDir = path.join(root, 'out')
  const nextDir = path.join(root, '.next')
  await fs.mkdir(path.join(outDir, 'en', 'blog'), { recursive: true })
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  return { nextDir, outDir, root }
}

async function writePrerenderManifest(nextDir, routes) {
  await fs.mkdir(nextDir, { recursive: true })
  await fs.writeFile(
    path.join(nextDir, 'prerender-manifest.json'),
    JSON.stringify({
      version: 4,
      routes: Object.fromEntries(
        routes.map((route) => [
          route,
          {
            initialHeaders: { 'content-type': 'image/png' },
            srcRoute: route,
          },
        ]),
      ),
      dynamicRoutes: {},
      notFoundRoutes: [],
      preview: {},
    }),
  )
}

async function snapshotTree(root) {
  const files = []
  const pending = ['']
  while (pending.length > 0) {
    const relativeDirectory = pending.pop()
    const directory = relativeDirectory ? path.join(root, relativeDirectory) : root
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const relativePath = path.posix.join(relativeDirectory, entry.name)
      if (entry.isDirectory()) pending.push(relativePath)
      else files.push(relativePath)
    }
  }
  const entries = await Promise.all(
    files.sort().map(async (relativePath) => [
      relativePath,
      (await fs.readFile(path.join(root, relativePath))).toString('base64'),
    ]),
  )
  return Object.fromEntries(entries)
}

test('normalizes hashed Next 16 OG artifacts and preserves metadata query strings', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
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
        '<script>self.__next_f.push([1,"[\\"/en/blog/opengraph-image-sqz7no?abc123\\",\\"/en/blog/twitter-image-a1b2c3\\"]"])</script>',
      ].join(''),
      'utf8',
    ),
  ])
  await writePrerenderManifest(nextDir, [
    '/en/blog/opengraph-image-sqz7no',
    '/en/blog/twitter-image-a1b2c3',
  ])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.skipped, false)
  assert.equal(result.renamed.length, 1)
  assert.equal(result.deduplicated.length, 1)
  assert.equal(result.updatedHtml, 1)
  assert.equal(result.updatedText, 0)
  await assert.rejects(fs.access(openGraphArtifact))
  await assert.rejects(fs.access(twitterArtifact))
  const canonicalUrl = result.deduplicated[0].canonicalUrl
  assert.deepEqual(await fs.readFile(path.join(outDir, canonicalUrl.slice(1))), ONE_PIXEL_PNG)

  const html = await fs.readFile(htmlPath, 'utf8')
  assert.equal(html.match(new RegExp(`${canonicalUrl}\\?abc123`, 'g'))?.length, 2)
  assert.match(html, new RegExp(`${canonicalUrl}\\?def456`))
  assert.match(html, new RegExp(`${canonicalUrl.replaceAll('/', '\\/')}\\\\"`))
})

test('normalizes a hashed root OG artifact without double-extending existing PNGs', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
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
  await writePrerenderManifest(nextDir, ['/opengraph-image-1t30ir', '/twitter-image'])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })
  const html = await fs.readFile(htmlPath, 'utf8')

  assert.equal(result.renamed.length, 0)
  assert.equal(result.deduplicated.length, 1)
  assert.equal(html.match(/\/twitter-image\.png/g)?.length, 2)
  assert.doesNotMatch(html, /\.png\.png/)
})

test('rewrites shared 404, offline, category, and RSC metadata consumers', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const rootArtifact = path.join(outDir, 'opengraph-image.png')
  const localeArtifact = path.join(outDir, 'en/opengraph-image-1t30ir')
  const categoryArtifact = path.join(
    outDir,
    'fr/blog/ai/opengraph-image-po70a1',
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
  await writePrerenderManifest(nextDir, [
    '/opengraph-image',
    '/en/opengraph-image-1t30ir',
    '/fr/blog/ai/opengraph-image-po70a1',
  ])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.renamed.length, 0)
  assert.equal(result.updatedHtml, 4)
  assert.equal(result.updatedText, 2)
  assert.match(await fs.readFile(paths.notFound, 'utf8'), /\/opengraph-image\.png\?root/)
  assert.match(await fs.readFile(paths.internalNotFound, 'utf8'), /\/opengraph-image\.png/)
  assert.match(
    await fs.readFile(paths.offlineHtml, 'utf8'),
    /\/opengraph-image\.png\?offline/,
  )
  assert.match(
    await fs.readFile(paths.offlineRsc, 'utf8'),
    /\/opengraph-image\.png\?offline\\"/,
  )
  for (const consumer of [paths.categoryHtml, paths.categoryRsc]) {
    assert.match(
      await fs.readFile(consumer, 'utf8'),
      /\/opengraph-image\.png\?category/,
    )
  }
  assert.match(
    await fs.readFile(paths.runtimeChunk, 'utf8'),
    /\/fr\/blog\/ai\/opengraph-image-po70a1\?category/,
  )
})

test('does not share a hashed route when emitted artifacts have different content', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
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
  await writePrerenderManifest(nextDir, [
    '/en/blog/opengraph-image-samehash',
    '/vi/blog/opengraph-image-samehash',
  ])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.updatedHtml, 0)
  assert.match(
    await fs.readFile(unmatchedConsumer, 'utf8'),
    /\/fr\/blog\/opengraph-image-samehash/,
  )
})

test('deduplicates only byte-identical social images and rewrites HTML and RSC consumers', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const rootArtifact = path.join(outDir, 'opengraph-image.png')
  const localeArtifact = path.join(outDir, 'en/opengraph-image-rootcopy')
  const categoryArtifact = path.join(outDir, 'fr/blog/ai/opengraph-image-category')
  const twitterArtifact = path.join(outDir, 'vi/twitter-image-rootcopy')
  const distinctArtifact = path.join(outDir, 'ja/opengraph-image-distinct')
  const ordinaryPng = path.join(outDir, 'assets/ordinary.png')
  const htmlPath = path.join(outDir, 'fr/blog/ai.html')
  const rscPath = path.join(outDir, 'fr/blog/ai.txt')

  await Promise.all([
    fs.mkdir(path.dirname(categoryArtifact), { recursive: true }),
    fs.mkdir(path.dirname(twitterArtifact), { recursive: true }),
    fs.mkdir(path.dirname(distinctArtifact), { recursive: true }),
    fs.mkdir(path.dirname(ordinaryPng), { recursive: true }),
  ])
  await Promise.all([
    fs.writeFile(rootArtifact, ONE_PIXEL_PNG),
    fs.writeFile(localeArtifact, ONE_PIXEL_PNG),
    fs.writeFile(categoryArtifact, ONE_PIXEL_PNG),
    fs.writeFile(twitterArtifact, ONE_PIXEL_PNG),
    fs.writeFile(distinctArtifact, Buffer.concat([ONE_PIXEL_PNG, Buffer.from('distinct')])),
    fs.writeFile(ordinaryPng, ONE_PIXEL_PNG),
    fs.writeFile(
      htmlPath,
      [
        '<meta property="og:image" content="https://example.com/fr/blog/ai/opengraph-image-category?card">',
        '<meta name="twitter:image" content="/vi/twitter-image-rootcopy">',
      ].join(''),
    ),
    fs.writeFile(
      rscPath,
      '[\\"/en/opengraph-image-rootcopy?flight\\",\\"/fr/blog/ai/opengraph-image-category.png\\"]',
    ),
  ])
  await writePrerenderManifest(nextDir, [
    '/opengraph-image',
    '/en/opengraph-image-rootcopy',
    '/fr/blog/ai/opengraph-image-category',
    '/vi/twitter-image-rootcopy',
    '/ja/opengraph-image-distinct',
  ])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.renamed.length, 1)
  assert.equal(result.deduplicated.length, 3)
  assert.equal(result.savedBytes, ONE_PIXEL_PNG.length * 3)
  assert.deepEqual(
    result.deduplicated.map(({ canonicalUrl, removedUrl }) => ({ canonicalUrl, removedUrl })),
    [
      {
        canonicalUrl: '/opengraph-image.png',
        removedUrl: '/en/opengraph-image-rootcopy.png',
      },
      {
        canonicalUrl: '/opengraph-image.png',
        removedUrl: '/fr/blog/ai/opengraph-image-category.png',
      },
      {
        canonicalUrl: '/opengraph-image.png',
        removedUrl: '/vi/twitter-image-rootcopy.png',
      },
    ],
  )
  for (const removed of result.deduplicated) {
    await assert.rejects(fs.access(path.join(outDir, removed.removedUrl.slice(1))))
  }
  assert.deepEqual(await fs.readFile(rootArtifact), ONE_PIXEL_PNG)
  assert.deepEqual(await fs.readFile(ordinaryPng), ONE_PIXEL_PNG)
  assert.deepEqual(
    await fs.readFile(path.join(outDir, 'ja/opengraph-image-distinct.png')),
    Buffer.concat([ONE_PIXEL_PNG, Buffer.from('distinct')]),
  )
  assert.equal(
    await fs.readFile(htmlPath, 'utf8'),
    '<meta property="og:image" content="https://example.com/opengraph-image.png?card"><meta name="twitter:image" content="/opengraph-image.png">',
  )
  assert.equal(
    await fs.readFile(rscPath, 'utf8'),
    '[\\"/opengraph-image.png?flight\\",\\"/opengraph-image.png\\"]',
  )
})

test('selects the shortest then lexical social-image URL when no root OG exists', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const lexicalWinner = path.join(outDir, 'a/opengraph-image-shared')
  const lexicalLoser = path.join(outDir, 'b/opengraph-image-shared')
  const longer = path.join(outDir, 'en/blog/opengraph-image-shared')
  await Promise.all([
    fs.mkdir(path.dirname(lexicalWinner), { recursive: true }),
    fs.mkdir(path.dirname(lexicalLoser), { recursive: true }),
    fs.mkdir(path.dirname(longer), { recursive: true }),
  ])
  await Promise.all([
    fs.writeFile(lexicalWinner, ONE_PIXEL_PNG),
    fs.writeFile(lexicalLoser, ONE_PIXEL_PNG),
    fs.writeFile(longer, ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, 'en/blog.html'),
      '<meta property="og:image" content="/b/opengraph-image-shared"><meta name="twitter:image" content="/en/blog/opengraph-image-shared">',
    ),
  ])
  await writePrerenderManifest(nextDir, [
    '/a/opengraph-image-shared',
    '/b/opengraph-image-shared',
    '/en/blog/opengraph-image-shared',
  ])

  const first = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })
  assert.equal(first.deduplicated.length, 2)
  assert.deepEqual(
    first.deduplicated.map(({ canonicalUrl }) => canonicalUrl),
    ['/a/opengraph-image-shared.png', '/a/opengraph-image-shared.png'],
  )
  assert.equal(
    await fs.readFile(path.join(outDir, 'en/blog.html'), 'utf8'),
    '<meta property="og:image" content="/a/opengraph-image-shared.png"><meta name="twitter:image" content="/a/opengraph-image-shared.png">',
  )

  const second = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })
  assert.equal(second.renamed.length, 0)
  assert.equal(second.deduplicated.length, 0)
  assert.equal(second.savedBytes, 0)
  assert.equal(second.updatedHtml, 0)
  assert.equal(second.updatedText, 0)
})

test('uses the concrete Next metadata inventory and leaves manual lookalike PNGs untouched', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const manual = path.join(outDir, 'marketing/opengraph-image.png')
  await fs.mkdir(path.dirname(manual), { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(manual, ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, 'index.html'),
      '<meta property="og:image" content="/en/opengraph-image-shared"><a href="/marketing/opengraph-image.png">manual</a>',
    ),
  ])
  await writePrerenderManifest(nextDir, [
    '/opengraph-image',
    '/en/opengraph-image-shared',
  ])

  const result = await normalizeStaticOgArtifacts({
    nextDir,
    outDir,
    siteOrigin: SITE_ORIGIN,
  })

  assert.equal(result.deduplicated.length, 1)
  assert.deepEqual(await fs.readFile(manual), ONE_PIXEL_PNG)
  assert.match(await fs.readFile(path.join(outDir, 'index.html'), 'utf8'), /\/marketing\/opengraph-image\.png/)
})

test('normalizes Unicode URL aliases but never rewrites an external origin or substring', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const unicodeRoute = '/caf%C3%A9/opengraph-image-shared'
  const longRoute = '/international/opengraph-image-shared'
  await Promise.all([
    fs.mkdir(path.join(outDir, 'café'), { recursive: true }),
    fs.mkdir(path.join(outDir, 'international'), { recursive: true }),
  ])
  await Promise.all([
    fs.writeFile(path.join(outDir, 'café/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'international/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, 'index.html'),
      [
        '<meta content="/international/opengraph-image-shared?root=1#card">',
        '<meta content="https://example.com/international/opengraph-image-shared.png?absolute=1#card">',
        '<meta content="/café/opengraph-image-shared?unicode=1#card">',
        '<meta content="https://cdn.example.com/international/opengraph-image-shared.png?external=1#card">',
        '<code>urn:/international/opengraph-image-shared?urn=1</code>',
        '<code>data:image/svg+xml,/international/opengraph-image-shared?data=1</code>',
        '<code>mailto:/international/opengraph-image-shared?mail=1</code>',
        '<code>javascript:/international/opengraph-image-shared?script=1</code>',
        '<code>//cdn.example.com/international/opengraph-image-shared?protocol=1</code>',
        '<code>prefix/international/opengraph-image-shared</code>',
        '<code>/international/opengraph-image-shared.png-suffix</code>',
      ].join(''),
    ),
  ])
  await writePrerenderManifest(nextDir, [unicodeRoute, longRoute])

  await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })
  const html = await fs.readFile(path.join(outDir, 'index.html'), 'utf8')

  assert.match(html, /\/caf%C3%A9\/opengraph-image-shared\.png\?root=1#card/)
  assert.match(html, /https:\/\/example\.com\/caf%C3%A9\/opengraph-image-shared\.png\?absolute=1#card/)
  assert.match(html, /\/caf%C3%A9\/opengraph-image-shared\.png\?unicode=1#card/)
  assert.match(html, /https:\/\/cdn\.example\.com\/international\/opengraph-image-shared\.png\?external=1#card/)
  assert.match(html, /urn:\/international\/opengraph-image-shared\?urn=1/)
  assert.match(html, /data:image\/svg\+xml,\/international\/opengraph-image-shared\?data=1/)
  assert.match(html, /mailto:\/international\/opengraph-image-shared\?mail=1/)
  assert.match(html, /javascript:\/international\/opengraph-image-shared\?script=1/)
  assert.match(html, /\/\/cdn\.example\.com\/international\/opengraph-image-shared\?protocol=1/)
  assert.match(html, /prefix\/international\/opengraph-image-shared/)
  assert.match(html, /\/international\/opengraph-image-shared\.png-suffix/)
})

test('rewrites supported text consumers, preserves escape style, and never mutates JavaScript', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await fs.mkdir(path.join(outDir, 'vi'), { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'vi/opengraph-image-shared'), ONE_PIXEL_PNG),
  ])
  const consumers = {
    'page.html': '<meta content="/vi/opengraph-image-shared?html#card">',
    'page.htm': '<meta content="/vi/opengraph-image-shared?htm#card">',
    'page.txt': '[\\"/vi/opengraph-image-shared?txt#card\\"]',
    'page.rsc': '["/vi/opengraph-image-shared?rsc#card"]',
    'page.json': '{"image":"\\/vi\\/opengraph-image-shared?json#card"}',
    'page.css': '.card{background:url("/vi/opengraph-image-shared?css#card")}',
    'site.webmanifest': '{"screenshots":[{"src":"/vi/opengraph-image-shared?manifest#card"}]}',
    '_ssgManifest.js': 'self.__SSG_MANIFEST="/vi/opengraph-image-shared?js#card"',
  }
  await Promise.all(
    Object.entries(consumers).map(([file, content]) => fs.writeFile(path.join(outDir, file), content)),
  )
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/vi/opengraph-image-shared'])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.updatedHtml, 2)
  assert.equal(result.updatedText, 5)
  for (const file of Object.keys(consumers).filter((value) => !value.endsWith('.js'))) {
    const content = await fs.readFile(path.join(outDir, file), 'utf8')
    assert.doesNotMatch(content, /vi(?:\\?\/)opengraph-image-shared/)
    assert.match(content, /opengraph-image\.png/)
  }
  assert.equal(
    await fs.readFile(path.join(outDir, '_ssgManifest.js'), 'utf8'),
    consumers['_ssgManifest.js'],
  )
  assert.match(await fs.readFile(path.join(outDir, 'page.json'), 'utf8'), /\\\/opengraph-image\.png/)
})

test('rewrites only complete consumer URL tokens and preserves embedded alias text', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await fs.mkdir(path.join(outDir, 'vi'), { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'vi/opengraph-image-shared'), ONE_PIXEL_PNG),
  ])
  const alias = '/vi/opengraph-image-shared'
  const canonical = '/opengraph-image.png'
  const consumers = {
    'tokens.html': [
      `<meta content="${alias}?meta&amp;mode=card#card">`,
      `<a href="https://example.com${alias}?href#card">asset</a>`,
      `<img src='${alias}?src#card' srcset=" , ${alias}?small 1e0x,https://example.com${alias}?large 2E+0x,https://cdn.example.com${alias}?external .5e1x, ">`,
      `<link imagesrcset="data:image/svg+xml,%3Csvg%3E,${alias}?data-srcset%3C/svg%3E 1x,${alias}?preload 2e0x">`,
      `<a href="mailto:test@example.com?body=${alias}?mail">mail</a>`,
      `<a href="javascript:window.value='${alias}?script'">script URL</a>`,
      `<a href="//example.com${alias}?protocol">protocol relative</a>`,
      `<meta content="data:text/html,<img src='${alias}?data'>">`,
      `<script>self.__next_f.push([1,"[\\"${alias}?flight#card\\"]"])</script>`,
      `<script>const image = "${alias}?inline-script"</script>`,
      `<style>.inline{background:url("${alias}?inline-style")}</style>`,
      `<div style="background:url(&quot;${alias}?style-attr&amp;mode=card&quot;)">styled</div>`,
      `<style>.data{background:url("data:image/svg+xml,<svg>${alias}?style-data</svg>")}</style>`,
      `<p>normal prose ${alias}?prose and prefix${alias}?substring</p>`,
    ].join(''),
    'tokens.json': JSON.stringify({
      good: `${alias}?json#card`,
      absolute: `https://example.com${alias}?absolute#card`,
      mail: `mailto:test@example.com?body=${alias}?mail`,
      javascript: `javascript:window.value='${alias}?script'`,
      data: `data:text/html,<img src='${alias}?data'>`,
      prose: `normal prose ${alias}?prose`,
      nested: `mailto:test@example.com?body=\"${alias}?nested\"`,
    }),
    'tokens.webmanifest': `{"src":"\\/vi\\/opengraph-image-shared?manifest#card","note":"data:text/html,<img src='${alias}?data'>"}`,
    'tokens.rsc': `["${alias}?rsc#card","mailto:test@example.com?body=\\"${alias}?nested\\""]`,
    'tokens.txt': `[\\"${alias}?txt#card\\",\\"javascript:window.value=\\\\\\"${alias}?nested\\\\\\"\\"]`,
    'tokens.css': [
      `.good{background:url("${alias}?css#card")}`,
      `.absolute{background:url('https://example.com${alias}?absolute-css#card')}`,
      `.data{background:url("data:image/svg+xml,<svg>${alias}?data</svg>")}`,
      `.external{background:url("https://cdn.example.com${alias}?external")}`,
      `.text{content:"url('${alias}?string')"}`,
      `/* url("${alias}?comment") */`,
    ].join(''),
  }
  await Promise.all(
    Object.entries(consumers).map(([file, content]) => fs.writeFile(path.join(outDir, file), content)),
  )
  await writePrerenderManifest(nextDir, ['/opengraph-image', alias])

  await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  const html = await fs.readFile(path.join(outDir, 'tokens.html'), 'utf8')
  assert.match(html, new RegExp(`${canonical.replace('.', '\\.')}\\?meta&amp;mode=card#card`))
  assert.match(html, new RegExp(`https://example\\.com${canonical.replace('.', '\\.')}\\?href#card`))
  assert.match(html, new RegExp(`${canonical.replace('.', '\\.')}\\?small 1e0x`))
  assert.match(html, new RegExp(`https://example\\.com${canonical.replace('.', '\\.')}\\?large 2E\\+0x`))
  assert.match(html, new RegExp(`${canonical.replace('.', '\\.')}\\?preload 2e0x`))
  assert.match(html, new RegExp(`${canonical.replace('.', '\\.')}\\?flight#card`))
  assert.match(html, new RegExp(`${canonical.replace('.', '\\.')}\\?inline-style`))
  assert.match(html, new RegExp(`${canonical.replace('.', '\\.')}\\?style-attr&amp;mode=card`))
  for (const marker of [
    'mail',
    'script',
    'protocol',
    'data',
    'inline-script',
    'prose',
    'substring',
    'data-srcset',
    'style-data',
  ]) {
    assert.match(html, new RegExp(`${alias}\\?${marker}`))
  }

  const json = JSON.parse(await fs.readFile(path.join(outDir, 'tokens.json'), 'utf8'))
  assert.equal(json.good, `${canonical}?json#card`)
  assert.equal(json.absolute, `https://example.com${canonical}?absolute#card`)
  for (const key of ['mail', 'javascript', 'data', 'prose', 'nested']) {
    assert.equal(json[key], JSON.parse(consumers['tokens.json'])[key])
  }

  const manifest = await fs.readFile(path.join(outDir, 'tokens.webmanifest'), 'utf8')
  assert.match(manifest, /\\\/opengraph-image\.png\?manifest#card/)
  assert.match(manifest, new RegExp(`${alias}\\?data`))

  const rsc = await fs.readFile(path.join(outDir, 'tokens.rsc'), 'utf8')
  assert.match(rsc, new RegExp(`${canonical.replace('.', '\\.')}\\?rsc#card`))
  assert.match(rsc, new RegExp(`${alias}\\?nested`))
  const txt = await fs.readFile(path.join(outDir, 'tokens.txt'), 'utf8')
  assert.match(txt, new RegExp(`${canonical.replace('.', '\\.')}\\?txt#card`))
  assert.match(txt, new RegExp(`${alias}\\?nested`))

  const css = await fs.readFile(path.join(outDir, 'tokens.css'), 'utf8')
  assert.match(css, new RegExp(`${canonical.replace('.', '\\.')}\\?css#card`))
  assert.match(css, new RegExp(`https://example\\.com${canonical.replace('.', '\\.')}\\?absolute-css#card`))
  for (const marker of ['data', 'external', 'string', 'comment']) {
    assert.match(css, new RegExp(`${alias}\\?${marker}`))
  }
})

test('fails closed on a malformed srcset before pruning social-image aliases', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, 'broken-srcset.html'),
      '<img srcset="/en/opengraph-image-shared 1q,/opengraph-image 2x">',
    ),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])
  const before = await snapshotTree(outDir)

  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /invalid srcset/,
  )

  assert.deepEqual(await snapshotTree(outDir), before)
})

test('preserves an unknown non-decoding HTML reference while pruning aliases', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, 'broken-entity.html'),
      '<meta content="/en/opengraph-image-shared?label=&unknown;">',
    ),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])
  await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(
    await fs.readFile(path.join(outDir, 'broken-entity.html'), 'utf8'),
    '<meta content="/opengraph-image.png?label=&amp;unknown;">',
  )
  await assert.rejects(fs.access(path.join(outDir, 'en/opengraph-image-shared')))
})

test('rewrites escaped Unicode aliases in recognized Next Flight scripts only', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await fs.mkdir(path.join(outDir, 'café'), { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'café/opengraph-image-shared'), ONE_PIXEL_PNG),
  ])
  const htmlPath = path.join(outDir, 'flight.html')
  const original = [
    '<meta content="/café/opengraph-image-shared?meta#card">',
    '<script>self.__next_f.push([1,"[\\"/caf\\u00e9/opengraph-image-shared?flight#card\\"]"])</script>',
    '<script>const mail = "mailto:test@example.com?body=/café/opengraph-image-shared?mail#card"</script>',
    '<script>const data = "data:text/html,<img src=\'/café/opengraph-image-shared?data#card\'>"</script>',
  ].join('')
  await fs.writeFile(htmlPath, original)
  await writePrerenderManifest(nextDir, [
    '/opengraph-image',
    '/caf%C3%A9/opengraph-image-shared',
  ])

  await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  const html = await fs.readFile(htmlPath, 'utf8')
  assert.equal(html.match(/\/opengraph-image\.png\?meta#card/g)?.length, 1)
  assert.equal(html.match(/\/opengraph-image\.png\?flight#card/g)?.length, 1)
  assert.match(html, /mailto:test@example\.com\?body=\/café\/opengraph-image-shared\?mail#card/)
  assert.match(html, /data:text\/html,<img src='\/café\/opengraph-image-shared\?data#card'>/)
})

test('fails closed on a malformed recognized Next Flight script before mutation', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, 'broken.html'),
      '<meta content="/en/opengraph-image-shared"><script>self.__next_f.push([1,"unterminated)</script>',
    ),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])
  const before = await snapshotTree(outDir)

  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /cannot parse recognized Next Flight script/,
  )

  assert.deepEqual(await snapshotTree(outDir), before)
})

for (const failurePhase of [
  'after-normalization-promote',
  'after-consumer-promote',
  'after-prune-move',
]) {
  test(`rolls back the complete tree after ${failurePhase}`, async (t) => {
    const { nextDir, outDir } = await createFixture(t)
    await Promise.all([
      fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
      fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
      fs.writeFile(path.join(outDir, 'a.html'), '<meta content="/en/opengraph-image-shared">'),
      fs.writeFile(path.join(outDir, 'b.json'), '{"image":"/en/opengraph-image-shared"}'),
    ])
    await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])
    const before = await snapshotTree(outDir)
    let injected = false

    await assert.rejects(
      normalizeStaticOgArtifacts({
        injectFailure(event) {
          if (!injected && event === failurePhase) {
            injected = true
            throw new Error(`injected ${failurePhase}`)
          }
        },
        nextDir,
        outDir,
        siteOrigin: SITE_ORIGIN,
      }),
      new RegExp(`injected ${failurePhase}`),
    )
    assert.equal(injected, true)
    assert.deepEqual(await snapshotTree(outDir), before)

    const recovered = await normalizeStaticOgArtifacts({
      nextDir,
      outDir,
      siteOrigin: SITE_ORIGIN,
    })
    assert.equal(recovered.deduplicated.length, 1)
    const idempotent = await normalizeStaticOgArtifacts({
      nextDir,
      outDir,
      siteOrigin: SITE_ORIGIN,
    })
    assert.equal(idempotent.deduplicated.length, 0)
    assert.equal(idempotent.updatedHtml, 0)
    assert.equal(idempotent.updatedText, 0)
  })
}

test('preserves an incomplete rollback for byte-exact recovery on the next run', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'page.html'), '<meta content="/en/opengraph-image-shared">'),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])

  let blockedPath
  await assert.rejects(
    normalizeStaticOgArtifacts({
      async injectFailure(event, detail) {
        if (!blockedPath && event === 'after-prune-move') {
          blockedPath = detail.path
          await fs.mkdir(path.join(outDir, blockedPath), { recursive: true })
          throw new Error('injected failure with blocked rollback restore')
        }
      },
      nextDir,
      outDir,
      siteOrigin: SITE_ORIGIN,
    }),
    (error) =>
      error instanceof AggregateError &&
      /rollback requires recovery/.test(error.message) &&
      error.message.includes(outDir),
  )

  assert.ok(blockedPath)
  const transactionNames = (await fs.readdir(outDir)).filter((entry) =>
    entry.startsWith('.postbuild-og-transaction-'),
  )
  assert.equal(transactionNames.length, 1)
  const transactionDir = path.join(outDir, transactionNames[0])
  const journal = JSON.parse(await fs.readFile(path.join(transactionDir, 'journal.json'), 'utf8'))
  assert.equal(journal.state, 'applying')
  assert.deepEqual(
    await fs.readFile(path.join(transactionDir, 'backup', blockedPath)),
    ONE_PIXEL_PNG,
  )
  assert.deepEqual(
    await fs.readFile(path.join(transactionDir, 'deleted', blockedPath)),
    ONE_PIXEL_PNG,
  )

  await fs.rm(path.join(outDir, blockedPath), { recursive: true })
  const recovered = await normalizeStaticOgArtifacts({
    nextDir,
    outDir,
    siteOrigin: SITE_ORIGIN,
  })

  assert.equal(recovered.deduplicated.length, 1)
  await assert.rejects(fs.access(transactionDir))
  assert.deepEqual(await fs.readFile(path.join(outDir, 'opengraph-image.png')), ONE_PIXEL_PNG)
  assert.equal(
    await fs.readFile(path.join(outDir, 'page.html'), 'utf8'),
    '<meta content="/opengraph-image.png">',
  )
})

test('fails collision preflight before changing any artifact', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await fs.mkdir(path.join(outDir, 'a'), { recursive: true })
  await fs.mkdir(path.join(outDir, 'b'), { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(outDir, 'a/opengraph-image-first'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'b/opengraph-image-collision'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'b/opengraph-image-collision.body'), ONE_PIXEL_PNG),
  ])
  await writePrerenderManifest(nextDir, [
    '/a/opengraph-image-first',
    '/b/opengraph-image-collision',
  ])
  const before = await snapshotTree(outDir)

  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /multiple artifacts for metadata route/,
  )
  assert.deepEqual(await snapshotTree(outDir), before)
})

test('fails closed when the authoritative metadata inventory is missing or incomplete', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG)
  const before = await snapshotTree(outDir)

  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /cannot read authoritative prerender manifest/,
  )
  assert.deepEqual(await snapshotTree(outDir), before)

  await writePrerenderManifest(nextDir, [
    '/opengraph-image',
    '/en/opengraph-image-missing',
  ])
  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /missing artifact for metadata route: \/en\/opengraph-image-missing/,
  )
  assert.deepEqual(await snapshotTree(outDir), before)
})

test('pins the supported manifest schema, exact PNG MIME, and root-relative routes', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG)
  await fs.mkdir(nextDir, { recursive: true })
  const before = await snapshotTree(outDir)
  const writeManifest = (manifest) =>
    fs.writeFile(path.join(nextDir, 'prerender-manifest.json'), JSON.stringify(manifest))
  const base = {
    version: 4,
    routes: {
      '/opengraph-image': {
        initialHeaders: { 'content-type': 'image/png' },
        srcRoute: '/opengraph-image',
      },
    },
  }

  await writeManifest({ ...base, version: 5 })
  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /invalid prerender manifest shape/,
  )

  await writeManifest({
    ...base,
    routes: {
      '/opengraph-image': {
        initialHeaders: { 'content-type': 'image/png-invalid' },
        srcRoute: '/opengraph-image',
      },
    },
  })
  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /metadata route is not declared as image\/png/,
  )

  await writeManifest({
    ...base,
    routes: {
      'https://manifest.invalid/opengraph-image': {
        initialHeaders: { 'content-type': 'image/png' },
        srcRoute: 'https://manifest.invalid/opengraph-image',
      },
    },
  })
  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /prerender route must be root-relative/,
  )
  assert.deepEqual(await snapshotTree(outDir), before)
})

test('recovers an interrupted applying transaction before rebuilding the inventory', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const sources = {
    root: 'opengraph-image',
    duplicate: 'en/opengraph-image-shared',
    consumer: 'page.html',
  }
  await Promise.all([
    fs.writeFile(path.join(outDir, sources.root), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, sources.duplicate), ONE_PIXEL_PNG),
    fs.writeFile(
      path.join(outDir, sources.consumer),
      '<meta content="/en/opengraph-image-shared">',
    ),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])

  const transactionDir = path.join(outDir, '.postbuild-og-transaction-crash')
  for (const relativePath of Object.values(sources)) {
    const backup = path.join(transactionDir, 'backup', relativePath)
    await fs.mkdir(path.dirname(backup), { recursive: true })
    await fs.copyFile(path.join(outDir, relativePath), backup)
  }
  await fs.writeFile(
    path.join(transactionDir, 'journal.json'),
    JSON.stringify({
      version: 1,
      state: 'applying',
      originalExisting: Object.values(sources),
      originalAbsent: ['opengraph-image.png'],
    }),
  )
  await fs.writeFile(path.join(outDir, 'opengraph-image.png'), ONE_PIXEL_PNG)
  await fs.writeFile(path.join(outDir, sources.consumer), '<meta content="/opengraph-image.png">')
  await Promise.all([
    fs.rm(path.join(outDir, sources.root)),
    fs.rm(path.join(outDir, sources.duplicate)),
  ])

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.deduplicated.length, 1)
  await assert.rejects(fs.access(transactionDir))
  assert.equal(
    await fs.readFile(path.join(outDir, sources.consumer), 'utf8'),
    '<meta content="/opengraph-image.png">',
  )
})

test('rejects a concurrent transform without touching the active transaction tree', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'page.html'), '<meta content="/en/opengraph-image-shared">'),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])

  let releaseFirst
  let signalReached
  const reached = new Promise((resolve) => {
    signalReached = resolve
  })
  const release = new Promise((resolve) => {
    releaseFirst = resolve
  })
  let paused = false
  const first = normalizeStaticOgArtifacts({
    async injectFailure(event) {
      if (!paused && event === 'after-normalization-promote') {
        paused = true
        signalReached()
        await release
      }
    },
    nextDir,
    outDir,
    siteOrigin: SITE_ORIGIN,
  })
  await reached

  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /transform lock is already held/,
  )
  releaseFirst()
  const result = await first

  assert.equal(result.deduplicated.length, 1)
  assert.equal(
    await fs.readFile(path.join(outDir, 'page.html'), 'utf8'),
    '<meta content="/opengraph-image.png">',
  )
  assert.deepEqual(await fs.readFile(path.join(outDir, 'opengraph-image.png')), ONE_PIXEL_PNG)
  const rerun = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })
  assert.equal(rerun.deduplicated.length, 0)
  assert.equal(rerun.updatedHtml, 0)
})

test('retires a dead-owner lock but never needs to steal a live one', async (t) => {
  const { nextDir, outDir, root } = await createFixture(t)
  await fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG)
  await writePrerenderManifest(nextDir, ['/opengraph-image'])
  const lockDir = path.join(root, '.out.postbuild-transform.lock')
  await fs.mkdir(lockDir)
  await fs.writeFile(
    path.join(lockDir, 'owner.json'),
    JSON.stringify({
      schemaVersion: 1,
      pid: 99_999_999,
      startedAt: Date.now() - 60_000,
      token: 'dead-owner-token-for-test',
    }),
  )

  const result = await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  assert.equal(result.renamed.length, 1)
  await assert.rejects(fs.access(lockDir))
})

test('never lets committed state excuse a missing artifact in a fresh output tree', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])
  await normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN })

  await fs.rm(outDir, { recursive: true })
  await fs.mkdir(path.join(outDir, 'en'), { recursive: true })
  await fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG)

  await assert.rejects(
    normalizeStaticOgArtifacts({ nextDir, outDir, siteOrigin: SITE_ORIGIN }),
    /missing artifact for metadata route: \/en\/opengraph-image-shared/,
  )
  assert.deepEqual(await fs.readFile(path.join(outDir, 'opengraph-image')), ONE_PIXEL_PNG)
})

test('keeps consumer planning memory bounded and does not cache the text corpus', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
  ])
  const consumerCount = 16
  const padding = 'x'.repeat(128 * 1024)
  const consumers = Array.from({ length: consumerCount }, (_, index) => `consumer-${index}.txt`)
  await Promise.all(
    consumers.map((file) =>
      fs.writeFile(
        path.join(outDir, file),
        `["/en/opengraph-image-shared?item=${file}","${padding}"]`,
      ),
    ),
  )
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])
  const artifactIndex = await createArtifactIndex(outDir)
  const totalConsumerBytes = (
    await Promise.all(consumers.map((file) => fs.stat(path.join(outDir, file))))
  ).reduce((total, stat) => total + stat.size, 0)

  const result = await normalizeStaticOgArtifacts({
    artifactIndex,
    consumerConcurrency: 2,
    nextDir,
    outDir,
    siteOrigin: SITE_ORIGIN,
  })

  assert.ok(result.peakConsumerPlanBytes < totalConsumerBytes / 2)
  assert.ok(artifactIndex.metrics().peakCachedBytes < totalConsumerBytes / 10)
  assert.equal(result.updatedText, consumerCount)
})

test('prepared preflight failure preserves a newly appeared target', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const foreignTarget = Buffer.from('foreign-writer')
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'page.html'), '<meta content="/en/opengraph-image-shared">'),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])

  await assert.rejects(
    normalizeStaticOgArtifacts({
      async injectFailure(event) {
        if (event === 'before-preflight') {
          await fs.writeFile(path.join(outDir, 'opengraph-image.png'), foreignTarget)
        }
      },
      nextDir,
      outDir,
      siteOrigin: SITE_ORIGIN,
    }),
    /transaction preflight changed for write: opengraph-image\.png/,
  )

  assert.deepEqual(await fs.readFile(path.join(outDir, 'opengraph-image.png')), foreignTarget)
  assert.deepEqual(await fs.readFile(path.join(outDir, 'opengraph-image')), ONE_PIXEL_PNG)
  assert.equal(
    await fs.readFile(path.join(outDir, 'page.html'), 'utf8'),
    '<meta content="/en/opengraph-image-shared">',
  )
})

test('digest preflight refuses to prune an artifact changed after planning', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const changed = Buffer.concat([ONE_PIXEL_PNG, Buffer.from('changed-after-plan')])
  await Promise.all([
    fs.writeFile(path.join(outDir, 'opengraph-image'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), ONE_PIXEL_PNG),
    fs.writeFile(path.join(outDir, 'page.html'), '<meta content="/en/opengraph-image-shared">'),
  ])
  await writePrerenderManifest(nextDir, ['/opengraph-image', '/en/opengraph-image-shared'])

  await assert.rejects(
    normalizeStaticOgArtifacts({
      async injectFailure(event) {
        if (event === 'before-preflight') {
          await fs.writeFile(path.join(outDir, 'en/opengraph-image-shared'), changed)
        }
      },
      nextDir,
      outDir,
      siteOrigin: SITE_ORIGIN,
    }),
    /transaction preflight bytes changed for removal: en\/opengraph-image-shared/,
  )

  assert.deepEqual(await fs.readFile(path.join(outDir, 'en/opengraph-image-shared')), changed)
  assert.deepEqual(await fs.readFile(path.join(outDir, 'opengraph-image')), ONE_PIXEL_PNG)
})
