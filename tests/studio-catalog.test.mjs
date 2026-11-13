import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  module._compile(output, filename);
};

const catalogModule = require("../src/app/[locale]/studio/studio-route-catalog.ts");
const staticContentModule = require("../src/app/[locale]/studio/studio-static-content.ts");

const STUDIO_DIR = "src/app/[locale]/studio";
// Old admin-template routes (MEP-13): they rendered a prefilled login and fake owner data.
const removedTemplateRouteIds = [
  "default", "crm", "finance", "analytics", "productivity", "ecommerce", "academy",
  "logistics", "infrastructure", "email", "chat", "calendar", "kanban", "invoice",
  "users", "roles", "auth-login-v1", "auth-login-v2", "auth-register-v1",
  "auth-register-v2", "legacy-default", "legacy-crm", "legacy-finance", "legacy-analytics"
];

function routeDefinitionIds(source) {
  const sourceFile = ts.createSourceFile(
    "studio-admin-shell.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  let ids = [];
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText(sourceFile) !== "routeDefinitions") continue;
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
      ids = declaration.initializer.properties.flatMap((property) => {
        if (!ts.isPropertyAssignment(property)) return [];
        return [property.name.getText(sourceFile).replace(/^['"]|['"]$/g, "")];
      });
    }
  });
  return ids;
}

function routeDefinitionKinds(source) {
  const sourceFile = ts.createSourceFile(
    "studio-admin-shell.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const kinds = new Map();

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText(sourceFile) !== "routeDefinitions") continue;
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) continue;

      for (const property of declaration.initializer.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const routeId = property.name.getText(sourceFile).replace(/^['"]|['"]$/g, "");
        if (ts.isObjectLiteralExpression(property.initializer)) {
          const kindProperty = property.initializer.properties.find(
            (candidate) => ts.isPropertyAssignment(candidate) && candidate.name.getText(sourceFile) === "kind"
          );
          if (kindProperty && ts.isPropertyAssignment(kindProperty)) {
            kinds.set(routeId, kindProperty.initializer.getText(sourceFile).replace(/^['"]|['"]$/g, ""));
          }
          continue;
        }

        if (ts.isCallExpression(property.initializer)) {
          const factory = property.initializer.expression.getText(sourceFile);
          if (factory === "createFlowRouteDefinition") kinds.set(routeId, "flows");
          if (factory === "createAuthRouteDefinition") kinds.set(routeId, "auth");
        }
      }
    }
  });
  return kinds;
}

function flattenNavRouteIds(groups) {
  return groups.flatMap((group) => group.items.flatMap((item) => [
    item.routeId,
    ...(item.subItems ?? []).map((subItem) => subItem.routeId)
  ]));
}

test("Studio route, nav, welcome, and static identities share one data-only catalog", () => {
  const { studioCatalog } = catalogModule;
  const catalogSource = readFileSync("src/app/[locale]/studio/studio-route-catalog.ts", "utf8");
  const routeDefinitionSource = readFileSync("src/app/[locale]/studio/studio-route-definitions.ts", "utf8");
  const navigationSource = readFileSync("src/app/[locale]/studio/studio-shell-navigation.ts", "utf8");
  const registrySource = readFileSync("src/app/[locale]/studio/StudioRouteFeatureRegistry.tsx", "utf8");
  const routeIds = studioCatalog.routeIds;

  assert.equal(new Set(routeIds).size, routeIds.length, "catalog route IDs must be unique");
  assert.ok(routeIds.includes(studioCatalog.defaultRouteId));
  assert.deepEqual(
    [...routeDefinitionIds(routeDefinitionSource)].sort(),
    [...routeIds].sort(),
    "hydrated route definitions must cover the catalog exactly"
  );
  const hydratedKinds = routeDefinitionKinds(routeDefinitionSource);
  studioCatalog.routes.forEach((route) => {
    assert.equal(
      hydratedKinds.get(route.id),
      route.kind,
      `hydrated route kind must match the catalog: ${route.id}`
    );
  });

  const navRouteIds = flattenNavRouteIds(studioCatalog.navGroups);
  navRouteIds.forEach((routeId) => assert.ok(routeIds.includes(routeId), `unknown nav route: ${routeId}`));

  const deepLinkRouteIds = studioCatalog.deepLinkRouteIds;
  assert.equal(new Set(deepLinkRouteIds).size, deepLinkRouteIds.length);
  deepLinkRouteIds.forEach((routeId) => assert.ok(routeIds.includes(routeId), `unknown deep-link route: ${routeId}`));
  assert.deepEqual(
    [...new Set([...navRouteIds, ...deepLinkRouteIds])].sort(),
    [...routeIds].sort(),
    "navigation and explicit deep links must cover every hydrated route"
  );
  assert.deepEqual(
    navRouteIds.filter((routeId) => deepLinkRouteIds.includes(routeId)),
    [],
    "hidden deep-link routes must not leak into navigation"
  );
  for (const routeId of removedTemplateRouteIds) {
    assert.ok(!routeIds.includes(routeId), `${routeId} is a removed admin-template route`);
  }

  const publicModuleIds = studioCatalog.publicModules.map((module) => module.routeId);
  assert.deepEqual(studioCatalog.welcomeRouteIds, publicModuleIds);
  publicModuleIds.forEach((routeId) => assert.ok(navRouteIds.includes(routeId), `public module missing from nav: ${routeId}`));

  // MEP-56: checklists lead, then system maps, then AI setup; each public module has its own page.
  assert.deepEqual(publicModuleIds, ["delivery-checklists", "flow-react-flow-system-blueprint", "ai-agent-setup"]);
  assert.deepEqual(navRouteIds.slice(0, 3), ["welcome", "delivery-checklists", "flow-react-flow-system-blueprint"]);
  assert.deepEqual(studioCatalog.publicModules.map((module) => module.slug), ["checklists", "system-maps", "ai-setup"]);

  for (const locale of ["en", "vi"]) {
    const localizedCopy = staticContentModule.studioStaticContentCopyByLocale[locale];
    assert.deepEqual(
      Object.keys(localizedCopy.modules).sort(),
      [...publicModuleIds].sort(),
      `${locale} module copy must have the exact keyed public-module contract`
    );
    for (const routeId of publicModuleIds) {
      for (const field of ["title", "seoTitle", "description", "lead", "openLabel"]) {
        const value = localizedCopy.modules[routeId][field];
        assert.ok(value.trim(), `${locale}/${routeId} ${field} must be nonempty`);
        assert.doesNotMatch(value, /\u2014|practice plan/i, `${locale}/${routeId} ${field}`);
      }
    }
  }
  assert.doesNotMatch(
    `${staticContentModule.studioStaticContentCopyByLocale.en.intro} ${staticContentModule.studioStaticContentCopyByLocale.vi.intro}`,
    /Explore|Khám phá/,
    "intro must not narrate its own format"
  );

  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    const content = staticContentModule.getStudioStaticContent(locale);
    assert.equal(content.contentLocale, locale === "vi" ? "vi" : "en", `${locale} falls back to English prose`);
    assert.deepEqual(content.modules.map((module) => module.id), publicModuleIds, `${locale} static modules follow the catalog`);
    assert.equal(
      staticContentModule.getStudioStaticModuleHref(locale, content.modules[0]),
      `/${locale}/studio/checklists`
    );
    if (locale !== "en" && locale !== "vi") {
      assert.ok(staticContentModule.studioFallbackNoticeByLocale[locale], `${locale} marks the English fallback`);
    }
  }

  const checklists = ["ninety-day-ai-skill-plan", "rollout-plan", "daily-ai-learning-loop", "release-readiness"]
    .map((id) => ({ id, title: id, summary: "", whenToUse: "", tags: [], sections: [] }));
  assert.deepEqual(
    catalogModule.selectStudioDeliveryChecklists(checklists).map((checklist) => checklist.id),
    ["release-readiness", "rollout-plan"],
    "delivery checklists keep reading order and drop personal practice plans"
  );

  assert.doesNotMatch(catalogSource, /from\s+["']react(?:-icons)?|<\w+[\s>]/);
  assert.match(navigationSource, /studioCatalog\.navGroups/);
  assert.match(navigationSource, /studioCatalog\.deepLinkRouteIds/);
  assert.match(navigationSource, /isLocationRouteId/);
  assert.match(registrySource, /case "welcome":/);
  assert.match(registrySource, /case "ai-setup":/);
  assert.match(registrySource, /case "ai-skills":/);
  assert.match(registrySource, /case "checklists":/);
  assert.match(registrySource, /case "flows":/);
  assert.doesNotMatch(registrySource, /StudioAuxiliaryRoutesFeatureAdapter/);
  assert.match(registrySource, /assertNeverRouteKind/);
});

test("Studio source carries no credentials, contact emails, or admin-template leftovers", () => {
  const files = readdirSync(STUDIO_DIR, { recursive: true }).filter((file) => /\.(tsx?|json)$/.test(file));
  assert.ok(files.length > 0);
  const leaks = [
    ["email address", /[\w.%+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/i],
    ["mailto link", /mailto:/i],
    ["password field", /type=["']password["']/i],
    ["password-like default", /(?:password|passwd|pwd|secret)["']?\s*[:=]\s*["'][^"']+["']/i],
    ["prefilled input", /defaultValue=["'{]/],
    ["template greeting name", /\b(?:Aiy|Arham)\b/],
    ["template finance data", /Personal Finances|Net Worth/i]
  ];
  for (const file of files) {
    const source = readFileSync(`${STUDIO_DIR}/${file}`, "utf8");
    for (const [label, pattern] of leaks) {
      assert.doesNotMatch(source, pattern, `${file} contains a ${label}`);
    }
  }
});
