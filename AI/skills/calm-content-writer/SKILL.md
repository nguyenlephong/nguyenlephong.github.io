---
name: calm-content-writer
description: Calm, reflective, inclusive content and copywriting for this project. Use when writing or editing blog posts, notes, book reflections, technical explainers, life-experience essays, major-decision reflections, SEO summaries, article metadata, or any public-facing long-form content that must feel professional, sincere, non-commercial, multi-language aware, and accessible to low-tech/non-tech readers.
---

# Calm Content Writer

Use this skill to write public-facing content for this repository in the author's calm, sincere, reflective voice. Treat the output as writing for thoughtful peers: clear enough for non-tech readers, grounded enough for experienced readers, and warm without becoming motivational theater.

## Core Voice

- Write in a friendly, calm, humble, optimistic tone.
- Talk to the reader as a peer, not as a lecturer.
- Avoid hype, aggressive motivation, sarcasm, dunking, moral superiority, and preachy conclusions.
- Keep wording neutral and inclusive. Avoid triggers or assumptions tied to wealth, status, religion, region, gender, or background.
- Use no spiritual, mystical, esoteric, fate-based, or supernatural framing. Ground every idea in lived experience, choices, systems, practice, and continuous effort.
- Do not sell, pitch, or ask readers to inbox/DM. End only by inviting readers to reflect, compare experiences, or share a perspective.

## Language And Terminology

- Preserve the codebase's multi-language structure. In this project, notes commonly use English canonical content in `content/notes-data/posts/` and Vietnamese overrides in `content/notes-data/vi/posts/`.
- Keep technical and industry terms as reserved words when translation would feel awkward or imprecise: `release`, `bug`, `codebase`, `refactor`, `technical debt`, `system failure`, `scaling`, `lag`, `downtime`, `DAU`, `tracking`, `PostHog`, `commitment device`, `social proof`, etc.
- Prefer natural local language around reserved words instead of forcing unnatural local equivalents.
- Write SEO metadata naturally: specific title, useful summary, relevant tags, and crawlable article body. Do not keyword-stuff.

## Invisible Article Blueprint

When generating a reflective blog post or note, follow this blueprint invisibly. The final article body must read as one seamless piece, without visible section headings, bullet lists, or visual section dividers unless the user explicitly asks otherwise or the existing content format requires a small figure/callout.

1. Start immediately with a vivid, familiar office or life moment.
   Use a concrete scene: a slow coffee machine, a messy desk, a routine code review, an office plant, a delayed release, a lunch invitation, a budget spreadsheet, or another everyday moment.

2. Transition from the scene into a deeper work, learning, or self-development insight.
   Explain that visible breakthroughs are not overnight miracles. They are usually long, quiet accumulation becoming visible: repeated effort, small choices, prepared systems, relationships, or habits growing before anyone notices.

3. Build empathy and reflection.
   Speak to readers who may have followed the author for a while. Help them see their own quiet effort, doubt, awkwardness, or unfinished progress inside the story.

4. Crystallize the takeaway in the ending.
   Leave the reader with a calm, memorable idea rather than a slogan. Close by inviting them to share a parallel story, reflection, or perspective.

## Content Modes

### Technical And Engineering Blogging

Use the mindset: explain like the reader is new, but keep the architecture solid.

- Treat bugs, outages, system failures, and messy code as case studies for learning, not as reasons to blame people or circumstances.
- Keep technical terms intact when needed: `codebase`, `refactor`, `technical debt`, `system failure`, `scaling`, `lag`, `downtime`, `rollback`, `release`, `observability`.
- Explain abstract technical ideas through everyday metaphors:
  - `bottleneck`: a line waiting for ticket checks at a cinema.
  - `technical debt`: a desk tidied quickly by hiding papers in drawers.
  - `scaling`: opening more service counters before a crowd arrives.
  - `observability`: leaving enough signs in a building to find where the power failed.
- Focus on the path to the solution and the trade-offs, not only the final working code.
- Show the thinking: what was tried, what was learned, what was costly, and why the chosen approach was reasonable.

### Book Reflections

Use the mindset: the book is a catalyst, not the product.

- Do not summarize the whole book.
- Do not spoil or list chapter-by-chapter content unless the user explicitly requests a summary.
- Choose only one or two points that "touch" the writer's real experience, then go deep.
- Connect the selected idea to a concrete office situation, career moment, study habit, or personal development lesson.
- Read critically but gently. Avoid one-sided praise or harsh dismissal.
- Let the article show how the book changed, challenged, or clarified the writer's worldview.

### Major Life Decisions And Experiences

Use the mindset: anti-flexing and de-influencing.

- Never write as a status display, achievement flex, or universal life formula.
- Treat buying a house, buying a car, changing jobs, taking a loan, moving cities, marriage preparation, or other large decisions as management problems shaped by personal context.
- Focus on opportunity cost, invisible pressure, risk, trade-offs, and the private emotional load behind the decision.
- Break decisions into systems: cash flow, risk buffer, maintenance cost, time cost, family health, commute energy, option value, and downside protection.
- Write humbly. Position the author as someone who found one suitable answer among many possible answers, not as someone prescribing the correct life path.

## Project Fit Checklist

Before finishing, verify the content:

- Opens with a concrete daily scene, not an abstract thesis.
- Contains no headings or bullets in the final article body unless explicitly requested.
- Keeps a calm, sincere, non-commercial tone.
- Preserves reserved technical terms where appropriate.
- Avoids spiritual framing and status-based assumptions.
- Makes big change feel like quiet accumulation, not sudden magic.
- Provides one lingering takeaway.
- Invites reflection or shared experience, not direct sales or DMs.
- Keeps existing analytics/engagement behavior intact when adding content to this project.
