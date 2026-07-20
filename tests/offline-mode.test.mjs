import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("offline mode wires bounded cache warming and owned-route fallbacks", async () => {
  const [
    packageJson,
    buildScript,
    offlineScript,
    offlineVerifyScript,
    manifestRoute,
    localePage,
    rootLayout,
    siteLayout,
    swRoute,
    offlinePage,
    offlineNavigationCapture,
    offlineBanner,
    postStats,
    enMessages,
    viMessages
  ] = await Promise.all([
    readFile("package.json", "utf8"),
    readFile("scripts/build-og.mjs", "utf8"),
    readFile("scripts/postbuild-offline.mjs", "utf8"),
    readFile("scripts/verify-offline.mjs", "utf8"),
    readFile("src/app/manifest.ts", "utf8"),
    readFile("src/app/[locale]/(site)/page.tsx", "utf8"),
    readFile("src/app/[locale]/layout.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/layout.tsx", "utf8"),
    readFile("src/app/sw.js/route.ts", "utf8"),
    readFile("src/app/[locale]/(site)/offline/page.tsx", "utf8"),
    readFile("src/components/offline/OfflineNavigationCapture.tsx", "utf8"),
    readFile("src/components/offline/OfflineStatusBanner.tsx", "utf8"),
    readFile("src/lib/engagement/firebase-repository.ts", "utf8"),
    readFile("messages/en.json", "utf8"),
    readFile("messages/vi.json", "utf8")
  ]);

  const en = JSON.parse(enMessages);
  const vi = JSON.parse(viMessages);
  const pkg = JSON.parse(packageJson);
  const exactRemoteHandlerIndex = offlineScript.indexOf(
    "if (OWNED_REMOTE_URLS.has(url.href))"
  );
  const genericSameOriginHandlerIndex = offlineScript.indexOf(
    "if (url.origin === self.location.origin)"
  );

  assert.match(buildScript, /runPostbuildTransforms\(\{/);
  assert.match(buildScript, /acquireLock: false/);
  assert.doesNotMatch(
    buildScript,
    /run\(process\.execPath, \['scripts\/postbuild\.mjs'\]/
  );
  assert.doesNotMatch(buildScript, /scripts\/postbuild-offline\.mjs/);
  assert.equal(
    pkg.scripts["verify:offline"],
    "node scripts/verify-offline.mjs"
  );
  assert.equal(
    pkg.scripts.quality,
    "npm run check && npm run build:fast && npm run verify:pagination && npm run verify:artifact && npm run verify:performance-artifact && npm run verify:runtime-boundaries && npm run verify:offline"
  );

  assert.match(offlineScript, /offline-manifest\.json/);
  assert.match(offlineScript, /deriveInstallShell/);
  assert.match(offlineScript, /runtimeAssets/);
  assert.doesNotMatch(offlineScript, /OFFLINE_WARM_LOCALE/);
  assert.match(offlineScript, /OFFLINE_WARM_PATH/);
  assert.match(offlineScript, /OFFLINE_CACHE_READY/);
  assert.match(offlineScript, /offlineFallbackCandidates/);
  assert.match(offlineScript, /pageVersions/);
  assert.match(offlineScript, /cache\.match\(cacheKey\)/);
  assert.match(offlineScript, /manifest\.shared\?\.readingData/);
  assert.match(offlineScript, /manifest\.shared\?\.readingAssets/);
  assert.match(offlineScript, /completeness: stats\.failed === 0/);
  assert.match(
    offlineScript,
    /const CONTENT_CACHE_PREFIX = 'offline-content-'/
  );
  assert.match(offlineScript, /CONTENT_CACHE_PREFIX.*OFFLINE_VERSION/);
  assert.match(
    offlineScript,
    /LEGACY_CONTENT_CACHES = new Set\(\['offline-content'\]\)/
  );
  assert.match(offlineScript, /const REMOTE_CACHE_PREFIX = 'offline-remote-'/);
  assert.match(offlineScript, /REMOTE_CACHE_PREFIX.*OFFLINE_VERSION/);
  assert.match(
    offlineScript,
    /key\.startsWith\(CONTENT_CACHE_PREFIX\) && key !== CONTENT_CACHE/
  );
  assert.match(offlineScript, /LEGACY_CONTENT_CACHES\.has\(key\)/);
  assert.match(offlineScript, /LEGACY_REMOTE_CACHES\.has\(key\)/);
  assert.match(
    offlineScript,
    /key\.startsWith\(REMOTE_CACHE_PREFIX\) && key !== REMOTE_CACHE/
  );
  assert.match(offlineScript, /OWNED_SAME_ORIGIN_PATHS/);
  assert.match(offlineScript, /OWNED_REMOTE_URLS/);
  assert.match(offlineScript, /OWNED_REMOTE_URLS\.has\(url\.href\)/);
  assert.match(offlineScript, /hasPrivateOrSignedRemoteMediaQuery/);
  assert.match(
    offlineScript,
    /if \(hasPrivateOrSignedRemoteMediaQuery\(url\)\) return/,
  );
  assert.ok(exactRemoteHandlerIndex >= 0);
  assert.ok(exactRemoteHandlerIndex < genericSameOriginHandlerIndex);
  assert.match(offlineScript, /isExplicitlyVersionedRemoteUrl/);
  assert.match(
    offlineScript,
    /networkFirst\(request, REMOTE_CACHE, url\.href\)/
  );
  assert.match(offlineScript, /ownedSameOriginCacheKey/);
  assert.match(offlineScript, /cacheFirst\(request, CONTENT_CACHE, cacheKey, \[SHELL_CACHE\]\)/);
  assert.match(offlineScript, /matchNamedCaches/);
  assert.match(
    offlineScript,
    /if \(!url\.search && OWNED_SAME_ORIGIN_PATHS\.has\(decodedPath\)\)/
  );
  assert.doesNotMatch(offlineScript, /allowlistedRemoteAssets/);
  assert.match(offlineScript, /!isOwnedNavigationPath\(url\.pathname\)/);
  assert.match(offlineScript, /if \(!cacheKey\) return/);
  assert.doesNotMatch(offlineScript, /function isKnownRemoteAsset/);
  assert.doesNotMatch(offlineScript, /function isStaticAsset/);
  assert.match(offlineScript, /PAGE_VERSION_PARAM/);
  assert.match(offlineScript, /OFFLINE_HTML_CONCURRENCY/);
  assert.match(offlineScript, /mapWithConcurrency/);
  assert.doesNotMatch(offlineScript, /function pruneCache/);
  assert.doesNotMatch(offlineScript, /function buildContentAllowList/);
  assert.match(offlineScript, /knownNavigationCandidates/);
  assert.match(offlineScript, /isOwnedNavigation/);
  assert.match(
    offlineScript,
    /if \(!isOwnedNavigation\(manifest, url\.pathname\)\)/
  );
  assert.match(offlineScript, /return fetch\(request\)/);
  assert.match(
    offlineScript,
    /Without a manifest we cannot establish ownership/
  );
  assert.match(
    offlineScript,
    /const shellCache = await caches\.open\(SHELL_CACHE\)/
  );
  assert.match(
    offlineScript,
    /const cached = await shellCache\.match\('\/offline-manifest\.json'\)/
  );
  assert.match(offlineScript, /fetchWithTimeout\('\/offline-manifest\.json'/);
  assert.doesNotMatch(offlineScript, /fetch\('\/offline-manifest\.json'/);
  assert.match(offlineScript, /assertManifestVersion\(manifest, OFFLINE_VERSION\)/);
  assert.match(offlineScript, /await shellCache\.put\('\/offline-manifest\.json', liveForCache\)/);
  assert.match(offlineScript, /pageVersionForHtml/);
  assert.match(offlineScript, /stripOfflineManifestVersion/);
  assert.doesNotMatch(offlineScript, /mtimeMs/);
  assert.doesNotMatch(offlineScript, /mode: allowOpaque \? 'no-cors'/);
  assert.match(offlineScript, /OFFLINE_HTML_CONCURRENCY/);
  assert.match(offlineScript, /mapWithConcurrency/);

  assert.match(offlineVerifyScript, /playwright/);
  assert.match(offlineVerifyScript, /serviceWorker\.controller/);
  assert.match(offlineVerifyScript, /offline-page-shell/);
  assert.match(offlineVerifyScript, /waitForCachedNavigation/);
  assert.match(offlineVerifyScript, /dom-pub\/offline-probe/);
  assert.match(offlineVerifyScript, /\/\$\{LOCALE\}\/notes/);
  assert.match(offlineVerifyScript, /pageVersions/);
  assert.match(offlineVerifyScript, /offline-manifest-version/);

  assert.match(manifestRoute, /export const dynamic = 'force-static'/);
  assert.match(manifestRoute, /start_url: '\/en'/);
  assert.match(manifestRoute, /display: 'standalone'/);

  assert.match(localePage, /export function generateStaticParams\(\)/);
  assert.match(localePage, /PageTracker page="home" eventName="page_view"/);

  assert.match(rootLayout, /manifest: '\/manifest\.webmanifest'/);
  assert.match(siteLayout, /<OfflineNavigationCapture \/>/);
  assert.match(siteLayout, /<OfflineStatusBanner \/>/);

  assert.match(swRoute, /export const dynamic = 'force-static'/);
  assert.match(swRoute, /Development fallback only/);

  assert.match(
    offlinePage,
    /PageTracker page="offline" eventName="offline_view"/
  );
  assert.match(offlinePage, /APP_ROUTE\.BLOG/);
  assert.match(offlinePage, /APP_ROUTE\.NOTES/);

  assert.match(offlineBanner, /offline-manifest-version/);
  assert.match(offlineBanner, /serviceWorkerUrl\(\)/);
  assert.match(
    offlineBanner,
    /navigator\.serviceWorker\.register\(serviceWorkerUrl\(\)\)/
  );
  assert.doesNotMatch(offlineBanner, /OFFLINE_WARM_LOCALE/);
  assert.match(offlineBanner, /OFFLINE_WARM_PATH/);
  assert.match(offlineBanner, /offline-locale-state:v2:/);
  assert.match(offlineBanner, /offline-banner-dismissed:v1:/);
  assert.match(offlineBanner, /completeness/);
  assert.match(offlineBanner, /window\.navigator\.onLine/);
  assert.match(offlineBanner, /if \(isOnline \|\| isDismissed\) return null/);
  assert.match(offlineBanner, /offline_banner_dismiss/);
  assert.match(offlineNavigationCapture, /navigator\.onLine/);
  assert.match(offlineNavigationCapture, /window\.location\.assign/);

  assert.match(postStats, /navigator\.onLine === false/);

  assert.ok(en.Offline?.banner?.partial);
  assert.ok(en.Offline?.banner?.dismiss);
  assert.ok(en.Offline?.banner?.syncing);
  assert.ok(en.Offline?.page?.title);
  assert.ok(vi.Offline?.banner?.partial);
  assert.ok(vi.Offline?.banner?.offlineReady);
  assert.ok(vi.Offline?.banner?.dismiss);
  assert.ok(vi.Offline?.page?.title);
});
