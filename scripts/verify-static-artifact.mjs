#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_CONFIG = 'config/static-artifact-budgets.json'
const DEFAULT_OUTPUT_DIRECTORY = 'out'
const TOP_RESULT_COUNT = 5
const DEFAULT_SECRET_SCAN_CONCURRENCY = 8
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

function collectHtmlMetadata({ absolutePath, html, outDir }) {
  const canonicalUrls = []
  for (const tag of collectTags(html, 'link')) {
    const attributes = attributesFromTag(tag)
    if (attributes.get('rel')?.toLowerCase() !== 'canonical') continue
    const href = attributes.get('href')
    if (href) canonicalUrls.push(href)
  }

  const htmlTag = collectTags(html, 'html')[0]
  return {
    absolutePath,
    relativePath: relativeArtifactPath(outDir, absolutePath),
    canonicalUrls,
    description: findMetaContent(html, 'description')?.trim() ?? '',
    hasTitle: /<title>\s*[^<][\s\S]*?<\/title>/i.test(html),
    isDocument: Boolean(htmlTag),
    language: htmlTag ? attributesFromTag(htmlTag).get('lang')?.trim() ?? '' : '',
    noindex: findMetaContent(html, 'robots')?.toLowerCase().includes('noindex') ?? false,
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

function verifySitemap({ outDir, siteOrigin, limits, seoConfig, failures, htmlMetadataByPath }) {
  const sitemapPath = path.join(outDir, 'sitemap.xml')
  if (!existsSync(sitemapPath)) {
    failures.push('Missing sitemap.xml')
    return { urlCount: 0 }
  }

  const sitemap = readFileSync(sitemapPath, 'utf8')
  const blocks = [...sitemap.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => match[1])
  const locations = []
  const alternates = []

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
      if (attributes.get('rel') === 'alternate' && href) alternates.push({ loc, href })
    }
  }

  if (locations.length < limits.minimumSitemapUrls) {
    failures.push(
      `sitemap.xml contains ${locations.length.toLocaleString('en-US')} URLs; expected at least ${limits.minimumSitemapUrls.toLocaleString('en-US')}`,
    )
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
  const secretExtensions = new Set([
    ...PUBLIC_TEXT_EXTENSIONS,
    ...(config.additionalSecretScanExtensions ?? config.secretScanExtensions ?? []),
  ])
  const htmlMetadataByPath = new Map()
  const textFiles = []
  let totalBytes = 0

  for (const absolutePath of files) {
    const stat = statSync(absolutePath)
    const relativePath = relativeArtifactPath(outDir, absolutePath)
    const extension = path.extname(relativePath).toLowerCase()
    totalBytes += stat.size

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
  const seo = verifySitemap({
    outDir,
    siteOrigin,
    limits,
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
    seo,
    secrets: {
      scannedTextFiles: textFiles.length,
      scanConcurrency: secretScanConcurrency,
      matches: secretMatches,
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
      report.warnings.push(`${label} uses ${percentage.toFixed(1)}% of its Phase 1 limit`)
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
