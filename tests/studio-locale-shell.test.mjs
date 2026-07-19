import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  module._compile(output, filename);
};

const localeContract = require("../src/app/[locale]/studio/studio-shell-copy.ts");
const { studioRouteIds } = require(
  "../src/app/[locale]/studio/studio-route-catalog.ts"
);
const localeModules = {
  en: ["englishStudioCopy", "StudioAdminShell.en.tsx"],
  vi: ["vietnameseStudioCopy", "StudioAdminShell.vi.tsx"],
  zh: ["chineseStudioCopy", "StudioAdminShell.zh.tsx"],
  ja: ["japaneseStudioCopy", "StudioAdminShell.ja.tsx"],
  ko: ["koreanStudioCopy", "StudioAdminShell.ko.tsx"],
  fr: ["frenchStudioCopy", "StudioAdminShell.fr.tsx"]
};

const formatterSamples = {
  en: {
    workstreamCount: ["0 workstreams", "1 workstream", "2 workstreams"],
    trailMore: "+2 more",
    skillCountLabel: "2 skills",
    structureDetail: "2 sections, 3 nested steps, copy-ready as markdown."
  },
  vi: {
    workstreamCount: [
      "0 luồng công việc",
      "1 luồng công việc",
      "2 luồng công việc"
    ],
    trailMore: "+2 nữa",
    skillCountLabel: "2 skills",
    structureDetail:
      "2 phần, 3 bước chi tiết, có thể sao chép dưới dạng Markdown."
  },
  zh: {
    workstreamCount: ["0 个工作流", "1 个工作流", "2 个工作流"],
    trailMore: "+2 more",
    skillCountLabel: "2 skills",
    structureDetail: "2 个部分，3 个嵌套步骤，可复制为 markdown。"
  },
  ja: {
    workstreamCount: [
      "0 件のワークストリーム",
      "1 件のワークストリーム",
      "2 件のワークストリーム"
    ],
    trailMore: "+2 more",
    skillCountLabel: "2 skills",
    structureDetail:
      "2 セクション、3 個のネストされたステップ。markdown としてコピーできます。"
  },
  ko: {
    workstreamCount: ["0개 워크스트림", "1개 워크스트림", "2개 워크스트림"],
    trailMore: "+2 more",
    skillCountLabel: "2 skills",
    structureDetail: "2개 섹션, 3개 중첩 단계, markdown 복사 가능."
  },
  fr: {
    workstreamCount: [
      "0 flux de travail",
      "1 flux de travail",
      "2 flux de travail"
    ],
    trailMore: "+2 more",
    skillCountLabel: "2 skills",
    structureDetail: "2 sections, 3 étapes imbriquées, copiables en markdown."
  }
};

function stripFormatters(copy) {
  const { workstreamCount: _workstreamCount, ...dashboard } = copy.dashboard;
  const { trailMore: _trailMore, ...flows } = copy.flows;
  const { skillCountLabel: _skillCountLabel, ...aiSkills } = copy.aiSkills;
  const { structureDetail: _structureDetail, ...checklists } = copy.checklists;
  return { ...copy, dashboard, flows, aiSkills, checklists };
}

function collectFunctionPaths(value, prefix = "") {
  if (typeof value === "function") return [prefix];
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    collectFunctionPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

function collectObjectKeyPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return [path, ...collectObjectKeyPaths(child, path)];
  });
}

test("Studio preserves exact interactive copy modules for every public locale", () => {
  const workspace = readFileSync(
    "src/app/[locale]/studio/StudioWorkspace.tsx",
    "utf8"
  );
  for (const [locale, [exportName, shellFile]] of Object.entries(
    localeModules
  )) {
    assert.equal(localeContract.normalizeStudioLocale(locale), locale);
    const localeModule = require(
      `../src/app/[locale]/studio/studio-shell-copy.${locale}.ts`
    );
    const copy = localeModule[exportName];
    const data = require(
      `../src/app/[locale]/studio/studio-shell-copy.${locale}.json`
    );
    assert.deepEqual(stripFormatters(copy), data, `${locale} static copy`);
    assert.deepEqual(
      collectFunctionPaths(copy).sort((left, right) =>
        left.localeCompare(right)
      ),
      [
        "aiSkills.skillCountLabel",
        "checklists.structureDetail",
        "dashboard.workstreamCount",
        "flows.trailMore"
      ]
    );
    assert.deepEqual(
      [0, 1, 2].map(copy.dashboard.workstreamCount),
      formatterSamples[locale].workstreamCount
    );
    assert.equal(copy.flows.trailMore(2), formatterSamples[locale].trailMore);
    assert.equal(
      copy.aiSkills.skillCountLabel(2),
      formatterSamples[locale].skillCountLabel
    );
    assert.equal(
      copy.checklists.structureDetail(2, 3),
      formatterSamples[locale].structureDetail
    );
    assert.ok(copy.navLabel.trim(), `${locale} navigation label`);
    assert.ok(copy.runtime.loading.trim(), `${locale} loading copy`);
    assert.ok(copy.runtime.loadErrorTitle.trim(), `${locale} error title`);
    assert.ok(copy.runtime.loadErrorDetail.trim(), `${locale} error detail`);
    assert.ok(copy.runtime.reload.trim(), `${locale} reload copy`);
    assert.match(workspace, new RegExp(`StudioAdminShell\\.${locale}`));
    const shell = readFileSync(`src/app/[locale]/studio/${shellFile}`, "utf8");
    assert.match(shell, new RegExp(`studio-shell-copy\\.${locale}`));
  }
  assert.equal(localeContract.normalizeStudioLocale("unknown"), "en");
});

test("Studio locale chunks are standalone and route metadata is copy-neutral", () => {
  const routes = readFileSync(
    "src/app/[locale]/studio/studio-route-definitions.ts",
    "utf8"
  );
  const contract = readFileSync(
    "src/app/[locale]/studio/studio-shell-copy.ts",
    "utf8"
  );
  const routeIdSet = new Set(studioRouteIds);
  let expectedStaticKeyPaths;
  for (const [locale, [exportName]] of Object.entries(localeModules)) {
    const adapter = readFileSync(
      `src/app/[locale]/studio/studio-shell-copy.${locale}.ts`,
      "utf8"
    );
    const { routes: routeCopy, ...staticCopy } = require(
      `../src/app/[locale]/studio/studio-shell-copy.${locale}.json`
    );
    const staticKeyPaths = collectObjectKeyPaths(staticCopy).sort(
      (left, right) => left.localeCompare(right)
    );
    if (expectedStaticKeyPaths === undefined) {
      expectedStaticKeyPaths = staticKeyPaths;
    } else {
      assert.deepEqual(
        staticKeyPaths,
        expectedStaticKeyPaths,
        `${locale} static key shape`
      );
    }
    for (const [routeId, localizedRoute] of Object.entries(routeCopy)) {
      assert.ok(routeIdSet.has(routeId), `${locale} route ${routeId}`);
      assert.deepEqual(
        Object.keys(localizedRoute).sort((left, right) =>
          left.localeCompare(right)
        ),
        ["description", "panels", "timeline", "title"],
        `${locale} route shape ${routeId}`
      );
    }
    assert.match(adapter, new RegExp(`studio-shell-copy\\.${locale}\\.json`));
    assert.match(adapter, /createStudioUiCopy/);
    for (const [otherLocale, [otherExportName]] of Object.entries(
      localeModules
    )) {
      if (otherLocale === locale) continue;
      assert.doesNotMatch(
        adapter,
        new RegExp(`studio-shell-copy\\.${otherLocale}|${otherExportName}`)
      );
    }
    assert.doesNotMatch(
      routes,
      new RegExp(`${exportName}|studio-shell-copy\\.${locale}`)
    );
  }
  assert.doesNotMatch(contract, /studio-shell-copy\.[a-z]{2}\.json/);
  assert.match(routes, /flowRouteMetadata/);
});
