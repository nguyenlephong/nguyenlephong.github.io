import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const extensionCandidates = [".ts", ".tsx", ".js", ".mjs"];

function resolveWithProjectExtensions(url) {
  const basePath = fileURLToPath(url);
  if (existsSync(basePath)) return url.href;
  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveWithProjectExtensions(new URL(`../src/${specifier.slice(2)}`, import.meta.url));
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    if (context.parentURL?.startsWith("file:") && (specifier.startsWith("./") || specifier.startsWith("../"))) {
      const resolved = resolveWithProjectExtensions(new URL(specifier, context.parentURL));
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  }
});

const { getStudioStaticContent, getStudioStaticModule, getStudioStaticModuleHref } = await import(
  new URL("../src/app/[locale]/(site)/studio/studio-static-content.ts", import.meta.url)
);

// MEP-54: each public module is its own crawlable page; there are no query-string routes any more.
test("Studio module slugs map to their pages and back", () => {
  const hrefs = getStudioStaticContent("en").modules.map((module) => getStudioStaticModuleHref("en", module));
  assert.deepEqual(hrefs, ["/en/studio/checklists", "/en/studio/system-maps", "/en/studio/ai-setup"]);
  assert.equal(getStudioStaticModuleHref("vi", { slug: "checklists" }), "/vi/studio/checklists");
  assert.equal(getStudioStaticModuleHref("fr", { slug: "ai-setup" }), "/fr/studio/ai-setup");

  assert.equal(getStudioStaticModule("en", "checklists")?.id, "delivery-checklists");
  assert.equal(getStudioStaticModule("vi", "system-maps")?.id, "flow-react-flow-system-blueprint");
  assert.equal(getStudioStaticModule("ja", "ai-setup")?.id, "ai-agent-setup");
  for (const removed of ["ai-skills", "welcome", "flow-incident-response", "unknown"]) {
    assert.equal(getStudioStaticModule("en", removed), undefined, removed);
  }
});
