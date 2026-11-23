import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderC4Figure, roundedPath } from "../scripts/c4/render.mjs";
import { C4_SPECS } from "../scripts/c4/specs.mjs";
import { syncC4Posts } from "../scripts/render-c4-diagrams.mjs";
import { hasArticleDiagram } from "../src/lib/content/article-html.ts";

test("C4 figures in blog posts match scripts/c4/specs.mjs", () => {
  assert.deepEqual(syncC4Posts({ check: true }), [], "run node scripts/render-c4-diagrams.mjs");
});

test("every C4 view renders in both locales with an accessible title and real node details", () => {
  const ids = new Set(C4_SPECS.map((spec) => spec.id));
  for (const spec of C4_SPECS) {
    for (const locale of ["en", "vi"]) {
      const html = renderC4Figure(spec, locale);
      assert.match(html, new RegExp(`aria-labelledby="c4-${spec.id}-${locale}-title c4-${spec.id}-${locale}-desc"`));
      assert.match(html, /<svg[^>]*><title id=/, `${spec.id} title is the first child of the svg`);
      assert.doesNotMatch(html, /—/, `${spec.id} ${locale} has an em dash`);
      assert.doesNotMatch(html, /undefined/, `${spec.id} ${locale} has a missing string`);
    }
    for (const node of spec.nodes) {
      if (node.drill) assert.ok(ids.has(node.drill), `${spec.id}:${node.id} drills into a missing view`);
    }
  }
});

test("C4 renderer refuses diagonal connectors and rounds elbows", () => {
  const spec = structuredClone(C4_SPECS[0]);
  spec.edges = [{ from: spec.nodes[0].id, to: spec.nodes[1].id, points: [[0, 0], [10, 10]] }];
  assert.throws(() => renderC4Figure(spec, "en"), /diagonal/);
  assert.equal(roundedPath([[0, 0], [40, 0], [40, 40]]), "M0,0 L32,0 Q40,0 40,8 L40,40");
});

test("the diagram viewer loads only for articles with a diagram figure and tracks its events", () => {
  assert.equal(hasArticleDiagram('<figure class="blog-figure" data-blog-diagram="c4-angi-context"><svg></svg></figure>'), true);
  assert.equal(hasArticleDiagram('<figure class="blog-figure"><img src="/a.webp" alt=""></figure>'), false);
  assert.equal(hasArticleDiagram('<p>data-blog-diagram="x"</p>'), false);
  const enhancer = readFileSync("src/components/blog/BlogWorkflowEnhancer.tsx", "utf8");
  assert.match(enhancer, /if \(diagram\) \{\s*void import\("\.\/blog-diagram-viewer"\)/);
  const viewer = readFileSync("src/components/blog/blog-diagram-viewer.ts", "utf8");
  for (const event of ["blog_diagram_open", "blog_diagram_select", "blog_diagram_switch"]) {
    assert.match(viewer, new RegExp(`track\\("${event}"`));
    assert.match(readFileSync("src/lib/analytics.ts", "utf8"), new RegExp(`\\| '${event}'`));
  }
  assert.match(viewer, /prefers-reduced-motion: reduce/);
});
