import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";

const localeRoot = "src/app/[locale]";
const expectedRoutes = [
  "about/opengraph-image.tsx",
  "about/page.tsx",
  "apps/english/page.tsx",
  "apps/opengraph-image.tsx",
  "apps/page.tsx",
  "blog/[category]/[slug]/page.tsx",
  "blog/[category]/opengraph-image.tsx",
  "blog/[category]/page.tsx",
  "blog/opengraph-image.tsx",
  "blog/page.tsx",
  "blog/page/[page]/page.tsx",
  "gallery/opengraph-image.tsx",
  "gallery/page.tsx",
  "heartbeats/page.tsx",
  "notes/[slug]/page.tsx",
  "notes/page.tsx",
  "notes/page/[page]/page.tsx",
  "offline/page.tsx",
  "opengraph-image.tsx",
  "page.tsx",
  "search/blog.json/route.ts",
  "search/notes.json/route.ts",
  "studio/page.tsx",
].sort();

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function localPath(path) {
  return relative(localeRoot, path).split(sep).join("/");
}

function routePath(path) {
  return path
    .split("/")
    .filter((segment) => !/^\(.+\)$/.test(segment))
    .join("/");
}

test("localized route groups preserve the complete unique URL inventory", () => {
  const sourceEntries = walk(localeRoot)
    .map(localPath)
    .filter((path) => /(?:page|route|opengraph-image)\.(?:ts|tsx)$/.test(path));
  const normalizedRoutes = sourceEntries.map(routePath).sort();

  assert.deepEqual(normalizedRoutes, expectedRoutes);
  assert.equal(new Set(normalizedRoutes).size, normalizedRoutes.length);

  for (const entry of sourceEntries) {
    if (routePath(entry) === "studio/page.tsx") {
      assert.equal(entry, "studio/page.tsx");
    } else {
      assert.match(entry, /^\(site\)\//);
    }
  }
});

test("public runtime and chrome stay outside the Studio layout boundary", () => {
  const rootLayout = readFileSync(`${localeRoot}/layout.tsx`, "utf8");
  const siteLayout = readFileSync(`${localeRoot}/(site)/layout.tsx`, "utf8");
  const studioPage = readFileSync(`${localeRoot}/studio/page.tsx`, "utf8");
  const publicRuntime = [
    "AppHeader",
    "AppFooter",
    "MotionProvider",
    "RouteProgressBar",
    "OfflineNavigationCapture",
    "OfflineStatusBanner",
    "BlogReaderTools",
    "ThemeSync",
  ];

  for (const component of publicRuntime) {
    assert.match(siteLayout, new RegExp(`<${component}(?:[\\s/>])`));
    assert.doesNotMatch(rootLayout, new RegExp(`\\b${component}\\b`));
    assert.doesNotMatch(studioPage, new RegExp(`\\b${component}\\b`));
  }

  assert.match(rootLayout, /<WebVitalsReporter locale=\{locale\} \/>/);
  assert.doesNotMatch(siteLayout, /\bWebVitalsReporter\b/);
  assert.doesNotMatch(studioPage, /\bWebVitalsReporter\b/);
  assert.match(rootLayout, /<NextIntlClientProvider>[\s\S]*\{children\}[\s\S]*<\/NextIntlClientProvider>/);
  assert.doesNotMatch(studioPage, /\.app-nav|\.app-footer|\.blog-reader-tools/);
});

test("nested localized layouts bind translations to static locale params", () => {
  const nestedLayouts = walk(localeRoot)
    .map(localPath)
    .filter((path) => path !== "layout.tsx" && path.endsWith("/layout.tsx"));

  assert.ok(nestedLayouts.length > 0);

  for (const layoutPath of nestedLayouts) {
    const source = readFileSync(`${localeRoot}/${layoutPath}`, "utf8");
    const translationCalls = source.match(/getTranslations\([\s\S]*?\)/g) ?? [];

    if (translationCalls.length === 0) continue;

    assert.match(source, /params:\s*Promise<\{\s*locale:\s*string\s*\}>/);
    assert.match(source, /const\s*\{\s*locale\s*\}\s*=\s*await\s+params/);
    assert.match(source, /setRequestLocale\(locale\)/);

    for (const call of translationCalls) {
      assert.match(call, /getTranslations\(\s*\{/);
      assert.match(call, /\blocale\b/);
      assert.match(call, /\bnamespace\b/);
    }
  }
});
