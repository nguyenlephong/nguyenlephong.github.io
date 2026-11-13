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
  buildWebsiteIdentitySchema,
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

test("every locale home carries the compact WebSite node the root stub extends (MEP-60)", () => {
  const identity = buildWebsiteIdentitySchema();
  assert.equal(identity["@type"], "WebSite");
  assert.equal(identity["@id"], SITE_URL + "/#website");
  assert.equal(identity.url, SITE_URL + "/");
  assert.equal(identity.name, SITE.name);
  assert.equal(identity.alternateName[0], "Nguyễn Lê Phong");
  assert.deepEqual(identity.publisher, { "@id": SITE_URL + "/#person" });
  assert.equal("hasPart" in identity, false);
  // Kept small for the home HTML budget, and identical to the root node's identity fields.
  assert.ok(JSON.stringify(identity).length < 400);
  const root = buildWebsiteSchema("desc");
  for (const [key, value] of Object.entries(identity)) {
    assert.deepEqual(root[key], value, key);
  }
  // The ids the ProfilePage and Person reference resolve on the same page.
  assert.equal(buildProfilePageSchema("vi", "t", "d").isPartOf["@id"], identity["@id"]);
  assert.equal(buildPersonSchema("d")["@id"], identity.publisher["@id"]);
});

test("home profile graph links to the WebSite and Person entities without a second WebSite", () => {
  const person = buildPersonSchema("desc");
  assert.ok(person.alternateName.includes("nguyenlephong"));
  const profilePage = buildProfilePageSchema("en", "title", "desc");
  assert.deepEqual(profilePage.isPartOf, { "@id": SITE_URL + "/#website" });
  assert.deepEqual(profilePage.mainEntity, { "@id": SITE_URL + "/#person" });
});

test("home Person JSON-LD matches the evidence ledger and publishes no contact details", () => {
  const person = buildPersonSchema("desc");
  assert.equal(person.url, SITE_URL + "/en");
  assert.equal(person.jobTitle, "Lead Software Engineer");
  assert.equal(person.worksFor.name, "Zalo");
  assert.equal(person.affiliation.name, "BonBon Mobility");
  assert.deepEqual(person.alumniOf, { "@type": "CollegeOrUniversity", name: "Nong Lam University" });
  const serialized = JSON.stringify(person);
  assert.doesNotMatch(serialized, /telephone|"email"|mailto:|@gmail\.com/);
  assert.doesNotMatch(serialized, /GPA|\d+[KM]\+?\s*MAU/);
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
    "src/app/[locale]/(site)/gallery/page.tsx"
  ]) {
    const source = read(file);
    assert.match(source, /buildSectionBreadcrumb\(/, file);
    assert.match(source, /serializeJsonLd\(breadcrumbLd\)/, file);
  }
  // Studio hands its JSON-LD to the shared frame, which serializes every entry.
  const studio = read("src/app/[locale]/studio/page.tsx");
  assert.match(studio, /buildSectionBreadcrumb\(/);
  assert.match(studio, /jsonLd=\{\[collectionLd, breadcrumbLd\]\}/);
  assert.match(read("src/app/[locale]/studio/StudioPageFrame.tsx"), /serializeJsonLd\(value\)/);
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
  assert.match(header, /<nav className="nav-links" aria-label=\{t\("mainNav"\)\}>/);
  assert.doesNotMatch(header, /"\/#about"/);
  for (const route of ["ABOUT", "BLOG", "NOTES", "APPS"]) {
    assert.match(header, new RegExp("href: APP_ROUTE\\." + route), route);
  }
  assert.match(header, /track\("cv_nav_click", \{ target: item\.trackId \}\)/);
  for (const key of ["apps", "about", "experience", "projects", "notes", "blog"]) {
    for (const locale of locales) {
      assert.equal(typeof messages[locale].Nav[key], "string", `${locale} Nav.${key}`);
    }
  }
});

// MEP-27: recruiter order, CV sections first; Gallery lives in the footer.
test("header nav leads with Experience and Projects and marks the current page", () => {
  const header = read("src/components/AppHeader.tsx");
  const order = [...header.matchAll(/trackId: "([a-z]+)"/g)].map((match) => match[1]);
  assert.deepEqual(order, ["experience", "projects", "about", "blog", "notes", "apps"]);
  assert.match(header, /href: `\$\{APP_ROUTE\.HOME\}#experience`/);
  assert.match(header, /href: `\$\{APP_ROUTE\.HOME\}#projects`/);
  assert.doesNotMatch(header, /APP_ROUTE\.GALLERY/);
  assert.equal((header.match(/aria-current=\{currentPage\(item\.href\)\}/g) ?? []).length, 2);
  const css = read("src/app/globals.css");
  // The active link is marked by an underline too, not by colour alone.
  assert.match(css, /\.nav-link\[aria-current="page"\]::after \{ transform: scaleX\(1\); \}/);
  assert.match(css, /\.nav-mobile-link\[aria-current="page"\] \{[^}]*text-decoration: underline/);
});

test("header carries the language switcher on desktop and in the mobile panel", () => {
  const header = read("src/components/AppHeader.tsx");
  assert.match(header, /<LocaleSwitcher placement="down" compact source="header" \/>/);
  assert.match(header, /<div className="nav-mobile-footer">\s*<LocaleSwitcher placement="down" source="mobile-nav" \/>/);
  const switcher = read("src/components/LocaleSwitcher.tsx");
  assert.match(switcher, /track\('locale_change', \{ from: currentLocale, to: nextLocale, source \}\)/);
  // Closed options must leave the tab order, not just turn transparent.
  const css = read("src/app/globals.css");
  const closed = css.match(/\n\.locale-menu-list \{[^}]*\}/)?.[0] ?? "";
  assert.match(closed, /visibility: hidden;/);
  assert.match(css, /\.locale-menu\.is-open \.locale-menu-list \{[^}]*visibility: visible;/);
});

// MEP-30: the open menu is a modal in every locale; the theme control is one tab stop.
test("mobile menu is opaque, traps focus, closes on Escape and speaks the page language", () => {
  const header = read("src/components/AppHeader.tsx");
  assert.doesNotMatch(header, /"(Open menu|Close menu|Main navigation|Mobile navigation)"/);
  assert.match(header, /aria-label=\{menuOpen \? t\("menuClose"\) : t\("menuOpen"\)\}/);
  assert.equal((header.match(/aria-label=\{t\("mainNav"\)\}/g) ?? []).length, 2);
  // Everything outside header and panel goes inert; brand and Résumé inside the header too.
  assert.match(header, /muted\.forEach\(\(el\) => \(el\.inert = true\)\)/);
  assert.match(header, /muted\.forEach\(\(el\) => \(el\.inert = false\)\)/);
  assert.equal((header.match(/inert=\{menuOpen\}/g) ?? []).length, 2);
  // Crossing the desktop breakpoint closes the menu so the page never stays inert.
  assert.match(header, /matchMedia\("\(min-width: 1024px\)"\)/);
  assert.match(header, /removeEventListener\("change", onWide\)/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /toggleRef\.current\?\.focus\(\)/);
  assert.match(header, /track\("cv_nav_click", \{ target: "home" \}\)/);
  for (const locale of locales) {
    for (const key of ["mainNav", "menuOpen", "menuClose"]) {
      assert.equal(typeof messages[locale].Nav[key], "string", `${locale} Nav.${key}`);
    }
    for (const key of ["label", "light", "system", "dark"]) {
      assert.equal(typeof messages[locale].Nav.theme?.[key], "string", `${locale} Nav.theme.${key}`);
    }
  }
  assert.notEqual(messages.vi.Nav.menuOpen, messages.en.Nav.menuOpen);

  const css = read("src/app/globals.css");
  const panel = css.match(/\n\.nav-mobile-panel \{[^}]*\}/)?.[0] ?? "";
  assert.match(panel, /background: var\(--bg\);/);
  assert.doesNotMatch(panel, /backdrop-filter|color-mix/);
  // The brand name is the link's accessible name at phone width, so it is clipped, never display:none.
  assert.doesNotMatch(css, /\.brand-text \{ display: none; \}/);
  assert.match(css, /\.brand-text \{[^}]*clip-path: inset\(50%\);/);

  const toggle = read("src/components/theme/ThemeToggle.tsx");
  assert.match(toggle, /tabIndex=\{setting === opt\.value \? 0 : -1\}/);
  assert.match(toggle, /ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1/);
  assert.match(toggle, /aria-label=\{t\('label'\)\}/);
});

// MEP-28: both roles, résumé and email, labelled internal links outside the profiles list.
test("footer names both roles and keeps internal pages out of the profiles list", async () => {
  const footer = read("src/components/AppFooter.tsx");
  assert.match(footer, /import \{ email, social as c \} from '@\/content\/social'/);
  const [profiles, site] = footer
    .slice(footer.indexOf("aria-label={t('contactLabel')}"))
    .split("footer-links--site");
  assert.doesNotMatch(profiles, /APP_ROUTE\.(APPS|STUDIO|GALLERY)|studioHref/);
  assert.match(profiles, /track\('cv_resume_download', \{ source: 'footer' \}\)/);
  assert.match(profiles, /track\('cv_contact_click', \{ channel: 'email', source: 'footer' \}\)/);
  assert.match(profiles, /href=\{`mailto:\$\{email\}`\}/);
  for (const target of ["gallery_footer", "apps_footer", "studio_footer", "sitemap_footer"]) {
    assert.match(site, new RegExp(`target: '${target}'`), target);
  }
  assert.doesNotMatch(footer, /aria-label="(Social profiles|Apps|Studio)"/);
  for (const locale of locales) {
    const f = messages[locale].Footer;
    assert.match(f.tag, /Zalo PC/, locale);
    assert.match(f.tag, /BonBon Mobility/, locale);
    assert.doesNotMatch(f.tag, /\u2014/, locale);
    for (const key of ["email", "photos", "sideProjects", "studioHint", "contactLabel", "siteLabel"]) {
      assert.equal(typeof f[key], "string", `${locale} Footer.${key}`);
    }
  }
});

test("no section is accidentally noindexed; only non-authored locale copies are", () => {
  // MEP-54: Studio stays indexable in its authored locales (en, vi) through the static-page policy.
  const studio = read("src/app/[locale]/studio/page.tsx");
  assert.match(studio, /resolveStaticPageLocalization\("studio", locale\)/);
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

test("blog and notes index pages emit a breadcrumb and use the colon title pattern", () => {
  for (const file of [
    "src/components/blog/BlogCollectionPage.tsx",
    "src/components/notes/NotesCollectionPage.tsx"
  ]) {
    const source = read(file);
    assert.match(source, /<SectionBreadcrumbJsonLd/, file);
    assert.match(source, /page === 1 \? \(/, file);
    assert.match(source, /collectionPageTitle\(page, t\('title'\), t\('eyebrow'\), pageLabel\)/, file);
  }
  assert.match(
    read("src/lib/seo/collection-title.ts"),
    /\$\{title\}: \$\{page === 1 \? eyebrow : pageLabel\}/
  );
});
