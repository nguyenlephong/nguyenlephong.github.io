import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("build wrapper fallback exit is not reset by html mtime churn", async () => {
  const buildScript = await readFile("scripts/build-og.mjs", "utf8");

  assert.match(buildScript, /lastChildOutputAt = Date\.now\(\)/);
  assert.match(buildScript, /\['fallback', exportState\.htmlCount\]\.join\(':'\)/);
  assert.match(buildScript, /next build is exporting static HTML/);
  assert.match(buildScript, /const outputQuiet = now - lastChildOutputAt >= quietMs/);
  assert.match(buildScript, /\(exportState\.detailSuccess \|\| outputQuiet\)/);
  assert.doesNotMatch(
    buildScript,
    /\['fallback', exportState\.latestActivityMtimeMs, exportState\.htmlCount\]/,
  );
});
