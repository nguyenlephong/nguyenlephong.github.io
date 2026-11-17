import assert from "node:assert/strict";
import test from "node:test";
import { analyzeText, extractText, violations } from "../scripts/report-content-tone.mjs";

test("tone report catches the EN patterns it promises", () => {
  const counts = analyzeText(
    "Picture this: the review is quiet. It's not a gate, it's a conversation — and it is crucial. Not just bugs, but people.",
    "en"
  );
  assert.deepEqual(counts, {
    "em-dash": 1,
    contrast: 2,
    "staged-opener": 1,
    "mood-word": 1,
    "ai-vocabulary": 1
  });
  assert.deepEqual(violations(counts, "en"), ["em-dash", "contrast", "staged-opener", "mood-word", "ai-vocabulary"]);
});

test("tone report catches the VI patterns it promises", () => {
  const counts = analyzeText(
    "Hãy tưởng tượng: bạn lặng lẽ sửa bug; review không phải để bắt lỗi mà để học. Nó biến team thành một nhà.",
    "vi"
  );
  assert.deepEqual(counts, {
    contrast: 1,
    "staged-opener": 1,
    "mood-word": 1,
    "ai-vocabulary": 1,
    semicolon: 1
  });
  assert.deepEqual(violations(counts, "vi"), ["staged-opener", "mood-word", "ai-vocabulary"]);
});

test("clean prose, code and entities are not flagged", () => {
  assert.deepEqual(analyzeText("Ask a question first. Then suggest a fix.", "en"), {});
  assert.deepEqual(analyzeText("Mình hỏi trước, rồi mới gợi ý cách sửa. Đổi biến số này thành const.", "vi"), {});
  const text = extractText("<p>Run <code>a — b; quiet</code> &amp; done</p><pre>x; y</pre>");
  assert.deepEqual(analyzeText(text, "en"), {});
  assert.deepEqual(analyzeText(text, "vi"), {});
});
