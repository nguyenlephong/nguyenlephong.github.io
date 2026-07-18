import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const compactSystemNodeSize = { width: 136, height: 108 };

const layeredPlatformOwnership = new Map([
  ["layer-users", "layer-client"],
  ["layer-admin", "layer-client"],
  ["layer-cdn", "layer-edge"],
  ["layer-gateway", "layer-edge"],
  ["layer-auth", "layer-edge"],
  ["layer-api", "layer-services"],
  ["layer-order", "layer-services"],
  ["layer-inventory", "layer-services"],
  ["layer-bus", "layer-services"],
  ["layer-worker", "layer-services"],
  ["layer-postgres", "layer-data"],
  ["layer-redis", "layer-data"],
  ["layer-warehouse", "layer-data"],
  ["layer-telemetry", "layer-ops"],
  ["layer-audit", "layer-ops"],
  ["layer-rollout", "layer-ops"],
  ["layer-payment", "layer-external"],
  ["layer-receipt", "layer-external"]
]);

function parseLayeredPlatformBounds(source) {
  const groups = new Map();
  const groupPattern = /platformGroupNode\("(?<id>layer-[^"]+)"[\s\S]*?\{ x: (?<x>-?\d+), y: (?<y>-?\d+) \}, \{ width: (?<width>\d+), height: (?<height>\d+) \}\)/g;
  for (const match of source.matchAll(groupPattern)) {
    const groupsData = match.groups;
    if (!groupsData) continue;
    groups.set(groupsData.id, {
      x: Number(groupsData.x),
      y: Number(groupsData.y),
      width: Number(groupsData.width),
      height: Number(groupsData.height)
    });
  }
  return groups;
}

function parseLayeredSystemNodeBounds(source) {
  const nodes = new Map();
  const nodePattern = /systemIconNode\("(?<id>layer-[^"]+)"[\s\S]*?\{ x: (?<x>-?\d+), y: (?<y>-?\d+) \}\)/g;
  for (const match of source.matchAll(nodePattern)) {
    const nodeData = match.groups;
    if (!nodeData) continue;
    nodes.set(nodeData.id, {
      x: Number(nodeData.x),
      y: Number(nodeData.y),
      width: compactSystemNodeSize.width,
      height: compactSystemNodeSize.height
    });
  }
  return nodes;
}

test("studio route is wired into routing, seo, navigation, analytics, and inventory content", async () => {
  assert.ok(existsSync("src/app/[locale]/studio/page.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioWorkspace.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioStaticOverview.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio-static-content.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioDeliverySignalChart.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioDeliverySignalFeature.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioFeatureErrorBoundary.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioFlowCanvasRuntime.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/StudioFlowCanvasFeature.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio-admin-shell.tsx"));
  assert.ok(existsSync("src/app/[locale]/studio/studio-route-catalog.ts"));
  assert.ok(existsSync("public/studio/studio-shadow.css"));
  assert.ok(!existsSync("src/app/[locale]/studio/studio.shadow-styles.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.data.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.localized-content.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.localized-workspace.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.localized-demos.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.react-flow-architecture-demo.ts"));
  assert.ok(existsSync("src/app/[locale]/studio/studio.react-flow-system-blueprint.ts"));
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
    staticOverview,
    staticContent,
    routeCatalog,
    routePrimitives,
    deliveryChart,
    deliveryFeature,
    featureBoundary,
    flowRuntime,
    flowFeature,
    flowLoader,
    adminShell,
    data,
    localizedContent,
    localizedWorkspace,
    localizedDemos,
    shadowCss,
    kitIndex,
    shadowIsland,
    kitReadme,
    architectureDemo,
    systemBlueprintDemo,
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
    readFile("src/app/[locale]/studio/StudioStaticOverview.tsx", "utf8"),
    readFile("src/app/[locale]/studio/studio-static-content.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio-route-catalog.ts", "utf8"),
    readFile("src/app/[locale]/studio/StudioRoutePrimitives.tsx", "utf8"),
    readFile("src/app/[locale]/studio/StudioDeliverySignalChart.tsx", "utf8"),
    readFile("src/app/[locale]/studio/StudioDeliverySignalFeature.tsx", "utf8"),
    readFile("src/app/[locale]/studio/StudioFeatureErrorBoundary.tsx", "utf8"),
    readFile("src/app/[locale]/studio/StudioFlowCanvasRuntime.tsx", "utf8"),
    readFile("src/app/[locale]/studio/StudioFlowCanvasFeature.tsx", "utf8"),
    readFile("src/app/[locale]/studio/studio-flow-runtime-loader.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8"),
    readFile("src/app/[locale]/studio/studio.data.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.localized-content.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.localized-workspace.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.localized-demos.ts", "utf8"),
    readFile("public/studio/studio-shadow.css", "utf8"),
    readFile("src/components/studio-kit/index.ts", "utf8"),
    readFile("src/components/studio-kit/shadow-island.tsx", "utf8"),
    readFile("src/components/studio-kit/README.md", "utf8"),
    readFile("src/app/[locale]/studio/studio.react-flow-architecture-demo.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio.react-flow-system-blueprint.ts", "utf8"),
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
  assert.doesNotMatch(analytics, /studio_blog_roadmap/);
  assert.match(analytics, /'studio_flow_group_select'/);
  assert.match(analytics, /'studio_flow_select'/);
  assert.match(analytics, /'studio_flow_example_select'/);
  assert.match(analytics, /'studio_flow_canvas_mode_change'/);
  assert.match(analytics, /'studio_flow_layout_apply'/);
  assert.match(analytics, /'studio_flow_node_select'/);
  assert.match(analytics, /'studio_flow_node_action'/);
  assert.match(analytics, /'studio_flow_history_action'/);
  assert.match(analytics, /'studio_flow_group_visibility_toggle'/);
  assert.match(analytics, /'studio_flow_board_fullscreen_toggle'/);
  assert.match(analytics, /'studio_flow_focus_toggle'/);
  assert.match(analytics, /'studio_flow_share'/);
  assert.match(tracker, /'studio'/);
  assert.match(tracker, /'studio_view'/);

  assert.match(page, /generateStaticParams/);
  assert.match(page, /generateMetadata/);
  assert.match(page, /Studio — Engineering Notes, Checklists, and System Flows/);
  assert.match(page, /Studio — Ghi chú kỹ thuật, Checklists và System Flows/);
  assert.match(page, /PageTracker page="studio" eventName="studio_view"/);
  assert.match(page, /"@type":\s*"CollectionPage"/);
  assert.match(page, /hasPart:/);
  assert.match(page, /getStudioStaticModuleHref/);
  assert.match(page, /images:\s*\[\{ url: socialImage, width: 1200, height: 630/);
  assert.match(page, /images:\s*\[socialImage\]/);
  assert.doesNotMatch(page, /"@type":\s*"HowTo"/);
  assert.doesNotMatch(page, /"@type":\s*"TechArticle"/);
  assert.doesNotMatch(page, /getLocalizedStudioNotes|getLocalizedStudioFlows/);
  assert.match(page, /StudioWorkspace/);
  assert.match(page, /data-studio-page-heading="true"/);
  assert.match(page, /<h1 className="studio-page-heading__title">\{staticContent\.title\}<\/h1>/);
  assert.match(page, /studio-route-shell/);
  assert.match(page, /<div className="studio-route-shell">/);
  assert.doesNotMatch(page, /<main className="studio-route-shell">/);
  assert.doesNotMatch(page, /body:has\(\.studio-route-shell\) \.app-nav/);
  assert.doesNotMatch(page, /body:has\(\.studio-route-shell\) \.app-footer/);
  assert.doesNotMatch(page, /studio\.css/);
  assert.doesNotMatch(page, /studio-kit\/studio-kit\.css/);

  assert.match(workspace, /^"use client"/);
  assert.match(workspace, /@\/components\/studio-kit/);
  assert.match(workspace, /ShadowIsland/);
  assert.match(workspace, /StudioAdminShell/);
  assert.match(workspace, /STUDIO_STYLESHEET_HREF = "\/studio\/studio-shadow\.css"/);
  assert.match(workspace, /stylesheetHref=\{STUDIO_STYLESHEET_HREF\}/);
  assert.doesNotMatch(workspace, /studioShadowStyles|studio\.shadow-styles/);
  assert.match(page, /fallback=\{<StudioStaticOverview locale=\{locale\} \/>\}/);
  assert.match(workspace, /fallback=\{fallback\}/);
  assert.match(workspace, /heading=\{heading\}/);
  assert.match(staticOverview, /data-studio-static-overview="true"/);
  assert.doesNotMatch(staticOverview, /<h1\b/);
  assert.match(staticOverview, /data-studio-module-link=\{module\.id\}/);
  assert.match(staticContent, /en:\s*\{/);
  assert.match(staticContent, /vi:\s*\{/);
  assert.match(staticContent, /zh:\s*\{/);
  assert.match(staticContent, /ja:\s*\{/);
  assert.match(staticContent, /ko:\s*\{/);
  assert.match(staticContent, /fr:\s*\{/);
  assert.match(adminShell, /^"use client"/);
  assert.match(adminShell, /StudioAdminShell/);
  assert.match(adminShell, /const DEFAULT_ROUTE:\s*StudioRouteId = studioCatalog\.defaultRouteId/);
  assert.doesNotMatch(adminShell, /@xyflow\/react/);
  assert.match(adminShell, /StudioFlowCanvasFeature/);
  assert.match(adminShell, /loadStudioFlowRuntime/);
  assert.match(flowFeature, /dynamic<StudioFlowCanvasRuntimeProps>/);
  assert.match(flowFeature, /StudioFeatureErrorBoundary/);
  assert.match(flowFeature, /onRetry=\{\(\) => window\.location\.reload\(\)\}/);
  assert.match(flowFeature, /Tải lại Studio/);
  assert.match(flowLoader, /import\("\.\/StudioFlowCanvasRuntime"\)/);
  assert.match(flowRuntime, /@xyflow\/react/);
  assert.match(flowRuntime, /applyNodeChanges/);
  assert.match(flowRuntime, /applyEdgeChanges/);
  assert.match(flowRuntime, /addEdge/);
  assert.match(shadowIsland, /<link[\s\S]*rel="stylesheet"[\s\S]*href=\{stylesheetHref\}/);
  assert.match(shadowIsland, /stylesheetReady\s*\?\s*children/);
  assert.match(shadowIsland, /slot="studio-loading-fallback"/);
  assert.match(shadowIsland, /data-shadow-stylesheet=\{stylesheetStatus\}/);
  assert.doesNotMatch(shadowIsland, /<style>\{styles\}<\/style>/);
  assert.doesNotMatch(shadowCss, /export const studioShadowStyles|`;/);
  assert.match(flowRuntime, /ViewportPortal/);
  assert.match(flowRuntime, /ReactFlow/);
  assert.match(flowRuntime, /MiniMap/);
  assert.match(flowRuntime, /maskStrokeColor/);
  assert.match(flowRuntime, /bgColor="var\(--flow-minimap-bg\)"/);
  assert.match(flowRuntime, /nodeColor="var\(--flow-minimap-node-fill\)"/);
  assert.match(flowRuntime, /nodeStrokeWidth=\{blueprint \? 1\.15 : 2\.6\}/);
  assert.match(flowRuntime, /nodeBorderRadius=\{blueprint \? 4 : 8\}/);
  assert.match(adminShell, /fitViewOptions/);
  assert.match(adminShell, /function buildArchitectureDemoCanvas/);
  assert.match(flowRuntime, /function StudioFlowCanvasNodeCard/);
  assert.match(adminShell, /const isBlueprintDiagram = flow\.id === "react-flow-system-blueprint"/);
  assert.match(adminShell, /isBoardFullscreen/);
  assert.match(adminShell, /studio_flow_board_fullscreen_toggle/);
  assert.match(adminShell, /studio_flow_focus_toggle/);
  assert.match(adminShell, /studio_flow_canvas_mode_change/);
  assert.match(adminShell, /studio_flow_layout_apply/);
  assert.match(adminShell, /studio_flow_node_select/);
  assert.match(adminShell, /studio_flow_node_action/);
  assert.match(adminShell, /studio_flow_history_action/);
  assert.match(adminShell, /studio_flow_group_visibility_toggle/);
  assert.match(adminShell, /flow-board-toolbar/);
  assert.match(adminShell, /flow-canvas-toolbar/);
  assert.match(adminShell, /flow-inspector-panel/);
  assert.match(flowRuntime, /flow-helper-line/);
  assert.match(adminShell, /flow-board-fullscreen-button/);
  assert.match(adminShell, /flow-chart-surface\$\{isReactFlowDemo \? " is-architecture-demo" : ""\}\$\{isBlueprintDiagram \? " is-blueprint-diagram" : ""\}\$\{isCompactDiagram \? " is-compact-diagram" : ""\}\$\{isBoardFullscreen \? " is-fullscreen" : ""\}/);
  assert.match(flowRuntime, /function renderStudioFlowNodeIcon/);
  assert.match(adminShell, /const isCompactDiagram = displayNodes\.some/);
  assert.match(adminShell, /getLayoutedStudioFlowNodes/);
  assert.match(adminShell, /getSourcePositionedStudioFlowNodes/);
  assert.match(adminShell, /getDisplayStudioFlowNodes/);
  assert.match(adminShell, /createStudioFlowSnapshot/);
  assert.match(adminShell, /cloneStudioFlowNodeForPaste/);
  assert.match(adminShell, /pointerEvents:\s*"none"/);
  assert.match(adminShell, /deleteKeyCode=\{null\}/);
  const applyLayoutBlock = adminShell.slice(
    adminShell.indexOf("const handleApplyLayout"),
    adminShell.indexOf("const handleResetBoard")
  );
  assert.match(applyLayoutBlock, /getSourcePositionedStudioFlowNodes\(current, sourceCanvas\.nodes\)/);
  assert.doesNotMatch(applyLayoutBlock, /setCanvasEdges\(cloneStudioFlowEdges\(sourceCanvas\.edges\)\)/);
  assert.match(adminShell, /!\s*selectedFlow\.architectureDemo\s*&&\s*\(/);
  assert.match(adminShell, /reactFlowExampleFamilyLabels/);
  assert.match(adminShell, /flow-example-toolbar/);
  assert.match(adminShell, /selectedViewId/);
  assert.match(routeCatalog, /routeId:\s*"flow-react-flow-architecture-demo"/);
  assert.match(routeCatalog, /routeId:\s*"flow-react-flow-system-blueprint"/);
  assert.match(adminShell, /studioCopyByLocale/);
  assert.match(adminShell, /getStudioCopy/);
  assert.match(adminShell, /getLocalizedRouteDefinitions/);
  assert.match(adminShell, /navLabel:\s*"Studio cá nhân của Nguyễn Lê Phong"/);
  assert.match(adminShell, /navLabel:\s*"个人 Studio"/);
  assert.match(adminShell, /navLabel:\s*"パーソナル Studio"/);
  assert.match(adminShell, /navLabel:\s*"개인 Studio"/);
  assert.match(adminShell, /navLabel:\s*"Studio personnel"/);
  assert.match(adminShell, /studio-sidebar/);
  assert.match(adminShell, /studio-topbar/);
  assert.match(routePrimitives, /metric-grid/);
  assert.match(adminShell, /<span>Studio<\/span>/);
  assert.match(adminShell, /Search Studio/);
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
  const navGroupsBlock = routeCatalog.slice(
    routeCatalog.indexOf("export const studioNavCatalog"),
    routeCatalog.indexOf("export type StudioPublicModuleRouteId")
  );
  assert.match(navGroupsBlock, /label:\s*"Personal Studio"/);
  assert.match(navGroupsBlock, /title:\s*"Welcome"/);
  assert.match(navGroupsBlock, /routeId:\s*"welcome"/);
  assert.match(navGroupsBlock, /title:\s*"AI Setup"/);
  assert.match(navGroupsBlock, /routeId:\s*"ai-agent-setup"/);
  assert.match(navGroupsBlock, /title:\s*"AI Skills"/);
  assert.match(navGroupsBlock, /routeId:\s*"ai-skills"/);
  assert.match(navGroupsBlock, /title:\s*"Checklists"/);
  assert.match(navGroupsBlock, /routeId:\s*"delivery-checklists"/);
  assert.doesNotMatch(navGroupsBlock, /Blog Roadmap/);
  assert.doesNotMatch(navGroupsBlock, /blog-roadmap/);
  assert.match(navGroupsBlock, /title:\s*"Flow Menu"/);
  assert.match(navGroupsBlock, /routeId:\s*"flow-react-flow-architecture-demo"/);
  assert.match(navGroupsBlock, /title:\s*"Example"/);
  assert.match(navGroupsBlock, /routeId:\s*"flow-react-flow-system-blueprint"/);
  assert.match(navGroupsBlock, /title:\s*"Blueprint"/);
  assert.doesNotMatch(navGroupsBlock, /subItems:\s*studioFlows\.map/);
  assert.doesNotMatch(navGroupsBlock, /flowRouteId\(flow\.id\)/);
  assert.doesNotMatch(navGroupsBlock, /System Design Interview Flow/);
  assert.doesNotMatch(navGroupsBlock, /AI-Assisted Delivery Flow/);
  assert.doesNotMatch(navGroupsBlock, /Communication/);
  assert.doesNotMatch(navGroupsBlock, /title:\s*"Email"/);
  assert.doesNotMatch(navGroupsBlock, /title:\s*"Chat"/);
  assert.doesNotMatch(navGroupsBlock, /Dashboards/);
  assert.doesNotMatch(navGroupsBlock, /Calendar/);
  assert.doesNotMatch(navGroupsBlock, /Kanban/);
  assert.doesNotMatch(navGroupsBlock, /Invoice/);
  assert.doesNotMatch(navGroupsBlock, /Authentication/);
  assert.doesNotMatch(navGroupsBlock, /Legacy/);
  assert.match(adminShell, /studioCatalog\.navGroups\.map/);
  assert.match(adminShell, /"crm"/);
  assert.match(adminShell, /"finance"/);
  assert.match(adminShell, /"analytics"/);
  assert.match(adminShell, /"email"/);
  assert.match(adminShell, /"ai-agent-setup"/);
  assert.match(adminShell, /"ai-skills"/);
  assert.match(adminShell, /"delivery-checklists"/);
  assert.match(adminShell, /"welcome"/);
  assert.doesNotMatch(adminShell, /"blog-roadmap"/);
  assert.match(adminShell, /"flow-system-design"/);
  assert.match(adminShell, /"flow-architecture-decision"/);
  assert.match(adminShell, /"flow-incident-response"/);
  assert.match(adminShell, /"flow-release-readiness"/);
  assert.match(adminShell, /"flow-ai-delivery"/);
  assert.match(adminShell, /"flow-portfolio-story"/);
  assert.match(adminShell, /"flow-react-flow-architecture-demo"/);
  assert.match(adminShell, /"flow-react-flow-system-blueprint"/);
  assert.match(adminShell, /"auth-login-v1"/);
  assert.match(adminShell, /function MailRoutePage/);
  assert.match(adminShell, /function ChatRoutePage/);
  assert.match(adminShell, /function AiAgentSetupPage/);
  assert.match(adminShell, /function AiSkillsPage/);
  assert.match(adminShell, /className="skill-filter-control"/);
  assert.match(adminShell, /className="skill-use-case"/);
  assert.doesNotMatch(adminShell, /className="skill-side-pane"/);
  assert.match(adminShell, /function DeliveryChecklistsPage/);
  assert.match(adminShell, /function WelcomePage/);
  assert.doesNotMatch(adminShell, /function BlogRoadmapPage/);
  assert.match(adminShell, /function StudioFlowChart/);
  assert.match(adminShell, /function StudioFlowMenuPage/);
  assert.match(adminShell, /title:\s*"Email"/);
  assert.match(adminShell, /title:\s*"Chat"/);
  assert.match(adminShell, /title:\s*"AI Agent Setup"/);
  assert.match(adminShell, /title:\s*"AI Skills"/);
  assert.match(adminShell, /title:\s*"Delivery Checklists"/);
  assert.match(adminShell, /title:\s*"Welcome"/);
  assert.match(adminShell, /title:\s*"System Design Flow"/);
  assert.match(adminShell, /"flow-react-flow-architecture-demo":\s*"React Flow Examples"/);
  assert.match(adminShell, /"flow-react-flow-system-blueprint":\s*"System Blueprint"/);
  assert.match(adminShell, /chartLabel:\s*"Flow chart"/);
  assert.match(adminShell, /Read from left to right/);
  assert.match(adminShell, /Đọc từ trái sang phải/);
  assert.doesNotMatch(adminShell, /Mail preview/);
  assert.doesNotMatch(adminShell, /Chat preview/);
  assert.match(adminShell, /data-studio-module="mail"/);
  assert.match(adminShell, /data-studio-module="chat"/);
  assert.match(adminShell, /data-studio-module="ai-agent-setup"/);
  assert.match(adminShell, /data-studio-module="ai-skills"/);
  assert.match(adminShell, /data-studio-module="delivery-checklists"/);
  assert.match(adminShell, /data-studio-module="welcome"/);
  assert.doesNotMatch(adminShell, /data-studio-module="blog-roadmap"/);
  assert.match(adminShell, /data-studio-module="flow-menu"/);
  assert.match(adminShell, /studio_ai_skill_select/);
  assert.match(adminShell, /studio_ai_skill_copy/);
  assert.match(adminShell, /studio_checklist_select/);
  assert.match(adminShell, /studio_checklist_copy/);
  assert.match(adminShell, /studio_checklist_item_toggle/);
  assert.doesNotMatch(adminShell, /studio_blog_roadmap/);
  assert.match(adminShell, /studio_flow_group_select/);
  assert.match(adminShell, /studio_flow_select/);
  assert.match(adminShell, /studio_flow_example_select/);
  assert.match(adminShell, /studio_flow_canvas_mode_change/);
  assert.match(adminShell, /studio_flow_layout_apply/);
  assert.match(adminShell, /studio_flow_node_select/);
  assert.match(adminShell, /studio_flow_node_action/);
  assert.match(adminShell, /studio_flow_history_action/);
  assert.match(adminShell, /studio_flow_group_visibility_toggle/);
  assert.match(adminShell, /studio_flow_board_fullscreen_toggle/);
  assert.match(adminShell, /studio_flow_focus_toggle/);
  assert.match(adminShell, /studio_flow_share/);
  assert.match(adminShell, /studioMails/);
  assert.match(adminShell, /studioConversations/);
  assert.match(adminShell, /studioFolders/);
  assert.match(adminShell, /studioNotes/);
  assert.match(adminShell, /studioAiSkills/);
  assert.match(adminShell, /studioWorkflowChecklists/);
  assert.match(adminShell, /studioFlowGroups/);
  assert.match(adminShell, /studioFlows/);
  assert.doesNotMatch(adminShell, /blogRoadmapTopics/);
  assert.match(adminShell, /getLocalizedStudioAiSkills/);
  assert.match(adminShell, /getLocalizedStudioWorkflowChecklists/);
  assert.doesNotMatch(adminShell, /getLocalizedBlogRoadmap/);
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
  assert.match(adminShell, /StudioDeliverySignalFeature/);
  assert.doesNotMatch(adminShell, /from "recharts"/);
  assert.match(deliveryFeature, /dynamic\(\(\) => import\("\.\/StudioDeliverySignalChart"\)/);
  assert.match(deliveryFeature, /StudioFeatureErrorBoundary/);
  assert.match(deliveryFeature, /Tải lại Studio/);
  assert.match(deliveryFeature, /onRetry=\{\(\) => window\.location\.reload\(\)\}/);
  assert.match(deliveryFeature, /onClick=\{retry\}/);
  assert.match(featureBoundary, /getDerivedStateFromError/);
  assert.match(featureBoundary, /this\.props\.onRetry\(\)/);
  assert.doesNotMatch(featureBoundary, /attempt/);
  assert.match(deliveryChart, /from "recharts"/);
  assert.match(deliveryChart, /ResponsiveContainer/);
  assert.match(deliveryChart, /ComposedChart/);
  assert.match(deliveryChart, /releaseSignalChartData/);
  assert.match(deliveryChart, /rolloutVolume/);
  assert.match(deliveryChart, /platformHealth/);
  assert.match(deliveryChart, /incidentNoise/);
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
  assert.match(shadowIsland, /fallback\s*=\s*null/);
  assert.match(shadowIsland, /:\s*fallback\}/);
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
    "welcome-route",
    "welcome-shell",
    "welcome-intro",
    "welcome-shortcut-grid",
    "welcome-link-grid",
    "checklist-workbench",
    "checklist-index-pane",
    "checklist-reader-pane",
    "checklist-section-card",
    "flow-workbench",
    "flow-index-pane",
    "flow-reader-pane",
    "flow-side-pane",
    "flow-canvas-shell",
    "flow-canvas-toolbar",
    "flow-inspector-panel",
    "flow-helper-line",
    "flow-group-visibility",
    "flow-react-surface",
    "flow-react-canvas",
    "flow-react-node",
    "flow-chart-surface",
    "flow-chart-outcome",
    "flow-step-map",
    "flow-step-node",
    "preferences-popover"
  ]) {
    assert.match(shadowCss, new RegExp(`\\.${expectedClass}\\b`));
  }
  assert.match(shadowCss, /\.chart-legend\.interactive\b/);
  assert.match(shadowCss, /\.react-flow__container\b/);
  assert.match(shadowCss, /\.react-flow__controls\b/);
  assert.match(shadowCss, /\.react-flow__minimap\b/);
  assert.match(shadowCss, /--flow-minimap-bg/);
  assert.match(shadowCss, /--flow-minimap-node-fill/);
  assert.match(shadowCss, /--flow-minimap-node-stroke/);
  assert.match(shadowCss, /\.flow-board-toolbar\b/);
  assert.match(shadowCss, /\.flow-canvas-toolbar\b/);
  assert.match(shadowCss, /\.flow-canvas-shell\b/);
  assert.match(shadowCss, /\.flow-inspector-panel\b/);
  assert.match(shadowCss, /\.flow-helper-line\.is-vertical\b/);
  assert.match(shadowCss, /\.flow-helper-line\.is-horizontal\b/);
  assert.doesNotMatch(shadowCss, /\.flow-minimap-overlay\b/);
  assert.match(shadowCss, /\.flow-example-toolbar\b/);
  assert.doesNotMatch(shadowCss, /\.flow-example-notes\b/);
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
  assert.match(shadowCss, /\.flow-react-node--system\b/);
  assert.match(shadowCss, /\.flow-react-node\.is-compact\b/);
  assert.match(shadowCss, /\.flow-react-node\.is-selected\b/);
  assert.match(shadowCss, /\.flow-react-node\.is-collapsed\b/);
  assert.match(shadowCss, /\.flow-react-node\.is-scratch\b/);
  assert.match(shadowCss, /\.flow-react-node-icon\b/);
  assert.match(shadowCss, /\.flow-react-surface\.is-edit-mode \.react-flow__handle\b/);
  assert.match(shadowCss, /\.flow-react-surface\.is-architecture-demo\b/);
  assert.match(shadowCss, /\.flow-react-surface\.is-architecture-demo\.is-blueprint-diagram\b/);
  assert.match(shadowCss, /\.flow-react-surface\.is-compact-diagram\b/);
  assert.match(shadowCss, /\.sidebar-brand-mark\b/);
  assert.match(shadowCss, /\.sidebar-badge\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(shadowCss, /\.flow-board-toolbar\b/);
  assert.match(shadowCss, /--flow-minimap-bg/);
  assert.match(shadowCss, /\.flow-chart-surface\.is-architecture-demo\s*\{[^}]*border:\s*1px solid[^}]*background:[^}]*linear-gradient[^}]*padding:\s*0\.85rem/s);
  assert.match(shadowCss, /\.flow-layout-presets\b/);
  assert.match(shadowCss, /\.flow-trail-panel\b/);
  assert.match(shadowCss, /\.flow-relation-map\b/);
  assert.match(shadowCss, /\.react-flow__edge\.is-dimmed\b/);
  assert.match(shadowCss, /\.flow-chart-surface\.is-fullscreen\s*\{[^}]*position:\s*fixed;[^}]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/s);
  assert.match(shadowCss, /\.flow-board-fullscreen-button\b/);
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
  assert.match(shadowCss, /\.skill-library-workbench\.card\s*\{[^}]*grid-template-columns:\s*minmax\(21rem,\s*0\.34fr\) minmax\(0,\s*1fr\);[^}]*height:\s*clamp/s);
  assert.match(shadowCss, /\.checklist-workbench\.card\s*\{[^}]*grid-template-columns:\s*18rem minmax\(0,\s*1fr\) 18rem;[^}]*height:\s*clamp/s);
  assert.match(shadowCss, /\.flow-workbench\.card\s*\{[^}]*grid-template-columns:\s*19rem minmax\(0,\s*1fr\) 19rem/s);
  assert.match(shadowCss, /\.flow-workbench\.card\.is-architecture-demo\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none/s);
  assert.match(shadowCss, /\.flow-workbench\.card\.is-architecture-demo \.flow-reader-pane\s*\{[^}]*overflow:\s*visible;[^}]*padding:\s*0/s);
  assert.match(shadowCss, /\.welcome-shell\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.95fr\) minmax\(21rem,\s*0\.78fr\)/s);
  assert.match(shadowCss, /\.welcome-intro::before\s*\{[^}]*linear-gradient\(90deg,\s*#16a34a,\s*#0ea5e9,\s*#f59e0b\)/s);
  assert.doesNotMatch(shadowCss, /blog-roadmap|roadmap-topic|roadmap-day/);
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
    "Machine bootstrap",
    "My AI Working System",
    "Engineering Foundations for AI-Assisted Work",
    "System Engineering Roadmap for AI-Assisted Work",
    "Antigravity Awesome Skills",
    "Open Design",
    "Computer setup",
    "Terminal setup",
    "Multi-agent AI",
    "OpenHands",
    "CrewAI",
    "npx antigravity-awesome-skills",
    "https://github.com/sickn33/antigravity-awesome-skills",
    "od mcp install codex",
    "Code Review",
    "Frontend Architecture",
    "Backend Architecture",
    "Technical Writing",
    "Prompt Design",
    "Executive Status Reporting",
    "Technical Specification & RFC",
    "AI Workflow Design",
    "Continuous AI Learning",
    "Source-Grounded Knowledge Extraction",
    "AI-Assisted Delivery & CI/CD",
    "Adversarial Design Review",
    "Architecture Decision Mapping",
    "Architecture Risk Audit",
    "Skill Library Inventory",
    "From Ticket to First Commit",
    "Engineering Delivery Checklist",
    "Production Systems Practice Project",
    "Create a New Module",
    "Release Readiness",
    "Rollout Plan",
    "Daily AI Practice Loop",
    "Weekly AI Workflow Review",
    "AI Tool Routing Guide",
    "90-Day AI Practice Plan",
    "React Flow Pattern Library",
    "Architecture Decision Flow",
    "Production Incident Flow",
    "Release Readiness Flow",
    "AI-Assisted Delivery Flow",
    "Portfolio Story Flow",
    "System Design Blueprint"
  ]) {
    assert.match(data, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(data, /architectureDemo:\s*reactFlowArchitectureDemo/);
  assert.match(data, /architectureDemo:\s*reactFlowSystemBlueprintDemo/);
  assert.match(data, /flowIds:\s*\["react-flow-architecture-demo", "react-flow-system-blueprint"\]/);

  for (const expected of [
    "getLocalizedStudioAiSkills",
    "getLocalizedStudioWorkflowChecklists",
    "Rà soát mã nguồn",
    "tính đúng đắn trước",
    "Kiến trúc frontend",
    "Kiến trúc backend",
    "Viết nội dung kỹ thuật",
    "Thiết kế prompt",
    "Báo cáo tiến độ và vận hành",
    "Hệ thống làm việc với AI",
    "Đánh giá sản phẩm AI",
    "Bảo mật, quyền riêng tư và mô hình đe dọa",
    "Danh sách kiểm tra khi giao phần mềm",
    "Lộ trình kỹ thuật hệ thống với AI",
    "Vòng học AI hằng ngày",
    "getLocalizedStudioFlows",
    "getLocalizedStudioFlowGroups",
    "Quy trình thiết kế hệ thống",
    "Quy trình ra quyết định kiến trúc",
    "Quy trình xử lý sự cố",
    "Quy trình AI-assisted Delivery",
    "Bộ ví dụ React Flow",
    "Bản thiết kế hệ thống bằng React Flow",
    "isVietnameseLocale"
  ]) {
    assert.match(localizedContent, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const expected of [
    "Chuẩn bị máy mới",
    "Cách tôi phối hợp các công cụ AI",
    "Nền tảng kỹ thuật khi làm việc cùng AI",
    "Lộ trình kỹ thuật hệ thống khi làm việc cùng AI",
    "Thiết lập máy tính",
    "Thiết lập dòng lệnh",
    "Multi-agent AI",
    "getLocalizedStudioFolders",
    "getLocalizedStudioNotes"
  ]) {
    assert.match(localizedWorkspace, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const expected of [
    "getLocalizedStudioDemoFlows",
    "locale.toLowerCase().split",
    "Sơ đồ dày thông tin theo phong cách production",
    "title: localized?.title ?? node.title",
    "title: localized?.title ?? view.title",
    "label: copy.edges[edge.id] ?? edge.label"
  ]) {
    assert.match(localizedDemos, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(localizedContent, /title:\s*"Design system và chất lượng UI"/);
  assert.match(localizedContent, /tags:\s*\["Design system", "UI", "Accessibility", "Responsive"\]/);

  assert.doesNotMatch(adminShell, /Đây là nơi em gom/);
  assert.doesNotMatch(adminShell, /Tìm AI setup/);
  assert.doesNotMatch(adminShell, /Studio Admin dashboard/);
  assert.doesNotMatch(adminShell, /Container đầu tiên cho research/);

  for (const expected of [
    "Built-in primitives",
    "React Flow example families",
    "Software architecture nodes",
    "Edge language",
    "Canvas controls",
    "Feature overview",
    "Subflows and grouping",
    "Dagre-style tree",
    "Expand and collapse",
    "Validation and helper lines",
    "Whiteboard annotation",
    "Styling and theming",
    "Software architecture service map",
    "System design icon map",
    "Layered platform icon map",
    "Event-driven architecture",
    "Deployment topology",
    "Data lineage",
    "views: reactFlowViews",
    "defaultViewId",
    "system-design-icon-map",
    "layered-platform-icon-map",
    "systemIconNode",
    "platformGroupNode",
    "Client platform",
    "Service platform",
    "Data platform",
    "External boundary",
    "input",
    "default",
    "output",
    "group",
    "system",
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
    "Postgres",
    "Payment API",
    "External SaaS",
    "Rollback plan",
    "compact: true",
    "animated publish"
  ]) {
    assert.match(architectureDemo, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const expected of [
    "reactFlowSystemBlueprintDemo",
    "Full system blueprint",
    "DNS resolution",
    "Client request and edge policy",
    "Load balancing and runtime",
    "Coordination primitives",
    "Databases and cache",
    "Upload media pipeline",
    "Common fan-out services",
    "Recursive resolver",
    "Authoritative NS",
    "API Gateway",
    "Load Balancer",
    "Backend cluster",
    "Object Storage",
    "Processing Workers",
    "Message Queue",
    "Notification Service",
    "Payment Charge",
    "animated: true",
    "defaultViewId: \"blueprint-full\""
  ]) {
    assert.match(systemBlueprintDemo, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const platformBounds = parseLayeredPlatformBounds(architectureDemo);
  const layeredNodeBounds = parseLayeredSystemNodeBounds(architectureDemo);
  for (const [nodeId, platformId] of layeredPlatformOwnership) {
    const node = layeredNodeBounds.get(nodeId);
    const platform = platformBounds.get(platformId);
    assert.ok(node, `missing layered icon node ${nodeId}`);
    assert.ok(platform, `missing layered platform wrapper ${platformId}`);
    assert.ok(node.x >= platform.x, `${nodeId} exceeds ${platformId} left boundary`);
    assert.ok(node.y >= platform.y, `${nodeId} exceeds ${platformId} top boundary`);
    assert.ok(node.x + node.width <= platform.x + platform.width, `${nodeId} exceeds ${platformId} right boundary`);
    assert.ok(node.y + node.height <= platform.y + platform.height, `${nodeId} exceeds ${platformId} bottom boundary`);
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
