import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Studio heavy route capabilities stay behind explicit lazy boundaries", () => {
  const shell = readFileSync("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8");
  const auxiliaryFeature = readFileSync("src/app/[locale]/studio/StudioAuxiliaryDashboardsFeature.tsx", "utf8");
  const auxiliaryRuntime = readFileSync("src/app/[locale]/studio/StudioAuxiliaryDashboardsRuntime.tsx", "utf8");
  const flowFeature = readFileSync("src/app/[locale]/studio/StudioFlowCanvasFeature.tsx", "utf8");
  const flowRuntime = readFileSync("src/app/[locale]/studio/StudioFlowCanvasRuntime.tsx", "utf8");
  const deliveryFeature = readFileSync("src/app/[locale]/studio/StudioDeliverySignalFeature.tsx", "utf8");
  const deliveryRuntime = readFileSync("src/app/[locale]/studio/StudioDeliverySignalChart.tsx", "utf8");

  assert.match(shell, /StudioAuxiliaryDashboardsFeature/);
  assert.match(shell, /return <StudioAuxiliaryDashboardsFeature route=\{route\} locale=\{locale\} \/>/);
  assert.doesNotMatch(shell, /function (DashboardRoutePage|FinanceLikePage|AnalyticsPage|ProductivityPage|CommerceAcademyPage)/);

  assert.match(auxiliaryFeature, /dynamic<StudioAuxiliaryDashboardsRuntimeProps>/);
  assert.match(auxiliaryFeature, /import\("\.\/StudioAuxiliaryDashboardsRuntime"\)/);
  assert.match(auxiliaryFeature, /ssr:\s*false/);
  assert.match(auxiliaryFeature, /StudioFeatureErrorBoundary/);
  assert.match(auxiliaryRuntime, /data-studio-auxiliary-dashboard=\{route\.kind\}/);
  assert.match(auxiliaryRuntime, /function DashboardRoutePage/);
  assert.match(auxiliaryRuntime, /function AnalyticsPage/);

  assert.match(flowFeature, /dynamic<StudioFlowCanvasRuntimeProps>/);
  assert.match(flowFeature, /import\("\.\/StudioFlowCanvasRuntime"\)/);
  assert.match(flowRuntime, /data-studio-flow-runtime="true"/);
  assert.doesNotMatch(shell, /from "@xyflow\/react"/);

  assert.match(deliveryFeature, /dynamic\(\(\) => import\("\.\/StudioDeliverySignalChart"\)/);
  assert.match(deliveryRuntime, /data-studio-recharts-runtime="true"/);
  assert.doesNotMatch(shell, /from "recharts"/);
});
