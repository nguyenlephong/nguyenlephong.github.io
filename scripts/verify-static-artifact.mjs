#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  articleOgPublicationInventory,
  loadMediaPublicationContract,
} from './lib/media-publication-contract.mjs'

const DEFAULT_CONFIG = 'config/static-artifact-budgets.json'
const DEFAULT_OUTPUT_DIRECTORY = 'out'
const TOP_RESULT_COUNT = 5
const DEFAULT_SECRET_SCAN_CONCURRENCY = 8
const FORBIDDEN_PUBLIC_ROUTE_SEGMENTS = new Set([
  'heartbeats',
  'blog-data',
  'notes-data',
  'thoughts-data',
])
const PUBLIC_TEXT_EXTENSIONS = new Set([
  '.atom',
  '.cjs',
  '.css',
  '.csv',
  '.env',
  '.htm',
  '.html',
  '.js',
  '.json',
  '.key',
  '.map',
  '.md',
  '.mjs',
  '.pem',
  '.rss',
  '.rsc',
  '.srt',
  '.svg',
  '.tsv',
  '.txt',
  '.vtt',
  '.webmanifest',
  '.xml',
  '.yaml',
  '.yml',
])
const STATIC_ROUTE_EXTENSION_PATTERN = [...PUBLIC_TEXT_EXTENSIONS]
  .sort((left, right) => right.length - left.length)
  .map((extension) => escapeRegExp(extension))
  .join('|')
const CONTENT_REFERENCE_TOKEN_PATTERN = new RegExp(
  `["']slug["']\\s*:\\s*["'](?<rawSlug>[^"']+)["']` +
    `|/(?:[a-z]{2}/)?blog/(?!series(?:/|$)|page(?:/|$))[^/\\s"'<>?#]+/(?<blogSlug>[a-z0-9]+(?:-[a-z0-9]+)*)(?:${STATIC_ROUTE_EXTENSION_PATTERN})?(?=$|[/?#"'<>\\s])` +
    `|/(?:[a-z]{2}/)?notes/(?!topics(?:/|$)|page(?:/|$))(?<notesSlug>[a-z0-9]+(?:-[a-z0-9]+)*)(?:${STATIC_ROUTE_EXTENSION_PATTERN})?(?=$|[/?#"'<>\\s])`,
  'gi',
)
const PRIVATE_QUERY_URL_SCAN_EXTENSIONS = new Set([
  '.htm',
  '.html',
  '.json',
  '.rsc',
  '.txt',
])
const ABSOLUTE_HTTP_URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi
const LOCALIZED_PAGE_SCHEMA_CONTRACTS = new Map([
  ['about', new Set(['AboutPage'])],
  ['apps', new Set(['ItemList'])],
  ['gallery', new Set(['ImageGallery'])],
  ['studio', new Set(['CollectionPage'])],
])
const PERSON_SCHEMA_TYPES = new Set(['Person'])
const SITE_OWNER_NAME = 'Nguyen Le Phong'
const SOCIAL_IMAGE_SIGNATURES = new Map([
  ['.png', (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ['.jpg', (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff],
  ['.jpeg', (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff],
  ['.gif', (bytes) => ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))],
  [
    '.webp',
    (bytes) =>
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP',
  ],
  [
    '.avif',
    (bytes) =>
      bytes.subarray(4, 8).toString('ascii') === 'ftyp' &&
      /^(?:avif|avis)$/.test(bytes.subarray(8, 12).toString('ascii')),
  ],
])

function containsCrediblePrivateKeyBlock(content) {
  // Firebase service-account JSON and generated JavaScript commonly retain
  // PEM line breaks as literal `\n` sequences. Inspect both representations so
  // an exported credential cannot evade the public-artifact gate by encoding
  // its newlines.
  const representations = [content, content.replace(/\\r\\n|\\n|\\r/g, '\n')]

  for (const representation of representations) {
    const blockPattern =
      /-----BEGIN ((?:(?:RSA|DSA|EC|OPENSSH|ENCRYPTED) )?PRIVATE KEY)-----([\s\S]*?)-----END \1-----/g

    for (const match of representation.matchAll(blockPattern)) {
      const payload = match[2]
        .split(/\r?\n/)
        .filter((line) => !/^(?:Proc-Type|DEK-Info):/.test(line.trim()))
        .join('')
        .replaceAll(/\s/g, '')

      if (payload.length >= 64 && /^[A-Za-z0-9+/]+={0,2}$/.test(payload)) return true
    }
  }
  return false
}

const SECRET_PATTERNS = [
  {
    name: 'private key',
    prefixes: ['-----BEGIN'],
    detect: containsCrediblePrivateKeyBlock,
  },
  {
    name: 'AWS access key',
    prefixes: ['AKIA', 'ASIA'],
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    name: 'GitHub token',
    prefixes: ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_', 'github_pat_'],
    pattern: /\b(?:gh[opusr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/,
  },
  {
    name: 'Slack token',
    prefixes: ['xoxb-', 'xoxa-', 'xoxp-', 'xoxr-', 'xoxs-'],
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  },
  {
    name: 'Stripe live secret',
    prefixes: ['sk_live_'],
    pattern: /\bsk_live_[A-Za-z0-9]{16,}\b/,
  },
  {
    name: 'OpenAI secret',
    prefixes: ['sk-proj-', 'sk-svcacct-'],
    pattern: /\bsk-(?:proj-|svcacct-)[A-Za-z0-9_-]{20,}\b/,
  },
  {
    name: 'hard-coded infrastructure secret',
    prefixes: [
      'AWS_SECRET_ACCESS_KEY',
      'R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_API_TOKEN',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_ADMIN_PRIVATE_KEY',
      'private_key',
    ],
    pattern:
      /["']?(?:AWS_SECRET_ACCESS_KEY|R2_SECRET_ACCESS_KEY|CLOUDFLARE_R2_SECRET_ACCESS_KEY|CLOUDFLARE_API_TOKEN|FIREBASE_PRIVATE_KEY|FIREBASE_ADMIN_PRIVATE_KEY|private_key)["']?\s*[=:]\s*["']?(?!example\b|placeholder\b|replace[-_ ]?me\b)([A-Za-z0-9_+/=-]{20,})["']?/i,
  },
]

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function attributesFromTag(tag) {
  const attributes = new Map()
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

  for (const match of tag.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), decodeXml(match[2] ?? match[3] ?? ''))
  }

  return attributes
}

function collectTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? []
}

function collectElementTexts(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}\\s*>`, 'gi')

  return [...html.matchAll(pattern)].map((match) =>
    decodeXml(match[1].replace(/<[^>]*>/g, ' '))
      .replace(/&#x([0-9a-f]{1,6});/gi, (entity, hex) => decodeHtmlCodePoint(entity, hex, 16))
      .replace(/&#([0-9]{1,7});/g, (entity, decimal) => decodeHtmlCodePoint(entity, decimal, 10))
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

async function mapWithConcurrency(items, concurrency, task) {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1))
  let nextIndex = 0

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex]
        nextIndex += 1
        await task(item)
      }
    }),
  )
}

function normalizeUrl(value) {
  const url = new URL(value)
  url.hash = ''
  const normalized = url.toString()
  return url.pathname === '/' ? normalized : normalized.replace(/\/$/, '')
}

function relativeArtifactPath(outDir, absolutePath) {
  return path.relative(outDir, absolutePath).split(path.sep).join('/')
}

function normalizeArtifactPathSegment(value) {
  let normalized = value
  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(normalized)
      if (decoded === normalized) break
      normalized = decoded
    } catch {
      break
    }
  }
  return normalized.toLowerCase()
}

function forbiddenPublicRouteSegment(relativePath) {
  for (const rawSegment of relativePath.split('/')) {
    const segment = normalizeArtifactPathSegment(rawSegment)
    for (const forbidden of FORBIDDEN_PUBLIC_ROUTE_SEGMENTS) {
      if (segment === forbidden || segment.startsWith(forbidden + '.')) return forbidden
    }
  }
  return null
}

function decodeHtmlCodePoint(match, value, radix) {
  const codePoint = Number.parseInt(value, radix)
  return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match
}

function normalizePublicRouteReferenceContent(content) {
  let normalized = content.replaceAll('\\/', '/')

  for (let index = 0; index < 3; index += 1) {
    const decoded = normalized
      .replace(/\\u00([0-9a-f]{2})/gi, (_, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16)),
      )
      .replace(/\\x([0-9a-f]{2})/gi, (_, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16)),
      )
      .replace(/&#x([0-9a-f]{1,6});/gi, (match, hex) =>
        decodeHtmlCodePoint(match, hex, 16),
      )
      .replace(/&#([0-9]{1,7});/g, (match, decimal) =>
        decodeHtmlCodePoint(match, decimal, 10),
      )
      .replace(/&sol;/gi, '/')
      .replace(/%([0-9a-f]{2})/gi, (_, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16)),
      )

    if (decoded === normalized) break
    normalized = decoded
  }

  return normalized
}

function inspectForbiddenPublicRouteReferences(
  content,
  relativePath,
  failures,
  referenceMatches,
) {
  const normalized = normalizePublicRouteReferenceContent(content)

  for (const forbidden of FORBIDDEN_PUBLIC_ROUTE_SEGMENTS) {
    const pathReference = new RegExp(
      `/${forbidden}(?=$|[/?#.\\s"'\\x60,;:)}\\]])`,
      'i',
    )
    const segmentLiteral = new RegExp(`["'\\x60]${forbidden}["'\\x60]`, 'i')
    const routeFile = new RegExp(
      `(?:^|["'\\x60\\s:=,(\\[])${forbidden}\\.(?:html?|txt|rsc)(?=$|[?#"'\\x60\\s,;:)}\\]])`,
      'i',
    )

    if (
      !pathReference.test(normalized) &&
      !segmentLiteral.test(normalized) &&
      !routeFile.test(normalized)
    ) {
      continue
    }

    referenceMatches.push({ path: relativePath, segment: forbidden })
    // Report only the artifact path. Echoing content could repeat private data
    // from a generated page, route manifest, or service-worker cache list.
    failures.push(
      'Forbidden private route reference "' +
        forbidden +
        '" is present in public artifact content: ' +
        relativePath,
    )
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildUnpublishedContentLookup(unpublishedContent) {
  const bySlug = new Map()
  const bySurface = new Map([
    ['blog', new Map()],
    ['notes', new Map()],
  ])

  for (const entry of unpublishedContent) {
    if (bySlug.has(entry.slug)) {
      throw new Error(`Unpublished content contains a globally duplicate slug: ${entry.slug}`)
    }
    bySlug.set(entry.slug, entry)
    bySurface.get(entry.surface)?.set(entry.slug, entry)
  }
  return { bySlug, bySurface }
}

function extractPublicContentReferenceTokens(content) {
  const normalized = normalizePublicRouteReferenceContent(content).replaceAll('\\"', '"')
  const rawSlugs = new Set()
  const routeSlugs = new Map([
    ['blog', new Set()],
    ['notes', new Set()],
  ])

  for (const match of normalized.matchAll(CONTENT_REFERENCE_TOKEN_PATTERN)) {
    if (match.groups.rawSlug) rawSlugs.add(match.groups.rawSlug)
    else if (match.groups.blogSlug) routeSlugs.get('blog').add(match.groups.blogSlug)
    else if (match.groups.notesSlug) routeSlugs.get('notes').add(match.groups.notesSlug)
  }
  return { rawSlugs, routeSlugs }
}

function inspectUnpublishedContentReferences(
  content,
  relativePath,
  unpublishedContentLookup,
  failures,
  referenceMatches,
) {
  const tokens = extractPublicContentReferenceTokens(content)
  const matched = new Map()
  for (const slug of tokens.rawSlugs) {
    const entry = unpublishedContentLookup.bySlug.get(slug)
    if (entry) matched.set(`${entry.surface}:${entry.slug}`, entry)
  }
  for (const [surface, slugs] of tokens.routeSlugs) {
    const surfaceLookup = unpublishedContentLookup.bySurface.get(surface)
    for (const slug of slugs) {
      const entry = surfaceLookup?.get(slug)
      if (entry) matched.set(`${entry.surface}:${entry.slug}`, entry)
    }
  }

  for (const entry of matched.values()) {
    referenceMatches.push({ path: relativePath, slug: entry.slug, surface: entry.surface })
    failures.push(
      `Unpublished ${entry.surface} content is present in the public artifact: ${relativePath} (${entry.slug})`,
    )
  }
}

function artifactPathFromUrl(value, siteOrigin, outDir) {
  let url
  try {
    url = new URL(value, siteOrigin)
  } catch {
    return null
  }

  if (url.origin !== siteOrigin) return null

  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return null
  }

  const relative = pathname.replace(/^\/+/, '')
  const resolved = path.resolve(outDir, relative)
  const withinArtifact = path.relative(outDir, resolved)
  if (withinArtifact.startsWith('..') || path.isAbsolute(withinArtifact)) return null
  return resolved
}

function htmlPathFromPageUrl(value, siteOrigin, outDir) {
  const routePath = artifactPathFromUrl(value, siteOrigin, outDir)
  if (!routePath) return null

  const candidates = []
  if (path.extname(routePath)) candidates.push(routePath)
  else {
    candidates.push(`${routePath}.html`)
    candidates.push(path.join(routePath, 'index.html'))
  }

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]
}

function walkFiles(directory, failures, result = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) {
      failures.push(`Artifact contains unsupported symbolic link: ${absolutePath}`)
      continue
    }
    if (entry.isDirectory()) {
      walkFiles(absolutePath, failures, result)
      continue
    }
    if (entry.isFile()) result.push(absolutePath)
  }
  return result
}

function topLargest(entries) {
  return [...entries].sort((left, right) => right.bytes - left.bytes).slice(0, TOP_RESULT_COUNT)
}

function addLimitFailure(failures, label, actual, limit) {
  if (actual > limit) {
    failures.push(`${label} is ${actual.toLocaleString('en-US')}; limit is ${limit.toLocaleString('en-US')}`)
  }
}

function collectRouteAssets(html, outDir, siteOrigin, extension, failures) {
  const references = new Set()

  if (extension === '.js') {
    for (const tag of collectTags(html, 'script')) {
      const source = attributesFromTag(tag).get('src')
      if (source && new URL(source, siteOrigin).pathname.endsWith(extension)) references.add(source)
    }
  } else {
    for (const tag of collectTags(html, 'link')) {
      const attributes = attributesFromTag(tag)
      if (attributes.get('rel')?.toLowerCase() !== 'stylesheet') continue
      const href = attributes.get('href')
      if (href && new URL(href, siteOrigin).pathname.endsWith(extension)) references.add(href)
    }
  }

  let bytes = 0
  for (const reference of references) {
    const referenceUrl = new URL(reference, siteOrigin)
    if (referenceUrl.origin !== siteOrigin) continue
    const assetPath = artifactPathFromUrl(reference, siteOrigin, outDir)
    if (!assetPath || !existsSync(assetPath)) {
      failures.push(`HTML references missing local asset: ${reference}`)
      continue
    }
    bytes += statSync(assetPath).size
  }
  return bytes
}

function inspectHtml({ absolutePath, html, outDir, siteOrigin, limits, failures }) {
  const relativePath = relativeArtifactPath(outDir, absolutePath)
  const routeJavaScriptBytes = collectRouteAssets(html, outDir, siteOrigin, '.js', failures)
  const routeCssBytes = collectRouteAssets(html, outDir, siteOrigin, '.css', failures)

  addLimitFailure(
    failures,
    `Route JavaScript referenced by ${relativePath}`,
    routeJavaScriptBytes,
    limits.maxRouteJavaScriptBytes,
  )
  addLimitFailure(
    failures,
    `Route CSS referenced by ${relativePath}`,
    routeCssBytes,
    limits.maxRouteCssBytes,
  )

  return { path: relativePath, routeJavaScriptBytes, routeCssBytes }
}

function inspectSecrets(content, relativePath, failures, secretMatches) {
  for (const { name, prefixes, pattern, detect } of SECRET_PATTERNS) {
    if (!prefixes.some((prefix) => content.includes(prefix))) continue
    if (!(detect ? detect(content) : pattern.test(content))) continue
    secretMatches.push({ path: relativePath, pattern: name })
    failures.push(`Potential ${name} is present in public artifact: ${relativePath}`)
  }
}

function normalizeSensitiveQueryName(value) {
  let normalized = value
  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(normalized)
      if (decoded === normalized) break
      normalized = decoded
    } catch {
      break
    }
  }

  return normalized.trim().toLowerCase().replace(/^(?:amp;)+/, '')
}

function hasPrivateOrSignedQuery(url) {
  for (const rawName of url.searchParams.keys()) {
    const name = normalizeSensitiveQueryName(rawName)
    if (
      name === 'googleaccessid' ||
      /^(?:x-amz|x-goog|goog)-/.test(name) ||
      /(?:^|[-_.])(signature|token|expires|credential)(?:$|[-_.])/.test(name)
    ) {
      return true
    }
  }
  return false
}

function normalizePublicArtifactUrlEncoding(content) {
  return content
    .replaceAll('\\/', '/')
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003f/gi, '?')
    .replace(/\\u003d/gi, '=')
    .replace(/&#(?:0*38|x0*26);/gi, '&')
}

function inspectPrivateQueryUrls(content, relativePath, failures, matches) {
  const normalizedContent = normalizePublicArtifactUrlEncoding(content)
  const seen = new Set()

  for (const candidate of normalizedContent.match(ABSOLUTE_HTTP_URL_PATTERN) ?? []) {
    let url
    try {
      url = new URL(candidate)
    } catch {
      continue
    }
    if (!hasPrivateOrSignedQuery(url)) continue

    // Report path only. Echoing the URL could expose the credential value that
    // this artifact gate is intended to keep out of a public deployment log.
    const key = `${url.origin}${url.pathname}`
    if (seen.has(key)) continue
    seen.add(key)
    matches.push({ path: relativePath })
    failures.push(`Signed or private query URL is present in public artifact: ${relativePath}`)
  }
}

function shouldScanSecrets(relativePath, extension, configuredExtensions) {
  const basename = path.posix.basename(relativePath).toLowerCase()
  return (
    configuredExtensions.has(extension) ||
    extension === '' ||
    basename === '.env' ||
    basename.startsWith('.env.')
  )
}

function verifyRobots({ outDir, siteOrigin, failures }) {
  const robotsPath = path.join(outDir, 'robots.txt')
  if (!existsSync(robotsPath)) {
    failures.push('Missing robots.txt')
    return
  }

  const robots = readFileSync(robotsPath, 'utf8')
  if (!/^Allow:\s*\/\s*$/im.test(robots)) failures.push('robots.txt must explicitly allow the site root')
  if (/^Disallow:\s*\/\s*$/im.test(robots)) failures.push('robots.txt blocks the entire site')
  if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) {
    failures.push(`robots.txt must advertise ${siteOrigin}/sitemap.xml`)
  }
}

function findMetaContent(html, name) {
  for (const tag of collectTags(html, 'meta')) {
    const attributes = attributesFromTag(tag)
    if (attributes.get('name')?.toLowerCase() === name) return attributes.get('content') ?? ''
  }
  return null
}

function collectJsonLd(html) {
  const values = []
  const errors = []
  const pattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi

  for (const match of html.matchAll(pattern)) {
    const openingTag = match[0].slice(0, match[0].indexOf('>') + 1)
    const attributes = attributesFromTag(openingTag)
    if (attributes.get('type')?.toLowerCase() !== 'application/ld+json') continue

    try {
      values.push(JSON.parse(match[1].trim()))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  return { values, errors }
}

function flattenJsonLd(values) {
  const flattened = []
  const visit = (value) => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }
    if (!value || typeof value !== 'object') return
    flattened.push(value)
    if (Array.isArray(value['@graph'])) visit(value['@graph'])
  }
  visit(values)
  return flattened
}

function pageUrlFromArtifactPath(relativePath, siteOrigin) {
  const normalizedPath = relativePath.split(path.sep).join('/')
  let route
  if (normalizedPath === 'index.html') route = ''
  else if (normalizedPath.endsWith('/index.html')) route = normalizedPath.slice(0, -'/index.html'.length)
  else if (normalizedPath.endsWith('.html')) route = normalizedPath.slice(0, -'.html'.length)
  else return null
  return normalizeUrl(`${siteOrigin}/${route}`)
}

function isLocalizedArticleUrl(value) {
  const segments = new URL(value).pathname.split('/').filter(Boolean)
  return (
    (segments.length === 3 && segments[1] === 'notes' && !['page', 'topics'].includes(segments[2])) ||
    (segments.length === 4 && segments[1] === 'blog' && !['page', 'series'].includes(segments[2]))
  )
}

function isContentHubPageUrl(value) {
  const segments = new URL(value).pathname.split('/').filter(Boolean)
  const baseHub =
    (segments[1] === 'blog' && segments[2] === 'series') ||
    (segments[1] === 'notes' && segments[2] === 'topics')
  if (!baseHub || !segments[3]) return false
  return (
    segments.length === 4 || (segments.length === 6 && segments[4] === 'page' && /^\d+$/.test(segments[5]))
  )
}

function schemaHasType(value, expectedTypes) {
  const types = Array.isArray(value?.['@type']) ? value['@type'] : [value?.['@type']]
  return types.some((type) => expectedTypes.has(type))
}

function normalizedLanguageMap(entries) {
  const normalized = new Map()
  for (const [language, value] of Object.entries(entries)) {
    try {
      normalized.set(language, normalizeUrl(value))
    } catch {
      normalized.set(language, value)
    }
  }
  return normalized
}

function sameLanguageMap(left, right) {
  if (left.size !== right.size) return false
  for (const [language, value] of left) {
    if (right.get(language) !== value) return false
  }
  return true
}

function collectHtmlMetadata({ absolutePath, html, outDir }) {
  const canonicalUrls = []
  const alternateLanguages = {}
  for (const tag of collectTags(html, 'link')) {
    const attributes = attributesFromTag(tag)
    const relation = attributes.get('rel')?.toLowerCase()
    const href = attributes.get('href')
    if (relation === 'canonical' && href) canonicalUrls.push(href)
    if (relation === 'alternate' && href && attributes.get('hreflang')) {
      alternateLanguages[attributes.get('hreflang')] = href
    }
  }

  const htmlTag = collectTags(html, 'html')[0]
  const headingLanguages = collectTags(html, 'h1').map(
    (tag) => attributesFromTag(tag).get('lang')?.trim() ?? '',
  )
  const headingTexts = collectElementTexts(html, 'h1')
  const metaAttributes = collectTags(html, 'meta').map(attributesFromTag)
  const openGraphImages = metaAttributes
    .filter((attributes) => attributes.get('property')?.toLowerCase() === 'og:image')
    .map((attributes) => attributes.get('content')?.trim() ?? '')
    .filter(Boolean)
  const openGraphUrls = metaAttributes
    .filter((attributes) => attributes.get('property')?.toLowerCase() === 'og:url')
    .map((attributes) => attributes.get('content')?.trim() ?? '')
    .filter(Boolean)
  const twitterImages = metaAttributes
    .filter((attributes) => attributes.get('name')?.toLowerCase() === 'twitter:image')
    .map((attributes) => attributes.get('content')?.trim() ?? '')
    .filter(Boolean)
  const metaRefreshTargets = metaAttributes
    .filter((attributes) => attributes.get('http-equiv')?.toLowerCase() === 'refresh')
    .map(
      (attributes) =>
        attributes
          .get('content')
          ?.match(/^\s*\d+\s*;\s*url=(.+)\s*$/i)?.[1]
          ?.trim() ?? '',
    )
    .filter(Boolean)
  const jsonLd = collectJsonLd(html)
  const studioModuleLinks = collectTags(html, 'a')
    .map(attributesFromTag)
    .filter((attributes) => attributes.has('data-studio-module-link'))
    .map((attributes) => ({
      id: attributes.get('data-studio-module-link') ?? '',
      href: attributes.get('href') ?? '',
    }))
  return {
    absolutePath,
    relativePath: relativeArtifactPath(outDir, absolutePath),
    canonicalUrls,
    alternateLanguages,
    description: findMetaContent(html, 'description')?.trim() ?? '',
    hasContentLocaleFallback: /data-content-locale-fallback=["']true["']/i.test(html),
    hasContentLocaleRedirect: /data-content-locale-redirect=["']true["']/i.test(html),
    hasTitle: /<title>\s*[^<][\s\S]*?<\/title>/i.test(html),
    headingLanguages,
    headingTexts,
    isDocument: Boolean(htmlTag),
    jsonLdErrors: jsonLd.errors,
    jsonLdObjects: flattenJsonLd(jsonLd.values),
    language: htmlTag ? attributesFromTag(htmlTag).get('lang')?.trim() ?? '' : '',
    metaRefreshTargets,
    noindex: findMetaContent(html, 'robots')?.toLowerCase().includes('noindex') ?? false,
    openGraphImage: openGraphImages[0] ?? '',
    openGraphImages,
    openGraphUrls,
    twitterImage: twitterImages[0] ?? '',
    twitterImages,
    studioHeadingCount: collectTags(html, 'h1').length,
    studioModuleLinks,
    hasStudioStaticOverview: /data-studio-static-overview=["']true["']/i.test(html),
  }
}

function normalizeAbsolutePageIdentity(value) {
  if (typeof value !== 'string' || value.trim() === '') return null
  try {
    return normalizeUrl(value)
  } catch {
    return null
  }
}

function safeStableIdentityUrl(value) {
  if (typeof value !== 'string' || value === '' || value !== value.trim()) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username !== '' || url.password !== '' || url.search !== '') {
      return null
    }
    return url
  } catch {
    return null
  }
}

function verifyArticleAuthorContracts({ article, metadata, siteOrigin, failures }) {
  if (!Object.hasOwn(article, 'author')) return

  const authors = Array.isArray(article.author) ? article.author : [article.author]
  const explicitEmptyAuthor =
    authors.length === 0 ||
    article.author === null ||
    article.author === false ||
    article.author === '' ||
    (typeof article.author === 'object' &&
      !Array.isArray(article.author) &&
      Object.keys(article.author).length === 0)
  if (explicitEmptyAuthor) {
    failures.push(`${metadata.relativePath} Article author property must contain at least one named Person`)
    return
  }

  const expectedOwnerId = `${siteOrigin}/#person`
  for (const author of authors) {
    const name = typeof author?.name === 'string' ? author.name.trim() : ''
    if (!author || !schemaHasType(author, PERSON_SCHEMA_TYPES) || !name) {
      failures.push(`${metadata.relativePath} Article author must be a Person with a non-empty name`)
      continue
    }

    const identities = new Map()
    for (const property of ['url', '@id']) {
      if (!Object.hasOwn(author, property)) continue
      const identity = safeStableIdentityUrl(author[property])
      if (!identity) {
        failures.push(
          `${metadata.relativePath} Article author ${property} must be a safe stable absolute HTTPS identity`,
        )
      }
      identities.set(property, identity)
    }

    if (name === SITE_OWNER_NAME) {
      if (author['@id'] !== expectedOwnerId || author.url !== siteOrigin) {
        failures.push(
          `${metadata.relativePath} site owner Article author must use ${expectedOwnerId} and ${siteOrigin}`,
        )
      }
      continue
    }

    const authorId = identities.get('@id')
    const authorUrl = identities.get('url')
    const claimsOwnerId =
      authorId?.origin === siteOrigin && authorId.pathname === '/' && authorId.hash === '#person'
    const claimsOwnerUrl = authorUrl?.origin === siteOrigin && authorUrl.pathname === '/'
    if (claimsOwnerId || claimsOwnerUrl) {
      failures.push(
        `${metadata.relativePath} Article author must not claim the site owner identity with another name`,
      )
    }
  }
}

function verifyLocalizedPageIdentityContracts({
  htmlMetadataByPath,
  siteOrigin,
  seoConfig,
  failures,
}) {
  const configuredRoutes = new Set(seoConfig?.requiredLocalizedRoutes ?? [])
  const contracts = [...LOCALIZED_PAGE_SCHEMA_CONTRACTS].filter(([route]) =>
    configuredRoutes.has(route),
  )
  if (contracts.length === 0) return

  const metadataByPageUrl = new Map()
  for (const metadata of htmlMetadataByPath.values()) {
    const pageUrl = pageUrlFromArtifactPath(metadata.relativePath, siteOrigin)
    if (pageUrl) metadataByPageUrl.set(pageUrl, metadata)
  }

  for (const locale of seoConfig?.locales ?? []) {
    for (const [route, schemaTypes] of contracts) {
      const expectedPageUrl = normalizeUrl(`${siteOrigin}/${locale}/${route}`)
      const metadata = metadataByPageUrl.get(expectedPageUrl)
      if (!metadata) {
        failures.push(`Missing emitted HTML for localized ${route} page: ${expectedPageUrl}`)
        continue
      }

      if (
        metadata.canonicalUrls.length !== 1 ||
        normalizeAbsolutePageIdentity(metadata.canonicalUrls[0]) !== expectedPageUrl
      ) {
        failures.push(
          `${metadata.relativePath} canonical must match localized page identity: ${expectedPageUrl}`,
        )
      }

      if (
        metadata.openGraphUrls.length !== 1 ||
        normalizeAbsolutePageIdentity(metadata.openGraphUrls[0]) !== expectedPageUrl
      ) {
        failures.push(
          `${metadata.relativePath} og:url must match localized page identity: ${expectedPageUrl}`,
        )
      }

      if (metadata.jsonLdErrors.length > 0) {
        failures.push(`${metadata.relativePath} contains invalid JSON-LD`)
      }
      const pageObjects = metadata.jsonLdObjects.filter((value) =>
        schemaHasType(value, schemaTypes),
      )
      const schemaLabel = [...schemaTypes].join(' or ')
      if (pageObjects.length !== 1) {
        failures.push(
          `${metadata.relativePath} must emit exactly one ${schemaLabel} object; found ${pageObjects.length}`,
        )
      } else {
        const pageObject = pageObjects[0]
        for (const property of ['@id', 'url']) {
          if (normalizeAbsolutePageIdentity(pageObject[property]) !== expectedPageUrl) {
            failures.push(
              `${metadata.relativePath} ${schemaLabel} ${property} must match localized page identity: ${expectedPageUrl}`,
            )
          }
        }
      }

      if (route !== 'studio') continue
      const expectedSocialImage = normalizeUrl(`${siteOrigin}/opengraph-image.png`)
      for (const [name, value] of [
        ['og:image', metadata.openGraphImage],
        ['twitter:image', metadata.twitterImage],
      ]) {
        if (normalizeAbsolutePageIdentity(value) !== expectedSocialImage) {
          failures.push(
            `${metadata.relativePath} Studio ${name} must resolve to the root opengraph-image.png`,
          )
        }
      }
    }
  }
}

async function loadRemoteSocialImageContract(rootDir) {
  const contractPath = path.join(rootDir, 'config/media-publication.json')
  if (!existsSync(contractPath)) {
    return { baseUrl: null, expectedUrls: new Set(), unpublishedContent: [] }
  }

  const contract = await loadMediaPublicationContract(rootDir)
  const inventory = await articleOgPublicationInventory({ rootDir, contract })
  const baseUrl = new URL(contract.liveBaseUrl)
  const expectedUrls = new Set(
    inventory.expected.map(({ publicPath }) =>
      new URL(publicPath.replace(/^\/+/, ''), `${contract.liveBaseUrl}/`).href,
    ),
  )
  return {
    baseUrl,
    expectedUrls,
    unpublishedContent: inventory.known
      .filter((entry) => !entry.published)
      .map(({ slug, surface }) => ({
        slug,
        surface,
      })),
  }
}

function isWithinRemotePublication(url, baseUrl) {
  if (!baseUrl || url.origin !== baseUrl.origin) return false
  const basePath = baseUrl.pathname.replace(/\/+$/, '')
  return url.pathname === basePath || url.pathname.startsWith(`${basePath}/`)
}

function verifyLocalSocialImages({
  htmlMetadataByPath,
  outDir,
  siteOrigin,
  remotePublication,
  failures,
}) {
  let verified = 0

  for (const metadata of htmlMetadataByPath.values()) {
    for (const [name, value] of [
      ...metadata.openGraphImages.map((image) => ['og:image', image]),
      ...metadata.twitterImages.map((image) => ['twitter:image', image]),
    ]) {
      if (!value) continue

      let url
      try {
        url = new URL(value, siteOrigin)
      } catch {
        failures.push(`${metadata.relativePath} has an invalid ${name} URL`)
        continue
      }
      if (remotePublication.expectedUrls.has(url.href)) continue
      if (isWithinRemotePublication(url, remotePublication.baseUrl)) {
        failures.push(
          `${metadata.relativePath} ${name} is not declared by the media publication contract: ${url.href}`,
        )
        continue
      }
      if (url.origin !== siteOrigin) {
        failures.push(
          `${metadata.relativePath} ${name} remote URL is not declared by the media publication contract: ${url.href}`,
        )
        continue
      }

      const extension = path.extname(url.pathname).toLowerCase()
      const matchesSignature = SOCIAL_IMAGE_SIGNATURES.get(extension)
      if (!matchesSignature) {
        failures.push(
          `${metadata.relativePath} ${name} must use a supported image extension: ${url.pathname}`,
        )
        continue
      }

      const artifactPath = artifactPathFromUrl(url.href, siteOrigin, outDir)
      if (!artifactPath || !existsSync(artifactPath) || !statSync(artifactPath).isFile()) {
        failures.push(`${metadata.relativePath} ${name} references a missing local image: ${url.pathname}`)
        continue
      }

      const signature = readFileSync(artifactPath).subarray(0, 32)
      if (!matchesSignature(signature)) {
        failures.push(
          `${metadata.relativePath} ${name} extension does not match its image signature: ${url.pathname}`,
        )
        continue
      }
      verified += 1
    }
  }

  return verified
}

function verifyContentHubSocialMetadata({ htmlMetadataByPath, siteOrigin, failures }) {
  const expectedImage = normalizeUrl(`${siteOrigin}/opengraph-image.png`)

  for (const metadata of htmlMetadataByPath.values()) {
    const pageUrl = pageUrlFromArtifactPath(metadata.relativePath, siteOrigin)
    if (!pageUrl || !isContentHubPageUrl(pageUrl)) continue

    for (const [name, values] of [
      ['og:image', metadata.openGraphImages],
      ['twitter:image', metadata.twitterImages],
    ]) {
      if (values.length !== 1 || normalizeAbsolutePageIdentity(values[0]) !== expectedImage) {
        failures.push(
          `${metadata.relativePath} content hub must emit exactly one ${name} using the root opengraph-image.png`,
        )
      }
    }
  }
}

function verifyContentHubLanguageContracts({
  htmlMetadataByPath,
  sitemapLanguagesByLocation,
  locationSet,
  siteOrigin,
  failures,
}) {
  const metadataByUrl = new Map()
  for (const metadata of htmlMetadataByPath.values()) {
    const pageUrl = pageUrlFromArtifactPath(metadata.relativePath, siteOrigin)
    if (pageUrl) metadataByUrl.set(pageUrl, metadata)
  }

  for (const [pageUrl, metadata] of metadataByUrl) {
    if (!isContentHubPageUrl(pageUrl) || !locationSet.has(pageUrl)) continue
    const htmlLanguages = normalizedLanguageMap(metadata.alternateLanguages)
    const sitemapLanguages = sitemapLanguagesByLocation.get(pageUrl) ?? new Map()
    if (!sameLanguageMap(htmlLanguages, sitemapLanguages)) {
      failures.push(`${metadata.relativePath} content hub HTML and sitemap hreflang clusters do not match`)
    }

    const xDefault = htmlLanguages.get('x-default')
    if (!xDefault || !locationSet.has(xDefault)) {
      failures.push(`${metadata.relativePath} content hub x-default must point to an exported indexable page`)
    }

    const routeLocale = new URL(pageUrl).pathname.split('/').filter(Boolean)[0]
    for (const [alternateLocale, alternateUrl] of htmlLanguages) {
      if (alternateLocale === 'x-default') continue
      const alternateMetadata = metadataByUrl.get(alternateUrl)
      const reciprocal = alternateMetadata
        ? normalizedLanguageMap(alternateMetadata.alternateLanguages).get(routeLocale)
        : undefined
      if (reciprocal !== pageUrl) {
        failures.push(`${metadata.relativePath} content hub hreflang ${alternateLocale} is not reciprocal`)
      }
    }
  }
}

function verifyStudioHtmlContracts({ htmlMetadataByPath, siteOrigin, failures }) {
  const collectionPageTypes = new Set(['CollectionPage'])

  for (const metadata of htmlMetadataByPath.values()) {
    if (metadata.canonicalUrls.length !== 1) continue

    let canonical
    try {
      canonical = new URL(metadata.canonicalUrls[0], siteOrigin)
    } catch {
      continue
    }
    if (!canonical.pathname.endsWith('/studio')) continue

    if (!metadata.hasStudioStaticOverview) {
      failures.push(`${metadata.relativePath} Studio route must export a no-JavaScript static overview`)
    }
    if (!metadata.openGraphImage || !metadata.twitterImage) {
      failures.push(`${metadata.relativePath} Studio route must export Open Graph and Twitter images`)
    }
    if (metadata.studioHeadingCount !== 1) {
      failures.push(
        `${metadata.relativePath} Studio static overview must contain exactly one H1; found ${metadata.studioHeadingCount}`,
      )
    }

    const moduleLinks = metadata.studioModuleLinks.filter(({ id, href }) => id && href)
    if (moduleLinks.length === 0) {
      failures.push(`${metadata.relativePath} Studio static overview must contain crawlable module links`)
    }
    if (new Set(moduleLinks.map(({ id }) => id)).size !== moduleLinks.length) {
      failures.push(`${metadata.relativePath} Studio static overview contains duplicate module link identifiers`)
    }

    const collectionPages = metadata.jsonLdObjects.filter((value) =>
      schemaHasType(value, collectionPageTypes),
    )
    if (collectionPages.length !== 1) {
      failures.push(
        `${metadata.relativePath} Studio route must emit exactly one CollectionPage object; found ${collectionPages.length}`,
      )
      continue
    }

    const hasPart = Array.isArray(collectionPages[0].hasPart)
      ? collectionPages[0].hasPart
      : collectionPages[0].hasPart
        ? [collectionPages[0].hasPart]
        : []
    const visibleUrls = new Set(
      moduleLinks.map(({ href }) => new URL(href, siteOrigin).toString()),
    )
    const structuredUrls = new Set(
      hasPart
        .map((part) => part?.url)
        .filter((value) => typeof value === 'string')
        .map((value) => new URL(value, siteOrigin).toString()),
    )

    if (
      visibleUrls.size !== structuredUrls.size ||
      [...visibleUrls].some((url) => !structuredUrls.has(url))
    ) {
      failures.push(`${metadata.relativePath} Studio CollectionPage hasPart URLs do not match visible module links`)
    }
  }
}

function verifyArticleHtmlContracts({
  htmlMetadataByPath,
  locationSet,
  sitemapLanguagesByLocation,
  siteOrigin,
  failures,
}) {
  const articleTypes = new Set(['Article', 'BlogPosting', 'NewsArticle'])
  const metadataByUrl = new Map()

  for (const metadata of htmlMetadataByPath.values()) {
    const pageUrl = pageUrlFromArtifactPath(metadata.relativePath, siteOrigin)
    if (pageUrl) metadataByUrl.set(pageUrl, metadata)
  }

  for (const [pageUrl, metadata] of metadataByUrl) {
    if (!isLocalizedArticleUrl(pageUrl)) continue
    if (metadata.canonicalUrls.length !== 1) continue

    let canonical
    try {
      canonical = normalizeUrl(metadata.canonicalUrls[0])
    } catch {
      continue
    }

    const isCanonicalVariant = canonical === pageUrl
    const articleObjects = metadata.jsonLdObjects.filter((value) => schemaHasType(value, articleTypes))
    const htmlLanguages = normalizedLanguageMap(metadata.alternateLanguages)

    if (!isCanonicalVariant) {
      if (!metadata.hasContentLocaleFallback) {
        failures.push(`${metadata.relativePath} is a non-canonical article route without a fallback notice`)
      }
      if (metadata.hasContentLocaleRedirect) {
        if (!metadata.noindex) {
          failures.push(`${metadata.relativePath} legacy locale redirect must be noindex`)
        }
        if (
          metadata.metaRefreshTargets.length !== 1 ||
          normalizeAbsolutePageIdentity(new URL(metadata.metaRefreshTargets[0] ?? '', pageUrl).toString()) !==
            canonical
        ) {
          failures.push(`${metadata.relativePath} legacy locale redirect must meta-refresh to its canonical`)
        }
        const canonicalLocale = new URL(canonical).pathname.split('/').filter(Boolean)[0]
        if (metadata.headingLanguages.length !== 1 || metadata.headingLanguages[0] !== canonicalLocale) {
          failures.push(
            `${metadata.relativePath} legacy locale redirect H1 lang must match canonical locale ${canonicalLocale}`,
          )
        }
      } else if (metadata.noindex) {
        failures.push(`${metadata.relativePath} must use canonical consolidation without noindex`)
      }
      if (locationSet.has(pageUrl)) failures.push(`${metadata.relativePath} fallback URL leaked into sitemap.xml`)
      if (!locationSet.has(canonical)) {
        failures.push(`${metadata.relativePath} fallback canonical is not an indexable sitemap URL: ${canonical}`)
      }
      if (htmlLanguages.size > 0) {
        failures.push(`${metadata.relativePath} fallback URL must not emit hreflang alternates`)
      }
      if (articleObjects.length > 0) {
        failures.push(`${metadata.relativePath} fallback notice must not emit Article structured data`)
      }
      continue
    }

    if (metadata.hasContentLocaleFallback) {
      failures.push(`${metadata.relativePath} self-canonical article rendered a fallback notice`)
    }
    if (metadata.jsonLdErrors.length > 0) {
      failures.push(`${metadata.relativePath} contains invalid JSON-LD`)
    }
    if (articleObjects.length !== 1) {
      failures.push(`${metadata.relativePath} must emit exactly one Article object; found ${articleObjects.length}`)
      continue
    }

    const article = articleObjects[0]
    const routeLocale = new URL(pageUrl).pathname.split('/').filter(Boolean)[0]
    const mainEntity =
      typeof article.mainEntityOfPage === 'string'
        ? article.mainEntityOfPage
        : article.mainEntityOfPage?.['@id']

    if (normalizeUrl(article.url ?? siteOrigin) !== canonical) {
      failures.push(`${metadata.relativePath} Article url does not match its canonical`)
    }
    if (normalizeUrl(mainEntity ?? siteOrigin) !== canonical) {
      failures.push(`${metadata.relativePath} Article mainEntityOfPage does not match its canonical`)
    }
    if (article.inLanguage !== routeLocale) {
      failures.push(`${metadata.relativePath} Article inLanguage must be ${routeLocale}`)
    }
    if (!article.headline || !article.datePublished || !article.image) {
      failures.push(`${metadata.relativePath} Article is missing source-backed headline, datePublished, or image`)
    }
    const schemaHeadline =
      typeof article.headline === 'string' ? article.headline.replace(/\s+/g, ' ').trim() : ''
    if (metadata.headingTexts.length !== 1) {
      failures.push(
        `${metadata.relativePath} canonical Article page must render exactly one visible H1; found ${metadata.headingTexts.length}`,
      )
    } else if (schemaHeadline && schemaHeadline !== metadata.headingTexts[0]) {
      failures.push(`${metadata.relativePath} Article headline must match its visible H1`)
    }
    verifyArticleAuthorContracts({ article, metadata, siteOrigin, failures })

    if (htmlLanguages.get(routeLocale) !== pageUrl) {
      failures.push(`${metadata.relativePath} hreflang cluster must include its own locale and URL`)
    }
    const xDefault = htmlLanguages.get('x-default')
    if (!xDefault || !locationSet.has(xDefault)) {
      failures.push(`${metadata.relativePath} hreflang x-default must point to a canonical article URL`)
    }

    const sitemapLanguages = sitemapLanguagesByLocation.get(pageUrl) ?? new Map()
    if (!sameLanguageMap(htmlLanguages, sitemapLanguages)) {
      failures.push(`${metadata.relativePath} HTML and sitemap hreflang clusters do not match`)
    }

    for (const [alternateLocale, alternateUrl] of htmlLanguages) {
      if (alternateLocale === 'x-default') continue
      const alternateMetadata = metadataByUrl.get(alternateUrl)
      const reciprocal = alternateMetadata
        ? normalizedLanguageMap(alternateMetadata.alternateLanguages).get(routeLocale)
        : undefined
      if (reciprocal !== pageUrl) {
        failures.push(`${metadata.relativePath} hreflang ${alternateLocale} is not reciprocal`)
      }
    }
  }
}

function verifySitemapPage({ loc, outDir, siteOrigin, failures, htmlMetadataByPath }) {
  const htmlPath = htmlPathFromPageUrl(loc, siteOrigin, outDir)
  if (!htmlPath || !existsSync(htmlPath)) {
    failures.push(`Sitemap URL has no exported HTML page: ${loc}`)
    return
  }

  const relativePath = relativeArtifactPath(outDir, htmlPath)
  const metadata = htmlMetadataByPath.get(relativePath)
  if (!metadata) {
    failures.push(`Sitemap HTML metadata was not inspected: ${relativePath}`)
    return
  }
  const { canonicalUrls } = metadata

  if (canonicalUrls.length !== 1) {
    failures.push(`${relativePath} must contain exactly one canonical URL; found ${canonicalUrls.length}`)
  } else {
    let canonical
    try {
      canonical = normalizeUrl(canonicalUrls[0])
    } catch {
      failures.push(`${relativePath} has an invalid canonical URL: ${canonicalUrls[0]}`)
    }
    if (canonical && canonical !== normalizeUrl(loc)) {
      failures.push(`${relativePath} canonical ${canonicalUrls[0]} does not match sitemap URL ${loc}`)
    }
  }

  if (!metadata.hasTitle) {
    failures.push(`${relativePath} is indexable but has no non-empty title`)
  }
  if (!metadata.description) {
    failures.push(`${relativePath} is indexable but has no meta description`)
  }
  if (metadata.noindex) {
    failures.push(`${relativePath} is listed in sitemap.xml but marked noindex`)
  }
  if (!metadata.language) {
    failures.push(`${relativePath} is indexable but has no html lang attribute`)
  }
}

function verifyRequiredLocalizedRoutes({ locationSet, siteOrigin, seoConfig, failures }) {
  const locales = seoConfig?.locales ?? []
  const routes = seoConfig?.requiredLocalizedRoutes ?? []

  for (const locale of locales) {
    for (const route of routes) {
      const normalizedRoute = route ? `/${route.replace(/^\/+|\/+$/g, '')}` : ''
      const requiredUrl = normalizeUrl(`${siteOrigin}/${locale}${normalizedRoute}`)
      if (!locationSet.has(requiredUrl)) {
        failures.push(`sitemap.xml is missing required localized route: ${requiredUrl}`)
      }
    }
  }
}

function verifyCanonicalHtmlParity({ htmlMetadataByPath, locationSet, outDir, siteOrigin, failures }) {
  let canonicalHtmlCount = 0

  for (const metadata of htmlMetadataByPath.values()) {
    // Ownership proof files such as google*.html are served with an HTML
    // extension but are plain verification tokens, not indexable documents.
    if (!metadata.isDocument || metadata.noindex) continue

    if (metadata.canonicalUrls.length !== 1) {
      failures.push(
        `${metadata.relativePath} is indexable but must contain exactly one canonical URL; found ${metadata.canonicalUrls.length}`,
      )
      continue
    }

    let canonical
    try {
      canonical = normalizeUrl(metadata.canonicalUrls[0])
    } catch {
      failures.push(
        `${metadata.relativePath} is indexable but has an invalid canonical URL: ${metadata.canonicalUrls[0]}`,
      )
      continue
    }
    if (new URL(canonical).origin !== siteOrigin) continue

    const canonicalPath = htmlPathFromPageUrl(canonical, siteOrigin, outDir)
    if (!canonicalPath || path.resolve(canonicalPath) !== path.resolve(metadata.absolutePath)) continue

    canonicalHtmlCount += 1
    if (!locationSet.has(canonical)) {
      failures.push(
        `${metadata.relativePath} is self-canonical and indexable but missing from sitemap.xml: ${canonical}`,
      )
    }
  }

  return canonicalHtmlCount
}

function verifySitemap({ outDir, siteOrigin, seoConfig, failures, htmlMetadataByPath }) {
  const sitemapPath = path.join(outDir, 'sitemap.xml')
  if (!existsSync(sitemapPath)) {
    failures.push('Missing sitemap.xml')
    return { urlCount: 0 }
  }

  const sitemap = readFileSync(sitemapPath, 'utf8')
  const blocks = [...sitemap.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => match[1])
  const locations = []
  const alternates = []
  const sitemapLanguageEntries = []

  for (const block of blocks) {
    const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/i)
    if (!locMatch) {
      failures.push('sitemap.xml contains a URL entry without <loc>')
      continue
    }
    const loc = decodeXml(locMatch[1].trim())
    locations.push(loc)

    const alternateTags = block.match(/<xhtml:link\b[^>]*>/gi) ?? []
    const alternateAttributes = alternateTags.map(attributesFromTag)
    if (!alternateAttributes.some((attributes) => attributes.get('hreflang') === 'x-default')) {
      failures.push(`Sitemap URL is missing an x-default alternate: ${loc}`)
    }
    for (const attributes of alternateAttributes) {
      const href = attributes.get('href')
      const language = attributes.get('hreflang')
      if (attributes.get('rel') === 'alternate' && href) {
        alternates.push({ loc, href })
        if (language) sitemapLanguageEntries.push({ loc, language, href })
      }
    }
  }

  const normalizedLocations = []

  for (const loc of locations) {
    let parsed
    try {
      parsed = new URL(loc)
    } catch {
      failures.push(`sitemap.xml contains an invalid URL: ${loc}`)
      continue
    }
    if (parsed.origin !== siteOrigin) failures.push(`Sitemap URL uses an unexpected origin: ${loc}`)
    if (parsed.protocol !== 'https:') failures.push(`Sitemap URL must use HTTPS: ${loc}`)
    if (parsed.search || parsed.hash) failures.push(`Sitemap URL must not contain query or fragment: ${loc}`)
    normalizedLocations.push(normalizeUrl(loc))
  }

  const locationSet = new Set(normalizedLocations)
  if (locationSet.size !== normalizedLocations.length) failures.push('sitemap.xml contains duplicate <loc> URLs')
  const sitemapLanguagesByLocation = new Map()

  for (const { loc, language, href } of sitemapLanguageEntries) {
    let normalizedLocation
    let normalizedHref
    try {
      normalizedLocation = normalizeUrl(loc)
      normalizedHref = normalizeUrl(href)
    } catch {
      continue
    }
    const languageMap = sitemapLanguagesByLocation.get(normalizedLocation) ?? new Map()
    languageMap.set(language, normalizedHref)
    sitemapLanguagesByLocation.set(normalizedLocation, languageMap)
  }

  for (const { loc, href } of alternates) {
    let normalizedHref
    try {
      normalizedHref = normalizeUrl(href)
    } catch {
      failures.push(`Sitemap alternate from ${loc} is invalid: ${href}`)
      continue
    }
    if (!locationSet.has(normalizedHref)) {
      failures.push(`Sitemap alternate from ${loc} is not indexable: ${href}`)
    }
  }

  for (const loc of locationSet) {
    verifySitemapPage({ loc, outDir, siteOrigin, failures, htmlMetadataByPath })
  }
  verifyRequiredLocalizedRoutes({ locationSet, siteOrigin, seoConfig, failures })
  const canonicalHtmlCount = verifyCanonicalHtmlParity({
    htmlMetadataByPath,
    locationSet,
    outDir,
    siteOrigin,
    failures,
  })
  if (locationSet.size !== canonicalHtmlCount) {
    failures.push(
      `sitemap.xml contains ${locationSet.size.toLocaleString('en-US')} unique URLs but the export contains ${canonicalHtmlCount.toLocaleString('en-US')} indexable self-canonical pages`,
    )
  }
  verifyArticleHtmlContracts({
    htmlMetadataByPath,
    locationSet,
    sitemapLanguagesByLocation,
    siteOrigin,
    failures,
  })
  verifyContentHubLanguageContracts({
    htmlMetadataByPath,
    sitemapLanguagesByLocation,
    locationSet,
    siteOrigin,
    failures,
  })
  return { urlCount: locationSet.size, canonicalHtmlCount }
}

function loadConfig(rootDir, configPath) {
  const absoluteConfigPath = path.resolve(rootDir, configPath)
  const config = JSON.parse(readFileSync(absoluteConfigPath, 'utf8'))
  if (config.schemaVersion !== 1) throw new Error(`Unsupported artifact budget schema: ${config.schemaVersion}`)
  return config
}

export async function verifyStaticArtifact({
  rootDir = process.cwd(),
  configPath = DEFAULT_CONFIG,
} = {}) {
  const config = loadConfig(rootDir, configPath)
  if (config.outputDirectory !== DEFAULT_OUTPUT_DIRECTORY) {
    throw new Error(
      `Artifact budget config must verify ${DEFAULT_OUTPUT_DIRECTORY}; received ${config.outputDirectory}`,
    )
  }
  const outDir = path.resolve(rootDir, DEFAULT_OUTPUT_DIRECTORY)
  const siteOrigin = new URL(config.siteOrigin).origin
  const limits = config.limits
  const failures = []

  if (!existsSync(outDir)) throw new Error(`Missing static export directory: ${outDir}`)

  const files = walkFiles(outDir, failures)
  const extensionEntries = { '.html': [], '.js': [], '.css': [] }
  const routeEntries = []
  const secretMatches = []
  const privateQueryUrlMatches = []
  const forbiddenRouteMatches = []
  const forbiddenRouteReferenceMatches = []
  const unpublishedContentReferenceMatches = []
  const secretExtensions = new Set([
    ...PUBLIC_TEXT_EXTENSIONS,
    ...(config.additionalSecretScanExtensions ?? config.secretScanExtensions ?? []),
  ])
  const htmlMetadataByPath = new Map()
  const textFiles = []
  const remotePublication = await loadRemoteSocialImageContract(rootDir)
  const unpublishedContentLookup = buildUnpublishedContentLookup(
    remotePublication.unpublishedContent,
  )
  let totalBytes = 0

  for (const absolutePath of files) {
    const stat = statSync(absolutePath)
    const relativePath = relativeArtifactPath(outDir, absolutePath)
    const extension = path.extname(relativePath).toLowerCase()
    totalBytes += stat.size

    const forbiddenRoute = forbiddenPublicRouteSegment(relativePath)
    if (forbiddenRoute) {
      forbiddenRouteMatches.push({ path: relativePath, segment: forbiddenRoute })
      failures.push(
        'Forbidden private route segment "' +
          forbiddenRoute +
          '" is present in public artifact: ' +
          relativePath,
      )
    }

    if (extensionEntries[extension]) extensionEntries[extension].push({ path: relativePath, bytes: stat.size })

    if (shouldScanSecrets(relativePath, extension, secretExtensions)) {
      textFiles.push({ absolutePath, extension, relativePath })
    }
  }

  const secretScanConcurrency = Math.max(
    1,
    Math.floor(config.secretScanConcurrency ?? DEFAULT_SECRET_SCAN_CONCURRENCY),
  )
  await mapWithConcurrency(textFiles, secretScanConcurrency, async (entry) => {
    const content = await readFile(entry.absolutePath, 'utf8')
    inspectSecrets(content, entry.relativePath, failures, secretMatches)
    inspectForbiddenPublicRouteReferences(
      content,
      entry.relativePath,
      failures,
      forbiddenRouteReferenceMatches,
    )
    inspectUnpublishedContentReferences(
      content,
      entry.relativePath,
      unpublishedContentLookup,
      failures,
      unpublishedContentReferenceMatches,
    )
    if (PRIVATE_QUERY_URL_SCAN_EXTENSIONS.has(entry.extension)) {
      inspectPrivateQueryUrls(
        content,
        entry.relativePath,
        failures,
        privateQueryUrlMatches,
      )
    }
    if (entry.extension === '.html' || entry.extension === '.htm') {
      htmlMetadataByPath.set(
        entry.relativePath,
        collectHtmlMetadata({ absolutePath: entry.absolutePath, html: content, outDir }),
      )
    }
  })

  for (const relativePath of config.routeAssetSamples ?? []) {
    const absolutePath = path.join(outDir, relativePath)
    if (!existsSync(absolutePath)) {
      failures.push(`Missing configured route asset sample: ${relativePath}`)
      continue
    }
    const html = readFileSync(absolutePath, 'utf8')
    routeEntries.push(inspectHtml({ absolutePath, html, outDir, siteOrigin, limits, failures }))
  }

  addLimitFailure(failures, 'Artifact bytes', totalBytes, limits.totalBytes)
  addLimitFailure(failures, 'Artifact file count', files.length, limits.fileCount)

  const largestHtml = topLargest(extensionEntries['.html'])
  const largestJavaScript = topLargest(extensionEntries['.js'])
  const largestCss = topLargest(extensionEntries['.css'])
  if (largestHtml[0]) addLimitFailure(failures, `Largest HTML (${largestHtml[0].path})`, largestHtml[0].bytes, limits.maxHtmlBytes)
  if (largestJavaScript[0]) {
    addLimitFailure(
      failures,
      `Largest JavaScript (${largestJavaScript[0].path})`,
      largestJavaScript[0].bytes,
      limits.maxJavaScriptBytes,
    )
  }
  if (largestCss[0]) addLimitFailure(failures, `Largest CSS (${largestCss[0].path})`, largestCss[0].bytes, limits.maxCssBytes)

  verifyRobots({ outDir, siteOrigin, failures })
  verifyLocalizedPageIdentityContracts({
    htmlMetadataByPath,
    siteOrigin,
    seoConfig: config.seo,
    failures,
  })
  const localSocialImageCount = verifyLocalSocialImages({
    htmlMetadataByPath,
    outDir,
    siteOrigin,
    remotePublication,
    failures,
  })
  verifyStudioHtmlContracts({ htmlMetadataByPath, siteOrigin, failures })
  verifyContentHubSocialMetadata({
    htmlMetadataByPath,
    siteOrigin,
    failures,
  })
  const seo = verifySitemap({
    outDir,
    siteOrigin,
    seoConfig: config.seo,
    failures,
    htmlMetadataByPath,
  })

  const report = {
    artifact: {
      outputDirectory: DEFAULT_OUTPUT_DIRECTORY,
      totalBytes,
      fileCount: files.length,
      limits,
      largestHtml,
      largestJavaScript,
      largestCss,
      largestRouteJavaScript: topLargest(
        routeEntries.map((entry) => ({ path: entry.path, bytes: entry.routeJavaScriptBytes })),
      ),
      largestRouteCss: topLargest(routeEntries.map((entry) => ({ path: entry.path, bytes: entry.routeCssBytes }))),
    },
    seo: { ...seo, localSocialImageCount },
    secrets: {
      scannedTextFiles: textFiles.length,
      scanConcurrency: secretScanConcurrency,
      matches: secretMatches,
      privateQueryUrlMatches,
    },
    privacy: {
      forbiddenRouteMatches,
      forbiddenRouteReferenceMatches: forbiddenRouteReferenceMatches.sort((left, right) =>
        left.path.localeCompare(right.path),
      ),
      unpublishedContentReferenceMatches: unpublishedContentReferenceMatches.sort((left, right) =>
        left.path.localeCompare(right.path) || left.slug.localeCompare(right.slug),
      ),
    },
    failures,
    warnings: [],
  }

  for (const [label, actual, limit] of [
    ['artifact bytes', totalBytes, limits.totalBytes],
    ['artifact files', files.length, limits.fileCount],
  ]) {
    const percentage = (actual / limit) * 100
    if (percentage >= config.warnAtPercent && actual <= limit) {
      report.warnings.push(`${label} uses ${percentage.toFixed(1)}% of its configured limit`)
    }
  }

  return report
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KiB', 'MiB', 'GiB']
  let value = bytes
  let unit = -1
  do {
    value /= 1024
    unit += 1
  } while (value >= 1024 && unit < units.length - 1)
  return `${value.toFixed(1)} ${units[unit]}`
}

function printReport(report) {
  const { artifact, seo, secrets, failures, warnings } = report
  console.log(
    `[artifact] ${artifact.fileCount.toLocaleString('en-US')} files / ${formatBytes(artifact.totalBytes)} ` +
      `(limits: ${artifact.limits.fileCount.toLocaleString('en-US')} files / ${formatBytes(artifact.limits.totalBytes)})`,
  )
  for (const [label, entries] of [
    ['HTML', artifact.largestHtml],
    ['JavaScript', artifact.largestJavaScript],
    ['CSS', artifact.largestCss],
    ['route JavaScript', artifact.largestRouteJavaScript],
    ['route CSS', artifact.largestRouteCss],
  ]) {
    const largest = entries[0]
    if (largest) console.log(`[artifact] largest ${label}: ${formatBytes(largest.bytes)} (${largest.path})`)
  }
  console.log(`[seo] ${seo.urlCount.toLocaleString('en-US')} sitemap URLs verified against exported canonicals`)
  console.log(
    `[secrets] scanned ${secrets.scannedTextFiles.toLocaleString('en-US')} public text files ` +
      `(concurrency ${secrets.scanConcurrency})`,
  )
  for (const warning of warnings) console.warn(`[warning] ${warning}`)

  if (failures.length > 0) {
    console.error(`[verify-static-artifact] failed with ${failures.length} issue(s):`)
    for (const failure of failures) console.error(`- ${failure}`)
    return false
  }

  console.log('[verify-static-artifact] passed')
  return true
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  try {
    const report = await verifyStaticArtifact()
    if (!printReport(report)) process.exitCode = 1
  } catch (error) {
    console.error(`[verify-static-artifact] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
