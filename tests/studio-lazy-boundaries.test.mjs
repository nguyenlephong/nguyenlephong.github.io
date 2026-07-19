import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Studio heavy route capabilities stay behind explicit lazy boundaries", () => {
  const shell = readFileSync("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8");
  const registry = readFileSync("src/app/[locale]/studio/StudioRouteFeatureRegistry.tsx", "utf8");
  const auxiliaryRoutes = readFileSync("src/app/[locale]/studio/StudioAuxiliaryRoutesFeature.tsx", "utf8");
  const mailFeature = readFileSync("src/app/[locale]/studio/StudioMailFeature.tsx", "utf8");
  const dashboardRoutes = readFileSync("src/app/[locale]/studio/StudioDashboardRoutesFeature.tsx", "utf8");
  const auxiliaryRuntime = readFileSync("src/app/[locale]/studio/StudioAuxiliaryDashboardsRuntime.tsx", "utf8");
  const flowFeature = readFileSync("src/app/[locale]/studio/StudioFlowCanvasFeature.tsx", "utf8");
  const flowRuntime = readFileSync("src/app/[locale]/studio/StudioFlowCanvasRuntime.tsx", "utf8");
  const deliveryFeature = readFileSync("src/app/[locale]/studio/StudioDeliverySignalFeature.tsx", "utf8");
  const deliveryRuntime = readFileSync("src/app/[locale]/studio/StudioDeliverySignalChart.tsx", "utf8");

  assert.match(shell, /StudioRouteFeatureRegistry/);
  assert.doesNotMatch(shell, /StudioAuxiliaryDashboardsFeature/);
  assert.match(registry, /dynamic<StudioFeatureProps>/);
  assert.match(registry, /import StudioWelcomeFeatureAdapter from "\.\/StudioWelcomeFeatureAdapter"/);
  assert.doesNotMatch(registry, /import\("\.\/StudioWelcomeFeatureAdapter"\)/);
  assert.match(registry, /import\("\.\/StudioAiSkillsFeature\.en"\)/);
  assert.match(registry, /import\("\.\/StudioChecklistsFeature\.en"\)/);
  assert.match(registry, /import\("\.\/StudioFlowFeature\.en"\)/);
  assert.match(registry, /import StudioAuxiliaryRoutesFeatureAdapter from "\.\/StudioAuxiliaryRoutesFeatureAdapter"/);
  assert.doesNotMatch(registry, /import\("\.\/StudioAuxiliaryRoutesFeatureAdapter"\)/);
  assert.match(registry, /normalizeStudioLocale/);
  assert.match(auxiliaryRoutes, /import\("\.\/StudioMailFeature"\)/);
  assert.match(auxiliaryRoutes, /import\("\.\/StudioChatFeature"\)/);
  assert.match(auxiliaryRoutes, /import\("\.\/StudioDefaultDashboardFeature"\)/);
  assert.match(auxiliaryRoutes, /import\("\.\/StudioUtilityRoutesFeature"\)/);
  assert.match(auxiliaryRoutes, /import\("\.\/StudioDashboardRoutesFeature"\)/);
  assert.match(auxiliaryRoutes, /assertNeverRouteKind/);
  assert.doesNotMatch(auxiliaryRoutes, /return <Dashboards \{\.\.\.props\} \/>/);
  assert.match(
    dashboardRoutes,
    /import StudioAuxiliaryDashboardsRuntime from "\.\/StudioAuxiliaryDashboardsRuntime"/
  );
  assert.doesNotMatch(dashboardRoutes, /StudioAuxiliaryDashboardsFeature/);
  assert.doesNotMatch(dashboardRoutes, /\bdynamic\s*[<(]/);
  assert.match(mailFeature, /mail-workbench/);
  assert.doesNotMatch(shell, /function (DashboardRoutePage|FinanceLikePage|AnalyticsPage|ProductivityPage|CommerceAcademyPage)/);

  assert.match(auxiliaryRuntime, /data-studio-auxiliary-dashboard=\{route\.kind\}/);
  assert.match(auxiliaryRuntime, /function DashboardRoutePage/);
  assert.match(auxiliaryRuntime, /function AnalyticsPage/);

  assert.match(flowFeature, /dynamic<StudioFlowCanvasRuntimeProps>/);
  assert.match(flowFeature, /import\("\.\/StudioFlowCanvasRuntime"\)/);
  assert.match(flowRuntime, /data-studio-flow-runtime="true"/);
  assert.doesNotMatch(shell, /StudioFlowCanvasFeature/);
  assert.doesNotMatch(shell, /from "@xyflow\/react"/);

  assert.match(deliveryFeature, /dynamic\(\(\) => import\("\.\/StudioDeliverySignalChart"\)/);
  assert.match(deliveryRuntime, /data-studio-recharts-runtime="true"/);
  assert.doesNotMatch(shell, /from "recharts"/);
});
