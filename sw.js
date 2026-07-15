/* eslint-disable no-restricted-globals */
const OFFLINE_VERSION = "d194eb34a3b5b8cb";
const SHELL_CACHE = `offline-shell-${OFFLINE_VERSION}`;
const SHELL_CACHE_PREFIX = 'offline-shell-';
const CONTENT_CACHE = 'offline-content';
const REMOTE_CACHE = 'offline-remote';
const PAGE_VERSION_PARAM = "__offlineVersion";
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
    const localeFiles = manifest.locales?.[locale] ?? manifest.locales?.["en"] ?? [];

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
  return `${candidateUrl}${separator}${PAGE_VERSION_PARAM}=${encodeURIComponent(version)}`;
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
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (clean === '/') {
    return ['/index.html'];
  } else {
    return [`${clean}.html`, `${clean}/index.html`];
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
  return segment || "en";
}

function offlineFallbackCandidates(pathname) {
  const locale = localeFromPath(pathname);
  return navigationCandidates(`/${locale}/offline`);
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

    const rootFallback = await matchVersionedCandidates(manifest, navigationCandidates('/en/offline'));
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

    const rootFallback = await matchVersionedCandidates(manifest, navigationCandidates('/en/offline'));
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
    /\.(?:png|jpg|jpeg|webp|gif|svg|ico|css|js|woff2?|ttf|otf|xml|pdf)$/i.test(pathname)
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
    (url.hostname === 'nguyenlephong.github.io' &&
      url.pathname.startsWith('/dom-pub/')) ||
    (url.hostname === 'raw.githubusercontent.com' &&
      url.pathname.startsWith('/nguyenlephong/dom-pub/'))
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
