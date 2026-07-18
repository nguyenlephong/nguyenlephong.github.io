import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { pruneBuildOnlyExportAssets } from "../scripts/postbuild-offline.mjs";

test("postbuild prunes OG input cache without removing deployable files", async (t) => {
  const outDir = mkdtempSync(path.join(tmpdir(), "static-artifact-cleanup-"));
  t.after(() => rmSync(outDir, { recursive: true, force: true }));

  mkdirSync(path.join(outDir, "og-cache"), { recursive: true });
  writeFileSync(path.join(outDir, "og-cache", "generated.png"), "build input");
  writeFileSync(path.join(outDir, "index.html"), "<main>keep</main>");

  await pruneBuildOnlyExportAssets(outDir);

  assert.equal(existsSync(path.join(outDir, "og-cache")), false);
  assert.equal(existsSync(path.join(outDir, "index.html")), true);
  assert.equal(existsSync("public/assets/full-bg.svg"), false);
});
