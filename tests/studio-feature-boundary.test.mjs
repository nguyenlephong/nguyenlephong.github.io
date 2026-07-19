import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function compileTypeScript(module, filename) {
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  module._compile(output, filename);
}

require.extensions[".ts"] = compileTypeScript;
require.extensions[".tsx"] = compileTypeScript;

const StudioFeatureErrorBoundary = require(
  "../src/app/[locale]/studio/StudioFeatureErrorBoundary.tsx"
).default;
const StudioShellErrorBoundary = require(
  "../src/app/[locale]/studio/StudioShellErrorBoundary.tsx"
).default;
const { createStudioFeatureLoadErrorCallback } = require(
  "../src/app/[locale]/studio/studio-feature-load-error.ts"
);

test("Studio feature boundary keeps a cached load failure mounted until a full reload", () => {
  let reloads = 0;
  let reports = 0;
  const boundary = new StudioFeatureErrorBoundary({
    children: "chart",
    onError: () => { reports += 1; },
    onRetry: () => { reloads += 1; },
    renderFallback: (retry) => ({ kind: "fallback", retry })
  });
  boundary.state = { failed: true };
  const failedRender = boundary.render();
  assert.equal(failedRender.kind, "fallback");
  boundary.componentDidCatch(new Error("chunk failed"), {});
  assert.equal(reports, 1);
  failedRender.retry();
  assert.equal(reloads, 1);
  assert.deepEqual(boundary.state, { failed: true });
  assert.equal(StudioFeatureErrorBoundary.getDerivedStateFromError().failed, true);
});

test("every Studio load boundary emits only the allowlisted feature context", () => {
  const cases = [
    {
      context: {
        featureId: "route-feature",
        routeId: "ai-skills",
        routeKind: "ai-skills",
        locale: "en"
      },
      expected: {
        feature_id: "route-feature",
        route_id: "ai-skills",
        route_kind: "ai-skills",
        locale: "en"
      }
    },
    {
      context: {
        featureId: "delivery-signal",
        routeId: "default",
        routeKind: "default",
        locale: "vi"
      },
      expected: {
        feature_id: "delivery-signal",
        route_id: "default",
        route_kind: "default",
        locale: "vi"
      }
    },
    {
      context: {
        featureId: "flow-canvas",
        routeId: "flow-system-design",
        routeKind: "flows",
        locale: "fr"
      },
      expected: {
        feature_id: "flow-canvas",
        route_id: "flow-system-design",
        route_kind: "flows",
        locale: "fr"
      }
    },
    {
      context: {
        featureId: "auxiliary-dashboard",
        routeId: "analytics",
        routeKind: "analytics",
        locale: "ja"
      },
      expected: {
        feature_id: "auxiliary-dashboard",
        route_id: "analytics",
        route_kind: "analytics",
        locale: "ja"
      }
    }
  ];

  for (const { context, expected } of cases) {
    const captures = [];
    const callback = createStudioFeatureLoadErrorCallback(
      context,
      (event, properties) => captures.push({ event, properties })
    );
    const boundary = new StudioFeatureErrorBoundary({
      children: "feature",
      onError: callback,
      onRetry: () => {},
      renderFallback: () => "fallback"
    });

    boundary.componentDidCatch(new Error("private chunk failure"), {
      componentStack: "private component stack"
    });

    assert.deepEqual(captures, [
      { event: "studio_feature_load_error", properties: expected }
    ]);
    assert.deepEqual(Object.keys(captures[0].properties).sort(), Object.keys(expected).sort());
  }

  const shellCaptures = [];
  const shellCallback = createStudioFeatureLoadErrorCallback(
    { featureId: "studio-shell", locale: "ko" },
    (event, properties) => shellCaptures.push({ event, properties })
  );
  const shellBoundary = new StudioShellErrorBoundary({
    children: "shell",
    copy: { title: "Unavailable", detail: "Reload", reload: "Reload Studio" },
    onError: shellCallback
  });
  shellBoundary.componentDidCatch(new Error("private shell failure"), {
    componentStack: "private shell stack"
  });
  assert.deepEqual(shellCaptures, [
    {
      event: "studio_feature_load_error",
      properties: { feature_id: "studio-shell", locale: "ko" }
    }
  ]);

  const analytics = readFileSync("src/lib/analytics.ts", "utf8");
  assert.match(analytics, /\| 'studio_feature_load_error'/);
});

test("Studio load telemetry wiring covers every boundary and recovery reloads the document", () => {
  const sources = [
    ["StudioRouteFeatureRegistry.tsx", "route-feature"],
    ["StudioDeliverySignalFeature.tsx", "delivery-signal"],
    ["StudioFlowCanvasFeature.tsx", "flow-canvas"],
    ["StudioDashboardRoutesFeature.tsx", "auxiliary-dashboard"],
    ["StudioWorkspace.tsx", "studio-shell"]
  ];

  for (const [filename, featureId] of sources) {
    const source = readFileSync(`src/app/[locale]/studio/${filename}`, "utf8");
    assert.match(source, /createStudioFeatureLoadErrorCallback/);
    assert.match(source, new RegExp(`featureId: "${featureId}"`));
    assert.doesNotMatch(source, /onError=\{\([^)]*(error|message|stack)/i);
  }

  const helper = readFileSync(
    "src/app/[locale]/studio/studio-feature-load-error.ts",
    "utf8"
  );
  assert.match(helper, /\): \(\) => void/);
  assert.doesNotMatch(helper, /context\.(error|message|stack)/i);

  const registry = readFileSync(
    "src/app/[locale]/studio/StudioRouteFeatureRegistry.tsx",
    "utf8"
  );
  assert.match(registry, /onRetry=\{\(\) => window\.location\.reload\(\)\}/);
  assert.doesNotMatch(registry, /retryVersion|setRetryVersion/);
});
