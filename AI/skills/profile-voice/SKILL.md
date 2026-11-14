---
name: profile-voice
description: Positioning, evidence, bilingual voice (EN + VI) and design grammar for Nguyen Le Phong's CV and profile surfaces. Use before writing or editing any profile copy or CV UI in this repo, including the homepage (Hero, Summary, CapabilityMap, Experience, Projects, ContactCTA), /about, SEO title/description, JSON-LD, OG images, README profile lines, src/content/{experience,projects,profile}.ts, the resume PDF generator, and messages/*.json namespaces Hero, Sections, Summary, Experience, Projects, CTA, About, SEO.
---

# Profile Voice

The site is a hiring surface for a senior technical leader. Every line must be true, checkable, written the way a calm senior engineer talks, and still correct in five years. This skill builds on `AI/skills/calm-content-writer/SKILL.md` (no hype, no selling, no em dashes) and overrides it only for CV copy: bullets are allowed, and lines lead with the result instead of a scene.

Read the references you need before editing:

- `references/positioning.md`: who the reader is, what each level screens for, the five pillars, above-the-fold rules, keywords, AI framing.
- `references/language.md`: EN and VI principles, AI-tell ban lists, term policy, number/date formats, pre-ship checklist.
- `references/design-grammar.md`: the "CV as a system spec" visual grammar, per-section concepts, type, spacing and motion rules.
- `references/owner-voice.md`: Phong's own beliefs, leadership style and natural EN/VI voice distilled from his notes, the AI-template tics to strip, and a checklist for writing profile copy that sounds like him.
- `AI/research/cv-evidence-inventory-2026-11-12.md`: the evidence ledger (claims, numbers, sources, confidence). Update it first when a fact changes.

## Who reads this

- Hiring managers and recruiters for Staff/Principal Engineer, Lead Fullstack / Product Engineer, and Engineering Manager / Head of Engineering roles.
- Markets: Vietnam product companies (primary for VI copy) and international remote (primary for EN copy).
- They scan for about 7 seconds: titles, the top third, the two most recent roles, then Ctrl+F for job keywords. Design every section for that scan first and for the deep read second.

## Positioning (do not drift)

Present Phong as a hands-on technical leader: he still writes the critical code, owns systems end to end, and can lead and grow a team. Never as a coordinator-only manager, never as a junior "passionate developer".

The evergreen spine. Each value must be shown with proof, never claimed with an adjective:

1. **Reliability at consumer scale**: systems that stay correct under bad networks and large load (Zalo PC sync and backup).
2. **Safe, progressive delivery**: risky changes ship in small reversible steps (feature flags, kill switches, default off).
3. **Architecture for multi-party trust**: tenancy, identity, partner and payment integrations where a mistake costs money or trust.
4. **Zero to pilot**: building a product from nothing inside someone else's constraints (BonBon in VETC).
5. **Leading through change**: maturity shown by operating across environments (outsourcing, startup, scale-up, big tech, post-CTO handover, own startup) and making the team steadier.

AI is a practice that runs through these pillars, not a pillar of its own. Describe the problem, the guardrail (human confirmation, least privilege, eval), and the measured result. Tool names live only in a dated "currently using" line.

## Non-negotiables

1. **Truth ledger first.** A claim, number, title or date may appear only if it is in the evidence ledger with a source. Confidence U (unverified) never ships. Self-reported (S) ships only as the owner's own statement without false precision. If the ledger and the copy disagree, fix the copy or ask the owner; never invent.
2. **One fact, one number, everywhere.** The same claim has the same number and wording in every locale, in Hero, Summary, Experience, Projects, About, SEO, JSON-LD, OG, README and the PDF generator (`scripts/export-resume-data.mjs`, `scripts/generate-resume-pdf.py`, `src/content/*.ts`). Change them in one pass, and update the tests that pin phrases.
3. **Claim, mechanism, number, date, link.** Each proof line names what changed, how it was measured, and how it was done. No number means a named mechanism, never an adjective. Third-party numbers carry their "as of" date.
4. **Evergreen.** No relative time without an anchor ("recently", "now", "in seven months"). No trend labels ("AI-native", "next-gen", "modern"). Present tense for ongoing work in a current role, past tense for launches and past roles.
5. **Engagement clarity.** Every concurrent role states its type (full-time, co-founder, contract, part-time). Gaps and returns are told plainly (the return to Zalo is a rehire as Lead, a trust signal).
6. **Native in both languages.** VI is rewritten from the meaning, not translated from EN. Read it aloud without the EN beside it; if a sentence only makes sense after reading the EN, rewrite it. EN reads like a senior engineer's own notes, not a template.
7. **No AI tells.** Apply the ban lists in `references/language.md`. Zero em dashes anywhere. No triads of abstract nouns, no "not X but Y", no "turn X into Y", no trailing "-ing" clauses, no self-praise.
8. **Credit honestly.** "Led", "co-founded", "helped secure" for shared results; "built", "wrote", "designed" only for his own part.
9. **Design grammar.** Nodes and edges, not cards. Numbers sit on the thing they measure. Mono only for dates, measurements and code. No eyebrows above headings, no gradient text, no fake sparklines, no hero-metric grids, no section numbering. One authored moment per section; the default state is the final state; every animation has a reduced-motion guard.
10. **Every interactive control is tracked.** Follow the analytics rules in `CLAUDE.md`/`AGENTS.md`: update `src/lib/analytics.ts`, keep existing event names, add a test.

## Workflow

1. Identify every surface the change touches (copy, data files, PDF generator, SEO, JSON-LD, OG, tests that pin phrases). Grep for the old phrase across `messages/`, `src/`, `scripts/`, `tests/`, `README.md`.
2. Check each claim against the evidence ledger. Missing or U? Ask the owner with a precise question, and leave the claim out until answered.
3. Write EN and VI independently from the same facts. Then sync fr/ja/ko/zh to the same facts (simpler wording is fine; never leave stale or contradictory content in them).
4. For UI, follow `references/design-grammar.md`, load the impeccable skill's craft floor before editing, and verify by screenshots at 375, 768, 1024 and 1440 in dark and light, EN and VI.
5. Run the guard and tests:
   - `node scripts/verify-profile-voice.mjs` (must exit 0)
   - `npm test`
   - `npx tsc --noEmit -p .`
6. Run the pre-ship checklist at the end of `references/language.md`.

## When the market changes

The pillars and the non-negotiables are written to last. Re-check `references/positioning.md` (hiring trends, keywords, AI expectations) about once a year, or when the owner's target role changes. Update the research note with dated sources, then the reference, then the copy, in that order.
