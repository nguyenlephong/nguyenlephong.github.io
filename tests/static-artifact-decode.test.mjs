import test from "node:test";
import assert from "node:assert/strict";
import { decodeXml } from "../scripts/verify-static-artifact.mjs";

test("decodeXml decodes React's &#x27; and never double-decodes &amp;", () => {
  assert.equal(decodeXml("l&#x27;équipe"), "l'équipe");
  assert.equal(decodeXml("l&#39;équipe"), "l'équipe");
  assert.equal(decodeXml("&amp;#39;"), "&#39;");
  assert.equal(decodeXml("a &amp; b &lt;c&gt; &quot;d&quot;"), 'a & b <c> "d"');
});
