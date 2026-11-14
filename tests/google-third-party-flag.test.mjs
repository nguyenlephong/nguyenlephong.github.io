import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { gateAdsTxt } from "../scripts/postbuild.mjs";

const {
  GOOGLE_THIRD_PARTY_ENABLED,
  PUBLIC_THIRD_PARTY,
  isGoogleThirdPartyEnabled,
  publicThirdPartyMetadata
} = await import("../src/lib/public-third-party.ts");

test("AdSense and GA4 are off unless GOOGLE_THIRD_PARTY=on (MEP-66)", () => {
  if (process.env.GOOGLE_THIRD_PARTY !== "on") {
    assert.equal(GOOGLE_THIRD_PARTY_ENABLED, false);
  }
  assert.equal(isGoogleThirdPartyEnabled(undefined), false);
  assert.equal(isGoogleThirdPartyEnabled(""), false);
  assert.equal(isGoogleThirdPartyEnabled("true"), false);
  assert.equal(isGoogleThirdPartyEnabled("on"), true);
});

test("flag off drops the AdSense meta; flag on restores it", () => {
  assert.deepEqual(publicThirdPartyMetadata(false), {});
  assert.deepEqual(publicThirdPartyMetadata(true), {
    other: { "google-adsense-account": PUBLIC_THIRD_PARTY.adsenseClientId }
  });
});

test("postbuild keeps out/ads.txt only while the flag is on", async () => {
  const outDir = mkdtempSync(path.join(tmpdir(), "ads-txt-gate-"));
  const adsTxt = path.join(outDir, "ads.txt");
  try {
    writeFileSync(adsTxt, "google.com, pub-0, DIRECT");
    await gateAdsTxt(outDir, true);
    assert.equal(existsSync(adsTxt), true);

    await gateAdsTxt(outDir, false);
    assert.equal(existsSync(adsTxt), false);
    await gateAdsTxt(outDir, false); // already gone: no throw
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
