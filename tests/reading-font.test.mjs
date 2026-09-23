import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("Inter is the self-hosted default font and notes follow the reader's choice", async () => {
  const [documentCss, notesCss, switcher, font] = await Promise.all([
    readFile("src/app/document.css", "utf8"),
    readFile("src/app/[locale]/(site)/notes/notes.css", "utf8"),
    readFile("src/components/font/FontSwitcher.tsx", "utf8"),
    stat("src/fonts/InterVariable-latin-vi.woff2")
  ]);

  assert.match(documentCss, /font-family: 'Inter';\s*src: url\('\.\.\/fonts\/InterVariable-latin-vi\.woff2'\)/);
  assert.match(documentCss, /font-display: swap/);
  assert.match(documentCss, /font-family: 'Inter Fallback';\s*src: local\('Arial'\)/);
  assert.match(documentCss, /--font-sans: 'Inter', 'Inter Fallback', system-ui/);
  assert.doesNotMatch(documentCss, /fonts\.googleapis|fonts\.gstatic/);
  assert.ok(font.size < 64 * 1024, "Inter subset should stay under 64 KiB");

  assert.match(notesCss, /--notes-font: var\(--font-sans\);/);
  assert.doesNotMatch(notesCss, /var\(--serif\)/);
  assert.match(switcher, /fontFamily: "'Inter', system-ui, sans-serif"/);
});
