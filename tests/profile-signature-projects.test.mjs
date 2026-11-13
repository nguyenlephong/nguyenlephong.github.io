import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = ['en', 'vi', 'zh', 'ja', 'ko', 'fr'];

async function read(relativePath) {
  return readFile(relativePath, 'utf8');
}

test('every locale carries the LogiUP and BonBon case files with the same facts', async () => {
  for (const locale of locales) {
    const { Projects, Sections } = JSON.parse(await read(`messages/${locale}.json`));
    assert.ok(Sections.projectsTitle.trim(), locale);
    for (const key of ['logiup', 'bonbon']) {
      const c = Projects[key];
      for (const field of ['name', 'kind', 'role', 'period', 'context', 'index']) {
        assert.ok(c[field]?.trim(), `${locale} ${key}.${field}`);
      }
      assert.equal(c.decisions.length, 3, `${locale} ${key}.decisions`);
      assert.equal(c.accomplishments, undefined, `${locale} ${key} legacy bullets`);
      assert.equal(c.figureCaption, undefined, `${locale} ${key} caption repeats Context`);
    }
    for (const label of ['context', 'decisions', 'outcome', 'evidence', 'caseFile', 'indexTitle']) {
      assert.ok(Projects.labels[label]?.trim(), `${locale} labels.${label}`);
    }

    const logiup = JSON.stringify(Projects.logiup);
    assert.equal(Projects.logiup.outcome.length, 3);
    assert.ok(Projects.logiup.evidenceNote.trim());
    for (const fact of [/9/, /\b6\b|>6</, /31/, /\b8\b/, /OAuth 2\.1\/OIDC/, /Electron/, /2026/]) {
      assert.match(logiup, fact, `${locale} logiup ${fact}`);
    }

    const bonbon = JSON.stringify(Projects.bonbon);
    assert.equal(Projects.bonbon.outcome.length, 3);
    for (const fact of [/12/, /100/, /Wash3000/, /Tasco/, /GenAI Fund/, /500|50 ?万|50만/, /4[.,]3|430/, /OWASP/]) {
      assert.match(bonbon, fact, `${locale} bonbon ${fact}`);
    }
    assert.match(bonbon, /pre-seed|プレシード|프리시드/);
    assert.doesNotMatch(bonbon, /(?<!pre-)seed round|Top 3 finalist/);

    // Legacy cards that only repeated Experience, and the reputational risk, are gone.
    assert.deepEqual(Object.keys(Projects).sort(), ['bonbon', 'labels', 'logiup', 'sat', 'vac']);
    assert.doesNotMatch(JSON.stringify(Projects), /parasite/i, locale);
  }

  const en = JSON.parse(await read('messages/en.json'));
  const vi = JSON.parse(await read('messages/vi.json'));
  assert.equal(
    en.Sections.projectsTitle,
    'Two systems where I made the architecture calls and lived with them.',
  );
  assert.equal(vi.Sections.projectsTitle, 'Hai hệ thống tôi quyết kiến trúc, đúng sai đều do tôi gánh.');
  for (const line of [...en.Projects.logiup.decisions, ...en.Projects.bonbon.decisions]) {
    assert.match(line, /\bover\b[\s\S]*\bbecause\b/, line);
    assert.ok(line.length <= 90, `one line at 1440: ${line}`);
  }
  assert.match(en.Projects.bonbon.outcome[0], /^BonBon won Tasco Foundry Wash3000/);
  assert.match(en.Projects.bonbon.outcome[1], /\$500K<\/b> pre-seed round led by Tasco/);
  assert.match(en.Projects.bonbon.context, /4\.3M users<\/b> as of April 2026/);
  assert.match(vi.Projects.bonbon.outcome[1], /500\.000 USD/);
  assert.doesNotMatch(JSON.stringify(en.Projects), /revenue|GMV|live pilot/);
});

test('case files and the index are wired to the map and tracked on view, not hover', async () => {
  const [projects, component, caseFile, map, diagram, exporter, analytics, pdf, schema] =
    await Promise.all([
      read('src/content/projects.ts'),
      read('src/components/cv/Projects.tsx'),
      read('src/components/cv/CaseFile.tsx'),
      read('src/components/cv/CapabilityMap.tsx'),
      read('src/components/cv/CapabilityMapDiagram.tsx'),
      read('scripts/export-resume-data.mjs'),
      read('src/lib/analytics.ts'),
      read('scripts/generate-resume-pdf.py'),
      read('src/lib/seo/profile-schema.ts'),
    ]);

  assert.ok(
    projects.indexOf('defineProject("LogiUP - Multi-tenant Logistics SaaS"') <
      projects.indexOf('name: "Digital SAT Math"'),
  );
  assert.ok(
    projects.indexOf('defineProject("BonBon Mobility - VETC Mini App & Automotive Platform"') <
      projects.indexOf('name: "Digital SAT Math"'),
  );
  assert.match(projects, /"Mar 2026 - Present"/);
  assert.match(projects, /"Apr 2026 - Present"/);
  assert.match(projects, /name: "Digital SAT Math"[\s\S]*?duration: "Oct 2023 - Apr 2025"/);
  assert.doesNotMatch(projects, /Savyu|Mobivi|Mona House|name: "CDP"|parasite/);
  assert.match(projects, /publisher: "Tasco"/);
  assert.match(projects, /publisher: "GenAI Fund"/);
  assert.match(projects, /Co-founded BonBon[\s\S]*?\$500K pre-seed round led by Tasco/);

  assert.match(component, /'LogiUP - Multi-tenant Logistics SaaS': 'logiup'/);
  assert.match(component, /'BonBon Mobility - VETC Mini App & Automotive Platform': 'bonbon'/);
  assert.match(component, /openCaseFile\(caseKey, 'index'\)/);
  assert.doesNotMatch(component + caseFile, /onMouseEnter|project-card/);

  // cv_project_view fires once from an IntersectionObserver at 50%.
  assert.match(caseFile, /new IntersectionObserver/);
  assert.match(caseFile, /intersectionRatio >= 0\.5/);
  assert.match(caseFile, /track\('cv_project_view', \{ project \}\)/);
  assert.match(caseFile, /trackProjectView\(project\.name\)/);
  // Index rows report views too (once per project), so every project keeps the event.
  assert.match(component, /trackProjectView\(e\.target\.getAttribute\('data-project'\)/);
  assert.match(component, /data-project=\{p\.name\}/);
  assert.match(caseFile, /track\('cv_case_file_open', \{ project, source \}\)/);
  assert.match(caseFile, /'cv_project_evidence_click'/);
  assert.match(caseFile, /'cv_project_website_click'/);
  for (const event of ['cv_project_view', 'cv_project_evidence_click', 'cv_project_website_click', 'cv_case_file_open']) {
    assert.match(analytics, new RegExp(`\\| '${event}'`));
  }

  // The figures reuse the map's own zone drawings; the map panel links down to them.
  assert.match(diagram, /export function MultiTenantDrawing/);
  assert.match(diagram, /export function ZeroToPilotDrawing/);
  assert.match(diagram, /<MultiTenantDrawing figure=\{figures\.multiTenant\}/);
  assert.match(caseFile, /logiup: \{ zone: 'multiTenant'/);
  assert.match(caseFile, /bonbon: \{ zone: 'zeroToPilot'/);
  assert.match(map, /multiTenant: "logiup"/);
  assert.match(map, /zeroToPilot: "bonbon"/);
  assert.match(map, /openCaseFile\(caseFile, "map"\)/);
  assert.match(caseFile, /CaseFileSource = 'map' \| 'index' \| 'hero'/);
  const [hero, topology] = await Promise.all([
    read('src/components/cv/Hero.tsx'),
    read('src/components/cv/HeroTopology.tsx'),
  ]);
  for (const src of [hero, topology]) {
    assert.match(src, /openCaseFile\('bonbon', 'hero'\)/);
    assert.match(src, /cv_hero_node_select/);
  }

  assert.match(exporter, /\['LogiUP - Multi-tenant Logistics SaaS', \[0, 1, 2, 3, 4\]\]/);
  assert.match(exporter, /\['BonBon Mobility - VETC Mini App & Automotive Platform', \[0, 1, 2, 3\]\]/);
  // Every phrase the PDF verifier requires from projects must exist in the source bullets.
  const projectPhrases = [
    '4-person engineering team',
    'Tech Lead and system architect',
    'Electron desktop',
    'OAuth 2.1/OIDC',
    '31 typed API endpoints',
    'Wash3000',
    '$500K pre-seed round led by Tasco',
    '4.3M users',
  ];
  const plainProjects = projects.replace(/<[^>]+>/g, '');
  for (const phrase of projectPhrases) {
    assert.ok(pdf.includes(`"${phrase}"`), `PDF verifier requires ${phrase}`);
    assert.ok(plainProjects.includes(phrase), `projects.ts carries ${phrase}`);
  }
  assert.doesNotMatch(pdf, /"Top 3 finalist"|"4\.3M-user app ecosystem"/);

  assert.match(schema, /'AI-assisted Document Processing'/);
  assert.match(schema, /'Multi-tenant SaaS Architecture'/);
  assert.match(schema, /'Electron Desktop Architecture'/);
  assert.match(schema, /'OAuth 2.1 and OIDC'/);
  assert.match(schema, /'Feature Flag Platforms'/);
  assert.match(schema, /'BonBon Mobility'/);
  assert.match(schema, /Co-founder/);
  assert.match(schema, /subjectOf/);
  const personSchemaBody = schema.slice(
    schema.indexOf('export function buildPersonSchema'),
    schema.indexOf('export function buildPersonVentureSchema'),
  );
  assert.doesNotMatch(personSchemaBody, /subjectOf|BONBON_/);
  const aboutPage = await read('src/app/[locale]/(site)/about/page.tsx');
  assert.match(aboutPage, /buildPersonVentureSchema\(\)/);
});
