import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { generateOfflineArtifacts } from "../scripts/postbuild-offline.mjs";

const LOCALES = ["en", "vi", "zh", "ja", "ko", "fr"];
const ORIGIN = "https://site.example";
const VERSIONED_REMOTE_ASSET =
  "https://cdn.example/assets/hero.0123456789abcdef.webp";
const MUTABLE_REMOTE_ASSET = "https://cdn.example/assets/latest.webp";

async function generateServiceWorkerFixture(t) {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "service-worker-cache-write-")
  );
  const outDir = path.join(root, "out");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await Promise.all([
    fs.mkdir(path.join(outDir, "_next/static"), { recursive: true }),
    ...LOCALES.map((locale) =>
      fs.mkdir(path.join(outDir, locale), { recursive: true })
    )
  ]);

  const html = (body) =>
    `<!doctype html><html><head></head><body>${body}</body></html>`;
  await Promise.all([
    fs.writeFile(path.join(outDir, "index.html"), html("index")),
    fs.writeFile(path.join(outDir, "404.html"), html("404")),
    fs.writeFile(path.join(outDir, "_not-found.html"), html("not found")),
    fs.writeFile(path.join(outDir, "favicon.ico"), "icon"),
    fs.writeFile(path.join(outDir, "icon.png"), "icon"),
    fs.writeFile(path.join(outDir, "apple-icon.png"), "icon"),
    fs.writeFile(path.join(outDir, "manifest.webmanifest"), "{}"),
    fs.writeFile(path.join(outDir, "_next/static/app.js"), "app"),
    fs.writeFile(path.join(outDir, "_next/static/data.json"), "{}"),
    ...LOCALES.flatMap((locale) => [
      fs.writeFile(path.join(outDir, `${locale}.html`), html(locale)),
      fs.writeFile(
        path.join(outDir, locale, "offline.html"),
        html(`${locale} offline`)
      )
    ]),
    fs.writeFile(
      path.join(outDir, "en/gallery.html"),
      html(
        `<img src="${VERSIONED_REMOTE_ASSET}"><img src="${MUTABLE_REMOTE_ASSET}">`
      )
    )
  ]);

  await generateOfflineArtifacts({ outDir });
  return {
    manifest: JSON.parse(
      await fs.readFile(path.join(outDir, "offline-manifest.json"), "utf8")
    ),
    source: await fs.readFile(path.join(outDir, "sw.js"), "utf8")
  };
}

function executeServiceWorker(source, cacheFailure = "put", manifest = null) {
  const handlers = new Map();
  const cacheFor = (cacheName) => ({
    match: async (cacheKey) => {
      if (cacheFailure === "match") {
        throw new DOMException("Cache read blocked", "SecurityError");
      }
      if (
        manifest &&
        cacheName.includes("shell") &&
        String(cacheKey) === "/offline-manifest.json"
      ) {
        return new Response(JSON.stringify(manifest), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return undefined;
    },
    put: async () => {
      if (cacheFailure === "put") {
        throw new DOMException("Cache quota exceeded", "QuotaExceededError");
      }
    },
    delete: async () => true
  });
  let fetchImplementation = async () =>
    new Response("network response", { status: 200 });

  const context = {
    AbortController,
    DOMException,
    Request,
    Response,
    URL,
    clearTimeout,
    decodeURIComponent,
    encodeURIComponent,
    fetch: (...args) => fetchImplementation(...args),
    setTimeout,
    caches: {
      delete: async () => true,
      has: async () => false,
      keys: async () => [],
      match: async () => {
        if (cacheFailure === "global-match") {
          throw new DOMException("Cache lookup blocked", "SecurityError");
        }
        return undefined;
      },
      open: async (cacheName) => {
        if (
          cacheFailure === "open" ||
          (cacheFailure === "content-open" && cacheName.includes("content"))
        ) {
          throw new DOMException("Cache storage blocked", "SecurityError");
        }
        return cacheFor(cacheName);
      }
    },
    self: {
      addEventListener(type, handler) {
        handlers.set(type, handler);
      },
      clients: {
        claim: async () => undefined,
        matchAll: async () => []
      },
      location: { origin: ORIGIN },
      skipWaiting: async () => undefined
    }
  };

  vm.runInNewContext(source, context);

  return {
    dispatch(request) {
      let responsePromise;
      handlers.get("fetch")({
        request,
        respondWith(value) {
          responsePromise = Promise.resolve(value);
        }
      });
      assert.ok(responsePromise, `service worker did not claim ${request.url}`);
      return responsePromise;
    },
    failNetwork() {
      fetchImplementation = async () => {
        throw new TypeError("network failed");
      };
    }
  };
}

test("runtime cache operations are best-effort without hiding valid network responses", async (t) => {
  const { manifest, source } = await generateServiceWorkerFixture(t);

  const strategyRequests = [
    {
      name: "cacheFirst",
      request: new Request(`${ORIGIN}/_next/static/app.js`)
    },
    {
      name: "networkFirst",
      request: new Request(MUTABLE_REMOTE_ASSET)
    },
    {
      name: "staleWhileRevalidate",
      request: new Request(`${ORIGIN}/_next/static/data.json`)
    },
    {
      name: "navigation",
      request: {
        destination: "document",
        headers: new Headers(),
        method: "GET",
        mode: "navigate",
        url: `${ORIGIN}/en`
      }
    }
  ];

  for (const cacheFailure of ["open", "content-open", "match", "put"]) {
    await t.test(cacheFailure, async (t) => {
      for (const { name, request } of strategyRequests) {
        await t.test(name, async () => {
          const worker = executeServiceWorker(source, cacheFailure, manifest);
          const response = await worker.dispatch(request);
          assert.equal(response.status, 200);
          assert.equal(await response.text(), "network response");
        });
      }
    });
  }
});

test("runtime strategies still fail closed when network and cache both miss", async (t) => {
  const { source } = await generateServiceWorkerFixture(t);

  const strategyRequests = [
    new Request(`${ORIGIN}/_next/static/app.js`),
    new Request(MUTABLE_REMOTE_ASSET),
    new Request(`${ORIGIN}/_next/static/data.json`)
  ];

  for (const request of strategyRequests) {
    const worker = executeServiceWorker(source, null);
    worker.failNetwork();
    await assert.rejects(
      worker.dispatch(request),
      /network failed|network unavailable/
    );
  }
});

test("navigation returns an offline response when network and Cache Storage both fail", async (t) => {
  const { manifest, source } = await generateServiceWorkerFixture(t);
  const worker = executeServiceWorker(source, "global-match", manifest);
  worker.failNetwork();

  const response = await worker.dispatch({
    destination: "document",
    headers: new Headers(),
    method: "GET",
    mode: "navigate",
    url: `${ORIGIN}/en`
  });

  assert.equal(response.status, 503);
  assert.equal(await response.text(), "Offline");
});
