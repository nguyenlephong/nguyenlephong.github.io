# Session: Reflective life essays (perspectives)

## Objective
Turn a Vietnamese prose-poem (meaning of life = the living, not the destination; stop waiting for "later") into a full blog essay. First of a planned line of similar life-reflection pieces.

## Decisions (user-confirmed)
- Category: **perspectives** (Chia sẻ), **standalone featured**, **no series** (user picked "bài lẻ").
- Languages: **en + vi** only (fr/ja/ko/zh fall back to English via data.ts merge — same as other partly-translated posts).

## Current State — DONE (build green)
- `posts/meaning-is-in-the-living.json` (en, canonical) + `vi/posts/meaning-is-in-the-living.json`.
  - Title EN: "The Meaning of a Life Is in the Living: A Gentle Case Against Waiting for 'Later'".
  - category `perspectives`, date 2026-06-03, 13 min, featured, NO series.
  - Opens with the user's original poem as a `<blockquote>` epigraph (VI = their exact words; EN = poetic translation).
  - Sections: destination isn't the point → life makes no appointments → what mattered fades → the "later" trap (SVG "waiting line vs live today" diagram, dgm-*) → too busy to love → what life is also for → live don't exist → unfinished-but-radiant → key takeaways. 5 FAQs.
- Registered in base `_index.json` + `vi/_index.json` (both now 29 posts, inserted at front).
- Validated: en/vi structural parity, identical anchor ids, 1 blockquote, 5 faqs, no series. `npm run build` OK (1055 pages, route + OG generated for all 6 locales).

## Notes
- Tracking (PostHog `notes_*`), view/share/reactions, OG image are component-based → automatic.
- fr/ja/ko/zh render the EN content (no override file) — consistent with how-ai-changes-software-roles etc.

## Second essay — DONE (build green)
- `posts/solitude-of-great-minds.json` (en) + `vi/posts/solitude-of-great-minds.json`.
  - Title EN: "The Solitude of Great Minds: The Quiet Strength of People Who Walk Alone".
  - From a Vietnamese source about lonely/independent "awakened" people; expanded with healthy framing.
  - Core distinction: solitude (chosen, restoring) vs loneliness (a gap, draining) — SVG contrast diagram.
  - Sections: solitude≠loneliness → worth within not borrowed → gentle outside/steel inside → reading people → high threshold not cold → if a warm person goes quiet → inner fortress → through the dark (with a "keep one gate open" healthy caveat). 5 FAQs (woven with user's VI keywords).
  - perspectives, 2026-06-03, 13 min, featured, NO series. Registered base + vi (both now 30 posts).

## Next Steps
- Two reflective essays NOT committed yet (user hasn't asked): `meaning-is-in-the-living` + `solitude-of-great-minds` (4 post files + base/vi index edits). To ship: `git add public/blog-data && git commit` on `dev` (no Claude co-author).
- Future: more life-reflection essays in perspectives; if the collection grows, consider grouping into a series later (e.g. "Sống Trọn / Living Fully").

---
## Post 8 — Same Facts, Different Story (perspectives / Chia sẻ) — DONE (build green)
- Slug: `same-facts-different-story`, category `perspectives`, featured, 2026-06-03, 13 min. EN + VI.
- Source: VI TikTok-style prose (pond vs one fish; floor 1 vs floor 100; reframing changes the world's reaction; position decides "right/wrong"; Google Maps "recalculating"; don't live in the mistake; change your standing not your explanation).
- Editorial: replaced the 2 risqué source examples (sex-work / "sleep with you" / coveting another's wife) with workplace reframes, per user's professional + all-audience principles. Kept the clean universal ones ("keep failing"->"keep trying", layoffs->"optimization", wolf->cruel).
- Theme = two dials you control: WHERE you stand (pond/floors/chair) + HOW you say it (reframe/map's calm "recalculating"). 7 sections, anchors: pond-not-the-fish, which-floor, say-it-differently, whose-side-decides, recalculating-route, dont-live-in-the-mistake, change-your-standing.
- 2 SVG diagrams (dgm-* classes): dgm-floors (floor 1/10/100, criticism reaches less higher up) + dgm-reroute (wrong turn -> recalculating -> new route -> arrive). 2 tables (reframes; two-chairs). 1 blockquote epigraph (VI = user's exact words). 5 FAQs woven w/ user keywords.
- EN+VI full structural parity verified. Registered FIRST in perspectives in both base + vi _index.json (now 36 posts each). npm run build OK (1139 pages; route + OG for all 6 locales).
- Tracking (views/shares/reading-time via PostHog BlogReadingTracker) automatic — no code. NOT committed yet (user hasn't asked).

---
## Post 9 — Complexity Is Inevitable, Simplicity Is Sustainable (perspectives / Chia sẻ) — DONE (build green)
- Slug: `complexity-is-inevitable-simplicity-is-sustainable`, category `perspectives`, featured, 2026-06-03, 12 min. EN + VI.
- Source: VI essay by "Lộc Nguyễn" ("Sự phức tạp là tất yếu. Sự đơn giản là bền vững.") — engineering-philosophy reflection from large-scale distributed systems, extended to life. Author kept as `Nguyen Le Phong` (codebase convention, not the byline).
- Theme: Essential vs Accidental complexity → technical debt as compound interest → simplicity = Clarity (not crude) → simplicity is the harder choice (YAGNI/boring-tech/trade-offs) → systems→life. 5 sections, anchors: complexity-is-inevitable, the-uncontrolled-trap, simplicity-is-clarity, simplicity-is-a-hard-choice, from-systems-to-life.
- 2 SVG diagrams (dgm-* classes): dgm-two-kinds (Essential vs Essential+Accidental bars) + dgm-over-time (controlled vs unchecked complexity vs cognitive-load limit line → stagnation). 3 tables (where complexity grows + everyday parallel; afraid-of vs understand; tempting vs disciplined path). 1 blockquote epigraph. 4 callouts. blog-takeaways (7). 5 SEO FAQs.
- Technical terms kept in EN per user principle (abstraction, magic code, Sharding/Replication/Caching, Event-driven, RBAC/ACL, CI/CD, YAGNI, Technical Debt, Cognitive Load, Clarity, refactor, hype...). Office-relatable examples for non-tech readers (sticky note, office key→badges, renovate-while-open, 3am on-call).
- EN+VI full structural parity verified (ids/tables/dgm/bq/figs/callouts/takeaways/faqs all equal). Registered FIRST in perspectives in both base + vi _index.json (now 37 posts each). npm run build OK (1151 pages; route + OG for all 6 locales).
- Tracking automatic via BlogReadingTracker (notes_article_view / scroll_depth / read_complete / read_time) + BlogViewCount + BlogShareDock — no code. NOT committed yet (user hasn't asked).

---
## Post 10 — Choice or Fate? (perspectives / Chia sẻ) — DONE (tsc green)
- Slug: `choice-or-fate`, category `perspectives`, featured, 2026-06-08, 12 min. EN + VI.
- Source: VI healing/spiritual essay ("Khám Phá Cuộc Đời: Lựa Chọn Hay Số Phận?", Max Zhao Healing). DROPPED the source's product CTA (Max Zhao candle ad + hashtags) — not appropriate for this blog. Author kept `Nguyen Le Phong`.
- Theme: choice vs fate (braided) → invisible threads (nhân duyên + `quantum entanglement` metaphor, honestly flagged as metaphor) → the ledger always balances → the circle of control (CORE) → two responses to the same blow → peace = steady captain not calm sea. Anchors: the-accidental-meeting, invisible-threads, the-ledger-balances, the-circle-of-control, two-responses, peace-is-a-steady-captain.
- 3 SVG diagrams (dgm-* classes): arc ("from inside = wandering, from above = a route"), concentric circle-of-control (outer ring not-yours / inner yours), fork (same setback → smaller-harder self vs wiser-kinder self). 1 table (advantage → hidden invoice). 4 callouts (tip/note/warn/tip). blog-takeaways (5). 5 SEO FAQs woven w/ user keywords (cuộc đời và số phận, sắp đặt, kết nối vô hình, biến cố, sống trọn vẹn, tự do bên trong...).
- Office/life-relatable examples for non-tech readers (onboarding seat-mate mentor, coffee-queue job, rejected proposal returning, side-project skill, reorg/layoff/failed-launch, "luck" hiding its invoice). Jargon kept EN per principle (reorg, layoff, feedback, side project, ship, one-on-one, entanglement, market, timing).
- EN+VI structural parity verified (balanced tags, 6 h2, 3 svg, 4 callouts, 1 table, 5 faqs each). Registered FIRST in perspectives in both base + vi _index.json (+18 lines each, minimal diff). `npx tsc --noEmit` clean.
- **Reading-time tracking fix:** `BlogReadingTracker` was only mounted on notes/[slug]/page.tsx, NOT blog. Added it to blog/[category]/[slug]/page.tsx (inside EngagementProvider, category+slug+readingMinutes) so blog posts now actually emit PostHog reading events. Earlier snapshot claims of "automatic on blog" were aspirational until this edit.
- NOT committed yet (user hasn't asked).

---
## Post 11 — How People Actually Work / Cách Con Người Thật Sự Vận Hành (perspectives) — DONE (build green)
- Slug: `how-people-actually-work`, category `perspectives`, featured, 2026-06-08, 13 min. EN + VI.
- Source: VI psychology listicle (15 truths "người xưa nói rất đúng" — con người sống bằng cảm xúc/niềm tin/câu chuyện). Wove all 15 points into 6 thematic sections (no listicle feel, per anti-template). Author kept `Nguyen Le Phong`.
- Mapping of the 15 → sections: §1 we-run-on-feeling (1 feeling-not-favour, 3 confirmation-bias, 13 repetition→belief) · §2 armor (2 control, 4 anger, 5 ego) · §3 stories-that-hurt (6 imagined rejection, 10 expectation, 9 dopamine/attention) · §4 the-gap (7 react-less, 11 calm>loud) · §5 reading-people (8 bitter medicine, 12 envy from peers) · §6 healing-and-seeing (14 healing≠forgetting, 15 seeing too soon).
- 3 SVG diagrams (dgm-* classes): lens/fork (same neutral msg → 2 beliefs → 2 readings), iceberg (shown anger/control/ego tip vs hidden fear mass, polygon + waterline), gap (Frankl stimulus→pause→response, 2 rows). 1 table (feels-good vs is-good). 2 callouts (tip + warn). blog-takeaways (6). 5 SEO FAQs.
- Office/life-relatable examples (manager you remember from a 1:1, "ok, noted" Slack snub, micromanager, design-review ego defence, not pitching the idea, refreshing for likes, heated email slept on, blunt reviewer vs yes-person, peer envy on promotion, office politics seen too early). Jargon kept EN per principle (one-on-one, Slack, code review, design review, feedback, dopamine, confirmation bias, reorg, roadmap, ship, feed, pitch). VI uses "cái tôi (ego)".
- EN+VI structural parity verified (balanced tags, 6 h2, 3 svg, 1 table, 2 callouts, 5 faqs each). Registered FIRST in perspectives both base + vi _index.json (+18 lines each). `npm run build` exit 0, route + OG for all 6 locales, listed on category page.
- Tracking now genuinely active on blog pages (BlogReadingTracker mounted in Post 10's fix) + view/share/reactions automatic. COMMITTED to dev (f11377266).

---
## Post 12 — Half Light, Half Shadow / Tâm Bất Mê, Khí Bất Loạn (perspectives) — DONE (build green, COMMITTED)
- Slug: `half-light-half-shadow`, category `perspectives`, featured, 2026-06-08, 13 min. EN + VI.
- Source: VI Buddhist-flavoured prose (#chanhphap #tinhthuc #phatphap) on "người có tâm bất mê – khí bất loạn": quiet/measured people who observe everything, carry nửa chánh nửa tà (half light/half shadow) without leaning to either, wordless authority (uy lực vô ngôn), khí. Author kept `Nguyen Le Phong`.
- KEY EDITORIAL: framed "tà/shadow" healthily as Jungian **shadow integration** (steel/boundaries/saying no — NOT malice); explicit callout "'half shadow' is not 'be a little evil'". Bridges Eastern (chánh/tà/tỉnh, tâm bất mê–khí bất loạn–hành bất lệch, kept in original) with Jung's "shadow". Per user's professional/all-audience principle.
- Sections: 1 the-gentle-ones-who-watch · 2 light-and-shadow-together (Jung bridge) · 3 wordless-authority · 4 why-both-halves (extremes: all-light=naive/walked-over, all-shadow=chaotic/alone) · 5 the-hardest-state (tỉnh/lucidity as 3rd anchor) · 6 how-to-cultivate.
- 2 SVG diagrams (dgm-*): presence radial (still centre → 4 effects on others, influence outward) + three-pillars (Light/Lucidity/Shadow holding a beam "tâm bất mê·khí bất loạn·hành bất lệch"). 1 table (4 dims × all-light/lucid/all-shadow). 2 callouts (note + warn). blog-takeaways (5). 5 SEO FAQs woven w/ user keywords (tâm bất mê, khí bất loạn, chừng mực, điều khiển tâm trí, chính & tà, khí chất, không nghiêng về cực).
- Office/life examples (quiet senior whose few words land, all-nice colleague overloaded/walked-over, ruthless operator isolated, gravitas/presence, calm boundary once). Jargon kept EN (shadow/Jung, boundaries, senior, one-on-one, gravitas, watt). VI uses "cái tôi", keeps "shadow"/"khí".
- EN+VI parity verified (balanced, 6 h2, 2 svg, 1 table, 2 callouts, 5 faqs). Registered FIRST in perspectives both indexes (+18 each). `npm run build` exit 0, route+OG all 6 locales, listed on category page.
- COMMITTED to dev (74c6119e3).

---
## Post 13 — The Master Who Plays the Fool / Cao Thủ Giả Hồ Đồ (perspectives) — DONE (build green, COMMITTED)
- Slug: `the-master-who-plays-the-fool`, category `perspectives`, featured, 2026-06-08, 12 min. EN + VI.
- Source: VI prose (#tinhthuc #tritue #phatphapvadoisong) "cao thủ giả hồ đồ" — most "dangerous" person hides their intelligence; half a beat behind by choice; sharp-when-needed/silent-when-not; controls self not others; power needs no proof/recognition/system; can comply or leave; adjusts the board with small moves; no one knows their ceiling. Author kept `Nguyen Le Phong`.
- DISTINCTION from Post 12 (half-light-half-shadow): deliberately steered to a different thesis to avoid overlap — strategic understatement (大智若愚) + optionality/leverage (the freedom to walk away = unbindable) + timing + unknown ceiling. NOT the moral light/shadow integration. Different diagrams entirely.
- EDITORIAL guards: reframed source's "nguy hiểm/dangerous" → "formidable / don't underestimate" (callout); kept the source's own ethic foregrounded (controls self, not others — not manipulation); warn-callout "don't confuse with hiding your work" (still do excellent visible work to get promoted). Per professional/all-audience principle.
- Bridges: 大智若愚 (đại trí nhược ngu, kept w/ translation, like old-man kept Tái ông thất mã), negotiation leverage/optionality (BATNA-style, term avoided, explained plainly), chess "adjust the board".
- 3 SVG diagrams (dgm-*): half-beat single-timeline (crowd reacts on beat 1 vs master moves ½ beat later), leverage/exit (held-by-strings vs can-walk-away door), unknown-ceiling gauge (shown≈ceiling vs shown≪ceiling "?"). 1 table (2-col unseasoned vs seasoned × 4 dims). 3 callouts (note + tip + warn). blog-takeaways (6). 5 SEO FAQs woven w/ keywords (người khó nắm bắt, kiểm soát bản thân, quyền lực không cần chứng minh, thay đổi nhỏ, bí mật cao thủ, sắc bén quyết định).
- Office/life examples (let others underestimate then one decisive contribution, employee w/ another option negotiates calm, reshape a decision with one timed question, strategic incompetence reframed, no one boxes their ceiling). Jargon kept EN (leverage, optionality, promote, senior, one-on-one).
- EN+VI parity verified (balanced, 6 h2, 3 svg, 1 table, 3 callouts, 5 faqs). Registered FIRST both indexes (+18 each). `npm run build` exit 0, route+OG all 6 locales, listed on category page.
- COMMITTED to dev (067df0626).

---
## Post 14 — The Approval Race / Cuộc Đua Tìm Công Nhận (perspectives) — DONE (build green, COMMITTED)
- Slug: `the-approval-race`, category `perspectives`, featured, 2026-06-08, 11 min. EN + VI.
- Source: VI self-development prose — exhaustion from people-pleasing; chasing recognition = race with no finish line; 5 daily practices (15-min self-reflection, work for value not recognition, stop comparing, small daily discipline, prune relationships); "focus on yourself isn't selfish"; ask "am I living by my values?" not "what do others think?". Author kept `Nguyen Le Phong`.
- DUPLICATE CHECK (per user ask): searched all posts for approval/validation/people-pleasing/comparison/self-worth. Closest kin = `solitude-of-great-minds` (worth-within section) and `the-master-who-plays-the-fool` (needs no recognition) — but both are ARCHETYPE essays; this is a PRACTICAL prescriptive guide (people-pleasing burnout + 5 actionable habits). Not a duplicate → wrote NEW, deliberately angled to add the actionable/wellbeing layer the kin posts lack. No internal cross-links added (corpus uses none).
- Faithfully kept all 5 source practices; added framing (oxygen-mask "not selfish", "would I do this if no one saw it?" test, you-vs-yesterday scoreboard, two-compass question).
- 3 SVG diagrams (dgm-*): approval loop (4-node cycle, "no finish line" centre) + run-your-own-race chart (jagged others vs steady you-curve) + two compasses (chaotic needles vs steady true-north). 1 recap table (5 practices × looks-like × gives-back). 2 callouts (note + tip). blog-takeaways (5). 5 SEO FAQs woven w/ keywords (sự công nhận, so sánh, thanh lọc mối quan hệ, sống đúng giá trị, kỷ luật nhỏ).
- Office/life examples (yes-to-everything burnout, Slack/feed validation, LinkedIn highlight-reel comparison, phone-off 15 min, kept tiny habit, draining vs energizing colleagues). Jargon kept EN (feed, highlight reel, burnout, LinkedIn, Slack, update).
- EN+VI parity verified (balanced, 6 h2, 3 svg, 1 table, 2 callouts, 5 faqs). Registered FIRST both indexes (+18 each). `npm run build` exit 0, route+OG all 6 locales, listed on category page.
- COMMITTED to dev (be3d1edd5).

---
## Post 15 — Things No One Teaches You / Những Điều Không Ai Dạy Bạn (perspectives) — DONE (build green, COMMITTED)
- Slug: `things-no-one-teaches-you`, category `perspectives`, featured, 2026-06-08, 14 min. EN + VI.
- Source: VI 27-point "hard life lessons life teaches by hurting you" listicle. Author kept `Nguyen Le Phong`.
- DUPLICATE/SUPPLEMENT ANALYSIS (per user ask "bổ sung hay viết mới"): mapped all 27 points vs corpus. Several already deeply covered — #4/#6 envy→how-people-actually-work; #25/#27 please-everyone/be-your-version→the-approval-race; #10/#26/#5/#17 observe-first/silence/discretion→the-master + half-light; #9 marriage→questions-before-marriage. But MAJORITY is fresh and the 27-set is its own cohesive genre. Grafting into focused essays would bloat them → wrote NEW, but deliberately kept already-covered points LIGHT (a nod, not re-explain) and leaned into fresh material. Enriches corpus w/o duplicating.
- All 27 woven into 6 themed sections (NOT a 27-bullet listicle): §1 patterns-not-snapshots (1,2,11) · §2 closest-cut-deepest + leaning (8,20,3,19,21) · §3 hold-a-little-back / discretion (5,6,17,18,24,26) · §4 good-intentions-good-timing (7,22,14,15) · §5 how-you-carry-yourself (10,12,13,16) · §6 living-well-your-own-version (4,23,25,27,9).
- EDITORIAL guard: source is slightly cynical/harsh; reframed each as clarity+self-respect NOT paranoia ("clear eyes, soft heart"); softened harsh ones (#11 value, #13 appearance, #17/#18 privacy) constructively. Strong anti-cynicism callout + intro/outro framing. Per professional/all-audience principle.
- 3 NEW diagram types (dgm-*, distinct from earlier essays): snapshot-vs-filmstrip (judge patterns not one frame) + lopsided advice scale (tilted balance: right=barely remembered, wrong=blamed first) + over-explaining inverse line (explain↑ → seem-strong↓). 1 discretion table (what you think you're doing / what some do with it). 2 callouts (note anti-cynicism + tip observe-first). blog-takeaways (6). 5 SEO FAQs (incl. "which of the 27 to start with").
- Office/life examples (new team observe-first, reputation, group chat recon, friend+money, draining relationships). Jargon kept EN (group chat, team, reputation, reconnaissance).
- EN+VI parity verified (balanced, 6 h2, 3 svg, 1 table, 2 callouts, 5 faqs). Registered FIRST both indexes (+18 each). `npm run build` exit 0, route+OG all 6 locales, listed on category page.
- COMMITTED to dev (52c31a551).

## NOTE — duplicate source caught (no post written)
- User re-pasted the SAME "số mệnh / lựa chọn hay số phận" source from the start of session (minus candle ad). Confirmed `choice-or-fate` (Post 10) covers 100% of beats (8/8 checks). Flagged via AskUserQuestion instead of writing a duplicate (would split SEO). User then supplied a different source (rest/burnout) → Post 16.

---
## Post 16 — You Are Not a Machine / Bạn Không Phải Cỗ Máy (perspectives) — DONE (build green, COMMITTED)
- Slug: `you-are-not-a-machine`, category `perspectives`, featured, 2026-06-08, 11 min. EN + VI.
- Source: VI prose on the guilt of resting — work→tired, rest→guilty; busyness as worth; nature needs fallow seasons; real rest ≠ lying around/escape; society gives no white space (adults→work, kids→extra classes, over-scheduled childhood); brain research (strain hurts focus/creativity/memory); humans aren't machines; the pause lets you breathe. Author kept `Nguyen Le Phong`.
- DUPLICATE CHECK (per user habit): grepped rest/burnout/busy/hustle/recovery/work-life — only incidental hits ("the rest of…", side mentions). No dedicated rest/anti-hustle essay. NEW.
- ADDED VALUE beyond source: distinguished real rest from doomscrolling (scrolling ≠ rest — stimulation not recovery); the "rested curve compounds, strained curve burns down" framing; practices section.
- Sections: 1 guilt-of-resting · 2 nothing-in-nature (fallow) · 3 what-real-rest-is (not laziness/not scrolling) · 4 no-white-space (adults+kids) · 5 the-science (strain vs recovery) · 6 you-are-not-a-machine + practices.
- 3 NEW diagram types (dgm-*): fallow-season linear arc (effort→rest→renewal) + white-space schedule bars (packed→depletion vs spacious→sustainable) + strain-vs-rest curves (constant strain crashes; work+rest sawtooth trends higher). 1 table (rest mistaken-for / actually-is). 1 callout (note: guilt is learned). blog-takeaways (6). 5 SEO FAQs (laziness? scrolling? no-time? guilt? kids?).
- Office/life examples (PTO guilt, always-on Slack, packed calendar = virtue, shower-thought creativity, over-scheduled kids). Jargon kept EN (burnout, PTO, deep work, dopamine, doomscrolling, always-on).
- EN+VI parity verified (balanced, 6 h2, 3 svg, 1 table, 1 callout, 5 faqs). Registered FIRST both indexes (+18 each). `npm run build` exit 0, route+OG all 6 locales, listed on category page.
- COMMITTED to dev (8fe1a3b62).

## NOTE — 2nd duplicate caught (rest source re-pasted)
- User re-pasted the SAME rest/burnout source (identical to Post 16). Flagged instead of writing a twin; offered enrich/skip/new. (Then moved on.)

---
## Post 17 — Your Salary Is Seed Capital / Tiền Lương Là Vốn Mồi (perspectives) — DONE (build green, COMMITTED 4c03d699c)
- Slug: `salary-is-seed-capital`, perspectives, featured, 2026-06-08, 11 min. EN + VI.
- Source: VI personal-finance prose (use salary to feed business → feed freedom; salary as seed capital; lifestyle creep = prettier cage; salary→assets→cashflow→freedom; freedom = right to choose not laziness). Author `Nguyen Le Phong`.
- DUP CHECK: financial-freedom/wealth/passive-income/side-hustle = 0 hits; money/invest only incidental. NEW theme (1st personal-finance essay).
- ADDED VALUE: "image (liability) vs freedom (asset)" reframe table; explicit honesty disclaimer (mindset not financial advice); balance nod to you-are-not-a-machine (don't burn down building it).
- Sections: lifeline-or-seed · the-chain (salary→assets→cashflow→freedom) · prettier-cage (lifestyle creep) · salary-as-fuel (allocation) · start-small · what-freedom-buys.
- 3 SVG diagrams: value chain · two stacked bars (creep vs discipline) · paycheck allocation segments. 1 table (image/liability vs freedom/asset). 2 callouts. takeaways(6). 5 FAQs (hustle? broke? quit? contradicts rest? today?). Jargon EN (cash flow, assets, side hustle, personal brand, lifestyle creep, compound). Build exit 0, 6 locales.

---
## Post 18 — Forgiveness Is for You / Tha Thứ Là Để Cho Chính Mình (perspectives) — DONE (build green, COMMITTED de1ab116f)
- Slug: `forgiveness-is-for-you`, perspectives, featured, 2026-06-09, 11 min. EN + VI.
- Source: VI "two truths that wake you up" prose (change only yourself; forgive to free yourself; predestined/everyone-teaches-you; define-yourself/flower-butterfly; enjoy-the-journey).
- DUP ANALYSIS: most pillars already covered — change-yourself→quiet-art-of-letting-go §2 + choice-or-fate; predestined/teacher→choice-or-fate + old-man; define-yourself/don't-care→the-approval-race; enjoy-journey→meaning-is-in-the-living. ONLY fresh pillar = FORGIVENESS (3 incidental 'forgiv' hits, no dedicated essay). → wrote NEW centered tightly on forgiveness-as-self-liberation; used change-yourself + teacher-reframe only as scaffolding (light), did NOT re-tread covered essays.
- SAFETY: serious-harm handled carefully (forgiveness = forgiver's freedom, never owed, never excusing, never reconciliation; "teacher" reframe explicitly optional + not-for-others-in-pain; dropped source's harmful "you only get what you can bear" claim).
- 5 h2 + 3 SVG (grudge-chain binds one end · wound→reframe→strength · two-grips hold-on/let-go) + 1 table (is NOT / IS) + 2 callouts (boundaries + serious-harm) + takeaways(5) + 5 FAQs. Jargon EN (boundaries, rent-free, reconciliation, closure).

## Post 19 — Four Things When Dealing With People You Don't Like / 4 Điều Khắc Cốt Ghi Tâm Khi Đối Đãi Với Người Không Thích (perspectives) — DONE (build green, COMMITTED 2c23831f4)
- Slug: `dealing-with-people-you-dislike`, perspectives, featured, 2026-06-10, 11 min. EN + VI.
- Source: VI "4 điều khắc cốt ghi tâm khi đối đãi với người không thích" (tam quan không hợp đừng phí lời / chim ưng–gà; càng ưu tú càng đố kỵ = huân chương; ĐIỀU 3 quan trọng nhất = đừng so đo tiểu nhân, coi như không khí / chó sủa–ném đá; nhìn thấu không nói thấu, hiểu người không vạch trần / giả khờ = minh triết; thế giới không đổi, tâm thế ta đổi).
- DUP CHECK: theme is interpersonal boundaries/petty-people — adjacent to the-approval-race (don't need approval) & the-master (giả khờ/concealment) but DISTINCT angle (how to *treat* people you dislike, 4 concrete rules). Kept §4 "see-through/play-fool" light to avoid re-treading the-master's concealment essay; focus is the 4-rule stance + energy-budget.
- Sections (5 h2): dont-waste-words (eagle/hen altitude) · envy-is-a-medal (mirror→shadow→envy reframe) · treat-them-like-air (barking-dog road, MOST IMPORTANT) · see-through-dont-say-through (outside-smile/inside-mirror) · what-actually-changes (immature vs mature table).
- 4 SVG (altitude dashed-gap · shine→reflect→envy flow · two-roads stop-vs-walk · outside/inside two-panel) + 1 table (less-aware vs mature, 5 rows) + 2 callouts (tip: energy math · note: play-fool≠weak) + takeaways(5) + 5 FAQs (altitude=contempt? air=avoidance? not-call-out=let-them-win? envy vs real-criticism? today?). Workplace examples throughout (standup, hallway gossip, credit-grab, snide email). Jargon EN kept. Engagement (read-time PostHog `track`, view count, share dock) auto via template — no code needed.
- NEXT: build verify + commit.

---
## PENDING DECISION — "kẻ mạnh thu mình" source (queued msg)
- Content: show-offs are shallow; the strong hide/retreat to leap, sharpen weapon in the dark, predator-crouch, emerge when game decided / you can't catch up. → ~85-90% the-master-who-plays-the-fool (esp. after đại tài bất lộ enrichment: reserve, win-last, predator coiled-spring). CAN supplement the-master; a new post = 3rd concealment near-duplicate. Only fresh beat = "crowd misreads strategic retreat as cowardice/failure → build in obscurity → unstoppable comeback" (underdog framing). User chose option 2 (small enrich). DONE: folded 1 paragraph into the-master §1 (EN+VI), build green, COMMITTED a6be0cb39. No new post (avoided 3rd concealment duplicate).

---
## ENRICHMENT — the-master-who-plays-the-fool (Post 13) — DONE (build green, COMMITTED d3b17dc8c)
- User gave Quỷ Cốc Tử "đại tài bất lộ" source → ~85% overlap with Post 13 (大智若愚/hide edge/decisive-late/unknown ceiling). Per user's standing "same same → bổ sung" rule, ENRICHED Post 13 instead of duplicating (would split SEO).
- Added NEW §6 "The unmeasured is what people fear — đại tài bất lộ" (EN) / "Thứ không đo được mới khiến người ta dè chừng" (VI), inserted after §5 adjust-the-board; renumbered how-to-grow §6→§7.
- Fresh ideas added (not in original): Quỷ Cốc Tử / đại tài bất lộ credit; measurable=manageable / immeasurable=feared principle; sword-out-of-sheath/jade-priced imagery; "win last, not first / strike when swords are down". New SVG diagram (unflipped card / arrow on string / unused retreat triptych). +1 takeaway, +1 FAQ ("win last = passive?"). readingMinutes 12→13 (post + both index entries). EN+VI parity, build exit 0.

---
## Batch 2026-06-11 — 4-piece source split (2 new posts + 2 enrichments) — DONE (build green, NOT committed)
User pasted 4 VI pieces; asked to merge-or-split. Verdict (user-confirmed via AskUserQuestion): **3-post grouping**, but pieces 2+3 handled as **enrich existing** (not a new near-duplicate). Net = 2 NEW posts + 2 enrichments.

### Post 20 (NEW) — Seven Quiet Laws of Doing Great Things / Bảy Nguyên Tắc Thầm Lặng Để Làm Nên Việc Lớn
- Slug `seven-laws-of-doing-great-things`, perspectives, featured, 2026-06-11, 13 min. EN+VI.
- Source = piece 1 (8-point #truongthanh #tuduythanhcong: quiet wisdom, keep plans secret, win hearts ân+uy, money as tool, all-in decisive, accumulate strength, legacy, intensity>length).
- Fresh ambition/leadership angle (no prior ambition/legacy/all-in essay). Kept overlapping beats (quiet wisdom, secrecy) LIGHT vs solitude/the-master.
- 7 h2 (dont-mistake-noise-for-strength, keep-the-plan-close, its-always-about-people, money-is-fuel-not-a-trophy, when-you-move-commit, build-the-strength-the-rest-comes, live-with-intensity-leave-a-mark). 3 SVG (noise-vs-depth 2-box, commit-vs-hesitate timeline, strength→opportunity curve+threshold). 1 table (ân/grace vs uy/authority: what/wins/failure-alone). 2 callouts (note: win-hearts≠manipulation; tip: commit≠reckless). takeaways(7). 5 FAQs.
- EDITORIAL guards: reframed ân+uy as genuine generosity + earned respect (NOT fear/manipulation); money "to move people"=invest generously not bribe; all-in=committed-after-thinking not rash; "great things"=whatever is large to YOU disclaimer. Professional/all-audience.

### Post 21 (NEW) — Fifteen Quiet Rules for Moving Through the World / Mười Lăm Quy Tắc Ngầm Để Đi Qua Cuộc Đời
- Slug `quiet-rules-for-moving-through-the-world`, perspectives, featured, 2026-06-11, 13 min. EN+VI.
- Source = piece 4 (15 street-smart rules #tinhthuc #tritue). Same genre as things-no-one-teaches-you but distinct etiquette angle; kept ~3 covered beats (trump-cards, giả khờ, colleagues≠friends, in-laws) LIGHT.
- 6 h2 (let-money-and-effort-show [1,4,12], keep-your-movements-quiet [3,5,6], hold-a-few-cards-back [7,1b], lower-yourself-when-you-ask [2,13], lead-by-example-choose-your-circle [10,11,9], soft-heart-clear-method [14,15]). Rule 8 (rice-bowls) = folk-wisdom note callout (honest re: superstition). 3 SVG (relationship filter, share-joy-vs-heard-as-showing-off 2-panel, soft-core/firm-ring concentric). 0 tables. 3 callouts (note clear-eyes-soft-heart, note folk-rules, tip firm-method≠ruthless). takeaways(6). 5 FAQs.
- EDITORIAL: anti-cynicism "clear eyes, soft heart" framing; giả heo ăn thịt hổ + thủ đoạn sấm sét reframed as boundaries/strategic restraint not malice; 1b badmouth-boss framed as self-protection. Professional/all-audience.

### Enrichment — solitude-of-great-minds (Post 2) with piece 2 ("không còn khao khát được thấu hiểu")
- Piece 2 (~90% solitude territory) folded in, NOT a new post (avoids SEO cannibalization). Added §"They stopped needing to be understood / Họ thôi cần được thấu hiểu" (id `no-longer-need-to-be-understood`) before through-the-dark; fresh beat = stopped-depending-on-being-understood + fewer-know=fewer-can-label=freedom/safety. +1 takeaway, +1 FAQ. readingMinutes 13→14 (post+both indexes). EN+VI parity (9 h2, 6 faqs each).

### Enrichment — the-approval-race (Post 14) with piece 3 ("buông bỏ 3 thứ")
- Piece 3 folded in. Added §"6. Let go of three quiet weights / Buông bỏ ba sức nặng lặng thầm" (id `let-go-of-three-weights`) before conclusion; renumbered conclusion 6→7. Fresh beats = the 3 lettings-go (loved-by-all, fear-of-saying-no, softness-without-clear-head) + warm-heart/clear-head — the saying-no/boundaries angle the post lacked. +1 takeaway, +1 FAQ. readingMinutes 11→12 (post+both indexes). EN+VI parity (7 h2, 6 faqs each).

### Build / commit
- Generators: /tmp/gen_post_a.py, /tmp/gen_post_c.py, /tmp/gen_enrich.py (idempotent; remove-then-insert at front of perspectives in base+vi _index.json for new posts).
- `bun run build` exit 0; out/{en,vi}/blog/perspectives/{seven-laws...,quiet-rules...}.html generated; enriched anchors verified present in built EN+VI HTML for both solitude + approval-race.
- Tracking/views/share auto via template (BlogReadingTracker mounted on blog pages since Post 10). fr/ja/ko/zh fall back to EN. NOT committed (user hasn't asked).
