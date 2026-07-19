#!/usr/bin/env node

import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveFile } from "./verify-offline.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.RUNTIME_BOUNDARY_VERIFY_PORT ?? "0");
const PUBLIC_ARTICLE = "/en/blog/culture/how-to-be-a-kind-engineer";
const SECOND_ARTICLE = "/en/blog/culture/how-to-review-code-kindly";
const CONTENT_HUB_CASES = [
  {
    path: "/en/blog/series/foundations",
    kind: "blog_series",
    hubId: "foundations",
    surface: "blog",
    legacyCardEvent: "blog_card_click"
  },
  {
    path: "/vi/notes/topics/thoughts",
    kind: "notes_topic",
    hubId: "thoughts",
    surface: "notes",
    legacyCardEvent: "notes_card_click"
  }
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

async function installExternalRuntimeStubs(context) {
  await context.route(/^https:\/\//, async (route) => {
    const url = new URL(route.request().url());
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

function isGoogleRequest(url) {
  return (
    url.includes("googletagmanager.com") ||
    url.includes("googlesyndication.com")
  );
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
        cardEvents.map(({ event }) => event).sort(),
        ["content_hub_article_click", scenario.legacyCardEvent].sort()
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
        paginationEvents.map(({ event }) => event).sort(),
        ["content_hub_page_change", "explorer_page_change"].sort()
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

      results.push({
        path: scenario.path,
        cardEvents: cardEvents.length,
        paginationEvents: paginationEvents.length
      });
    }

    return results;
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.access(OUT_DIR);
  const { chromium } = await import("playwright");
  const { server, origin } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const publicToStudio = await verifyPublicToStudioBoundary(browser, origin);
    const readerRemount = await verifyReaderPathnameRemount(browser, origin);
    const contentHubAnalytics = await verifyContentHubAnalytics(browser, origin);
    console.log(
      JSON.stringify(
        { status: "ok", publicToStudio, readerRemount, contentHubAnalytics },
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
