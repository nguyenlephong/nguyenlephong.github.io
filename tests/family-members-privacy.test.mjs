import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const root = new URL("../", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("family members expose aliases without a public name field", () => {
  const data = read("src/app/[locale]/heartbeats/family.data.ts");
  const client = read("src/app/[locale]/heartbeats/HeartbeatsClient.tsx");
  const entries = [...data.matchAll(/id: 'm\d+', alias: '([^']+)'/g)];

  assert.ok(entries.length > 0, "expected family member entries");
  assert.doesNotMatch(data, /\bname:/);
  assert.doesNotMatch(data, /\bname: string/);
  assert.doesNotMatch(client, /person\.name/);
});
