import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const STUDIO_DIR = "src/app/[locale]/(site)/studio";
const read = (file) => readFileSync(`${STUDIO_DIR}/${file}`, "utf8");
const studioFiles = readdirSync(STUDIO_DIR, { recursive: true }).filter((file) => /\.(?:tsx?|css)$/.test(file));
const importSpecifiers = (source) =>
  [...source.matchAll(/(?:^|\n)\s*import\s[^"']*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)].map(
    (match) => match[1] ?? match[2]
  );

test("Studio pages render inside the site layout, with no shadow host or own layout", () => {
  assert.ok(!existsSync("src/app/[locale]/studio"), "the old out-of-group Studio segment is gone");
  assert.ok(!existsSync(`${STUDIO_DIR}/layout.tsx`), "Studio inherits (site)/layout.tsx");
  const siteLayout = readFileSync("src/app/[locale]/(site)/layout.tsx", "utf8");
  assert.match(siteLayout, /<AppHeader\b/);
  assert.match(siteLayout, /<AppFooter\b/);

  for (const file of studioFiles) {
    const source = read(file);
    assert.doesNotMatch(source, /data-studio-shadow-host|attachShadow|ShadowIsland|studio-shadow\.css/, file);
    assert.doesNotMatch(source, /<AppHeader\b|<AppFooter\b/, `${file} must not render its own site chrome`);
  }
  // The index and module pages each own one <main>, right after the site header.
  assert.match(read("StudioStaticOverview.tsx"), /<main\s+id="main-content"/);
  assert.match(read("StudioModuleArticle.tsx"), /<main\s+id="main-content"/);
});

test("Studio ships an index and exactly three module pages", async () => {
  assert.ok(existsSync(`${STUDIO_DIR}/page.tsx`));
  assert.ok(existsSync(`${STUDIO_DIR}/[module]/page.tsx`));
  assert.ok(existsSync(`${STUDIO_DIR}/opengraph-image.tsx`));
  const { studioCatalog } = await import(`../${STUDIO_DIR}/studio-route-catalog.ts`);
  assert.deepEqual(
    studioCatalog.publicModules.map((module) => module.slug),
    ["checklists", "system-maps", "ai-setup"]
  );
  const modulePage = read("[module]/page.tsx");
  assert.match(modulePage, /studioCatalog\.publicModules\.map\(\(\{ slug \}\) => \(\{ locale, module: slug \}\)\)/);
  assert.match(modulePage, /if \(!studioModule\) notFound\(\)/);
});

test("Studio client islands are small, explicit, and use the declared analytics events", () => {
  const islands = ["StudioChecklistTicks.tsx", "StudioCopyButton.tsx", "StudioReadingState.tsx", "StudioSystemMapViewer.tsx"];
  for (const file of studioFiles.filter((name) => name.endsWith(".tsx"))) {
    const isClient = /^"use client";/.test(read(file));
    assert.equal(isClient, islands.includes(file), `${file} client directive`);
  }

  const analytics = readFileSync("src/lib/analytics.ts", "utf8");
  for (const eventName of [
    "studio_view",
    "studio_module_open",
    "studio_part_select",
    "studio_checklist_copy",
    "studio_checklist_item_toggle",
    "studio_ai_skill_copy"
  ]) {
    assert.match(analytics, new RegExp(`'${eventName}'`));
  }
  assert.match(read("StudioPageFrame.tsx"), /<PageTracker page="studio" eventName="studio_view"/);
  assert.match(read("StudioPageFrame.tsx"), /<AppsLinkTracker \/>/);
  assert.match(read("StudioOpener.tsx"), /data-track="studio_part_select"/);
  assert.match(read("StudioStaticOverview.tsx"), /data-track="studio_module_open"/);
  assert.match(read("StudioModuleArticle.tsx"), /event="studio_checklist_copy"/);
  assert.match(read("StudioModuleArticle.tsx"), /event="studio_ai_skill_copy"/);
  assert.match(read("StudioSystemMapViewer.tsx"), /track\("studio_part_select"/);

  const ticks = read("StudioChecklistTicks.tsx");
  assert.match(ticks, /const TICKS_KEY = "studio:ticks:v1"/);
  assert.match(ticks, /track\("studio_checklist_item_toggle"/);
  assert.match(ticks, /catch \{/, "blocked storage must not break the page");
});

test("the system map viewer is plain SVG with no React Flow runtime", () => {
  const viewer = read("StudioSystemMapViewer.tsx");
  assert.match(viewer, /<svg\b/);
  for (const file of studioFiles) {
    for (const specifier of importSpecifiers(read(file))) {
      assert.doesNotMatch(specifier, /@xyflow|reactflow/, `${file} imports ${specifier}`);
    }
  }
});
