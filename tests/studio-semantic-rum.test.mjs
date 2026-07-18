import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScriptModule(path) {
  const source = await readFile(path, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  });
  const encoded = Buffer.from(outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

test("Studio keeps one localized light-DOM H1 through the shadow lifecycle", async () => {
  const [page, workspace, overview, shadowIsland, adminShell, shadowStyles, staticContent] =
    await Promise.all([
      readFile("src/app/[locale]/studio/page.tsx", "utf8"),
      readFile("src/app/[locale]/studio/StudioWorkspace.tsx", "utf8"),
      readFile("src/app/[locale]/studio/StudioStaticOverview.tsx", "utf8"),
      readFile("src/components/studio-kit/shadow-island.tsx", "utf8"),
      readFile("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8"),
      readFile("src/app/[locale]/studio/studio.shadow-styles.ts", "utf8"),
      importTypeScriptModule("src/app/[locale]/studio/studio-static-content.ts")
    ]);

  assert.equal(page.match(/<h1\b/g)?.length, 1);
  assert.match(page, /data-studio-page-heading="true"/);
  assert.match(page, /slot="studio-page-heading"/);
  assert.match(page, /\{staticContent\.title\}<\/h1>/);
  assert.doesNotMatch(page, /studio-page-heading__title[^}]*display:\s*none/);

  assert.match(workspace, /heading=\{heading\}/);
  assert.match(shadowIsland, /data-shadow-ready=\{root \? "true" : "false"\}/);
  assert.match(shadowIsland, /\{heading\}[\s\S]*\{root[\s\S]*createPortal/);
  assert.match(adminShell, /<slot name="studio-page-heading" \/>/);
  assert.match(adminShell, /<h2>\{route\.title\}<\/h2>/);

  for (const shadowSource of [overview, shadowIsland, adminShell]) {
    assert.doesNotMatch(shadowSource, /<h1\b/);
  }
  assert.doesNotMatch(shadowStyles, /route-heading h1|welcome-intro h1|auth-card h1/);

  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    const content = staticContent.getStudioStaticContent(locale);
    assert.ok(content.title.trim().length > 0, `${locale} Studio title must be localized`);
  }
});

test("one root RUM reporter covers site and Studio without losing metric precision", async () => {
  const [reporter, contextModule, rootLayout, siteLayout, analytics] = await Promise.all([
    readFile("src/components/analytics/WebVitalsReporter.tsx", "utf8"),
    importTypeScriptModule("src/components/analytics/web-vitals-context.ts"),
    readFile("src/app/[locale]/layout.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/layout.tsx", "utf8"),
    readFile("src/lib/analytics.ts", "utf8")
  ]);

  assert.equal(contextModule.resolveWebVitalSurface("/en/studio"), "studio");
  assert.equal(contextModule.resolveWebVitalSurface("/vi/studio?route=ai-skills"), "studio");
  assert.equal(contextModule.resolveWebVitalSurface("/en/blog"), "site");
  assert.equal(contextModule.resolveWebVitalSurface("/fr"), "site");

  assert.match(rootLayout, /<WebVitalsReporter locale=\{locale\} \/>/);
  assert.equal(rootLayout.match(/<WebVitalsReporter\b/g)?.length, 1);
  assert.doesNotMatch(siteLayout, /\bWebVitalsReporter\b/);

  assert.match(reporter, /useCallback<ReportWebVitalsCallback>/);
  assert.match(reporter, /useReportWebVitals\(reportWebVitals\)/);
  assert.match(reporter, /value:\s*metric\.value/);
  assert.match(reporter, /delta:\s*metric\.delta/);
  assert.match(reporter, /rating:\s*metric\.rating/);
  assert.match(reporter, /navigation_type:\s*metric\.navigationType/);
  assert.match(reporter, /path,/);
  assert.match(reporter, /surface:\s*resolveWebVitalSurface/);
  assert.match(reporter, /locale:\s*context\.locale/);
  assert.doesNotMatch(reporter, /Math\.round/);

  assert.match(analytics, /\| 'web_vital'/);
  assert.match(analytics, /export type WebVitalAnalyticsPayload/);
  assert.match(analytics, /if \(isDoNotTrack\(\)\) return/);
});
