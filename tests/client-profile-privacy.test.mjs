import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createLocalDependencyGraph } from "./helpers/source-dependency-graph.mjs";

// MEP-12: referee contact data must never reach the browser, and no profile
// aggregate (`profileInfo`) may ride along with client components.
const REFEREE_PATTERN = /\breferences\b|referee/i;

function readSourceTree(directory) {
  const sources = new Map();
  for (const entry of readdirSync(directory, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(?:tsx?|mjs|jsx?)$/.test(entry.name)) continue;
    const fileName = path.posix.join(entry.parentPath.split(path.sep).join("/"), entry.name);
    sources.set(fileName, readFileSync(fileName, "utf8"));
  }
  return sources;
}

function clientReachableFiles(sources) {
  const graph = createLocalDependencyGraph(sources);
  const queue = [...sources.keys()].filter((file) =>
    /^\s*["']use client["']/.test(sources.get(file))
  );
  const seen = new Set(queue);
  while (queue.length > 0) {
    for (const dependency of graph.get(queue.pop()) ?? []) {
      if (seen.has(dependency)) continue;
      seen.add(dependency);
      queue.push(dependency);
    }
  }
  return seen;
}

test("profile content imported by client components carries no referee data", async () => {
  const profile = await import("../src/content/profile.ts");
  assert.equal("references" in profile, false);
  assert.doesNotMatch(JSON.stringify(profile), REFEREE_PATTERN);
});

test("no client-reachable module ships profileInfo or referee data", () => {
  const sources = readSourceTree("src");
  const reachable = clientReachableFiles(sources);
  assert.ok(reachable.has("src/components/AppFooter.tsx"));
  assert.ok(reachable.has("src/content/social.ts"));

  for (const file of reachable) {
    assert.doesNotMatch(sources.get(file), /\bprofileInfo\b/, file);
    if (file.startsWith("src/content/") || file === "src/app/app.const.ts") {
      assert.doesNotMatch(sources.get(file), REFEREE_PATTERN, file);
    }
  }
});

test("public/ ships only the current résumé PDF at the root", () => {
  const pdfs = readdirSync("public").filter((name) => name.toLowerCase().endsWith(".pdf"));
  assert.deepEqual(pdfs, ["NguyenLePhong_Lead_Software_Engineer.pdf"]);
});

test("no client-reachable module carries the phone number", async () => {
  const { contact } = await import("../src/content/profile.ts");
  const sources = readSourceTree("src");
  const reachable = clientReachableFiles(sources);
  // MEP-74 review: the phone may render in server HTML, never in a client chunk.
  assert.equal(reachable.has("src/content/profile.ts"), false);
  for (const file of reachable) {
    const source = sources.get(file);
    assert.equal(source.includes(contact.phone), false, file);
    assert.doesNotMatch(source, /\bphone\s*:\s*["'`]/, file);
  }
});
