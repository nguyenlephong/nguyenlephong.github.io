---
version: 1
slug: "src-app-admin"
primary_target: "src/app/admin"
related_targets: ["src/components/admin"]
---

# /admin surface brief

Scope: the owner-only stats page at `/admin` (lock screen and dashboard). Mode: Operate. Single visitor: the owner, on desktop or phone, checking what people read.

Job: see total reads, shares and reactions, which categories and posts lead, which published posts nobody has opened, and find any post fast. Data: every `postStats` doc read in the browser, joined with the build-time blog and notes catalog.

Constraints: no new dependencies, no chart library, dashboard lazy-loaded after unlock, public bundles unchanged, noindex, reduced motion respected, light and dark both intentional.

## Direction contract

THESIS: /admin is the homepage hero's sibling, the owner's writing drawn as a deployment he runs. It refuses the KPI-tile dashboard: one huge number over the particle field and a topology of categories carry the overview.

OWN-WORLD: the homepage world. Dark-first ground with the architecture particle field, Inter display at 700 with tight tracking against muted body, a glowing blue root node on a vertical spine, dashed blue wires with mono annotations, outlined glassy nodes on bg-elevated with a soft accent glow, the green-dot news pill. Six category hues mark identity only (dots, ports, bars).

STORY: the owner unlocks, sees the total count up, reads which branches carry the reads, scans the most read list, sees the dotted posts nobody has found, then searches or filters the full table.

FIRST VIEWPORT: lock screen and dashboard share the home hero grid (1.15fr / 1fr). Left: news pill, display figure, claim line, muted meta, actions. Right: topology, root "Phong" then one node per category, edges annotated "reads / posts". Locked, edges are dotted and idle and the password pill sits in the left column.

FORM: homepage hero grammar applied to a working dashboard; seed: none (pinned) "Inherit the profile homepage's visual language ... The admin should feel like a sibling of that hero, not a generic dashboard." First surface, from the same request: "Total reads as a hero number over the particle field ... Categories drawn as topology nodes and branches, with reads and posts on dashed connectors ... The lock screen as the same hero with the password input living in that composition." The request lists these as ideas; the owner's complaint about the previous build (not like his profile) is read as binding them, so no concept roll was run.

Signature interaction: hovering or focusing a category node highlights that category across topology, most read and the table; clicking it filters the table. Motion: topology draws in once, numbers count up, bars grow in on first view, sections reveal with a capped stagger; all off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
