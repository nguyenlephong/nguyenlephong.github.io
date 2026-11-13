# Positioning and evidence rules

Distilled from `AI/research/cv-positioning-market-2026-11-12.md` (47 cited sources, accessed 2026-11-12). Re-check the market section yearly; the evergreen rules below should not need to change.

### 3.3 Hype vs credible on a senior CV

| Reads as hype | Reads as credible |
|---|---|
| "AI-native engineer", "10x with AI", "AI-powered everything" | "AI suggests, a person confirms; X% of suggestions accepted" |
| Tool list: Cursor, Claude Code, LangChain as headline skills (Cursor mentions on CVs +643% in a year [2], so it no longer differentiates) | Mechanism: guardrails, least-privilege roles, eval set, rollback path |
| "Built AI agents" with no outcome | "Agent flags quota risk before deploy; caught N issues; review time from A to B" |
| Demo that never shipped (named as top red flag by practitioners [38], Low) | Shipped to a named workflow with a human in the loop |
| Productivity claim without baseline | Before/after with how it was measured |

Phong's existing AI evidence (from repo): NDSVN AI agents for code review, deployment assistant, service-quota validation, API health monitoring, release analysis; LogiUP AI-assisted customs workflow with **human-confirmed AI suggestions**, 6 least-privilege runtime roles, rule-based document classification for export declarations. The LogiUP framing is already the credible kind. The NDSVN bullet lacks outcomes.

Evergreen rule for AI copy: describe **the problem, the guardrail, and the measured result**. Put tool names only in a dated "currently using" line, never in the headline.

---

## 4. Evergreen values and how strong candidates prove them

Adjectives ("passionate", "results-driven", "dedicated") are noise; hiring managers flag vague, generic descriptions (42%) [31]. The pattern that survives every market: **claim, mechanism, number, date, link**.

| Value | Source of the standard | Phrase with proof (template) | Phong's proof already on site |
|---|---|---|---|
| Reliability at scale | SRE: "Hope is not a strategy"; error budgets balance reliability and speed [39] | "Made X recoverable: [mechanism]; [metric before → after] at [scale], [date]" | Sync v2 retry + grouped re-prepare; 1.8 s → 4 ms; kill switches default off |
| Ownership | Dropbox ladder strengthened ownership of code, process, ops [18a]; MoMo JD "takes responsibility for what they build" [35] | "Owned [system] from design to on-call; [incident/rollback outcome]" | NDSVN inherited infra (ArgoCD, AKS/EKS/K3S) made "diagnosable, recoverable" |
| Judgment under trade-offs | Larson archetypes: authority earned "by demonstrating consistently good judgment" [10] | "Chose A over B because C; result D" | Not stated anywhere. Biggest missing evergreen signal |
| Leveling others | Reilly pillar 3 [12]; packet: what mentees achieved [11] | "Hired/coached N; M promoted or took ownership of X" | Playbook, competency matrix, interview loops (no outcome numbers) |
| Operating across environments | VN employers want adaptable seniors who own outcomes [2][5] | One line: outsourcing → startup → CDP scale-up → big consumer app → post-CTO handover → founder | Career already spans Splus (outsourcing), Propman (startup), PrimeData, Zalo, NDSVN, BonBon. Not yet told as one arc |
| Glue work made visible | Reilly "Being Glue" [40]; Dropbox now credits glue work [18a] | "Wrote down [ownership/release rules]; lead time on decisions from A to B" | NDSVN restructure after CTO transition |
| Maturity / boomerang | 35% of hires are boomerangs [33] | "Returned to Zalo PC as Lead" (rehire = trust signal) | Already in Zalo summary; not surfaced above the fold |

---

### 5.1 How the first pass works

- Initial screen ~7.4 s (Ladders 2018 eye-tracking, method criticised but directionally accepted). F/E-pattern; bold titles, clear headings and bullets win; multi-column, dense text and missing job headers lose [26].
- VN recruiters read the **1-2 most recent roles** against the JD, Ctrl+F JD keywords, read the **3-5 sentence summary in the top third**, then check tenure, growth and gaps [29]. Avoid tables/columns in the PDF CV for ATS parsing [29]. PDF, reverse-chronological, 1-2 pages ("one page per 10 years"), LinkedIn link, no references [41].
- ATS is mostly a searchable database; auto-rejection happens through knockout questions, not content parsing. The "75% auto-rejected" claim has no credible source [28]. So keywords matter for **being found**, not for passing a robot.
- Resume purpose is to get the recruiter call (Orosz); lead with what you achieved, numbers stand out because most resumes have none, tech goes at the end of each item, tailor from a master version [42][43].
- XYZ: "Accomplished X as measured by Y by doing Z" (Bock) [44].
- LinkedIn: keep target title consistent across headline, About and current position; list skills tied to the role where used; recruiter-only "Open to Work" roughly doubles recruiter messages per LinkedIn's guide [45]. Site, PDF and LinkedIn must say the same titles and dates.

### 5.2 Red flags (2026 survey, 1,500 US hiring managers) [31]

1. Job-hopping 65%
2. Heavily AI-generated application materials 49%
3. Long or unexplained gaps 43%
4. Vague/generic responsibilities 42%
Also: 58% of hiring managers use AI to screen resumes themselves [31]. Practitioners flag suspiciously round numbers and metrics the candidate cannot walk through [38] (Low). Greenhouse: 74% of hiring managers more worried about misrepresented experience than a year ago [46].

### 5.4 Vietnam-specific conventions

- English CV is the default for product companies, foreign firms and remote; a VI version helps for local recruiters and HR-led screening [41][47]. **Medium.**
- DOB and photo: VN guides list DOB as standard but optional when no age limit [47]; for international applications drop photo, DOB, marital status. **Medium.**
- Name order: First Name - Last Name for foreign companies [47].
- English level signal: since no recent premium data exists, the strongest evidence is **artifact-based**: English blog posts, design notes, talks, or a test score if he has one. His site is already EN-first with 6 locales, which helps.
- Title vocabulary VN recruiters search: Tech Lead, Team Lead, Engineering Manager, Solution Architect, Software Architect, Head of Engineering, Principal Engineer.

---

## 6. Positioning recommendation for Phong

### 6.1 One-line positioning candidates

EN (pick one for hero, one for LinkedIn headline):
1. "Lead engineer for systems where failure is expensive: consumer messaging at Zalo, payment and partner integrations, multi-tenant SaaS, and a startup I co-founded."
2. "Hands-on engineering lead. I ship risky changes in small, reversible steps at consumer scale, and build new products from zero."
3. "I turn ambiguous, high-stakes product problems into systems that stay up and teams that keep shipping."

VI:
1. "Lead Engineer cho những hệ thống không được phép lỗi: tin nhắn đa thiết bị ở Zalo, tích hợp đối tác và thanh toán, SaaS multi-tenant, và một startup tự đồng sáng lập."
2. "Engineering lead vẫn code mỗi ngày. Ship thay đổi rủi ro theo từng bước nhỏ, rollback được, ở quy mô hàng chục triệu người dùng."
3. "Biến bài toán sản phẩm mơ hồ thành hệ thống chạy ổn định và một đội vẫn ship đều."

LinkedIn headline (keyword-dense): `Lead Software Engineer @ Zalo (VNG) | Tech Lead & System Architect | Messaging at scale, Fintech integrations, Multi-tenant SaaS | Co-founder, BonBon Mobility`

### 6.2 Five pillars mapped to evidence

| # | Pillar | Proof on file | Target role it serves |
|---|---|---|---|
| 1 | **Reliability at consumer scale** | Zalo PC sync v2 1.8 s → 4 ms; PC backup with mobile restore launched Jul 2026 (VnExpress); zCloud offload observability; log-health probe with remote kill switch | Staff (Solver), Lead |
| 2 | **Safe, progressive delivery** | Feature-flag platform 30+ tenants, ~40k users, priority rules, % rollout; default-off kill switches at Zalo and BonBon; release playbook | Staff (Architect), EM |
| 3 | **Architecture for multi-party trust** | LogiUP tenant isolation subdomain → token, own OAuth 2.1/OIDC (RS256/JWKS, PKCE, Electron deep link); Gtel/Napas RSA-4096 + AES-256 + mTLS + idempotent contracts; VETC Mini App silent partner login, memory-only sessions | Staff (Architect), VN Solution/Software Architect |
| 4 | **Zero to pilot** | BonBon MVP → live field pilot in 3 months; $500K pre-seed led by Tasco (Tasco, 2026-09-21); PrimeData JS SDK <200 kB, <150 ms | Lead Product Engineer, startup Head of Eng |
| 5 | **Leading teams through change** | NDSVN post-CTO: 8 devs (4 senior) + 3 QC, org chart, competency matrix, interview loops, playbook; PrimeData FE team of 4; LogiUP team of 4; Zalo design system for 50+ devs | EM / Head of Eng |

AI is a **cross-cutting practice**, not a sixth pillar: one line per pillar where it applies (LogiUP human-confirmed AI suggestions; NDSVN release/quota agents). This keeps the CV from dating when "AI" stops being a label.

### 6.3 Above the fold (site hero + PDF top third)

1. Name, current title, location + time zone (Ho Chi Minh City, UTC+7), and work mode he is open to (on-site VN / remote).
2. One positioning line from 6.1.
3. Three proof points, outcome-first, each with a date and link:
   - "Zalo PC: cut a sync hot-path lookup from 1.8 s to 4 ms; shipped PC backup with mobile restore (Jul 2026, VnExpress)."
   - "Feature-flag platform for 30+ tenants (~40k users): tenant/segment/env rollout with kill switches."
   - "Co-founded BonBon Mobility: MVP to live pilot in 3 months inside VETC's app; $500K pre-seed led by Tasco."
4. Career arc in one sentence: "8+ years across outsourcing, a startup, a CDP scale-up, Zalo, a post-CTO handover, and my own startup."
5. Engagement clarity for current roles (see 5.3).
6. CTAs: PDF CV (EN, VI), LinkedIn, GitHub, email.

### 6.4 De-emphasize

- Commit counts, test-case counts, "Years shipping", "Projects launched" counters (activity, not impact).
- Pre-2020 detail (Propman, Splus project list, Best Rookie, Savyu, Mona House, Bank tool) → one compressed "Earlier" line.
- "Proactively supported 50+ client users", "dedication", "effective problem-solving" (adjectives, vague).
- Digital SAT Math and Vietnam Australia Center projects unless targeting edtech.
- Tool-name AI keywords in headline or hero.
- Uniform long bullet lists; cap each role at 4 visible bullets.

### 6.5 Keyword set (ATS / SEO / LinkedIn)

EN titles: Lead Software Engineer, Staff Software Engineer, Principal Engineer, Tech Lead, Engineering Manager, Head of Engineering, Solution Architect, Software Architect, Lead Full-stack Engineer, Product Engineer.
EN domains: real-time messaging, cross-device sync, offline-first, data backup and restore, Electron desktop, feature flags, progressive delivery, kill switch, canary rollout, multi-tenant SaaS, tenant isolation, OAuth 2.1, OpenID Connect, PKCE, mTLS, payment integration, fintech, idempotency, micro-frontends, design system, mini app, observability, PostHog, incident response, platform engineering, GitOps, Kubernetes (AKS, EKS), AI-assisted workflows, human-in-the-loop, LLM evaluation.
EN stack (current): TypeScript, React, Next.js, Node.js, NestJS, Electron, Go, PostgreSQL, Redis, Kotlin, .NET.
VI: Trưởng nhóm kỹ thuật, Tech Lead, Kỹ sư phần mềm trưởng, Quản lý kỹ thuật, Engineering Manager, Kiến trúc sư giải pháp, Kiến trúc sư phần mềm, Trưởng phòng công nghệ, đồng bộ dữ liệu đa thiết bị, sao lưu tin nhắn, ứng dụng nhắn tin quy mô lớn, nền tảng feature flag, triển khai theo từng phần, SaaS đa khách hàng (multi-tenant), tích hợp thanh toán, bảo mật mTLS, mini app, dẫn dắt đội ngũ, tuyển dụng và đào tạo kỹ sư, khởi nghiệp, đồng sáng lập.

### 6.6 Stay evergreen (rules)

- Every third-party number carries "as of" and a link (VETC 4.3M as of Tasco AGM 2026-04-20).
- Metrics are before → after with a unit; no round, unexplained multipliers.
- Describe mechanisms (kill switch, tenant isolation, human confirmation) rather than tools; keep a separate dated "Currently using" line.
- No "AI-native", "10x", "rockstar", "passionate", "results-driven".
- Titles match LinkedIn and the PDF exactly.
- Write copy in his own voice; generic polish is the #2 red flag [31]. Every bullet must be something he can explain for 5 minutes in an interview.

---

## 6. Positioning recommendation for Phong

### 6.1 One-line positioning candidates

EN (pick one for hero, one for LinkedIn headline):
1. "Lead engineer for systems where failure is expensive: consumer messaging at Zalo, payment and partner integrations, multi-tenant SaaS, and a startup I co-founded."
2. "Hands-on engineering lead. I ship risky changes in small, reversible steps at consumer scale, and build new products from zero."
3. "I turn ambiguous, high-stakes product problems into systems that stay up and teams that keep shipping."

VI:
1. "Lead Engineer cho những hệ thống không được phép lỗi: tin nhắn đa thiết bị ở Zalo, tích hợp đối tác và thanh toán, SaaS multi-tenant, và một startup tự đồng sáng lập."
2. "Engineering lead vẫn code mỗi ngày. Ship thay đổi rủi ro theo từng bước nhỏ, rollback được, ở quy mô hàng chục triệu người dùng."
3. "Biến bài toán sản phẩm mơ hồ thành hệ thống chạy ổn định và một đội vẫn ship đều."

LinkedIn headline (keyword-dense): `Lead Software Engineer @ Zalo (VNG) | Tech Lead & System Architect | Messaging at scale, Fintech integrations, Multi-tenant SaaS | Co-founder, BonBon Mobility`

### 6.2 Five pillars mapped to evidence

| # | Pillar | Proof on file | Target role it serves |
|---|---|---|---|
| 1 | **Reliability at consumer scale** | Zalo PC sync v2 1.8 s → 4 ms; PC backup with mobile restore launched Jul 2026 (VnExpress); zCloud offload observability; log-health probe with remote kill switch | Staff (Solver), Lead |
| 2 | **Safe, progressive delivery** | Feature-flag platform 30+ tenants, ~40k users, priority rules, % rollout; default-off kill switches at Zalo and BonBon; release playbook | Staff (Architect), EM |
| 3 | **Architecture for multi-party trust** | LogiUP tenant isolation subdomain → token, own OAuth 2.1/OIDC (RS256/JWKS, PKCE, Electron deep link); Gtel/Napas RSA-4096 + AES-256 + mTLS + idempotent contracts; VETC Mini App silent partner login, memory-only sessions | Staff (Architect), VN Solution/Software Architect |
| 4 | **Zero to pilot** | BonBon MVP → live field pilot in 3 months; $500K pre-seed led by Tasco (Tasco, 2026-09-21); PrimeData JS SDK <200 kB, <150 ms | Lead Product Engineer, startup Head of Eng |
| 5 | **Leading teams through change** | NDSVN post-CTO: 8 devs (4 senior) + 3 QC, org chart, competency matrix, interview loops, playbook; PrimeData FE team of 4; LogiUP team of 4; Zalo design system for 50+ devs | EM / Head of Eng |

AI is a **cross-cutting practice**, not a sixth pillar: one line per pillar where it applies (LogiUP human-confirmed AI suggestions; NDSVN release/quota agents). This keeps the CV from dating when "AI" stops being a label.

### 6.3 Above the fold (site hero + PDF top third)

1. Name, current title, location + time zone (Ho Chi Minh City, UTC+7), and work mode he is open to (on-site VN / remote).
2. One positioning line from 6.1.
3. Three proof points, outcome-first, each with a date and link:
   - "Zalo PC: cut a sync hot-path lookup from 1.8 s to 4 ms; shipped PC backup with mobile restore (Jul 2026, VnExpress)."
   - "Feature-flag platform for 30+ tenants (~40k users): tenant/segment/env rollout with kill switches."
   - "Co-founded BonBon Mobility: MVP to live pilot in 3 months inside VETC's app; $500K pre-seed led by Tasco."
4. Career arc in one sentence: "8+ years across outsourcing, a startup, a CDP scale-up, Zalo, a post-CTO handover, and my own startup."
5. Engagement clarity for current roles (see 5.3).
6. CTAs: PDF CV (EN, VI), LinkedIn, GitHub, email.

### 6.4 De-emphasize

- Commit counts, test-case counts, "Years shipping", "Projects launched" counters (activity, not impact).
- Pre-2020 detail (Propman, Splus project list, Best Rookie, Savyu, Mona House, Bank tool) → one compressed "Earlier" line.
- "Proactively supported 50+ client users", "dedication", "effective problem-solving" (adjectives, vague).
- Digital SAT Math and Vietnam Australia Center projects unless targeting edtech.
- Tool-name AI keywords in headline or hero.
- Uniform long bullet lists; cap each role at 4 visible bullets.

### 6.5 Keyword set (ATS / SEO / LinkedIn)

EN titles: Lead Software Engineer, Staff Software Engineer, Principal Engineer, Tech Lead, Engineering Manager, Head of Engineering, Solution Architect, Software Architect, Lead Full-stack Engineer, Product Engineer.
EN domains: real-time messaging, cross-device sync, offline-first, data backup and restore, Electron desktop, feature flags, progressive delivery, kill switch, canary rollout, multi-tenant SaaS, tenant isolation, OAuth 2.1, OpenID Connect, PKCE, mTLS, payment integration, fintech, idempotency, micro-frontends, design system, mini app, observability, PostHog, incident response, platform engineering, GitOps, Kubernetes (AKS, EKS), AI-assisted workflows, human-in-the-loop, LLM evaluation.
EN stack (current): TypeScript, React, Next.js, Node.js, NestJS, Electron, Go, PostgreSQL, Redis, Kotlin, .NET.
VI: Trưởng nhóm kỹ thuật, Tech Lead, Kỹ sư phần mềm trưởng, Quản lý kỹ thuật, Engineering Manager, Kiến trúc sư giải pháp, Kiến trúc sư phần mềm, Trưởng phòng công nghệ, đồng bộ dữ liệu đa thiết bị, sao lưu tin nhắn, ứng dụng nhắn tin quy mô lớn, nền tảng feature flag, triển khai theo từng phần, SaaS đa khách hàng (multi-tenant), tích hợp thanh toán, bảo mật mTLS, mini app, dẫn dắt đội ngũ, tuyển dụng và đào tạo kỹ sư, khởi nghiệp, đồng sáng lập.

### 6.6 Stay evergreen (rules)

- Every third-party number carries "as of" and a link (VETC 4.3M as of Tasco AGM 2026-04-20).
- Metrics are before → after with a unit; no round, unexplained multipliers.
- Describe mechanisms (kill switch, tenant isolation, human confirmation) rather than tools; keep a separate dated "Currently using" line.
- No "AI-native", "10x", "rockstar", "passionate", "results-driven".
- Titles match LinkedIn and the PDF exactly.
- Write copy in his own voice; generic polish is the #2 red flag [31]. Every bullet must be something he can explain for 5 minutes in an interview.

---

