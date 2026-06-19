import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile("src/app/[locale]/blog/blog.css", "utf8");
const blogExplorer = await readFile("src/components/blog/BlogExplorer.tsx", "utf8");
const notesExplorer = await readFile(
  "src/components/notes/NotesExplorer.tsx",
  "utf8"
);

function blockFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  assert.ok(match, `missing CSS block for ${selector}`);
  return match[1];
}

test("blog and notes explorer controls use a compact command palette contract", () => {
  const controls = blockFor(".blog-explorer__controls");
  assert.match(controls, /--blog-control-glass:/);
  assert.match(controls, /--blog-control-border:/);
  assert.match(controls, /--blog-control-shadow:/);

  const command = blockFor(".blog-command");
  assert.match(command, /position:\s*relative/);

  const bar = blockFor(".blog-command__bar");
  assert.match(bar, /backdrop-filter:/);
  assert.match(bar, /saturate/);

  const palette = blockFor(".blog-command__palette");
  assert.match(palette, /position:\s*absolute/);
  assert.match(palette, /backdrop-filter:/);
  assert.match(css, /\.blog-command\.is-dropup\s+\.blog-command__palette/);

  const tokens = blockFor(".blog-command__tokens");
  assert.match(tokens, /flex-wrap:\s*wrap/);

  assert.match(blogExplorer, /paletteOpen/);
  assert.match(blogExplorer, /palettePlacement/);
  assert.match(blogExplorer, /blog-command__palette/);
  assert.match(blogExplorer, /blog-command__toggle/);
  assert.match(notesExplorer, /paletteOpen/);
  assert.match(notesExplorer, /palettePlacement/);
  assert.match(notesExplorer, /blog-command__palette/);
  assert.match(notesExplorer, /blog-command__toggle/);

  assert.match(css, /@media\s*\(prefers-reduced-transparency:\s*reduce\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
