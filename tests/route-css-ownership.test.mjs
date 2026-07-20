import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  collectAppCssImports,
  inspectCssImports,
  validateCssImportOwnership
} from "../scripts/lib/css-import-contract.mjs";

const read = (path) => readFile(path, "utf8");

async function collectNonCssSources(directory, collected = {}) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectNonCssSources(absolutePath, collected);
      continue;
    }
    if (!entry.isFile() || entry.name.endsWith(".css")) continue;
    collected[absolutePath] = await readFile(absolutePath, "utf8");
  }
  return collected;
}

async function collectCssSources(directory, collected = {}) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectCssSources(absolutePath, collected);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".css")) continue;
    collected[absolutePath] = await readFile(absolutePath, "utf8");
  }
  return collected;
}

const expectedImporters = {
  "src/app/document.css": ["src/app/[locale]/layout.tsx"],
  "src/app/globals.css": ["src/app/[locale]/(site)/layout.tsx"],
  "src/app/[locale]/(site)/home.css": ["src/app/[locale]/(site)/page.tsx"],
  "src/app/[locale]/(site)/about/about.css": [
    "src/app/[locale]/(site)/about/page.tsx"
  ],
  "src/app/[locale]/(site)/gallery/gallery.css": [
    "src/app/[locale]/(site)/gallery/page.tsx"
  ],
  "src/app/[locale]/(site)/apps/apps.css": [
    "src/app/[locale]/(site)/apps/page.tsx"
  ],
  "src/app/[locale]/(site)/apps/english/english.css": [
    "src/app/[locale]/(site)/apps/english/page.tsx"
  ],
  "src/app/[locale]/(site)/offline/offline.css": [
    "src/app/[locale]/(site)/offline/page.tsx"
  ],
  "src/app/[locale]/(site)/blog/blog.css": [
    "src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx",
    "src/app/[locale]/(site)/blog/[category]/page.tsx",
    "src/app/[locale]/(site)/blog/page.tsx",
    "src/app/[locale]/(site)/blog/page/[page]/page.tsx",
    "src/app/[locale]/(site)/blog/series/[series]/page.tsx",
    "src/app/[locale]/(site)/blog/series/[series]/page/[page]/page.tsx",
    "src/app/[locale]/(site)/notes/[slug]/page.tsx",
    "src/app/[locale]/(site)/notes/page.tsx",
    "src/app/[locale]/(site)/notes/page/[page]/page.tsx",
    "src/app/[locale]/(site)/notes/topics/[topic]/page.tsx",
    "src/app/[locale]/(site)/notes/topics/[topic]/page/[page]/page.tsx"
  ],
  "src/app/[locale]/(site)/notes/notes.css": [
    "src/app/[locale]/(site)/notes/[slug]/page.tsx",
    "src/app/[locale]/(site)/notes/page.tsx",
    "src/app/[locale]/(site)/notes/page/[page]/page.tsx",
    "src/app/[locale]/(site)/notes/topics/[topic]/page.tsx",
    "src/app/[locale]/(site)/notes/topics/[topic]/page/[page]/page.tsx"
  ],
  "src/app/[locale]/(site)/blog/reader.css": [
    "src/app/[locale]/(site)/blog/[category]/[slug]/layout.tsx",
    "src/app/[locale]/(site)/notes/[slug]/layout.tsx"
  ]
};

test("the complete app CSS import graph matches its explicit owners", async () => {
  const inventory = await collectAppCssImports(process.cwd());
  assert.deepEqual(inventory.typeOnlyCssImports, []);
  assert.deepEqual(inventory.unresolvedDynamicImports, []);
  assert.deepEqual(
    validateCssImportOwnership(inventory, expectedImporters),
    []
  );
});

test("the CSS import contract catches route leakage and dynamic CSS imports", () => {
  const inventory = inspectCssImports({
    "src/app/home/page.tsx": 'import "./home.css";',
    "src/app/leak/page.tsx":
      'import "../home/home.css";\nconst styles = import("./late.css");'
  });
  const violations = validateCssImportOwnership(inventory, {
    "src/app/home/home.css": ["src/app/home/page.tsx"]
  });

  assert.deepEqual(violations, [
    "Dynamic CSS import in src/app/leak/page.tsx: ./late.css",
    "Unexpected CSS importer for src/app/home/home.css: src/app/leak/page.tsx",
    "Unexpected imported stylesheet: src/app/leak/late.css"
  ]);
});

test("CSS ownership violations use deterministic text ordering", () => {
  const inventory = {
    dynamicImports: [],
    staticImports: [
      {
        importer: "src/app/z/page.tsx",
        specifier: "../shared.css",
        stylesheet: "src/app/shared.css"
      },
      {
        importer: "src/app/A/page.tsx",
        specifier: "../shared.css",
        stylesheet: "src/app/shared.css"
      },
      {
        importer: "src/app/z/page.tsx",
        specifier: "../z.css",
        stylesheet: "src/app/z.css"
      },
      {
        importer: "src/app/A/page.tsx",
        specifier: "../A.css",
        stylesheet: "src/app/A.css"
      }
    ],
    typeOnlyCssImports: [],
    unresolvedDynamicImports: []
  };

  assert.deepEqual(
    validateCssImportOwnership(inventory, {
      "src/app/shared.css": [],
      "src/app/missing.css": ["src/app/z/page.tsx", "src/app/A/page.tsx"]
    }),
    [
      "Unexpected CSS importer for src/app/shared.css: src/app/A/page.tsx",
      "Unexpected CSS importer for src/app/shared.css: src/app/z/page.tsx",
      "Missing CSS importer for src/app/missing.css: src/app/A/page.tsx",
      "Missing CSS importer for src/app/missing.css: src/app/z/page.tsx",
      "Unexpected imported stylesheet: src/app/A.css",
      "Unexpected imported stylesheet: src/app/z.css"
    ]
  );
});

test("type-only CSS imports fail without satisfying runtime ownership", () => {
  const inventory = inspectCssImports({
    "src/app/type-only/page.tsx": `
      import type {} from "./home.css";
      import { type CssShape } from "./named.css";
      import type { DomainShape } from "./types";
    `
  });

  assert.deepEqual(inventory.staticImports, []);
  assert.deepEqual(
    inventory.typeOnlyCssImports.map(({ specifier }) => specifier),
    ["./home.css", "./named.css"]
  );
  assert.deepEqual(inventory.unresolvedDynamicImports, []);

  assert.deepEqual(
    validateCssImportOwnership(inventory, {
      "src/app/type-only/home.css": ["src/app/type-only/page.tsx"],
      "src/app/type-only/named.css": ["src/app/type-only/page.tsx"]
    }),
    [
      "Type-only CSS import does not load a stylesheet in src/app/type-only/page.tsx: ./home.css",
      "Type-only CSS import does not load a stylesheet in src/app/type-only/page.tsx: ./named.css",
      "Missing CSS importer for src/app/type-only/home.css: src/app/type-only/page.tsx",
      "Missing CSS importer for src/app/type-only/named.css: src/app/type-only/page.tsx"
    ]
  );
});

test("the CSS import contract parses syntax instead of comments and strings", () => {
  const inventory = inspectCssImports({
    "src/app/fixture/page.tsx": `
      import "./double.css";
      import './single.css?inline';
      const late = import("./late.css");
      const template = import(\`./template.css\`);
      const required = require('./required.css');
      const interpolated = import(\`./themes/\${"dark"}.css\`);
      const requiredInterpolated = require(\`./themes/\${"light"}.css?raw\`);
      const javascript = import("./feature.js");
      const javascriptTemplate = import(\`./feature-\${"panel"}.js\`);
      const ordinaryString = 'import("./string-only.css")';
      // import("./line-comment.css");
      /* require("./block-comment.css"); */
    `
  });

  assert.deepEqual(
    inventory.staticImports.map(({ specifier }) => specifier),
    ["./double.css", "./single.css?inline"]
  );
  assert.deepEqual(
    inventory.dynamicImports.map(({ specifier }) => specifier),
    [
      "./late.css",
      "./required.css",
      "./template.css",
      "./themes/dark.css",
      "./themes/light.css?raw"
    ]
  );
  assert.deepEqual(inventory.unresolvedDynamicImports, []);
  assert.equal(
    inventory.dynamicImports.some(
      ({ specifier }) =>
        specifier.includes("feature") ||
        specifier.includes("comment") ||
        specifier.includes("string-only")
    ),
    false
  );
});

test("the CSS import contract resolves literal concatenation and allows non-CSS results", () => {
  const inventory = inspectCssImports({
    "src/app/fixture/page.tsx": `
      const binaryCss = import("./binary." + "css");
      const nestedCss = require(("./nested-" + "theme") + ".css?raw");
      const binaryJavascript = import("./feature." + "js");
      const templateJavascript = import(\`./\${"feature"}.js\`);
    `
  });

  assert.deepEqual(
    inventory.dynamicImports.map(({ specifier }) => specifier),
    ["./binary.css", "./nested-theme.css?raw"]
  );
  assert.deepEqual(inventory.unresolvedDynamicImports, []);
});

test("the CSS import contract fails closed for every unresolved module specifier", () => {
  const inventory = inspectCssImports({
    "src/app/fixture/page.tsx": `
      const stylesheet = "./identifier.css";
      const byIdentifier = import(stylesheet);
      const byFunction = require(resolveModule());
      const byTemplateIdentifier = import(\`./themes/\${theme}.css\`);
      const byTemplateFunction = import(\`./features/\${resolveFeature()}.js\`);
    `
  });

  assert.deepEqual(inventory.dynamicImports, []);
  assert.deepEqual(
    inventory.unresolvedDynamicImports.map(({ expression }) => expression),
    [
      "stylesheet",
      "resolveModule()",
      "`./themes/${theme}.css`",
      "`./features/${resolveFeature()}.js`"
    ]
  );
  assert.deepEqual(validateCssImportOwnership(inventory, {}), [
    "Unresolved dynamic module specifier in src/app/fixture/page.tsx: stylesheet",
    "Unresolved dynamic module specifier in src/app/fixture/page.tsx: resolveModule()",
    "Unresolved dynamic module specifier in src/app/fixture/page.tsx: `./themes/${theme}.css`",
    "Unresolved dynamic module specifier in src/app/fixture/page.tsx: `./features/${resolveFeature()}.js`"
  ]);
});

test("article reader styles retain reader-only behavior", async () => {
  const [globals, readerCss] = await Promise.all([
    read("src/app/globals.css"),
    read("src/app/[locale]/(site)/blog/reader.css")
  ]);

  for (const font of ["source", "plex", "atkinson", "lora", "be-vietnam"]) {
    assert.match(
      globals,
      new RegExp(`html\\[data-reading-font=['\"]${font}['\"]\\]`)
    );
    assert.doesNotMatch(
      readerCss,
      new RegExp(`html\\[data-reading-font=['\"]${font}['\"]\\]`)
    );
  }
  assert.match(readerCss, /data-reading-background='parchment'/);
  assert.match(readerCss, /\.blog-reader-tools__controls\s*\{/);
  assert.match(readerCss, /\.font-switcher\s*\{/);
});

test("globals keeps shared chrome and excludes route-owned rules", async () => {
  const [globals, homeCss] = await Promise.all([
    read("src/app/globals.css"),
    read("src/app/[locale]/(site)/home.css")
  ]);
  const homeSectionSelectors = [
    ".cv-section {",
    ".cv-section + .cv-section {",
    ".cv-section-head {",
    ".cv-section-eyebrow {",
    ".cv-section-title {"
  ];

  for (const shared of [
    ".app-nav {",
    ".offline-banner {",
    ".eyebrow {",
    ".eyebrow-dot {",
    ".page-back {",
    ".tech-chip {",
    ".app-footer {"
  ]) {
    assert.match(
      globals,
      new RegExp(shared.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }

  for (const owned of [
    ".hero {",
    ...homeSectionSelectors,
    ".offline-page-shell {",
    ".gallery-showcase {",
    ".apps-page {",
    ".english-page {",
    ".about-page-v2 {",
    ".blog-reader-tools {",
    "data-reading-background='parchment'"
  ]) {
    assert.doesNotMatch(
      globals,
      new RegExp(owned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }

  for (const owned of homeSectionSelectors) {
    assert.match(
      homeCss,
      new RegExp(owned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
});

test("Apps preview and English workspace responsive rules keep their real owner", async () => {
  const [appsCss, englishCss] = await Promise.all([
    read("src/app/[locale]/(site)/apps/apps.css"),
    read("src/app/[locale]/(site)/apps/english/english.css")
  ]);

  for (const previewSelector of [
    ".english-app-visual",
    ".english-visual-card strong"
  ]) {
    const expression = new RegExp(
      previewSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    assert.match(appsCss, expression);
    assert.doesNotMatch(englishCss, expression);
  }
  assert.match(englishCss, /\.english-workbench\s*\{/);
  assert.doesNotMatch(appsCss, /\.english-workbench\s*\{/);
});

test("obsolete Notes chambers and unconsumed shared selectors stay removed", async () => {
  const [globals, notesCss, englishCss, englishApp, allCss, sourceGroups] =
    await Promise.all([
      read("src/app/globals.css"),
      read("src/app/[locale]/(site)/notes/notes.css"),
      read("src/app/[locale]/(site)/apps/english/english.css"),
      read("src/components/apps/english/EnglishPracticeApp.tsx"),
      collectCssSources("src"),
      Promise.all(
        ["src", "content", "scripts", "tests"].map((directory) =>
          collectNonCssSources(directory)
        )
      )
    ]);
  const obsoleteTokens = [
    `notes-${"chambers"}`,
    `chamber${"__"}`,
    `chamber-${"nav"}`,
    `entry${"__"}`,
    `section-${"container"}`,
    `grid-item_${"wrapper"}`
  ];
  const consumers = Object.assign({}, ...sourceGroups);
  delete consumers[path.resolve("tests/route-css-ownership.test.mjs")];

  for (const token of obsoleteTokens) {
    for (const [file, source] of Object.entries(allCss)) {
      assert.equal(source.includes(token), false, `${file} defines ${token}`);
    }
    for (const [file, source] of Object.entries(consumers)) {
      assert.equal(source.includes(token), false, `${file} consumes ${token}`);
    }
  }
  assert.doesNotMatch(notesCss, /\.chamber\s*\{/);
  assert.doesNotMatch(notesCss, /\.entry(?=[:\s.{])/);
  assert.equal((globals.match(/\.nav-resume-btn\s*\{/g) ?? []).length, 1);

  assert.match(englishApp, /english-result--\$\{blankResult\}/);
  assert.match(englishCss, /\.english-result--correct\s*\{/);
  assert.match(englishCss, /\.english-result--wrong\s*\{/);
});
