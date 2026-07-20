import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  extractCssSelectors,
  expectedClientMessageScopesForLocalizedRoute,
  verifyPerformanceArtifact
} from "../scripts/verify-performance-artifact.mjs";
import { selectorContainsOwner } from "../scripts/lib/css-selector-contract.mjs";

const LOCALES = ["en", "vi", "zh", "ja", "ko", "fr"];
const SURFACE_ROUTES = {
  home: "",
  blog: "blog",
  notes: "notes",
  studio: "studio"
};
const CLIENT_MESSAGE_ROUTES = {
  ...SURFACE_ROUTES,
  gallery: "gallery"
};
const PUBLIC_CSS_OWNER_SELECTORS = {
  home: [
    ".hero",
    ".cv-section",
    ".cv-section-head",
    ".cv-section-eyebrow",
    ".cv-section-title"
  ],
  about: [".about-page-v2"],
  gallery: [".gallery-showcase"],
  apps: [".apps-page"],
  english: [".english-page"],
  offline: [".offline-page-shell"],
  blog: [".blog-home"],
  notes: [".notes-archive"],
  reader: [".blog-reader-tools"]
};
const PUBLIC_CSS_ROUTES = {
  home: { html: "en.html", owners: ["home"] },
  about: { html: "en/about.html", owners: ["about"] },
  gallery: { html: "en/gallery.html", owners: ["gallery"] },
  apps: { html: "en/apps.html", owners: ["apps"] },
  english: { html: "en/apps/english.html", owners: ["english"] },
  offline: { html: "en/offline.html", owners: ["offline"] },
  blogArchive: { html: "en/blog.html", owners: ["blog"] },
  notesArchive: { html: "en/notes.html", owners: ["blog", "notes"] },
  blogArticle: {
    html: "en/blog/culture/protecting-attention-in-a-busy-team.html",
    owners: ["blog", "reader"]
  },
  notesArticle: {
    html: "en/notes/tri-tue-can-duc-hanh.html",
    owners: ["blog", "notes", "reader"]
  }
};

const CLIENT_MESSAGE_SCOPE_FIXTURES = {
  site: {
    Nav: { home: "Home" },
    Footer: { tag: "Footer" },
    Offline: { banner: { title: "Offline" } }
  },
  home: {
    Hero: { title: "Hero" },
    Summary: { title: "Summary" },
    Experience: { title: "Experience" },
    Projects: { title: "Projects" },
    CTA: { title: "CTA" }
  },
  blog: { Pages: { blog: { title: "Blog" } } },
  notes: { Pages: { notes: { title: "Notes" } } },
  gallery: { Pages: { gallery: { title: "Gallery" } } }
};

const REQUIRED_CLIENT_MESSAGE_SCOPES = {
  home: ["site", "home"],
  blog: ["site", "blog"],
  notes: ["site", "notes"],
  gallery: ["site", "gallery"],
  studio: []
};

function localizedPath(locale, surface, extension) {
  const route = SURFACE_ROUTES[surface];
  return route ? `${locale}/${route}.${extension}` : `${locale}.${extension}`;
}

function serializedProvider(locale, scope) {
  return `{"formats":"$undefined","locale":"${locale}","messages":${JSON.stringify(CLIENT_MESSAGE_SCOPE_FIXTURES[scope])}}`;
}

function writeLocalizedMessageRoute(outDir, relativeStem, providerScopes) {
  const htmlPath = path.join(outDir, `${relativeStem}.html`);
  const textPath = path.join(outDir, `${relativeStem}.txt`);
  mkdirSync(path.dirname(htmlPath), { recursive: true });
  writeFileSync(htmlPath, "<!doctype html><html><body></body></html>");
  const [locale] = relativeStem.split("/");
  writeFileSync(
    textPath,
    providerScopes.map((scope) => serializedProvider(locale, scope)).join("\n")
  );
  return textPath;
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
      clientMessages: {
        scopes: {
          site: ["Nav", "Footer", "Offline.banner"],
          home: ["Hero", "Summary", "Experience", "Projects", "CTA"],
          blog: ["Pages.blog"],
          notes: ["Pages.notes"],
          gallery: ["Pages.gallery"]
        },
        localizedRouteSamples: Object.fromEntries(
          Object.entries(CLIENT_MESSAGE_ROUTES).map(([surface, route]) => [
            surface,
            {
              path: route ? `{locale}/${route}.txt` : "{locale}.txt",
              requiredScopes: REQUIRED_CLIENT_MESSAGE_SCOPES[surface]
            }
          ])
        )
      },
      archiveInitialRuntime: {
        requiredMarkers: ["data-deferred-post-stats"],
        forbiddenMarkers: ["firebaseapp.com", "getFirestore"]
      },
      publicInitialCss: {
        ownerSelectors: PUBLIC_CSS_OWNER_SELECTORS,
        routes: Object.fromEntries(
          Object.entries(PUBLIC_CSS_ROUTES).map(([surface, route]) => [
            surface,
            {
              html: route.html,
              maxStylesheetCount:
                overrides.maxPublicStylesheetCount ?? route.owners.length + 1,
              maxBrotliBytes: overrides.maxPublicCssBrotliBytes ?? 10_000,
              requiredOwners: route.owners,
              allowedOwners: route.owners
            }
          ])
        )
      },
      studioInitialRuntime: {
        requiredMarkers: ["data-studio-shadow-host"],
        requiredReachableMarkers: ["studio_route_open", "data-studio-module"],
        forbiddenMarkers: ["data-studio-flow-runtime", "getFirestore"],
        maxInitialDocumentCssBrotliBytes:
          overrides.maxInitialDocumentCssBrotliBytes ?? 10_000,
        requiredShadowCssFiles: ["studio/studio-shadow.css"],
        maxShadowCssBrotliBytes: overrides.maxShadowCssBrotliBytes ?? 10_000,
        maxTotalInitialCssBrotliBytes:
          overrides.maxTotalInitialCssBrotliBytes ?? 20_000,
        allowedExternalStylesheetOrigins:
          overrides.allowedExternalStylesheetOrigins ?? [],
        allowedThirdPartyConnectionOrigins: ["https://analytics.example"]
      }
    }
  };
  writeFileSync(path.join(rootDir, "budgets.json"), JSON.stringify(config));

  writeFileSync(
    path.join(chunksDir, "initial.js"),
    "data-studio-shadow-host;data-deferred-post-stats;static/chunks/studio-runtime.js;globalThis.site=true"
  );
  writeFileSync(
    path.join(chunksDir, "studio-runtime.js"),
    "studio_route_open;data-studio-module;/studio/studio-shadow.css"
  );
  writeFileSync(
    path.join(chunksDir, "document.css"),
    ":root{color-scheme:light dark}"
  );
  writeFileSync(path.join(chunksDir, "public-shared.css"), "body{margin:0}");
  for (const [owner, selectors] of Object.entries(PUBLIC_CSS_OWNER_SELECTORS)) {
    writeFileSync(
      path.join(chunksDir, `public-${owner}.css`),
      selectors.map((selector) => `${selector}{display:block}`).join("")
    );
  }
  mkdirSync(path.join(outDir, "studio"), { recursive: true });
  writeFileSync(
    path.join(outDir, "studio/studio-shadow.css"),
    ".studio-admin{display:block}"
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
            ? [
                '<link rel="preconnect" href="https://analytics.example">',
                '<link rel="stylesheet" href="/_next/static/chunks/document.css">',
                "<style>.studio-static-overview{display:block}</style>"
              ].join("")
            : "",
          '<script src="/_next/static/chunks/initial.js"></script>',
          "</head><body></body></html>"
        ].join("")
      );
      writeFileSync(
        path.join(outDir, localizedPath(locale, surface, "txt")),
        [
          `route payload for ${html}`,
          ...REQUIRED_CLIENT_MESSAGE_SCOPES[surface].map((scope) =>
            serializedProvider(locale, scope)
          )
        ].join("\n")
      );
    }
    writeLocalizedMessageRoute(
      outDir,
      `${locale}/gallery`,
      REQUIRED_CLIENT_MESSAGE_SCOPES.gallery
    );
  }
  for (const route of Object.values(PUBLIC_CSS_ROUTES)) {
    const htmlPath = path.join(outDir, route.html);
    mkdirSync(path.dirname(htmlPath), { recursive: true });
    const links = [
      '<link rel="stylesheet" href="/_next/static/chunks/public-shared.css">',
      ...route.owners.map(
        (owner) =>
          `<link rel="stylesheet" href="/_next/static/chunks/public-${owner}.css">`
      )
    ].join("");
    const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";
    writeFileSync(
      htmlPath,
      html
        ? html.includes("</head>")
          ? html.replace("</head>", `${links}</head>`)
          : html.replace("<html>", `<html><head>${links}</head>`)
        : `<!doctype html><html><head>${links}</head><body></body></html>`
    );
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

test("derives future-safe client message scopes from localized route shape", () => {
  const cases = [
    ["en.txt", ["site", "home"]],
    ["vi/studio.txt", []],
    ["fr/studio/settings.txt", []],
    ["ja/gallery.txt", ["site", "gallery"]],
    ["ja/gallery/archive.txt", ["site"]],
    ["en/blog.txt", ["site", "blog"]],
    ["en/blog/architecture.txt", ["site", "blog"]],
    ["en/blog/page/1.txt", ["site", "blog"]],
    ["en/blog/page/23.txt", ["site", "blog"]],
    ["en/blog/page/02.txt", ["site"]],
    ["en/blog/architecture/static-sites.txt", ["site"]],
    ["en/blog/architecture/static-sites/appendix.txt", ["site"]],
    ["en/blog/series/foundations.txt", ["site"]],
    ["vi/blog/series/foundations/page/2.txt", ["site"]],
    ["ko/notes.txt", ["site", "notes"]],
    ["ko/notes/page/4.txt", ["site", "notes"]],
    ["ko/notes/page/latest.txt", ["site"]],
    ["ko/notes/a-book-reflection.txt", ["site"]],
    ["en/notes/topics/thoughts.txt", ["site"]],
    ["vi/notes/topics/thoughts/page/5.txt", ["site"]],
    ["zh/apps/new-static-tool.txt", ["site"]],
    ["de/blog.txt", null],
    ["en/blog.html", null]
  ];

  for (const [relativePath, expected] of cases) {
    assert.deepEqual(
      expectedClientMessageScopesForLocalizedRoute(relativePath),
      expected,
      relativePath
    );
  }
});

test("measures compressed route JavaScript and RSC payloads in one artifact inventory", async (t) => {
  const { rootDir } = createFixture(t);

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.deepEqual(report.failures, []);
  assert.equal(report.routeInitialJavaScript.home.files.length, 1);
  assert.ok(report.routeInitialJavaScript.home.brotliBytes > 0);
  assert.equal(report.rsc.fileCount, 31);
  assert.equal(report.rsc.localizedRouteSampleCount, 24);
  assert.equal(report.rsc.localizedSurfaceMetrics.blog.sampleCount, 6);
  assert.equal(report.clientMessages.routeCount, 30);
  assert.equal(report.clientMessages.routes.length, 30);
  assert.equal(report.clientMessages.providerCount, 48);
  assert.equal(report.clientMessages.expectedProviderCount, 48);
  assert.equal(report.clientMessages.scopeCounts.site, 24);
  assert.equal(report.clientMessages.scopeCounts.gallery, 6);
  assert.deepEqual(report.archiveInitialRuntime.blog, {
    missingMarkers: [],
    forbiddenMarkers: []
  });
  assert.deepEqual(report.archiveInitialRuntime.notes, {
    missingMarkers: [],
    forbiddenMarkers: []
  });
  assert.equal(report.publicInitialCss.home.files.length, 2);
  assert.equal(report.publicInitialCss.notesArticle.files.length, 4);
  assert.deepEqual(report.publicInitialCss.home.missingOwners, []);
  assert.deepEqual(report.publicInitialCss.home.forbiddenOwners, []);
  assert.deepEqual(report.studio.thirdPartyConnectionOrigins, [
    "https://analytics.example"
  ]);
  assert.deepEqual(report.studio.documentCss.localFiles, [
    "_next/static/chunks/document.css"
  ]);
  assert.equal(report.studio.documentCss.inlineStyles.length, 1);
  assert.deepEqual(report.studio.documentCss.externalStylesheets, []);
  assert.deepEqual(report.studio.shadowCss.files, ["studio/studio-shadow.css"]);
  assert.equal(
    report.studio.totalInitialCss.rawBytes,
    report.studio.documentCss.rawBytes + report.studio.shadowCss.rawBytes
  );
  assert.equal(
    report.studio.totalInitialCss.brotliBytes,
    report.studio.documentCss.brotliBytes + report.studio.shadowCss.brotliBytes
  );
  assert.equal(report.artifactIndex.walks, 1);
  assert.ok(report.artifactIndex.diskReads >= 8);
  assert.ok(report.artifactIndex.cacheHits >= 3);
});

test("rejects eager engagement provider code from archive initial scripts", async (t) => {
  const { rootDir, chunksDir } = createFixture(t);
  writeFileSync(
    path.join(chunksDir, "initial.js"),
    "data-studio-shadow-host;data-deferred-post-stats;firebaseapp.com;static/chunks/studio-runtime.js"
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(
    failures,
    /blog initial JavaScript contains eager engagement provider marker: firebaseapp\.com/
  );
  assert.match(
    failures,
    /notes initial JavaScript contains eager engagement provider marker: firebaseapp\.com/
  );
});

test("enforces public CSS owner isolation with hash-independent selectors", async (t) => {
  const { rootDir, chunksDir } = createFixture(t);
  writeFileSync(
    path.join(chunksDir, "public-home.css"),
    ".about-page-v2{display:block}"
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /home initial CSS is missing required owner: home/);
  assert.match(failures, /home initial CSS contains unrelated owner: about/);
});

test("requires every owner-family selector and rejects partial family leakage", async (t) => {
  const { rootDir, chunksDir } = createFixture(t);
  writeFileSync(
    path.join(chunksDir, "public-home.css"),
    ".hero{display:block}"
  );

  const incompleteReport = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  assert.match(
    incompleteReport.failures.join("\n"),
    /home initial CSS is missing required owner: home/
  );

  writeFileSync(
    path.join(chunksDir, "public-home.css"),
    PUBLIC_CSS_OWNER_SELECTORS.home
      .map((selector) => `${selector}{display:block}`)
      .join("")
  );
  writeFileSync(
    path.join(chunksDir, "public-shared.css"),
    "body{margin:0}.cv-section-title{font-size:2rem}"
  );

  const leakedReport = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  assert.match(
    leakedReport.failures.join("\n"),
    /about initial CSS contains unrelated owner: home/
  );
});

test("normalizes equivalent selectors through nested CSS rule contexts", () => {
  const selectors = extractCssSelectors(`
    /* spacing and minifier output must be equivalent */
    .hero { display: block; }
    @media (min-width: 40rem) {
      .about-page-v2,.gallery-showcase > strong { display: grid; }
    }
    @supports (display: subgrid) {
      @media (min-width: 60rem) { .apps-page { display: subgrid; } }
    }
    @keyframes reveal { from { opacity: 0; } to { opacity: 1; } }
  `);

  assert.deepEqual([...selectors].sort(), [
    ".about-page-v2",
    ".apps-page",
    ".gallery-showcase>strong",
    ".hero"
  ]);
  assert.deepEqual([...extractCssSelectors(".hero{display:block}")], [".hero"]);
  assert.equal(selectors.has("from"), false);
});

test("parses native CSS nesting without treating quoted comment markers as comments", () => {
  const selectors = extractCssSelectors(`
    .route-shell {
      content: "literal /* brace { and escaped quote \\\" still text";
      & .about-page-v2, &:has(.gallery-showcase) {
        display: grid;
      }
      @container card (min-width: 30rem) {
        & > .apps-page { display: block; }
      }
      @layer route {
        @supports (display: subgrid) {
          & .english-page { display: subgrid; }
        }
      }
    }
    @-webkit-keyframes nested-reveal {
      from { opacity: 0; }
      50% { opacity: .5; }
      to { opacity: 1; }
    }
    .commented/* comma, remains inside comment */,.plain { display: block; }
    .compound/**/.about-page-v2 { display: block; }
  `);

  assert.deepEqual([...selectors].sort(), [
    "& .about-page-v2",
    "& .english-page",
    "&:has(.gallery-showcase)",
    "&>.apps-page",
    ".commented",
    ".compound.about-page-v2",
    ".plain",
    ".route-shell"
  ]);
  for (const frame of ["from", "50%", "to"]) {
    assert.equal(selectors.has(frame), false);
  }
  assert.equal(
    selectorContainsOwner('[data-owner=".about-page-v2"]', ".about-page-v2"),
    false
  );
});

test("extracts @scope roots and limits through the selector contract", () => {
  const selectors = extractCssSelectors(`
    @scope (.about-page-v2) to (.gallery-showcase) {
      .scoped-content { display: block; }
    }
  `);

  assert.deepEqual([...selectors].sort(), [
    ".about-page-v2",
    ".gallery-showcase",
    ".scoped-content"
  ]);
  assert.equal(
    [...selectors].some((selector) =>
      selectorContainsOwner(selector, ".about-page-v2")
    ),
    true
  );
  assert.equal(
    [...selectors].some((selector) =>
      selectorContainsOwner(selector, ".gallery-showcase")
    ),
    true
  );
});

test("does not treat custom-property value blocks as CSS rules", () => {
  const selectors = extractCssSelectors(`
    .host {
      --payload: { .about-page-v2 { color: red } };
      color: black;
    }
  `);

  assert.deepEqual([...selectors], [".host"]);
  assert.equal(
    [...selectors].some((selector) =>
      selectorContainsOwner(selector, ".about-page-v2")
    ),
    false
  );
});

test("owner isolation recognizes owner selectors inside native nesting", async (t) => {
  const { rootDir, chunksDir } = createFixture(t);
  writeFileSync(
    path.join(chunksDir, "public-home.css"),
    '.route-shell{content:"literal /* not a comment";& .about-page-v2{display:block}}'
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /home initial CSS is missing required owner: home/);
  assert.match(failures, /home initial CSS contains unrelated owner: about/);
});

test("enforces public CSS request and Brotli ceilings", async (t) => {
  const { rootDir, outDir, chunksDir } = createFixture(t, {
    maxPublicCssBrotliBytes: 1
  });
  writeFileSync(path.join(chunksDir, "extra.css"), ".extra{display:block}");
  const homePath = path.join(outDir, "en.html");
  writeFileSync(
    homePath,
    readFileSync(homePath, "utf8").replace(
      "</head>",
      '<link rel="stylesheet" href="/_next/static/chunks/extra.css"></head>'
    )
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /home initial stylesheet count/);
  assert.match(failures, /home initial CSS Brotli bytes/);
});

test("counts oversized inline CSS in the Studio document budget", async (t) => {
  const { rootDir, outDir, chunksDir } = createFixture(t, {
    maxInitialDocumentCssBrotliBytes: 20,
    maxTotalInitialCssBrotliBytes: 100_000
  });
  writeFileSync(path.join(chunksDir, "document.css"), "");
  const studioHtmlPath = path.join(outDir, "en/studio.html");
  const oversizedInlineCss = Array.from(
    { length: 200 },
    (_, index) =>
      `.inline-${index}{color:#${index.toString(16).padStart(6, "0")}}`
  ).join("");
  writeFileSync(
    studioHtmlPath,
    readFileSync(studioHtmlPath, "utf8")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace("</head>", `<style>${oversizedInlineCss}</style></head>`)
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.equal(report.studio.documentCss.inlineStyles.length, 1);
  assert.match(
    report.failures.join("\n"),
    /Studio initial document CSS Brotli bytes/
  );
});

test("enforces the required Studio Shadow stylesheet and its budget", async (t) => {
  const oversized = createFixture(t, {
    maxShadowCssBrotliBytes: 1,
    maxTotalInitialCssBrotliBytes: 100_000
  });
  const oversizedReport = await verifyPerformanceArtifact({
    rootDir: oversized.rootDir,
    configPath: "budgets.json"
  });
  assert.match(
    oversizedReport.failures.join("\n"),
    /Studio required Shadow CSS Brotli bytes/
  );

  const missing = createFixture(t);
  rmSync(path.join(missing.outDir, "studio/studio-shadow.css"));
  const missingReport = await verifyPerformanceArtifact({
    rootDir: missing.rootDir,
    configPath: "budgets.json"
  });
  assert.match(
    missingReport.failures.join("\n"),
    /Studio required Shadow stylesheet is missing: studio\/studio-shadow\.css/
  );
});

test("rejects a pure external Studio stylesheet without an explicit allowlist", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  const studioHtmlPath = path.join(outDir, "en/studio.html");
  writeFileSync(
    studioHtmlPath,
    readFileSync(studioHtmlPath, "utf8").replace(
      "</head>",
      '<link rel="stylesheet" href="https://cdn.example/studio.css"></head>'
    )
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.deepEqual(report.studio.documentCss.externalStylesheets, [
    "https://cdn.example/studio.css"
  ]);
  assert.match(
    report.failures.join("\n"),
    /Studio declares an unapproved external stylesheet: https:\/\/cdn\.example\/studio\.css/
  );
});

test("requires the budgeted Shadow stylesheet to match the runtime reference", async (t) => {
  const { rootDir, chunksDir } = createFixture(t);
  writeFileSync(
    path.join(chunksDir, "studio-runtime.js"),
    "studio_route_open;data-studio-module"
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.match(
    report.failures.join("\n"),
    /missing required Shadow stylesheet reference: \/studio\/studio-shadow\.css/
  );
});

test("rejects a full or unrelated client catalog on Studio", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  writeFileSync(
    path.join(outDir, "en/studio.txt"),
    `{"formats":"$undefined","locale":"en","messages":${JSON.stringify({
      Nav: { home: "Home" },
      Pages: { blog: { title: "Blog" }, notes: { title: "Notes" } },
      About: { title: "About" },
      ReaderTools: { label: "Reader tools" }
    })}}`
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(
    failures,
    /en\/studio\.txt serializes an unrecognized or overlapping client message scope/
  );
});

test("counts and rejects a null Studio messages provider", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  writeFileSync(
    path.join(outDir, "en/studio.txt"),
    `{"formats":"$undefined","locale":"en","messages":null}`
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.equal(report.clientMessages.providerCount, 49);
  assert.match(
    failures,
    /en\/studio\.txt serializes 1 client message provider occurrence\(s\); expected 0/
  );
  assert.match(
    failures,
    /en\/studio\.txt serializes an unrecognized or overlapping client message scope/
  );
});

test("scans an unsampled article and rejects its extra surface provider", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  writeLocalizedMessageRoute(outDir, "en/blog/architecture/unsampled-post", [
    "site",
    "blog"
  ]);

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.equal(report.clientMessages.routeCount, 31);
  assert.equal(report.clientMessages.providerCount, 50);
  assert.match(
    failures,
    /en\/blog\/architecture\/unsampled-post\.txt serializes unexpected client message scope: blog/
  );
});

test("derives pagination scopes and rejects the wrong surface provider", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  writeLocalizedMessageRoute(outDir, "en/blog/page/2", ["site", "notes"]);

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.equal(report.clientMessages.routeCount, 31);
  assert.match(
    failures,
    /en\/blog\/page\/2\.txt is missing required client message scope: blog/
  );
  assert.match(
    failures,
    /en\/blog\/page\/2\.txt serializes unexpected client message scope: notes/
  );
});

test("rejects undeclared empty object and array branches in scoped messages", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  const blogPath = path.join(outDir, "en/blog.txt");
  const source = readFileSync(blogPath, "utf8");
  const validBlogMessages = JSON.stringify(CLIENT_MESSAGE_SCOPE_FIXTURES.blog);

  for (const unexpectedBranch of [{}, []]) {
    const invalidBlogMessages = JSON.stringify({
      Pages: {
        blog: CLIENT_MESSAGE_SCOPE_FIXTURES.blog.Pages.blog,
        notes: unexpectedBranch
      }
    });
    writeFileSync(
      blogPath,
      source.replace(validBlogMessages, invalidBlogMessages)
    );

    const report = await verifyPerformanceArtifact({
      rootDir,
      configPath: "budgets.json"
    });
    assert.match(
      report.failures.join("\n"),
      /en\/blog\.txt serializes an unrecognized or overlapping client message scope/,
      Array.isArray(unexpectedBranch) ? "empty array" : "empty object"
    );
  }
});

test("rejects a duplicate expected client message provider", async (t) => {
  const { rootDir, outDir } = createFixture(t);
  const blogPath = path.join(outDir, "en/blog.txt");
  const duplicateSiteProvider =
    `{"formats":"$undefined","locale":"en","messages":` +
    `${JSON.stringify(CLIENT_MESSAGE_SCOPE_FIXTURES.site)}}`;
  writeFileSync(
    blogPath,
    `${readFileSync(blogPath, "utf8")}\n${duplicateSiteProvider}`
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });

  assert.match(
    report.failures.join("\n"),
    /en\/blog\.txt serializes client message scope site 2 times; expected exactly once/
  );
});

test("rejects globally overlapping client message scope configuration", async (t) => {
  const { rootDir, configPath } = createFixture(t);
  const baseConfig = JSON.parse(readFileSync(configPath, "utf8"));
  const mutations = [
    {
      label: "exact duplicate across scopes",
      apply(config) {
        config.performance.clientMessages.scopes.notes = ["Pages.blog"];
      }
    },
    {
      label: "prefix overlap across scopes",
      apply(config) {
        config.performance.clientMessages.scopes.blog = ["Pages"];
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

test("rejects malformed public CSS route and owner contracts", async (t) => {
  const { rootDir, configPath } = createFixture(t);
  const baseConfig = JSON.parse(readFileSync(configPath, "utf8"));
  const mutations = [
    (config) => delete config.performance.publicInitialCss.routes.about,
    (config) => {
      config.performance.publicInitialCss.ownerSelectors.home = ".hero";
    },
    (config) => {
      config.performance.publicInitialCss.ownerSelectors.about =
        config.performance.publicInitialCss.ownerSelectors.home;
    },
    (config) => {
      config.performance.publicInitialCss.routes.home.allowedOwners = ["about"];
    }
  ];

  for (const mutate of mutations) {
    const config = structuredClone(baseConfig);
    mutate(config);
    writeFileSync(configPath, JSON.stringify(config));
    await assert.rejects(
      verifyPerformanceArtifact({ rootDir, configPath: "budgets.json" }),
      /Invalid static performance budget configuration/
    );
  }
});

test("keeps total RSC capacity advisory while enforcing average and Studio contracts", async (t) => {
  const { rootDir, outDir, chunksDir } = createFixture(t, {
    maxBrotliBytes: 1,
    maxInitialDocumentCssBrotliBytes: 1,
    maxShadowCssBrotliBytes: 1,
    maxTotalInitialCssBrotliBytes: 1,
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
      '<link rel="preconnect" href="https://unexpected.example"></head>'
    )
  );

  const report = await verifyPerformanceArtifact({
    rootDir,
    configPath: "budgets.json"
  });
  const failures = report.failures.join("\n");

  assert.match(failures, /home initial JavaScript Brotli bytes/);
  assert.match(failures, /Studio initial document CSS Brotli bytes/);
  assert.match(failures, /Studio required Shadow CSS Brotli bytes/);
  assert.match(failures, /Studio total initial CSS Brotli bytes/);
  assert.doesNotMatch(failures, /Total RSC text bytes/);
  assert.match(report.warnings.join("\n"), /Total RSC text bytes/);
  assert.match(failures, /Average localized RSC route bytes/);
  assert.match(
    failures,
    /reachable JavaScript is missing required marker: data-studio-module/
  );
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
