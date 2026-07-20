import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScriptModule(path) {
  const source = await readFile(path, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  });
  const encoded = Buffer.from(outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

test("intent prefetch stays disabled until a link receives intent", async () => {
  const { resolveIntentPrefetch } = await importTypeScriptModule(
    "src/components/navigation/intent-prefetch.ts"
  );

  assert.equal(resolveIntentPrefetch(false), false);
  assert.equal(resolveIntentPrefetch(true), null);
});

test("public navigation and archive links use shared intent prefetch without losing analytics", async () => {
  const [link, blogCard, noteCard, header, categoryCard, footer] = await Promise.all([
    readFile("src/components/navigation/IntentPrefetchLink.tsx", "utf8"),
    readFile("src/components/blog/BlogPostCard.tsx", "utf8"),
    readFile("src/components/notes/NoteCard.tsx", "utf8"),
    readFile("src/components/AppHeader.tsx", "utf8"),
    readFile("src/components/blog/BlogCategoryCard.tsx", "utf8"),
    readFile("src/components/AppFooter.tsx", "utf8")
  ]);

  assert.match(link, /ComponentProps<typeof Link>/);
  assert.match(link, /"prefetch"/);
  assert.match(link, /prefetch=\{resolveIntentPrefetch\(hasIntent\)\}/);
  assert.match(link, /onFocus=\{\(event\) =>/);
  assert.match(link, /onMouseEnter=\{\(event\) =>/);
  assert.doesNotMatch(link, /onClick=/);
  assert.doesNotMatch(link, /onTouchStart=/);

  for (const [card, eventName] of [
    [blogCard, "blog_card_click"],
    [noteCard, "notes_card_click"]
  ]) {
    assert.match(card, /IntentPrefetchLink/);
    assert.match(card, /onClick=\{\(\) =>/);
    assert.match(card, new RegExp(`track\\(["']${eventName}["']`));
  }

  assert.equal((header.match(/<IntentPrefetchLink/g) ?? []).length, 3);
  assert.doesNotMatch(header, /import\s*\{\s*Link\s*\}/);
  assert.match(header, /track\("cv_nav_click"/);
  assert.match(categoryCard, /<IntentPrefetchLink/);
  assert.match(categoryCard, /track\('blog_category_click'/);
  assert.match(footer, /<IntentPrefetchLink\s+href=\{APP_ROUTE\.APPS\}/);
  assert.match(footer, /target: 'apps_footer'/);
  assert.match(footer, /data-document-navigation="studio"/);
});

test("Gallery and Apps page-back links keep speculative Home prefetch disabled", async () => {
  const [galleryPage, galleryBackLink, appsConsole, header] = await Promise.all([
    readFile("src/app/[locale]/(site)/gallery/page.tsx", "utf8"),
    readFile("src/components/gallery/GalleryPageBackLink.tsx", "utf8"),
    readFile("src/components/apps/AppsConsole.tsx", "utf8"),
    readFile("src/components/AppHeader.tsx", "utf8")
  ]);

  assert.match(galleryPage, /<GalleryPageBackLink>/);
  assert.match(galleryBackLink, /import \{ Link \} from ['"]@\/i18n\/navigation['"]/);
  assert.doesNotMatch(galleryBackLink, /IntentPrefetchLink/);
  assert.match(
    galleryBackLink,
    /<Link\s+href=\{APP_ROUTE\.HOME\}\s+prefetch=\{false\}\s+className="page-back"/
  );
  assert.match(
    appsConsole,
    /<Link\s+href=\{APP_ROUTE\.HOME\}\s+prefetch=\{false\}\s+className="page-back"/
  );
  assert.doesNotMatch(appsConsole, /IntentPrefetchLink/);

  assert.equal((header.match(/<IntentPrefetchLink/g) ?? []).length, 3);
  assert.match(header, /<IntentPrefetchLink\s+href=\{APP_ROUTE\.HOME\}/);
});

test("runtime verification rejects Gallery and Apps Home payloads before click", async () => {
  const runtimeVerifier = await readFile(
    "scripts/verify-runtime-boundaries.mjs",
    "utf8"
  );

  assert.match(
    runtimeVerifier,
    /verifyPageBackNavigationBoundaries\(browser, origin\)/
  );
  assert.match(
    runtimeVerifier,
    /name: "gallery-focus", surface: "gallery", path: "\/en\/gallery", homePath: "\/en", intent: "focus"/
  );
  assert.match(
    runtimeVerifier,
    /name: "gallery-hover", surface: "gallery", path: "\/en\/gallery", homePath: "\/en", intent: "hover"/
  );
  assert.match(
    runtimeVerifier,
    /name: "apps-focus", surface: "apps", path: "\/vi\/apps", homePath: "\/vi", intent: "focus"/
  );
  assert.match(
    runtimeVerifier,
    /name: "apps-hover", surface: "apps", path: "\/vi\/apps", homePath: "\/vi", intent: "hover"/
  );
  assert.match(runtimeVerifier, /initialHomeRsc/);
  assert.match(runtimeVerifier, /initialHomeCss/);
  assert.match(runtimeVerifier, /initialHomeProbes/);
  assert.match(runtimeVerifier, /intentHomeRsc/);
  assert.match(runtimeVerifier, /intentHomeCss/);
  assert.match(runtimeVerifier, /intentHomeProbes/);
  assert.match(runtimeVerifier, /navigationRscDestinations/);
  assert.match(runtimeVerifier, /navigationSegmentedRsc/);
  assert.match(runtimeVerifier, /navigationStylesheets/);
  assert.match(runtimeVerifier, /waitForRequestQuietPeriod/);
  assert.match(runtimeVerifier, /accessibleName/);
  assert.match(runtimeVerifier, /__pageBackDocumentIdentity/);
  assert.match(runtimeVerifier, /navigationDocuments/);
  assert.match(runtimeVerifier, /pageBackNavigation/);
});

test("runtime verification groups full and segmented RSC files by logical destination", async () => {
  const { rscDestinationFromPath } = await import(
    "../scripts/verify-runtime-boundaries.mjs"
  );

  assert.equal(rscDestinationFromPath("en.txt"), "/en");
  assert.equal(rscDestinationFromPath("en/__next._tree.txt"), "/en");
  assert.equal(
    rscDestinationFromPath("vi/__next.$d$locale.!KHNpdGUp.__PAGE__.txt"),
    "/vi"
  );
  assert.equal(
    rscDestinationFromPath("en/blog/__next.$d$locale.!KHNpdGUp.__PAGE__.txt"),
    "/en/blog"
  );
  assert.equal(rscDestinationFromPath("en.html"), null);
});

test("archive post stats stay provider-free until browsing intent", async () => {
  const [hook, store, facade, provider, ids, blogExplorer, notesExplorer, shell] =
    await Promise.all([
      readFile("src/components/explorer/useDeferredPostStats.ts", "utf8"),
      readFile("src/lib/engagement/deferred-post-stats-store.ts", "utf8"),
      readFile("src/lib/firebase/postStats.ts", "utf8"),
      readFile("src/lib/engagement/firebase-repository.ts", "utf8"),
      readFile("src/lib/engagement/post-stats-ids.ts", "utf8"),
      readFile("src/components/blog/BlogExplorer.tsx", "utf8"),
      readFile("src/components/notes/NotesExplorer.tsx", "utf8"),
      readFile("src/components/explorer/ExplorerShell.tsx", "utf8")
    ]);

  assert.match(facade, /import\(['"]@\/lib\/engagement\/firebase-repository['"]\)/);
  assert.doesNotMatch(
    facade,
    /import\s*\{[^}]*firebaseEngagementRepository[^}]*\}\s*from/
  );
  assert.match(facade, /let repositoryPromise:/);
  assert.match(provider, /from ['"]\.\/post-stats-ids['"]/);
  assert.doesNotMatch(provider, /export function boundPostStatsIds/);
  assert.match(ids, /new Set\(ids\.filter\(Boolean\)\)/);
  assert.match(ids, /Number\.isSafeInteger\(limit\)/);

  assert.match(hook, /window\.addEventListener\(['"]scroll['"]/);
  assert.match(hook, /connection\?\.saveData === true/);
  assert.match(hook, /boundPostStatsIds\(ids, CONTENT_PAGE_SIZE\)/);
  assert.match(hook, /createDeferredPostStatsStore/);
  assert.match(hook, /store\.request\(boundedIds\)/);
  assert.match(hook, /batchSize: CONTENT_PAGE_SIZE/);
  assert.match(hook, /cacheLimit: RESOLVED_STATS_CACHE_LIMIT/);
  assert.match(hook, /RESOLVED_STATS_CACHE_LIMIT = CONTENT_PAGE_SIZE \* 4/);
  assert.match(store, /let activeBatch: ActiveBatch \| null = null/);
  assert.match(store, /let queuedIds: readonly string\[\] = \[\]/);
  assert.match(store, /queuedIds = latestVisibleIds\.filter/);
  assert.match(store, /\.catch\(\(\) => new Map<string, DeferredPostStatsValue>\(\)\)/);
  assert.doesNotMatch(hook, /mouse(?:enter|over)|hover/i);

  for (const explorer of [blogExplorer, notesExplorer]) {
    assert.match(explorer, /useDeferredPostStats/);
    assert.match(explorer, /signalBrowsingIntent\(\)/);
    assert.match(explorer, /postStatsStatus=\{postStatsStatus\}/);
    assert.doesNotMatch(explorer, /getPostStatsByIds/);
  }
  assert.match(shell, /data-deferred-post-stats=\{postStatsStatus\}/);
});

test("header eagerly loads the small display icon and preserves the app icon", async () => {
  const [header, appIcon] = await Promise.all([
    readFile("src/components/AppHeader.tsx", "utf8"),
    readFile("src/app/icon.png")
  ]);

  assert.match(header, /src="\/favicon\/android-icon-72x72\.png"/);
  assert.match(header, /width=\{36\}/);
  assert.match(header, /height=\{36\}/);
  assert.match(header, /sizes="36px"/);
  assert.match(header, /loading="eager"/);
  assert.match(header, /fetchPriority="high"/);
  assert.doesNotMatch(header, /src="\/icon\.png"/);
  assert.ok(appIcon.byteLength > 0);
});
