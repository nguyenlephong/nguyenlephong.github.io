import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyStudioArtifact } from "../scripts/verify-studio-artifact.mjs";

const VERIFIER_SCRIPT = fileURLToPath(
  new URL("../scripts/verify-studio-artifact.mjs", import.meta.url)
);

const VIETNAMESE_ONLY_SENTINEL = "Khôi phục cách trình bày mặc định";
const LOCALE_SENTINELS = {
  en: "Restore layout defaults",
  vi: VIETNAMESE_ONLY_SENTINEL,
  zh: "恢复默认布局",
  ja: "レイアウト既定値に戻す",
  ko: "레이아웃 기본값 복원",
  fr: "Restaurer les valeurs par défaut"
};

function loaderGroup(...names) {
  const references = names
    .map((name) => `"static/chunks/${name}.js"`)
    .join(",");
  return `Promise.all([${references}].map(chunk=>runtime.l(chunk)))`;
}

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), "studio-artifact-"));
  const chunks = join(root, "_next/static/chunks");
  mkdirSync(join(root, "en"), { recursive: true });
  mkdirSync(join(root, "studio"), { recursive: true });
  mkdirSync(chunks, { recursive: true });
  writeFileSync(
    join(root, "studio/studio-shadow.css"),
    `${'.studio-admin[data-navbar-style="scroll"]'} .studio-main { overflow: auto; }${"x".repeat(100_000)}`
  );
  writeFileSync(
    join(root, "en/studio.html"),
    '<script src="/_next/static/chunks/initial.js"></script>'
  );
  writeFileSync(
    join(chunks, "initial.js"),
    [
      "console.log('studio shell')",
      loaderGroup("shell-en", "shell-shared", "en"),
      loaderGroup("shell-vi", "shell-shared", "vi"),
      loaderGroup("shell-zh", "shell-shared", "zh"),
      loaderGroup("shell-ja", "shell-shared", "ja"),
      loaderGroup("shell-ko", "shell-shared", "ko"),
      loaderGroup("shell-fr", "shell-shared", "fr")
    ].join(";")
  );
  writeFileSync(
    join(chunks, "shell-en.js"),
    [
      loaderGroup("default", "default-shared"),
      loaderGroup("mail"),
      loaderGroup("skills"),
      loaderGroup("checklists"),
      loaderGroup("auxiliary"),
      loaderGroup("flow"),
      loaderGroup("chart")
    ].join(";")
  );
  for (const locale of ["vi", "zh", "ja", "ko", "fr"]) {
    writeFileSync(join(chunks, `shell-${locale}.js`), `shell-${locale}`);
  }
  writeFileSync(join(chunks, "shell-shared.js"), "shared-shell-runtime");
  writeFileSync(join(chunks, "default.js"), "welcome-route");
  writeFileSync(
    join(chunks, "default-shared.js"),
    `default-route-sibling${"s".repeat(1_000)}`
  );
  writeFileSync(join(chunks, "mail.js"), "mail-workbench");
  writeFileSync(join(chunks, "skills.js"), "skill-library-workbench");
  writeFileSync(join(chunks, "checklists.js"), "checklist-workbench");
  writeFileSync(
    join(chunks, "auxiliary.js"),
    "data-studio-auxiliary-dashboard"
  );
  writeFileSync(join(chunks, "flow.js"), "data-studio-flow-runtime");
  writeFileSync(join(chunks, "chart.js"), "data-studio-recharts-runtime");
  for (const [locale, sentinel] of Object.entries(LOCALE_SENTINELS)) {
    writeFileSync(
      join(chunks, `${locale}.js`),
      `${sentinel}${locale === "vi" ? "n".repeat(2_000) : ""}`
    );
  }
  return root;
}

test("Studio artifact verifier counts complete Turbopack loader groups and reachable async JavaScript", () => {
  const root = createFixture();
  try {
    const summary = verifyStudioArtifact({ outDir: root });
    assert.equal(summary.initialScripts.length, 1);
    assert.equal(summary.js.initial.maxBrotli, 176_128);
    assert.equal(summary.js.defaultRoute.total.maxBrotli, 204_800);
    assert.equal(summary.defaultScripts.length, 5);
    assert.ok(
      summary.defaultScripts.includes("_next/static/chunks/default-shared.js")
    );
    assert.ok(
      summary.defaultScripts.includes("_next/static/chunks/shell-shared.js")
    );
    assert.equal(summary.css.file, "studio/studio-shadow.css");
    assert.deepEqual(
      Object.keys(summary.lazyChunks).sort(),
      [
        "AI skills workbench",
        "ReactFlow",
        "Recharts",
        "auxiliary dashboards",
        "delivery checklist workbench",
        "mail workbench"
      ].sort()
    );
    assert.ok(summary.asyncScripts.length > summary.defaultScripts.length);
    assert.ok(summary.js.async.raw > summary.js.initial.raw);
    assert.deepEqual(summary.js.reachableAsync, summary.js.async);
    assert.equal(
      summary.js.reachable.raw,
      summary.js.initial.raw + summary.js.async.raw
    );
    assert.ok(summary.js.defaultRoute.async.raw > 0);
    assert.equal(
      summary.js.defaultRoute.total.raw,
      summary.js.initial.raw + summary.js.defaultRoute.async.raw
    );
    assert.deepEqual(summary.localeIsolation.vietnameseChunks, [
      "_next/static/chunks/vi.js"
    ]);
    assert.equal(
      summary.lazyBoundaries.auxiliaryDashboard.loaderDepth,
      1
    );
    assert.deepEqual(
      summary.lazyBoundaries.auxiliaryDashboard.loaderChunks,
      ["_next/static/chunks/auxiliary.js"]
    );
    assert.deepEqual(
      Object.keys(summary.localeIsolation.locales),
      Object.keys(LOCALE_SENTINELS)
    );
    assert.deepEqual(
      summary.localeIsolation.locales.en.loaderChunks.sort(),
      [
        "_next/static/chunks/en.js",
        "_next/static/chunks/shell-en.js",
        "_next/static/chunks/shell-shared.js"
      ].sort()
    );

    writeFileSync(
      join(root, "_next/static/chunks/initial.js"),
      'data-studio-flow-runtime;.studio-admin[data-navbar-style="scroll"]'
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /client JavaScript still embeds the full Shadow stylesheet/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier rejects representative feature code in direct scripts", () => {
  const root = createFixture();
  try {
    const initialPath = join(root, "_next/static/chunks/initial.js");
    writeFileSync(
      initialPath,
      `${readFileSync(initialPath, "utf8")};mail-workbench`
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /mail workbench runtime is eagerly loaded/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier rejects scripts symlinked outside the artifact root", () => {
  const root = createFixture();
  const outsideRoot = mkdtempSync(join(tmpdir(), "studio-artifact-outside-"));
  try {
    const initialPath = join(root, "_next/static/chunks/initial.js");
    const outsidePath = join(outsideRoot, "initial.js");
    writeFileSync(outsidePath, readFileSync(initialPath));
    rmSync(initialPath);
    symlinkSync(outsidePath, initialPath);

    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /artifact path resolves outside its root/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});

test("Studio artifact verifier rejects unsupported locales before reading HTML", () => {
  const root = createFixture();
  try {
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, locale: "../../outside" }),
      /Unsupported Studio artifact locale/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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
    mkdirSync(join(cliRoot, "scripts"), { recursive: true });
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

test("Studio artifact verifier validates the chunks directory before enumeration", () => {
  const root = createFixture();
  const outsideRoot = mkdtempSync(join(tmpdir(), "studio-chunks-outside-"));
  try {
    const chunksPath = join(root, "_next/static/chunks");
    const outsideChunks = join(outsideRoot, "chunks");
    copyFileSync(join(chunksPath, "initial.js"), join(root, "initial.js"));
    writeFileSync(
      join(root, "en/studio.html"),
      '<script src="/initial.js"></script>'
    );
    renameSync(chunksPath, outsideChunks);
    symlinkSync(outsideChunks, chunksPath, "dir");

    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /artifact path resolves outside its root/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});

test("Studio artifact verifier rejects an all-route preload in the default loader group", () => {
  const root = createFixture();
  try {
    const shellPath = join(root, "_next/static/chunks/shell-en.js");
    const source = readFileSync(shellPath, "utf8").replace(
      loaderGroup("default", "default-shared"),
      loaderGroup("default", "default-shared", "mail")
    );
    writeFileSync(shellPath, source);
    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /mail workbench runtime is preloaded by the Studio default route/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier rejects a sequential auxiliary dashboard lazy-loader waterfall", () => {
  const root = createFixture();
  try {
    const shellPath = join(root, "_next/static/chunks/shell-en.js");
    const source = readFileSync(shellPath, "utf8").replace(
      loaderGroup("auxiliary"),
      loaderGroup("auxiliary-wrapper")
    );
    writeFileSync(shellPath, source);
    writeFileSync(
      join(root, "_next/static/chunks/auxiliary-wrapper.js"),
      loaderGroup("auxiliary")
    );

    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /auxiliary dashboard runtime must be loaded atomically by its outer route loader; found loader depth 2/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier keeps Recharts out of the auxiliary dashboard route loader", () => {
  const root = createFixture();
  try {
    const shellPath = join(root, "_next/static/chunks/shell-en.js");
    const source = readFileSync(shellPath, "utf8").replace(
      loaderGroup("auxiliary"),
      loaderGroup("auxiliary", "chart")
    );
    writeFileSync(shellPath, source);

    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /Recharts runtime is preloaded by the Studio auxiliary dashboard route/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier rejects Vietnamese copy in English initial or default chunks", () => {
  const root = createFixture();
  try {
    writeFileSync(
      join(root, "_next/static/chunks/default.js"),
      `welcome-route;${VIETNAMESE_ONLY_SENTINEL}`
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /Vietnamese-only Studio copy leaked into the English initial\/default chunks/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier requires an isolated loader for every locale", () => {
  const root = createFixture();
  try {
    const initialPath = join(root, "_next/static/chunks/initial.js");
    const source = readFileSync(initialPath, "utf8").replace(
      loaderGroup("shell-zh", "shell-shared", "zh"),
      loaderGroup("shell-zh", "shell-shared", "zh", "en")
    );
    writeFileSync(initialPath, source);
    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /Studio zh locale loader includes other locale chunks: en, zh/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier fails a direct Brotli budget at or above 250 KiB", () => {
  const root = createFixture();
  try {
    assert.throws(
      () =>
        verifyStudioArtifact({ outDir: root, maxInitialBrotliBytes: 256_000 }),
      /budget must stay below 250 KiB/
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root, maxInitialBrotliBytes: 1 }),
      /initial JavaScript Brotli bytes .* exceed 1/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Studio artifact verifier hard-gates the complete default loader group", () => {
  const root = createFixture();
  try {
    assert.throws(
      () =>
        verifyStudioArtifact({
          outDir: root,
          maxDefaultRouteBrotliBytes: 225_280
        }),
      /default-route JavaScript Brotli budget must stay below 220 KiB/
    );
    assert.throws(
      () =>
        verifyStudioArtifact({
          outDir: root,
          maxDefaultRouteBrotliBytes: 1
        }),
      /default-route JavaScript Brotli bytes .* exceed 1/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
