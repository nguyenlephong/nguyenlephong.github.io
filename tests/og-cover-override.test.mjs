import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import test from "node:test";
import sharp from "sharp";

const SLUG = "the-quiet-engineering-behind-bonbons-500k-round";

test("an authored OG cover replaces the generated text card for its article", async () => {
  assert.ok(existsSync(`content/og-covers/notes/${SLUG}.jpg`));

  const stdout = execFileSync(
    process.execPath,
    ["scripts/generate-static-og.mjs", "--surface", "notes", "--slug", SLUG],
    { encoding: "utf8" }
  );

  assert.match(stdout, new RegExp(`${SLUG}\\.png \\(cover\\)`));
  const metadata = await sharp(`public/og/notes/${SLUG}.png`).metadata();
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
});
