import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const BASELINE_LABELS = {
  "specs/authored-content-static-export.md": Array.from(
    { length: 15 },
    (_, index) => `${index + 1}.`
  ),
  "specs/content-list-loading-performance.md": Array.from(
    { length: 6 },
    (_, index) => `${index + 1}.`
  ),
  "specs/content-publication-lifecycle.md": Array.from(
    { length: 9 },
    (_, index) => `AC-CPL-${String(index + 1).padStart(3, "0")}`
  ),
  "specs/curated-content-hubs.md": Array.from(
    { length: 16 },
    (_, index) => `AC-CCH-${String(index + 1).padStart(3, "0")}`
  ),
  "specs/engagement-provider-boundary.md": Array.from(
    { length: 8 },
    (_, index) => `ENG-${String(index + 1).padStart(3, "0")}`
  ),
  "specs/seo-field-data-monitoring.md": Array.from(
    { length: 9 },
    (_, index) => `${index + 1}.`
  ),
  "specs/static-content-pagination.md": Array.from(
    { length: 13 },
    (_, index) => `AC-SCP-${String(index + 1).padStart(3, "0")}`
  ),
  "specs/static-performance-budgets.md": Array.from(
    { length: 22 },
    (_, index) => `AC-SPB-${String(index + 1).padStart(3, "0")}`
  ),
  "specs/static-page-seo-localization.md": Array.from(
    { length: 12 },
    (_, index) => `AC-SPS-${String(index + 1).padStart(3, "0")}`
  ),
  "specs/static-runtime-boundaries.md": Array.from(
    { length: 11 },
    (_, index) => `AC-SRB-${String(index + 1).padStart(3, "0")}`
  )
};

function acceptanceSection(source) {
  const heading = source.indexOf("## Acceptance criteria");
  assert.notEqual(heading, -1, "missing Acceptance criteria heading");
  const nextHeading = source.indexOf("\n## ", heading + 1);
  return source.slice(heading, nextHeading === -1 ? undefined : nextHeading);
}

function acceptanceLabels(source) {
  const labels = [];
  for (const line of acceptanceSection(source).split("\n")) {
    const named = line.match(/^\s*-\s+\*\*([A-Z][A-Z0-9-]*-\d+):\*\*/);
    const numbered = line.match(/^\s*(\d+)\.\s/);
    if (named) labels.push(named[1]);
    else if (numbered) labels.push(`${numbered[1]}.`);
  }
  return labels;
}

test("modified specs preserve every pre-existing acceptance label as a prefix", async () => {
  for (const [file, baseline] of Object.entries(BASELINE_LABELS)) {
    const current = acceptanceLabels(await readFile(file, "utf8"));
    assert.deepEqual(
      current.slice(0, baseline.length),
      baseline,
      `${file} changed or reordered a pre-existing acceptance label`
    );
    assert.equal(
      new Set(current).size,
      current.length,
      `${file} contains duplicate acceptance labels`
    );
  }
});
