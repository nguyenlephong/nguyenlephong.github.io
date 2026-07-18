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
const REQUESTED_PORT = Number(process.env.NOT_FOUND_VERIFY_PORT ?? "0");
const SENSITIVE_PATH_SENTINEL = "nf-private-token-7d8c3a";
const SENSITIVE_EMAIL_SENTINEL = "nf-private-owner@example.test";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream";
}

async function startStaticServer() {
  const notFoundBody = await fs.readFile(path.join(OUT_DIR, "404.html"));
  const server = createServer(async (request, response) => {
    const method = request.method ?? "GET";
    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405);
      response.end();
      return;
    }

    const filePath = await resolveFile(request.url ?? "/", OUT_DIR);
    const status = filePath ? 200 : 404;
    const body = filePath ? await fs.readFile(filePath) : notFoundBody;
    const contentType = filePath
      ? contentTypeFor(filePath)
      : "text/html; charset=utf-8";

    response.writeHead(status, {
      "Cache-Control": "no-store",
      "Content-Length": String(body.byteLength),
      "Content-Type": contentType
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

async function assertRawArtifact() {
  const entries = await fs.readdir(OUT_DIR, { recursive: true });
  const notFoundArtifacts = entries.filter(
    (entry) => entry === "404.html" || entry.endsWith(`${path.sep}404.html`)
  );
  assert.deepEqual(
    notFoundArtifacts,
    ["404.html"],
    "static export should contain exactly one shared 404.html"
  );

  const [html, localeHtml] = await Promise.all([
    fs.readFile(path.join(OUT_DIR, "404.html"), "utf8"),
    fs.readFile(path.join(OUT_DIR, "en.html"), "utf8")
  ]);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /This page is no longer here/);
  assert.match(html, /data-not-found-locale="en"/);
  assert.match(html, /href="\/en"/);
  assert.match(html, /href="\/en\/blog"/);
  assert.match(html, /href="\/en\/notes"/);
  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    assert.match(html, new RegExp(`href="/${locale}"`));
  }
  assert.match(html, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i);
  assert.doesNotMatch(html, /<link[^>]+rel="canonical"/i);
  assert.doesNotMatch(html, /<link[^>]+hreflang=/i);
  assert.match(html, /capture_pageview: false/);
  assert.match(html, /capture_pageleave: false/);
  assert.match(localeHtml, /capture_pageview: true/);
  assert.match(localeHtml, /capture_pageleave: true/);
}

async function verifyHydratedCase(page, origin, testCase) {
  const errors = [];
  const onPageError = (error) => errors.push(String(error));
  const onConsole = (message) => {
    if (message.type() === "error") errors.push(message.text());
  };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);

  const response = await page.goto(`${origin}${testCase.path}`, {
    waitUntil: "domcontentloaded"
  });
  assert.equal(response?.status(), 404);
  await page.locator('[data-not-found-ready="true"]').waitFor();
  await page.waitForFunction(() =>
    window.__notFoundEvents?.some((entry) => entry.event === "not_found_view")
  );
  await page.waitForFunction(() => window.__posthogAudit?.inits.length > 0);

  assert.equal(
    await page.locator("main").getAttribute("data-not-found-locale"),
    testCase.locale
  );
  assert.equal(
    await page.locator("main").getAttribute("data-not-found-surface"),
    testCase.surface
  );
  assert.equal(
    await page.locator("html").getAttribute("lang"),
    testCase.locale
  );
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator("h1").innerText(), testCase.heading);
  assert.equal(
    await page.locator("[data-not-found-target]").first().getAttribute("href"),
    testCase.primaryHref
  );
  assert.ok(
    (await page.locator("nav").getAttribute("aria-label"))?.trim().length > 0
  );
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
  const robots = await page.locator('meta[name="robots"]').allTextContents();
  const robotContents = await page
    .locator('meta[name="robots"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("content")));
  assert.ok(robotContents.some((content) => content?.includes("noindex")));
  assert.equal(robots.length, robotContents.length);

  const viewEvent = await page.evaluate(() =>
    window.__notFoundEvents.find((entry) => entry.event === "not_found_view")
  );
  assert.equal(viewEvent.props.page_type, "not_found");
  assert.equal(viewEvent.props.detected_locale, testCase.locale);
  assert.equal(viewEvent.props.requested_surface, testCase.surface);
  assert.equal("path" in viewEvent.props, false);
  assert.equal("pathname" in viewEvent.props, false);
  assert.equal("referrer" in viewEvent.props, false);

  await page
    .locator("[data-not-found-target]")
    .first()
    .evaluate((element) => {
      element.addEventListener("click", (event) => event.preventDefault(), {
        once: true
      });
    });
  await page.locator("[data-not-found-target]").first().click();
  await page.waitForFunction(() =>
    window.__notFoundEvents?.some(
      (entry) => entry.event === "not_found_recovery_click"
    )
  );
  const clickEvent = await page.evaluate(() =>
    window.__notFoundEvents.find(
      (entry) => entry.event === "not_found_recovery_click"
    )
  );
  assert.equal(
    clickEvent.props.target,
    testCase.surface === "other" ? "home" : testCase.surface
  );
  assert.equal(clickEvent.props.detected_locale, testCase.locale);
  assert.equal("path" in clickEvent.props, false);
  assert.equal("pathname" in clickEvent.props, false);
  assert.equal("referrer" in clickEvent.props, false);

  const posthogAudit = await page.evaluate(() => window.__posthogAudit);
  assert.ok(posthogAudit.inits.length > 0);
  for (const init of posthogAudit.inits) {
    assert.equal(init.options.capture_pageview, false);
    assert.equal(init.options.capture_pageleave, false);
  }
  assert.equal(
    posthogAudit.events.some(
      (entry) => entry.event === "$pageview" || entry.event === "$pageleave"
    ),
    false
  );
  for (const event of posthogAudit.events) {
    assert.equal("path" in event.props, false);
    assert.equal("pathname" in event.props, false);
    assert.equal("referrer" in event.props, false);
  }
  const serializedAudit = JSON.stringify(posthogAudit);
  for (const sensitiveValue of testCase.sensitiveValues ?? []) {
    assert.ok(page.url().includes(sensitiveValue.urlFragment));
    assert.equal(serializedAudit.includes(sensitiveValue.secret), false);
  }

  const hydrationErrors = errors.filter((message) =>
    /hydration|hydrated|uncaught|not valid|failed to execute/i.test(message)
  );
  assert.deepEqual(hydrationErrors, []);
  page.off("pageerror", onPageError);
  page.off("console", onConsole);
}

async function verifyBrowserBehavior(origin) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.__posthogAudit = {
      inits: [],
      events: [],
      registrations: []
    };
    window.__notFoundEvents = window.__posthogAudit.events;
    window.posthog = {
      __SV: 1,
      init(projectKey, options) {
        window.__posthogAudit.inits.push({ projectKey, options });
      },
      capture(event, props = {}) {
        window.__posthogAudit.events.push({ event, props });
      },
      register(props) {
        window.__posthogAudit.registrations.push(props);
      }
    };
  });
  const page = await context.newPage();

  try {
    for (const testCase of [
      {
        path: `/zh/blog/${SENSITIVE_PATH_SENTINEL}?email=${encodeURIComponent(SENSITIVE_EMAIL_SENTINEL)}&token=${SENSITIVE_PATH_SENTINEL}`,
        locale: "zh",
        surface: "blog",
        heading: "这个页面目前不在这里",
        primaryHref: "/zh/blog",
        sensitiveValues: [
          {
            secret: SENSITIVE_PATH_SENTINEL,
            urlFragment: SENSITIVE_PATH_SENTINEL
          },
          {
            secret: SENSITIVE_EMAIL_SENTINEL,
            urlFragment: encodeURIComponent(SENSITIVE_EMAIL_SENTINEL)
          }
        ]
      },
      {
        path: "/fr/notes/ancienne-note",
        locale: "fr",
        surface: "notes",
        heading: "Cette page n’est plus disponible ici",
        primaryHref: "/fr/notes"
      },
      {
        path: "/missing-without-locale",
        locale: "en",
        surface: "other",
        heading: "This page is no longer here",
        primaryHref: "/en"
      }
    ]) {
      await verifyHydratedCase(page, origin, testCase);
      await page.evaluate(() => {
        window.__notFoundEvents.length = 0;
      });
    }

    const noScriptContext = await browser.newContext({
      javaScriptEnabled: false
    });
    const noScriptPage = await noScriptContext.newPage();
    try {
      const response = await noScriptPage.goto(`${origin}/ja/old-link`, {
        waitUntil: "domcontentloaded"
      });
      assert.equal(response?.status(), 404);
      assert.equal(await noScriptPage.locator("h1").count(), 1);
      assert.equal(
        await noScriptPage.locator("h1").innerText(),
        "This page is no longer here"
      );
      assert.equal(
        await noScriptPage.locator("html").getAttribute("lang"),
        "en"
      );
      for (const href of [
        "/en",
        "/en/blog",
        "/en/notes",
        "/vi",
        "/zh",
        "/ja",
        "/ko",
        "/fr"
      ]) {
        assert.ok(await noScriptPage.locator(`a[href="${href}"]`).count());
      }
    } finally {
      await noScriptContext.close();
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  await assertRawArtifact();
  const { server, origin } = await startStaticServer();
  try {
    await verifyBrowserBehavior(origin);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve(undefined)));
    });
  }
  console.log("Static not-found verification passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
