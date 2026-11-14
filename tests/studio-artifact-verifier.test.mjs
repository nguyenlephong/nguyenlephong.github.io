import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  STUDIO_LOCALES,
  STUDIO_MODULE_SLUGS,
  verifyStudioArtifact
} from "../scripts/verify-studio-artifact.mjs";

const VERIFIER_SCRIPT = fileURLToPath(
  new URL("../scripts/verify-studio-artifact.mjs", import.meta.url)
);
const BUDGETS = { maxIndexBrotliBytes: 10_000, maxModuleBrotliBytes: 10_000 };

function jsonLd(value) {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

function page({ marker, types }) {
  return [
    "<!doctype html><html><head>",
    '<script src="/_next/static/chunks/initial.js" async=""></script>',
    '<script src="/_next/static/chunks/polyfill.js" noModule=""></script>',
    ...types.map((type) => jsonLd({ "@context": "https://schema.org", "@type": type })),
    '</head><body><header class="app-nav"><nav></nav></header>',
    `<main id="main-content" ${marker}><header class="studio-opener"><h1>Studio</h1></header></main>`,
    '<footer class="app-footer"></footer></body></html>'
  ].join("");
}

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), "studio-artifact-"));
  const chunks = join(root, "_next/static/chunks");
  mkdirSync(chunks, { recursive: true });
  writeFileSync(join(chunks, "initial.js"), 'console.log("site");import("/_next/static/chunks/lazy.js")');
  writeFileSync(join(chunks, "lazy.js"), "studio:ticks:v1");
  writeFileSync(join(chunks, "polyfill.js"), "react-flow__ is ignored in nomodule scripts");
  for (const locale of STUDIO_LOCALES) {
    mkdirSync(join(root, locale, "studio"), { recursive: true });
    writeFileSync(
      join(root, locale, "studio.html"),
      page({ marker: 'data-studio-static-overview="true"', types: ["CollectionPage", "BreadcrumbList"] })
    );
    for (const slug of STUDIO_MODULE_SLUGS) {
      writeFileSync(
        join(root, locale, "studio", `${slug}.html`),
        page({ marker: `data-studio-module-page="${slug}"`, types: ["WebPage", "BreadcrumbList"] })
      );
    }
  }
  return root;
}

function withFixture(run) {
  const root = createFixture();
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function edit(root, relativePath, change) {
  const file = join(root, relativePath);
  writeFileSync(file, change(readFileSync(file, "utf8")));
}

test("Studio artifact verifier checks every locale's index and three module pages", () => {
  withFixture((root) => {
    const summary = verifyStudioArtifact({ outDir: root, ...BUDGETS });
    assert.equal(summary.pageCount, 24);
    assert.deepEqual(
      summary.pages.slice(0, 4).map((entry) => entry.path),
      ["en/studio.html", "en/studio/checklists.html", "en/studio/system-maps.html", "en/studio/ai-setup.html"]
    );
    assert.deepEqual(summary.pages[0].initialScripts, ["_next/static/chunks/initial.js"]);
    assert.equal(summary.pages[0].reachableScripts, 2);
    assert.ok(summary.js.index.maxMeasuredBrotli > 0);
    assert.equal(summary.js.module.maxBrotli, 10_000);
  });
});

test("Studio artifact verifier reads both budgets from the shared config", () => {
  withFixture((root) => {
    const configPath = join(root, "budgets.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        performance: { routeInitialJavaScript: { studio: { maxBrotliBytes: 9_000, maxModuleBrotliBytes: 9_500 } } }
      })
    );
    const summary = verifyStudioArtifact({ outDir: root, configPath });
    assert.equal(summary.js.index.maxBrotli, 9_000);
    assert.equal(summary.js.module.maxBrotli, 9_500);
  });
});

test("Studio artifact verifier rejects a missing module page and broken page structure", () => {
  withFixture((root) => {
    rmSync(join(root, "vi/studio/system-maps.html"));
    edit(root, "fr/studio.html", (html) => html.replace("</main>", "<h1>Again</h1></main>"));
    edit(root, "ja/studio/checklists.html", (html) => html.replace('class="app-nav"', 'class="studio-topbar"'));
    edit(root, "ko/studio/ai-setup.html", (html) => html.replace('"WebPage"', '"Thing"'));
    edit(root, "zh/studio.html", (html) => html.replace('data-studio-static-overview="true"', ""));
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, ...BUDGETS }),
      (error) => {
        assert.match(error.message, /Missing Studio page: vi\/studio\/system-maps\.html/);
        assert.match(error.message, /fr\/studio\.html must contain exactly one H1; found 2/);
        assert.match(error.message, /ja\/studio\/checklists\.html must render inside the site header and footer/);
        assert.match(error.message, /ko\/studio\/ai-setup\.html JSON-LD is missing WebPage/);
        assert.match(error.message, /zh\/studio\.html is missing its static index marker/);
        return true;
      }
    );
  });
});

test("Studio artifact verifier rejects the removed shadow shell and a lazy React Flow chunk", () => {
  withFixture((root) => {
    edit(root, "en/studio.html", (html) =>
      html.replace("<main", '<div data-studio-shadow-host="true"></div><link rel="stylesheet" href="/studio/studio-shadow.css"><main')
    );
    writeFileSync(join(root, "_next/static/chunks/lazy.js"), 'class="react-flow__renderer"');
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, ...BUDGETS }),
      (error) => {
        assert.match(error.message, /en\/studio\.html still references the removed Studio shell: data-studio-shadow-host/);
        assert.match(error.message, /en\/studio\.html still references the removed Studio shell: studio-shadow\.css/);
        assert.match(error.message, /reachable JavaScript contains react-flow__: _next\/static\/chunks\/lazy\.js/);
        return true;
      }
    );
  });
});

test("Studio artifact verifier enforces the initial JavaScript budgets and their ceiling", () => {
  withFixture((root) => {
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, maxIndexBrotliBytes: 1, maxModuleBrotliBytes: 10_000 }),
      /en\/studio\.html initial JavaScript Brotli bytes \d+ exceed 1/
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, maxIndexBrotliBytes: 10_000, maxModuleBrotliBytes: 1 }),
      /en\/studio\/checklists\.html initial JavaScript Brotli bytes \d+ exceed 1/
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, maxIndexBrotliBytes: 256_000, maxModuleBrotliBytes: 10_000 }),
      /index initial JavaScript Brotli budget must stay below 250 KiB/
    );
  });
});

test("Studio artifact verifier rejects scripts symlinked outside the artifact root", () => {
  withFixture((root) => {
    const outsideRoot = mkdtempSync(join(tmpdir(), "studio-artifact-outside-"));
    try {
      const initialPath = join(root, "_next/static/chunks/initial.js");
      const outsidePath = join(outsideRoot, "initial.js");
      writeFileSync(outsidePath, readFileSync(initialPath));
      rmSync(initialPath);
      symlinkSync(outsidePath, initialPath);
      assert.throws(
        () => verifyStudioArtifact({ outDir: root, ...BUDGETS }),
        /artifact path resolves outside its root/
      );
    } finally {
      rmSync(outsideRoot, { recursive: true, force: true });
    }
  });
});

test("Studio artifact verifier CLI rejects caller-controlled artifact roots", () => {
  const result = spawnSync(process.execPath, [VERIFIER_SCRIPT, "../outside"], {
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not accept a custom artifact path/);
});

test("Studio artifact verifier CLI rejects a fixed out path symlinked outside its repository", () => {
  const artifactRoot = createFixture();
  const cliRoot = mkdtempSync(join(tmpdir(), "studio-artifact-cli-"));
  try {
    const copiedScript = join(cliRoot, "scripts/verify-studio-artifact.mjs");
    mkdirSync(dirname(copiedScript), { recursive: true });
    copyFileSync(VERIFIER_SCRIPT, copiedScript);
    symlinkSync(artifactRoot, join(cliRoot, "out"), "dir");

    const result = spawnSync(process.execPath, [realpathSync(copiedScript)], {
      encoding: "utf8"
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /artifact path resolves outside its root/);
  } finally {
    rmSync(cliRoot, { recursive: true, force: true });
    rmSync(artifactRoot, { recursive: true, force: true });
  }
});
