import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  module._compile(output, filename);
};

const { formatStudioFlowLabel } = require(
  "../src/app/[locale]/studio/studio-flow-format.ts"
);

test("Studio flow labels use one shared pure formatter", () => {
  const flowFeature = [
    "src/app/[locale]/studio/StudioFlowChart.tsx",
    "src/app/[locale]/studio/StudioFlowTrail.tsx"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  const runtime = readFileSync("src/app/[locale]/studio/StudioFlowCanvasRuntime.tsx", "utf8");

  assert.equal(formatStudioFlowLabel("arrow_closed"), "Arrow Closed");
  assert.equal(formatStudioFlowLabel("flow-step"), "Flow Step");
  assert.equal(formatStudioFlowLabel("already"), "Already");
  assert.match(flowFeature, /import \{ formatStudioFlowLabel \} from "\.\/studio-flow-format"/);
  assert.match(runtime, /import \{ formatStudioFlowLabel \} from "\.\/studio-flow-format"/);
  assert.doesNotMatch(flowFeature, /function formatStudioFlowLabel/);
  assert.doesNotMatch(runtime, /function formatStudioFlowLabel/);
});
