import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  const shellSource = readFileSync("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8");
  const routeIds = studioCatalog.routeIds;

  assert.equal(new Set(routeIds).size, routeIds.length, "catalog route IDs must be unique");
  assert.ok(routeIds.includes(studioCatalog.defaultRouteId));
  assert.deepEqual(
    [...routeDefinitionIds(shellSource)].sort(),
    [...routeIds].sort(),
    "hydrated route definitions must cover the catalog exactly"
  );
  const hydratedKinds = routeDefinitionKinds(shellSource);
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
  for (const routeId of [
    "default",
    "crm",
    "finance",
    "analytics",
    "productivity",
    "ecommerce",
    "academy",
    "logistics",
    "infrastructure",
    "legacy-default",
    "legacy-crm",
    "legacy-finance",
    "legacy-analytics"
  ]) {
    assert.ok(deepLinkRouteIds.includes(routeId), `${routeId} must remain an intentional typed deep link`);
  }

  const publicModuleIds = studioCatalog.publicModules.map((module) => module.routeId);
  assert.deepEqual(studioCatalog.welcomeRouteIds, publicModuleIds);
  publicModuleIds.forEach((routeId) => assert.ok(navRouteIds.includes(routeId), `public module missing from nav: ${routeId}`));

  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    const localizedCopy = staticContentModule.studioStaticContentCopyByLocale[locale];
    assert.deepEqual(
      Object.keys(localizedCopy.modules).sort(),
      [...publicModuleIds].sort(),
      `${locale} module copy must have the exact keyed public-module contract`
    );
    for (const routeId of [...publicModuleIds].reverse()) {
      assert.ok(localizedCopy.modules[routeId].title.trim(), `${locale}/${routeId} title must be nonempty`);
      assert.ok(localizedCopy.modules[routeId].description.trim(), `${locale}/${routeId} description must be nonempty`);
    }

    const resolvedModules = staticContentModule.getStudioStaticContent(locale).modules;
    assert.deepEqual(
      resolvedModules.map((module) => module.id),
      publicModuleIds,
      `${locale} static modules must follow the shared catalog`
    );
    for (const resolvedModule of resolvedModules) {
      assert.equal(resolvedModule.title, localizedCopy.modules[resolvedModule.id].title);
      assert.equal(resolvedModule.description, localizedCopy.modules[resolvedModule.id].description);
    }
  }

  assert.doesNotMatch(catalogSource, /from\s+["']react(?:-icons)?|<\w+[\s>]/);
  assert.match(shellSource, /studioCatalog\.navGroups/);
  assert.match(shellSource, /studioCatalog\.welcomeRouteIds/);
  assert.match(shellSource, /studioCatalog\.deepLinkRouteIds/);
  assert.match(shellSource, /isLocationRouteId/);
});
