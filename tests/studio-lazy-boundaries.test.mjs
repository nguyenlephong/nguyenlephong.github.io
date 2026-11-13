import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Studio heavy route capabilities stay behind explicit lazy boundaries", () => {
  const shell = readFileSync("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8");
  const registry = readFileSync("src/app/[locale]/studio/StudioRouteFeatureRegistry.tsx", "utf8");
  const flowFeature = readFileSync("src/app/[locale]/studio/StudioFlowCanvasFeature.tsx", "utf8");
  const flowRuntime = readFileSync("src/app/[locale]/studio/StudioFlowCanvasRuntime.tsx", "utf8");

  assert.match(shell, /StudioRouteFeatureRegistry/);
  assert.doesNotMatch(shell, /StudioAuxiliaryDashboardsFeature/);
  assert.match(registry, /dynamic<StudioFeatureProps>/);
  assert.match(registry, /import StudioWelcomeFeatureAdapter from "\.\/StudioWelcomeFeatureAdapter"/);
  assert.doesNotMatch(registry, /import\("\.\/StudioWelcomeFeatureAdapter"\)/);
  assert.match(registry, /import\("\.\/StudioAiSkillsFeature\.en"\)/);
  assert.match(registry, /import\("\.\/StudioChecklistsFeature\.en"\)/);
  assert.match(registry, /import\("\.\/StudioFlowFeature\.en"\)/);
  assert.match(registry, /normalizeStudioLocale/);
  assert.doesNotMatch(shell, /function (DashboardRoutePage|FinanceLikePage|AnalyticsPage|ProductivityPage|CommerceAcademyPage)/);

  assert.match(flowFeature, /dynamic<StudioFlowCanvasRuntimeProps>/);
  assert.match(flowFeature, /import\("\.\/StudioFlowCanvasRuntime"\)/);
  assert.match(flowRuntime, /data-studio-flow-runtime="true"/);
  assert.doesNotMatch(shell, /StudioFlowCanvasFeature/);
  assert.doesNotMatch(shell, /from "@xyflow\/react"/);

  assert.doesNotMatch(shell, /from "recharts"/);
});
