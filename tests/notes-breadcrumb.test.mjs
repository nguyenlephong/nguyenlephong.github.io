import { strict as assert } from "node:assert";
import test from "node:test";
import { buildNotesTopicHref } from "../src/lib/notes/urls.ts";

test("builds a shareable notes topic listing href for breadcrumb parents", () => {
  assert.equal(buildNotesTopicHref("goc-nhin"), "/notes?topic=goc-nhin");
});
