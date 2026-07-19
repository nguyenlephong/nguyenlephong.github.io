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
  const homePage = readFileSync(`${localeRoot}/(site)/page.tsx`, "utf8");
  const galleryPage = readFileSync(
    `${localeRoot}/(site)/gallery/page.tsx`,
    "utf8"
  );
  const blogArticleLayout = readFileSync(
    `${localeRoot}/(site)/blog/[category]/[slug]/layout.tsx`,
    "utf8"
  );
  const notesArticleLayout = readFileSync(
    `${localeRoot}/(site)/notes/[slug]/layout.tsx`,
    "utf8"
  );
  const studioPage = readFileSync(`${localeRoot}/studio/page.tsx`, "utf8");
  const scopedIntlProvider = readFileSync(
    "src/i18n/ScopedIntlProvider.tsx",
    "utf8"
  );
  const sharedPublicRuntime = [
    "AppHeader",
    "AppFooter",
    "RouteProgressBar",
    "OfflineNavigationCapture",
    "OfflineStatusBanner",
    "ThemeSync",
  ];

  for (const component of sharedPublicRuntime) {
    assert.match(siteLayout, new RegExp(`<${component}(?:[\\s/>])`));
    assert.doesNotMatch(rootLayout, new RegExp(`\\b${component}\\b`));
    assert.doesNotMatch(studioPage, new RegExp(`\\b${component}\\b`));
  }

  assert.doesNotMatch(siteLayout, /\bMotionProvider\b|\bBlogReaderTools\b/);
  assert.match(homePage, /<MotionProvider>[\s\S]*<main>[\s\S]*<\/MotionProvider>/);
  assert.match(
    galleryPage,
    /<MotionProvider>[\s\S]*<main className="gallery-showcase">[\s\S]*<\/MotionProvider>/
  );
  assert.match(blogArticleLayout, /<ArticleReaderTools locale=\{locale\} \/>/);
  assert.match(notesArticleLayout, /<ArticleReaderTools locale=\{locale\} \/>/);
  assert.doesNotMatch(homePage, /\bBlogReaderTools\b|\bArticleReaderTools\b/);
  assert.doesNotMatch(galleryPage, /\bBlogReaderTools\b|\bArticleReaderTools\b/);

  assert.match(rootLayout, /<WebVitalsReporter locale=\{locale\} \/>/);
  assert.doesNotMatch(siteLayout, /\bWebVitalsReporter\b/);
  assert.doesNotMatch(studioPage, /\bWebVitalsReporter\b/);
  assert.doesNotMatch(rootLayout, /\bNextIntlClientProvider\b/);
  assert.match(
    siteLayout,
    /<ScopedIntlProvider scope="site">[\s\S]*\{children\}[\s\S]*<\/ScopedIntlProvider>/
  );
  assert.match(
    scopedIntlProvider,
    /const selectedMessages = selectClientMessages\(messages, scope\)/
  );
  assert.match(
    scopedIntlProvider,
    /<NextIntlClientProvider\s+messages=\{toSerializableClientMessages\(selectedMessages\)\}\s*>/
  );
  assert.doesNotMatch(studioPage, /\bScopedIntlProvider\b|\bNextIntlClientProvider\b/);
  assert.doesNotMatch(studioPage, /\.app-nav|\.app-footer|\.blog-reader-tools/);
});

test("document CSS, public CSS, and third-party resources follow route ownership", () => {
  const rootLayout = readFileSync(`${localeRoot}/layout.tsx`, "utf8");
  const siteLayout = readFileSync(`${localeRoot}/(site)/layout.tsx`, "utf8");
  const documentCss = readFileSync("src/app/document.css", "utf8");
  const publicCss = readFileSync("src/app/globals.css", "utf8");
  const publicResources = readFileSync(
    "src/components/analytics/PublicThirdPartyResources.tsx",
    "utf8"
  );

  assert.match(rootLayout, /import ['"]\.\.\/document\.css['"]/);
  assert.doesNotMatch(rootLayout, /globals\.css/);
  assert.match(siteLayout, /import ['"]\.\.\/\.\.\/globals\.css['"]/);

  for (const token of ["--bg", "--fg", "--accent", "--font-reading-source"]) {
    assert.match(documentCss, new RegExp(token));
  }
  assert.match(documentCss, /\[data-theme='dark'\]/);
  assert.doesNotMatch(documentCss, /\.app-nav|\.blog-reader-tools|\.route-progress/);
  assert.match(publicCss, /\.app-nav/);
  assert.match(publicCss, /\.blog-reader-tools/);
  assert.match(publicCss, /\.route-progress/);

  assert.match(rootLayout, /<PostHogBootstrap locale=\{locale\} \/>/);
  assert.match(rootLayout, /us\.i\.posthog\.com/);
  assert.doesNotMatch(
    rootLayout,
    /google-adsense-account|googletagmanager|googlesyndication|GTM_datalayer/
  );
  assert.match(siteLayout, /<PublicThirdPartyResources \/>/);
  assert.match(siteLayout, /google-adsense-account/);
  assert.match(publicResources, /ReactDOM\.preconnect/);
  assert.match(publicResources, /ReactDOM\.prefetchDNS/);
  assert.match(publicResources, /id="GTM"/);
  assert.match(publicResources, /id="adsbygoogle"/);
  assert.match(publicResources, /id="GTM_datalayer"/);
});

test("every public UI path into Studio uses the document navigation boundary", () => {
  const publicUiFiles = walk("src/components").filter(
    (file) =>
      /\.(?:ts|tsx)$/.test(file) &&
      !file.includes(`${sep}studio${sep}`) &&
      !file.includes(`${sep}studio-kit${sep}`)
  );
  const studioTargets = publicUiFiles
    .filter((file) =>
      /APP_ROUTE\.STUDIO|["'`]\/studio(?:[?/#"'`]|$)/.test(
        readFileSync(file, "utf8")
      )
    )
    .map((file) => file.split(sep).join("/"));

  assert.deepEqual(studioTargets, ["src/components/AppFooter.tsx"]);
  const footer = readFileSync("src/components/AppFooter.tsx", "utf8");
  assert.match(footer, /getPathname\(\{[\s\S]*href: APP_ROUTE\.STUDIO/);
  assert.match(footer, /<a[\s\S]*data-document-navigation="studio"/);
  assert.doesNotMatch(footer, /<Link[\s\S]*href=\{APP_ROUTE\.STUDIO\}/);
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

test("development renders static params on demand without concurrent manifest writes", () => {
  const config = readFileSync("next.config.mjs", "utf8");
  const verifier = readFileSync("scripts/verify-dev-concurrency.mjs", "utf8");
  const staticParamEntries = walk(localeRoot).filter((path) =>
    /export function generateStaticParams/.test(readFileSync(path, "utf8"))
  );

  assert.match(config, /output: isDevelopment \? undefined : ["']export["']/);
  assert.match(config, /globalNotFound: !isDevelopment/);
  assert.ok(staticParamEntries.length > 0);
  for (const entry of staticParamEntries) {
    const source = readFileSync(entry, "utf8");
    assert.match(
      source,
      /generateStaticParams\(\) \{\s+if \(process\.env\.NODE_ENV === ["']development["']\) return \[\]/
    );
    assert.doesNotMatch(source, /dynamicParams\s*=\s*false/);
  }

  assert.match(verifier, /Promise\.all/);
  assert.match(verifier, /\["\/en\/heartbeats", 404\]/);
  assert.match(verifier, /\["\/__dev-concurrency-missing__", 404\]/);
  assert.match(verifier, /prerender-manifest\.json/);
  assert.match(verifier, /JSON\.parse/);
});
