import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const locales = ["en", "vi", "zh", "ja", "ko", "fr"];
const read = (relativePath) => readFile(relativePath, "utf8");

test("contact endpoint tracks email copy and keeps existing contact events", async () => {
  const [contact, analytics, css] = await Promise.all([
    read("src/components/cv/ContactCTA.tsx"),
    read("src/lib/analytics.ts"),
    read("src/components/cv/contact.css")
  ]);

  assert.match(analytics, /\| ['"]cv_email_copy['"]/);
  assert.match(
    contact,
    /track\(\s*['"]cv_email_copy['"],\s*\{\s*source:\s*['"]cta['"],\s*result:\s*next\s*\}\s*\)/
  );
  assert.match(contact, /navigator\.clipboard\.writeText\(c\.email\)/);
  assert.match(contact, /selection\.addRange\(range\)/, "clipboard failure selects the address");
  // Both outcomes reset; the timer is replaced after the await so overlapping clicks leave no orphan.
  const resetMs = contact.match(/RESET_MS = \{\s*copied:\s*(\d+),\s*failed:\s*(\d+)\s*\}/);
  assert.ok(resetMs, "copied and failed both have a reset delay");
  assert.equal(Number(resetMs[1]), 2000);
  assert.ok(Number(resetMs[2]) >= 3000, "failed state stays long enough to read");
  assert.match(
    contact,
    /await navigator\.clipboard\.writeText\(c\.email\)[\s\S]*?\}\s*catch[\s\S]*?\}\s*[\s\S]*?window\.clearTimeout\(resetTimer\.current\)\s*resetTimer\.current = window\.setTimeout\(\(\) => setCopyState\(['"]idle['"]\), RESET_MS\[next\]\)/
  );
  assert.equal(
    (contact.match(/resetTimer\.current = window\.setTimeout/g) || []).length,
    1,
    "one reset timer path for both outcomes"
  );
  assert.match(contact, /href=\{`tel:\+\$\{c\.phone\.replace\(/, "tel: href is E.164 with a leading +");
  assert.match(css, /\.cta-link,\s*\.cta-address\s*\{[^}]*min-height: 44px/);
  assert.match(css, /\.cta-copy::before\s*\{[^}]*inset: -6px 0/);
  assert.match(contact, /aria-live=['"]polite['"]/);
  assert.match(contact, /type=['"]button['"]/);
  assert.match(contact, /href=\{`mailto:\$\{c\.email\}`\}/);
  assert.match(
    contact,
    /track\(\s*['"]cv_contact_click['"],\s*\{\s*channel:\s*['"]email['"],\s*source:\s*['"]cta['"]\s*\}/
  );
  assert.match(contact, /track\(\s*['"]cv_resume_download['"],\s*\{\s*source:\s*['"]cta['"]\s*\}/);
  assert.match(
    contact,
    /track\(\s*['"]cv_social_click['"],\s*\{\s*platform:\s*['"]linkedin['"],\s*source:\s*['"]cta['"]\s*\}/
  );
  assert.doesNotMatch(contact, /eyebrow/);
  assert.doesNotMatch(css, /cta-eyebrow|cta-inner|36px 36px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("contact copy exists in every locale without eyebrow, urgency, or a reply promise", async () => {
  const keys = [
    "title",
    "openToLabel",
    "openTo",
    "whereLabel",
    "where",
    "emailLabel",
    "copyEmail",
    "copied",
    "copiedStatus",
    "copyFailed",
    "phoneLabel",
    "linksLabel",
    "linkedin",
    "github",
    "resumePdf"
  ];
  for (const locale of locales) {
    const cta = JSON.parse(await read(`messages/${locale}.json`)).CTA;
    assert.equal(cta.eyebrow, undefined, locale);
    for (const key of keys) assert.ok(cta[key]?.trim(), `${locale} CTA.${key}`);
    assert.match(cta.where, /UTC\+7/, locale);
    assert.match(cta.openTo, /Engineering Manager/, locale);
  }
  const vi = JSON.parse(await read("messages/vi.json")).CTA;
  assert.doesNotMatch(JSON.stringify(vi), /\bngay\b/i);
  const en = JSON.parse(await read("messages/en.json")).CTA;
  assert.doesNotMatch(JSON.stringify(en), /within|reply|available from|amazing/i);
});
