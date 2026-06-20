import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("studio route is wired into routing, seo, navigation, analytics, and inventory content", async () => {
  assert.ok(existsSync("src/app/[locale]/studio/page.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioWorkspace.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.shadow-styles.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.data.ts"));
  assert.ok(existsSync("src/components/studio-kit/index.ts"));
  assert.ok(existsSync("src/components/studio-kit/shadow-island.tsx"));
  assert.ok(existsSync("src/components/studio-kit/upstream.json"));

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
    shadowCss,
    kitIndex,
    shadowIsland,
    kitUpstream,
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
    readFile("src/app/[locale]/studio/studio.shadow-styles.ts", "utf8"),
    readFile("src/components/studio-kit/index.ts", "utf8"),
    readFile("src/components/studio-kit/shadow-island.tsx", "utf8"),
    readFile("src/components/studio-kit/upstream.json", "utf8"),
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
  assert.match(page, /studio-route-shell/);
  assert.match(page, /body:has\(\.studio-route-shell\) \.app-nav/);
  assert.match(page, /body:has\(\.studio-route-shell\) \.app-footer/);
  assert.doesNotMatch(page, /studio\.css/);
  assert.doesNotMatch(page, /studio-kit\/studio-kit\.css/);

  assert.match(workspace, /^"use client"/);
  assert.match(workspace, /@\/components\/studio-kit/);
  assert.match(workspace, /ShadowIsland/);
  assert.match(workspace, /studioShadowStyles/);
  assert.match(workspace, /studio-sidebar/);
  assert.match(workspace, /studio-topbar/);
  assert.match(workspace, /metric-grid/);
  assert.match(workspace, /Studio Admin/);
  assert.match(workspace, /Back to CV/);
  assert.match(workspace, /href=\{`\/\$\{locale\}\/cv`\}/);
  assert.match(workspace, /handleShadowAnchorClick/);
  assert.match(workspace, /href: "#dashboard"/);
  assert.match(workspace, /href: "#customer-activity"/);
  assert.match(workspace, /href: "#customers"/);
  assert.match(workspace, /Customer Activity/);
  assert.match(workspace, /18,426 Customers/);
  assert.match(workspace, /next-shadcn-admin-dashboard/);
  assert.doesNotMatch(workspace, /Downloads\/next-shadcn-admin-dashboard-main/);
  assert.match(kitIndex, /export \* from "\.\/primitives"/);
  assert.match(kitIndex, /export \* from "\.\/dashboard"/);
  assert.match(kitIndex, /export \* from "\.\/shadow-island"/);
  assert.match(shadowIsland, /attachShadow\(\{ mode: "open", delegatesFocus: true \}\)/);
  assert.match(shadowIsland, /createPortal/);
  assert.match(kitUpstream, /next-shadcn-admin-dashboard-main/);
  assert.match(kitUpstream, /"sourceVersion": "2\.2\.0"/);

  for (const expectedClass of [
    "studio-admin",
    "studio-sidebar",
    "studio-topbar",
    "metric-grid",
    "activity-card",
    "customers-card",
    "table-shell"
  ]) {
    assert.match(shadowCss, new RegExp(`\\.${expectedClass}\\b`));
  }
  assert.match(shadowCss, /grid-template-columns:\s*272px minmax\(0, 1fr\)/);
  assert.match(shadowCss, /\.studio-sidebar\s*\{[^}]*height:\s*100vh/s);
  assert.match(shadowCss, /--sidebar:\s*#fafafa/);
  assert.match(shadowCss, /border-radius:\s*0\.875rem/);
  assert.match(shadowCss, /@media \(max-width: 860px\)/);

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
