import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("offline mode wires the export build, fallback route, and cache warmup flow", async () => {
  const [
    packageJson,
    buildScript,
    offlineScript,
    offlineVerifyScript,
    manifestRoute,
    localePage,
    layout,
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
    readFile("src/app/[locale]/page.tsx", "utf8"),
    readFile("src/app/[locale]/layout.tsx", "utf8"),
    readFile("src/app/sw.js/route.ts", "utf8"),
    readFile("src/app/[locale]/offline/page.tsx", "utf8"),
    readFile("src/components/offline/OfflineNavigationCapture.tsx", "utf8"),
    readFile("src/components/offline/OfflineStatusBanner.tsx", "utf8"),
    readFile("src/lib/firebase/postStats.ts", "utf8"),
    readFile("messages/en.json", "utf8"),
    readFile("messages/vi.json", "utf8")
  ]);

  const en = JSON.parse(enMessages);
  const vi = JSON.parse(viMessages);
  const pkg = JSON.parse(packageJson);

  assert.match(buildScript, /postbuild-offline\.mjs/);
  assert.equal(pkg.scripts["verify:offline"], "node scripts/verify-offline.mjs");
  assert.equal(
    pkg.scripts.quality,
    "npm run check && npm run build:fast && npm run verify:offline",
  );

  assert.match(offlineScript, /offline-manifest\.json/);
  assert.match(offlineScript, /OFFLINE_WARM_LOCALE/);
  assert.match(offlineScript, /OFFLINE_WARM_PATH/);
  assert.match(offlineScript, /OFFLINE_CACHE_READY/);
  assert.match(offlineScript, /offlineFallbackCandidates/);
  assert.match(offlineScript, /pageVersions/);
  assert.match(offlineScript, /cache\.match\(cacheKey\)/);
  assert.match(offlineScript, /manifest\.shared\.readingData/);
  assert.match(offlineScript, /manifest\.shared\.readingAssets/);
  assert.match(offlineScript, /completenessFromStats/);
  assert.match(offlineScript, /const CONTENT_CACHE = 'offline-content'/);
  assert.match(offlineScript, /PAGE_VERSION_PARAM/);
  assert.match(offlineScript, /pruneCache/);
  assert.match(offlineScript, /buildContentAllowList/);
  assert.match(offlineScript, /knownNavigationCandidates/);

  assert.match(offlineVerifyScript, /playwright/);
  assert.match(offlineVerifyScript, /serviceWorker\.controller/);
  assert.match(offlineVerifyScript, /offline-page-shell/);
  assert.match(offlineVerifyScript, /offline-locale-state:v2:/);
  assert.match(offlineVerifyScript, /\/\$\{LOCALE\}\/notes/);
  assert.match(offlineVerifyScript, /pageVersions/);
  assert.match(offlineVerifyScript, /offline-manifest-version/);

  assert.match(manifestRoute, /export const dynamic = 'force-static'/);
  assert.match(manifestRoute, /start_url: '\/en'/);
  assert.match(manifestRoute, /display: 'standalone'/);

  assert.match(localePage, /export function generateStaticParams\(\)/);
  assert.match(localePage, /PageTracker page="home" eventName="page_view"/);

  assert.match(layout, /manifest: '\/manifest\.webmanifest'/);
  assert.match(layout, /<OfflineNavigationCapture \/>/);
  assert.match(layout, /<OfflineStatusBanner \/>/);

  assert.match(swRoute, /export const dynamic = 'force-static'/);
  assert.match(swRoute, /Development fallback only/);

  assert.match(offlinePage, /PageTracker page="offline" eventName="offline_view"/);
  assert.match(offlinePage, /APP_ROUTE\.BLOG/);
  assert.match(offlinePage, /APP_ROUTE\.NOTES/);

  assert.match(offlineBanner, /offline-manifest-version/);
  assert.match(offlineBanner, /serviceWorkerUrl\(\)/);
  assert.match(offlineBanner, /navigator\.serviceWorker\.register\(serviceWorkerUrl\(\)\)/);
  assert.match(offlineBanner, /OFFLINE_WARM_LOCALE/);
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
