import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile("src/app/[locale]/(site)/about/page.tsx", "utf8");
const globals = await readFile("src/app/globals.css", "utf8");
const seo = await readFile("src/app/seo.config.ts", "utf8");
const en = JSON.parse(await readFile("messages/en.json", "utf8"));
const vi = JSON.parse(await readFile("messages/vi.json", "utf8"));

test("about page presents the current backend and platform profile", () => {
  assert.match(page, /hero\.metrics/);
  assert.match(page, /systems\.items/);
  assert.match(page, /stack\.groups/);
  assert.match(page, /principles\.items/);
  assert.match(page, /about-system-grid/);
  assert.match(page, /about-stack-grid/);

  assert.equal(en.About.hero.metrics.length, 4);
  assert.equal(en.About.systems.items.length, 4);
  assert.equal(en.About.stack.groups.length, 4);
  assert.equal(en.About.principles.items.length, 4);
  assert.equal(vi.About.hero.metrics.length, en.About.hero.metrics.length);
  assert.equal(vi.About.systems.items.length, en.About.systems.items.length);
  assert.equal(vi.About.stack.groups.length, en.About.stack.groups.length);

  const content = JSON.stringify(en.About);
  assert.match(content, /backend services/i);
  assert.match(content, /Kubernetes/);
  assert.match(content, /load[- ]balancer/i);
  assert.match(content, /feature-flag/i);
  assert.match(content, /observability/i);

  assert.match(seo, /Backend, Platform & Product Engineering/);
  assert.match(seo, /Load balancer/);
  assert.match(globals, /\.about-hero\s*\{/);
  assert.match(globals, /\.about-system-card\s*\{/);
  assert.match(globals, /\.about-principle\s*\{/);
});
