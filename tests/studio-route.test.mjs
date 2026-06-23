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
  assert.ok(existsSync("src/app/[locale]/studio/studio.react-flow-architecture-demo.ts"));
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
    localizedContent,
    shadowCss,
    kitIndex,
    shadowIsland,
    kitReadme,
    architectureDemo,
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
    readFile("src/app/[locale]/studio/studio.localized-content.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.shadow-styles.ts", "utf8"),
    readFile("src/components/studio-kit/index.ts", "utf8"),
    readFile("src/components/studio-kit/shadow-island.tsx", "utf8"),
    readFile("src/components/studio-kit/README.md", "utf8"),
    readFile("src/app/[locale]/studio/studio.react-flow-architecture-demo.ts", "utf8"),
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
  assert.match(analytics, /'studio_blog_roadmap_topic_select'/);
  assert.match(analytics, /'studio_blog_roadmap_status_filter'/);
  assert.match(analytics, /'studio_blog_roadmap_day_select'/);
  assert.match(analytics, /'studio_blog_roadmap_ticket_action'/);
  assert.match(analytics, /'studio_flow_group_select'/);
  assert.match(analytics, /'studio_flow_select'/);
  assert.match(analytics, /'studio_flow_share'/);
  assert.match(tracker, /'studio'/);
  assert.match(tracker, /'studio_view'/);

  assert.match(page, /generateStaticParams/);
  assert.match(page, /generateMetadata/);
  assert.match(page, /PageTracker page="studio" eventName="studio_view"/);
  assert.match(page, /"@type":\s*"HowTo"/);
  assert.match(page, /flow-\$\{flow\.id\}/);
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
  assert.match(adminShell, /@xyflow\/react/);
  assert.match(adminShell, /ReactFlow/);
  assert.match(adminShell, /MiniMap/);
  assert.match(adminShell, /fitViewOptions/);
  assert.match(adminShell, /function buildArchitectureDemoCanvas/);
  assert.match(adminShell, /function StudioFlowCanvasNodeCard/);
  assert.match(adminShell, /studioCopyByLocale/);
  assert.match(adminShell, /getStudioCopy/);
  assert.match(adminShell, /getLocalizedRouteDefinitions/);
  assert.match(adminShell, /navLabel:\s*"Studio cá nhân"/);
  assert.match(adminShell, /navLabel:\s*"个人 Studio"/);
  assert.match(adminShell, /navLabel:\s*"パーソナル Studio"/);
  assert.match(adminShell, /navLabel:\s*"개인 Studio"/);
  assert.match(adminShell, /navLabel:\s*"Studio personnel"/);
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
  assert.match(navGroupsBlock, /title:\s*"AI Skills"/);
  assert.match(navGroupsBlock, /routeId:\s*"ai-skills"/);
  assert.match(navGroupsBlock, /title:\s*"Checklists"/);
  assert.match(navGroupsBlock, /routeId:\s*"delivery-checklists"/);
  assert.match(navGroupsBlock, /title:\s*"Blog Roadmap"/);
  assert.match(navGroupsBlock, /routeId:\s*"blog-roadmap"/);
  assert.match(navGroupsBlock, /title:\s*"Flow Menu"/);
  assert.match(navGroupsBlock, /subItems:\s*studioFlows\.map/);
  assert.match(navGroupsBlock, /flowRouteId\(flow\.id\)/);
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
  assert.match(adminShell, /"ai-skills"/);
  assert.match(adminShell, /"delivery-checklists"/);
  assert.match(adminShell, /"blog-roadmap"/);
  assert.match(adminShell, /"flow-system-design"/);
  assert.match(adminShell, /"flow-architecture-decision"/);
  assert.match(adminShell, /"flow-incident-response"/);
  assert.match(adminShell, /"flow-release-readiness"/);
  assert.match(adminShell, /"flow-ai-delivery"/);
  assert.match(adminShell, /"flow-portfolio-story"/);
  assert.match(adminShell, /"flow-react-flow-architecture-demo"/);
  assert.match(adminShell, /"auth-login-v1"/);
  assert.match(adminShell, /function MailRoutePage/);
  assert.match(adminShell, /function ChatRoutePage/);
  assert.match(adminShell, /function AiAgentSetupPage/);
  assert.match(adminShell, /function AiSkillsPage/);
  assert.match(adminShell, /function DeliveryChecklistsPage/);
  assert.match(adminShell, /function BlogRoadmapPage/);
  assert.match(adminShell, /function StudioFlowChart/);
  assert.match(adminShell, /function StudioFlowMenuPage/);
  assert.match(adminShell, /title:\s*"Email"/);
  assert.match(adminShell, /title:\s*"Chat"/);
  assert.match(adminShell, /title:\s*"AI Agent Setup"/);
  assert.match(adminShell, /title:\s*"AI Skills"/);
  assert.match(adminShell, /title:\s*"Delivery Checklists"/);
  assert.match(adminShell, /title:\s*"Blog Roadmap"/);
  assert.match(adminShell, /title:\s*"System Design Flow"/);
  assert.match(adminShell, /"flow-react-flow-architecture-demo":\s*"React Flow Demo"/);
  assert.match(adminShell, /chartLabel:\s*"Flow chart"/);
  assert.match(adminShell, /Read the path from left to right/);
  assert.match(adminShell, /chartLabel:\s*"Sơ đồ flow"/);
  assert.match(adminShell, /Đọc từ trái sang phải/);
  assert.doesNotMatch(adminShell, /Mail preview/);
  assert.doesNotMatch(adminShell, /Chat preview/);
  assert.match(adminShell, /data-studio-module="mail"/);
  assert.match(adminShell, /data-studio-module="chat"/);
  assert.match(adminShell, /data-studio-module="ai-agent-setup"/);
  assert.match(adminShell, /data-studio-module="ai-skills"/);
  assert.match(adminShell, /data-studio-module="delivery-checklists"/);
  assert.match(adminShell, /data-studio-module="blog-roadmap"/);
  assert.match(adminShell, /data-studio-module="flow-menu"/);
  assert.match(adminShell, /studio_ai_skill_select/);
  assert.match(adminShell, /studio_ai_skill_copy/);
  assert.match(adminShell, /studio_checklist_select/);
  assert.match(adminShell, /studio_checklist_copy/);
  assert.match(adminShell, /studio_checklist_item_toggle/);
  assert.match(adminShell, /studio_blog_roadmap_topic_select/);
  assert.match(adminShell, /studio_blog_roadmap_status_filter/);
  assert.match(adminShell, /studio_blog_roadmap_day_select/);
  assert.match(adminShell, /studio_blog_roadmap_ticket_action/);
  assert.match(adminShell, /studio_flow_group_select/);
  assert.match(adminShell, /studio_flow_select/);
  assert.match(adminShell, /studio_flow_share/);
  assert.match(adminShell, /handleStatusFilterChange/);
  assert.match(adminShell, /studioMails/);
  assert.match(adminShell, /studioConversations/);
  assert.match(adminShell, /studioFolders/);
  assert.match(adminShell, /studioNotes/);
  assert.match(adminShell, /studioAiSkills/);
  assert.match(adminShell, /studioWorkflowChecklists/);
  assert.match(adminShell, /studioFlowGroups/);
  assert.match(adminShell, /studioFlows/);
  assert.match(adminShell, /blogRoadmapTopics/);
  assert.match(adminShell, /getLocalizedStudioAiSkills/);
  assert.match(adminShell, /getLocalizedStudioWorkflowChecklists/);
  assert.match(adminShell, /getLocalizedBlogRoadmapTopics/);
  assert.match(adminShell, /getLocalizedBlogRoadmapTicketChecklist/);
  assert.match(adminShell, /getLocalizedStudioFlowGroups/);
  assert.match(adminShell, /getLocalizedStudioFlows/);
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
    "skill-library-workbench",
    "skill-index-pane",
    "skill-reader-pane",
    "skill-markdown-preview",
    "checklist-workbench",
    "checklist-index-pane",
    "checklist-reader-pane",
    "checklist-section-card",
    "flow-workbench",
    "flow-index-pane",
    "flow-reader-pane",
    "flow-side-pane",
    "flow-react-surface",
    "flow-react-canvas",
    "flow-react-node",
    "flow-chart-surface",
    "flow-chart-outcome",
    "flow-step-map",
    "flow-step-node",
    "blog-roadmap-workbench",
    "roadmap-topic-pane",
    "roadmap-plan-pane",
    "roadmap-detail-pane",
    "roadmap-day-grid",
    "preferences-popover"
  ]) {
    assert.match(shadowCss, new RegExp(`\\.${expectedClass}\\b`));
  }
  assert.match(shadowCss, /\.chart-legend\.interactive\b/);
  assert.match(shadowCss, /\.react-flow__container\b/);
  assert.match(shadowCss, /\.react-flow__controls\b/);
  assert.match(shadowCss, /\.react-flow__minimap\b/);
  assert.match(shadowCss, /\.flow-react-node--hub\b/);
  assert.match(shadowCss, /\.flow-react-node--group\b/);
  assert.match(shadowCss, /\.flow-react-node--gateway\b/);
  assert.match(shadowCss, /\.flow-react-node--database\b/);
  assert.match(shadowCss, /\.flow-react-node--queue\b/);
  assert.match(shadowCss, /\.flow-react-node--topic\b/);
  assert.match(shadowCss, /\.flow-react-node--cache\b/);
  assert.match(shadowCss, /\.flow-react-node--external\b/);
  assert.match(shadowCss, /\.flow-react-node--decision\b/);
  assert.match(shadowCss, /\.flow-react-node--risk\b/);
  assert.match(shadowCss, /\.flow-react-surface\.is-architecture-demo\b/);
  assert.match(shadowCss, /\.flow-chart-surface\s*\{[^}]*flex:\s*0 0 auto/s);
  assert.doesNotMatch(shadowCss, /\.activity-chart\b/);
  assert.doesNotMatch(shadowCss, /\.chart-bar\b/);
  assert.match(packageJson, /"recharts":/);
  assert.match(packageJson, /"@xyflow\/react":/);
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
  assert.match(shadowCss, /\.skill-library-workbench\.card,[\s\S]*?\.checklist-workbench\.card\s*\{[^}]*height:\s*clamp/s);
  assert.match(shadowCss, /\.flow-workbench\.card\s*\{[^}]*grid-template-columns:\s*19rem minmax\(0,\s*1fr\) 19rem/s);
  assert.match(shadowCss, /\.flow-workbench\.card\.is-architecture-demo\s*\{[^}]*grid-template-columns:\s*15rem minmax\(0,\s*1fr\) 15rem/s);
  assert.match(shadowCss, /\.blog-roadmap-workbench\.card\s*\{[^}]*grid-template-columns:\s*18rem minmax\(0,\s*1fr\) 20rem/s);
  assert.match(shadowCss, /\.roadmap-day-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(shadowCss, /@media \(max-width: 1480px\)\s*\{[\s\S]*?\.blog-roadmap-workbench\.card\s*\{[^}]*height:\s*auto;[^}]*overflow:\s*visible/s);
  assert.match(shadowCss, /@media \(max-width: 1480px\)\s*\{[\s\S]*?\.skill-library-workbench\.card,[\s\S]*?\.checklist-workbench\.card,[\s\S]*?\.flow-workbench\.card\s*\{[^}]*grid-template-columns:\s*minmax\(15rem,\s*0\.34fr\) minmax\(0,\s*1fr\)/s);
  assert.match(shadowCss, /\.route-heading \.outline-button,[\s\S]*?\.skill-reader-head \.outline-button\s*\{[^}]*min-width:\s*max-content/s);
  assert.match(shadowCss, /@media \(max-width: 1080px\)/);
  assert.match(shadowCss, /@media \(max-width: 1080px\)\s*\{[\s\S]*?\.skill-side-pane,[\s\S]*?\.checklist-side-pane,[\s\S]*?\.flow-side-pane\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(shadowCss, /\.flow-step-node dl\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(shadowCss, /\.studio-flow-route \.flow-reader-pane\s*\{[^}]*order:\s*1/s);
  assert.match(shadowCss, /\.studio-flow-route \.flow-index-pane\s*\{[^}]*order:\s*3/s);
  assert.match(shadowCss, /\.studio-admin\.is-mobile-open \.studio-sidebar\s*\{[^}]*width:\s*min\(22rem,\s*calc\(100vw - 1rem\)\)/s);
  assert.match(shadowCss, /@media \(max-width: 640px\)\s*\{[\s\S]*?\.metric-grid,\s*\.route-actions/s);
  assert.match(shadowCss, /\.studio-flow-route \.metric-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
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
    "AI Operating System",
    "Daily direction for using NotebookLM, GPT, Claude, Codex, and Antigravity as one system.",
    "NotebookLM keeps source-backed truth",
    "AI-Driven Engineering Foundation",
    "Daily roadmap for technical decision-making from task intake to production operation.",
    "Seven layers from task to production",
    "Production readiness prompt",
    "Morning planning prompt",
    "Weekly command center prompt",
    "Codex",
    "Claude",
    "Antigravity",
    "Gemini",
    "Open Design",
    "npx antigravity-awesome-skills",
    "https://github.com/sickn33/antigravity-awesome-skills",
    "od mcp install codex",
    "od mcp install antigravity",
    "Code Review Skill",
    "Code Shape Review",
    "Data structures",
    "Strategy for replaceable rules",
    "Clean architecture",
    "Service boundaries",
    "Utility extraction",
    "Frontend Architecture Skill",
    "Backend Architecture Skill",
    "Blog Content Writer Skill",
    "Prompt Writing Skill",
    "Status Report Skill",
    "Doc / Spec / Tech Spec Skill",
    "Proposal / Slide / Pitch Deck Skill",
    "AI Operating System Skill",
    "Daily AI Learning Coach Skill",
    "NotebookLM Source Of Truth Skill",
    "AI Delivery Factory Skill",
    "Claude Deep Review Skill",
    "Career AI Strategy Skill",
    "Engineering Decision Map Skill",
    "Staff Engineer AI Review Pack Skill",
    "Data, Resilience, Observability Review Skill",
    "Ticket intake to first commit",
    "AI-driven engineering foundation roadmap",
    "Engineering delivery checklist",
    "Senior engineer reflex",
    "Capstone production project",
    "AI system engineering roadmap",
    "SDLC ownership",
    "Distributed architecture and resilience",
    "Large-scale storage",
    "B-Tree and LSM-Tree",
    "AI-Driven System Engineering Roadmap",
    "AI-first elicitation prompt",
    "Circuit Breaker",
    "Event Sourcing",
    "OpenTelemetry",
    "Create a new module",
    "Release readiness",
    "Rollout plan",
    "Roll out by phase.",
    "Daily AI learning loop",
    "Weekly AI OS review",
    "AI tool routing decision tree",
    "AI-assisted feature workflow",
    "90-day AI skill plan",
    "Create five ChatGPT Projects.",
    "Create five NotebookLM notebooks.",
    "Source & Architecture",
    "Engineering Culture",
    "AI & The Future",
    "Ways of Working",
    "Perspectives & Field Notes",
    "One architecture article per day for 30 days.",
    "Module boundaries before folder names",
    "From prompts to workflows",
    "Create one focused Multica ticket per roadmap article.",
    "Architecture & System Design",
    "React Flow Library Demo",
    "React Flow Architecture Demo",
    "A React Flow showcase for software architecture diagrams",
    "Node Shapes",
    "Edge Types",
    "System Design Interview Flow",
    "Architecture Decision Flow",
    "Production Incident Flow",
    "Release Readiness Flow",
    "AI-Assisted Delivery Flow",
    "Portfolio Story Flow",
    "A product manager asks for a new partner onboarding flow.",
    "A team debates whether to add a queue for partner sync.",
    "checkout latency climbs",
    "dashboard filter with analytics and SEO changes",
    "AI agent helps with coding",
    "CV bullet, STAR answer, blog outline, or case-study draft"
  ]) {
    assert.match(data, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(data, /architectureDemo:\s*reactFlowArchitectureDemo/);
  assert.match(data, /flowIds:\s*\["react-flow-architecture-demo"\]/);

  for (const expected of [
    "getLocalizedStudioAiSkills",
    "getLocalizedStudioWorkflowChecklists",
    "getLocalizedBlogRoadmapTopics",
    "getLocalizedBlogRoadmapTicketChecklist",
    "Review thay đổi theo correctness",
    "Review data structure",
    "Review design pattern",
    "Review clean architecture",
    "application service giữ orchestration",
    "generic utility bắt đầu giữ product state",
    "Kiến trúc frontend",
    "Viết blog content",
    "Từ ticket đến commit đầu tiên",
    "Checklist delivery engineering",
    "Từ prompt sang workflow",
    "Cách review code do AI viết",
    "Xác nhận locale đang chọn",
    "getLocalizedStudioFlows",
    "getLocalizedStudioFlowGroups",
    "Flow System Design",
    "Demo thư viện React Flow",
    "Demo React Flow cho kiến trúc phần mềm",
    "onboarding đối tác",
    "release readiness",
    "support noise",
    "Catalog node shape React Flow",
    "Canvas software architecture",
    "isVietnameseLocale"
  ]) {
    assert.match(localizedContent, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const expected of [
    "Built-in primitives",
    "Software architecture nodes",
    "Edge language",
    "Canvas controls",
    "input",
    "default",
    "output",
    "group",
    "service",
    "gateway",
    "database",
    "queue",
    "topic",
    "cache",
    "worker",
    "external",
    "decision",
    "risk",
    "note",
    "straight",
    "step",
    "smoothstep",
    "simplebezier",
    "API Gateway",
    "Primary DB",
    "Event topic",
    "External SaaS",
    "Rollback plan",
    "animated publish"
  ]) {
    assert.match(architectureDemo, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const forbiddenEventNamePattern = new RegExp(
    `${["claw", "\\s*[- ]?\\s*a\\s*[- ]?\\s*thon"].join("")}|${["claw", "athon"].join("")}`,
    "i"
  );
  assert.doesNotMatch(`${adminShell}\n${data}\n${localizedContent}\n${architectureDemo}`, forbiddenEventNamePattern);

  assert.match(enMessages, /"studio":\s*"Studio"/);
  assert.match(viMessages, /"studio":\s*"Studio"/);
  assert.doesNotMatch(enMessages, /"cv":\s*\{\s*"title":\s*"Software Engineer"/);
  assert.doesNotMatch(viMessages, /"cv":\s*\{\s*"title":\s*"Software Engineer"/);
});
