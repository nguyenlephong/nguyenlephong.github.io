// MEP-33, MEP-61, MEP-63, MEP-64, MEP-65: collection SEO copy, the localized name, section social
// cards with localized alts, and no hreflang on paged archives.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL("../src/" + specifier.slice(2), import.meta.url));
      for (const extension of ["", ".ts", ".tsx"]) {
        if (existsSync(base + extension) && (extension || /\.[a-z]+$/.test(base))) {
          return { url: pathToFileURL(base + extension).href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  }
});

const require = createRequire(import.meta.url);
const { fillMetadataSegment } = require("next/dist/lib/metadata/get-metadata-route");
const { segmentOgImagePath, sectionOgImages } = await import("../src/lib/seo/section-og-image.ts");
const { displayName } = await import("../src/app/seo.config.ts");
const { isPagedArchivePath } = await import("../src/lib/content/pagination.ts");

const locales = ["en", "vi", "fr", "ja", "ko", "zh"];
const read = (path) => readFileSync(path, "utf8");
const messages = Object.fromEntries(
  locales.map((locale) => [locale, JSON.parse(read(`messages/${locale}.json`))])
);

test("section card URLs match the routes Next emits for each opengraph-image", () => {
  const cases = [
    ["/[locale]/(site)", { locale: "vi" }],
    ["/[locale]/(site)/blog", { locale: "en" }],
    ["/[locale]/(site)/notes", { locale: "vi" }],
    ["/[locale]/(site)/about", { locale: "fr" }],
    ["/[locale]/(site)/gallery", { locale: "ja" }],
    ["/[locale]/(site)/apps", { locale: "en" }],
    ["/[locale]/(site)/blog/[category]", { locale: "vi", category: "architecture" }],
    ["/[locale]/(site)/studio", { locale: "ko" }]
  ];
  for (const [segment, params] of cases) {
    assert.equal(
      segmentOgImagePath(segment, params),
      fillMetadataSegment(segment, params, "opengraph-image", false),
      segment
    );
  }
  // The name the last build actually published, so a Next upgrade that renames routes fails here.
  assert.equal(segmentOgImagePath("/[locale]/(site)/blog", { locale: "en" }), "/en/blog/opengraph-image-sqz7no");
  assert.throws(() => segmentOgImagePath("/[locale]/(site)/blog/[category]", { locale: "en" }));

  const [image] = sectionOgImages("/[locale]/(site)/notes", { locale: "vi" }, "Ghi chép");
  assert.match(image.url, /^https:\/\/nguyenlephong\.github\.io\/vi\/notes\/opengraph-image-[a-z0-9]{6}$/);
  assert.equal(image.alt, "Ghi chép");
});

test("every segment a page points its card at has an opengraph-image route", () => {
  const sources = [
    "src/components/blog/BlogCollectionPage.tsx",
    "src/components/notes/NotesCollectionPage.tsx",
    "src/lib/content/hub-page.ts",
    "src/lib/seo/static-page-localization.ts",
    "src/app/[locale]/(site)/page.tsx",
    "src/app/[locale]/(site)/sitemap/page.tsx",
    "src/app/[locale]/(site)/blog/[category]/page.tsx"
  ].map(read).join("\n");
  const segments = new Set(
    [...sources.matchAll(/'(\/\[locale\][^']*)'/g)]
      .map((match) => match[1])
      .filter((segment) => !segment.includes("/page/"))
  );
  assert.ok(segments.size >= 8, [...segments].join(", "));
  for (const segment of segments) {
    assert.ok(existsSync(`src/app${segment}/opengraph-image.tsx`), segment);
  }
});

test("collection pages and hubs drop hreflang from page 2 on (MEP-65)", () => {
  assert.equal(isPagedArchivePath("/blog"), false);
  assert.equal(isPagedArchivePath("/blog/page/2"), true);
  assert.equal(isPagedArchivePath("/blog/series/foundations/page/12"), true);
  assert.equal(isPagedArchivePath("/notes/topics/page"), false);
  for (const file of [
    "src/components/blog/BlogCollectionPage.tsx",
    "src/components/notes/NotesCollectionPage.tsx",
    "src/lib/content/hub-page.ts",
    "src/app/sitemap.ts"
  ]) {
    assert.match(read(file), /isPagedArchivePath\(/, file);
  }
});

test("blog and notes read one localized SEO source with snippet-sized descriptions (MEP-61)", () => {
  for (const locale of locales) {
    for (const page of ["blog", "notes"]) {
      const { title, description } = messages[locale].SEO[page];
      assert.ok(title.length <= 64, `${locale} ${page} title ${title.length}`);
      assert.doesNotMatch(title + description, /[—–]/, `${locale} ${page}`);
      const cjk = ["ja", "ko", "zh"].includes(locale);
      if (cjk) assert.ok(description.length <= 88, `${locale} ${page} description ${description.length}`);
      else {
        assert.ok(
          description.length >= 110 && description.length <= 160,
          `${locale} ${page} description ${description.length}`
        );
      }
    }
  }
  for (const [file, namespace] of [
    ["src/components/blog/BlogCollectionPage.tsx", "SEO.blog"],
    ["src/components/notes/NotesCollectionPage.tsx", "SEO.notes"]
  ]) {
    const source = read(file);
    assert.match(source, new RegExp(`namespace: '${namespace.replace(".", "\\.")}'`), file);
    assert.match(source, /title: page === 1 \? \{ absolute: title \} : title/, file);
  }
});

test("Vietnamese pages carry the name with diacritics, other locales keep the Latin form (MEP-63)", () => {
  assert.equal(displayName("vi"), "Nguyễn Lê Phong");
  for (const locale of ["en", "fr", "ja", "ko", "zh"]) {
    assert.equal(displayName(locale), "Nguyen Le Phong");
  }
  assert.match(read("src/app/[locale]/layout.tsx"), /template: `%s \| \$\{displayName\(locale\)\}`/);
  assert.match(read("src/components/cv/Hero.tsx"), /\{displayName\(locale\)\}/);
  for (const copy of Object.values(messages.vi.SEO)) {
    assert.doesNotMatch(copy.title, /Nguyen Le Phong/);
  }
  for (const copy of Object.values(messages.en.SEO)) {
    assert.doesNotMatch(copy.title, /Nguyễn/);
  }
});

test("the HTML sitemap leads with the profile surfaces and the résumé (MEP-33)", () => {
  const source = read("src/app/[locale]/(site)/sitemap/page.tsx");
  const block = source.slice(source.indexOf("const sections: HubLink[]"));
  const order = [
    "t('sections.home')",
    "nav('experience')",
    "nav('projects')",
    "t('sections.about')",
    "cta('resumePdf')",
    "t('sections.blog')",
    "t('sections.notes')",
    "t('sections.gallery')",
    "t('sections.apps')",
    "t('sections.studio')"
  ].map((label) => block.indexOf(label));
  assert.ok(order.every((index) => index > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(source, /href: APP_ROUTE\.CV_PDF, label: cta\('resumePdf'\), resume: true/);
  assert.match(source, /data-track="cv_resume_download"\s+data-track-source="sitemap"/);
  assert.match(source, /<AppsLinkTracker \/>/);
  assert.equal((source.match(/<BackToTop label=\{t\('backToTop'\)\} \/>/g) ?? []).length, 5);
  assert.equal(messages.en.SiteIndex.metaTitle, "Sitemap: profile, articles and notes");
  assert.equal(messages.vi.SiteIndex.metaTitle, "Sơ đồ trang: hồ sơ, bài viết và ghi chép");
  assert.equal(messages.vi.SiteIndex.backToTop, "Lên đầu trang");
});
