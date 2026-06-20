import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("studio route is wired into routing, seo, navigation, analytics, and inventory content", async () => {
  assert.ok(existsSync("src/app/[locale]/studio/page.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioWorkspace.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.css"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.data.ts"));

  const [
    routes,
    sitemap,
    header,
    footer,
    seo,
    analytics,
    tracker,
    page,
    workspace,
    data,
    css,
    enMessages,
    viMessages
  ] = await Promise.all([
    readFile("src/app/app.const.ts", "utf8"),
    readFile("src/app/sitemap.ts", "utf8"),
    readFile("src/components/AppHeader.tsx", "utf8"),
    readFile("src/components/AppFooter.tsx", "utf8"),
    readFile("src/app/seo.config.ts", "utf8"),
    readFile("src/lib/analytics.ts", "utf8"),
    readFile("src/components/analytics/PageTracker.tsx", "utf8"),
    readFile("src/app/[locale]/studio/page.tsx", "utf8"),
    readFile("src/app/[locale]/studio/StudioWorkspace.tsx", "utf8"),
    readFile("src/app/[locale]/studio/studio.data.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.css", "utf8"),
    readFile("messages/en.json", "utf8"),
    readFile("messages/vi.json", "utf8")
  ]);

  assert.match(routes, /STUDIO:\s*"\/studio"/);
  assert.match(sitemap, /path:\s*"\/studio"/);
  assert.doesNotMatch(header, /APP_ROUTE\.STUDIO/);
  assert.doesNotMatch(header, /trackId:\s*"studio"/);
  assert.match(footer, /APP_ROUTE\.STUDIO/);
  assert.match(footer, /LuOrbit/);
  assert.match(footer, /studio_footer/);
  assert.match(seo, /studio/);
  assert.match(analytics, /'studio_view'/);
  assert.match(tracker, /'studio'/);
  assert.match(tracker, /'studio_view'/);

  assert.match(page, /generateStaticParams/);
  assert.match(page, /generateMetadata/);
  assert.match(page, /PageTracker page="studio" eventName="studio_view"/);
  assert.match(page, /StudioWorkspace/);

  assert.match(workspace, /^"use client"/);
  assert.match(workspace, /selectedNoteId/);
  assert.match(workspace, /studioFolders/);
  assert.match(workspace, /studioNotes/);
  assert.match(workspace, /navigator\.clipboard\.writeText/);

  for (const expectedClass of [
    "studio-workbench",
    "studio-sidebar",
    "studio-submenu",
    "studio-note-card",
    "studio-reader"
  ]) {
    assert.match(css, new RegExp(`\\.${expectedClass}\\b`));
  }
  assert.doesNotMatch(css, /\.studio-sidebar\s*\{[^}]*overflow:\s*auto/s);
  assert.doesNotMatch(css, /\.studio-reader\s*\{[^}]*overflow:\s*auto/s);
  assert.doesNotMatch(css, /height:\s*calc\(100vh - 72px\)/);
  assert.match(css, /\.studio-page\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /\.studio-reader__header h2\s*\{[^}]*overflow-wrap:\s*anywhere/s);

  for (const expected of [
    "AI setup",
    "Computer setup",
    "Terminal setup",
    "Machine bootstrap",
    "Codex",
    "Claude",
    "Antigravity",
    "Gemini",
    "Open Design",
    "npx antigravity-awesome-skills",
    "https://github.com/sickn33/antigravity-awesome-skills",
    "od mcp install codex",
    "od mcp install antigravity"
  ]) {
    assert.match(data, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(enMessages, /"studio":\s*"Studio"/);
  assert.match(viMessages, /"studio":\s*"Studio"/);
});
