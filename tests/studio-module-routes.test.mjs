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

const { routeHref, routeIdFromStudioPath } = await import(
  new URL("../src/app/[locale]/studio/studio-shell-navigation.ts", import.meta.url)
);

// MEP-54: public modules get their own crawlable path; other routes and the six flow deep links keep the query form.
test("Studio routes map to module paths and back", () => {
  assert.equal(routeHref("welcome", "en"), "/en/studio");
  assert.equal(routeHref("delivery-checklists", "vi"), "/vi/studio/checklists");
  assert.equal(routeHref("flow-react-flow-system-blueprint", "en"), "/en/studio/system-maps");
  assert.equal(routeHref("ai-agent-setup", "fr"), "/fr/studio/ai-setup");
  assert.equal(routeHref("ai-skills", "en"), "/en/studio?route=ai-skills#ai-skills");
  assert.equal(
    routeHref("flow-incident-response", "en"),
    "/en/studio?route=flow-incident-response&flow=incident-response#flow-incident-response"
  );

  assert.equal(routeIdFromStudioPath("/en/studio/checklists"), "delivery-checklists");
  assert.equal(routeIdFromStudioPath("/vi/studio/system-maps.html"), "flow-react-flow-system-blueprint");
  assert.equal(routeIdFromStudioPath("/ja/studio/ai-setup/"), "ai-agent-setup");
  assert.equal(routeIdFromStudioPath("/en/studio"), null);
  assert.equal(routeIdFromStudioPath("/en/studio/unknown"), null);
  assert.equal(routeIdFromStudioPath("/en/blog/checklists"), null);
});
