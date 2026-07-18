import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScript(source) {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}

test("global not-found uses one static document with safe SEO metadata", async () => {
  const [config, globalNotFound, recovery, routingSource, postbuild, spec] =
    await Promise.all([
      readFile("next.config.mjs", "utf8"),
      readFile("src/app/global-not-found.tsx", "utf8"),
      readFile("src/components/not-found/NotFoundRecovery.tsx", "utf8"),
      readFile("src/components/not-found/not-found-routing.ts", "utf8"),
      readFile("scripts/postbuild-offline.mjs", "utf8"),
      readFile("specs/static-not-found-recovery.md", "utf8")
    ]);

  assert.match(
    config,
    /experimental:\s*\{[\s\S]*globalNotFound:\s*!isDevelopment/
  );
  assert.match(globalNotFound, /<html lang="en" suppressHydrationWarning>/);
  assert.match(globalNotFound, /metadataBase: new URL\(SITE_URL\)/);
  assert.doesNotMatch(
    globalNotFound,
    /robots:\s*\{/,
    'Next should emit its automatic noindex once for the 404 response',
  );
  assert.doesNotMatch(globalNotFound, /canonical|alternates/);
  assert.match(
    globalNotFound,
    /<PostHogBootstrap locale="en" surface="not_found"/
  );

  assert.equal((recovery.match(/<h1\b/g) ?? []).length, 1);
  assert.match(recovery, /window\.location\.pathname/);
  assert.match(recovery, /document\.documentElement\.lang = context\.locale/);
  assert.match(recovery, /page="not_found"/);
  assert.match(recovery, /eventName="not_found_view"/);
  assert.match(recovery, /omitLocation/);
  assert.match(recovery, /track\(\s*"not_found_recovery_click"/);
  assert.match(recovery, /routing\.locales\.map/);
  assert.match(recovery, /aria-label=\{copy\.recoveryLabel\}/);
  assert.doesNotMatch(recovery, /from ["']next\/link["']|prefetch=/);

  assert.match(routingSource, /routing\.locales\.some/);
  assert.match(routingSource, /routing\.defaultLocale/);
  assert.match(routingSource, /return `\/\$\{locale\}`/);
  assert.match(routingSource, /return `\/\$\{locale\}\/\$\{target\}`/);
  assert.match(
    postbuild,
    /const ESSENTIAL_SHELL_FILES = \[[\s\S]*'404\.html'[\s\S]*'_not-found\.html'/,
  );
  assert.match(spec, /AC-404-006/);
});

test("not-found route detection keeps locale and surface recovery bounded", async () => {
  const source = await readFile(
    "src/components/not-found/not-found-routing.ts",
    "utf8"
  );
  const executable = source.replace(
    /import \{ routing, type Locale \} from [^\n]+\n/,
    "const routing = { locales: ['en', 'vi', 'zh', 'ja', 'ko', 'fr'], defaultLocale: 'en' }\n"
  );
  const routingModule = await importTypeScript(executable);

  assert.deepEqual(routingModule.resolveNotFoundContext("/zh/blog/old-slug"), {
    locale: "zh",
    surface: "blog"
  });
  assert.deepEqual(routingModule.resolveNotFoundContext("/fr/notes/ancien"), {
    locale: "fr",
    surface: "notes"
  });
  assert.deepEqual(routingModule.resolveNotFoundContext("/es/blog/missing"), {
    locale: "en",
    surface: "other"
  });
  assert.deepEqual(routingModule.resolveNotFoundContext("/blog/missing?x=1"), {
    locale: "en",
    surface: "blog"
  });
  assert.deepEqual(routingModule.orderedRecoveryTargets("notes"), [
    "notes",
    "blog",
    "home"
  ]);

  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    assert.equal(routingModule.recoveryHref(locale, "home"), `/${locale}`);
    assert.equal(routingModule.recoveryHref(locale, "blog"), `/${locale}/blog`);
    assert.equal(
      routingModule.recoveryHref(locale, "notes"),
      `/${locale}/notes`
    );
  }
});

test("every supported locale has calm and complete recovery copy", async () => {
  const source = await readFile(
    "src/components/not-found/not-found-content.ts",
    "utf8"
  );
  const contentModule = await importTypeScript(source);

  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    const copy = contentModule.getNotFoundCopy(locale);
    assert.ok(copy.metaTitle.length > 12);
    assert.ok(copy.title.length > 8);
    assert.ok(copy.recoveryLabel.length > 2);
    assert.ok(copy.languageTitle.length > 2);
    assert.ok(copy.languageDescription.length > 12);
    for (const surface of ["blog", "notes", "other"]) {
      assert.ok(copy.descriptions[surface].length > 24);
    }
    for (const target of ["home", "blog", "notes"]) {
      assert.ok(copy.actions[target].length > 3);
    }
  }

  assert.doesNotMatch(source, /oops|uh[- ]oh|you entered|your mistake/i);
});

test("not-found analytics shares the existing privacy-safe bootstrap", async () => {
  const [layout, globalNotFound, bootstrap, tracker, analytics, verifier] =
    await Promise.all([
      readFile("src/app/[locale]/layout.tsx", "utf8"),
      readFile("src/app/global-not-found.tsx", "utf8"),
      readFile("src/components/analytics/PostHogBootstrap.tsx", "utf8"),
      readFile("src/components/analytics/PageTracker.tsx", "utf8"),
      readFile("src/lib/analytics.ts", "utf8"),
      readFile("scripts/verify-static-not-found.mjs", "utf8")
    ]);

  assert.match(layout, /<PostHogBootstrap locale=\{locale\} \/>/);
  assert.match(
    globalNotFound,
    /<PostHogBootstrap locale="en" surface="not_found" \/>/
  );
  assert.equal((layout.match(/posthog\.init/g) ?? []).length, 0);
  assert.equal((globalNotFound.match(/posthog\.init/g) ?? []).length, 0);
  assert.equal((bootstrap.match(/posthog\.init/g) ?? []).length, 1);
  assert.match(bootstrap, /defaults:'2026-01-30'/);
  assert.match(bootstrap, /autocapture:\s*false/);
  assert.match(bootstrap, /disable_session_recording:\s*true/);
  assert.match(bootstrap, /respect_dnt:\s*true/);
  assert.match(bootstrap, /persistence:\s*'localStorage\+cookie'/);
  assert.match(
    bootstrap,
    /captureAutomaticPageLifecycle = surface !== "not_found"/
  );
  assert.match(
    bootstrap,
    /capture_pageview: \$\{JSON\.stringify\(captureAutomaticPageLifecycle\)\}/
  );
  assert.match(
    bootstrap,
    /capture_pageleave: \$\{JSON\.stringify\(captureAutomaticPageLifecycle\)\}/
  );
  assert.match(tracker, /\| 'not_found'/);
  assert.match(tracker, /\| 'not_found_view'/);
  assert.match(tracker, /context\?: Readonly<Record<string, unknown>>/);
  assert.match(tracker, /omitLocation\?: boolean/);
  assert.match(tracker, /const trackOptions = omitLocation/);
  assert.match(analytics, /\| 'not_found_view'/);
  assert.match(analytics, /\| 'not_found_recovery_click'/);
  assert.match(analytics, /omitLocation\?: boolean/);
  assert.match(analytics, /options\?\.omitLocation/);
  assert.match(verifier, /verifyCommonPrivacyCase/);
  assert.match(verifier, /captureResult, false/);
  assert.match(verifier, /captureResult, true/);
  assert.match(verifier, /normal pages must install a PostHog before_send callback/);
});

test("CI verifies the generated not-found document in a browser", async () => {
  const [packageJson, deployWorkflow, ciWorkflow] = await Promise.all([
    readFile("package.json", "utf8"),
    readFile(".github/workflows/nextjs.yml", "utf8"),
    readFile(".github/workflows/ci-frontend.yml", "utf8")
  ]);
  const scripts = JSON.parse(packageJson).scripts;

  assert.equal(
    scripts["verify:not-found"],
    "node scripts/verify-static-not-found.mjs"
  );
  for (const workflow of [deployWorkflow, ciWorkflow]) {
    assert.match(workflow, /Verify localized 404 recovery/);
    assert.match(workflow, /npm run verify:not-found/);
  }
});
