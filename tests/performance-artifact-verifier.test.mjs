import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyPerformanceArtifact } from "../scripts/verify-performance-artifact.mjs";

const LOCALES = ["en", "vi", "zh", "ja", "ko", "fr"];
const SURFACE_ROUTES = {
  home: "",
  blog: "blog",
  notes: "notes",
  studio: "studio"
};

function localizedPath(locale, surface, extension) {
  const route = SURFACE_ROUTES[surface];
  return route ? `${locale}/${route}.${extension}` : `${locale}.${extension}`;
}

function createFixture(t, overrides = {}) {
  const rootDir = mkdtempSync(path.join(tmpdir(), "performance-artifact-"));
  const outDir = path.join(rootDir, "out");
  const chunksDir = path.join(outDir, "_next/static/chunks");
  mkdirSync(path.join(outDir, "en"), { recursive: true });
  mkdirSync(chunksDir, { recursive: true });
  t.after(() => rmSync(rootDir, { recursive: true, force: true }));

  const surfaces = Object.fromEntries(
    Object.keys(SURFACE_ROUTES).map((surface) => [
      surface,
      localizedPath("en", surface, "html")
    ])
  );
  const maxBrotliBytes = overrides.maxBrotliBytes ?? 10_000;
  const routeInitialJavaScript = Object.fromEntries(
    Object.entries(surfaces).map(([surface, html]) => [
      surface,
      { html, maxBrotliBytes }
    ])
  );
  const localizedRouteSamples = LOCALES.flatMap((locale) =>
    Object.keys(SURFACE_ROUTES).map((surface) => ({
      locale,
      surface,
      path: localizedPath(locale, surface, "txt")
    }))
  );
  const config = {
    schemaVersion: 1,
    outputDirectory: "out",
    siteOrigin: "https://example.com",
    seo: { locales: LOCALES },
    performance: {
      routeInitialJavaScript,
      rsc: {
        warnTotalBytes: overrides.warnTotalBytes ?? 100_000,
        localizedRouteSamples,
        maxAverageLocalizedRouteBytes:
          overrides.maxAverageLocalizedRouteBytes ?? 10_000,
        surfaceMaxBytes: {
          home: overrides.maxLocalizedRouteBytes ?? 10_000,
          blog: overrides.maxLocalizedRouteBytes ?? 10_000,
          notes: overrides.maxLocalizedRouteBytes ?? 10_000,
          studio: overrides.maxLocalizedRouteBytes ?? 10_000
        }
      },
      studioInitialRuntime: {
        requiredMarkers: ["studio_route_open", "data-studio-module"],
        forbiddenMarkers: ["data-studio-flow-runtime", "getFirestore"],
        allowedThirdPartyConnectionOrigins: ["https://analytics.example"]
      }
    }
  };
  writeFileSync(path.join(rootDir, "budgets.json"), JSON.stringify(config));

  writeFileSync(
    path.join(chunksDir, "initial.js"),
    "studio_route_open;data-studio-module;globalThis.site=true"
  );
  for (const locale of LOCALES) {
    for (const surface of Object.keys(SURFACE_ROUTES)) {
      const html = localizedPath(locale, surface, "html");
      const absolutePath = path.join(outDir, html);
      mkdirSync(path.dirname(absolutePath), { recursive: true });
      writeFileSync(
        absolutePath,
        [
          "<!doctype html><html><head>",
          locale === "en" && surface === "studio"
            ? '<link rel="preconnect" href="https://analytics.example">'
            : "",
          '<script src="/_next/static/chunks/initial.js"></script>',
          "</head><body></body></html>"
        ].join("")
      );
      writeFileSync(
        path.join(outDir, localizedPath(locale, surface, "txt")),
        `route payload for ${html}`
      );
    }
  }
  writeFileSync(path.join(outDir, "__next._tree.txt"), "shared RSC tree");
  writeFileSync(path.join(outDir, "robots.txt"), "User-agent: *\nAllow: /");
  writeFileSync(path.join(outDir, "ads.txt"), "example.com, publisher");

  return {
    rootDir,
    outDir,
    chunksDir,
    configPath: path.join(rootDir, "budgets.json")
  };
}

test("measures compressed route JavaScript and RSC payloads in one artifact inventory", async (t) => {
  const { rootDir } = createFixture(t);

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.deepEqual(report.failures, []);
  assert.equal(report.routeInitialJavaScript.home.files.length, 1);
  assert.ok(report.routeInitialJavaScript.home.brotliBytes > 0);
  assert.equal(report.rsc.fileCount, 25);
  assert.equal(report.rsc.localizedRouteSampleCount, 24);
  assert.equal(report.rsc.localizedSurfaceMetrics.blog.sampleCount, 6);
  assert.deepEqual(report.studio.thirdPartyConnectionOrigins, [
    "https://analytics.example"
  ]);
  assert.equal(report.artifactIndex.walks, 1);
  assert.equal(report.artifactIndex.diskReads, 5);
  assert.ok(report.artifactIndex.cacheHits >= 3);
});

test("rejects missing, extra, or aliased initial route mappings", async (t) => {
  const { rootDir, configPath } = createFixture(t);
  const baseConfig = JSON.parse(readFileSync(configPath, "utf8"));
  const mutations = [
    {
      label: "missing route",
      apply(config) {
        delete config.performance.routeInitialJavaScript.blog;
      }
    },
    {
      label: "extra route",
      apply(config) {
        config.performance.routeInitialJavaScript.search = {
          html: "en/search.html",
          maxBrotliBytes: 10_000
        };
      }
    },
    {
      label: "blog aliases home",
      apply(config) {
        config.performance.routeInitialJavaScript.blog.html = "en.html";
      }
    }
  ];

  for (const mutation of mutations) {
    const config = structuredClone(baseConfig);
    mutation.apply(config);
    writeFileSync(configPath, JSON.stringify(config));
    await assert.rejects(
      verifyPerformanceArtifact({
        rootDir,
        configPath: "budgets.json"
      }),
      /Invalid static performance budget configuration/,
      mutation.label
    );
  }
});

test("keeps total RSC capacity advisory while enforcing average and Studio contracts", async (t) => {
  const { rootDir, outDir, chunksDir } = createFixture(t, {
    maxBrotliBytes: 1,
    warnTotalBytes: 1,
    maxAverageLocalizedRouteBytes: 1
  });
  writeFileSync(
    path.join(chunksDir, "initial.js"),
    "studio_route_open;data-studio-flow-runtime;getFirestore"
  );
  const studioHtmlPath = path.join(outDir, "en/studio.html");
  writeFileSync(
    studioHtmlPath,
    readFileSync(studioHtmlPath, "utf8").replace(
      "</head>",
      '<link rel="stylesheet preconnect" href="https://unexpected.example"></head>'
    )
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /home initial JavaScript Brotli bytes/);
  assert.doesNotMatch(failures, /Total RSC text bytes/);
  assert.match(report.warnings.join("\n"), /Total RSC text bytes/);
  assert.match(failures, /Average localized RSC route bytes/);
  assert.match(failures, /missing required marker: data-studio-module/);
  assert.match(failures, /contains forbidden marker: data-studio-flow-runtime/);
  assert.match(failures, /contains forbidden marker: getFirestore/);
  assert.match(
    failures,
    /unapproved third-party connection: https:\/\/unexpected\.example/
  );
});

test("rejects duplicate and missing entries in the exact localized RSC matrix", async (t) => {
  const { rootDir, configPath } = createFixture(t);
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.performance.rsc.localizedRouteSamples.pop();
  config.performance.rsc.localizedRouteSamples.push({
    ...config.performance.rsc.localizedRouteSamples[0]
  });
  writeFileSync(configPath, JSON.stringify(config));

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /Duplicate configured localized RSC sample: en:home/);
  assert.match(failures, /Missing configured localized RSC sample: fr:studio/);
});

test("fails when one localized route exceeds its surface ceiling", async (t) => {
  const { rootDir, outDir } = createFixture(t, {
    maxLocalizedRouteBytes: 100
  });
  writeFileSync(path.join(outDir, "fr/blog.txt"), "x".repeat(101));

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.match(
    report.failures.join("\n"),
    /Localized RSC route fr\/blog bytes is 101; limit is 100/
  );
});

test("fails closed for a missing route, script, or localized RSC artifact", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  rmSync(path.join(outDir, "en/blog.html"));
  writeFileSync(
    path.join(outDir, "en.html"),
    '<!doctype html><script src="/_next/static/chunks/missing.js"></script>'
  );
  rmSync(path.join(outDir, "vi/notes.txt"));

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /Missing performance route sample: en\/blog\.html/);
  assert.match(
    failures,
    /en\.html references missing local script: _next\/static\/chunks\/missing\.js/
  );
  assert.match(failures, /en\.html has no direct local JavaScript/);
  assert.match(failures, /Missing localized RSC route sample: vi\/notes\.txt/);
});

test("pins the dependency-free official Next analyzer command", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));

  assert.equal(pkg.scripts.analyze, "next experimental-analyze --output");
  assert.equal(pkg.dependencies?.["@next/bundle-analyzer"], undefined);
  assert.equal(pkg.devDependencies?.["@next/bundle-analyzer"], undefined);
});
