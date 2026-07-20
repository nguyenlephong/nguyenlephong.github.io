#!/usr/bin/env node

import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createArtifactIndex } from "./lib/artifact-index.mjs";
import { resolveFile } from "./verify-offline.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.RUNTIME_BOUNDARY_VERIFY_PORT ?? "0");
const PUBLIC_ARTICLE = "/en/blog/culture/how-to-be-a-kind-engineer";
const SECOND_ARTICLE = "/en/blog/culture/how-to-review-code-kindly";
const ARCHIVE_PROVIDER_MARKERS = Object.freeze([
  "firebaseapp.com",
  "appspot.com",
  "getFirestore",
  "initializeFirestore"
]);
const CONTENT_HUB_CASES = [
  {
    path: "/en/blog/series/foundations",
    kind: "blog_series",
    hubId: "foundations",
    surface: "blog",
    legacyCardEvent: "blog_card_click",
    archiveDestination: "/en/blog"
  },
  {
    path: "/vi/notes/topics/thoughts",
    kind: "notes_topic",
    hubId: "thoughts",
    surface: "notes",
    legacyCardEvent: "notes_card_click",
    archiveDestination: "/vi/notes"
  }
];
const ARTICLE_HUB_CASES = [
  {
    path: "/en/blog/architecture/dependency-direction-in-plain-language",
    viewEvent: "blog_article_view",
    kind: "blog_series",
    hubId: "foundations",
    destination: "/en/blog/series/foundations",
    sources: ["blog_article_breadcrumb", "blog_article_series"]
  },
  {
    path: "/vi/notes/a-reading-system",
    viewEvent: "notes_article_view",
    kind: "notes_topic",
    hubId: "thoughts",
    destination: "/vi/notes/topics/thoughts",
    sources: ["notes_article_breadcrumb"]
  }
];
const PAGE_BACK_NAVIGATION_CASES = [
  { name: "gallery-focus", surface: "gallery", path: "/en/gallery", homePath: "/en", intent: "focus" },
  { name: "gallery-hover", surface: "gallery", path: "/en/gallery", homePath: "/en", intent: "hover" },
  { name: "apps-focus", surface: "apps", path: "/vi/apps", homePath: "/vi", intent: "focus" },
  { name: "apps-hover", surface: "apps", path: "/vi/apps", homePath: "/vi", intent: "hover" }
];
const PAGE_BACK_REQUEST_QUIET_MS = 500;
const PAGE_BACK_REQUEST_TIMEOUT_MS = 10_000;
const PUBLIC_CSS_RUNTIME_CASES = [
  { name: "home", path: "/en", selector: ".hero", property: "position", value: "relative", stylesheets: 3 },
  { name: "about", path: "/en/about", selector: ".about-page-v2", property: "paddingBottom", notValue: "0px", stylesheets: 3 },
  { name: "gallery", path: "/en/gallery", selector: ".gallery-showcase", property: "overflowX", value: "clip", stylesheets: 3 },
  { name: "apps", path: "/en/apps", selector: ".apps-page", property: "position", value: "relative", stylesheets: 3 },
  { name: "english", path: "/en/apps/english", selector: ".english-page", property: "position", value: "relative", stylesheets: 3 },
  { name: "offline", path: "/en/offline", selector: ".offline-page-shell", property: "display", value: "grid", stylesheets: 3 },
  { name: "blogArchive", path: "/en/blog", selector: ".blog-home", property: "paddingBottom", notValue: "0px", stylesheets: 3 },
  { name: "notesArchive", path: "/en/notes", selector: ".notes-archive", property: "paddingBottom", notValue: "0px", stylesheets: 4 },
  { name: "blogArticle", path: "/en/blog/culture/protecting-attention-in-a-busy-team", selector: ".blog-article", property: "position", value: "relative", stylesheets: 4 },
  { name: "notesArticle", path: "/en/notes/tri-tue-can-duc-hanh", selector: ".notes-reading", property: "position", value: "relative", stylesheets: 5 }
];

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream";
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    const method = request.method ?? "GET";
    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405);
      response.end();
      return;
    }

    const filePath = await resolveFile(request.url ?? "/", OUT_DIR);
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      return;
    }

    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": String(body.byteLength),
      "Content-Type": contentTypeFor(filePath)
    });
    response.end(method === "HEAD" ? undefined : body);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(REQUESTED_PORT, HOST, resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");
  return { server, origin: `http://${HOST}:${address.port}` };
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve(undefined)));
  });
}

async function installExternalRuntimeStubs(
  context,
  { stubGalleryImages = false } = {}
) {
  const galleryImageBody = stubGalleryImages
    ? await fs.readFile(path.join(OUT_DIR, "opengraph-image.png"))
    : null;
  await context.route(/^https:\/\//, async (route) => {
    const url = new URL(route.request().url());
    if (
      galleryImageBody &&
      url.pathname.startsWith("/dom-pub/icdn/gallery/")
    ) {
      await route.fulfill({
        body: galleryImageBody,
        contentType: "image/png",
        status: 200
      });
      return;
    }
    if (url.hostname === "www.googletagmanager.com") {
      await route.fulfill({
        body: "window.__googleTagRuntimeLoaded=true;",
        contentType: "text/javascript; charset=utf-8",
        status: 200
      });
      return;
    }
    if (url.hostname === "pagead2.googlesyndication.com") {
      await route.fulfill({
        body: "window.adsbygoogle=[];window.__adsenseRuntimeLoaded=true;",
        contentType: "text/javascript; charset=utf-8",
        status: 200
      });
      return;
    }
    await route.abort();
  });
}

async function installGalleryLcpObserver(context) {
  await context.addInitScript(() => {
    window.__galleryLcpEntries = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const element = entry.element;
        const className =
          typeof element?.className === "string"
            ? element.className
            : (element?.getAttribute?.("class") ?? "");
        window.__galleryLcpEntries.push({
          className,
          isText: Boolean(
            element &&
              element.tagName !== "IMG" &&
              element.textContent?.trim()
          ),
          size: entry.size,
          startTime: entry.startTime,
          tagName: element?.tagName ?? "",
          text: element?.textContent?.trim().slice(0, 120) ?? "",
          url: entry.url ?? ""
        });
      }
    }).observe({ buffered: true, type: "largest-contentful-paint" });
  });
}

function isGoogleRequest(url) {
  return (
    url.includes("googletagmanager.com") ||
    url.includes("googlesyndication.com")
  );
}

function localRequestPath(url, origin) {
  const parsed = new URL(url);
  if (parsed.origin !== origin) return null;
  return decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
}

export function rscDestinationFromPath(localPath) {
  if (!localPath.endsWith(".txt")) return null;
  const stem = localPath.slice(0, -4);
  const segmentMarker = stem.indexOf("/__next.");
  const destinationStem = segmentMarker === -1 ? stem : stem.slice(0, segmentMarker);
  return destinationStem ? `/${destinationStem}` : "/";
}

async function waitForRequestQuietPeriod(
  page,
  origin,
  label,
  trigger,
  {
    quietMs = PAGE_BACK_REQUEST_QUIET_MS,
    timeoutMs = PAGE_BACK_REQUEST_TIMEOUT_MS
  } = {}
) {
  const activeRequests = new Set();
  let lastActivityAt = Date.now();

  const onRequest = (request) => {
    if (localRequestPath(request.url(), origin) === null) return;
    activeRequests.add(request);
    lastActivityAt = Date.now();
  };
  const onRequestSettled = (request) => {
    if (!activeRequests.delete(request)) return;
    lastActivityAt = Date.now();
  };

  page.on("request", onRequest);
  page.on("requestfinished", onRequestSettled);
  page.on("requestfailed", onRequestSettled);

  try {
    await trigger();
    lastActivityAt = Date.now();
    const deadline = lastActivityAt + timeoutMs;
    while (Date.now() < deadline) {
      if (
        activeRequests.size === 0 &&
        Date.now() - lastActivityAt >= quietMs
      ) {
        return;
      }
      await page.waitForTimeout(Math.min(quietMs, 50));
    }
    throw new Error(
      `${label} did not reach a ${quietMs}ms local-request quiet window within ${timeoutMs}ms`
    );
  } finally {
    page.off("request", onRequest);
    page.off("requestfinished", onRequestSettled);
    page.off("requestfailed", onRequestSettled);
  }
}

function isRscRequestForDestination(request, origin, destination) {
  const localPath = localRequestPath(request.url(), origin);
  if (!localPath || !localPath.endsWith(".txt")) return false;
  const destinationStem = destination.replace(/^\/+/, "");
  const requestedStem = localPath.slice(0, -4);
  return (
    requestedStem === destinationStem ||
    requestedStem.startsWith(`${destinationStem}/`)
  );
}

function isRscPathForExactDestination(localPath, destination) {
  if (!localPath.endsWith(".txt")) return false;
  const destinationStem = destination.replace(/^\/+|\/+$/g, "");
  return (
    localPath === `${destinationStem}.txt` ||
    localPath.startsWith(`${destinationStem}/__next.`)
  );
}

function htmlAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

async function routeStylesheetPaths(routePath, origin) {
  const routeStem = routePath.replace(/^\/+|\/+$/g, "");
  const html = await fs.readFile(path.join(OUT_DIR, `${routeStem}.html`), "utf8");
  const stylesheetPaths = new Set();

  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = htmlAttribute(tag, "rel")
      ?.toLowerCase()
      .split(/[\t\n\f\r ]+/);
    if (!rel?.includes("stylesheet")) continue;
    const href = htmlAttribute(tag, "href");
    if (!href) continue;
    const localPath = localRequestPath(new URL(href, origin).href, origin);
    if (localPath) stylesheetPaths.add(localPath);
  }

  return stylesheetPaths;
}

async function verifyPageBackNavigationBoundaries(browser, origin) {
  const results = [];

  for (const scenario of PAGE_BACK_NAVIGATION_CASES) {
    const homeStylesheets = await routeStylesheetPaths(
      scenario.homePath,
      origin
    );
    const routeStylesheets = await routeStylesheetPaths(scenario.path, origin);
    const homeOnlyStylesheets = new Set(
      [...homeStylesheets].filter((stylesheet) => !routeStylesheets.has(stylesheet))
    );
    assert.ok(
      homeOnlyStylesheets.size > 0,
      `${scenario.name} has no distinguishable Home stylesheet boundary`
    );

    const context = await browser.newContext({ serviceWorkers: "block" });
    const pageErrors = [];
    const requests = [];
    let phase = "initial";

    try {
      await installExternalRuntimeStubs(context, {
        stubGalleryImages: scenario.surface === "gallery"
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("request", (request) => {
        const localPath = localRequestPath(request.url(), origin);
        if (!localPath) return;
        requests.push({
          localPath,
          method: request.method(),
          phase,
          resourceType: request.resourceType()
        });
      });

      const response = await page.goto(`${origin}${scenario.path}`, {
        waitUntil: "domcontentloaded"
      });
      assert.equal(response?.status(), 200);
      const pageBack = page.locator("a.page-back", { hasText: /.+/ }).first();
      await pageBack.waitFor({ state: "visible" });
      const accessibleName = (await pageBack.innerText()).trim();
      assert.ok(accessibleName, `${scenario.name} page-back has no accessible name`);
      assert.match(
        await pageBack.ariaSnapshot(),
        /link "[^"]+"/,
        `${scenario.name} page-back is missing link semantics`
      );
      assert.equal(await pageBack.getAttribute("href"), scenario.homePath);
      await page.waitForLoadState("networkidle");

      const documentIdentity = `${scenario.name}-page-back-document`;
      await page.evaluate((identity) => {
        window.__pageBackDocumentIdentity = identity;
      }, documentIdentity);

      const initialHomeRsc = requests.filter(
        (request) =>
          request.phase === "initial" &&
          isRscPathForExactDestination(request.localPath, scenario.homePath)
      );
      const initialHomeCss = requests.filter(
        (request) =>
          request.phase === "initial" &&
          homeOnlyStylesheets.has(request.localPath)
      );
      const initialHomeProbes = requests.filter(
        (request) =>
          request.phase === "initial" &&
          request.method === "HEAD" &&
          request.localPath === scenario.homePath.replace(/^\/+/, "")
      );
      assert.deepEqual(
        initialHomeRsc,
        [],
        `${scenario.name} prefetched Home RSC before page-back intent`
      );
      assert.deepEqual(
        initialHomeCss,
        [],
        `${scenario.name} prefetched Home CSS before page-back intent`
      );
      assert.deepEqual(
        initialHomeProbes,
        [],
        `${scenario.name} probed Home before page-back intent`
      );

      phase = "page-back-intent";
      await waitForRequestQuietPeriod(
        page,
        origin,
        `${scenario.name} page-back intent`,
        async () => {
          if (scenario.intent === "focus") {
            await pageBack.focus();
          } else {
            await pageBack.hover();
          }
        }
      );

      const intentLocalRequests = requests.filter(
        (request) => request.phase === "page-back-intent"
      );
      const intentHomeRsc = intentLocalRequests.filter(
        (request) =>
          isRscPathForExactDestination(request.localPath, scenario.homePath)
      );
      const intentHomeCss = intentLocalRequests.filter(
        (request) =>
          request.resourceType === "stylesheet" &&
          homeOnlyStylesheets.has(request.localPath)
      );
      const intentHomeProbes = intentLocalRequests.filter(
        (request) =>
          request.method === "HEAD" &&
          request.localPath === scenario.homePath.replace(/^\/+/, "")
      );
      assert.deepEqual(intentHomeRsc, []);
      assert.deepEqual(intentHomeCss, []);
      assert.deepEqual(intentHomeProbes, []);
      assert.deepEqual(pageErrors, []);

      phase = "navigation";
      await waitForRequestQuietPeriod(
        page,
        origin,
        `${scenario.name} page-back navigation`,
        () =>
          Promise.all([
            page.waitForURL(`${origin}${scenario.homePath}`),
            pageBack.click()
          ])
      );
      const navigationDocuments = requests.filter(
        (request) =>
          request.phase === "navigation" &&
          request.resourceType === "document"
      );
      const navigationRsc = requests.filter(
        (request) =>
          request.phase === "navigation" &&
          request.localPath.endsWith(".txt")
      );
      const navigationRscDestinations = [
        ...new Set(
          navigationRsc.map((request) =>
            rscDestinationFromPath(request.localPath)
          )
        )
      ];
      const navigationCss = requests.filter(
        (request) =>
          request.phase === "navigation" &&
          request.resourceType === "stylesheet"
      );
      const navigationHomeCss = navigationCss.filter((request) =>
        homeOnlyStylesheets.has(request.localPath)
      );
      const navigationSegmentedRsc = navigationRsc.filter((request) =>
        request.localPath.includes("/__next.")
      );
      const navigationHomeProbes = requests.filter(
        (request) =>
          request.phase === "navigation" &&
          request.method === "HEAD" &&
          request.localPath === scenario.homePath.replace(/^\/+/, "")
      );
      assert.deepEqual(
        navigationDocuments,
        [],
        `${scenario.name} page-back used a full document navigation`
      );
      assert.deepEqual(
        navigationRscDestinations,
        [scenario.homePath],
        `${scenario.name} page-back requested another RSC destination`
      );
      assert.equal(
        navigationRsc.length,
        1,
        `${scenario.name} page-back navigation must request one full Home RSC payload`
      );
      assert.equal(
        navigationRsc[0].localPath,
        `${scenario.homePath.replace(/^\/+/, "")}.txt`
      );
      assert.equal(navigationRsc[0].method, "GET");
      assert.deepEqual(
        navigationSegmentedRsc,
        [],
        `${scenario.name} page-back navigation fetched segmented Home RSC payloads`
      );
      assert.equal(
        navigationCss.length,
        1,
        `${scenario.name} page-back navigation must load one stylesheet`
      );
      assert.equal(
        navigationHomeCss.length,
        navigationCss.length,
        `${scenario.name} page-back navigation loaded CSS outside Home ownership`
      );
      assert.deepEqual(
        navigationHomeProbes,
        [],
        `${scenario.name} page-back navigation made a speculative Home probe`
      );
      assert.equal(
        await page.evaluate(() => window.__pageBackDocumentIdentity),
        documentIdentity,
        `${scenario.name} page-back replaced the active document`
      );
      assert.equal(new URL(page.url()).pathname, scenario.homePath);
      assert.deepEqual(pageErrors, []);

      results.push({
        accessibleName,
        homePath: scenario.homePath,
        intent: scenario.intent,
        path: scenario.path,
        initialHomeCss: initialHomeCss.length,
        initialHomeProbes: initialHomeProbes.length,
        initialHomeRsc: initialHomeRsc.length,
        intentHomeCss: intentHomeCss.length,
        intentHomeProbes: intentHomeProbes.length,
        intentHomeRsc: intentHomeRsc.length,
        intentLocalRequests: intentLocalRequests.length,
        navigationHomeCss: navigationHomeCss.length,
        navigationHomeProbes: navigationHomeProbes.length,
        navigationRscDestinations,
        navigationRscRequests: navigationRsc.length,
        navigationSegmentedRsc: navigationSegmentedRsc.length,
        navigationStylesheets: navigationCss.length,
        navigationDocuments: navigationDocuments.length
      });
    } finally {
      await context.close();
    }
  }

  return results;
}

async function findEngagementProviderChunks() {
  const index = await createArtifactIndex(OUT_DIR);
  const providerChunks = new Set();
  for (const file of index.files()) {
    if (!file.endsWith(".js")) continue;
    const source = await index.readText(file);
    if (ARCHIVE_PROVIDER_MARKERS.some((marker) => source.includes(marker))) {
      providerChunks.add(file);
    }
  }
  assert.ok(
    providerChunks.size > 0,
    "static artifact exposes no identifiable Firebase engagement provider chunk"
  );
  return providerChunks;
}

function normalizeArchiveSearch(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

function archiveSearchText(item) {
  return normalizeArchiveSearch(
    [item?.title, item?.summary, ...(Array.isArray(item?.tags) ? item.tags : [])]
      .filter((value) => typeof value === "string")
      .join(" ")
  );
}

export function deriveArchiveSearchQuery(searchIndex) {
  const items = Array.isArray(searchIndex?.items) ? searchIndex.items : [];
  const blobs = items.map(archiveSearchText);
  const candidates = [
    ...new Set(
      blobs.flatMap((blob) =>
        blob
          .split(/[^\p{L}\p{N}]+/u)
          .filter((token) => token.length >= 4)
      )
    )
  ].sort((left, right) => left.localeCompare(right, "en"));

  const strictSubsets = candidates
    .map((query) => ({
      matchCount: blobs.filter((blob) => blob.includes(query)).length,
      query,
      totalItems: items.length
    }))
    .filter(({ matchCount, totalItems }) => matchCount > 0 && matchCount < totalItems)
    .sort(
      (left, right) =>
        left.matchCount - right.matchCount || left.query.localeCompare(right.query, "en")
    );

  if (!strictSubsets[0]) {
    throw new Error("Archive search index has no deterministic strict-subset query");
  }
  return strictSubsets[0];
}

async function verifyArchiveLoadingBoundaries(
  browser,
  origin,
  providerChunks
) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const pageErrors = [];
  const requests = [];
  let phase = "initial";

  try {
    await installExternalRuntimeStubs(context);
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => {
      const localPath = localRequestPath(request.url(), origin);
      if (!localPath) return;
      requests.push({
        localPath,
        phase,
        provider: providerChunks.has(localPath),
        resourceType: request.resourceType()
      });
    });

    const response = await page.goto(`${origin}/en/blog`, {
      waitUntil: "domcontentloaded"
    });
    assert.equal(response?.status(), 200);
    const explorer = page.locator("[data-deferred-post-stats]");
    await explorer.waitFor({ state: "visible" });
    await page.waitForFunction(
      () =>
        document.querySelector("[data-deferred-post-stats]")?.getAttribute(
          "data-deferred-post-stats"
        ) === "waiting"
    );
    await page.waitForLoadState("networkidle");

    const eagerRsc = requests.filter(
      (request) => request.phase === "initial" && request.localPath.endsWith(".txt")
    );
    const eagerProvider = requests.filter(
      (request) => request.phase === "initial" && request.provider
    );
    assert.deepEqual(eagerRsc, [], "archive requested RSC before browsing intent");
    assert.deepEqual(
      eagerProvider,
      [],
      "archive requested a Firebase provider chunk before browsing intent"
    );

    const category = page.locator("a.blog-cat-card").first();
    const categoryHref = await category.getAttribute("href");
    assert.ok(categoryHref, "blog category card has no crawlable href");
    const categoryPath = new URL(categoryHref, origin).pathname;
    phase = "category-hover";
    const categoryPrefetch = page.waitForRequest((request) =>
      isRscRequestForDestination(request, origin, categoryPath)
    );
    await category.hover();
    await categoryPrefetch;
    await page.waitForLoadState("networkidle");

    const hoverRsc = requests.filter(
      (request) =>
        request.phase === "category-hover" && request.localPath.endsWith(".txt")
    );
    assert.ok(hoverRsc.length > 0, "category hover did not prefetch its RSC target");
    assert.ok(
      hoverRsc.every((request) => {
        const stem = request.localPath.slice(0, -4);
        const expected = categoryPath.replace(/^\/+/, "");
        return stem === expected || stem.startsWith(`${expected}/`);
      }),
      `category hover prefetched another destination: ${JSON.stringify(hoverRsc)}`
    );
    assert.deepEqual(
      requests.filter(
        (request) => request.phase === "category-hover" && request.provider
      ),
      [],
      "category hover loaded Firebase instead of only its navigation target"
    );

    phase = "scroll";
    const providerRequest = page.waitForRequest((request) => {
      const localPath = localRequestPath(request.url(), origin);
      return Boolean(localPath && providerChunks.has(localPath));
    });
    await page.mouse.wheel(0, 600);
    await providerRequest;
    await page.waitForFunction(
      () =>
        document.querySelector("[data-deferred-post-stats]")?.getAttribute(
          "data-deferred-post-stats"
        ) === "ready"
    );
    assert.ok(
      requests.some((request) => request.phase === "scroll" && request.provider),
      "first scroll did not enable deferred Firebase stats"
    );
    assert.deepEqual(pageErrors, []);

    return {
      category: categoryPath,
      eagerProviderChunks: eagerProvider.length,
      eagerRscRequests: eagerRsc.length,
      hoverRscRequests: hoverRsc.length,
      scrollProviderChunks: requests.filter(
        (request) => request.phase === "scroll" && request.provider
      ).length
    };
  } finally {
    await context.close();
  }
}

async function verifyRestoredArchiveSearch(browser, origin, providerChunks) {
  const scenarios = [
    {
      path: "/en/blog",
      searchPath: "en/search/blog.json"
    },
    {
      path: "/en/notes",
      searchPath: "en/search/notes.json"
    },
    {
      path: "/fr/notes",
      searchPath: "en/search/notes.json"
    }
  ];
  const results = [];

  for (const scenario of scenarios) {
    const context = await browser.newContext({ serviceWorkers: "block" });
    const requests = [];
    const pageErrors = [];
    try {
      await installExternalRuntimeStubs(context);
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("request", (request) => {
        const localPath = localRequestPath(request.url(), origin);
        if (localPath) requests.push(localPath);
      });

      const searchIndex = JSON.parse(
        await fs.readFile(path.join(OUT_DIR, scenario.searchPath), "utf8")
      );
      const { query, totalItems } = deriveArchiveSearchQuery(searchIndex);
      const pathWithQuery = `${scenario.path}?q=${encodeURIComponent(query)}`;
      const response = await page.goto(`${origin}${pathWithQuery}`, {
        waitUntil: "domcontentloaded"
      });
      assert.equal(response?.status(), 200);
      await page.waitForFunction(
        ({ query, totalItems }) => {
          const explorer = document.querySelector("[data-search-status]");
          const input = document.querySelector(".blog-search__input");
          const count = Number(
            explorer?.getAttribute("data-explorer-result-count")
          );
          return (
            input?.value === query &&
            new URL(window.location.href).searchParams.get("q") === query &&
            explorer?.getAttribute("data-search-status") === "ready" &&
            explorer?.getAttribute("data-deferred-post-stats") === "ready" &&
            count > 0 &&
            count < totalItems
          );
        },
        { query, totalItems }
      );
      await page.waitForLoadState("networkidle");

      const resultCount = Number(
        await page.locator("[data-explorer-result-count]").getAttribute(
          "data-explorer-result-count"
        )
      );
      assert.ok(
        requests.includes(scenario.searchPath),
        `${pathWithQuery} did not request its search index`
      );
      assert.ok(
        requests.some((requestPath) => providerChunks.has(requestPath)),
        `${pathWithQuery} did not request the deferred Firebase provider`
      );
      assert.deepEqual(pageErrors, []);
      results.push({
        path: pathWithQuery,
        providerChunks: requests.filter((requestPath) =>
          providerChunks.has(requestPath)
        ).length,
        resultCount,
        query,
        searchRequests: requests.filter(
          (requestPath) => requestPath === scenario.searchPath
        ).length,
        totalItems
      });
    } finally {
      await context.close();
    }
  }

  return results;
}

async function verifySaveDataArchiveBoundary(browser, origin, providerChunks) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const providerRequests = [];
  const localRequests = [];
  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: { saveData: true }
      });
    });
    await installExternalRuntimeStubs(context);
    const page = await context.newPage();
    page.on("request", (request) => {
      const localPath = localRequestPath(request.url(), origin);
      if (localPath) localRequests.push(localPath);
      if (localPath && providerChunks.has(localPath)) {
        providerRequests.push(localPath);
      }
    });

    const searchIndex = JSON.parse(
      await fs.readFile(path.join(OUT_DIR, "en/search/notes.json"), "utf8")
    );
    const { query, totalItems } = deriveArchiveSearchQuery(searchIndex);
    const response = await page.goto(
      `${origin}/en/notes?q=${encodeURIComponent(query)}`,
      {
      waitUntil: "domcontentloaded"
      }
    );
    assert.equal(response?.status(), 200);
    await page.waitForFunction(
      ({ query, totalItems }) => {
        const explorer = document.querySelector("[data-search-status]");
        const count = Number(
          explorer?.getAttribute("data-explorer-result-count")
        );
        return (
          document.querySelector(".blog-search__input")?.value === query &&
          new URL(window.location.href).searchParams.get("q") === query &&
          explorer?.getAttribute("data-search-status") === "ready" &&
          explorer?.getAttribute("data-deferred-post-stats") === "skipped" &&
          count > 0 &&
          count < totalItems
        );
      },
      { query, totalItems }
    );
    await page.waitForLoadState("networkidle");
    await page.mouse.wheel(0, 600);
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    );
    assert.deepEqual(
      providerRequests,
      [],
      "Save-Data archive loaded the Firebase engagement provider"
    );
    assert.ok(
      localRequests.includes("en/search/notes.json"),
      "Save-Data restored search did not request its search index"
    );
    return {
      providerChunks: providerRequests.length,
      query,
      searchRequests: localRequests.filter(
        (requestPath) => requestPath === "en/search/notes.json"
      ).length,
      status: "skipped"
    };
  } finally {
    await context.close();
  }
}

async function verifyPublicToStudioBoundary(browser, origin) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const pageErrors = [];
  const googleRequests = [];
  try {
    await installExternalRuntimeStubs(context);
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => {
      if (isGoogleRequest(request.url())) googleRequests.push(request.url());
    });

    const homeResponse = await page.goto(`${origin}/en`, {
      waitUntil: "domcontentloaded"
    });
    assert.equal(homeResponse?.status(), 200);
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () =>
        typeof window.gtag === "function" &&
        Array.isArray(window.adsbygoogle) &&
        window.__googleTagRuntimeLoaded === true &&
        window.__adsenseRuntimeLoaded === true
    );
    const googleReadiness = await page.evaluate(() => ({
      adsbygoogleIsArray: Array.isArray(window.adsbygoogle),
      adsenseRuntime: window.__adsenseRuntimeLoaded,
      gtagType: typeof window.gtag,
      googleRuntime: window.__googleTagRuntimeLoaded,
      readyState: document.readyState,
      scriptSources: [...document.querySelectorAll("script[src]")]
        .map((script) => script.src)
        .filter(
          (source) =>
            source.includes("googletagmanager.com") ||
            source.includes("googlesyndication.com")
        ),
      dataLayerScript: Boolean(document.querySelector("#GTM_datalayer"))
    }));
    assert.deepEqual(
      {
        adsbygoogleIsArray: googleReadiness.adsbygoogleIsArray,
        adsenseRuntime: googleReadiness.adsenseRuntime,
        gtagType: googleReadiness.gtagType,
        googleRuntime: googleReadiness.googleRuntime
      },
      {
        adsbygoogleIsArray: true,
        adsenseRuntime: true,
        gtagType: "function",
        googleRuntime: true
      },
      `public Google runtime did not mount: ${JSON.stringify(googleReadiness)}`
    );

    const publicState = await page.evaluate(() => ({
      googleNodes: document.querySelectorAll(
        'script[src*="googletagmanager.com"],script[src*="googlesyndication.com"],#GTM_datalayer'
      ).length,
      studioHref: document
        .querySelector('[data-document-navigation="studio"]')
        ?.getAttribute("href")
    }));
    assert.ok(publicState.googleNodes >= 3);
    assert.equal(publicState.studioHref, "/en/studio");
    assert.ok(googleRequests.length >= 2);

    const documentMarker = `public-${Date.now()}`;
    await page.evaluate((marker) => {
      window.__publicDocumentMarker = marker;
      sessionStorage.setItem("runtime-boundary-document-marker", marker);
      const originalCapture = window.posthog.capture.bind(window.posthog);
      window.posthog.capture = (event, properties, options) => {
        if (event === "cv_nav_click" && properties?.target === "studio_footer") {
          sessionStorage.setItem("runtime-boundary-analytics-event", event);
          sessionStorage.setItem(
            "runtime-boundary-analytics-transport",
            options?.transport ?? ""
          );
        }
        return originalCapture(event, properties, options);
      };
    }, documentMarker);

    const googleRequestCountBeforeNavigation = googleRequests.length;
    const studioDocumentResponse = page.waitForResponse((response) => {
      const request = response.request();
      return (
        request.resourceType() === "document" &&
        new URL(response.url()).pathname === "/en/studio"
      );
    });
    await page.locator('[data-document-navigation="studio"]').click();
    const navigationResponse = await studioDocumentResponse;
    assert.equal(navigationResponse.status(), 200);

    const studioHost = page.locator('[data-studio-shadow-host]');
    await studioHost.locator(".studio-admin").waitFor({ state: "visible" });
    const studioState = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation").at(-1);
      return {
        analyticsEvent: sessionStorage.getItem(
          "runtime-boundary-analytics-event"
        ),
        analyticsTransport: sessionStorage.getItem(
          "runtime-boundary-analytics-transport"
        ),
        documentMarker: window.__publicDocumentMarker,
        persistedMarker: sessionStorage.getItem(
          "runtime-boundary-document-marker"
        ),
        googleNodes: document.querySelectorAll(
          'script[src*="googletagmanager.com"],script[src*="googlesyndication.com"],link[href*="googletagmanager.com"],link[href*="googlesyndication.com"],meta[name="google-adsense-account"],#GTM_datalayer'
        ).length,
        gtagType: typeof window.gtag,
        adsbygoogleType: typeof window.adsbygoogle,
        googleRuntimeType: typeof window.__googleTagRuntimeLoaded,
        adsenseRuntimeType: typeof window.__adsenseRuntimeLoaded,
        navigationName: navigation?.name,
        navigationType: navigation?.type
      };
    });

    assert.equal(studioState.persistedMarker, documentMarker);
    assert.equal(studioState.documentMarker, undefined);
    assert.equal(studioState.analyticsEvent, "cv_nav_click");
    assert.equal(studioState.analyticsTransport, "sendBeacon");
    assert.equal(studioState.googleNodes, 0);
    assert.equal(studioState.gtagType, "undefined");
    assert.equal(studioState.adsbygoogleType, "undefined");
    assert.equal(studioState.googleRuntimeType, "undefined");
    assert.equal(studioState.adsenseRuntimeType, "undefined");
    assert.equal(new URL(studioState.navigationName).pathname, "/en/studio");
    assert.equal(studioState.navigationType, "navigate");
    assert.equal(googleRequests.length, googleRequestCountBeforeNavigation);
    assert.equal(await page.locator("h1").count(), 1);
    assert.deepEqual(pageErrors, []);

    return {
      googleRequestsMounted: googleRequestCountBeforeNavigation,
      studioGoogleNodes: studioState.googleNodes,
      studioNavigationType: studioState.navigationType
    };
  } finally {
    await context.close();
  }
}

async function verifyPublicCssRuntime(browser, origin) {
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 }
  ];
  const results = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width: viewport.width, height: viewport.height }
    });
    try {
      await installExternalRuntimeStubs(context);
      for (const scenario of PUBLIC_CSS_RUNTIME_CASES) {
        const page = await context.newPage();
        const pageErrors = [];
        const fatalConsole = [];
        const failedStylesheets = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("console", (message) => {
          if (
            message.type() === "error" &&
            /(?:uncaught|typeerror|referenceerror|syntaxerror)/i.test(message.text())
          ) {
            fatalConsole.push(message.text());
          }
        });
        page.on("requestfailed", (request) => {
          if (request.resourceType() === "stylesheet") {
            failedStylesheets.push(request.url());
          }
        });
        page.on("response", (response) => {
          if (
            response.request().resourceType() === "stylesheet" &&
            !response.ok()
          ) {
            failedStylesheets.push(`${response.status()} ${response.url()}`);
          }
        });

        const response = await page.goto(`${origin}${scenario.path}`, {
          waitUntil: "networkidle"
        });
        assert.equal(response?.status(), 200, `${scenario.path} did not load`);
        const snapshot = await page.evaluate((contract) => {
          const root = document.querySelector(contract.selector);
          const heading = document.querySelector("h1");
          const style = root ? getComputedStyle(root) : null;
          const rect = root?.getBoundingClientRect();
          const headingRect = heading?.getBoundingClientRect();
          return {
            canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
            description:
              document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
            headingCount: document.querySelectorAll("h1").length,
            headingVisible: Boolean(
              headingRect && headingRect.width > 0 && headingRect.height > 0
            ),
            rootHeight: rect?.height ?? 0,
            rootWidth: rect?.width ?? 0,
            styleValue: style?.[contract.property] ?? "",
            stylesheetCount: [...document.styleSheets].filter((sheet) => {
              if (!sheet.href) return false;
              return new URL(sheet.href).origin === window.location.origin;
            }).length,
            title: document.title
          };
        }, scenario);

        assert.ok(snapshot.title, `${scenario.path} has no title`);
        assert.ok(snapshot.description, `${scenario.path} has no description`);
        assert.ok(snapshot.canonical, `${scenario.path} has no canonical`);
        assert.equal(snapshot.headingCount, 1, `${scenario.path} must keep one h1`);
        assert.equal(snapshot.headingVisible, true, `${scenario.path} h1 is hidden`);
        assert.ok(snapshot.rootWidth > 100 && snapshot.rootHeight > 40);
        assert.equal(snapshot.stylesheetCount, scenario.stylesheets);
        if (scenario.value) assert.equal(snapshot.styleValue, scenario.value);
        if (scenario.notValue) assert.notEqual(snapshot.styleValue, scenario.notValue);
        assert.deepEqual(pageErrors, []);
        assert.deepEqual(fatalConsole, []);
        assert.deepEqual(failedStylesheets, []);
        results.push({
          name: scenario.name,
          viewport: viewport.name,
          root: [Math.round(snapshot.rootWidth), Math.round(snapshot.rootHeight)],
          stylesheets: snapshot.stylesheetCount
        });
        await page.close();
      }

      const navigationPage = await context.newPage();
      await navigationPage.goto(`${origin}/en`, { waitUntil: "networkidle" });
      const destination = "/en/gallery";
      await Promise.all([
        navigationPage.waitForURL(`${origin}${destination}`),
        navigationPage
          .locator(`a[href="${destination}"]`)
          .first()
          .evaluate((anchor) => anchor.click())
      ]);
      await navigationPage.locator(".gallery-showcase").waitFor({ state: "visible" });
      assert.equal(
        await navigationPage.locator(".gallery-showcase").evaluate(
          (element) => getComputedStyle(element).overflowX === "clip"
        ),
        true
      );
      await navigationPage.close();
    } finally {
      await context.close();
    }
  }

  return { directRoutes: results, clientNavigations: viewports.length };
}

async function verifyGalleryPreloadAndLcp(browser, origin) {
  const scenarios = [
    { name: "desktop", width: 1440, height: 900, preloadMatches: true },
    { name: "mobile", width: 390, height: 844, preloadMatches: false }
  ];
  const results = [];

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      deviceScaleFactor: 1,
      serviceWorkers: "block",
      viewport: { width: scenario.width, height: scenario.height }
    });
    try {
      await installGalleryLcpObserver(context);
      await installExternalRuntimeStubs(context, { stubGalleryImages: true });
      const page = await context.newPage();
      const galleryImageRequests = [];
      const pageErrors = [];
      const preloadWarnings = [];

      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.pathname.startsWith("/dom-pub/icdn/gallery/")) {
          galleryImageRequests.push({
            resourceType: request.resourceType(),
            url: request.url()
          });
        }
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (/preload/i.test(message.text()) && /not used|unused/i.test(message.text())) {
          preloadWarnings.push(message.text());
        }
      });

      const response = await page.goto(`${origin}/en/gallery`, {
        waitUntil: "networkidle"
      });
      assert.equal(response?.status(), 200, "Gallery did not load");
      await page.waitForFunction(
        () => window.__galleryLcpEntries?.length > 0,
        undefined,
        { timeout: 5_000 }
      );
      if (scenario.preloadMatches) {
        await page.waitForFunction(
          () => {
            const image = document.querySelector(
              ".gallery-spotlight-card-1 img"
            );
            return image?.complete && image.naturalWidth > 0;
          },
          undefined,
          { timeout: 5_000 }
        );
      }
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          )
      );

      const snapshot = await page.evaluate(() => {
        const preload = document.querySelector(
          'head link[data-gallery-desktop-preload="true"]'
        );
        const image = document.querySelector(
          ".gallery-spotlight-card-1 img"
        );
        const preloadHref = preload?.href ?? "";
        return {
          firstImageComplete: Boolean(image?.complete && image.naturalWidth > 0),
          firstImageFetchPriority: image?.getAttribute("fetchpriority") ?? "",
          firstImageSrc: image?.currentSrc || image?.src || "",
          lcpEntries: window.__galleryLcpEntries ?? [],
          media: preload?.media ?? "",
          mediaMatches: preload ? matchMedia(preload.media).matches : null,
          preloadFetchPriority: preload?.getAttribute("fetchpriority") ?? "",
          preloadHref,
          resourceEntries: preloadHref
            ? performance
                .getEntriesByName(preloadHref, "resource")
                .map((entry) => ({
                  initiatorType: entry.initiatorType,
                  name: entry.name
                }))
            : []
        };
      });

      assert.match(snapshot.preloadHref, /\/gallery\/projects\/wat-overview\.webp$/);
      assert.equal(snapshot.media, "(min-width: 641px)");
      assert.equal(snapshot.mediaMatches, scenario.preloadMatches);
      assert.equal(snapshot.preloadFetchPriority, "high");
      assert.equal(snapshot.firstImageSrc, snapshot.preloadHref);
      assert.equal(snapshot.firstImageFetchPriority, "");

      const exactRequests = galleryImageRequests.filter(
        ({ url }) => url === snapshot.preloadHref
      );
      assert.ok(
        exactRequests.length <= 1,
        `${scenario.name} fetched the Gallery spotlight more than once`
      );
      assert.ok(
        snapshot.resourceEntries.length <= 1,
        `${scenario.name} recorded duplicate Gallery spotlight resources`
      );
      const finalLcp = snapshot.lcpEntries.at(-1);
      assert.ok(finalLcp, `${scenario.name} emitted no LCP entry`);

      if (scenario.preloadMatches) {
        assert.equal(snapshot.firstImageComplete, true);
        assert.equal(exactRequests.length, 1);
        assert.equal(snapshot.resourceEntries.length, 1);
        assert.equal(finalLcp.tagName, "IMG");
        assert.match(finalLcp.className, /gallery-spotlight-image/);
        assert.equal(finalLcp.url, snapshot.preloadHref);
      } else {
        assert.deepEqual(
          snapshot.resourceEntries.filter(
            ({ initiatorType }) => initiatorType === "link"
          ),
          [],
          "mobile must not fetch the desktop-only preload"
        );
        assert.notEqual(finalLcp.tagName, "IMG");
        assert.equal(finalLcp.isText, true);
      }

      assert.deepEqual(pageErrors, []);
      assert.deepEqual(preloadWarnings, []);
      results.push({
        firstImageRequests: exactRequests.length,
        finalLcp,
        mediaMatches: snapshot.mediaMatches,
        name: scenario.name,
        resourceInitiators: snapshot.resourceEntries.map(
          ({ initiatorType }) => initiatorType
        )
      });
    } finally {
      await context.close();
    }
  }

  return { path: "/en/gallery", scenarios: results };
}

async function verifyPersistedReadingFont(browser, origin) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const persistedFont = "lora";
  const storageKey = "reading_font_preference";

  try {
    await installExternalRuntimeStubs(context);
    await context.addInitScript(
      ({ font, key }) => {
        localStorage.setItem(key, font);
        globalThis.__initialReadingFontFrames = [];
        let remainingFrames = 8;
        const capture = () => {
          const publicRoot = document.querySelector("main, .app-nav");
          const publicRect = publicRoot?.getBoundingClientRect();
          if (document.body && publicRect?.width > 0 && publicRect?.height > 0) {
            globalThis.__initialReadingFontFrames.push({
              attribute: document.documentElement.getAttribute("data-reading-font"),
              fontFamily: getComputedStyle(document.body).fontFamily
            });
            remainingFrames -= 1;
          }
          if (remainingFrames > 0) requestAnimationFrame(capture);
        };
        requestAnimationFrame(capture);
      },
      { font: persistedFont, key: storageKey }
    );

    const snapshot = async (page) => {
      await page.waitForFunction(
        () => globalThis.__initialReadingFontFrames?.length > 0
      );
      return page.evaluate(() => ({
        attribute: document.documentElement.getAttribute("data-reading-font"),
        fontFamily: getComputedStyle(document.body).fontFamily,
        initialFrames: globalThis.__initialReadingFontFrames
      }));
    };
    const assertStableInitialFrames = (label, state, expectedFont) => {
      assert.equal(state.attribute, persistedFont, `${label} lost persisted font`);
      assert.ok(state.initialFrames.length > 0, `${label} captured no pre-paint frame`);
      for (const frame of state.initialFrames) {
        assert.equal(frame.attribute, persistedFont, `${label} flashed the default font attribute`);
        assert.equal(frame.fontFamily, expectedFont, `${label} flashed a different computed font`);
      }
    };

    const directHomePage = await context.newPage();
    const homeResponse = await directHomePage.goto(`${origin}/en`, {
      waitUntil: "networkidle"
    });
    assert.equal(homeResponse?.status(), 200);
    const directHome = await snapshot(directHomePage);

    const articlePage = await context.newPage();
    const articleResponse = await articlePage.goto(`${origin}${PUBLIC_ARTICLE}`, {
      waitUntil: "networkidle"
    });
    assert.equal(articleResponse?.status(), 200);
    const directArticle = await snapshot(articlePage);

    await articlePage.evaluate(() => {
      globalThis.__navigationReadingFontFrames = [];
      let remainingFrames = 24;
      const capture = () => {
        globalThis.__navigationReadingFontFrames.push(
          getComputedStyle(document.body).fontFamily
        );
        remainingFrames -= 1;
        if (remainingFrames > 0) requestAnimationFrame(capture);
      };
      requestAnimationFrame(capture);
    });
    await Promise.all([
      articlePage.waitForURL(`${origin}/en`),
      articlePage.locator("a.brand").click()
    ]);
    await articlePage.waitForLoadState("networkidle");
    await articlePage.waitForFunction(
      () => globalThis.__navigationReadingFontFrames?.length >= 2
    );
    const clientHome = await articlePage.evaluate(() => ({
      attribute: document.documentElement.getAttribute("data-reading-font"),
      fontFamily: getComputedStyle(document.body).fontFamily,
      navigationFrames: globalThis.__navigationReadingFontFrames
    }));

    await articlePage.reload({ waitUntil: "networkidle" });
    const reloadedHome = await snapshot(articlePage);

    assertStableInitialFrames("direct Home", directHome, directHome.fontFamily);
    assertStableInitialFrames("direct article", directArticle, directHome.fontFamily);
    assertStableInitialFrames("reloaded Home", reloadedHome, directHome.fontFamily);
    assert.equal(directArticle.fontFamily, directHome.fontFamily);
    assert.equal(clientHome.attribute, persistedFont);
    assert.equal(clientHome.fontFamily, directHome.fontFamily);
    assert.ok(clientHome.navigationFrames.length > 0);
    assert.ok(
      clientHome.navigationFrames.every((fontFamily) => fontFamily === directHome.fontFamily),
      "Article to Home navigation flashed a different computed font"
    );
    assert.equal(reloadedHome.fontFamily, directHome.fontFamily);

    await directHomePage.close();
    await articlePage.close();
    return {
      font: persistedFont,
      fontFamily: directHome.fontFamily,
      initialFrameSamples:
        directHome.initialFrames.length +
        directArticle.initialFrames.length +
        reloadedHome.initialFrames.length,
      navigationFrameSamples: clientHome.navigationFrames.length
    };
  } finally {
    await context.close();
  }
}

async function verifyReaderPathnameRemount(browser, origin) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const pageErrors = [];
  try {
    await installExternalRuntimeStubs(context);
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(`${origin}${PUBLIC_ARTICLE}`, {
      waitUntil: "domcontentloaded"
    });
    assert.equal(response?.status(), 200);
    await page.evaluate(() => {
      window.__readerDocumentMarker = "reader-document";
      window.scrollTo(0, 900);
    });

    const trigger = page.locator(".blog-reader-tools__trigger");
    await trigger.waitFor({ state: "visible" });
    await trigger.click();
    assert.equal(await trigger.getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator("#blog-reader-tools-panel").count(), 1);

    await page.evaluate((pathname) => {
      window.history.pushState(null, "", pathname);
    }, SECOND_ARTICLE);
    await page.waitForURL(`**${SECOND_ARTICLE}`);
    const markerAfterArticleB = await page.evaluate(
      () => window.__readerDocumentMarker
    );
    assert.equal(
      markerAfterArticleB,
      "reader-document",
      "article A to B should stay inside the same document"
    );
    assert.equal(
      await page
        .locator(".blog-reader-tools__trigger")
        .getAttribute("aria-expanded"),
      "false"
    );

    await page.evaluate((pathname) => {
      window.history.pushState(null, "", pathname);
    }, PUBLIC_ARTICLE);
    await page.waitForURL(`**${PUBLIC_ARTICLE}`);
    assert.equal(
      await page.evaluate(() => window.__readerDocumentMarker),
      "reader-document",
      "article B to A should stay inside the same document"
    );
    assert.equal(
      await page
        .locator(".blog-reader-tools__trigger")
        .getAttribute("aria-expanded"),
      "false"
    );
    assert.equal(await page.locator("#blog-reader-tools-panel").count(), 0);
    assert.deepEqual(pageErrors, []);

    return { articleA: PUBLIC_ARTICLE, articleB: SECOND_ARTICLE };
  } finally {
    await context.close();
  }
}

async function verifyContentHubAnalytics(browser, origin) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.addInitScript(() => {
    window.__contentHubAnalyticsEvents = [];
    window.posthog = {
      __SV: 1,
      init() {},
      capture(event, properties) {
        window.__contentHubAnalyticsEvents.push({ event, properties });
      },
      identify() {},
      register() {},
      unregister() {},
      register_once() {},
      set_config() {}
    };
  });

  try {
    await installExternalRuntimeStubs(context);
    const page = await context.newPage();
    const results = [];
    const internalRequests = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.origin === origin) {
        internalRequests.push({
          pathname: url.pathname,
          resourceType: request.resourceType()
        });
      }
    });

    for (const scenario of CONTENT_HUB_CASES) {
      const response = await page.goto(`${origin}${scenario.path}`, {
        waitUntil: "domcontentloaded"
      });
      assert.equal(response?.status(), 200);
      await page.waitForFunction(
        ({ kind, hubId }) =>
          window.__contentHubAnalyticsEvents.some(
            ({ event, properties }) =>
              event === "content_hub_view" &&
              properties?.content_hub_kind === kind &&
              properties?.content_hub_id === hubId
          ),
        { kind: scenario.kind, hubId: scenario.hubId }
      );
      await page.evaluate(() => {
        document.addEventListener("click", (event) => event.preventDefault(), {
          capture: true
        });
        window.__contentHubAnalyticsEvents = [];
      });

      const card = page.locator('a[data-content-hub-action="article"]').first();
      const cardData = await card.evaluate((link) => ({
        category: link.dataset.contentCategory,
        page: Number(link.dataset.contentHubPage),
        position: Number(link.dataset.contentPosition),
        slug: link.dataset.contentSlug
      }));
      await card.locator(".blog-card__title").click();
      await page.waitForFunction(
        ({ first, second }) =>
          window.__contentHubAnalyticsEvents.filter(
            ({ event }) => event === first || event === second
          ).length >= 2,
        {
          first: "content_hub_article_click",
          second: scenario.legacyCardEvent
        }
      );
      await page.waitForTimeout(50);
      const cardEvents = await page.evaluate(
        (eventNames) =>
          window.__contentHubAnalyticsEvents.filter(({ event }) =>
            eventNames.includes(event)
          ),
        ["content_hub_article_click", scenario.legacyCardEvent]
      );
      assert.deepEqual(
        cardEvents
          .map(({ event }) => event)
          .sort((left, right) => left.localeCompare(right)),
        ["content_hub_article_click", scenario.legacyCardEvent].sort(
          (left, right) => left.localeCompare(right)
        )
      );
      const hubCardEvent = cardEvents.find(
        ({ event }) => event === "content_hub_article_click"
      );
      assert.deepEqual(
        {
          kind: hubCardEvent.properties.content_hub_kind,
          hubId: hubCardEvent.properties.content_hub_id,
          page: hubCardEvent.properties.content_hub_page,
          position: hubCardEvent.properties.position,
          slug: hubCardEvent.properties.content_slug
        },
        {
          kind: scenario.kind,
          hubId: scenario.hubId,
          page: cardData.page,
          position: cardData.position,
          slug: cardData.slug
        }
      );
      const legacyCardEvent = cardEvents.find(
        ({ event }) => event === scenario.legacyCardEvent
      );
      assert.deepEqual(
        {
          surface: legacyCardEvent.properties.content_surface,
          category: legacyCardEvent.properties.content_category,
          slug: legacyCardEvent.properties.content_slug,
          source: legacyCardEvent.properties.source
        },
        {
          surface: scenario.surface,
          category: cardData.category,
          slug: cardData.slug,
          source: scenario.kind
        }
      );

      await page.evaluate(() => {
        window.__contentHubAnalyticsEvents = [];
      });
      const pagination = page.locator(
        'a[data-content-hub-action="pagination"][data-content-hub-destination-page="2"]'
      ).first();
      await pagination.click();
      await page.waitForFunction(
        () =>
          window.__contentHubAnalyticsEvents.filter(
            ({ event }) =>
              event === "content_hub_page_change" ||
              event === "explorer_page_change"
          ).length >= 2
      );
      await page.waitForTimeout(50);
      const paginationEvents = await page.evaluate(() =>
        window.__contentHubAnalyticsEvents.filter(
          ({ event }) =>
            event === "content_hub_page_change" ||
            event === "explorer_page_change"
        )
      );
      assert.deepEqual(
        paginationEvents
          .map(({ event }) => event)
          .sort((left, right) => left.localeCompare(right)),
        ["content_hub_page_change", "explorer_page_change"].sort(
          (left, right) => left.localeCompare(right)
        )
      );
      for (const { properties } of paginationEvents) {
        assert.deepEqual(
          {
            kind: properties.content_hub_kind,
            hubId: properties.content_hub_id,
            page: properties.content_hub_page,
            destinationPage: properties.destination_page,
            targetPage: properties.target_page,
            surface: properties.content_surface,
            source: properties.source
          },
          {
            kind: scenario.kind,
            hubId: scenario.hubId,
            page: 1,
            destinationPage: 2,
            targetPage: 2,
            surface: scenario.surface,
            source: scenario.kind
          }
        );
      }

      await page.evaluate(() => {
        window.__contentHubAnalyticsEvents = [];
      });
      const archiveLink = page.locator(
        'a[data-content-hub-action="archive"]'
      );
      assert.equal(await archiveLink.count(), 1);
      await archiveLink.click();
      await page.waitForFunction(
        () =>
          window.__contentHubAnalyticsEvents.filter(
            ({ event }) => event === "content_hub_archive_click"
          ).length >= 1
      );
      await page.waitForTimeout(50);
      const archiveEvents = await page.evaluate(() =>
        window.__contentHubAnalyticsEvents.filter(
          ({ event }) =>
            event.startsWith("content_hub_") ||
            event === "blog_card_click" ||
            event === "notes_card_click" ||
            event === "explorer_page_change"
        )
      );
      assert.deepEqual(
        archiveEvents.map(({ event }) => event),
        ["content_hub_archive_click"]
      );
      assert.deepEqual(
        {
          kind: archiveEvents[0].properties.content_hub_kind,
          hubId: archiveEvents[0].properties.content_hub_id,
          page: archiveEvents[0].properties.content_hub_page,
          source: archiveEvents[0].properties.source,
          destination: archiveEvents[0].properties.destination
        },
        {
          kind: scenario.kind,
          hubId: scenario.hubId,
          page: 1,
          source: "content_hub_breadcrumb",
          destination: scenario.archiveDestination
        }
      );

      results.push({
        path: scenario.path,
        cardEvents: cardEvents.length,
        paginationEvents: paginationEvents.length,
        archiveEvents: archiveEvents.length
      });
    }

    const articleResults = [];
    for (const scenario of ARTICLE_HUB_CASES) {
      internalRequests.length = 0;
      const response = await page.goto(`${origin}${scenario.path}`, {
        waitUntil: "domcontentloaded"
      });
      assert.equal(response?.status(), 200);
      await page.waitForFunction(
        (viewEvent) =>
          window.__contentHubAnalyticsEvents.some(
            ({ event }) => event === viewEvent
          ),
        scenario.viewEvent
      );
      await page.waitForTimeout(100);
      const eagerHubRequests = internalRequests.filter(
        ({ pathname, resourceType }) =>
          (resourceType === "fetch" || resourceType === "document") &&
          (pathname === scenario.destination ||
            pathname === `${scenario.destination}.txt` ||
            pathname.startsWith(`${scenario.destination}/`))
      );
      assert.deepEqual(
        eagerHubRequests,
        [],
        `hub destination prefetched before intent: ${scenario.destination}`
      );
      await page.evaluate(() => {
        document.addEventListener("click", (event) => event.preventDefault(), {
          capture: true
        });
        window.__contentHubAnalyticsEvents = [];
      });

      for (const source of scenario.sources) {
        const hubLink = page.locator(
          `a[data-content-hub-action="hub"][data-source="${source}"]`
        );
        assert.equal(await hubLink.count(), 1);
        assert.equal(await hubLink.getAttribute("href"), scenario.destination);
        await hubLink.click();
        await page.waitForFunction(
          () =>
            window.__contentHubAnalyticsEvents.filter(
              ({ event }) => event === "content_hub_click"
            ).length >= 1
        );
        await page.waitForTimeout(50);
        const hubEvents = await page.evaluate(() =>
          window.__contentHubAnalyticsEvents.filter(
            ({ event }) =>
              event.startsWith("content_hub_") ||
              event === "blog_card_click" ||
              event === "notes_card_click" ||
              event === "explorer_page_change"
          )
        );
        assert.deepEqual(
          hubEvents.map(({ event }) => event),
          ["content_hub_click"]
        );
        assert.deepEqual(
          {
            kind: hubEvents[0].properties.content_hub_kind,
            hubId: hubEvents[0].properties.content_hub_id,
            page: hubEvents[0].properties.content_hub_page,
            source: hubEvents[0].properties.source,
            destination: hubEvents[0].properties.destination
          },
          {
            kind: scenario.kind,
            hubId: scenario.hubId,
            page: 1,
            source,
            destination: scenario.destination
          }
        );
        articleResults.push({
          path: scenario.path,
          source,
          hubEvents: hubEvents.length,
          eagerHubRequests: eagerHubRequests.length
        });
        await page.evaluate(() => {
          window.__contentHubAnalyticsEvents = [];
        });
      }
    }

    return { hubPages: results, articleLinks: articleResults };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.access(OUT_DIR);
  const providerChunks = await findEngagementProviderChunks();
  const { chromium } = await import("playwright");
  const { server, origin } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const publicToStudio = await verifyPublicToStudioBoundary(browser, origin);
    const publicCss = await verifyPublicCssRuntime(browser, origin);
    const galleryPreloadAndLcp = await verifyGalleryPreloadAndLcp(
      browser,
      origin
    );
    const pageBackNavigation = await verifyPageBackNavigationBoundaries(
      browser,
      origin
    );
    const persistedReadingFont = await verifyPersistedReadingFont(browser, origin);
    const readerRemount = await verifyReaderPathnameRemount(browser, origin);
    const contentHubAnalytics = await verifyContentHubAnalytics(browser, origin);
    const archiveLoading = await verifyArchiveLoadingBoundaries(
      browser,
      origin,
      providerChunks
    );
    const restoredArchiveSearch = await verifyRestoredArchiveSearch(
      browser,
      origin,
      providerChunks
    );
    const saveDataArchive = await verifySaveDataArchiveBoundary(
      browser,
      origin,
      providerChunks
    );
    console.log(
      JSON.stringify(
        {
          status: "ok",
          publicToStudio,
          publicCss,
          galleryPreloadAndLcp,
          pageBackNavigation,
          persistedReadingFont,
          readerRemount,
          contentHubAnalytics,
          archiveLoading,
          restoredArchiveSearch,
          saveDataArchive
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
    await closeServer(server);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error("[verify-runtime-boundaries] failed:", error);
    process.exit(1);
  });
}
