#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createArtifactIndex } from './lib/artifact-index.mjs'

const ROOT = process.cwd()
const OUT_DIR = path.resolve(ROOT, 'out')
const APP_VERSION_FILE = path.resolve(ROOT, 'app-version.json')
const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const DEFAULT_LOCALE = 'en'
const PAGE_VERSION_PARAM = '__offlineVersion'
const OFFLINE_MANIFEST_VERSION_META = 'offline-manifest-version'
const CDN_BACKED_EXPORT_PATHS = ['og', 'assets/blog', 'assets/notes', 'assets/photos']
const BUILD_ONLY_EXPORT_PATHS = ['og-cache']
const DEFAULT_HTML_FILE_CONCURRENCY = 16
// Bump when worker logic changes so every visitor gets a fresh cache generation.
const SW_SCHEMA_VERSION = 2
// Locale-agnostic install shell. Each locale's home and offline page live in
// localeShells and are installed only for the locale a visitor actually uses.
const ESSENTIAL_SHELL_FILES = [
  'index.html',
  '404.html',
  '_not-found.html',
  'favicon.ico',
  'icon.png',
  'apple-icon.png',
  'manifest.webmanifest',
]

function localeShellFiles(locale) {
  return [`${locale}.html`, `${locale}/offline.html`]
}

async function removeCdnBackedExportAssets(outDir, artifactIndex) {
  await Promise.all(
    CDN_BACKED_EXPORT_PATHS.map((relativePath) => artifactIndex
      ? artifactIndex.removeTree(relativePath)
      : fs.rm(path.join(outDir, relativePath), { recursive: true, force: true })),
  )
}

export async function pruneBuildOnlyExportAssets(outDir = OUT_DIR, artifactIndex = null) {
  await Promise.all(
    BUILD_ONLY_EXPORT_PATHS.map((relativePath) => artifactIndex
      ? artifactIndex.removeTree(relativePath)
      : fs.rm(path.join(outDir, relativePath), { recursive: true, force: true })),
  )
}

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function routeUrlFromOutFile(relativePath) {
  const rel = toPosix(relativePath)
  if (rel === 'index.html') return '/index.html'
  return `/${rel}`
}

function hashContent(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

function hashRecord(value) {
  return hashContent(JSON.stringify(value))
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

function htmlFileConcurrency() {
  const value = Number(process.env.OFFLINE_HTML_CONCURRENCY ?? DEFAULT_HTML_FILE_CONCURRENCY)
  if (!Number.isFinite(value) || value < 1) return DEFAULT_HTML_FILE_CONCURRENCY
  return Math.trunc(value)
}

async function mapWithConcurrency(items, concurrency, task) {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1))
  let cursor = 0

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const index = cursor
        cursor += 1
        await task(items[index], index)
      }
    }),
  )
}

function isLocaleScoped(relativePath, locale) {
  return relativePath === `${locale}.html` || relativePath.startsWith(`${locale}/`)
}

function isLocaleOfflineFile(relativePath, locale) {
  if (!isLocaleScoped(relativePath, locale)) return false
  if (relativePath.endsWith('opengraph-image.png')) return false
  return relativePath.endsWith('.html')
}

function isReadingAsset(relativePath) {
  return relativePath.startsWith('assets/blog/')
}

function isExtendedAsset(relativePath) {
  return relativePath.startsWith('assets/photos/')
}

function isRuntimeAsset(relativePath) {
  return relativePath.startsWith('_next/')
}

async function readAppVersion() {
  const raw = await fs.readFile(APP_VERSION_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  return String(parsed.version ?? '0')
}

export function hasPrivateOrSignedRemoteMediaQuery(input) {
  const url = typeof input === 'string' ? new URL(input) : input

  for (const rawName of url.searchParams.keys()) {
    let name = rawName
    for (let index = 0; index < 3; index += 1) {
      try {
        const decoded = decodeURIComponent(name)
        if (decoded === name) break
        name = decoded
      } catch {
        break
      }
    }
    name = name.trim().toLowerCase().replace(/^(?:amp;)+/, '')

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

export function extractResolvedRemoteMediaAssets(html) {
  const remoteAssets = []
  const sourcePattern = /\b(?:src|poster)=["'](https?:\/\/[^"'<>]+)["']/gi
  const candidates = [...html.matchAll(sourcePattern)].map((match) => match[1])
  // Gallery cards list 480w/800w variants; the browser may pick any of them.
  for (const match of html.matchAll(/\bsrcset=["']([^"'<>]+)["']/gi)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0]
      if (/^https?:\/\//i.test(url)) candidates.push(url)
    }
  }
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate)
      if (
        !url.username &&
        !url.password &&
        !hasPrivateOrSignedRemoteMediaQuery(url)
      ) {
        remoteAssets.push(url.href)
      }
    } catch {
      // Artifact verification owns malformed output; do not broaden ownership.
    }
  }
  return uniqueSorted(remoteAssets)
}

async function readRemoteGalleryAssets(artifactIndex) {
  const remoteAssets = []
  for (const locale of LOCALES) {
    const relativePath = `${locale}/gallery.html`
    if (!artifactIndex.has(relativePath)) continue
    const html = await artifactIndex.readText(relativePath)
    remoteAssets.push(...extractResolvedRemoteMediaAssets(html))
  }
  return uniqueSorted(remoteAssets)
}

export function extractDocumentAssetReferences(html) {
  const references = []
  const attributePattern = /<([a-z][\w-]*)\b[^>]*?\s(?:src|href)=["']([^"'<>]+)["']/gi

  for (const match of html.matchAll(attributePattern)) {
    // <a href> is a link the reader may never follow (the resume PDF), not a subresource.
    if (match[1].toLowerCase() === 'a') continue
    const raw = match[2].replaceAll('&amp;', '&')
    if (!raw.startsWith('/')) continue
    try {
      const url = new URL(raw, 'https://artifact.invalid')
      if (url.origin !== 'https://artifact.invalid') continue
      const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '')
      if (relativePath) references.push(relativePath)
    } catch {
      // Final artifact verification remains independent and owns malformed URLs.
    }
  }

  return uniqueSorted(references)
}

async function collectShellEntries(artifactIndex, files) {
  const missing = files.filter((relativePath) => !artifactIndex.has(relativePath))
  if (missing.length > 0) {
    throw new Error(`[postbuild-offline] missing essential shell file(s): ${missing.join(', ')}`)
  }

  const referencedAssets = []
  for (const relativePath of files.filter((file) => file.endsWith('.html'))) {
    const html = await artifactIndex.readText(relativePath)
    referencedAssets.push(
      ...extractDocumentAssetReferences(html).filter((assetPath) => artifactIndex.has(assetPath)),
    )
  }

  return uniqueSorted([...files, ...referencedAssets].map(routeUrlFromOutFile))
}

export async function deriveInstallShell(artifactIndex) {
  return uniqueSorted([
    '/offline-manifest.json',
    ...(await collectShellEntries(artifactIndex, ESSENTIAL_SHELL_FILES)),
  ])
}

export async function deriveLocaleShells(artifactIndex) {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => [
      locale,
      await collectShellEntries(artifactIndex, localeShellFiles(locale)),
    ]),
  )
  return Object.fromEntries(entries)
}

function stripOfflineManifestVersion(html) {
  const metaPattern = new RegExp(
    `[ \\t]*<meta\\s+name=["']${OFFLINE_MANIFEST_VERSION_META}["'][^>]*>\\r?\\n?`,
    'gi',
  )
  return html.replace(metaPattern, '')
}

export function pageVersionForHtml(relativePath, html) {
  return hashRecord({
    relativePath: toPosix(relativePath),
    html: stripOfflineManifestVersion(html),
  })
}

export function assertManifestVersion(manifest, expectedVersion) {
  if (manifest?.version !== expectedVersion) {
    throw new Error(
      'offline manifest version mismatch: expected ' +
        expectedVersion +
        ', received ' +
        String(manifest?.version),
    )
  }
  return manifest
}

export async function buildPageVersions(relativeFiles, artifactIndex) {
  const htmlFiles = relativeFiles
    .filter((relativePath) => relativePath.endsWith('.html'))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const entries = new Array(htmlFiles.length)

  await mapWithConcurrency(htmlFiles, htmlFileConcurrency(), async (relativePath, index) => {
    const html = await artifactIndex.readText(relativePath)
    entries[index] = [routeUrlFromOutFile(relativePath), pageVersionForHtml(relativePath, html)]
  })

  return Object.fromEntries(entries)
}

function buildManifestVersion({
  appVersion,
  shell,
  localeShells,
  readingData,
  readingAssets,
  extendedAssets,
  runtimeAssets,
  remoteAssets,
  pageVersions,
}) {
  return hashRecord({
    swSchemaVersion: SW_SCHEMA_VERSION,
    appVersion,
    shell,
    localeShells,
    readingData,
    readingAssets,
    extendedAssets,
    runtimeAssets,
    remoteAssets,
    pageVersions,
  })
}

function injectOfflineManifestVersion(html, version) {
  const metaTag = `<meta name="${OFFLINE_MANIFEST_VERSION_META}" content="${version}">`
  const metaPattern = new RegExp(`<meta\\s+name=["']${OFFLINE_MANIFEST_VERSION_META}["'][^>]*>`, 'i')

  if (metaPattern.test(html)) {
    return html.replace(metaPattern, metaTag)
  }

  if (html.includes('</head>')) {
    return html.replace('</head>', `  ${metaTag}\n</head>`)
  }

  return html
}

async function writeOfflineManifestVersion(relativeFiles, version, artifactIndex) {
  const htmlFiles = relativeFiles
    .filter((relativePath) => relativePath.endsWith('.html'))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

  await mapWithConcurrency(htmlFiles, htmlFileConcurrency(), async (relativePath) => {
    const html = await artifactIndex.readText(relativePath)
    const nextHtml = injectOfflineManifestVersion(html, version)
    if (nextHtml !== html) {
      await artifactIndex.write(relativePath, nextHtml)
    }
  })
}

function buildOwnedSameOriginPaths(manifest) {
  const paths = [
    ...(manifest.shared?.shell ?? []),
    ...(manifest.shared?.readingData ?? []),
    ...(manifest.shared?.readingAssets ?? []),
    ...(manifest.shared?.extendedAssets ?? []),
    ...(manifest.shared?.runtimeAssets ?? []),
    ...Object.values(manifest.localeShells ?? {}).flat(),
    ...Object.values(manifest.locales ?? {}).flat(),
  ]
  return uniqueSorted(paths.filter((url) => url.startsWith('/')))
}

export async function installRequiredShell({
  manifest,
  locales = [],
  shellCacheName,
  shellCachePreexisted,
  openCache,
  deleteCache,
  cacheFiles,
  skipWaiting,
}) {
  const sharedShell = manifest?.shared?.shell
  if (!Array.isArray(sharedShell) || sharedShell.length === 0) {
    throw new Error('[offline] required shell manifest is empty')
  }
  const shellUrls = [
    ...sharedShell,
    ...locales.flatMap((locale) => manifest.localeShells?.[locale] ?? []),
  ]

  const expectedCount = [...new Set(shellUrls)].filter(Boolean).length
  try {
    const shellCache = await openCache(shellCacheName)
    const stats = await cacheFiles(shellCache, shellUrls, manifest.shared?.pageVersions)
    const complete =
      stats?.requested === expectedCount &&
      stats?.fulfilled === expectedCount &&
      stats?.failed === 0

    if (!complete) {
      throw new Error(
        '[offline] required shell cache incomplete: ' +
          `${stats?.fulfilled ?? 0}/${expectedCount} fulfilled, ` +
          `${stats?.failed ?? expectedCount} failed`,
      )
    }

    await skipWaiting()
    return stats
  } catch (error) {
    if (!shellCachePreexisted) {
      try {
        await deleteCache(shellCacheName)
      } catch {
        // The install still rejects, so a brand-new partial worker cannot activate.
      }
    }
    throw error
  }
}

function buildServiceWorkerSource(manifest) {
  const version = manifest.version
  const ownedSameOriginPaths = buildOwnedSameOriginPaths(manifest)
  const ownedRemoteUrls = uniqueSorted(
    (manifest.shared?.remoteAssets ?? []).filter((value) => {
      try {
        return /^https?:\/\//i.test(value) && !hasPrivateOrSignedRemoteMediaQuery(value)
      } catch {
        return false
      }
    }),
  )

  return `/* eslint-disable no-restricted-globals */
const OFFLINE_VERSION = ${JSON.stringify(version)};
const SHELL_CACHE = \`offline-shell-\${OFFLINE_VERSION}\`;
const SHELL_CACHE_PREFIX = 'offline-shell-';
const CONTENT_CACHE_PREFIX = 'offline-content-';
const CONTENT_CACHE = \`\${CONTENT_CACHE_PREFIX}\${OFFLINE_VERSION}\`;
const REMOTE_CACHE_PREFIX = 'offline-remote-';
const REMOTE_CACHE = \`\${REMOTE_CACHE_PREFIX}\${OFFLINE_VERSION}\`;
const LEGACY_CONTENT_CACHES = new Set(['offline-content']);
const LEGACY_REMOTE_CACHES = new Set(['offline-remote', 'offline-remote-v2']);
const GENERATION_CACHE = 'offline-generation';
const GENERATION_KEY = '/__offline-generation';
const OWNED_SAME_ORIGIN_PATHS = new Set(${JSON.stringify(ownedSameOriginPaths)});
const OWNED_REMOTE_URLS = new Set(${JSON.stringify(ownedRemoteUrls)});
const PAGE_VERSION_PARAM = ${JSON.stringify(PAGE_VERSION_PARAM)};
const NETWORK_TIMEOUT_MS = 5000;
let manifestPromise = null;

${hasPrivateOrSignedRemoteMediaQuery.toString()}
${installRequiredShell.toString()}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shellCachePreexisted = await caches.has(SHELL_CACHE);
    const manifest = await loadManifest();
    await installRequiredShell({
      manifest,
      locales: await installLocales(manifest),
      shellCacheName: SHELL_CACHE,
      shellCachePreexisted,
      openCache: (cacheName) => caches.open(cacheName),
      deleteCache: (cacheName) => caches.delete(cacheName),
      cacheFiles,
      skipWaiting: () => self.skipWaiting(),
    });
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Keep the previous build's caches for one generation so a tab still open
    // on that build can load its lazy chunks after the deploy removed them.
    const keepVersions = await rotateGenerations();
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        if (LEGACY_CONTENT_CACHES.has(key)) return caches.delete(key);
        if (LEGACY_REMOTE_CACHES.has(key)) return caches.delete(key);
        const prefix = [SHELL_CACHE_PREFIX, CONTENT_CACHE_PREFIX, REMOTE_CACHE_PREFIX]
          .find((candidate) => key.startsWith(candidate));
        if (!prefix || keepVersions.has(key.slice(prefix.length))) return Promise.resolve();
        return caches.delete(key);
      }),
    );
    await self.clients.claim();
  })());
});

async function rotateGenerations() {
  let previous = null;
  try {
    const generationCache = await caches.open(GENERATION_CACHE);
    const stored = await generationCache.match(GENERATION_KEY);
    const record = stored ? await stored.json() : {};
    previous = record.current && record.current !== OFFLINE_VERSION ? record.current : record.previous ?? null;
    await generationCache.put(
      GENERATION_KEY,
      new Response(JSON.stringify({ current: OFFLINE_VERSION, previous })),
    );
  } catch {
    // Without a generation record, fall back to keeping only this version.
  }
  return new Set([OFFLINE_VERSION, previous].filter(Boolean));
}

async function installLocales(manifest) {
  // Install the offline shell only for locales a visitor has open, not all six.
  const known = new Set(Object.keys(manifest.localeShells ?? {}));
  let windows = [];
  try {
    windows = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  } catch {
    // Fall back to the default locale below.
  }
  const open = windows
    .map((client) => localeFromPath(new URL(client.url).pathname))
    .filter((locale) => known.has(locale));
  if (open.length > 0) return [...new Set(open)];
  return known.has(manifest.defaultLocale) ? [manifest.defaultLocale] : [];
}

self.addEventListener('message', (event) => {
  const data = event.data ?? {};
  if (data.type === 'OFFLINE_WARM_PATH' && typeof data.pathname === 'string') {
    event.waitUntil(warmPath(data.pathname));
    return;
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    if (url.origin !== self.location.origin || !isOwnedNavigationPath(url.pathname)) return;
    event.respondWith(handleNavigation(request, url));
    return;
  }

  // Signed URLs are bearer credentials. Never claim or cache them, even if a
  // malformed or stale manifest accidentally contains the exact URL.
  if (hasPrivateOrSignedRemoteMediaQuery(url)) return;

  // dom-pub is a sibling path on the production origin. Exact remote
  // allowlisting must win before the generic same-origin sibling guard.
  if (OWNED_REMOTE_URLS.has(url.href)) {
    event.respondWith(
      isExplicitlyVersionedRemoteUrl(url)
        ? cacheFirst(request, REMOTE_CACHE, url.href)
        : networkFirst(request, REMOTE_CACHE, url.href),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    // This worker is root-scoped on GitHub Pages. Never intercept a sibling
    // project: only paths materialized in this build's manifest are owned.
    const cacheKey = ownedSameOriginCacheKey(url);
    if (!cacheKey && !url.search && url.pathname.startsWith('/_next/static/')) {
      // A tab still on the previous build asks for chunks this build no longer owns.
      event.respondWith(previousGenerationOrNetwork(request, url));
      return;
    }
    if (!cacheKey) return;
    if (isContentData(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request, CONTENT_CACHE, cacheKey, [SHELL_CACHE]));
      return;
    }
    event.respondWith(cacheFirst(request, CONTENT_CACHE, cacheKey, [SHELL_CACHE]));
    return;
  }

});

const assertManifestVersion = ${assertManifestVersion.toString()};

function assertCurrentManifest(manifest) {
  return assertManifestVersion(manifest, OFFLINE_VERSION);
}

async function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      // A restarted worker must route offline immediately. Read only from this
      // worker version's shell cache so an older manifest cannot claim routes,
      // then use a bounded network request during the first installation.
      const shellCache = await caches.open(SHELL_CACHE);
      const cached = await shellCache.match('/offline-manifest.json');
      let manifestCacheError = null;
      if (cached) {
        try {
          return assertCurrentManifest(await cached.json());
        } catch (error) {
          await shellCache.delete('/offline-manifest.json');
          // A corrupt entry may recover from the bounded live request below.
          if (error instanceof Error && error.message.includes('version mismatch')) {
            // Preserve the mismatch if a bounded recovery request is unavailable.
            manifestCacheError = error;
          }
        }
      }

      const live = await fetchWithTimeout('/offline-manifest.json', { cache: 'no-store' }).catch(() => null);
      if (live?.ok) {
        const liveForCache = live.clone();
        const manifest = assertCurrentManifest(await live.json());
        await shellCache.put('/offline-manifest.json', liveForCache);
        return manifest;
      }
      if (manifestCacheError) throw manifestCacheError;
      throw new Error('offline manifest unavailable');
    })().catch((error) => {
      manifestPromise = null;
      throw error;
    });
  }
  return manifestPromise;
}

async function warmPath(pathname) {
  const manifest = await loadManifest();
  if (!isOwnedNavigation(manifest, pathname)) return;
  const localeShell = manifest.localeShells?.[localeFromPath(pathname)];
  if (localeShell) {
    // Other locales' home and offline pages are cached lazily, on first visit there.
    await cacheFiles(await caches.open(SHELL_CACHE), localeShell, manifest.shared?.pageVersions);
  }
  const contentCache = await caches.open(CONTENT_CACHE);
  const stats = await cacheNavigationCandidates(contentCache, manifest, pathname);
  await broadcast({
    type: 'OFFLINE_CACHE_READY',
    locale: localeFromPath(pathname),
    phase: 'reading',
    completeness: stats.failed === 0 ? 'complete' : 'partial',
    requested: stats.requested,
    fulfilled: stats.fulfilled,
    failed: stats.failed,
    version: OFFLINE_VERSION,
  });
}

function pageVersionForUrl(manifest, url) {
  return manifest.shared?.pageVersions?.[url] ?? null;
}

function navigationCacheKey(candidateUrl, version) {
  if (!version) return candidateUrl;
  const separator = candidateUrl.includes('?') ? '&' : '?';
  return \`\${candidateUrl}\${separator}\${PAGE_VERSION_PARAM}=\${encodeURIComponent(version)}\`;
}

async function cacheNavigationCandidates(cache, manifest, pathname) {
  const stats = emptyStats();
  for (const candidate of knownNavigationCandidates(manifest, pathname)) {
    stats.requested += 1;
    const version = pageVersionForUrl(manifest, candidate);
    const cacheKey = navigationCacheKey(candidate, version);
    try {
      // The install shell already holds the locale home; do not download it twice.
      const cached = await matchNamedCaches(CONTENT_CACHE, cacheKey, [SHELL_CACHE]);
      if (cached) {
        stats.fulfilled += 1;
        continue;
      }
      const response = await fetch(cacheKey, { cache: 'reload' });
      if (!response?.ok) {
        stats.failed += 1;
        continue;
      }
      await cache.put(cacheKey, response.clone());
      stats.fulfilled += 1;
    } catch {
      stats.failed += 1;
    }
  }
  return stats;
}

async function cacheNavigationResponse(cache, manifest, pathname, response) {
  const stats = emptyStats();
  for (const candidate of knownNavigationCandidates(manifest, pathname)) {
    stats.requested += 1;
    const version = pageVersionForUrl(manifest, candidate);
    const cacheKey = navigationCacheKey(candidate, version);
    try {
      await cache.put(cacheKey, response.clone());
      stats.fulfilled += 1;
    } catch {
      stats.failed += 1;
    }
  }
  return stats;
}

// Pages carry the build's manifest version; a page from another deploy (CDN lag,
// a newer build behind this worker) must not be cached under this build's keys.
async function isCurrentBuildPage(response, manifest) {
  const html = await response.clone().text();
  return html.includes('<meta name="${OFFLINE_MANIFEST_VERSION_META}" content="' + manifest.version + '"');
}

async function matchNavigationCache(manifest, pathname) {
  return matchVersionedCandidates(manifest, knownNavigationCandidates(manifest, pathname));
}

async function matchVersionedCandidates(manifest, candidates) {
  for (const candidate of candidates) {
    const version = pageVersionForUrl(manifest, candidate);
    let cached = null;
    try {
      cached = await caches.match(navigationCacheKey(candidate, version));
    } catch {
      // Cache Storage is optional for runtime navigation. Continue through the
      // remaining fallbacks and ultimately return a network/503 response.
    }
    if (cached) return cached;
  }
  return null;
}

function navigationCandidates(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Keep the browser-provided path when a malformed escape cannot be decoded.
  }
  const clean = decoded === '/' ? '/' : decoded.replace(/\\/+$/, '');
  if (clean === '/') {
    return ['/index.html'];
  }
  if (/\\.html$/i.test(clean)) return [clean];
  return [\`\${clean}.html\`, \`\${clean}/index.html\`];
}

function knownNavigationCandidates(manifest, pathname) {
  const knownRoutes = new Set();

  for (const url of manifest.shared?.shell ?? []) {
    if (url.endsWith('.html')) knownRoutes.add(url);
  }

  for (const localeFiles of Object.values(manifest.locales ?? {})) {
    for (const url of localeFiles) {
      if (url.endsWith('.html')) knownRoutes.add(url);
    }
  }

  const candidates = navigationCandidates(pathname);
  return candidates.filter((candidate) => knownRoutes.has(candidate));
}

function isOwnedNavigation(manifest, pathname) {
  return knownNavigationCandidates(manifest, pathname).length > 0;
}

function decodedPathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function ownedSameOriginCacheKey(url) {
  const decodedPath = decodedPathname(url.pathname);
  const exactKey = decodedPath + url.search;
  if (OWNED_SAME_ORIGIN_PATHS.has(exactKey)) return exactKey;
  // Manifest paths normally have no query string. Do not let arbitrary query
  // variants multiply cache entries or seed a canonical key with a variant response.
  if (!url.search && OWNED_SAME_ORIGIN_PATHS.has(decodedPath)) return decodedPath;
  return null;
}

function isOwnedNavigationPath(pathname) {
  return navigationCandidates(pathname).some((candidate) => OWNED_SAME_ORIGIN_PATHS.has(candidate));
}

function isExplicitlyVersionedRemoteUrl(url) {
  if (
    ['v', 'version', 'rev', 'revision', 'hash'].some(
      (key) => (url.searchParams.get(key) ?? '').length > 0,
    )
  ) {
    return true;
  }
  const filename = url.pathname.split('/').pop() ?? '';
  return /(?:^|[._-])[a-f0-9]{12,}(?=\.[a-z0-9]+$)/i.test(filename);
}

function localeFromPath(pathname) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment || ${JSON.stringify(DEFAULT_LOCALE)};
}

function offlineFallbackCandidates(pathname) {
  const locale = localeFromPath(pathname);
  return navigationCandidates(\`/\${locale}/offline\`);
}

async function handleNavigation(request, url) {
  let manifest;
  try {
    manifest = await loadManifest();
  } catch {
    // Without a manifest we cannot establish ownership or choose a fallback.
    // Preserve normal browser/network semantics instead of claiming the path.
    return fetch(request);
  }
  if (!isOwnedNavigation(manifest, url.pathname)) {
    // The root-scoped worker also sees sibling GitHub Pages projects. Leave
    // those navigations entirely to their own origin response/error handling.
    return fetch(request);
  }
  // Build-scoped stale-while-revalidate: a hit is this build's exact HTML
  // (keys carry the page hash), so serve it at once. The browser's update check
  // after every navigation installs a newer worker when a deploy lands, so a
  // stale view lasts at most one navigation.
  const cachedPage = await matchNavigationCache(manifest, url.pathname);
  if (cachedPage) return cachedPage;
  try {
    const version = pageVersionForUrl(manifest, url.pathname);
    const requestUrl = navigationCacheKey(url.pathname + url.search, version);
    const fresh = await fetchWithTimeout(requestUrl, { cache: 'reload' });
    if (fresh?.ok) {
      try {
        if (await isCurrentBuildPage(fresh, manifest)) {
          const contentCache = await caches.open(CONTENT_CACHE);
          await cacheNavigationResponse(contentCache, manifest, url.pathname, fresh);
        }
      } catch {
        // Runtime navigation caching is best-effort. Preserve the successful
        // response when Cache Storage is disabled or unavailable.
      }
      return fresh;
    }

    const fallback = await matchVersionedCandidates(manifest, offlineFallbackCandidates(url.pathname));
    if (fallback) return fallback;

    const rootFallback = await matchVersionedCandidates(manifest, navigationCandidates('/${DEFAULT_LOCALE}/offline'));
    if (rootFallback) return rootFallback;

    return fresh ?? new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    const fallback = await matchVersionedCandidates(manifest, offlineFallbackCandidates(url.pathname));
    if (fallback) return fallback;

    const rootFallback = await matchVersionedCandidates(manifest, navigationCandidates('/${DEFAULT_LOCALE}/offline'));
    if (rootFallback) return rootFallback;

    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function previousGenerationOrNetwork(request, url) {
  try {
    const cached = await caches.match(decodedPathname(url.pathname));
    if (cached) return cached;
  } catch {
    // Cache Storage is optional; fall through to the network.
  }
  return fetch(request);
}

async function matchRuntimeCache(cacheName, cacheKey) {
  try {
    const cache = await caches.open(cacheName);
    return (await cache.match(cacheKey)) ?? null;
  } catch {
    // Runtime caching is optional. Storage-disabled or private-mode failures
    // must fall through to the network path.
    return null;
  }
}

async function matchNamedCaches(cacheName, cacheKey, fallbackCacheNames = []) {
  const primary = await matchRuntimeCache(cacheName, cacheKey);
  if (primary) return primary;
  for (const fallbackCacheName of fallbackCacheNames) {
    const fallback = await matchRuntimeCache(fallbackCacheName, cacheKey);
    if (fallback) return fallback;
  }
  return null;
}

async function putRuntimeResponse(cacheName, cacheKey, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(cacheKey, response.clone());
  } catch {
    // Runtime caching is an optimization. Quota limits, private browsing, or
    // storage failures must not replace a valid network response with an error.
  }
}

async function cacheFirst(request, cacheName, cacheKey = request, fallbackCacheNames = []) {
  const cached = await matchNamedCaches(cacheName, cacheKey, fallbackCacheNames);
  if (cached) return cached;

  const response = await fetch(request);
  if (response?.ok) {
    await putRuntimeResponse(cacheName, cacheKey, response);
  }
  return response;
}

async function fetchWithTimeout(request, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    return await fetch(request, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function networkFirst(request, cacheName, cacheKey = request) {
  try {
    const response = await fetchWithTimeout(request);
    if (response?.ok) await putRuntimeResponse(cacheName, cacheKey, response);
    if (response) return response;
  } catch {
    // Fall through to the current manifest version's offline copy.
  }
  const cached = await matchRuntimeCache(cacheName, cacheKey);
  if (cached) return cached;
  throw new Error('network unavailable');
}

async function staleWhileRevalidate(request, cacheName, cacheKey = request, fallbackCacheNames = []) {
  const cached = await matchNamedCaches(cacheName, cacheKey, fallbackCacheNames);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response?.ok) {
        await putRuntimeResponse(cacheName, cacheKey, response);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    refresh.catch(() => null);
    return cached;
  }

  const fresh = await refresh;
  if (fresh) return fresh;
  throw new Error('network unavailable');
}

function isContentData(pathname) {
  return (
    pathname.endsWith('.txt') ||
    pathname.endsWith('.json')
  );
}

function emptyStats() {
  return {
    requested: 0,
    fulfilled: 0,
    failed: 0,
  };
}

function cacheKeyForUrl(url, pageVersions) {
  const version = pageVersions?.[url] ?? null;
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return url + separator + PAGE_VERSION_PARAM + '=' + encodeURIComponent(version);
}

async function cacheFiles(cache, urls, pageVersions = null) {
  const unique = [...new Set(urls)].filter(Boolean);
  const stats = emptyStats();
  const batchSize = 12;
  for (let index = 0; index < unique.length; index += batchSize) {
    const batch = unique.slice(index, index + batchSize);
    await Promise.all(batch.map(async (url) => {
      stats.requested += 1;
      const cacheKey = cacheKeyForUrl(url, pageVersions);
      try {
        const cached = await cache.match(cacheKey);
        if (cached) {
          stats.fulfilled += 1;
          return;
        }
        // Shell URLs are content-hashed (/_next/static), carry the page hash
        // (__offlineVersion), or are icons where a copy within max-age is fine.
        // The default cache mode reuses what the page just downloaded instead
        // of fetching it a second time.
        const response = await fetch(cacheKey, { mode: 'cors' });
        if (!response) {
          stats.failed += 1;
          return;
        }
        if (!response.ok || response.type === 'opaque') {
          stats.failed += 1;
          return;
        }
        await cache.put(cacheKey, response.clone());
        stats.fulfilled += 1;
      } catch {
        // Record individual misses; the caller decides whether the batch is required.
        stats.failed += 1;
      }
    }));
  }
  return stats;
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const client of clients) client.postMessage(message);
}

`
}

export async function generateOfflineArtifacts({ outDir = OUT_DIR, artifactIndex } = {}) {
  try {
    await fs.access(outDir)
  } catch {
    return { skipped: true }
  }

  const index = artifactIndex ?? (await createArtifactIndex(outDir))
  if (path.resolve(index.root) !== path.resolve(outDir)) {
    throw new Error('[postbuild-offline] artifact index root does not match outDir')
  }
  await Promise.all([
    removeCdnBackedExportAssets(outDir, index),
    pruneBuildOnlyExportAssets(outDir, index),
  ])
  const relativeFiles = index.files()
  const [appVersion, remoteAssets, pageVersions, shell, localeShells] = await Promise.all([
    readAppVersion(),
    readRemoteGalleryAssets(index),
    buildPageVersions(relativeFiles, index),
    deriveInstallShell(index),
    deriveLocaleShells(index),
  ])
  // Reading routes already ship their content in static HTML, so warming the
  // document set is enough for offline reading without fetching auxiliary data.
  const readingData = []
  const readingAssets = uniqueSorted(relativeFiles.filter(isReadingAsset).map(routeUrlFromOutFile))
  const extendedAssets = uniqueSorted(relativeFiles.filter(isExtendedAsset).map(routeUrlFromOutFile))
  const runtimeAssets = uniqueSorted(relativeFiles.filter(isRuntimeAsset).map(routeUrlFromOutFile))

  const locales = {}
  for (const locale of LOCALES) {
    locales[locale] = uniqueSorted(
      relativeFiles.filter((relativePath) => isLocaleOfflineFile(relativePath, locale)).map(routeUrlFromOutFile),
    )
  }

  const manifestVersion = buildManifestVersion({
    appVersion,
    shell,
    localeShells,
    readingData,
    readingAssets,
    extendedAssets,
    runtimeAssets,
    remoteAssets,
    pageVersions,
  })

  const manifest = {
    version: manifestVersion,
    defaultLocale: DEFAULT_LOCALE,
    locales,
    localeShells,
    shared: {
      shell,
      readingData,
      readingAssets,
      extendedAssets,
      runtimeAssets,
      remoteAssets,
      pageVersions,
    },
  }

  await index.write('offline-manifest.json', `${JSON.stringify(manifest)}\n`)
  await writeOfflineManifestVersion(relativeFiles, manifest.version, index)
  await index.write('sw.js', buildServiceWorkerSource(manifest))

  return {
    skipped: false,
    manifest,
    inventoryMetrics: index.metrics(),
  }
}

async function main() {
  const result = await generateOfflineArtifacts()
  if (result.skipped) {
    console.warn(`[postbuild-offline] skip: ${OUT_DIR} does not exist`)
    return
  }

  console.log(
    `[postbuild-offline] wrote offline-manifest.json and sw.js for ${LOCALES.length} locales ` +
      `(install shell ${result.manifest.shared.shell.length}/${result.manifest.shared.runtimeAssets.length} runtime assets)`,
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[postbuild-offline] failed:', error)
    process.exit(1)
  })
}
