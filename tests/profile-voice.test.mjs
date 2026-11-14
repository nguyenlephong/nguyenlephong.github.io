import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  findCardViolations,
  findSourceViolations,
  findViolations,
  loadProfileOgCards,
  loadSourceSurfaces,
  LOCALES
} from "../scripts/verify-profile-voice.mjs";

// Locks the profile-voice skill (AI/skills/profile-voice/SKILL.md). Fix the copy, never this test.
test("profile copy has no AI tells, em dashes or locale format slips", async () => {
  const messages = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (l) => [
        l,
        JSON.parse(await readFile(`messages/${l}.json`, "utf8"))
      ])
    )
  );
  const violations = findViolations(messages);
  assert.deepEqual(
    violations.map((v) => `${v.locale} ${v.key} [${v.rule}] ${v.match}`),
    []
  );
});

test("guard catches the patterns it promises to catch", () => {
  const sample = {
    en: { Hero: { a: "We leverage robust tooling — in order to ship.", c: "All projects, one line each" } },
    vi: {
      Hero: {
        b: "Không chỉ nhanh mà còn rẻ, doanh thu $20,000 và 10,000 người dùng.",
        d: "Tất cả dự án, mỗi dự án một dòng"
      }
    }
  };
  const rules = new Set(findViolations(sample).map((v) => v.rule));
  for (const r of [
    "em-dash",
    "en-ai-vocabulary",
    "en-filler",
    "en-format-narration",
    "vi-format-narration",
    "vi-ai-phrasing",
    "vi-en-thousands",
    "vi-dollar-sign"
  ]) {
    assert.ok(rules.has(r), r);
  }
});

test("profile OG cards and source surfaces pass the same guard", async () => {
  const cards = await loadProfileOgCards();
  assert.equal(cards.en.badge.value, "18M+ MAU");
  assert.match(cards.vi.subtitle, /500\.000 USD/);
  const violations = [
    ...findCardViolations(cards),
    ...findSourceViolations(loadSourceSurfaces())
  ];
  assert.deepEqual(
    violations.map((v) => `${v.locale} ${v.key} [${v.rule}] ${v.match}`),
    []
  );
});

test("guard rejects the contradicted 80M+ MAU claim on every profile surface", () => {
  const card = findCardViolations({
    en: { badge: { label: "Zalo", value: "80M+ MAU" } },
    vi: { subtitle: "Zalo khoảng 80 triệu người dùng — $500,000" }
  });
  const cardRules = new Set(card.map((v) => `${v.locale} ${v.rule}`));
  for (const r of ["en claim-80m-mau", "en og-80m", "vi og-80m", "vi em-dash", "vi vi-dollar-sign"]) {
    assert.ok(cardRules.has(r), r);
  }
  const source = findSourceViolations({
    "README.md": "Lead @ Zalo PC · 80M+ MAU platform",
    "src/app/seo.config.ts": "badge: 80M MAU"
  });
  assert.deepEqual(
    source.map((v) => `${v.key} ${v.rule}`),
    ["README.md:1 claim-80m-mau", "src/app/seo.config.ts:1 claim-80m-mau"]
  );
  const messages = findViolations({
    en: { Experience: { ok: "Zalo Android (~80M users)", bad: "Shipping at 80M+ MAU scale" } }
  });
  assert.deepEqual(messages.map((v) => `${v.key} ${v.rule}`), ["Experience.bad claim-80m-mau"]);
});
