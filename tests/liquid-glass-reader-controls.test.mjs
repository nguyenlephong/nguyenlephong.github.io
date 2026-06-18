import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile("src/app/[locale]/blog/blog.css", "utf8");

function blockFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  assert.ok(match, `missing CSS block for ${selector}`);
  return match[1];
}

test("blog and notes explorer controls expose the liquid glass material contract", () => {
  const controls = blockFor(".blog-explorer__controls");
  assert.match(controls, /--blog-control-glass:/);
  assert.match(controls, /--blog-control-border:/);
  assert.match(controls, /--blog-control-shadow:/);

  const search = blockFor(".blog-search");
  assert.match(search, /backdrop-filter:/);
  assert.match(search, /saturate/);

  const filters = blockFor(".blog-filters");
  assert.match(filters, /backdrop-filter:/);
  assert.match(filters, /--blog-segment-fill:/);

  const tags = blockFor(".blog-tags");
  assert.match(tags, /backdrop-filter:/);
  assert.match(tags, /--blog-tag-fill:/);

  assert.match(css, /@media\s*\(prefers-reduced-transparency:\s*reduce\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
