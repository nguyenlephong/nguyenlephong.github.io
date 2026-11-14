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

const catalogModule = require("../src/app/[locale]/(site)/studio/studio-route-catalog.ts");
const staticContentModule = require("../src/app/[locale]/(site)/studio/studio-static-content.ts");

const STUDIO_DIR = "src/app/[locale]/(site)/studio";
// Old admin-template routes (MEP-13): they rendered a prefilled login and fake owner data.
const removedTemplateRouteIds = [
  "default", "crm", "finance", "analytics", "productivity", "ecommerce", "academy",
  "logistics", "infrastructure", "email", "chat", "calendar", "kanban", "invoice",
  "users", "roles", "auth-login-v1", "auth-login-v2", "auth-register-v1",
  "auth-register-v2", "legacy-default", "legacy-crm", "legacy-finance", "legacy-analytics"
];

test("Studio module pages, copy, and checklist order share one data-only catalog", () => {
  const { studioCatalog } = catalogModule;
  const catalogSource = readFileSync(`${STUDIO_DIR}/studio-route-catalog.ts`, "utf8");
  assert.deepEqual(Object.keys(studioCatalog).sort(), ["deliveryChecklistIds", "publicModules"]);
  for (const routeId of removedTemplateRouteIds) {
    assert.ok(!catalogSource.includes(`"${routeId}"`), `${routeId} is a removed admin-template route`);
  }

  const publicModuleIds = studioCatalog.publicModules.map((module) => module.routeId);

  // MEP-56: checklists lead, then system maps, then AI setup; each public module has its own page.
  assert.deepEqual(publicModuleIds, ["delivery-checklists", "flow-react-flow-system-blueprint", "ai-agent-setup"]);
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
