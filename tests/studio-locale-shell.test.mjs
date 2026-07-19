import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  module._compile(output, filename);
};

const localeContract = require("../src/app/[locale]/studio/studio-shell-copy.ts");
const localeModules = {
  en: ["studio-shell-copy.en.ts", "englishStudioCopy"],
  vi: ["studio-shell-copy.vi.ts", "vietnameseStudioCopy"],
  zh: ["studio-shell-copy.zh.ts", "chineseStudioCopy"],
  ja: ["studio-shell-copy.ja.ts", "japaneseStudioCopy"],
  ko: ["studio-shell-copy.ko.ts", "koreanStudioCopy"],
  fr: ["studio-shell-copy.fr.ts", "frenchStudioCopy"]
};

test("Studio preserves exact interactive copy modules for every public locale", () => {
  const workspace = readFileSync("src/app/[locale]/studio/StudioWorkspace.tsx", "utf8");
  for (const [locale, [file, exportName]] of Object.entries(localeModules)) {
    assert.equal(localeContract.normalizeStudioLocale(locale), locale);
    const localeModule = require(`../src/app/[locale]/studio/${file}`);
    const copy = localeModule[exportName];
    assert.ok(copy.navLabel.trim(), `${locale} navigation label`);
    assert.ok(copy.runtime.loading.trim(), `${locale} loading copy`);
    assert.ok(copy.runtime.loadErrorTitle.trim(), `${locale} error title`);
    assert.ok(copy.runtime.loadErrorDetail.trim(), `${locale} error detail`);
    assert.ok(copy.runtime.reload.trim(), `${locale} reload copy`);
    assert.match(workspace, new RegExp(`StudioAdminShell\\.${locale}`));
  }
  assert.equal(localeContract.normalizeStudioLocale("unknown"), "en");
});

test("Studio locale chunks are standalone and route metadata is copy-neutral", () => {
  const en = readFileSync("src/app/[locale]/studio/studio-shell-copy.en.ts", "utf8");
  const vi = readFileSync("src/app/[locale]/studio/studio-shell-copy.vi.ts", "utf8");
  const routes = readFileSync("src/app/[locale]/studio/studio-route-definitions.ts", "utf8");
  assert.doesNotMatch(en, /Studio cá nhân|Không thể tải|Đang tải không gian/);
  assert.doesNotMatch(vi, /studio-shell-copy\.en|englishStudioCopy/);
  assert.doesNotMatch(routes, /englishStudioCopy|studio-shell-copy\.en/);
  assert.match(routes, /flowRouteMetadata/);
});
