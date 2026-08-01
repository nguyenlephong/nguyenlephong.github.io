import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const locales = ["en", "vi", "zh", "ja", "ko", "fr"];

async function read(relativePath) {
  return readFile(relativePath, "utf8");
}

test("every locale presents the current Zalo PC lead journey", async () => {
  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));
    const lead = messages.Experience.zalo.lead;

    assert.match(messages.Hero.role, /Lead Software Engineer/);
    assert.match(messages.Footer.tag, /Lead Software Engineer/);
    assert.match(messages.SEO.home.title, /Lead Software Engineer/);
    assert.equal(Array.isArray(lead.summaries), true);
    assert.equal(lead.summaries.length, 1);
    assert.equal(lead.contributions.length, 3);
    assert.match(JSON.stringify(lead), /Zalo PC/);
    assert.match(JSON.stringify(lead), /mobile|モバイル|移动端|모바일/);
    assert.equal(typeof messages.Experience.labels.publicEvidence, "string");
    assert.match(messages.Experience.labels.readCoverage, /\{publisher\}/);
  }

  const en = JSON.parse(await read("messages/en.json"));
  const vi = JSON.parse(await read("messages/vi.json"));
  assert.match(en.Experience.zalo.lead.summaries[0], /March 2, 2026/);
  assert.match(vi.Experience.zalo.lead.summaries[0], /02\/03\/2026/);
  assert.match(en.Experience.zalo.lead.contributions[0], /message backup/);
  assert.match(vi.Experience.zalo.lead.contributions[0], /backup tin nhắn/);
  assert.match(en.Experience.zalo.lead.contributions[1], /zCloud offload/);
  assert.match(vi.Experience.zalo.lead.contributions[1], /zCloud offload/);
  assert.match(en.Experience.zalo.lead.contributions[2], /engineering team/);
  assert.match(vi.Experience.zalo.lead.contributions[2], /team engineering/);
  assert.match(en.Summary.intro2, /technical leadership/);
  assert.doesNotMatch(en.Summary.intro1, /GPA/);
});

test("downloadable resume targets the generated lead-level PDF", async () => {
  const [appConst, profile, pdf] = await Promise.all([
    read("src/app/app.const.ts"),
    read("src/content/profile.ts"),
    readFile("public/NguyenLePhong_Lead_Software_Engineer.pdf"),
  ]);

  assert.match(appConst, /CV_PDF: "\/NguyenLePhong_Lead_Software_Engineer\.pdf"/);
  assert.match(profile, /NguyenLePhong_Lead_Software_Engineer\.pdf/);
  assert.match(pdf.subarray(0, 8).toString("latin1"), /^%PDF-/);
  assert.ok(pdf.length > 8_000, "generated resume PDF should not be empty");
  assert.match(pdf.toString("latin1"), /Lead Software Engineer/);
});

test("experience data groups both Zalo chapters and links public launch coverage", async () => {
  const experience = await read("src/content/experience.ts");

  assert.ok(
    experience.indexOf('company: "Zalo PC - VNG Corp"') <
      experience.indexOf('company: "NDSVN JSC"'),
    "current Zalo role should be the first company in the timeline"
  );
  assert.match(experience, /title: "Lead Software Engineer"/);
  assert.match(experience, /duration: "Mar 2, 2026 - Present"/);
  assert.match(experience, /contentKey: "lead"/);
  assert.match(experience, /title: "Senior Software Engineer"/);
  assert.match(experience, /duration: "May 2024 - Aug 2025"/);
  assert.match(experience, /duration: "Aug 2025 - Mar 2026"/);
  assert.match(
    experience,
    /https:\/\/vnexpress\.net\/ba-tinh-nang-moi-cua-zalo-5097444\.html/
  );
});

test("launch evidence is accessible, tracked, and reflected in structured profile data", async () => {
  const [component, analytics, schema, rootOg, localizedOg, sharedOg] = await Promise.all([
    read("src/components/cv/Experience.tsx"),
    read("src/lib/analytics.ts"),
    read("src/lib/seo/profile-schema.ts"),
    read("src/app/opengraph-image.tsx"),
    read("src/app/[locale]/(site)/opengraph-image.tsx"),
    read("src/app/_og/profile-og.ts")
  ]);

  assert.match(component, /job\.contentKey/);
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noopener noreferrer"/);
  assert.match(component, /cv_experience_evidence_click/);
  assert.match(component, /\{ beacon: true \}/);
  assert.match(analytics, /\| 'cv_experience_evidence_click'/);
  assert.match(schema, /jobTitle: 'Lead Software Engineer/);
  assert.match(schema, /name: 'Zalo - VNG Corporation'/);
  assert.doesNotMatch(schema, /worksFor:[\s\S]{0,120}NDSVN JSC/);
  assert.match(rootOg, /PROFILE_OG_CONTENT/);
  assert.match(localizedOg, /PROFILE_OG_CONTENT/);
  assert.match(sharedOg, /title: 'Lead Software Engineer · Zalo PC'/);
});
