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
  assert.match(controls, /--blog-search-field-fill:/);
  assert.match(controls, /--blog-search-text:/);
  assert.match(controls, /--blog-search-placeholder:/);

  const command = blockFor(".blog-command");
  assert.match(command, /position:\s*relative/);

  const commandOuterHalo = blockFor(".blog-command::before");
  assert.match(commandOuterHalo, /command-listening-halo/);
  assert.match(commandOuterHalo, /filter:\s*blur/);

  assert.match(css, /\.blog-command::after\s*\{[\s\S]*?command-listening-orbit/);
  assert.match(css, /\.blog-command::after\s*\{[\s\S]*?conic-gradient/);
  assert.match(css, /\.blog-command::after\s*\{[\s\S]*?filter:\s*blur/);

  const bar = blockFor(".blog-command__bar");
  assert.match(bar, /--blog-search-field-fill-current:/);
  assert.match(bar, /var\(--blog-search-field-fill-current\)/);
  assert.match(bar, /--blog-search-field-tint-strength:\s*2%/);
  assert.match(bar, /backdrop-filter:/);
  assert.match(bar, /saturate/);

  const commandField = blockFor(".blog-command__bar::before");
  assert.match(commandField, /command-apple-field/);
  assert.match(commandField, /radial-gradient/);
  assert.match(commandField, /background-blend-mode:\s*screen/);

  const commandHalo = blockFor(".blog-command__bar::after");
  assert.match(commandHalo, /command-apple-sheen/);
  assert.match(commandHalo, /radial-gradient/);
  assert.match(commandHalo, /opacity:\s*0\.05/);
  assert.doesNotMatch(commandHalo, /mask-composite/);

  assert.match(
    css,
    /\.blog-command\.is-open \.blog-command__bar,[\s\S]*?--blog-search-field-fill-current:\s*var\(--blog-search-field-fill-focus\)/
  );

  const searchInput = blockFor(".blog-search__input");
  assert.match(searchInput, /color:\s*var\(--blog-search-text\)/);
  const searchPlaceholder = blockFor(".blog-search__input::placeholder");
  assert.match(searchPlaceholder, /color:\s*var\(--blog-search-placeholder\)/);

  const palette = blockFor(".blog-command__palette");
  assert.match(palette, /position:\s*absolute/);
  assert.match(palette, /width:\s*100%/);
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

  const readerTrigger = blockFor(".blog-reader-tools__trigger");
  assert.match(readerTrigger, /position:\s*relative/);
  assert.match(readerTrigger, /overflow:\s*visible/);
  const readerFlicker = blockFor(".blog-reader-tools__trigger::before");
  assert.match(readerFlicker, /reader-tool-aurora-pulse/);
  assert.match(
    css,
    /\.blog-reader-tools__trigger::after\s*\{[\s\S]*?reader-tool-aurora-rim/
  );

  assert.match(css, /@keyframes\s+command-apple-field/);
  assert.match(css, /@keyframes\s+command-apple-sheen/);
  assert.match(css, /@keyframes\s+command-listening-halo/);
  assert.match(css, /@keyframes\s+command-listening-orbit/);
  assert.match(css, /@keyframes\s+reader-tool-aurora-pulse/);
  assert.match(css, /@keyframes\s+reader-tool-aurora-rim/);
  assert.match(css, /@media\s*\(prefers-reduced-transparency:\s*reduce\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
