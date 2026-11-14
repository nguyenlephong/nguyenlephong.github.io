---
version: 1
slug: "src-app-locale-studio"
primary_target: "src/app/[locale]/studio"
related_targets: []
---

# Studio surface brief

Scope: `/[locale]/studio` index and the three module pages (`checklists`, `system-maps`, `ai-setup`). Visitor mode: Read. Hiring managers read how the owner runs delivery; engineers take a checklist back to their team. Owner decisions 2026-11-14: read-first, site header and footer, no admin shell, system map is a viewer (zoom, pick a zone), three modules only (AI Skills folds into AI setup).

Unresolved: none blocking. Content for fr/ja/ko/zh falls back to English with a notice, as today.

## Direction contract

THESIS: Each module opens like a chapter of an engineering handbook: a large title, the reader's question it answers, and the parts strung on one dashed line in the order the work happens. Refuses the admin dashboard (sidebar, card grid, chips, gradient border) and the generic docs sidebar.

OWN-WORLD: The site's world unchanged: cool grey ground, Inter at heavy display weights, JetBrains Mono only for small meta and stage labels, one blue accent for the active node, nodes and dashed edges from the homepage, hairline rules, no cards inside cards, no chips, no gradients.

STORY: The reader sees what the module answers, sees all parts at once on the line, jumps to one, reads a calm column, copies it as Markdown or ticks steps locally, and moves to the next chapter.

FIRST VIEWPORT: Site header. Left: mono crumb, H1 at ~84px over two lines. Right column aligned to the H1 baseline: the reader's question at 22px and a mono meta line (counts, copy hint). Below: the dashed lifecycle line with one node per part, stage label in mono above the name, active node filled blue. Then a hairline and the first part: H2, lead at 62ch, first gate; a narrow right aside holds Copy as Markdown and a one-line note.

FORM: Chapter openers, position 5 on the ordered list, seed:4a7e356ca03912fa. Raises: one dashed line threads the parts in work order (provenance ribbon); tick state is a mark in a fixed cell, filled done, hollow open (timetable slide rack); the line flags the checklist read last (cutting bench); every zone on the system map links to its description and back (patent drawing sheet).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
