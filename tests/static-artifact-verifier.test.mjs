import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { verifyStaticArtifact } from '../scripts/verify-static-artifact.mjs'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

function createFixture(t, overrides = {}) {
  const rootDir = mkdtempSync(path.join(tmpdir(), 'static-artifact-verifier-'))
  const outDir = path.join(rootDir, 'out')
  mkdirSync(path.join(outDir, 'assets'), { recursive: true })
  mkdirSync(path.join(rootDir, 'config'), { recursive: true })
  t.after(() => rmSync(rootDir, { recursive: true, force: true }))

  const limits = {
    totalBytes: 100_000,
    fileCount: 20,
    maxHtmlBytes: 10_000,
    maxJavaScriptBytes: 2_000,
    maxCssBytes: 2_000,
    maxRouteJavaScriptBytes: 2_000,
    maxRouteCssBytes: 2_000,
    ...overrides.limits,
  }
  const config = {
    schemaVersion: 1,
    outputDirectory: 'out',
    siteOrigin: 'https://example.com',
    warnAtPercent: 90,
    limits,
    routeAssetSamples: ['en.html'],
    secretScanExtensions: ['.css', '.js', '.txt', '.xml'],
    secretScanConcurrency: 2,
    ...overrides.config,
  }

  writeFileSync(path.join(rootDir, 'budgets.json'), JSON.stringify(config))
  writeFileSync(path.join(rootDir, 'config/static-artifact-budgets.json'), JSON.stringify(config))
  writeFileSync(
    path.join(outDir, 'en.html'),
    [
      '<!doctype html><html lang="en"><head>',
      '<title>Example page</title>',
      '<meta name="description" content="A useful test page.">',
      '<meta name="robots" content="index, follow">',
      '<link rel="canonical" href="https://example.com/en">',
      '<link href="/assets/app.css" rel="stylesheet">',
      '<script src="/assets/app.js"></script>',
      '</head><body><h1>Example</h1></body></html>',
    ].join(''),
  )
  writeFileSync(path.join(outDir, 'assets/app.css'), 'body { color: #123; }')
  writeFileSync(path.join(outDir, 'assets/app.js'), 'globalThis.example = true')
  writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      '<url><loc>https://example.com/en</loc>',
      '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en" />',
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en" />',
      '</url></urlset>',
    ].join(''),
  )
  writeFileSync(path.join(outDir, 'robots.txt'), 'User-Agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n')

  return { rootDir, outDir }
}

function writeLocalizedArticleFixture(outDir) {
  const articlePath = 'blog/architecture/static-seo'
  const articleUrls = {
    en: `https://example.com/en/${articlePath}`,
    vi: `https://example.com/vi/${articlePath}`,
    zh: `https://example.com/zh/${articlePath}`,
  }
  const alternateMarkup = [
    `<link rel="alternate" hreflang="en" href="${articleUrls.en}">`,
    `<link rel="alternate" hreflang="vi" href="${articleUrls.vi}">`,
    `<link rel="alternate" hreflang="x-default" href="${articleUrls.en}">`,
  ].join('')

  for (const locale of ['en', 'vi']) {
    const directory = path.join(outDir, locale, 'blog', 'architecture')
    mkdirSync(directory, { recursive: true })
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: locale === 'en' ? 'Static SEO' : 'SEO cho trang tĩnh',
      inLanguage: locale,
      url: articleUrls[locale],
      mainEntityOfPage: articleUrls[locale],
      datePublished: '2026-07-17',
      image: 'https://example.com/assets/static-seo.jpg',
      author: {
        '@type': 'Person',
        name: 'Example Author',
        url: 'https://example.com/en/about',
      },
    }
    writeFileSync(
      path.join(directory, 'static-seo.html'),
      [
        `<!doctype html><html lang="${locale}"><head>`,
        `<title>${articleLd.headline}</title>`,
        '<meta name="description" content="A localized static SEO article.">',
        `<link rel="canonical" href="${articleUrls[locale]}">`,
        alternateMarkup,
        '</head><body><article>',
        `<h1>${articleLd.headline}</h1>`,
        `<script type="application/ld+json">${JSON.stringify(articleLd)}</script>`,
        '</article></body></html>',
      ].join(''),
    )
  }

  const fallbackDirectory = path.join(outDir, 'zh', 'blog', 'architecture')
  mkdirSync(fallbackDirectory, { recursive: true })
  writeFileSync(
    path.join(fallbackDirectory, 'static-seo.html'),
    [
      '<!doctype html><html lang="zh"><head>',
      '<title>Static SEO</title>',
      '<meta name="description" content="Choose an available article language.">',
      `<link rel="canonical" href="${articleUrls.en}">`,
      '</head><body><main data-content-locale-fallback="true">',
      '<h1>Static SEO</h1><a href="/en/blog/architecture/static-seo">Read in English</a>',
      '</main></body></html>',
    ].join(''),
  )

  writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      '<url><loc>https://example.com/en</loc>',
      '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en" />',
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en" />',
      '</url>',
      ...['en', 'vi'].map(
        (locale) =>
          `<url><loc>${articleUrls[locale]}</loc>` +
          `<xhtml:link rel="alternate" hreflang="en" href="${articleUrls.en}" />` +
          `<xhtml:link rel="alternate" hreflang="vi" href="${articleUrls.vi}" />` +
          `<xhtml:link rel="alternate" hreflang="x-default" href="${articleUrls.en}" />` +
          '</url>',
      ),
      '</urlset>',
    ].join(''),
  )

  return articleUrls
}

function writeStudioFixture(outDir, { broken = false } = {}) {
  const studioUrl = 'https://example.com/en/studio'
  const moduleUrls = [
    'https://example.com/en/studio?route=ai-skills#ai-skills',
    'https://example.com/en/studio?route=delivery-checklists#delivery-checklists',
  ]
  const structuredUrls = broken ? [moduleUrls[0]] : moduleUrls
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${studioUrl}#studio`,
    name: 'Engineering Studio',
    description: 'A useful public engineering workspace.',
    url: studioUrl,
    inLanguage: 'en',
    hasPart: structuredUrls.map((url, index) => ({
      '@type': 'CreativeWork',
      name: index === 0 ? 'AI skills' : 'Delivery checklists',
      url,
    })),
  }

  mkdirSync(path.join(outDir, 'en'), { recursive: true })
  writeFileSync(
    path.join(outDir, 'en/studio.html'),
    [
      '<!doctype html><html lang="en"><head>',
      '<title>Engineering Studio</title>',
      '<meta name="description" content="A useful public engineering workspace.">',
      broken ? '' : '<meta property="og:image" content="https://example.com/en/opengraph-image.png">',
      broken ? '' : '<meta name="twitter:image" content="https://example.com/en/opengraph-image.png">',
      `<link rel="canonical" href="${studioUrl}">`,
      '</head><body>',
      `<main${broken ? '' : ' data-studio-static-overview="true"'}>`,
      '<h1>Engineering Studio</h1>',
      broken ? '<h1>Duplicate heading</h1>' : '',
      '<a data-studio-module-link="ai-skills" href="/en/studio?route=ai-skills#ai-skills">AI skills</a>',
      '<a data-studio-module-link="delivery-checklists" href="/en/studio?route=delivery-checklists#delivery-checklists">Delivery checklists</a>',
      '</main>',
      `<script type="application/ld+json">${JSON.stringify(collectionPage)}</script>`,
      '</body></html>',
    ].join(''),
  )
  if (!broken) writeFileSync(path.join(outDir, 'en/opengraph-image.png'), ONE_PIXEL_PNG)

  const sitemapPath = path.join(outDir, 'sitemap.xml')
  const sitemap = readFileSync(sitemapPath, 'utf8')
  writeFileSync(
    sitemapPath,
    sitemap.replace(
      '</urlset>',
      `<url><loc>${studioUrl}</loc><xhtml:link rel="alternate" hreflang="en" href="${studioUrl}" /><xhtml:link rel="alternate" hreflang="x-default" href="${studioUrl}" /></url></urlset>`,
    ),
  )
}

const GENERIC_SEO_LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const GENERIC_SEO_ROUTES = {
  about: { type: 'AboutPage', fragment: 'aboutpage' },
  apps: { type: 'ItemList', fragment: 'itemlist' },
  gallery: { type: 'ImageGallery', fragment: 'gallery' },
  studio: { type: 'CollectionPage', fragment: 'studio' },
}

function writeLocalizedGenericSeoFixtures(outDir) {
  const sitemapEntries = []

  for (const locale of GENERIC_SEO_LOCALES) {
    for (const [route, contract] of Object.entries(GENERIC_SEO_ROUTES)) {
      const pageUrl = `https://example.com/${locale}/${route}`
      const pageLd = {
        '@context': 'https://schema.org',
        '@type': contract.type,
        '@id': `${pageUrl}#${contract.fragment}`,
        name: `${route} ${locale}`,
        description: `Localized ${route} page for ${locale}.`,
        url: pageUrl,
      }
      const isStudio = route === 'studio'
      if (isStudio) {
        pageLd.hasPart = [
          {
            '@type': 'CreativeWork',
            '@id': `${pageUrl}?route=ai-skills#ai-skills`,
            name: 'AI skills',
            url: `${pageUrl}?route=ai-skills#ai-skills`,
          },
        ]
      }

      mkdirSync(path.join(outDir, locale), { recursive: true })
      writeFileSync(
        path.join(outDir, locale, `${route}.html`),
        [
          `<!doctype html><html lang="${locale}"><head>`,
          `<title>${route} ${locale}</title>`,
          `<meta name="description" content="Localized ${route} page for ${locale}.">`,
          `<meta property="og:url" content="${pageUrl}">`,
          isStudio
            ? '<meta property="og:image" content="https://example.com/opengraph-image.png">'
            : '',
          isStudio
            ? '<meta name="twitter:image" content="https://example.com/opengraph-image.png">'
            : '',
          `<link rel="canonical" href="${pageUrl}">`,
          '</head><body>',
          isStudio ? '<main data-studio-static-overview="true">' : '<main>',
          `<h1>${route} ${locale}</h1>`,
          isStudio
            ? `<a data-studio-module-link="ai-skills" href="/${locale}/studio?route=ai-skills#ai-skills">AI skills</a>`
            : '',
          '</main>',
          // Shared entity schemas intentionally prove the verifier selects the
          // route-owned page object instead of rejecting valid multi-schema HTML.
          '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","@id":"https://example.com/#person","url":"https://example.com/en/about"}</script>',
          `<script type="application/ld+json">${JSON.stringify(pageLd)}</script>`,
          '</body></html>',
        ].join(''),
      )
      sitemapEntries.push(
        `<url><loc>${pageUrl}</loc><xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/${route}" /></url>`,
      )
    }
  }

  writeFileSync(path.join(outDir, 'opengraph-image.png'), ONE_PIXEL_PNG)
  const sitemapPath = path.join(outDir, 'sitemap.xml')
  writeFileSync(
    sitemapPath,
    readFileSync(sitemapPath, 'utf8').replace('</urlset>', `${sitemapEntries.join('')}</urlset>`),
  )
}

function writeMediaPublicationFixture(rootDir) {
  mkdirSync(path.join(rootDir, 'content/blog-data'), { recursive: true })
  mkdirSync(path.join(rootDir, 'content/notes-data'), { recursive: true })
  writeFileSync(
    path.join(rootDir, 'config/media-publication.json'),
    JSON.stringify({
      schemaVersion: 1,
      remoteTreeUrl: 'https://api.example.com/tree',
      liveBaseUrl: 'https://example.com/dom-pub/icdn',
      articleOg: {
        blog: {
          sourceIndex: 'content/blog-data/_index.json',
          sourceDirectory: 'public/og/blog',
          sourceExtension: '.png',
          publicPathPrefix: '/og/blogs',
          publicationDirectory: 'og/blogs',
          publicationExtension: '.jpg',
          publicationFormat: 'jpeg',
          prunePolicy: { maxDeleteCount: 20, maxDeletePercent: 100 },
        },
        notes: {
          sourceIndex: 'content/notes-data/_index.json',
          sourceDirectory: 'public/og/notes',
          sourceExtension: '.png',
          publicPathPrefix: '/og/notes',
          publicationDirectory: 'og/notes',
          publicationExtension: '.jpg',
          publicationFormat: 'jpeg',
          prunePolicy: { maxDeleteCount: 20, maxDeletePercent: 100 },
        },
      },
    }),
  )
  writeFileSync(
    path.join(rootDir, 'config/media-publication-public.json'),
    JSON.stringify({
      schemaVersion: 1,
      articleOg: {
        blog: {
          localPathPrefix: '/og/blog',
          publicPathPrefix: '/og/blogs',
          publicationExtension: '.jpg',
        },
        notes: {
          localPathPrefix: '/og/notes',
          publicPathPrefix: '/og/notes',
          publicationExtension: '.jpg',
        },
      },
    }),
  )
  writeFileSync(
    path.join(rootDir, 'content/blog-data/_index.json'),
    JSON.stringify({ posts: [{ slug: 'static', date: '2020-01-01' }] }),
  )
  writeFileSync(path.join(rootDir, 'content/notes-data/_index.json'), JSON.stringify({ posts: [] }))
}

test('verifies artifact budgets, sitemap canonicals, robots, and public secrets', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(path.join(outDir, 'google-site-verification.html'), 'google-site-verification: fixture')
  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
  assert.equal(report.seo.urlCount, 1)
  assert.equal(report.secrets.matches.length, 0)
  assert.equal(report.secrets.privateQueryUrlMatches.length, 0)
  assert.equal(report.secrets.scanConcurrency, 2)
  assert.equal(report.artifact.largestRouteJavaScript[0].path, 'en.html')
})

test('fails closed when any emitted path contains a Heartbeats route segment', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const privateRouteDirectory = path.join(outDir, 'en', 'heartbeats')
  mkdirSync(privateRouteDirectory, { recursive: true })
  writeFileSync(path.join(privateRouteDirectory, 'route-data.bin'), Buffer.from([0x00]))

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.privacy.forbiddenRouteMatches, [
    { path: 'en/heartbeats/route-data.bin', segment: 'heartbeats' },
  ])
  assert.match(
    report.failures.join('\n'),
    /Forbidden private route segment "heartbeats" is present in public artifact: en\/heartbeats\/route-data\.bin/,
  )
})

test('fails closed when generated pages, route payloads, manifests, or service workers reference Heartbeats', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'en.html'),
    readFileSync(path.join(outDir, 'en.html'), 'utf8').replace(
      '</body>',
      '<a href="/en/heartbeats">private</a></body>',
    ),
  )
  writeFileSync(path.join(outDir, 'route-data.txt'), 'route=/en/heartbeats.txt')
  writeFileSync(path.join(outDir, 'route-data.rsc'), 'route=/en/%68eartbeats')
  writeFileSync(
    path.join(outDir, 'manifest.webmanifest'),
    JSON.stringify({ start_url: '%252Fen%252Fheartbeats' }),
  )
  writeFileSync(
    path.join(outDir, 'sw.js'),
    '/* malformed entity must not crash the scan: &#9999999; */ cache.add("\\u002fen\\u002fheartbeats")',
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.privacy.forbiddenRouteReferenceMatches, [
    { path: 'en.html', segment: 'heartbeats' },
    { path: 'manifest.webmanifest', segment: 'heartbeats' },
    { path: 'route-data.rsc', segment: 'heartbeats' },
    { path: 'route-data.txt', segment: 'heartbeats' },
    { path: 'sw.js', segment: 'heartbeats' },
  ])
  for (const relativePath of [
    'en.html',
    'manifest.webmanifest',
    'route-data.rsc',
    'route-data.txt',
    'sw.js',
  ]) {
    assert.match(
      report.failures.join('\n'),
      new RegExp(
        `Forbidden private route reference "heartbeats" is present in public artifact content: ${relativePath.replace('.', '\\.')}`,
      ),
    )
  }
})

test('fails closed when raw authored corpus paths or runtime references reach the artifact', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const rawDirectory = path.join(outDir, 'blog-data', 'posts')
  mkdirSync(rawDirectory, { recursive: true })
  writeFileSync(
    path.join(rawDirectory, 'leaked.json'),
    JSON.stringify({ slug: 'leaked', html: '<p>raw body</p>' }),
  )
  writeFileSync(
    path.join(outDir, 'assets/app.js'),
    'fetch("/notes-data/posts/leaked.json")',
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.ok(
    report.privacy.forbiddenRouteMatches.some(
      (match) => match.segment === 'blog-data' && match.path === 'blog-data/posts/leaked.json',
    ),
  )
  assert.ok(
    report.privacy.forbiddenRouteReferenceMatches.some(
      (match) => match.segment === 'notes-data' && match.path === 'assets/app.js',
    ),
  )
  assert.match(report.failures.join('\n'), /blog-data\/posts\/leaked\.json/)
  assert.match(report.failures.join('\n'), /notes-data.*assets\/app\.js/)
})

test('fails closed when scheduled or draft metadata is serialized under an unrelated path', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  writeFileSync(
    path.join(rootDir, 'content/blog-data/_index.json'),
    JSON.stringify({
      posts: [
        { slug: 'released', category: 'architecture', date: '2026-07-19' },
        { slug: 'scheduled-secret', category: 'architecture', date: '2999-01-01' },
        {
          slug: 'draft-secret',
          category: 'architecture',
          date: '2020-01-01',
          status: 'draft',
        },
      ],
    }),
  )
  writeFileSync(
    path.join(outDir, 'assets/app.js'),
    JSON.stringify({
      slug: 'scheduled-secret',
      category: 'architecture',
      html: '<p>unreleased body</p>',
    }),
  )
  writeFileSync(
    path.join(outDir, 'en.html'),
    readFileSync(path.join(outDir, 'en.html'), 'utf8').replace(
      '</body>',
      '<a href="/en/blog/architecture/draft-secret">draft</a></body>',
    ),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.privacy.unpublishedContentReferenceMatches, [
    { path: 'assets/app.js', slug: 'scheduled-secret', surface: 'blog' },
    { path: 'en.html', slug: 'draft-secret', surface: 'blog' },
  ])
  assert.match(report.failures.join('\n'), /scheduled-secret/)
  assert.match(report.failures.join('\n'), /draft-secret/)
})

test('route-only leaks accept static extensions without matching longer slug substrings', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  writeFileSync(
    path.join(rootDir, 'content/blog-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'route-blog-secret', category: 'architecture', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(rootDir, 'content/notes-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'route-note-secret', topic: 'thoughts', date: '2999-01-01' }],
    }),
  )
  const clientPath = path.join(outDir, 'assets/app.js')
  writeFileSync(
    clientPath,
    [
      '"/en/blog/architecture/route-blog-secret-extra.html"',
      '"/vi/notes/route-note-secret-copy.txt"',
      '"/notes/route-note-secret.htmlish"',
    ].join(','),
  )

  const decoys = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.deepEqual(decoys.privacy.unpublishedContentReferenceMatches, [])

  writeFileSync(
    clientPath,
    [
      '"/en/blog/architecture/route-blog-secret.html"',
      '"/blog/architecture/route-blog-secret.txt?segment=1"',
      '"/vi/notes/route-note-secret.rsc"',
      '"/notes/route-note-secret.json#payload"',
    ].join(','),
  )
  const leaks = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.deepEqual(leaks.privacy.unpublishedContentReferenceMatches, [
    { path: 'assets/app.js', slug: 'route-blog-secret', surface: 'blog' },
    { path: 'assets/app.js', slug: 'route-note-secret', surface: 'notes' },
  ])
})

test('topic-less and category-less unpublished metadata fail closed on exact slug tokens', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  writeFileSync(
    path.join(rootDir, 'content/blog-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'categoryless-blog-secret', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(rootDir, 'content/notes-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'topicless-note-secret', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(outDir, 'assets/app.js'),
    JSON.stringify([
      { slug: 'categoryless-blog-secret', html: '<p>unreleased blog post</p>' },
      { slug: 'topicless-note-secret', html: '<p>unreleased note</p>' },
    ]),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.privacy.unpublishedContentReferenceMatches, [
    { path: 'assets/app.js', slug: 'categoryless-blog-secret', surface: 'blog' },
    { path: 'assets/app.js', slug: 'topicless-note-secret', surface: 'notes' },
  ])
})

test('exact slug tokens survive nested, escaped metadata records larger than 16 KiB', async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    limits: { maxJavaScriptBytes: 100_000, totalBytes: 200_000 },
  })
  writeMediaPublicationFixture(rootDir)
  writeFileSync(
    path.join(rootDir, 'content/blog-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'long-blog-secret', category: 'architecture', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(rootDir, 'content/notes-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'long-note-secret', topic: 'thoughts', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(outDir, 'assets/app.js'),
    JSON.stringify({
      nested: {
        slug: 'long-blog-secret',
        category: 'architecture',
        html: `<p>${'b'.repeat(20_000)}</p>`,
      },
      escaped: JSON.stringify({
        slug: 'long-note-secret',
        topic: 'thoughts',
        html: `<p>${'n'.repeat(20_000)}</p>`,
      }),
    }),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.privacy.unpublishedContentReferenceMatches, [
    { path: 'assets/app.js', slug: 'long-blog-secret', surface: 'blog' },
    { path: 'assets/app.js', slug: 'long-note-secret', surface: 'notes' },
  ])
})

test('reports near-limit warnings against the configured artifact budget', async (t) => {
  const { rootDir } = createFixture(t, { config: { warnAtPercent: 1 } })

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.ok(report.warnings.some((warning) => warning.endsWith('of its configured limit')))
  assert.doesNotMatch(report.warnings.join('\n'), /Phase 1/)
})

test('accepts a no-JavaScript Studio overview whose module links match CollectionPage data', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeStudioFixture(outDir)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
})

test('rejects blank or duplicate-heading Studio HTML and structured-data link drift', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeStudioFixture(outDir, { broken: true })

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /must export a no-JavaScript static overview/)
  assert.match(failures, /must export Open Graph and Twitter images/)
  assert.match(failures, /must contain exactly one H1; found 2/)
  assert.match(failures, /hasPart URLs do not match visible module links/)
})

test('validates localized canonical, Open Graph, and page JSON-LD identity across generic routes', async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    limits: { fileCount: 100 },
    config: {
      seo: {
        locales: GENERIC_SEO_LOCALES,
        requiredLocalizedRoutes: Object.keys(GENERIC_SEO_ROUTES),
      },
    },
  })
  writeLocalizedGenericSeoFixtures(outDir)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
  assert.equal(report.seo.localSocialImageCount, GENERIC_SEO_LOCALES.length * 2)
})

test('rejects unlocalized generic page identities and a non-root Studio social image', async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    limits: { fileCount: 100 },
    config: {
      seo: {
        locales: GENERIC_SEO_LOCALES,
        requiredLocalizedRoutes: Object.keys(GENERIC_SEO_ROUTES),
      },
    },
  })
  writeLocalizedGenericSeoFixtures(outDir)

  const replaceInFixture = (relativePath, search, replacement) => {
    const fixturePath = path.join(outDir, relativePath)
    writeFileSync(fixturePath, readFileSync(fixturePath, 'utf8').replace(search, replacement))
  }
  replaceInFixture(
    'vi/about.html',
    '<meta property="og:url" content="https://example.com/vi/about">',
    '<meta property="og:url" content="https://example.com/about">',
  )
  replaceInFixture(
    'zh/apps.html',
    'https://example.com/zh/apps#itemlist',
    'https://example.com/apps#itemlist',
  )
  replaceInFixture(
    'ja/gallery.html',
    '"url":"https://example.com/ja/gallery"',
    '"url":"https://example.com/gallery"',
  )
  replaceInFixture(
    'ko/studio.html',
    'https://example.com/opengraph-image.png',
    'https://example.com/ko/opengraph-image.png',
  )
  replaceInFixture(
    'fr/studio.html',
    '<link rel="canonical" href="https://example.com/fr/studio">',
    '<link rel="canonical" href="https://example.com/en/studio">',
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /vi\/about\.html og:url must match localized page identity/)
  assert.match(failures, /zh\/apps\.html ItemList @id must match localized page identity/)
  assert.match(failures, /ja\/gallery\.html ImageGallery url must match localized page identity/)
  assert.match(failures, /ko\/studio\.html Studio og:image must resolve to the root opengraph-image\.png/)
  assert.match(failures, /fr\/studio\.html canonical must match localized page identity/)
})

test('requires local social images to have an emitted image file and matching signature', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const htmlPath = path.join(outDir, 'en.html')
  const html = readFileSync(htmlPath, 'utf8').replace(
    '</head>',
    [
      '<meta property="og:image" content="https://example.com/opengraph-image-hashed?revision">',
      '<meta property="og:image" content="https://example.com/missing-social-image.png">',
      '<meta name="twitter:image" content="/twitter-image.png">',
      '</head>',
    ].join(''),
  )
  writeFileSync(htmlPath, html)
  writeFileSync(path.join(outDir, 'opengraph-image-hashed'), ONE_PIXEL_PNG)
  writeFileSync(path.join(outDir, 'twitter-image.png'), 'not a png')

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /og:image must use a supported image extension/)
  assert.match(failures, /og:image references a missing local image/)
  assert.match(failures, /twitter:image extension does not match its image signature/)
})

test('allows only manifest-declared same-origin remote social image publications', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  const htmlPath = path.join(outDir, 'en.html')
  const html = readFileSync(htmlPath, 'utf8').replace(
    '</head>',
    '<meta property="og:image" content="https://example.com/dom-pub/icdn/og/blogs/static.jpg"></head>',
  )
  writeFileSync(htmlPath, html)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
})

test('rejects undeclared images under the same-origin publication namespace', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  const htmlPath = path.join(outDir, 'en.html')
  const html = readFileSync(htmlPath, 'utf8').replace(
    '</head>',
    '<meta property="og:image" content="https://example.com/dom-pub/icdn/og/blogs/not-declared.jpg"></head>',
  )
  writeFileSync(htmlPath, html)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.match(
    report.failures.join('\n'),
    /og:image is not declared by the media publication contract/,
  )
})

test('rejects arbitrary external-origin social images outside the publication manifest', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  const htmlPath = path.join(outDir, 'en.html')
  const html = readFileSync(htmlPath, 'utf8').replace(
    '</head>',
    '<meta property="og:image" content="https://images.example.net/arbitrary.jpg"></head>',
  )
  writeFileSync(htmlPath, html)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.match(
    report.failures.join('\n'),
    /og:image remote URL is not declared by the media publication contract: https:\/\/images\.example\.net\/arbitrary\.jpg/,
  )
})

test('requires an exact manifest URL without undeclared query or fragment suffixes', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  const htmlPath = path.join(outDir, 'en.html')
  const html = readFileSync(htmlPath, 'utf8').replace(
    '</head>',
    '<meta property="og:image" content="https://example.com/dom-pub/icdn/og/blogs/static.jpg?variant=unreviewed"></head>',
  )
  writeFileSync(htmlPath, html)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.match(
    report.failures.join('\n'),
    /og:image is not declared by the media publication contract/,
  )
})

test('reports budget growth and a sitemap canonical mismatch', async (t) => {
  const { rootDir } = createFixture(t, { limits: { fileCount: 4 } })
  const htmlPath = path.join(rootDir, 'out/en.html')
  const html = '<html lang="en"><head><title>Wrong</title><meta name="description" content="Wrong canonical"><link rel="canonical" href="https://example.com/wrong"></head></html>'
  writeFileSync(htmlPath, html)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.ok(report.failures.some((failure) => failure.startsWith('Artifact file count is')))
  assert.ok(report.failures.some((failure) => failure.includes('does not match sitemap URL')))
})

test('reports high-confidence secrets from Next RSC text without echoing their values', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const secret = `AKIA${'A'.repeat(16)}`
  writeFileSync(path.join(outDir, 'en.rsc.txt'), `1:["$","payload",null,{"key":"${secret}"}]`)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const joinedFailures = report.failures.join('\n')

  assert.match(joinedFailures, /Potential AWS access key/)
  assert.doesNotMatch(joinedFailures, new RegExp(secret))
})

test('requires a complete credible PEM block and scans public HTML', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(path.join(outDir, 'header-only.txt'), '-----BEGIN PRIVATE KEY-----')

  const headerOnlyReport = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.doesNotMatch(headerOnlyReport.failures.join('\n'), /Potential private key/)

  writeFileSync(
    path.join(outDir, 'leak.html'),
    `<!doctype html><html><body>-----BEGIN PRIVATE KEY-----\n${'A'.repeat(64)}\n-----END PRIVATE KEY-----</body></html>`,
  )
  const completeBlockReport = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.match(completeBlockReport.failures.join('\n'), /Potential private key is present.*leak\.html/)
})

test('scans escaped Firebase PEM and private R2 assignments across deployable config formats', async (t) => {
  const { rootDir, outDir } = createFixture(t, { limits: { fileCount: 30 } })
  const pem = `-----BEGIN PRIVATE KEY-----\n${'B'.repeat(64)}\n-----END PRIVATE KEY-----`
  const r2Secret = 'r2PrivateCredential0123456789abcdef'
  const firebaseSecret = 'firebaseAdminCredential0123456789'

  writeFileSync(path.join(outDir, 'firebase-admin.json'), JSON.stringify({ private_key: pem }))
  writeFileSync(path.join(outDir, 'worker.env'), `R2_SECRET_ACCESS_KEY=${r2Secret}\n`)
  writeFileSync(path.join(outDir, '.env.production'), `FIREBASE_PRIVATE_KEY=${firebaseSecret}\n`)
  writeFileSync(path.join(outDir, 'runtime-secrets'), JSON.stringify({ R2_SECRET_ACCESS_KEY: r2Secret }))
  writeFileSync(path.join(outDir, 'service.pem'), pem)
  writeFileSync(path.join(outDir, 'service.key'), pem)
  writeFileSync(path.join(outDir, 'worker.yaml'), `"R2_SECRET_ACCESS_KEY": "${r2Secret}"\n`)
  writeFileSync(path.join(outDir, 'firebase.yml'), `FIREBASE_ADMIN_PRIVATE_KEY: ${firebaseSecret}\n`)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const joinedFailures = report.failures.join('\n')

  for (const expectedPath of [
    'firebase-admin.json',
    'worker.env',
    '.env.production',
    'runtime-secrets',
    'service.pem',
    'service.key',
    'worker.yaml',
    'firebase.yml',
  ]) {
    assert.match(joinedFailures, new RegExp(expectedPath.replace('.', '\\.')))
  }
  assert.doesNotMatch(joinedFailures, new RegExp(r2Secret))
  assert.doesNotMatch(joinedFailures, new RegExp(firebaseSecret))
})

test('allows Firebase public web configuration while rejecting only private credentials', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'public-firebase.env'),
    [
      'NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyPublicWebIdentifier123456789',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=example.firebaseapp.com',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID=example-public-project',
    ].join('\n'),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.equal(report.secrets.matches.some(({ path: matchPath }) => matchPath === 'public-firebase.env'), false)
})

test('rejects case-insensitive and encoded signed URLs in public HTML, RSC, and JSON', async (t) => {
  const { rootDir, outDir } = createFixture(t, { limits: { fileCount: 20 } })
  const fixtures = {
    'signed.html': '<img src="https://r2.example/private.webp?X-Amz-Signature=do-not-log">',
    'encoded.rsc.txt': '1:["https://storage.example/private.webp?x%252DgOoG%252DcReDeNtIaL=do-not-log"]',
    'payload.json': JSON.stringify({
      src: 'https://cdn.example/private.webp?width=800&ACCESS_TOKEN=do-not-log',
    }),
  }

  for (const [name, content] of Object.entries(fixtures)) {
    writeFileSync(path.join(outDir, name), content)
  }

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  for (const name of Object.keys(fixtures)) assert.match(failures, new RegExp(name.replace('.', '\\.')))
  assert.equal(report.secrets.privateQueryUrlMatches.length, 3)
  assert.doesNotMatch(failures, /do-not-log/)
})

test('allows normal third-party query URLs in public artifacts', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'public-links.json'),
    JSON.stringify({ src: 'https://images.example/public.webp?width=800&format=webp' }),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.equal(report.secrets.privateQueryUrlMatches.length, 0)
  assert.doesNotMatch(report.failures.join('\n'), /Signed or private query URL/)
})

test('requires every indexable self-canonical HTML page to appear in sitemap', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'extra.html'),
    [
      '<!doctype html><html lang="en"><head>',
      '<title>Extra page</title>',
      '<meta name="description" content="A second indexable page.">',
      '<link rel="canonical" href="https://example.com/extra">',
      '</head><body></body></html>',
    ].join(''),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.match(report.failures.join('\n'), /extra\.html is self-canonical and indexable but missing from sitemap/)
})

test('rejects missing, invalid, and multiple canonicals on every indexable HTML page', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const page = (canonicalMarkup) =>
    [
      '<!doctype html><html lang="en"><head>',
      '<title>Indexable page</title>',
      '<meta name="description" content="Canonical parity fixture.">',
      canonicalMarkup,
      '</head><body></body></html>',
    ].join('')

  writeFileSync(path.join(outDir, 'missing.html'), page(''))
  writeFileSync(path.join(outDir, 'invalid.html'), page('<link rel="canonical" href="not a URL">'))
  writeFileSync(
    path.join(outDir, 'multiple.html'),
    page(
      '<link rel="canonical" href="https://example.com/one"><link rel="canonical" href="https://example.com/two">',
    ),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /missing\.html is indexable but must contain exactly one canonical URL; found 0/)
  assert.match(failures, /invalid\.html is indexable but has an invalid canonical URL/)
  assert.match(failures, /multiple\.html is indexable but must contain exactly one canonical URL; found 2/)
})

test('ignores environment attempts to redirect the default verifier config or out directory', async (t) => {
  const { rootDir } = createFixture(t)
  writeFileSync(
    path.join(rootDir, 'bypass.json'),
    JSON.stringify({ schemaVersion: 1, outputDirectory: 'bypass-out' }),
  )
  const previousConfig = process.env.STATIC_ARTIFACT_BUDGET_CONFIG
  const previousOutput = process.env.STATIC_ARTIFACT_OUTPUT_DIR
  process.env.STATIC_ARTIFACT_BUDGET_CONFIG = 'bypass.json'
  process.env.STATIC_ARTIFACT_OUTPUT_DIR = 'bypass-out'
  t.after(() => {
    if (previousConfig === undefined) delete process.env.STATIC_ARTIFACT_BUDGET_CONFIG
    else process.env.STATIC_ARTIFACT_BUDGET_CONFIG = previousConfig
    if (previousOutput === undefined) delete process.env.STATIC_ARTIFACT_OUTPUT_DIR
    else process.env.STATIC_ARTIFACT_OUTPUT_DIR = previousOutput
  })

  const report = await verifyStaticArtifact({ rootDir })
  assert.equal(report.artifact.outputDirectory, 'out')
  assert.deepEqual(report.failures, [])
  await assert.rejects(
    verifyStaticArtifact({ rootDir, configPath: 'bypass.json' }),
    /Artifact budget config must verify out; received bypass-out/,
  )
})

test('requires configured core routes for every supported locale', async (t) => {
  const { rootDir } = createFixture(t, {
    config: {
      seo: {
        locales: ['en', 'vi'],
        requiredLocalizedRoutes: [''],
      },
    },
  })

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.match(report.failures.join('\n'), /missing required localized route: https:\/\/example\.com\/vi/)
})

test('verifies localized Article schema, reciprocal hreflang, and lightweight fallback HTML', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeLocalizedArticleFixture(outDir)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
  assert.equal(report.seo.urlCount, 3)
})

test('rejects noindex, hreflang, and Article schema on a locale fallback route', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const articleUrls = writeLocalizedArticleFixture(outDir)
  const fallbackPath = path.join(outDir, 'zh/blog/architecture/static-seo.html')
  writeFileSync(
    fallbackPath,
    [
      '<!doctype html><html lang="zh"><head><title>Static SEO</title>',
      '<meta name="description" content="Invalid fallback metadata.">',
      '<meta name="robots" content="noindex, follow">',
      `<link rel="canonical" href="${articleUrls.en}">`,
      `<link rel="alternate" hreflang="en" href="${articleUrls.en}">`,
      '</head><body><main data-content-locale-fallback="true">',
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Static SEO',
        inLanguage: 'en',
        url: articleUrls.en,
        mainEntityOfPage: articleUrls.en,
        datePublished: '2026-07-17',
        image: 'https://example.com/assets/static-seo.jpg',
      })}</script>`,
      '</main></body></html>',
    ].join(''),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /canonical consolidation without noindex/)
  assert.match(failures, /fallback URL must not emit hreflang alternates/)
  assert.match(failures, /fallback notice must not emit Article structured data/)
})

test('does not classify paginated blog or notes archives as articles', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const routes = ['en/blog/page/2', 'en/notes/page/2']

  for (const route of routes) {
    const directory = path.join(outDir, path.dirname(route))
    mkdirSync(directory, { recursive: true })
    const url = `https://example.com/${route}`
    writeFileSync(
      path.join(outDir, `${route}.html`),
      [
        '<!doctype html><html lang="en"><head>',
        '<title>Archive page two</title>',
        '<meta name="description" content="A crawlable archive page.">',
        `<link rel="canonical" href="${url}">`,
        `<link rel="alternate" hreflang="en" href="${url}">`,
        `<link rel="alternate" hreflang="x-default" href="${url}">`,
        '</head><body><main><h1>Archive</h1></main></body></html>',
      ].join(''),
    )
  }

  writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      ...['https://example.com/en', ...routes.map((route) => `https://example.com/${route}`)].map(
        (url) =>
          `<url><loc>${url}</loc>` +
          `<xhtml:link rel="alternate" hreflang="en" href="${url}" />` +
          `<xhtml:link rel="alternate" hreflang="x-default" href="${url}" />` +
          '</url>',
      ),
      '</urlset>',
    ].join(''),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.deepEqual(report.failures, [])
})
