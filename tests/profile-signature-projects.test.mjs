import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = ['en', 'vi', 'zh', 'ja', 'ko', 'fr'];

async function read(relativePath) {
  return readFile(relativePath, 'utf8');
}

test('every locale presents the evidence-backed LogiUP and BonBon projects', async () => {
  for (const locale of locales) {
    const messages = JSON.parse(await read(`messages/${locale}.json`));
    const logiup = messages.Projects.logiup.accomplishments;
    const bonbon = messages.Projects.bonbon.accomplishments;

    assert.equal(logiup.length, 4);
    assert.equal(bonbon.length, 3);
    assert.match(JSON.stringify(logiup), /Tech Lead/);
    assert.match(JSON.stringify(logiup), /4/);
    assert.match(JSON.stringify(logiup), /9/);
    assert.match(JSON.stringify(logiup), /Electron/i);
    assert.match(JSON.stringify(logiup), /OAuth/);
    assert.match(JSON.stringify(logiup), /6/);
    assert.match(JSON.stringify(logiup), /31/);
    assert.match(JSON.stringify(bonbon), /12/);
    assert.match(JSON.stringify(bonbon), /3|三|3か月|3개월/);
    assert.match(JSON.stringify(bonbon), /500|50 万|50 만|500 k/);
    assert.match(JSON.stringify(bonbon), /4[.,]?3|430|4,3/);
    assert.match(JSON.stringify(bonbon), /800/);
  }

  const en = JSON.parse(await read('messages/en.json'));
  assert.match(en.Projects.logiup.accomplishments[0], /4-person engineering team/);
  assert.match(en.Projects.logiup.accomplishments[0], /Tech Lead and system architect/);
  assert.match(en.Projects.logiup.accomplishments[2], /tenant isolation end to end/);
  assert.match(en.Projects.bonbon.accomplishments[0], /Top 3 finalist/);
  assert.match(en.Projects.bonbon.accomplishments[0], /final pitch/);
  assert.doesNotMatch(
    en.Projects.bonbon.accomplishments.join(' '),
    /secured|received|revenue|GMV/,
  );
});

test('signature projects lead the homepage and generated resume selection', async () => {
  const [projects, component, exporter, schema] = await Promise.all([
    read('src/content/projects.ts'),
    read('src/components/cv/Projects.tsx'),
    read('scripts/export-resume-data.mjs'),
    read('src/lib/seo/profile-schema.ts')
  ]);

  assert.ok(
    projects.indexOf('defineProject("LogiUP - Multi-tenant Logistics SaaS"') <
      projects.indexOf('name: "Digital SAT Math"')
  );
  assert.ok(
    projects.indexOf('defineProject("BonBon - VETC Mini App & Automotive Platform"') <
      projects.indexOf('name: "Digital SAT Math"')
  );
  assert.match(projects, /"Mar 2026 - Present"/);
  assert.match(projects, /"Apr 2026 - Present"/);
  assert.match(
    component,
    /'LogiUP - Multi-tenant Logistics SaaS': 'logiup'/
  );
  assert.match(
    component,
    /'BonBon - VETC Mini App & Automotive Platform': 'bonbon'/,
  );
  assert.match(
    exporter,
    /\['LogiUP - Multi-tenant Logistics SaaS', \[0, 1, 2, 3\]\]/
  );
  assert.match(
    exporter,
    /\['BonBon - VETC Mini App & Automotive Platform', \[0, 1, 2\]\]/
  );
  assert.match(schema, /'AI-assisted Document Processing'/);
  assert.match(schema, /'Multi-tenant SaaS Architecture'/);
  assert.match(schema, /'Electron Desktop Architecture'/);
  assert.match(schema, /'OAuth 2.1 and OIDC'/);
  assert.match(schema, /'Feature Flag Platforms'/);
});
