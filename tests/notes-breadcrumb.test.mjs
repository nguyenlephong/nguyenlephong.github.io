import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

function resolveProjectModule(url) {
  const basePath = fileURLToPath(url);
  for (const extension of ["", ".ts", ".tsx", ".js", ".mjs"]) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveProjectModule(
        new URL(`../src/${specifier.slice(2)}`, import.meta.url)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  }
});

const { buildNotesTopicHref } = await import("../src/lib/notes/urls.ts");

test("uses static hubs for curated topics and keeps thin topics as filters", () => {
  assert.equal(buildNotesTopicHref("goc-nhin"), "/notes/topics/goc-nhin");
  assert.equal(buildNotesTopicHref("mua-xe"), "/notes?topic=mua-xe");
});
