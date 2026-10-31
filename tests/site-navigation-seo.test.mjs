import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

function resolveProjectModule(url) {
  const basePath = fileURLToPath(url);
  for (const extension of ["", ".ts", ".tsx", ".js", ".mjs"]) {
    const candidate = basePath + extension;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveProjectModule(
        new URL("../src/" + specifier.slice(2), import.meta.url)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  }
});

const SITE_URL = "https://nguyenlephong.github.io";
const locales = ["en", "vi", "fr", "ja", "ko", "zh"];
const read = (path) => readFileSync(path, "utf8");
const messages = Object.fromEntries(
  locales.map((locale) => [locale, JSON.parse(read("messages/" + locale + ".json"))])
);

const { SITE_SECTIONS, sectionUrl } = await import("../src/lib/seo/site-sections.ts");
const {
  buildWebsiteSchema,
  buildSiteNavigationSchema,
  buildPersonSchema,
  buildProfilePageSchema
} = await import("../src/lib/seo/profile-schema.ts");
const { buildSectionBreadcrumb } = await import("../src/lib/seo/section-breadcrumb.ts");
const { PAGE_SEO, SITE } = await import("../src/app/seo.config.ts");

test("WebSite entity names the brand, its spellings, and every top-level section", () => {
  const website = buildWebsiteSchema("desc");

  assert.equal(website["@type"], "WebSite");
  assert.equal(website["@id"], SITE_URL + "/#website");
  assert.equal(website.name, "Nguyen Le Phong");
  assert.equal(website.name, SITE.name);
  assert.ok(website.alternateName.includes("Nguyễn Lê Phong"));
  assert.ok(website.alternateName.includes("nguyenlephong"));

  const parts = new Map(website.hasPart.map((part) => [part.name, part.url]));
  assert.deepEqual(
    [...parts.keys()],
    ["About", "Blog", "Notes", "Gallery", "Apps", "Studio"]
  );
  for (const [name, url] of parts) {
    assert.match(url, /^https:\/\/nguyenlephong\.github\.io\/en\/[a-z]+$/, name);
  }
});

test("WebSite has no SearchAction because the site has no crawlable search URL", () => {
  const website = buildWebsiteSchema("desc");
  assert.equal("potentialAction" in website, false);
  // Search runs client-side over the /search/*.json indexes; there is no ?q= results page.
  for (const file of [
    "src/components/blog/BlogExplorer.tsx",
    "src/components/notes/NotesExplorer.tsx"
  ]) {
    assert.doesNotMatch(read(file), /useSearchParams|\?q=/, file);
  }
});

test("SiteNavigationElement list is unique, absolute, and covers the resume", () => {
  const graph = buildSiteNavigationSchema("en")["@graph"];
  assert.equal(graph.length, SITE_SECTIONS.length);
  assert.equal(new Set(graph.map((node) => node.name)).size, graph.length);
  assert.equal(new Set(graph.map((node) => node.url)).size, graph.length);
  for (const node of graph) {
    assert.equal(node["@type"], "SiteNavigationElement");
    assert.match(node.url, /^https:\/\/nguyenlephong\.github\.io\//);
    assert.ok(node.description.length >= 40, node.name);
  }
  const resume = graph.find((node) => node.name === "Résumé");
  assert.equal(resume.url, SITE_URL + "/NguyenLePhong_Lead_Software_Engineer.pdf");
  assert.equal(sectionUrl(SITE_SECTIONS[0], "vi"), SITE_URL + "/vi");
});

test("home profile graph links to the WebSite and Person entities without a second WebSite", () => {
  const person = buildPersonSchema("desc");
  assert.ok(person.alternateName.includes("nguyenlephong"));
  const profilePage = buildProfilePageSchema("en", "title", "desc");
  assert.deepEqual(profilePage.isPartOf, { "@id": SITE_URL + "/#website" });
  assert.deepEqual(profilePage.mainEntity, { "@id": SITE_URL + "/#person" });
});

test("section breadcrumb is a two-step brand then section list", () => {
  const crumb = buildSectionBreadcrumb({
    locale: "vi",
    name: "Giới thiệu",
    url: SITE_URL + "/vi/about"
  });
  assert.equal(crumb["@type"], "BreadcrumbList");
  assert.deepEqual(
    crumb.itemListElement.map((item) => [item.position, item.name, item.item]),
    [
      [1, "Nguyen Le Phong", SITE_URL + "/vi"],
      [2, "Giới thiệu", SITE_URL + "/vi/about"]
    ]
  );
});

test("about, apps, gallery and studio emit a section breadcrumb", () => {
  for (const file of [
    "src/app/[locale]/(site)/about/page.tsx",
    "src/app/[locale]/(site)/apps/page.tsx",
    "src/app/[locale]/(site)/gallery/page.tsx",
    "src/app/[locale]/studio/page.tsx"
  ]) {
    const source = read(file);
    assert.match(source, /buildSectionBreadcrumb\(/, file);
    assert.match(source, /serializeJsonLd\(breadcrumbLd\)/, file);
  }
});

test("section titles are distinct, branded, short, and free of dashes in every locale", () => {
  for (const locale of locales) {
    const seo = messages[locale].SEO;
    const titles = Object.entries(seo).map(([page, copy]) => [page, copy.title]);
    assert.equal(
      new Set(titles.map(([, title]) => title)).size,
      titles.length,
      locale + " unique titles"
    );
    for (const [page, title] of titles) {
      assert.match(title, /Nguyen Le Phong|Nguyễn Lê Phong/, locale + " " + page + " brand");
      assert.ok(title.length <= 64, locale + " " + page + " title length " + title.length);
      assert.doesNotMatch(title, /[—–]/, locale + " " + page + " dash");
    }
    assert.match(
      seo.home.title,
      /^(Nguyen Le Phong|Nguyễn Lê Phong) \|/,
      locale + " home leads with the brand"
    );
  }
});

test("english and vietnamese section descriptions stay within snippet length", () => {
  for (const locale of ["en", "vi"]) {
    for (const [page, copy] of Object.entries(messages[locale].SEO)) {
      assert.ok(
        copy.description.length >= 115 && copy.description.length <= 160,
        locale + " " + page + " description length " + copy.description.length
      );
      assert.doesNotMatch(copy.description, /—/, locale + " " + page);
    }
  }
});

test("root stub and /en share the brand title, description and site name", () => {
  assert.equal(PAGE_SEO.home.title, messages.en.SEO.home.title);
  assert.equal(PAGE_SEO.home.description, messages.en.SEO.home.description);
  const root = read("src/app/page.tsx");
  assert.match(root, /title: SEO_TITLE/);
  assert.match(root, /buildSiteNavigationSchema/);
  assert.match(root, /<nav aria-label="Main sections">/);
  assert.match(root, /siteName: SITE\.name/);
  assert.match(read("src/app/[locale]/layout.tsx"), /siteName: SITE\.name/);
});

test("header is a labelled nav with crawlable section links and tracked clicks", () => {
  const header = read("src/components/AppHeader.tsx");
  assert.match(header, /<nav className="nav-links" aria-label="Main navigation">/);
  assert.match(header, /aria-label="Mobile navigation"/);
  assert.doesNotMatch(header, /"\/#about"/);
  for (const route of ["ABOUT", "BLOG", "NOTES", "GALLERY", "APPS"]) {
    assert.match(header, new RegExp("href: APP_ROUTE\\." + route), route);
  }
  assert.match(header, /track\("cv_nav_click", \{ target: item\.trackId \}\)/);
  for (const locale of locales) {
    assert.equal(typeof messages[locale].Nav.apps, "string", locale + " Nav.apps");
    assert.equal(typeof messages[locale].Nav.about, "string", locale + " Nav.about");
  }
});

test("no section is accidentally noindexed; only non-authored locale copies are", () => {
  const studio = read("src/app/[locale]/studio/page.tsx");
  assert.match(studio, /robots: \{\s*index: true,\s*follow: true/);
  const policy = read("src/lib/seo/static-page-localization.ts");
  assert.match(policy, /index: authored/);
  for (const file of [
    "src/app/[locale]/layout.tsx",
    "src/app/[locale]/(site)/layout.tsx",
    "src/app/robots.ts"
  ]) {
    assert.doesNotMatch(read(file), /noindex|index: false/, file);
  }
});
