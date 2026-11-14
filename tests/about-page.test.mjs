import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile("src/app/[locale]/(site)/about/page.tsx", "utf8");
const aboutCss = await readFile(
  "src/app/[locale]/(site)/about/about.css",
  "utf8"
);
const analytics = await readFile("src/lib/analytics.ts", "utf8");
const locales = ["en", "vi", "fr", "ja", "ko", "zh"];
const messages = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [
      locale,
      JSON.parse(await readFile(`messages/${locale}.json`, "utf8"))
    ])
  )
);
const en = messages.en.About;
const vi = messages.vi.About;
const periods = ["early", "product", "scale", "handover", "now"];
const habits = ["scale", "handover", "zeroToOne", "platform"];

test("about tells the career arc, one period per move, in every locale", () => {
  assert.match(page, /const PERIODS = \[/);
  for (const id of periods) assert.match(page, new RegExp(`id: '${id}'`));
  for (const locale of locales) {
    const about = messages[locale].About;
    assert.deepEqual(Object.keys(about.story.periods), periods, `${locale} periods`);
    assert.deepEqual(Object.keys(about.arc).filter((k) => k !== "label"), periods, `${locale} arc`);
    for (const id of periods) {
      for (const field of ["dates", "where", "env", "body", "shift"]) {
        assert.ok(about.story.periods[id][field]?.trim(), `${locale} ${id}.${field}`);
      }
    }
  }
  // The current period names all three current roles; NDSVN is past.
  for (const name of ["Zalo PC", "BonBon Mobility", "LogiUP"]) {
    assert.match(en.story.periods.now.where, new RegExp(name));
  }
  assert.doesNotMatch(JSON.stringify(en), /team I lead|delivery team I lead|đang lead/);
  assert.doesNotMatch(JSON.stringify(vi), /tôi đang lead|team tôi đang dẫn/);
});

test("every habit carries one proof with a source, and numbers match the homepage", () => {
  for (const locale of locales) {
    assert.deepEqual(Object.keys(messages[locale].About.habits.items), habits, `${locale} habits`);
    for (const id of habits) {
      const item = messages[locale].About.habits.items[id];
      assert.ok(item.title && item.proof && item.source, `${locale} habit ${id}`);
    }
  }
  const enText = JSON.stringify(en);
  for (const fact of ["18M+ MAU", "8 developers and 3 QC", "30+ tenants", "$500K"]) {
    assert.ok(enText.includes(fact), `en fact: ${fact}`);
  }
  const viText = JSON.stringify(vi);
  for (const fact of ["18 triệu MAU", "8 developer và 3 QC", "30+ tenant", "500.000 USD"]) {
    assert.ok(viText.includes(fact), `vi fact: ${fact}`);
  }
  assert.doesNotMatch(viText, /, và /, "no comma before và");
});

test("the old NDSVN-era profile structure is gone", () => {
  for (const locale of locales) {
    const about = messages[locale].About;
    for (const key of ["hero", "systems", "stack", "principles"]) {
      assert.equal(about[key], undefined, `${locale} About.${key}`);
    }
  }
  const content = JSON.stringify(en);
  assert.doesNotMatch(content, /load[- ]balancer/i);
  assert.doesNotMatch(content, /AKS|FKE|K3S/);
  assert.doesNotMatch(page, /t\.raw\(|dangerouslySetInnerHTML=\{\{ __html: t/);
  assert.doesNotMatch(page, /eyebrow|about-system-grid|about-metrics/);
  assert.doesNotMatch(aboutCss, /eyebrow|about-metric|about-system-card|border-left: [2-9]px/);
  assert.doesNotMatch(aboutCss, /background-clip:\s*text/);
});

test("the page ends with tracked résumé, email and experience links", () => {
  assert.match(page, /data-track="cv_resume_download"\s+data-track-source="about"/);
  assert.match(
    page,
    /data-track="cv_contact_click"\s+data-track-channel="email"\s+data-track-source="about"/
  );
  assert.match(
    page,
    /href=\{`\$\{APP_ROUTE\.HOME\}#experience`\}\s+data-track="cv_nav_click"\s+data-track-target="experience"\s+data-track-source="about"/
  );
  assert.match(page, /<AppsLinkTracker \/>/);
  assert.match(page, /<PageTracker page="about" eventName="about_view" \/>/);
  // Arc jumps and writing links use the about_link_click event.
  assert.match(analytics, /\| 'about_link_click'/);
  assert.match(page, /data-track="about_link_click"\s+data-track-target="arc"\s+data-track-period=\{id\}/);
  assert.match(page, /data-track="about_link_click"\s+data-track-target=\{target\}/);
  for (const locale of locales) {
    const closing = messages[locale].About.closing;
    for (const key of ["body", "linksLabel", "resume", "email", "experience"]) {
      assert.ok(closing[key]?.trim(), `${locale} closing.${key}`);
    }
    for (const tag of ["blog", "notes", "note", "post"]) {
      assert.match(messages[locale].About.writing.body, new RegExp(`<${tag}>[^<]+</${tag}>`), `${locale} writing <${tag}>`);
    }
  }
  const order = ["about-intro", "about-story-title", "about-habits-title", "about-writing-title", "about-closing-links"]
    .map((marker) => page.indexOf(marker));
  assert.deepEqual([...order].sort((a, b) => a - b), order, "section order");
  assert.ok(order.every((index) => index > 0));
});

test("about keeps its route-owned stylesheet and motion guard", () => {
  assert.match(page, /import ['"]\.\/about\.css['"]/);
  assert.match(aboutCss, /\.about-page-v3\s*\{/);
  assert.match(aboutCss, /\.about-period::before\s*\{/);
  assert.match(aboutCss, /\.about-habit\s*\{/);
  assert.match(aboutCss, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.about-arc::before/);
});
