import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertWorkerRendering,
  readAll,
  readParticleRuntime
} from "./helpers/particle-runtime.mjs";

const locales = ["en", "vi", "zh", "ja", "ko", "fr"];

async function read(relativePath) {
  return readFile(relativePath, "utf8");
}

test("every locale presents the current Zalo PC lead journey", async () => {
  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));
    const lead = messages.Experience.roles.zaloLead;

    assert.match(messages.Hero.role, /Lead Software Engineer/);
    assert.match(messages.Footer.tag, /Lead Software Engineer/);
    assert.match(messages.SEO.home.title, /Lead Software Engineer/);
    assert.equal(typeof lead.scope, "string");
    assert.equal(lead.contributions.length, 5);
    // The return to Zalo reads as a rehire with its date, in every locale.
    assert.match(lead.scope, /NDSVN/);
    assert.match(lead.scope, /2026/);
    assert.match(JSON.stringify(lead), /mobile|モバイル|移动端|모바일|điện thoại/);
    assert.match(messages.Experience.labels.readCoverage, /\{publisher\}/);
    assert.match(messages.Experience.labels.allContributions, /\{count\}/);
  }

  const en = JSON.parse(await read("messages/en.json"));
  const vi = JSON.parse(await read("messages/vi.json"));
  assert.match(en.Experience.roles.zaloLead.scope, /Rehired as Lead in March 2026/);
  assert.match(vi.Experience.roles.zaloLead.scope, /quay lại làm Lead từ tháng 3\/2026/);
  assert.match(en.Experience.roles.zaloLead.contributions[0], /message backup/);
  assert.match(vi.Experience.roles.zaloLead.contributions[0], /sao lưu tin nhắn/);
  assert.match(en.Experience.roles.zaloLead.contributions[1], /sync v2/);
  assert.match(vi.Experience.roles.zaloLead.contributions[1], /sync v2/);
  assert.match(en.Experience.roles.zaloLead.contributions[1], /1\.8 s to 4 ms/);
  assert.match(vi.Experience.roles.zaloLead.contributions[1], /1,8 s xuống 4 ms/);
  assert.match(en.Experience.roles.zaloLead.contributions[2], /default off/);
  assert.match(en.Experience.roles.zaloLead.contributions[3], /zCloud offload/);
  assert.match(vi.Experience.roles.zaloLead.contributions[3], /zCloud offload/);
  assert.match(en.Summary.lede, /CTO transition/);
  assert.doesNotMatch(en.Summary.lede, /GPA/);
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
    "I work on systems where a wrong step costs money or trust."
  );
  assert.equal(
    vi.Sections.aboutTitle,
    "Tôi làm những hệ thống mà sai một bước là mất tiền hoặc mất lòng tin."
  );
  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));
    // Headings carry their own weight: no eyebrow keys above them.
    assert.deepEqual(Object.keys(messages.Sections).filter((k) => /Eyebrow$/.test(k)), [], locale);
    assert.equal(messages.Summary.visionEyebrow, undefined, locale);
    assert.equal(messages.Summary.hardSkillsEyebrow, undefined, locale);
    assert.ok(messages.Summary.stackTitle.trim(), locale);
    for (const row of Object.values(messages.Summary.stack)) {
      assert.ok(row.label.trim() && row.items.trim(), locale);
      assert.doesNotMatch(row.items, /<b>/, locale);
    }
  }
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
    readAll(
      "src/components/cv/ArchitectureBackdrop.tsx",
      "src/components/webgl/scenes/architecture-scene.ts"
    ),
    readParticleRuntime(),
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
  assert.match(renderer, /scheduler\.request\(renderFrame\)/);
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
  assert.match(renderer, /const readScrollProgress = \(\) =>/);
  assert.match(
    renderer,
    /return clamp\(-rect\.top \/ scrollableHeight, 0, 1\)/
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
  assertWorkerRendering(backdrop, renderer, "architecture");
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

test("experience data is one reverse-chronological role list that every locale can render", async () => {
  const { experience } = await import("../src/content/experience.ts");

  assert.deepEqual(
    experience.map((role) => role.id),
    ["zaloLead", "ndsvn", "zaloSenior", "primedata", "splus", "propman"],
    "roles run newest first so the NDSVN branch sits between the two Zalo PC roles"
  );
  const starts = experience.map((role) => role.start);
  assert.deepEqual(starts, [...starts].sort().reverse());
  assert.equal(experience[0].end, undefined, "the current role has no end date");
  assert.deepEqual(
    experience.map((role) => [role.start, role.end ?? null]).slice(0, 3),
    [["2026-03", null], ["2025-08", "2026-03"], ["2024-05", "2025-08"]]
  );
  assert.deepEqual(
    experience.filter((role) => role.earlier).map((role) => role.id),
    ["splus", "propman"]
  );
  for (const role of experience) {
    assert.match(role.start, /^\d{4}-\d{2}$/, role.id);
    assert.equal(role.location, "Ho Chi Minh City", role.id);
    assert.ok(role.techs.length > 0 && role.techs.length <= 5, role.id);
  }
  assert.equal(
    experience[0].evidence.href,
    "https://vnexpress.net/ba-tinh-nang-moi-cua-zalo-5097444.html"
  );

  for (const locale of locales) {
    const xp = JSON.parse(await read(`messages/${locale}.json`)).Experience;
    for (const role of experience) {
      const copy = xp.roles[role.id];
      assert.ok(copy, `${locale} Experience.roles.${role.id}`);
      assert.ok(xp.env[role.env]?.trim(), `${locale} Experience.env.${role.env}`);
      if (role.earlier) {
        assert.ok(copy.line?.trim(), `${locale} ${role.id}.line`);
      } else {
        assert.ok(copy.scope?.trim(), `${locale} ${role.id}.scope`);
        assert.ok(copy.contributions.length > 3, `${locale} ${role.id} has a <details> remainder`);
      }
    }
    assert.ok(xp.labels.now.trim() && xp.labels.earlier.trim(), locale);
    assert.doesNotMatch(JSON.stringify(xp), /parasite|<b>[^<]*<\/b>[^"]*<b>[^<]*<\/b>[^"]*<b>/i, locale);
  }
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

  assert.match(component, /role\.evidence/);
  assert.match(component, /<details/);
  assert.match(component, /track\(["']cv_experience_expand["'], \{ role: role\.id \}\)/);
  assert.match(analytics, /\| 'cv_experience_expand'/);
  // Career rail: complete by default, scroll-drawn only when supported and motion is allowed.
  const [rail, xpCss] = await Promise.all([
    read("src/components/cv/CareerGraph.tsx"),
    read("src/components/cv/experience.css")
  ]);
  assert.match(rail, /aria-hidden="true"/);
  assert.match(rail, /new ResizeObserver/, "graph re-measures on resize and <details> toggles");
  assert.match(xpCss, /--c-branch: oklch\(74% 0\.16 65\)/, "NDSVN lane uses the map's amber lane");
  assert.equal((xpCss.match(/animation-timeline: view\(\);/g) || []).length, 1, "one view() timeline");
  for (const locale of locales) {
    const labels = JSON.parse(await read(`messages/${locale}.json`)).Experience.labels;
    assert.match(labels.forkNote, /2025/, locale);
    assert.match(labels.mergeNote, /2026/, locale);
  }
  assert.match(
    xpCss,
    /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*@supports \(animation-timeline: view\(\)\)/
  );
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noopener noreferrer"/);
  assert.match(component, /cv_experience_evidence_click/);
  assert.match(component, /\{ beacon: true \}/);
  assert.match(analytics, /\| 'cv_experience_evidence_click'/);
  assert.match(schema, /jobTitle: 'Lead Software Engineer/);
  assert.match(schema, /name: 'Zalo',/);
  assert.match(schema, /name: 'VNG Corporation'/);
  assert.doesNotMatch(schema, /worksFor:[\s\S]{0,120}NDSVN JSC/);
  assert.match(rootOg, /PROFILE_OG_CONTENT/);
  assert.match(localizedOg, /PROFILE_OG_CONTENT/);
  assert.match(sharedOg, /title: 'Lead Software Engineer · Zalo PC'/);
});

test("hero leads with both the Zalo PC role and the BonBon co-founder role", async () => {
  const [hero, topology, analytics] = await Promise.all([
    read("src/components/cv/Hero.tsx"),
    read("src/components/cv/HeroTopology.tsx"),
    read("src/lib/analytics.ts")
  ]);

  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));
    assert.equal(typeof messages.Hero.cofounder, "string");
    assert.equal(typeof messages.Hero.claim, "string");
    assert.match(messages.Hero.news, /BonBon/);
    assert.match(messages.Hero.topology.bonbonNote, /Tasco/);
    assert.match(messages.Hero.topology.zaloNote, /15/);
    assert.match(messages.SEO.home.title, /BonBon/);
    assert.equal(messages.Hero.proof, undefined);
    // The stat grid is gone, and the contradicted 80M+ figure must not come back to the hero.
    assert.equal(messages.Hero.stats, undefined);
    assert.doesNotMatch(JSON.stringify(messages.Hero), /80M|80 triệu|30\+/);
  }

  // Both role lines are equal-rank in-page links, tracked like the topology nodes.
  assert.match(hero, /href="#experience"[\s\S]{0,160}cv_hero_node_select', \{ node: 'zalo_pc', surface: 'role' \}/);
  assert.match(hero, /href="#case-bonbon"[\s\S]{0,160}cv_hero_node_select', \{ node: 'bonbon', surface: 'role' \}/);
  assert.match(hero, />\s*Zalo PC\s*<\/a>/);
  assert.match(hero, />\s*BonBon Mobility\s*<\/a>/);
  assert.match(hero, /locale=\{locale === 'vi' \? 'vi' : 'en'\}/);
  assert.match(hero, /prefetch=\{false\}/);
  assert.doesNotMatch(hero, /stat-card|spark/);
  assert.doesNotMatch(hero, /tel:/);
  assert.match(hero, /<HeroTopology/);
  assert.match(topology, /track\('cv_hero_node_select', \{ node: e\.id, surface: 'topology' \}\)/);
  assert.match(topology, /href: '#experience'/);
  assert.match(topology, /href: '#case-bonbon'/);
  // Topology dates are mono date tokens in every locale.
  for (const locale of locales) {
    const topo = JSON.parse(await read(`messages/${locale}.json`)).Hero.topology;
    for (const key of ["zaloMeta", "bonbonMeta", "previousMeta"]) assert.match(topo[key], /<date>.+<\/date>/);
  }
  assert.match(analytics, /\| 'cv_hero_node_select'/);
  assert.match(hero, /track\('cv_announcement_click', \{ target: 'bonbon_pre_seed_note' \}\)/);
  assert.match(analytics, /\| 'cv_announcement_click'/);
  assert.match(analytics, /\| 'cv_project_website_click'/);
});

test("capability map tracks selection and every locale carries each capability", async () => {
  const map = await read("src/components/cv/CapabilityMap.tsx");
  const diagram = await read("src/components/cv/CapabilityMapDiagram.tsx");
  const analytics = await read("src/lib/analytics.ts");
  assert.match(
    map,
    /track\(["']cv_capability_select["'], \{ capability: key, source \}\)/
  );
  assert.match(analytics, /\| 'cv_capability_select'/);

  const keys = [
    ...diagram
      .match(/capabilityKeys = \[([^\]]+)\]/)[1]
      .matchAll(/["'](\w+)["']/g)
  ].map((m) => m[1]);
  assert.equal(keys.length, 6);
  for (const locale of locales) {
    const pillars = JSON.parse(await read(`messages/${locale}.json`)).Summary
      .pillars;
    assert.deepEqual(Object.keys(pillars).sort(), [...keys].sort(), locale);
    for (const key of keys) {
      for (const field of [
        "tab",
        "meta",
        "title",
        "body",
        "figure",
        "figureLabel"
      ]) {
        assert.ok(pillars[key][field]?.trim(), `${locale} ${key}.${field}`);
      }
    }
  }
});
