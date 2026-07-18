import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScriptModule(path) {
  const source = await readFile(path, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  });
  const encoded = Buffer.from(outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

test("intent prefetch stays disabled until a link receives intent", async () => {
  const { resolveIntentPrefetch } = await importTypeScriptModule(
    "src/components/navigation/intent-prefetch.ts"
  );

  assert.equal(resolveIntentPrefetch(false), false);
  assert.equal(resolveIntentPrefetch(true), null);
});

test("article cards use the shared intent link without losing analytics", async () => {
  const [link, blogCard, noteCard] = await Promise.all([
    readFile("src/components/navigation/IntentPrefetchLink.tsx", "utf8"),
    readFile("src/components/blog/BlogPostCard.tsx", "utf8"),
    readFile("src/components/notes/NoteCard.tsx", "utf8")
  ]);

  assert.match(link, /ComponentProps<typeof Link>/);
  assert.match(link, /"prefetch"/);
  assert.match(link, /prefetch=\{resolveIntentPrefetch\(hasIntent\)\}/);
  assert.match(link, /onFocus=\{\(event\) =>/);
  assert.match(link, /onMouseEnter=\{\(event\) =>/);
  assert.doesNotMatch(link, /onClick=/);
  assert.doesNotMatch(link, /onTouchStart=/);

  for (const [card, eventName] of [
    [blogCard, "blog_card_click"],
    [noteCard, "notes_card_click"]
  ]) {
    assert.match(card, /IntentPrefetchLink/);
    assert.match(card, /onClick=\{\(\) =>/);
    assert.match(card, new RegExp(`track\\(["']${eventName}["']`));
  }
});

test("header eagerly loads the small display icon and preserves the app icon", async () => {
  const [header, appIcon] = await Promise.all([
    readFile("src/components/AppHeader.tsx", "utf8"),
    readFile("src/app/icon.png")
  ]);

  assert.match(header, /src="\/favicon\/android-icon-72x72\.png"/);
  assert.match(header, /width=\{36\}/);
  assert.match(header, /height=\{36\}/);
  assert.match(header, /sizes="36px"/);
  assert.match(header, /loading="eager"/);
  assert.match(header, /fetchPriority="high"/);
  assert.doesNotMatch(header, /src="\/icon\.png"/);
  assert.ok(appIcon.byteLength > 0);
});
