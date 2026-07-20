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

function writeLocalizedArticleFixture(
  outDir,
  {
    author = {
      '@type': 'Person',
      name: 'Example Author',
      url: 'https://example.com/en/about',
    },
    omitAuthor = false,
    visibleTitle,
    documentTitle,
    schemaHeadline,
  } = {},
) {
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
    const localizedTitle = visibleTitle ?? (locale === 'en' ? 'Static SEO' : 'SEO cho trang tĩnh')
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: schemaHeadline ?? localizedTitle,
      inLanguage: locale,
      url: articleUrls[locale],
      mainEntityOfPage: articleUrls[locale],
      datePublished: '2026-07-17',
      image: 'https://example.com/assets/static-seo.jpg',
      ...(omitAuthor ? {} : { author }),
    }
    writeFileSync(
      path.join(directory, 'static-seo.html'),
      [
        `<!doctype html><html lang="${locale}"><head>`,
        `<title>${documentTitle ?? localizedTitle}</title>`,
        '<meta name="description" content="A localized static SEO article.">',
        `<link rel="canonical" href="${articleUrls[locale]}">`,
        alternateMarkup,
        '</head><body><article>',
        `<h1>${localizedTitle}</h1>`,
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

const STATIC_PAGE_SEO_POLICY = {
  about: {
    type: 'AboutPage',
    fragment: 'aboutpage',
    contentLocales: ['en', 'vi'],
  },
  apps: {
    type: 'ItemList',
    fragment: 'itemlist',
    contentLocales: ['en', 'vi'],
  },
  gallery: {
    type: 'ImageGallery',
    fragment: 'gallery',
    contentLocales: GENERIC_SEO_LOCALES,
  },
}

const STATIC_PAGE_OG_LOCALES = {
  en: 'en_US',
  vi: 'vi_VN',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  fr: 'fr_FR',
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

function writeStaticPageSeoPolicyFixtures(outDir) {
  const sitemapEntries = []

  for (const [route, policy] of Object.entries(STATIC_PAGE_SEO_POLICY)) {
    const htmlAlternates = policy.contentLocales
      .map(
        (locale) =>
          `<link rel="alternate" hreflang="${locale}" href="https://example.com/${locale}/${route}">`,
      )
      .concat(
        `<link rel="alternate" hreflang="x-default" href="https://example.com/en/${route}">`,
      )
      .join('')
    const sitemapAlternates = policy.contentLocales
      .map(
        (locale) =>
          `<xhtml:link rel="alternate" hreflang="${locale}" href="https://example.com/${locale}/${route}" />`,
      )
      .concat(
        `<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/${route}" />`,
      )
      .join('')

    for (const routeLocale of GENERIC_SEO_LOCALES) {
      const authored = policy.contentLocales.includes(routeLocale)
      const contentLocale = authored ? routeLocale : 'en'
      const canonical = `https://example.com/${contentLocale}/${route}`
      const title = `${route} title ${contentLocale}`
      const description = `${route} description ${contentLocale}`
      const alternateOgLocales = authored
        ? policy.contentLocales
            .filter((locale) => locale !== contentLocale)
            .map(
              (locale) =>
                `<meta property="og:locale:alternate" content="${STATIC_PAGE_OG_LOCALES[locale]}">`,
            )
            .join('')
        : ''
      const pageLd = {
        '@context': 'https://schema.org',
        '@type': policy.type,
        '@id': `${canonical}#${policy.fragment}`,
        name: title,
        description,
        inLanguage: contentLocale,
        url: canonical,
        ...(route === 'apps' ? { itemListElement: [] } : {}),
      }

      mkdirSync(path.join(outDir, routeLocale), { recursive: true })
      writeFileSync(
        path.join(outDir, routeLocale, `${route}.html`),
        [
          `<!doctype html><html lang="${routeLocale}"><head>`,
          `<title>${title}</title>`,
          `<meta name="description" content="${description}">`,
          `<meta name="robots" content="${authored ? 'index, follow' : 'noindex, follow'}">`,
          `<meta name="googlebot" content="${authored ? 'index, follow' : 'noindex, follow'}">`,
          `<meta property="og:title" content="${title}">`,
          `<meta property="og:description" content="${description}">`,
          `<meta property="og:url" content="${canonical}">`,
          `<meta property="og:locale" content="${STATIC_PAGE_OG_LOCALES[contentLocale]}">`,
          alternateOgLocales,
          `<meta name="twitter:title" content="${title}">`,
          `<meta name="twitter:description" content="${description}">`,
          `<link rel="canonical" href="${canonical}">`,
          authored ? htmlAlternates : '',
          '</head><body>',
          `<main${authored ? '' : ` lang="${contentLocale}"`}>`,
          `<h1>${title}</h1>`,
          `<script type="application/ld+json">${JSON.stringify(pageLd)}</script>`,
          '</main></body></html>',
        ].join(''),
      )

      if (authored) {
        sitemapEntries.push(
          `<url><loc>https://example.com/${routeLocale}/${route}</loc>${sitemapAlternates}</url>`,
        )
      }
    }
  }

  const sitemapPath = path.join(outDir, 'sitemap.xml')
  writeFileSync(
    sitemapPath,
    readFileSync(sitemapPath, 'utf8').replace(
      '</urlset>',
      `${sitemapEntries.join('')}</urlset>`,
    ),
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

test('curated hub route segments do not masquerade as unpublished article references', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeMediaPublicationFixture(rootDir)
  writeFileSync(
    path.join(rootDir, 'content/blog-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'foundations', category: 'architecture', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(rootDir, 'content/notes-data/_index.json'),
    JSON.stringify({
      posts: [{ slug: 'thoughts', topic: 'thoughts', date: '2999-01-01' }],
    }),
  )
  writeFileSync(
    path.join(outDir, 'assets/app.js'),
    [
      '"/en/blog/series/foundations"',
      '"/vi/blog/series/foundations/page/2"',
      '"/en/notes/topics/thoughts"',
      '"/vi/notes/topics/thoughts/page/5"',
    ].join(','),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  assert.deepEqual(report.privacy.unpublishedContentReferenceMatches, [])
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

test('verifies authored and fallback SEO policy across all 18 static page URLs', async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    limits: { fileCount: 100 },
    config: {
      seo: {
        locales: GENERIC_SEO_LOCALES,
        requiredLocalizedRoutes: Object.keys(STATIC_PAGE_SEO_POLICY),
        staticPageLocalization: Object.fromEntries(
          Object.entries(STATIC_PAGE_SEO_POLICY).map(([route, policy]) => [
            route,
            { contentLocales: policy.contentLocales, fallbackLocale: 'en' },
          ]),
        ),
      },
    },
  })
  writeStaticPageSeoPolicyFixtures(outDir)

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
  assert.equal(
    report.seo.urlCount,
    1 +
      Object.values(STATIC_PAGE_SEO_POLICY).reduce(
        (total, policy) => total + policy.contentLocales.length,
        0,
      ),
  )
})

test('rejects fallback indexing, language drift, keyword inheritance, and metadata parity drift', async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    limits: { fileCount: 100 },
    config: {
      seo: {
        locales: GENERIC_SEO_LOCALES,
        requiredLocalizedRoutes: Object.keys(STATIC_PAGE_SEO_POLICY),
        staticPageLocalization: Object.fromEntries(
          Object.entries(STATIC_PAGE_SEO_POLICY).map(([route, policy]) => [
            route,
            { contentLocales: policy.contentLocales, fallbackLocale: 'en' },
          ]),
        ),
      },
    },
  })
  writeStaticPageSeoPolicyFixtures(outDir)

  const replaceInFixture = (relativePath, search, replacement) => {
    const fixturePath = path.join(outDir, relativePath)
    writeFileSync(fixturePath, readFileSync(fixturePath, 'utf8').replace(search, replacement))
  }
  replaceInFixture(
    'fr/about.html',
    '<meta name="robots" content="noindex, follow">',
    '<meta name="robots" content="index, follow">',
  )
  replaceInFixture('ja/apps.html', '<main lang="en">', '<main>')
  replaceInFixture(
    'zh/about.html',
    '<meta name="description" content="about description en">',
    '<meta name="description" content="about description en"><meta name="keywords" content="">',
  )
  replaceInFixture(
    'ko/gallery.html',
    '<meta name="twitter:description" content="gallery description ko">',
    '<meta name="twitter:description" content="drifted description">',
  )
  replaceInFixture(
    'ko/about.html',
    '<link rel="canonical" href="https://example.com/en/about">',
    '<link rel="canonical" href="https://example.com/en/about"><link rel="alternate" hreflang="en" href="https://example.com/en/about">',
  )
  replaceInFixture(
    'fr/apps.html',
    '<meta name="googlebot" content="noindex, follow">',
    '<meta name="googlebot" content="index, follow">',
  )
  const sitemapPath = path.join(outDir, 'sitemap.xml')
  writeFileSync(
    sitemapPath,
    readFileSync(sitemapPath, 'utf8').replace(
      '</urlset>',
      '<url><loc>https://example.com/zh/apps</loc></url></urlset>',
    ),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /fr\/about\.html must be noindex under the static-page locale policy/)
  assert.match(failures, /ja\/apps\.html fallback content boundary must declare lang=en/)
  assert.match(failures, /zh\/about\.html focused static page must not emit meta keywords/)
  assert.match(failures, /ko\/gallery\.html twitter:description must exactly match ImageGallery localized copy/)
  assert.match(failures, /ko\/about\.html hreflang must contain only authored static-page locales/)
  assert.match(failures, /zh\/apps\.html fallback static page leaked into sitemap\.xml/)
  assert.match(failures, /fr\/apps\.html Googlebot robots must match the static-page index\/follow policy/)
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

test('rejects dangling route social images in RSC consumers after canonicalization', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'en.txt'),
    '[\\"https://example.com/removed/opengraph-image.png?flight\\",\\"/twitter-image.png\\"]',
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(
    failures,
    /en\.txt social image consumer references a missing local image: \/removed\/opengraph-image\.png/,
  )
  assert.match(
    failures,
    /en\.txt social image consumer references a missing local image: \/twitter-image\.png/,
  )
})

test('checks every supported social-image text consumer but excludes JavaScript', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const consumers = {
    'dangling.css': '.card{background:url("/removed/opengraph-image.png")}',
    'dangling.htm': [
      '<meta content="/removed/opengraph-image.png?one=1&amp;two=2">',
      '<style>.hero{background:url("/removed/opengraph-image.png")}</style>',
      '<div style="background:url(&quot;/removed/opengraph-image.png?one=1&amp;two=2&quot;)"></div>',
      '<img srcset=" , /removed/opengraph-image.png?one=1&amp;two=2 1e0x,/removed/opengraph-image.png 2E+0x,">',
    ].join(''),
    'dangling.json': '{"image":"\\/removed\\/opengraph-image.png"}',
    'dangling.rsc': '["/removed/opengraph-image.png"]',
    'dangling.txt': '[\\"/removed/opengraph-image.png\\"]',
    'dangling.webmanifest': '{"src":"/removed/opengraph-image.png"}',
    'ignored.js': 'const image = "/removed/opengraph-image.png"',
  }
  for (const [file, content] of Object.entries(consumers)) {
    writeFileSync(path.join(outDir, file), content)
  }

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  for (const file of Object.keys(consumers).filter((value) => !value.endsWith('.js'))) {
    assert.match(
      failures,
      new RegExp(`${file.replace('.', '\\.')} social image consumer references a missing local image`),
    )
  }
  assert.doesNotMatch(failures, /ignored\.js social image consumer/)
})

test('ignores social-image-looking text outside complete consumer URL tokens', async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    limits: { fileCount: 30, totalBytes: 200_000 },
  })
  const alias = '/removed/opengraph-image.png'
  const consumers = {
    'safe.html': [
      `<a href="mailto:test@example.com?body=${alias}">mail</a>`,
      `<a href="javascript:window.value='${alias}'">script URL</a>`,
      `<a href="//example.com${alias}">protocol relative</a>`,
      `<meta content="data:text/html,<img src='${alias}'>">`,
      `<script>const image = "${alias}"</script>`,
      `<style>.inline{background:url("data:image/svg+xml,<svg>${alias}</svg>")}</style>`,
      `<div style="background:url('mailto:test@example.com?body=${alias}')"></div>`,
      `<p>normal prose ${alias} and prefix${alias}</p>`,
    ].join(''),
    'safe.json': JSON.stringify({
      mail: `mailto:test@example.com?body=${alias}`,
      javascript: `javascript:window.value='${alias}'`,
      data: `data:text/html,<img src='${alias}'>`,
      prose: `normal prose ${alias}`,
      nested: `mailto:test@example.com?body=\"${alias}\"`,
    }),
    'safe.webmanifest': JSON.stringify({ note: `data:text/html,<img src='${alias}'>` }),
    'safe.rsc': `["mailto:test@example.com?body=\\"${alias}\\"","normal prose ${alias}"]`,
    'safe.txt': `[\\"javascript:window.value=\\\\\\"${alias}\\\\\\"\\"]`,
    'safe.css': [
      `.data{background:url("data:image/svg+xml,<svg>${alias}</svg>")}`,
      `.external{background:url("https://cdn.example.com${alias}")}`,
      `.text{content:"url('${alias}')"}`,
      `/* url("${alias}") */`,
    ].join(''),
  }
  for (const [file, content] of Object.entries(consumers)) {
    writeFileSync(path.join(outDir, file), content)
  }

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  for (const file of Object.keys(consumers)) {
    assert.doesNotMatch(
      failures,
      new RegExp(`${file.replace('.', '\\.')} social image consumer references a missing local image`),
    )
  }
})

test('enumerates no-whitespace srcset candidates without splitting data URL commas', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'srcset.html'),
    [
      '<img srcset=" , data:image/svg+xml,%3Csvg%3E,/ignored/opengraph-image.png%3C/svg%3E 1e0x,',
      '/removed/opengraph-image.png 2E+0x,https://example.com/second/opengraph-image.png .5e1x, ">',
    ].join(''),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(failures, /srcset\.html social image consumer references a missing local image: \/removed\/opengraph-image\.png/)
  assert.match(failures, /srcset\.html social image consumer references a missing local image: \/second\/opengraph-image\.png/)
  assert.doesNotMatch(failures, /\/ignored\/opengraph-image\.png/)
})

test('fails closed when a srcset descriptor is malformed', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'broken-srcset.html'),
    '<img srcset="/removed/opengraph-image.png 0e0x,/second/opengraph-image.png 2x">',
  )

  await assert.rejects(
    verifyStaticArtifact({ rootDir, configPath: 'budgets.json' }),
    /invalid srcset/,
  )
})

test('checks a consumer URL containing an unknown non-decoding HTML reference', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'broken-entity.html'),
    '<meta content="/removed/opengraph-image.png?label=&unknown;">',
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.match(
    report.failures.join('\n'),
    /broken-entity\.html social image consumer references a missing local image: \/removed\/opengraph-image\.png/,
  )
})

test('checks recognized Next Flight string payloads without scanning arbitrary scripts', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeFileSync(
    path.join(outDir, 'flight.html'),
    [
      '<script>self.__next_f.push([1,"[\\"/removed/opengraph-image.png?flight#card\\"]"])</script>',
      '<script>const image = "/ignored/opengraph-image.png"</script>',
    ].join(''),
  )

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })
  const failures = report.failures.join('\n')

  assert.match(
    failures,
    /flight\.html social image consumer references a missing local image: \/removed\/opengraph-image\.png/,
  )
  assert.doesNotMatch(failures, /\/ignored\/opengraph-image\.png/)
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

test('keeps Article headline aligned with the visible title when the document SEO title differs', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeLocalizedArticleFixture(outDir, {
    visibleTitle: 'Visible canonical article title',
    documentTitle: 'Focused SEO document title',
  })

  const valid = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.deepEqual(valid.failures, [])

  writeLocalizedArticleFixture(outDir, {
    visibleTitle: 'Visible canonical article title',
    documentTitle: 'Focused SEO document title',
    schemaHeadline: 'Focused SEO document title',
  })
  const invalid = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.match(invalid.failures.join('\n'), /Article headline must match its visible H1/)
})

test('accepts a named guest Person author without a URL or identifier', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeLocalizedArticleFixture(outDir, {
    author: { '@type': 'Person', name: 'Guest Author' },
  })

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
})

test('allows an omitted Article author for intentionally unresolved authorship', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeLocalizedArticleFixture(outDir, { omitAuthor: true })

  const report = await verifyStaticArtifact({ rootDir, configPath: 'budgets.json' })

  assert.deepEqual(report.failures, [])
})

test('rejects every explicit-empty Article author representation', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const explicitEmptyAuthors = [null, false, '', [], {}]

  for (const author of explicitEmptyAuthors) {
    writeLocalizedArticleFixture(outDir, { author })
    const report = await verifyStaticArtifact({
      rootDir,
      configPath: 'budgets.json',
    })
    assert.match(report.failures.join('\n'), /Article author property must contain at least one named Person/)
  }
})

test('rejects a Person author without a non-empty name', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeLocalizedArticleFixture(outDir, {
    author: { '@type': 'Person', name: '   ' },
  })

  const report = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })

  assert.match(report.failures.join('\n'), /Article author must be a Person with a non-empty name/)
})

test('requires the site owner author to use the exact owner identity', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  writeLocalizedArticleFixture(outDir, {
    author: { '@type': 'Person', name: 'Nguyen Le Phong' },
  })

  const missingIdentity = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.match(
    missingIdentity.failures.join('\n'),
    /site owner Article author must use https:\/\/example\.com\/#person and https:\/\/example\.com/,
  )

  writeLocalizedArticleFixture(outDir, {
    author: {
      '@type': 'Person',
      '@id': 'https://example.com/#person',
      name: 'Nguyen Le Phong',
      url: 'https://example.com/en/about',
    },
  })
  const wrongIdentity = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.match(
    wrongIdentity.failures.join('\n'),
    /site owner Article author must use https:\/\/example\.com\/#person and https:\/\/example\.com/,
  )
})

test('rejects invalid optional guest identities and owner identity spoofing', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const invalidAuthors = [
    {
      '@type': 'Person',
      name: 'Guest Author',
      url: 'javascript:alert(1)',
    },
    {
      '@type': 'Person',
      '@id': '/authors/guest-author',
      name: 'Guest Author',
    },
    {
      '@type': 'Person',
      '@id': 'https://example.com/#person',
      name: 'Guest Author',
      url: 'https://example.com',
    },
  ]

  for (const author of invalidAuthors) {
    writeLocalizedArticleFixture(outDir, { author })
    const report = await verifyStaticArtifact({
      rootDir,
      configPath: 'budgets.json',
    })
    assert.match(
      report.failures.join('\n'),
      /Article author (?:url|@id) must be a safe stable absolute HTTPS identity|Article author must not claim the site owner identity with another name/,
    )
  }
})

test('accepts an explicit noindex locale redirect only when meta refresh matches canonical', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const articleUrls = writeLocalizedArticleFixture(outDir)
  const fallbackPath = path.join(outDir, 'zh/blog/architecture/static-seo.html')
  const redirectPage = (target, titleLocale = 'en') =>
    [
      '<!doctype html><html lang="zh"><head><title>Static SEO</title>',
      '<meta name="description" content="This article is available in English.">',
      '<meta name="robots" content="noindex, follow">',
      `<link rel="canonical" href="${articleUrls.en}">`,
      '</head><body><main data-content-locale-fallback="true" data-content-locale-redirect="true">',
      `<meta http-equiv="refresh" content="0;url=${target}">`,
      `<h1 lang="${titleLocale}">Static SEO</h1><a href="/en/blog/architecture/static-seo">Read in English</a>`,
      '</main></body></html>',
    ].join('')
  writeFileSync(fallbackPath, redirectPage('/en/blog/architecture/static-seo'))

  const valid = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.deepEqual(valid.failures, [])

  writeFileSync(fallbackPath, redirectPage('/en/blog/architecture/static-seo', 'vi'))
  const wrongHeadingLanguage = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.match(
    wrongHeadingLanguage.failures.join('\n'),
    /legacy locale redirect H1 lang must match canonical locale en/,
  )

  writeFileSync(fallbackPath, redirectPage('/vi/blog/architecture/static-seo'))
  const invalid = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.match(invalid.failures.join('\n'), /legacy locale redirect must meta-refresh to its canonical/)
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

  const report = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  const failures = report.failures.join('\n')

  assert.match(failures, /canonical consolidation without noindex/)
  assert.match(failures, /fallback URL must not emit hreflang alternates/)
  assert.match(failures, /fallback notice must not emit Article structured data/)
})

test('does not classify paginated blog or notes archives as articles', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const routes = [
    'en/blog/page/2',
    'en/notes/page/2',
    'en/blog/series/foundations',
    'en/blog/series/foundations/page/2',
    'en/notes/topics/thoughts',
    'en/notes/topics/thoughts/page/2',
  ]

  for (const route of routes) {
    const directory = path.join(outDir, path.dirname(route))
    mkdirSync(directory, { recursive: true })
    const url = `https://example.com/${route}`
    const isHub = /\/(?:series|topics)\//.test(`/${route}`)
    writeFileSync(
      path.join(outDir, `${route}.html`),
      [
        '<!doctype html><html lang="en"><head>',
        '<title>Archive page two</title>',
        '<meta name="description" content="A crawlable archive page.">',
        `<link rel="canonical" href="${url}">`,
        `<link rel="alternate" hreflang="en" href="${url}">`,
        `<link rel="alternate" hreflang="x-default" href="${url}">`,
        isHub ? '<meta property="og:image" content="https://example.com/opengraph-image.png">' : '',
        isHub ? '<meta name="twitter:image" content="https://example.com/opengraph-image.png">' : '',
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
  writeFileSync(path.join(outDir, 'opengraph-image.png'), ONE_PIXEL_PNG)

  const report = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  assert.deepEqual(report.failures, [])
})

test('requires deterministic Open Graph and Twitter images on content hubs', async (t) => {
  const { rootDir, outDir } = createFixture(t)
  const route = 'en/blog/series/foundations'
  const url = `https://example.com/${route}`
  mkdirSync(path.join(outDir, path.dirname(route)), { recursive: true })
  writeFileSync(
    path.join(outDir, `${route}.html`),
    [
      '<!doctype html><html lang="en"><head>',
      '<title>Foundations</title>',
      '<meta name="description" content="A curated architecture series.">',
      `<link rel="canonical" href="${url}">`,
      `<link rel="alternate" hreflang="en" href="${url}">`,
      `<link rel="alternate" hreflang="x-default" href="${url}">`,
      '</head><body><main><h1>Foundations</h1></main></body></html>',
    ].join(''),
  )
  const sitemap = readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8')
  writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    sitemap.replace(
      '</urlset>',
      `<url><loc>${url}</loc>` +
        `<xhtml:link rel="alternate" hreflang="en" href="${url}" />` +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${url}" />` +
        '</url></urlset>',
    ),
  )

  const report = await verifyStaticArtifact({
    rootDir,
    configPath: 'budgets.json',
  })
  const failures = report.failures.join('\n')
  assert.match(failures, /content hub must emit exactly one og:image/)
  assert.match(failures, /content hub must emit exactly one twitter:image/)
})
