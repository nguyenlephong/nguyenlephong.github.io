import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile("src/app/[locale]/(site)/blog/blog.css", "utf8");
const readerCss = await readFile(
  "src/app/[locale]/(site)/blog/reader.css",
  "utf8"
);
const blogExplorer = await readFile("src/components/blog/BlogExplorer.tsx", "utf8");
const notesExplorer = await readFile(
  "src/components/notes/NotesExplorer.tsx",
  "utf8"
);
const explorerShell = await readFile(
  "src/components/explorer/ExplorerShell.tsx",
  "utf8"
);
const useExplorerHook = await readFile(
  "src/components/explorer/useExplorer.ts",
  "utf8"
);

function blockFor(selector, source = css) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  assert.ok(match, `missing CSS block for ${selector}`);
  return match[1];
}

test("blog and notes explorer controls use a compact command palette contract", () => {
  // Owner request (2026-11-13): a calm field on site tokens. No gradient glow,
  // blur or orange accent; sentence-case count; a neutral filter button.
  const explorerVars = blockFor(".blog-explorer");
  assert.match(explorerVars, /--blog-control-border:\s*var\(--border\)/);
  assert.match(explorerVars, /--blog-control-focus:\s*var\(--accent-strong\)/);
  const commandCss = css
    .split("\n")
    .filter((line) => /blog-command|blog-search/.test(line))
    .join("\n");
  assert.doesNotMatch(commandCss, /::(before|after)\s*\{[^}]*gradient/);
  assert.doesNotMatch(css, /command-listening|command-apple|--blog-ai-/);

  const command = blockFor(".blog-command");
  assert.match(command, /position:\s*relative/);

  const bar = blockFor(".blog-command__bar");
  assert.match(bar, /border:\s*1px solid var\(--blog-control-border\)/);
  assert.match(bar, /background:\s*var\(--blog-control-fill\)/);
  assert.doesNotMatch(bar, /gradient|backdrop-filter|blur/);
  assert.match(css, /\.blog-command__bar:has\(\.blog-search__input:focus-visible\)/);

  const searchInput = blockFor(".blog-search__input");
  assert.match(searchInput, /color:\s*var\(--fg\)/);
  const searchPlaceholder = blockFor(".blog-search__input::placeholder");
  assert.match(searchPlaceholder, /color:\s*var\(--fg-subtle\)/);

  const count = blockFor(".blog-command__count");
  assert.match(count, /tabular-nums/);
  assert.doesNotMatch(count, /uppercase|font-mono/);

  // The standalone rule, not the shared clear/toggle reset above it.
  const toggle = blockFor("}\n.blog-command__toggle");
  assert.match(toggle, /width:\s*2\.75rem/);
  assert.match(toggle, /height:\s*2\.75rem/);
  assert.doesNotMatch(toggle, /accent/);
  assert.match(explorerShell, /aria-expanded=\{paletteOpen\}/);

  const label = blockFor(".blog-command__label");
  assert.doesNotMatch(label, /uppercase|font-mono/);

  const palette = blockFor(".blog-command__palette");
  assert.match(palette, /position:\s*absolute/);
  assert.match(palette, /width:\s*100%/);
  assert.doesNotMatch(palette, /backdrop-filter|gradient/);
  assert.match(css, /\.blog-command\.is-dropup\s+\.blog-command__palette/);

  const tokens = blockFor(".blog-command__tokens");
  assert.match(tokens, /flex-wrap:\s*wrap/);

  // The command-palette markup contract now lives in the shared shell + hook,
  // and both the blog and notes surfaces consume them.
  assert.match(useExplorerHook, /paletteOpen/);
  assert.match(useExplorerHook, /palettePlacement/);
  assert.match(explorerShell, /blog-command__palette/);
  assert.match(explorerShell, /blog-command__toggle/);
  assert.match(blogExplorer, /ExplorerShell/);
  assert.match(blogExplorer, /useExplorer/);
  assert.match(notesExplorer, /ExplorerShell/);
  assert.match(notesExplorer, /useExplorer/);

  // MEP-38: both reader discs share one glass token set (no aurora rim on one).
  const readerDiscs = blockFor(".blog-reader-tools__top,\n.blog-reader-tools__trigger", readerCss);
  assert.match(readerDiscs, /background:\s*var\(--reader-tool-surface\)/);
  assert.match(readerDiscs, /backdrop-filter:/);
  assert.doesNotMatch(readerCss, /reader-tool-aurora/);

  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
