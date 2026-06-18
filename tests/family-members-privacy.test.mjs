import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const root = new URL("../", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("family members expose aliases instead of full public names", () => {
  const data = read("src/app/[locale]/heartbeats/family.data.ts");
  const entries = [...data.matchAll(/name: '([^']+)', alias: '([^']+)'/g)];

  assert.ok(entries.length > 0, "expected family member entries");
  for (const [, name, alias] of entries) {
    assert.ok(name === alias, "family member name should use the public alias");
  }
});
