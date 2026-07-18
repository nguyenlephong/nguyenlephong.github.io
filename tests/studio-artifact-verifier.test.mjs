import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { verifyStudioArtifact } from "../scripts/verify-studio-artifact.mjs";

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), "studio-artifact-"));
  const chunks = join(root, "_next/static/chunks");
  mkdirSync(join(root, "en"), { recursive: true });
  mkdirSync(join(root, "studio"), { recursive: true });
  mkdirSync(chunks, { recursive: true });
  writeFileSync(
    join(root, "studio/studio-shadow.css"),
    `${'.studio-admin[data-navbar-style="scroll"]'} .studio-main { overflow: auto; }${"x".repeat(100_000)}`
  );
  writeFileSync(join(root, "en/studio.html"), '<script src="/_next/static/chunks/initial.js"></script>');
  writeFileSync(join(chunks, "initial.js"), "console.log('studio shell')");
  writeFileSync(join(chunks, "auxiliary.js"), "data-studio-auxiliary-dashboard");
  writeFileSync(join(chunks, "flow.js"), "data-studio-flow-runtime");
  writeFileSync(join(chunks, "chart.js"), "data-studio-recharts-runtime");
  return root;
}

test("Studio artifact verifier requires external CSS and lazy heavy runtimes", () => {
  const root = createFixture();
  try {
    const summary = verifyStudioArtifact({ outDir: root });
    assert.equal(summary.initialScripts.length, 1);
    assert.equal(summary.css.file, "studio/studio-shadow.css");
    assert.deepEqual(Object.keys(summary.lazyChunks).sort(), ["ReactFlow", "Recharts", "auxiliary dashboards"].sort());

    writeFileSync(
      join(root, "_next/static/chunks/initial.js"),
      'data-studio-flow-runtime;.studio-admin[data-navbar-style="scroll"]'
    );
    assert.throws(
      () => verifyStudioArtifact({ outDir: root }),
      /client JavaScript still embeds the full Shadow stylesheet/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
