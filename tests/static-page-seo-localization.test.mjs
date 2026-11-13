import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const extensionCandidates = [".ts", ".tsx", ".js", ".mjs"];

function resolveWithProjectExtensions(url) {
  const basePath = fileURLToPath(url);
  if (existsSync(basePath)) return url.href;
  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveWithProjectExtensions(
        new URL(`../src/${specifier.slice(2)}`, import.meta.url)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    if (
      context.parentURL?.startsWith("file:") &&
      (specifier.startsWith("./") || specifier.startsWith("../"))
    ) {
      const resolved = resolveWithProjectExtensions(
        new URL(specifier, context.parentURL)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  }
});

const {
  STATIC_PAGE_SEO_POLICY,
  buildStaticPageMetadata,
  resolveStaticPageLocalization
} = await import(
  new URL("../src/lib/seo/static-page-localization.ts", import.meta.url)
);
const { default: buildSitemap } = await import(
  new URL("../src/app/sitemap.ts", import.meta.url)
);

const locales = ["en", "vi", "zh", "ja", "ko", "fr"];
const pageNames = ["about", "apps", "gallery"];
const messages = Object.fromEntries(
  locales.map((locale) => [
    locale,
    JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"))
  ])
);
const artifactConfig = JSON.parse(
  readFileSync("config/static-artifact-budgets.json", "utf8")
);

function collectStringLeaves(value, prefix = "", leaves = new Map()) {
  if (typeof value === "string") {
    leaves.set(prefix, value);
    return leaves;
  }
  assert.equal(
    value !== null && typeof value === "object" && !Array.isArray(value),
    true,
    `${prefix || "root"} must contain only objects and string leaves`
  );
  for (const [key, child] of Object.entries(value)) {
    collectStringLeaves(child, prefix ? `${prefix}.${key}` : key, leaves);
  }
  return leaves;
}

test("static-page policy distinguishes authored localization from route fallback", () => {
  assert.deepEqual(STATIC_PAGE_SEO_POLICY.about.contentLocales, locales);
  assert.deepEqual(STATIC_PAGE_SEO_POLICY.apps.contentLocales, ["en", "vi"]);
  assert.deepEqual(STATIC_PAGE_SEO_POLICY.gallery.contentLocales, locales);

  for (const page of pageNames) {
    const policy = STATIC_PAGE_SEO_POLICY[page];
    for (const locale of locales) {
      const resolved = resolveStaticPageLocalization(page, locale);
      const authored = policy.contentLocales.includes(locale);
      const contentLocale = authored ? locale : "en";

      assert.equal(resolved.authored, authored, `${locale}/${page} authored`);
      assert.equal(
        resolved.contentLocale,
        contentLocale,
        `${locale}/${page} content locale`
      );
      // Fallback routes are self-canonical noindex: canonical never disagrees with robots.
      assert.equal(
        resolved.canonical,
        `https://nguyenlephong.github.io/${locale}/${page}`,
        `${locale}/${page} canonical`
      );
      assert.equal(resolved.index, authored, `${locale}/${page} robots index`);
      assert.equal(resolved.follow, true, `${locale}/${page} robots follow`);
      assert.deepEqual(
        Object.keys(resolved.languages),
        authored ? [...policy.contentLocales, "x-default"] : [],
        `${locale}/${page} hreflang`
      );
    }
  }
});

test("runtime and exported-artifact localization policies cannot drift", () => {
  assert.deepEqual(
    artifactConfig.seo.staticPageLocalization,
    Object.fromEntries(
      [...pageNames, "studio", "studio/checklists", "studio/system-maps", "studio/ai-setup"].map((page) => [
        page,
        {
          contentLocales: [...STATIC_PAGE_SEO_POLICY[page].contentLocales],
          fallbackLocale: "en"
        }
      ])
    )
  );
});

// MEP-54: Studio stays indexable, but only where its prose is authored (en, vi).
test("Studio hub and module pages are indexed and listed in the sitemap only in en and vi", () => {
  const studioPages = ["studio", "studio/checklists", "studio/system-maps", "studio/ai-setup"];
  for (const page of studioPages) {
    assert.deepEqual(STATIC_PAGE_SEO_POLICY[page].contentLocales, ["en", "vi"], page);
    for (const locale of locales) {
      const resolved = resolveStaticPageLocalization(page, locale);
      const authored = locale === "en" || locale === "vi";
      assert.equal(resolved.index, authored, `${locale}/${page} robots index`);
      assert.equal(
        resolved.canonical,
        `https://nguyenlephong.github.io/${locale}/${page}`,
        `${locale}/${page} canonical`
      );
      assert.deepEqual(
        Object.keys(resolved.languages),
        authored ? ["en", "vi", "x-default"] : [],
        `${locale}/${page} hreflang`
      );
    }
  }

  const sitemapStudioUrls = buildSitemap()
    .map((entry) => entry.url)
    .filter((url) => /\/studio(?:\/|$)/.test(url))
    .sort();
  assert.deepEqual(
    sitemapStudioUrls,
    ["en", "vi"]
      .flatMap((locale) => studioPages.map((page) => `https://nguyenlephong.github.io/${locale}/${page}`))
      .sort()
  );
});

test("focused static metadata clears inherited keywords and keeps copy parity", () => {
  const localization = resolveStaticPageLocalization("apps", "fr");
  const metadata = buildStaticPageMetadata({
    title: "About title",
    description: "About description",
    localization,
    openGraphType: "profile"
  });

  assert.equal(metadata.keywords, null);
  assert.equal(metadata.title.absolute, "About title");
  assert.equal(metadata.description, "About description");
  assert.equal(metadata.openGraph.title, "About title");
  assert.equal(metadata.openGraph.description, "About description");
  assert.equal(metadata.twitter.title, "About title");
  assert.equal(metadata.twitter.description, "About description");
  // Self-canonical noindex fallback with no hreflang cluster.
  assert.deepEqual(metadata.alternates, {
    canonical: "https://nguyenlephong.github.io/fr/apps"
  });
  assert.equal(metadata.openGraph.url, "https://nguyenlephong.github.io/fr/apps");
  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.robots.follow, true);
});

test("message catalogs contain SEO copy only where the route has real localized content", () => {
  for (const page of ["apps"]) {
    for (const locale of locales) {
      const hasOwnCopy = Object.hasOwn(messages[locale].SEO, page);
      assert.equal(
        hasOwnCopy,
        ["en", "vi"].includes(locale),
        `${locale} ${page} message ownership`
      );
    }
  }

  for (const locale of locales) {
    const copy = messages[locale].SEO.gallery;
    assert.equal(typeof copy.title, "string", `${locale} gallery title`);
    assert.equal(typeof copy.description, "string", `${locale} gallery description`);
    assert.ok(copy.title.trim().length >= 12, `${locale} gallery title length`);
    assert.ok(copy.description.trim().length >= 50, `${locale} gallery description length`);
    if (locale !== "en") {
      assert.notEqual(copy.title, messages.en.SEO.gallery.title, `${locale} gallery title fallback`);
      assert.notEqual(
        copy.description,
        messages.en.SEO.gallery.description,
        `${locale} gallery description fallback`
      );
    }
  }
});

test("all six Gallery catalogs own the complete visible 32-leaf message shape", () => {
  const englishLeaves = collectStringLeaves(messages.en.Pages.gallery);
  const expectedPaths = [...englishLeaves.keys()].sort();
  assert.equal(expectedPaths.length, 32);

  for (const locale of locales) {
    assert.equal(
      Object.hasOwn(messages[locale].Pages, "gallery"),
      true,
      `${locale} Gallery message ownership`
    );
    const leaves = collectStringLeaves(messages[locale].Pages.gallery);
    assert.deepEqual([...leaves.keys()].sort(), expectedPaths, `${locale} Gallery leaf shape`);
    for (const [key, value] of leaves) {
      assert.notEqual(value.trim(), "", `${locale} Pages.gallery.${key}`);
    }
    if (locale !== "en") {
      assert.notEqual(
        leaves.get("title"),
        englishLeaves.get("title"),
        `${locale} Gallery visible title fallback`
      );
    }
  }
});

test("sitemap and hreflang include only authored static-page locales", () => {
  const sitemap = buildSitemap();
  const entriesByUrl = new Map(sitemap.map((entry) => [entry.url, entry]));

  for (const page of pageNames) {
    const policy = STATIC_PAGE_SEO_POLICY[page];
    const expectedLanguages = Object.fromEntries([
      ...policy.contentLocales.map((locale) => [
        locale,
        `https://nguyenlephong.github.io/${locale}/${page}`
      ]),
      ["x-default", `https://nguyenlephong.github.io/en/${page}`]
    ]);

    for (const locale of locales) {
      const url = `https://nguyenlephong.github.io/${locale}/${page}`;
      const entry = entriesByUrl.get(url);
      if (!policy.contentLocales.includes(locale)) {
        assert.equal(entry, undefined, `${url} fallback sitemap leak`);
        continue;
      }
      assert.deepEqual(entry.alternates.languages, expectedLanguages, `${url} sitemap hreflang`);
    }
  }
});

test("all three pages use the shared policy for metadata and route-owned JSON-LD", () => {
  for (const page of pageNames) {
    const source = readFileSync(
      `src/app/[locale]/(site)/${page}/page.tsx`,
      "utf8"
    );
    assert.match(source, new RegExp(`resolveStaticPageLocalization\\('${page}'`));
    assert.match(source, /buildStaticPageMetadata\(/);
    assert.match(source, /inLanguage:\s*localization\.contentLocale/);
    assert.match(source, /name:\s*title/);
    assert.match(source, /description/);
  }
});

test("Gallery has no explicit preload and only its first photo is eager and high priority", () => {
  const source = readFileSync("src/components/gallery/GalleryGrid.tsx", "utf8");
  const page = readFileSync("src/app/[locale]/(site)/gallery/page.tsx", "utf8");
  const runtimeVerifier = readFileSync(
    "scripts/verify-runtime-boundaries.mjs",
    "utf8"
  );

  for (const file of [source, page]) {
    assert.doesNotMatch(file, /rel="preload"/);
    assert.doesNotMatch(file, /ReactDOM\.preload|\bpreload\(/);
  }
  assert.doesNotMatch(source, /<Image[\s\S]{0,500}\b(?:preload|priority)\b/);
  assert.match(source, /const firstSrc = visible\[0\]\?\.items\[0\]\?\.src/);
  assert.match(source, /eager=\{photo\.src === firstSrc\}/);
  assert.match(source, /loading=\{eager \? 'eager' : 'lazy'\}/);
  assert.match(source, /fetchPriority=\{eager \? 'high' : 'auto'\}/);
  assert.match(runtimeVerifier, /verifyGalleryLcpCandidate\(browser, origin\)/);
  assert.match(runtimeVerifier, /largest-contentful-paint/);
  assert.match(runtimeVerifier, /link\[rel="preload"\]\[as="image"\]/);
  assert.match(runtimeVerifier, /firstImageFetchPriority, "high"/);
  assert.match(runtimeVerifier, /laterImageLoading, \["lazy"\]/);
});

test("About owns its page and SEO copy in all six locales", () => {
  for (const locale of locales) {
    const seo = messages[locale].SEO.about;
    assert.equal(typeof seo?.title, "string", `${locale} about title`);
    assert.ok(seo.description.trim().length >= 50, `${locale} about description length`);
    assert.equal(typeof messages[locale].About?.title, "string", `${locale} About page copy`);
    if (locale !== "en") {
      assert.notEqual(seo.title, messages.en.SEO.about.title, `${locale} about title fallback`);
      assert.notEqual(messages[locale].About.lede, messages.en.About.lede, `${locale} About lede fallback`);
    }
  }
});
