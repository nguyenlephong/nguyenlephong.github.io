#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.resolve(ROOT, 'out')
const APP_VERSION_FILE = path.resolve(ROOT, 'app-version.json')
const GALLERY_FILE = path.resolve(ROOT, 'src/content/gallery.ts')
const APP_CONF_FILE = path.resolve(ROOT, 'src/app/app.conf.ts')
const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const DEFAULT_LOCALE = 'en'
const PAGE_VERSION_PARAM = '__offlineVersion'
const OFFLINE_MANIFEST_VERSION_META = 'offline-manifest-version'
const HTML_FILE_CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.OFFLINE_HTML_CONCURRENCY ?? '16', 10) || 16,
)
const CDN_BACKED_EXPORT_PATHS = ['og', 'assets/blog', 'assets/notes', 'assets/photos']

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
  return (
    relativePath.startsWith('assets/photos/') ||
    relativePath === 'assets/full-bg.svg'
  )
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

function joinUrl(base, assetPath) {
  return `${base.replace(/\/+$/, '')}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`
}

async function readRemoteGalleryAssets() {
  const [gallerySource, appConfSource] = await Promise.all([
    fs.readFile(GALLERY_FILE, 'utf8'),
    fs.readFile(APP_CONF_FILE, 'utf8'),
  ])

  const remoteAssets = []
  const icdnMatch = appConfSource.match(/ICDN_BASE_URL\s*=\s*"([^"]+)"/)
  if (icdnMatch) {
    const icdnBase = icdnMatch[1]
    const icdnPathPattern = /icdnAssetUrl\(\s*["']([^"']+)["']\s*\)/g
    for (const match of gallerySource.matchAll(icdnPathPattern)) {
      remoteAssets.push(joinUrl(icdnBase, match[1]))
    }
  }

  const cdnMatch = appConfSource.match(/CDN_PATH\s*=\s*"([^"]+)"/)
  if (!cdnMatch) return uniqueSorted(remoteAssets)

  const cdnBase = cdnMatch[1]
  const pathPattern = /CDN_PATH\s*\+\s*"([^"]+)"/g
  for (const match of gallerySource.matchAll(pathPattern)) {
    const assetPath = match[1]
    remoteAssets.push(joinUrl(cdnBase, assetPath))
  }

  return uniqueSorted(remoteAssets)
}

async function buildPageVersions(relativeFiles) {
  const pageVersions = {}
  const htmlFiles = relativeFiles
    .filter((relativePath) => relativePath.endsWith('.html'))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

  await mapWithConcurrency(htmlFiles, HTML_FILE_CONCURRENCY, async (relativePath) => {
    const fullPath = path.join(OUT_DIR, relativePath)
    const content = await fs.readFile(fullPath)
    pageVersions[routeUrlFromOutFile(relativePath)] = hashContent(content)
  })

  return pageVersions
}

function buildManifestVersion({ appVersion, shell, readingData, readingAssets, extendedAssets, remoteAssets, pageVersions }) {
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
  const metaPattern = new RegExp(
    `<meta\\s+name=["']${OFFLINE_MANIFEST_VERSION_META}["'][^>]*>`,
    'i',
  )

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

  await mapWithConcurrency(htmlFiles, HTML_FILE_CONCURRENCY, async (relativePath) => {
    const fullPath = path.join(OUT_DIR, relativePath)
    const html = await fs.readFile(fullPath, 'utf8')
    const nextHtml = injectOfflineManifestVersion(html, version)
    if (nextHtml !== html) {
      await fs.writeFile(fullPath, nextHtml, 'utf8')
    }
  })
}

function buildServiceWorkerSource(version) {
  return `/* eslint-disable no-restricted-globals */
const OFFLINE_VERSION = ${JSON.stringify(version)};
const SHELL_CACHE = \`offline-shell-\${OFFLINE_VERSION}\`;
const SHELL_CACHE_PREFIX = 'offline-shell-';
const CONTENT_CACHE = 'offline-content';
const REMOTE_CACHE = 'offline-remote';
const PAGE_VERSION_PARAM = ${JSON.stringify(PAGE_VERSION_PARAM)};
let manifestPromise = null;
const localeWarmups = new Map();

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const manifest = await loadManifest();
    const shellCache = await caches.open(SHELL_CACHE);
    await cacheFiles(shellCache, manifest.shared.shell, false, manifest.shared.pageVersions);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
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
  if (data.type === 'OFFLINE_WARM_LOCALE' && typeof data.locale === 'string') {
    event.waitUntil(warmLocale(data.locale, typeof data.pathname === 'string' ? data.pathname : null));
    return;
  }
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
    event.respondWith(handleNavigation(request, url));
    return;
  }

  if (url.origin === self.location.origin) {
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirst(request, CONTENT_CACHE));
      return;
    }
    if (isContentData(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request, CONTENT_CACHE));
      return;
    }
    return;
  }

  if (isKnownRemoteAsset(url)) {
    event.respondWith(cacheFirst(request, REMOTE_CACHE, true));
  }
});

async function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      const live = await fetch('/offline-manifest.json', { cache: 'no-store' }).catch(() => null);
      if (live?.ok) return live.json();

      const cached = await caches.match('/offline-manifest.json');
      if (!cached) throw new Error('offline manifest unavailable');
      return cached.json();
    })();
  }
  return manifestPromise;
}

async function warmLocale(locale, pathname) {
  if (localeWarmups.has(locale)) {
    if (pathname) {
      const pending = localeWarmups.get(locale);
      await pending;
      await warmPath(pathname);
    }
    return;
  }

  const job = (async () => {
    const manifest = await loadManifest();
    const contentCache = await caches.open(CONTENT_CACHE);
    const localeFiles = manifest.locales?.[locale] ?? manifest.locales?.[${JSON.stringify(
      DEFAULT_LOCALE,
    )}] ?? [];

    const readingStats = mergeStats(
      await cacheFiles(contentCache, manifest.shared.readingData),
      await cacheFiles(contentCache, localeFiles, false, manifest.shared.pageVersions),
      pathname ? await cacheNavigationCandidates(contentCache, manifest, pathname) : emptyStats(),
    );
    await broadcast({
      type: 'OFFLINE_CACHE_READY',
      locale,
      phase: 'reading',
      completeness: completenessFromStats(readingStats),
      requested: readingStats.requested,
      fulfilled: readingStats.fulfilled,
      failed: readingStats.failed,
      version: OFFLINE_VERSION,
    });

    const remoteCache = await caches.open(REMOTE_CACHE);
    const extendedStats = mergeStats(
      readingStats,
      await cacheFiles(contentCache, manifest.shared.readingAssets),
      await cacheFiles(contentCache, manifest.shared.extendedAssets),
      await cacheFiles(remoteCache, manifest.shared.remoteAssets, true),
    );
    if (completenessFromStats(extendedStats) === 'complete') {
      await pruneCache(contentCache, buildContentAllowList(manifest));
      await pruneCache(remoteCache, new Set(manifest.shared.remoteAssets ?? []));
    }
    await broadcast({
      type: 'OFFLINE_CACHE_READY',
      locale,
      phase: 'extended',
      completeness: completenessFromStats(extendedStats),
      requested: extendedStats.requested,
      fulfilled: extendedStats.fulfilled,
      failed: extendedStats.failed,
      version: OFFLINE_VERSION,
    });
  })();

  localeWarmups.set(locale, job);
  try {
    await job;
  } finally {
    localeWarmups.delete(locale);
  }
}

async function warmPath(pathname) {
  const manifest = await loadManifest();
  const contentCache = await caches.open(CONTENT_CACHE);
  await cacheNavigationCandidates(contentCache, manifest, pathname);
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
  const clean = pathname === '/' ? '/' : pathname.replace(/\\/+$/, '');
  if (clean === '/') {
    return ['/index.html'];
  } else {
    return [\`\${clean}.html\`, \`\${clean}/index.html\`];
  }
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
  const existing = candidates.filter((candidate) => knownRoutes.has(candidate));
  return existing.length > 0 ? existing : candidates;
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
  const manifest = await loadManifest();
  try {
    const version = pageVersionForUrl(manifest, url.pathname);
    const requestUrl = navigationCacheKey(url.pathname + url.search, version);
    const fresh = await fetch(requestUrl, { cache: 'reload' });
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

async function cacheFirst(request, cacheName, allowOpaque = false) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && (response.ok || (allowOpaque && response.type === 'opaque'))) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response?.ok) {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
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

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/favicon/') ||
    pathname.startsWith('/og/') ||
    pathname.startsWith('/og-cache/') ||
    /\\.(?:png|jpg|jpeg|webp|gif|svg|ico|css|js|woff2?|ttf|otf|xml|pdf)$/i.test(pathname)
  );
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

function isKnownRemoteAsset(url) {
  return (
    url.hostname === 'cdn.jsdelivr.net' &&
    url.pathname.includes('/gh/nguyenlephong/dom-pub')
  );
}

function emptyStats() {
  return {
    requested: 0,
    fulfilled: 0,
    failed: 0,
  };
}

function mergeStats(...statsList) {
  return statsList.reduce((merged, stats) => ({
    requested: merged.requested + (stats?.requested ?? 0),
    fulfilled: merged.fulfilled + (stats?.fulfilled ?? 0),
    failed: merged.failed + (stats?.failed ?? 0),
  }), emptyStats());
}

function completenessFromStats(stats) {
  return stats.failed === 0 ? 'complete' : 'partial';
}

function buildContentAllowList(manifest) {
  const allowed = new Set([
    ...(manifest.shared?.readingData ?? []),
    ...(manifest.shared?.readingAssets ?? []),
    ...(manifest.shared?.extendedAssets ?? []),
  ]);

  for (const localeFiles of Object.values(manifest.locales ?? {})) {
    for (const url of localeFiles) {
      allowed.add(url);
    }
  }

  return allowed;
}

function cacheKeyForUrl(url, pageVersions) {
  const version = pageVersions?.[url] ?? null;
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return url + separator + PAGE_VERSION_PARAM + '=' + encodeURIComponent(version);
}

async function cacheFiles(cache, urls, allowOpaque = false, pageVersions = null) {
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
          mode: allowOpaque ? 'no-cors' : 'cors',
          cache: 'reload',
        });
        if (!response) {
          stats.failed += 1;
          return;
        }
        if (!response.ok && !(allowOpaque && response.type === 'opaque')) {
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

async function pruneCache(cache, allowedUrls) {
  const requests = await cache.keys();
  await Promise.all(
    requests.map(async (request) => {
      const url = new URL(request.url);
      const cacheKey =
        url.origin === self.location.origin
          ? url.pathname
          : request.url;
      if (allowedUrls.has(cacheKey)) return;
      await cache.delete(request);
    }),
  );
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
  const shell = uniqueSorted(
    ['/offline-manifest.json', ...relativeFiles.filter(isCoreSharedFile).map(routeUrlFromOutFile)],
  )
  // Reading routes already ship their content in static HTML, so warming the
  // document set is enough for offline reading without fetching auxiliary data.
  const readingData = []
  const readingAssets = uniqueSorted(
    relativeFiles.filter(isReadingAsset).map(routeUrlFromOutFile),
  )
  const extendedAssets = uniqueSorted(
    relativeFiles.filter(isExtendedAsset).map(routeUrlFromOutFile),
  )

  const locales = {}
  for (const locale of LOCALES) {
    locales[locale] = uniqueSorted(
      relativeFiles
        .filter((relativePath) => isLocaleOfflineFile(relativePath, locale))
        .map(routeUrlFromOutFile),
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

  await fs.writeFile(
    path.join(OUT_DIR, 'offline-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )
  await writeOfflineManifestVersion(relativeFiles, manifest.version)
  await fs.writeFile(
    path.join(OUT_DIR, 'sw.js'),
    buildServiceWorkerSource(manifest.version),
    'utf8',
  )

  console.log(
    `[postbuild-offline] wrote offline-manifest.json and sw.js for ${LOCALES.length} locales`,
  )
}

main().catch((error) => {
  console.error('[postbuild-offline] failed:', error)
  process.exit(1)
})
