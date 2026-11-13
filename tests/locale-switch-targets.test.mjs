import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

// The header language switcher must never send a reader to a route that the
// target locale does not export (MEP review: fr/ja/ko/zh have no hub pages).
process.env.CONTENT_BUILD_DATE ??= "2026-07-19";

const extensionCandidates = [".ts", ".tsx", ".js", ".mjs"];

function resolveWithProjectExtensions(url) {
  const basePath = fileURLToPath(url);
  if (existsSync(basePath)) return url.href;
  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  for (const extension of extensionCandidates) {
    const candidate = path.join(basePath, `index${extension}`);
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

const [blogData, notesData, { localeSwitchPath }, { routing }, { collectionPagePath }] =
  await Promise.all([
    import(new URL("../src/lib/blog/data.ts", import.meta.url)),
    import(new URL("../src/lib/notes/data.ts", import.meta.url)),
    import(new URL("../src/lib/content/locale-navigation.ts", import.meta.url)),
    import(new URL("../src/i18n/routing.ts", import.meta.url)),
    import(new URL("../src/lib/content/pagination.ts", import.meta.url))
  ]);

const LOCALES = routing.locales;

/**
 * Every hub-family route with the marker its page renders. The locale lists
 * come from the same functions the pages and generateStaticParams use.
 */
function hubFamilyRoutes() {
  const routes = [];
  for (let page = 2; blogData.listBlogArchiveLocales(page).length > 0; page++) {
    routes.push({
      family: "blog-archive",
      path: collectionPagePath("/blog", page),
      marker: { availableLocales: blogData.listBlogArchiveLocales(page), fallbackPath: "/blog" }
    });
  }
  for (let page = 2; notesData.listNotesArchiveLocales(page).length > 0; page++) {
    routes.push({
      family: "notes-archive",
      path: collectionPagePath("/notes", page),
      marker: { availableLocales: notesData.listNotesArchiveLocales(page), fallbackPath: "/notes" }
    });
  }
  for (const { series, page } of blogData.listBlogSeriesHubPages()) {
    routes.push({
      family: "blog-series",
      path: collectionPagePath(`/blog/series/${series}`, page),
      marker: { availableLocales: blogData.listBlogSeriesPageLocales(series, page), fallbackPath: "/blog" }
    });
  }
  for (const { topic, page } of notesData.listNoteHubPages()) {
    routes.push({
      family: "notes-topic",
      path: collectionPagePath(`/notes/topics/${topic}`, page),
      marker: { availableLocales: notesData.listNoteHubPageLocales(topic, page), fallbackPath: "/notes" }
    });
  }
  return routes;
}

test("hub-family switch targets exist for every source and target locale", () => {
  const routes = hubFamilyRoutes();
  const families = new Set(routes.map((route) => route.family));
  assert.deepEqual([...families].sort(), ["blog-archive", "blog-series", "notes-archive", "notes-topic"]);

  // /blog and /notes (page 1) are exported for every locale by the [locale] layout.
  const exported = new Set(LOCALES.flatMap((l) => [`${l}/blog`, `${l}/notes`]));
  for (const { path: routePath, marker } of routes) {
    for (const locale of marker.availableLocales) exported.add(`${locale}${routePath}`);
  }

  let checked = 0;
  for (const { family, path: routePath, marker } of routes) {
    for (const source of marker.availableLocales) {
      for (const target of LOCALES) {
        const next = localeSwitchPath(routePath, target, marker);
        assert.ok(
          exported.has(`${target}${next}`),
          `${family} /${source}${routePath} -> /${target}${next} is not exported`
        );
        checked++;
      }
    }
  }
  assert.ok(checked > 0);
});

test("hub families fall back to their index for locales without curated hubs", () => {
  const fr = (pathname, marker) => localeSwitchPath(pathname, "fr", marker);
  for (const { path: routePath, marker } of hubFamilyRoutes()) {
    if (marker.availableLocales.includes("fr")) continue;
    assert.equal(fr(routePath, marker), marker.fallbackPath, routePath);
  }
});

function exportedPage(locale, pathname) {
  const base = path.join("out", locale, pathname);
  return pathname === "/"
    ? existsSync(path.join("out", `${locale}.html`))
    : existsSync(`${base}.html`) || existsSync(path.join(base, "index.html"));
}

const MARKER = /<[^>]*\bdata-content-locales="([^"]*)"[^>]*>/;
const FALLBACK = /\bdata-content-locale-fallback="([^"]*)"/;

test("built pages: the switch target of every page exists in out/", { skip: !existsSync("out/en.html") && "out/ not built" }, () => {
  let pages = 0;
  for (const source of LOCALES) {
    const root = path.join("out", source);
    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
      const file = path.join(entry.parentPath, entry.name);
      const pathname = `/${path.relative(root, file).split(path.sep).join("/").replace(/(?:\/?index)?\.html$/, "")}`;
      const html = readFileSync(file, "utf8");
      // Legacy locale stubs meta-refresh away at 0s; the reader never sees their switcher.
      if (html.includes('data-content-locale-redirect="true"')) continue;
      const tag = html.match(MARKER);
      const marker = tag
        ? {
            availableLocales: tag[1].split(/\s+/).filter(Boolean),
            fallbackPath: tag[0].match(FALLBACK)?.[1]
          }
        : null;
      if (marker) assert.ok(marker.fallbackPath, `${file} marker without fallback`);
      for (const target of LOCALES) {
        const next = localeSwitchPath(pathname, target, marker);
        assert.ok(exportedPage(target, next), `/${source}${pathname} -> /${target}${next} is not exported`);
      }
      pages++;
    }
  }
  assert.ok(pages > 100, `scanned ${pages} pages`);
});
