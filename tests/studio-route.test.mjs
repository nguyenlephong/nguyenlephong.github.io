import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("studio route is wired into routing, seo, navigation, analytics, and inventory content", async () => {
  assert.ok(existsSync("src/app/[locale]/studio/page.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioWorkspace.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio-admin-shell.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.shadow-styles.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.data.ts"));
  assert.ok(existsSync("src/components/studio-kit/index.ts"));
  assert.ok(existsSync("src/components/studio-kit/shadow-island.tsx"));
  assert.ok(existsSync("src/components/studio-kit/README.md"));
  assert.ok(!existsSync("src/components/studio-kit/upstream.json"));
  assert.ok(!existsSync("src/app/[locale]/cv/page.tsx"));
  assert.ok(!existsSync("src/app/[locale]/cv/opengraph-image.tsx"));
  assert.ok(!existsSync("src/components/PDFResumeViewer.tsx"));

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
    adminShell,
    data,
    shadowCss,
    kitIndex,
    shadowIsland,
    kitReadme,
    packageJson,
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
    readFile("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8"),
    readFile("src/app/[locale]/studio/studio.data.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.shadow-styles.ts", "utf8"),
    readFile("src/components/studio-kit/index.ts", "utf8"),
    readFile("src/components/studio-kit/shadow-island.tsx", "utf8"),
    readFile("src/components/studio-kit/README.md", "utf8"),
    readFile("package.json", "utf8"),
    readFile("messages/en.json", "utf8"),
    readFile("messages/vi.json", "utf8")
  ]);

  assert.match(routes, /STUDIO:\s*"\/studio"/);
  assert.doesNotMatch(routes, /CV:\s*"\/cv"/);
  assert.match(sitemap, /path:\s*"\/studio"/);
  assert.doesNotMatch(sitemap, /path:\s*"\/cv"/);
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
  assert.match(workspace, /StudioAdminShell/);
  assert.match(workspace, /studioShadowStyles/);
  assert.match(adminShell, /^"use client"/);
  assert.match(adminShell, /StudioAdminShell/);
  assert.match(adminShell, /studio-sidebar/);
  assert.match(adminShell, /studio-topbar/);
  assert.match(adminShell, /metric-grid/);
  assert.match(adminShell, /<span>Studio<\/span>/);
  assert.match(adminShell, /Find setup note/);
  assert.match(adminShell, /Profile navigation/);
  assert.match(adminShell, /Profile menu/);
  assert.match(adminShell, /label:\s*"Home"/);
  assert.match(adminShell, /label:\s*"Blog"/);
  assert.match(adminShell, /label:\s*"Notes"/);
  assert.match(adminShell, /APP_ROUTE\.CV_PDF/);
  assert.match(adminShell, /function routeHref/);
  assert.match(adminShell, /function profileHref/);
  assert.match(adminShell, /window\.history\.pushState/);
  assert.match(adminShell, /CommandDialog/);
  assert.match(adminShell, /StudioPreferencesPanel/);
  assert.match(adminShell, /studio_theme_preference/);
  assert.match(adminShell, /studio_font_preference/);
  assert.match(adminShell, /studio_layout_preference/);
  assert.match(adminShell, /type StudioContentLayout = "centered" \| "full-width"/);
  assert.match(adminShell, /type StudioNavbarStyle = "sticky" \| "scroll"/);
  assert.match(adminShell, /type StudioSidebarVariant = "inset" \| "sidebar" \| "floating"/);
  assert.match(adminShell, /type StudioSidebarCollapsible = "icon" \| "offcanvas"/);
  assert.match(adminShell, /visibleRouteIds/);
  assert.match(adminShell, /is-sidebar-collapsed/);
  assert.match(adminShell, /is-sidebar-hidden/);
  assert.match(adminShell, /is-mobile-open/);
  assert.match(adminShell, /is-dark/);
  assert.match(adminShell, /data-content-layout/);
  assert.match(adminShell, /data-navbar-style/);
  assert.match(adminShell, /data-sidebar-variant/);
  assert.match(adminShell, /data-sidebar-collapsible/);
  assert.match(adminShell, /Page layout/);
  assert.match(adminShell, /Navbar behavior/);
  assert.match(adminShell, /Sidebar style/);
  assert.match(adminShell, /Collapse mode/);
  assert.match(adminShell, /Restore layout defaults/);
  const navGroupsBlock = adminShell.slice(
    adminShell.indexOf("const navGroups"),
    adminShell.indexOf("const studioMails")
  );
  assert.match(navGroupsBlock, /label:\s*"Personal Studio"/);
  assert.match(navGroupsBlock, /title:\s*"AI Setup"/);
  assert.match(navGroupsBlock, /routeId:\s*"ai-agent-setup"/);
  assert.doesNotMatch(navGroupsBlock, /Communication/);
  assert.doesNotMatch(navGroupsBlock, /title:\s*"Email"/);
  assert.doesNotMatch(navGroupsBlock, /title:\s*"Chat"/);
  assert.doesNotMatch(navGroupsBlock, /Dashboards/);
  assert.doesNotMatch(navGroupsBlock, /Calendar/);
  assert.doesNotMatch(navGroupsBlock, /Kanban/);
  assert.doesNotMatch(navGroupsBlock, /Invoice/);
  assert.doesNotMatch(navGroupsBlock, /Authentication/);
  assert.doesNotMatch(navGroupsBlock, /Legacy/);
  assert.match(adminShell, /"crm"/);
  assert.match(adminShell, /"finance"/);
  assert.match(adminShell, /"analytics"/);
  assert.match(adminShell, /"email"/);
  assert.match(adminShell, /"ai-agent-setup"/);
  assert.match(adminShell, /"auth-login-v1"/);
  assert.match(adminShell, /function MailRoutePage/);
  assert.match(adminShell, /function ChatRoutePage/);
  assert.match(adminShell, /function AiAgentSetupPage/);
  assert.match(adminShell, /title:\s*"Email"/);
  assert.match(adminShell, /title:\s*"Chat"/);
  assert.match(adminShell, /title:\s*"AI Agent Setup"/);
  assert.doesNotMatch(adminShell, /Mail preview/);
  assert.doesNotMatch(adminShell, /Chat preview/);
  assert.match(adminShell, /data-studio-module="mail"/);
  assert.match(adminShell, /data-studio-module="chat"/);
  assert.match(adminShell, /data-studio-module="ai-agent-setup"/);
  assert.match(adminShell, /studioMails/);
  assert.match(adminShell, /studioConversations/);
  assert.match(adminShell, /studioFolders/);
  assert.match(adminShell, /studioNotes/);
  assert.match(adminShell, /aiWorkflowSteps/);
  assert.match(adminShell, /Attachments \(\{selectedMail\.attachments\.length\}\)/);
  assert.match(adminShell, /Internal note/);
  assert.doesNotMatch(adminShell, /function MailChatPage/);
  assert.match(adminShell, /Engineering Ops/);
  assert.match(adminShell, /Release Signal/);
  assert.match(adminShell, /Component Inventory/);
  assert.match(adminShell, /System Workstreams/);
  assert.match(adminShell, /DeliverySignalChart/);
  assert.match(adminShell, /ResponsiveContainer/);
  assert.match(adminShell, /ComposedChart/);
  assert.match(adminShell, /Tooltip/);
  assert.match(adminShell, /releaseSignalChartData/);
  assert.match(adminShell, /rolloutVolume/);
  assert.match(adminShell, /platformHealth/);
  assert.match(adminShell, /incidentNoise/);
  assert.match(adminShell, /distributionSegments/);
  assert.match(adminShell, /componentInventory/);
  assert.doesNotMatch(adminShell, /Customer Activity/);
  assert.doesNotMatch(adminShell, /18,426 Customers/);
  assert.doesNotMatch(adminShell, /activity-chart/);
  assert.doesNotMatch(adminShell, /chart-bar/);
  assert.doesNotMatch(adminShell, /polyline/);
  assert.doesNotMatch(adminShell, /next-shadcn-admin-dashboard/);
  assert.doesNotMatch(adminShell, /source admin/);
  assert.doesNotMatch(adminShell, /source-style/);
  assert.doesNotMatch(adminShell, /arhamkhnz/);
  assert.doesNotMatch(adminShell, /Downloads\/next-shadcn-admin-dashboard-main/);
  assert.match(kitIndex, /export \* from "\.\/primitives"/);
  assert.match(kitIndex, /export \* from "\.\/dashboard"/);
  assert.match(kitIndex, /export \* from "\.\/shadow-island"/);
  assert.match(shadowIsland, /attachShadow\(\{ mode: "open", delegatesFocus: true \}\)/);
  assert.match(shadowIsland, /createPortal/);
  assert.match(kitReadme, /Reusable admin\/workspace components/);
  assert.doesNotMatch(kitReadme, /next-shadcn-admin-dashboard/);
  assert.doesNotMatch(kitReadme, /upstream/);
  assert.doesNotMatch(packageJson, /@react-pdf-viewer\/core/);
  assert.doesNotMatch(packageJson, /pdfjs-dist/);

  for (const expectedClass of [
    "studio-admin",
    "studio-sidebar",
    "studio-topbar",
    "metric-grid",
    "activity-card",
    "studio-chart",
    "studio-chart-tooltip",
    "workstreams-card",
    "ops-kpi-strip",
    "component-inventory",
    "donut-chart",
    "table-shell",
    "mail-workbench",
    "chat-workbench",
    "chat-profile-pane",
    "ai-setup-container",
    "ai-setup-index",
    "ai-setup-reader",
    "ai-workflow-rail",
    "preferences-popover"
  ]) {
    assert.match(shadowCss, new RegExp(`\\.${expectedClass}\\b`));
  }
  assert.match(shadowCss, /\.chart-legend\.interactive\b/);
  assert.doesNotMatch(shadowCss, /\.activity-chart\b/);
  assert.doesNotMatch(shadowCss, /\.chart-bar\b/);
  assert.match(packageJson, /"recharts":/);
  assert.match(shadowCss, /\.mail-workbench\.card,\s*\.chat-workbench\.card\s*\{[^}]*display:\s*grid/s);
  assert.match(shadowCss, /grid-template-columns:\s*18\.5rem minmax\(0, 1fr\)/);
  assert.match(shadowCss, /\.studio-admin\s*\{[^}]*gap:\s*0\.75rem/s);
  assert.match(shadowCss, /\.studio-admin\.is-sidebar-hidden\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(shadowCss, /\.studio-admin\[data-sidebar-variant="sidebar"\]\s*\{[^}]*gap:\s*0/s);
  assert.match(shadowCss, /\.studio-admin\[data-sidebar-variant="floating"\]\s*\{[^}]*gap:\s*1rem/s);
  assert.match(shadowCss, /\.studio-admin\[data-content-layout="full-width"\] \.dashboard-content\s*\{[^}]*width:\s*100%/s);
  assert.match(shadowCss, /\.studio-admin\[data-navbar-style="scroll"\] \.studio-main\s*\{[^}]*overflow:\s*auto/s);
  assert.match(shadowCss, /\.studio-sidebar\s*\{[^}]*height:\s*calc\(100vh - 1\.5rem\)/s);
  assert.match(shadowCss, /\.studio-main\s*\{[^}]*height:\s*calc\(100vh - 1\.5rem\)/s);
  assert.match(shadowCss, /\.dashboard-content\s*\{[^}]*overflow:\s*auto/s);
  assert.match(shadowCss, /\.ai-setup-container\.card\s*\{[^}]*height:\s*clamp/s);
  assert.match(shadowCss, /--sidebar:\s*color-mix/);
  assert.match(shadowCss, /border-radius:\s*0\.875rem/);
  assert.match(shadowCss, /@media \(max-width: 860px\)/);
  assert.match(shadowCss, /height:\s*100dvh/);
  assert.match(shadowCss, /\.preferences-popover\s*\{[^}]*position:\s*fixed/s);
  assert.match(shadowCss, /\.studio-admin\.is-mobile-open \.sidebar-brand span,\s*\.studio-admin\.is-mobile-open \.quick-create span,\s*\.studio-admin\.is-mobile-open \.sidebar-menu-button span:not\(\.sidebar-badge\)\s*\{[^}]*display:\s*inline/s);
  assert.match(shadowCss, /\.studio-admin\.is-mobile-open \.quick-create\s*\{[^}]*width:\s*100%/s);
  assert.match(shadowCss, /@media \(max-width: 520px\)/);
  assert.match(shadowCss, /\.metric-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(shadowCss, /\.route-actions,\s*\.calendar-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);

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
  assert.doesNotMatch(enMessages, /"cv":\s*\{\s*"title":\s*"Software Engineer"/);
  assert.doesNotMatch(viMessages, /"cv":\s*\{\s*"title":\s*"Software Engineer"/);
});
