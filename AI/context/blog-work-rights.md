# Session: Blog — Quyền lợi khi đi làm (Chia sẻ / perspectives)

## Objective
Add a detailed flagship blog post on employee rights at work (quitting → switching → onboarding; BHXH/BHYT/BHTN, PIT, contracts, handover, unemployment) in the "Chia sẻ" category (= `perspectives`). EN + VI, SEO-friendly, with existing view/share/reading-time tracking (automatic per-post).

## Current State — DONE
- Slug: `know-your-work-rights`, category `perspectives`, featured, date 2026-06-02, ~22 min.
- EN content: public/blog-data/posts/know-your-work-rights.json
- VI content: public/blog-data/vi/posts/know-your-work-rights.json
- Registered EN canonical index: public/blog-data/_index.json
- Registered VI override: public/blog-data/vi/_index.json
- All 4 JSON validated. Internal cross-links to /notes/{quy-khan-cap-tu-a-den-z, thinh-vuong-tai-chinh-de-tien-lam-viec-cho-ban, lam-chu-su-nghiep-bien-cong-viec-thanh-be-phong} verified to exist.

## Key facts
- Tracking (views/shares/reading time via PostHog + BlogReadingTracker) is automatic for any post — no code needed.
- Pattern: new posts live in EN (posts/) + VI (vi/posts/) only; fr/ja/ko/zh fall back to EN. Canonical index = EN _index.json (required for route via listCategoryPostPairs).
- Reused HTML classes: blog-callout--note/tip/warn + __label, blog-table-wrap>table, blog-takeaways, h2 id anchors, faqs[].

## Next Steps (optional)
- Possible Part 2 deep-dives (each its own post if desired): "Cách tính BHXH một lần & lương hưu chi tiết"; "Quyết toán & hoàn thuế TNCN từng bước"; "Đọc hợp đồng lao động: non-compete, NDA, cam kết đào tạo".
- If created, link them from this pillar via /blog/perspectives/<slug>.
- Commit/push when user asks.

---
## Post 2 — Wedding prep for grooms (added same session)
- Slug: `wedding-prep-for-grooms`, category `perspectives`, featured, 2026-06-02, ~23 min.
- EN: public/blog-data/posts/wedding-prep-for-grooms.json
- VI: public/blog-data/vi/posts/wedding-prep-for-grooms.json
- Registered in both _index.json (EN canonical + VI override), placed first in perspectives.
- Content: full journey (tìm hiểu → ra mắt → dạm ngõ → ăn hỏi → cưới → sau cưới/trăng mật), faithful reference budget table (user-provided figures, ~700M total w/ overlap caveat), nhà trai vs nhà gái split, groom's thoughtful tips, save tips. Cross-links to /notes finance posts.
- All 4 JSON validated; cross-linked notes verified to exist.

---
## Post 3 — Questions before marriage (added same session)
- Slug: `questions-before-marriage`, category `perspectives`, featured, 2026-06-02, ~19 min.
- EN: public/blog-data/posts/questions-before-marriage.json ; VI: public/blog-data/vi/posts/questions-before-marriage.json
- Registered in both _index.json (placed first in perspectives).
- Source material: chị Nhàn's 24-item premarital alignment list (from user image) + her 3 reflections (no drama / written commitments / don't rush unagreed items). All 24 items transcribed faithfully, grouped into 7 themes. Tone: warm, gender-neutral, "co-design not interrogation".
- Cross-links: /blog/perspectives/wedding-prep-for-grooms + /notes/tien-bac-trong-gia-dinh (verified).

## Uncommitted: 3 new perspectives ("Chia sẻ") posts (EN+VI), forming a life-journey mini-arc:
  questions-before-marriage → wedding-prep-for-grooms → know-your-work-rights

---
## Post 4 — How AI changes software roles (AI category)
- Slug: `how-ai-changes-software-roles`, category `ai`, featured, 2026-06-02, ~21 min. EN + VI.
- Role-by-role (BA, PO, PM, Designer, Dev, QA, +DevOps/Data/EM): what fades / what rises / watch-outs. Meta-shift = produce→specify+orchestrate+verify. Sections: lost / added / AI-assisted vs AI-first / watchlist / how to adapt. Cross-links to /blog/ai/context-engineering + /blog/culture/how-to-review-code-kindly.
- Registered first in `ai` category (both indexes). Validated, anchors clean.

---
## Post 5 + NEW CATEGORY — Agile & Scrum in practice
- NEW category `agile` ("Agile & Delivery" / "Agile & Quy trình"), accent `light` (was the only unused accent; fully supported in BlogAccent type, blog.css, and OG THEMES), order 5. Added to both _index.json.
- Slug: `agile-scrum-in-practice`, featured, 2026-06-02, ~20 min. EN + VI.
- Covers: epic/story/task/sub-task hierarchy, user story+INVEST+acceptance criteria+DoR/DoD, status workflow+WIP, story points & estimation (+anti-patterns), log work honestly, ceremonies (planning/daily/refinement/review/retro), charts (burndown/burnup/velocity/CFD), 3 Scrum roles + where BA/QA fit, healthy vs harmful customizations, Scrum/Kanban/Scrumban. For any role.
- Validated; route /blog/agile/agile-scrum-in-practice generated via base index.

---
## Post 6 — Driven-development family (agile category)
- Slug: `tdd-bdd-ddd-driven-development`, category `agile`, featured, 2026-06-02, ~22 min. EN + VI.
- Engineer audience. Covers TDD (Red-Green-Refactor), BDD/ATDD (Gherkin), DDD (strategic+tactical, Order aggregate), EDD (event-driven), CDD (component + contract), FDD, + Type/Model/Eval-Driven. "X-Driven = what you let lead"; different axes → compose not compete; composition map table; choosing/anti-dogma.
- 5 code blocks per lang using <pre><code> + cmt/kw/str spans (the only supported syntax classes). Cross-links: /blog/architecture/clean-vs-onion-vs-hexagonal + /blog/ai/how-ai-changes-software-roles.
- Registered first in agile category (both indexes). Validated.

---
## Post 7 — SWE career path (perspectives / Chia sẻ)
- Slug: `software-engineer-career-path`, category `perspectives`, featured, 2026-06-02, ~19 min. EN + VI.
- Built from user's career-ladder image. Drew an inline dgm-svg diagram (Engineer I/II/III trunk → forks Technical track Staff/SrStaff/Principal + Managerial track EM/Director/VP → CTO). 10 boxes, dgm-core/driven/adapter classes, dgm-flow/line connectors + clUp arrow marker.
- Content: lattice-not-ladder, mgmt≠promotion, rungs reward scope not years (table), why the map is an advantage, how to find your direction, growth cadence daily/monthly/quarterly/yearly (table — user emphasized), traps to avoid. Cross-links: /blog/ai/how-ai-changes-software-roles + /notes/lam-chu-su-nghiep-bien-cong-viec-thanh-be-phong.
- Registered first in perspectives (both indexes). Validated; SVG + anchors clean.
