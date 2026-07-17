import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

require.extensions[".tsx"] = (module, filename) => {
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
};

const StudioFeatureErrorBoundary = require(
  "../src/app/[locale]/studio/StudioFeatureErrorBoundary.tsx"
).default;

test("Studio feature boundary isolates failure and retries only its child", () => {
  let reloads = 0;
  const boundary = new StudioFeatureErrorBoundary({
    children: "chart",
    onRetry: () => { reloads += 1; },
    renderFallback: (retry) => ({ kind: "fallback", retry })
  });
  boundary.state = { failed: true };

  const failedRender = boundary.render();
  assert.equal(failedRender.kind, "fallback");
  failedRender.retry();
  assert.equal(reloads, 1);
  assert.deepEqual(boundary.state, { failed: true });
  assert.equal(StudioFeatureErrorBoundary.getDerivedStateFromError().failed, true);
});
