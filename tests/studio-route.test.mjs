import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readSources(paths) {
  return (await Promise.all(paths.map((path) => readFile(path, "utf8")))).join("\n");
}

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


const STUDIO_DIR = "src/app/[locale]/(site)/studio";

test("studio route is wired into routing, seo, navigation, analytics, and inventory content", async () => {
  for (const file of [
    "page.tsx",
    "[module]/page.tsx",
    "opengraph-image.tsx",
    "StudioPageFrame.tsx",
    "StudioStaticOverview.tsx",
    "StudioModuleArticle.tsx",
    "StudioOpener.tsx",
    "studio.css",
    "studio-static-content.ts",
    "studio-route-catalog.ts",
    "studio-module-sources.ts",
    "studio.data.ts",
    "studio.localized-content.ts",
    "studio.localized-workspace.ts",
    "studio.localized-demos.ts",
    "studio.react-flow-architecture-demo.ts",
    "studio.react-flow-system-blueprint.ts"
  ]) {
    assert.ok(existsSync(`${STUDIO_DIR}/${file}`), file);
  }
  // The admin shell, shadow workspace, React Flow editor and lazy feature registry are gone.
  for (const removed of [
    "StudioWorkspace.tsx",
    "studio-admin-shell.tsx",
    "StudioShellChrome.tsx",
    "studio-shell-navigation.ts",
    "StudioRouteFeatureRegistry.tsx",
    "StudioFlowCanvasRuntime.tsx",
    "StudioFlowCanvasFeature.tsx",
    "studio-flow-runtime-loader.ts",
    "StudioFeatureErrorBoundary.tsx"
  ]) {
    assert.ok(!existsSync(`${STUDIO_DIR}/${removed}`), removed);
  }
  assert.ok(!existsSync("src/app/[locale]/studio"), "Studio lives under the (site) group");
  assert.ok(!existsSync("src/components/studio-kit"));
  assert.ok(!existsSync("src/app/[locale]/cv/page.tsx"));
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
    staticOverview,
    opener,
    staticContent,
    studio,
    data,
    localizedContent,
    localizedWorkspace,
    localizedDemos,
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
    readSources([
      `${STUDIO_DIR}/page.tsx`,
      `${STUDIO_DIR}/[module]/page.tsx`,
      `${STUDIO_DIR}/StudioPageFrame.tsx`,
      `${STUDIO_DIR}/studio-seo.ts`
    ]),
    readFile(`${STUDIO_DIR}/StudioStaticOverview.tsx`, "utf8"),
    readFile(`${STUDIO_DIR}/StudioOpener.tsx`, "utf8"),
    readFile(`${STUDIO_DIR}/studio-static-content.ts`, "utf8"),
    readSources([
      `${STUDIO_DIR}/StudioStaticOverview.tsx`,
      `${STUDIO_DIR}/StudioModuleArticle.tsx`,
      `${STUDIO_DIR}/studio-static-content.ts`,
      `${STUDIO_DIR}/studio-module-sources.ts`
    ]),
    readFile(`${STUDIO_DIR}/studio.data.ts`, "utf8"),
    readFile(`${STUDIO_DIR}/studio.localized-content.ts`, "utf8"),
    readFile(`${STUDIO_DIR}/studio.localized-workspace.ts`, "utf8"),
    readFile(`${STUDIO_DIR}/studio.localized-demos.ts`, "utf8"),
    readFile(`${STUDIO_DIR}/studio.react-flow-architecture-demo.ts`, "utf8"),
    readFile(`${STUDIO_DIR}/studio.react-flow-system-blueprint.ts`, "utf8"),
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
  // MEP-28: Studio is a labelled text link with a localized hint, not a bare icon.
  assert.match(footer, /title=\{t\('studioHint'\)\}/);
  assert.match(footer, /studio_footer/);
  assert.match(footer, /data-document-navigation="studio"/);
  assert.match(footer, /href=\{studioHref\}/);
  assert.doesNotMatch(footer, /<Link\s+href=\{APP_ROUTE\.STUDIO\}/);
  assert.match(seo, /studio/);
  assert.match(analytics, /'studio_view'/);
  assert.doesNotMatch(analytics, /studio_blog_roadmap|studio_flow_|studio_route_open|studio_command_/);
  assert.match(tracker, /'studio'/);
  assert.match(tracker, /'studio_view'/);

  assert.match(page, /generateStaticParams/);
  assert.match(page, /generateMetadata/);
  assert.match(staticContent, /Engineering Studio: delivery checklists and system maps/);
  assert.match(staticContent, /Engineering Studio: checklist ra bản và sơ đồ hệ thống/);
  assert.match(page, /resolveStaticPageLocalization\("studio", locale\)/);
  assert.match(page, /resolveStaticPageLocalization\(`studio\/\$\{slug as StudioPublicModuleSlug\}`, locale\)/);
  assert.match(page, /trackerContext=\{\{ studio_module: studioModule\.slug \}\}/);
  assert.match(page, /PageTracker page="studio" eventName="studio_view"/);
  assert.match(page, /"@type":\s*"CollectionPage"/);
  assert.match(page, /hasPart:/);
  assert.match(page, /getStudioStaticModuleHref/);
  // MEP-64: Studio's own card, attached with a localized alt through the static-page policy.
  assert.match(page, /buildStaticPageMetadata\(/);
  assert.doesNotMatch(page, /opengraph-image\.png/);
  assert.doesNotMatch(page, /"@type":\s*"HowTo"/);
  assert.doesNotMatch(page, /"@type":\s*"TechArticle"/);
  assert.match(page, /<StudioStaticOverview locale=\{locale\} \/>/);
  assert.match(page, /<StudioModuleArticle locale=\{locale\} module=\{studioModule\} \/>/);
  assert.match(page, /import "\.\/studio\.css"/);
  assert.doesNotMatch(page, /StudioWorkspace|ShadowIsland|studio-shadow/);

  assert.match(staticOverview, /data-studio-static-overview="true"/);
  assert.match(staticOverview, /data-studio-module-link=\{module\.id\}/);
  assert.match(staticOverview, /<main\b/);
  // One h1 per page, owned by the chapter opener.
  assert.equal(opener.match(/<h1\b/g)?.length, 1);
  assert.doesNotMatch(studio, /<h1\b/, "pages render their h1 only through StudioOpener");
  assert.match(staticContent, /en:\s*\{/);
  assert.match(staticContent, /vi:\s*\{/);
  for (const locale of ["zh", "ja", "ko", "fr"]) {
    assert.match(staticContent, new RegExp(`${locale}:\\s*"`), `${locale} fallback notice`);
  }
  assert.doesNotMatch(packageJson, /@react-pdf-viewer\/core/);
  assert.doesNotMatch(packageJson, /pdfjs-dist/);
  assert.doesNotMatch(packageJson, /"recharts":/);

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
  assert.doesNotMatch(`${studio}\n${data}\n${localizedContent}\n${architectureDemo}`, forbiddenEventNamePattern);

  assert.match(enMessages, /"studio":\s*"Studio"/);
  assert.match(viMessages, /"studio":\s*"Studio"/);
  assert.doesNotMatch(enMessages, /"cv":\s*\{\s*"title":\s*"Software Engineer"/);
  assert.doesNotMatch(viMessages, /"cv":\s*\{\s*"title":\s*"Software Engineer"/);
});
