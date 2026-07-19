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

const query = require("../src/app/[locale]/studio/studio-dashboard-query.ts");

test("Studio dashboard query state is shareable, sanitized, and preserves route params", () => {
  assert.deepEqual(
    query.readStudioDashboardQuery("?route=default"),
    query.defaultStudioDashboardQuery
  );
  assert.deepEqual(
    query.readStudioDashboardQuery(
      "?route=default&ops_q=flag&ops_status=blocked&ops_sort=name"
    ),
    { workstreamSearch: "flag", statusFilter: "blocked", sortMode: "name" }
  );
  assert.deepEqual(
    query.readStudioDashboardQuery("?ops_status=invalid&ops_sort=random"),
    query.defaultStudioDashboardQuery
  );

  const serialized = query.writeStudioDashboardQuery(
    "?route=default&flow=demo",
    {
      workstreamSearch: "  edge rollout  ",
      statusFilter: "watching",
      sortMode: "status"
    }
  );
  const params = new URLSearchParams(serialized);
  assert.equal(params.get("route"), "default");
  assert.equal(params.get("flow"), "demo");
  assert.equal(params.get("ops_q"), "edge rollout");
  assert.equal(params.get("ops_status"), "watching");
  assert.equal(params.get("ops_sort"), "status");

  const target = new URLSearchParams("route=welcome");
  query.preserveStudioDashboardQueryParams(target, serialized);
  assert.equal(target.get("route"), "welcome");
  assert.equal(target.get("ops_q"), "edge rollout");
  assert.equal(target.get("ops_status"), "watching");
  assert.equal(target.get("ops_sort"), "status");
});

test("Studio route changes retain dashboard state for return navigation", () => {
  const shell = readFileSync(
    "src/app/[locale]/studio/studio-admin-shell.tsx",
    "utf8"
  );
  const dashboard = readFileSync(
    "src/app/[locale]/studio/StudioDefaultDashboardFeature.tsx",
    "utf8"
  );
  assert.match(shell, /routeHref\(routeId, window\.location\.search\)/);
  assert.match(
    dashboard,
    /readStudioDashboardQuery\(window\.location\.search\)/
  );
  assert.match(
    dashboard,
    /writeStudioDashboardQuery\(window\.location\.search, next\)/
  );
  assert.match(dashboard, /window\.history\.replaceState/);
});

test("Studio dashboard exposes a localized zero-result state and clears through canonical query serialization", () => {
  const noResults = query.readStudioDashboardQuery(
    "?route=default&ops_q=no-match-token"
  );
  assert.equal(noResults.workstreamSearch, "no-match-token");

  const clearedSearch = query.writeStudioDashboardQuery(
    "?route=default&ops_q=no-match-token&ops_status=blocked&ops_sort=status",
    query.defaultStudioDashboardQuery
  );
  const clearedParams = new URLSearchParams(clearedSearch);
  assert.equal(clearedParams.get("route"), "default");
  assert.equal(clearedParams.has("ops_q"), false);
  assert.equal(clearedParams.has("ops_status"), false);
  assert.equal(clearedParams.has("ops_sort"), false);

  const dashboard = readFileSync(
    "src/app/[locale]/studio/StudioDefaultDashboardFeature.tsx",
    "utf8"
  );
  const adapter = readFileSync(
    "src/app/[locale]/studio/StudioAuxiliaryRoutesFeatureAdapter.tsx",
    "utf8"
  );
  const dispatcher = readFileSync(
    "src/app/[locale]/studio/StudioAuxiliaryRoutesFeature.tsx",
    "utf8"
  );
  assert.match(
    dashboard,
    /dashboardCopy\.workstreamCount\(filteredWorkstreams\.length\)/
  );
  assert.match(dashboard, /filteredWorkstreams\.length === 0/);
  assert.match(dashboard, /className="table-empty-state" role="status"/);
  assert.match(
    dashboard,
    /onClearFilters=\{\(\) => updateQuery\(defaultStudioDashboardQuery\)\}/
  );
  assert.match(adapter, /dashboardCopy=\{props\.copy\.dashboard\}/);
  assert.match(dispatcher, /dashboardCopy=\{props\.dashboardCopy\}/);

  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    const localeData = JSON.parse(
      readFileSync(
        `src/app/[locale]/studio/studio-shell-copy.${locale}.json`,
        "utf8"
      )
    );
    const localeAdapter = readFileSync(
      `src/app/[locale]/studio/studio-shell-copy.${locale}.ts`,
      "utf8"
    );
    assert.match(localeAdapter, /workstreamCount:/);
    assert.equal(typeof localeData.dashboard.emptyTitle, "string");
    assert.equal(typeof localeData.dashboard.emptyDescription, "string");
    assert.equal(typeof localeData.dashboard.clearFilters, "string");
  }
});
