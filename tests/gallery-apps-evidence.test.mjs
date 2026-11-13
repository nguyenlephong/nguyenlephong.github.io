import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// MEP-29 (gallery as an evidence page) and MEP-57 (/apps without console theatre).
const LOCALES = ["en", "vi", "fr", "ja", "ko", "zh"];
const read = (path) => readFileSync(path, "utf8");
const messages = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(read(`messages/${l}.json`))])
);
const galleryData = read("src/content/gallery.ts");
const groupOrder = JSON.parse(
  galleryData.match(/GALLERY_GROUP_ORDER: GalleryGroupId\[\] = (\[[^\]]+\])/)[1]
);
const photoIds = [...galleryData.matchAll(/id: "(\w+)"/g)].map((m) => m[1]);

test("gallery leads with BonBon Mobility and the sourced Wash3000 photo", () => {
  assert.deepEqual(groupOrder, ["bonbon", "recognition", "education", "outside", "earlier"]);
  assert.equal(photoIds[0], "wash3000DemoDay");
  assert.match(
    galleryData,
    /id: "wash3000DemoDay",[\s\S]*?refs: "https:\/\/genaifund\.ai\/2026\/09\/23\/genai-fund-backs-bonbon-500k\/"/
  );
  // The 2019 outsourcing form screenshot closes the page.
  assert.equal(photoIds.at(-1), "watProject");
  assert.doesNotMatch(galleryData, /alt: "Nguyen Le Phong - /);
});

test("gallery copy is plain: one caption per photo, no dash captions, no narration", () => {
  for (const locale of LOCALES) {
    const g = messages[locale].Pages.gallery;
    assert.deepEqual(Object.keys(g.categories), groupOrder, locale);
    assert.deepEqual(Object.keys(g.captions).sort(), [...photoIds].sort(), locale);
    for (const removed of ["eyebrow", "hero", "stats", "trust", "story", "categoryNotes", "categoryIntros"]) {
      assert.equal(g[removed], undefined, `${locale} ${removed}`);
    }
    for (const [key, caption] of Object.entries(g.captions)) {
      assert.doesNotMatch(caption, / - |—/, `${locale} ${key}`);
    }
  }
  assert.doesNotMatch(JSON.stringify(messages.vi.Pages.gallery), /mình/i);
});

test("gallery cards render visible by default with one eager LCP image", () => {
  const grid = read("src/components/gallery/GalleryGrid.tsx");
  assert.doesNotMatch(grid, /framer-motion|whileInView|initial=\{\{\s*opacity: 0/);
  assert.match(grid, /loading=\{eager \? 'eager' : 'lazy'\}/);
  assert.match(grid, /fetchPriority=\{eager \? 'high' : 'auto'\}/);
  assert.match(grid, /track\(\s*'gallery_tab_click'/);
  assert.match(grid, /track\('gallery_item_click'/);
});

test("gallery_tab_click filter ids are 'all' plus the group ids in page order", () => {
  const grid = read("src/components/gallery/GalleryGrid.tsx");
  const page = read("src/app/[locale]/(site)/gallery/page.tsx");
  assert.match(grid, /const GALLERY_FILTER_ALL = 'all'/);
  assert.match(grid, /\[GALLERY_FILTER_ALL, \.\.\.categories\.map\(\(c\) => c\.id\)\]/);
  assert.match(page, /GALLERY_GROUP_ORDER\.map\(\(id\) => \(\{/);
  // Dashboards filter on these values.
  assert.deepEqual(["all", ...groupOrder], ["all", "bonbon", "recognition", "education", "outside", "earlier"]);
});

test("/apps lists shipped apps only, with localized copy and no console controls", async () => {
  const { apps, appsPageCopy, appsCopyLocale } = await import(
    "../src/app/[locale]/(site)/apps/apps.data.ts"
  );
  assert.deepEqual(apps.map((a) => a.id), ["glance"]);
  assert.equal(appsCopyLocale("fr"), "en");
  assert.equal(appsCopyLocale("vi"), "vi");
  const vietnamese = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
  const en = JSON.stringify([appsPageCopy.en, apps.map((a) => a.copy.en)]);
  const vi = JSON.stringify([appsPageCopy.vi, apps.map((a) => a.copy.vi)]);
  assert.doesNotMatch(en, vietnamese);
  assert.match(vi, vietnamese);
  assert.doesNotMatch(read("src/app/[locale]/(site)/apps/apps.data.ts"), /—/);

  const list = read("src/components/apps/AppsConsole.tsx");
  assert.doesNotMatch(list, /setInterval|type="search"|apps_filter_click|apps\.inspect/);
  assert.match(list, /track\('apps_card_view'/);
  assert.match(list, /track\('apps_link_click'/);
  assert.doesNotMatch(read("src/lib/analytics.ts"), /'apps_filter_click'/);
});
