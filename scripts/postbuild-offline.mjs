#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.cwd()
const OUT_DIR = path.resolve(ROOT, 'out')
const APP_VERSION_FILE = path.resolve(ROOT, 'app-version.json')
const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const DEFAULT_LOCALE = 'en'
const PAGE_VERSION_PARAM = '__offlineVersion'
const OFFLINE_MANIFEST_VERSION_META = 'offline-manifest-version'
const CDN_BACKED_EXPORT_PATHS = ['og', 'assets/blog', 'assets/notes', 'assets/photos']
const DEFAULT_HTML_FILE_CONCURRENCY = 16

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else {
      files.push(full)
    }
  }
  return files
}

async function removeCdnBackedExportAssets() {
  await Promise.all(
    CDN_BACKED_EXPORT_PATHS.map((relativePath) =>
      fs.rm(path.join(OUT_DIR, relativePath), { recursive: true, force: true }),
    ),
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

function isOfflineFallbackFile(relativePath) {
  return LOCALES.some((locale) => relativePath === `${locale}/offline.html`)
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
  return relativePath.startsWith('assets/photos/') || relativePath === 'assets/full-bg.svg'
}

function isCoreSharedFile(relativePath) {
  return (
    relativePath.startsWith('_next/') ||
    relativePath.startsWith('favicon/') ||
    relativePath === 'index.html' ||
    relativePath === '404.html' ||
    relativePath === '_not-found.html' ||
    relativePath === 'favicon.ico' ||
    relativePath === 'icon.png' ||
    relativePath === 'apple-icon.png' ||
    relativePath === 'manifest.webmanifest' ||
    relativePath === 'offline-manifest.json' ||
    isOfflineFallbackFile(relativePath)
  )
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
  for (const match of html.matchAll(sourcePattern)) {
    try {
      const url = new URL(match[1])
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

async function readRemoteGalleryAssets() {
  const remoteAssets = []
  for (const locale of LOCALES) {
    try {
      const html = await fs.readFile(path.join(OUT_DIR, locale, 'gallery.html'), 'utf8')
      remoteAssets.push(...extractResolvedRemoteMediaAssets(html))
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  return uniqueSorted(remoteAssets)
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

export async function buildPageVersions(relativeFiles) {
  const htmlFiles = relativeFiles
    .filter((relativePath) => relativePath.endsWith('.html'))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const entries = new Array(htmlFiles.length)

  await mapWithConcurrency(htmlFiles, htmlFileConcurrency(), async (relativePath, index) => {
    const fullPath = path.join(OUT_DIR, relativePath)
    const html = await fs.readFile(fullPath, 'utf8')
    entries[index] = [routeUrlFromOutFile(relativePath), pageVersionForHtml(relativePath, html)]
  })

  return Object.fromEntries(entries)
}

function buildManifestVersion({
  appVersion,
  shell,
  readingData,
  readingAssets,
  extendedAssets,
  remoteAssets,
  pageVersions,
}) {
  return hashRecord({
    appVersion,
    shell,
    readingData,
    readingAssets,
    extendedAssets,
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

async function writeOfflineManifestVersion(relativeFiles, version) {
  const htmlFiles = relativeFiles
    .filter((relativePath) => relativePath.endsWith('.html'))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

  await mapWithConcurrency(htmlFiles, htmlFileConcurrency(), async (relativePath) => {
    const fullPath = path.join(OUT_DIR, relativePath)
    const html = await fs.readFile(fullPath, 'utf8')
    const nextHtml = injectOfflineManifestVersion(html, version)
    if (nextHtml !== html) {
      await fs.writeFile(fullPath, nextHtml, 'utf8')
    }
  })
}

function buildOwnedSameOriginPaths(manifest) {
  const paths = [
    ...(manifest.shared?.shell ?? []),
    ...(manifest.shared?.readingData ?? []),
    ...(manifest.shared?.readingAssets ?? []),
    ...(manifest.shared?.extendedAssets ?? []),
    ...Object.values(manifest.locales ?? {}).flat(),
  ]
  return uniqueSorted(paths.filter((url) => url.startsWith('/')))
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
const OWNED_SAME_ORIGIN_PATHS = new Set(${JSON.stringify(ownedSameOriginPaths)});
const OWNED_REMOTE_URLS = new Set(${JSON.stringify(ownedRemoteUrls)});
const PAGE_VERSION_PARAM = ${JSON.stringify(PAGE_VERSION_PARAM)};
const NETWORK_TIMEOUT_MS = 5000;
let manifestPromise = null;

${hasPrivateOrSignedRemoteMediaQuery.toString()}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const manifest = await loadManifest();
    const shellCache = await caches.open(SHELL_CACHE);
    await cacheFiles(shellCache, manifest.shared.shell, manifest.shared.pageVersions);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        if (LEGACY_CONTENT_CACHES.has(key)) return caches.delete(key);
        if (LEGACY_REMOTE_CACHES.has(key)) return caches.delete(key);
        if (key.startsWith(CONTENT_CACHE_PREFIX) && key !== CONTENT_CACHE) {
          return caches.delete(key);
        }
        if (key.startsWith(REMOTE_CACHE_PREFIX) && key !== REMOTE_CACHE) {
          return caches.delete(key);
        }
        if (!key.startsWith(SHELL_CACHE_PREFIX)) return Promise.resolve();
        if (key === SHELL_CACHE) return Promise.resolve();
        return caches.delete(key);
      }),
    );
    await self.clients.claim();
  })());
});

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
      const cached = await cache.match(cacheKey);
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

async function matchNavigationCache(manifest, pathname) {
  return matchVersionedCandidates(manifest, knownNavigationCandidates(manifest, pathname));
}

async function matchVersionedCandidates(manifest, candidates) {
  for (const candidate of candidates) {
    const version = pageVersionForUrl(manifest, candidate);
    const cached = await caches.match(navigationCacheKey(candidate, version));
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
  try {
    const version = pageVersionForUrl(manifest, url.pathname);
    const requestUrl = navigationCacheKey(url.pathname + url.search, version);
    const fresh = await fetchWithTimeout(requestUrl, { cache: 'reload' });
    const contentCache = await caches.open(CONTENT_CACHE);
    if (fresh?.ok) {
      await cacheNavigationResponse(contentCache, manifest, url.pathname, fresh);
      return fresh;
    }

    const cached = await matchNavigationCache(manifest, url.pathname);
    if (cached) return cached;

    const fallback = await matchVersionedCandidates(manifest, offlineFallbackCandidates(url.pathname));
    if (fallback) return fallback;

    const rootFallback = await matchVersionedCandidates(manifest, navigationCandidates('/${DEFAULT_LOCALE}/offline'));
    if (rootFallback) return rootFallback;

    return fresh ?? new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    const cached = await matchNavigationCache(manifest, url.pathname);
    if (cached) return cached;

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

async function matchNamedCaches(cacheName, cacheKey, fallbackCacheNames = []) {
  const cache = await caches.open(cacheName);
  const primary = await cache.match(cacheKey);
  if (primary) return primary;
  for (const fallbackCacheName of fallbackCacheNames) {
    const fallbackCache = await caches.open(fallbackCacheName);
    const fallback = await fallbackCache.match(cacheKey);
    if (fallback) return fallback;
  }
  return null;
}

async function cacheFirst(request, cacheName, cacheKey = request, fallbackCacheNames = []) {
  const cached = await matchNamedCaches(cacheName, cacheKey, fallbackCacheNames);
  if (cached) return cached;

  const response = await fetch(request);
  if (response?.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(cacheKey, response.clone());
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
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchWithTimeout(request);
    if (response?.ok) await cache.put(cacheKey, response.clone());
    if (response) return response;
  } catch {
    // Fall through to the current manifest version's offline copy.
  }
  const cached = await cache.match(cacheKey);
  if (cached) return cached;
  throw new Error('network unavailable');
}

async function staleWhileRevalidate(request, cacheName, cacheKey = request, fallbackCacheNames = []) {
  const cache = await caches.open(cacheName);
  const cached = await matchNamedCaches(cacheName, cacheKey, fallbackCacheNames);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response?.ok) {
        await cache.put(cacheKey, response.clone());
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
    pathname.startsWith('/blog-data/') ||
    pathname.startsWith('/notes-data/') ||
    pathname.startsWith('/thoughts-data/') ||
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
        const response = await fetch(cacheKey, {
          mode: 'cors',
          cache: 'reload',
        });
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
        // Ignore individual cache misses so one failed asset never blocks the pack.
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

async function main() {
  try {
    await fs.access(OUT_DIR)
  } catch {
    console.warn(`[postbuild-offline] skip: ${OUT_DIR} does not exist`)
    return
  }

  await removeCdnBackedExportAssets()
  const files = await walk(OUT_DIR)
  const relativeFiles = files.map((file) => path.relative(OUT_DIR, file))
  const [appVersion, remoteAssets, pageVersions] = await Promise.all([
    readAppVersion(),
    readRemoteGalleryAssets(),
    buildPageVersions(relativeFiles),
  ])
  const shell = uniqueSorted([
    '/offline-manifest.json',
    ...relativeFiles.filter(isCoreSharedFile).map(routeUrlFromOutFile),
  ])
  // Reading routes already ship their content in static HTML, so warming the
  // document set is enough for offline reading without fetching auxiliary data.
  const readingData = []
  const readingAssets = uniqueSorted(relativeFiles.filter(isReadingAsset).map(routeUrlFromOutFile))
  const extendedAssets = uniqueSorted(relativeFiles.filter(isExtendedAsset).map(routeUrlFromOutFile))

  const locales = {}
  for (const locale of LOCALES) {
    locales[locale] = uniqueSorted(
      relativeFiles.filter((relativePath) => isLocaleOfflineFile(relativePath, locale)).map(routeUrlFromOutFile),
    )
  }

  const manifestVersion = buildManifestVersion({
    appVersion,
    shell,
    readingData,
    readingAssets,
    extendedAssets,
    remoteAssets,
    pageVersions,
  })

  const manifest = {
    version: manifestVersion,
    defaultLocale: DEFAULT_LOCALE,
    locales,
    shared: {
      shell,
      readingData,
      readingAssets,
      extendedAssets,
      remoteAssets,
      pageVersions,
    },
  }

  await fs.writeFile(path.join(OUT_DIR, 'offline-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  await writeOfflineManifestVersion(relativeFiles, manifest.version)
  await fs.writeFile(path.join(OUT_DIR, 'sw.js'), buildServiceWorkerSource(manifest), 'utf8')

  console.log(`[postbuild-offline] wrote offline-manifest.json and sw.js for ${LOCALES.length} locales`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[postbuild-offline] failed:', error)
    process.exit(1)
  })
}
