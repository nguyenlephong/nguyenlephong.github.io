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

test("homepage copy states capability directly without recruiter-facing meta language", async () => {
  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));

    assert.ok(messages.Sections.aboutTitle.length < 80);
    assert.ok(messages.Sections.experienceTitle.length < 80);
    assert.ok(messages.Sections.projectsTitle.length < 80);
    assert.ok(messages.CTA.title.length < 80);
  }

  const en = JSON.parse(await read("messages/en.json"));
  const vi = JSON.parse(await read("messages/vi.json"));
  const canonicalCopy = JSON.stringify({
    en: { sections: en.Sections, summary: en.Summary, cta: en.CTA },
    vi: { sections: vi.Sections, summary: vi.Summary, cta: vi.CTA }
  });

  assert.equal(
    en.Sections.aboutTitle,
    "Architect systems. Ship products. Lead teams."
  );
  assert.equal(
    vi.Sections.aboutTitle,
    "Kiến trúc hệ thống. Ship sản phẩm. Dẫn dắt đội ngũ."
  );
  assert.match(en.Summary.intro3, /product, systems, and teams/);
  assert.match(vi.Summary.intro3, /sản phẩm, hệ thống và đội ngũ/);
  assert.doesNotMatch(
    canonicalCopy,
    /recruiter|job description|nhà tuyển dụng|Cần một người|Need someone/i
  );
});

test("homepage AI particle field is GPU-rendered, scroll-synced, and motion-safe", async () => {
  const [
    page,
    hero,
    homeBackdrop,
    backdrop,
    renderer,
    section,
    contact,
    reveal,
    css
  ] = await Promise.all([
    read("src/app/[locale]/(site)/page.tsx"),
    read("src/components/cv/Hero.tsx"),
    read("src/components/cv/HomeBackdrop.tsx"),
    read("src/components/cv/ArchitectureBackdrop.tsx"),
    read("src/components/webgl/ScrollParticleRenderer.ts"),
    read("src/components/cv/Section.tsx"),
    read("src/components/cv/ContactCTA.tsx"),
    read("src/components/motion/Reveal.tsx"),
    read("src/app/[locale]/(site)/home.css")
  ]);

  assert.match(page, /<main className="home-showcase">/);
  assert.match(page, /<HomeBackdrop \/>/);
  assert.match(homeBackdrop, /<ArchitectureBackdrop \/>/);
  assert.match(
    homeBackdrop,
    /dynamic\(\s*\(\) => import\(['"]@\/components\/cv\/ArchitectureBackdrop['"]\)/
  );
  assert.match(homeBackdrop, /ssr:\s*false/);
  assert.match(homeBackdrop, /className="home-architecture"/);
  assert.match(homeBackdrop, /className="home-architecture-viewport"/);
  assert.doesNotMatch(hero, /ArchitectureBackdrop|hero-bleed/);
  assert.doesNotMatch(hero, /useReducedMotion|<m\.|<CountUp/);
  assert.doesNotMatch(page, /MotionProvider|framer-motion/);
  assert.doesNotMatch(section, /framer-motion|useReducedMotion|<m\./);
  assert.doesNotMatch(contact, /framer-motion|useReducedMotion|<m\./);
  assert.doesNotMatch(reveal, /framer-motion|useReducedMotion|<m\./);
  assert.match(backdrop, /<canvas[^>]+className="ai-particle-field"/);
  assert.match(backdrop, /mountScrollParticleRenderer/);
  assert.match(renderer, /getContext\("webgl"/);
  assert.match(
    renderer,
    /gl\.bufferData\(gl\.ARRAY_BUFFER, data, gl\.STATIC_DRAW\)/
  );
  assert.match(renderer, /gl\.drawArrays\(gl\.POINTS, 0, vertexCount\)/);
  assert.match(backdrop, /function resolveParticleGrid/);
  assert.match(backdrop, /function selectParticleColor/);
  assert.match(backdrop, /function appendParticlePair/);
  assert.match(renderer, /const TARGET_FRAME_MS = 1000 \/ 24/);
  assert.match(renderer, /const ACTIVE_SCROLL_MS = 180/);
  assert.match(
    backdrop,
    /dprCap: \(width\) => \(width < 720 \? 1\.25 : 1\.5\)/
  );
  assert.match(renderer, /requestIdleCallback/);
  assert.match(renderer, /window\.requestAnimationFrame\(renderFrame\)/);
  assert.match(renderer, /prefers-reduced-motion: reduce/);
  assert.match(renderer, /new MutationObserver\(onThemeChange\)/);
  assert.match(backdrop, /const LIGHT_PALETTE = \[/);
  assert.match(backdrop, /frame\.dark \? DARK_PALETTE : LIGHT_PALETTE/);
  const lightPalette = backdrop
    .match(/const LIGHT_PALETTE = \[([\s\S]*?)\] as const;/)?.[1]
    .match(/\[([\d., ]+)\]/g)
    ?.map((color) => color.slice(1, -1).split(",").map(Number));
  assert.equal(lightPalette?.length, 5);
  assert.ok(
    lightPalette?.every(([red, , blue]) => blue > red),
    "light mode should keep a cold blueprint palette"
  );
  const lightAlpha = backdrop.match(
    /float lightAlpha = mix\(([\d.]+), ([\d.]+),/
  );
  assert.ok(lightAlpha, "light mode should define its own alpha curve");
  assert.ok(Number(lightAlpha[1]) >= 0.18);
  assert.ok(Number(lightAlpha[1]) <= 0.24);
  assert.ok(Number(lightAlpha[2]) >= 0.6);
  assert.ok(Number(lightAlpha[2]) <= 0.72);
  const lightPointScale = backdrop.match(
    /float pointSize =[^\n]+mix\(([\d.]+), 1\.0, uDark\)/
  );
  assert.ok(lightPointScale, "light mode should define its own point scale");
  assert.ok(Number(lightPointScale[1]) >= 1.15);
  assert.match(backdrop, /float foldAlpha = mix\(0\.18, 0\.34, uDark\)/);
  assert.match(backdrop, /float sparkleScale = mix\(1\.35, 2\.25, uDark\)/);
  assert.match(backdrop, /float quietStart = mix\(/);
  assert.match(backdrop, /uniform float uScroll/);
  assert.match(backdrop, /rootSelector: "\.home-showcase"/);
  assert.match(
    renderer,
    /canvas\.closest<HTMLElement>\(options\.rootSelector\)/
  );
  assert.match(renderer, /const updateScrollProgress = \(\) =>/);
  assert.match(
    renderer,
    /scrollProgress = clamp\(-rect\.top \/ scrollableHeight, 0, 1\)/
  );
  assert.match(
    renderer,
    /gl\.uniform1f\(uniforms\.uScroll, frame\.scrollProgress\)/
  );
  assert.match(
    renderer,
    /scrollActiveUntil = performance\.now\(\) \+ ACTIVE_SCROLL_MS/
  );
  assert.match(
    renderer,
    /performance\.now\(\) < scrollActiveUntil \? 0 : TARGET_FRAME_MS/
  );
  assert.match(renderer, /window\.addEventListener\("scroll", onScroll/);
  assert.doesNotMatch(backdrop, /scrollVelocity|scrollTarget/);
  assert.match(renderer, /new IntersectionObserver/);
  assert.match(css, /\.ai-particle-field/);
  assert.match(
    css,
    /\.home-architecture\s*\{[\s\S]*?position: absolute;[\s\S]*?inset: 0;/
  );
  assert.match(
    css,
    /\.home-architecture-viewport\s*\{[\s\S]*?position: sticky;/
  );
  assert.match(css, /height: 100svh/);
  assert.match(css, /html\[data-theme='light'\] \.home-architecture-viewport/);
  assert.match(css, /mix-blend-mode: multiply/);
  assert.doesNotMatch(backdrop, /Path2D|shadowBlur|CanvasRenderingContext2D/);
  assert.doesNotMatch(backdrop, /aria-hidden="true"/);
  assert.doesNotMatch(css, /mask-image|filter:\s*saturate/);
  assert.doesNotMatch(backdrop, /<svg|<animateMotion/);
  assert.doesNotMatch(css, /architecture-(?:grid|plane|route|node|seam)/);
  assert.doesNotMatch(css, /home-architecture-signal-(?:light|dark)\.webp/);
});

test("downloadable resume targets the generated lead-level PDF", async () => {
  const [appConst, profile, pdf] = await Promise.all([
    read("src/app/app.const.ts"),
    read("src/content/profile.ts"),
    readFile("public/NguyenLePhong_Lead_Software_Engineer.pdf")
  ]);

  assert.match(
    appConst,
    /CV_PDF: "\/NguyenLePhong_Lead_Software_Engineer\.pdf"/
  );
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
  const [component, analytics, schema, rootOg, localizedOg, sharedOg] =
    await Promise.all([
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

test("hero leads with both the Zalo PC role and the BonBon co-founder role", async () => {
  const [hero, analytics] = await Promise.all([
    read("src/components/cv/Hero.tsx"),
    read("src/lib/analytics.ts")
  ]);

  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));
    assert.equal(typeof messages.Hero.cofounder, "string");
    assert.match(messages.Hero.news, /BonBon/);
    assert.match(messages.Hero.stats.preSeedRaisedCaption, /Tasco/);
    assert.match(messages.Footer.tag, /BonBon/);
    assert.match(messages.SEO.home.title, /BonBon/);
    assert.equal(messages.Hero.proof, undefined);
  }

  assert.match(hero, /<strong>Zalo PC<\/strong>/);
  assert.match(hero, /<strong>BonBon<\/strong>/);
  assert.match(hero, /locale=\{locale === 'vi' \? 'vi' : 'en'\}/);
  assert.match(hero, /prefetch=\{false\}/);
  assert.match(hero, /track\('cv_announcement_click', \{ target: 'bonbon_pre_seed_note' \}\)/);
  assert.match(analytics, /\| 'cv_announcement_click'/);
});
