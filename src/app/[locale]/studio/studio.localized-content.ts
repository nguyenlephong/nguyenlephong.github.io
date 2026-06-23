import {
  blogRoadmapTicketChecklist,
  blogRoadmapTopics,
  studioAiSkills,
  studioFlowGroups,
  studioFlows,
  studioWorkflowChecklists
} from "./studio.data";
import type {
  BlogRoadmapEntry,
  BlogRoadmapTopic,
  StudioAiSkill,
  StudioChecklistSection,
  StudioChecklistStep,
  StudioFlow,
  StudioFlowGroup,
  StudioFlowStep,
  StudioWorkflowChecklist
} from "./studio.data";

type LocalizedSkillCopy = {
  title: string;
  summary: string;
  tags: string[];
  useWhen: string[];
  process: string[];
  output: string[];
  guardrails: string[];
};

type LocalizedChecklistCopy = {
  title: string;
  summary: string;
  whenToUse: string;
  tags: string[];
};

type LocalizedSectionCopy = {
  title: string;
  detail: string;
};

type LocalizedStepCopy = {
  label: string;
  detail?: string;
};

type LocalizedRoadmapTopicCopy = {
  title: string;
  tagline: string;
  cadence: string;
  entries: string[];
};

type LocalizedFlowGroupCopy = {
  title: string;
  subtitle: string;
  description: string;
};

type LocalizedFlowStepCopy = {
  title: string;
  detail: string;
  evidence: string;
  output: string;
};

type LocalizedFlowCopy = {
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  useWhen: string;
  outcome: string;
  officeExample: string;
  tags: string[];
  steps: Record<string, LocalizedFlowStepCopy>;
  artifacts: string[];
  cvSignals: string[];
};

const vietnameseSkillCopies: Record<string, LocalizedSkillCopy> = {
  "code-review": {
    title: "Code Review Expert",
    summary: "Review thay đổi theo correctness trước, rồi security/privacy, maintainability, test coverage và operational risk.",
    tags: ["Code Review", "Correctness", "Security", "Test Strategy"],
    useWhen: [
      "Khi review pull request, local diff, generated code, refactor, migration hoặc hotfix production.",
      "Khi cần tìm blocker thật sự trước khi bàn về code style.",
      "Khi thay đổi chạm tới auth model, data model, analytics event, SEO path, feature flag hoặc rollout plan."
    ],
    process: [
      "Xác nhận intent: so diff với requirement, acceptance criteria và behavior người dùng.",
      "Chứng minh correctness: control flow, state transitions, boundary cases, nullability, concurrency, idempotency và failure paths.",
      "Threat model thay đổi: OWASP Top 10, injection, authz/authn bypass, IDOR, CSRF/XSS, secrets, PII và tenant isolation.",
      "Đánh giá kiến trúc: coupling, leaky abstraction, cyclic dependency, API compatibility, schema drift và maintenance cost.",
      "Review data structure: array, map, set, queue, tree, index, cache và DTO phải hợp access pattern, không vô tình biến lookup/grouping thành O(n) ở đường nóng.",
      "Review design pattern: chỉ dùng pattern quen thuộc khi nó giảm complexity thật, ví dụ Strategy cho rule thay thế được, Factory cho creation policy, Adapter cho external API, Repository cho persistence boundary, State Machine cho workflow nhiều bước.",
      "Review clean architecture: domain rule không phụ thuộc UI, framework, transport, ORM, analytics hay vendor SDK; dependency nên đi vào trong thay vì kéo business logic ra ngoài edge.",
      "Review boundary: application service giữ orchestration, domain service giữ business rule, repository/gateway giữ persistence và integration, utility chỉ giữ transform/validator/formatter/parser thuần.",
      "Kiểm tra vận hành: N+1 query, algorithmic blowup, memory pressure, hydration regression, observability gap và rollback risk.",
      "Đối chiếu verification: unit, integration, E2E, contract, accessibility và regression tests có phủ đúng behavior mới không."
    ],
    output: [
      "Findings xếp theo severity: Blocker, Major, Minor, Nit.",
      "Mỗi finding có file/line, evidence, impact và smallest practical fix.",
      "Architecture/code-shape note khi change thêm service, repository, helper dùng chung, design pattern hoặc data structure mới.",
      "Open questions chỉ khi ảnh hưởng tới correctness, security, rollout hoặc product behavior.",
      "Residual risk và verification gaps còn lại."
    ],
    guardrails: [
      "KHÔNG tiêu review budget vào preference cá nhân nếu behavior, convention và tests đã ổn.",
      "KHÔNG approve business logic mới nếu thiếu meaningful verification.",
      "KHÔNG gom business logic stateful vào file utils chỉ để nhìn gọn; nếu có ownership/domain rule thì tách service hoặc module rõ.",
      "KHÔNG đòi rewrite toàn bộ design nếu current design chưa tạo rủi ro đo được."
    ]
  },
  "frontend-architecture": {
    title: "Kiến trúc frontend",
    summary: "Thiết kế frontend quanh route boundaries, state ownership, accessibility, telemetry và Core Web Vitals.",
    tags: ["Frontend", "React", "Web Vitals", "Accessibility"],
    useWhen: [
      "Khi thiết kế route, dashboard, component system, form, filter, search UI hoặc frontend refactor.",
      "Khi UI cần quản lý URL state, server state, preferences, form state hoặc client-only interactions.",
      "Khi SEO, locale behavior, analytics, accessibility và mobile behavior là acceptance criteria bắt buộc."
    ],
    process: [
      "Định nghĩa route/layout boundaries cùng loading, empty, error, partial-data, permission và not-found states.",
      "Chọn rendering mode có chủ đích: SSR, SSG, ISR, CSR, streaming hoặc client island theo freshness, SEO, privacy và personalization.",
      "Phân loại state: server state, URL state, durable preferences, global app state, form state và ephemeral component state.",
      "Thiết kế component ownership: visual shell nhỏ, domain logic tách riêng, tránh prop drilling qua lớp không liên quan.",
      "Bảo vệ interaction quality: keyboard access, focus management, ARIA semantics, reduced motion, contrast và responsive constraints.",
      "Định nghĩa performance/analytics plan: LCP, INP, CLS, bundle budget, event names, PageTracker và funnel events."
    ],
    output: [
      "Route map và component map với ownership boundaries.",
      "State/data-fetching plan cùng cache invalidation rules.",
      "UX state matrix cho loading, empty, error, disabled, success và responsive behavior.",
      "Checklist performance, accessibility và analytics.",
      "Implementation slices theo thứ tự rủi ro."
    ],
    guardrails: [
      "KHÔNG đưa local interaction vào global state nếu không có lý do kiến trúc.",
      "KHÔNG ship visual surface nếu thiếu keyboard, screen reader và mobile behavior.",
      "KHÔNG đổi analytics hoặc locale behavior hiện có nếu thiếu migration plan rõ ràng."
    ]
  },
  "backend-architecture": {
    title: "Kiến trúc Backend",
    summary: "Thiết kế backend với domain ownership rõ, contracts tường minh, data flow bền vững và failure modes vận hành được.",
    tags: ["Backend", "API Design", "Distributed Systems", "Reliability"],
    useWhen: [
      "Khi thiết kế APIs, services, background jobs, webhooks, event streams, data migrations hoặc integrations.",
      "Khi thay đổi kéo theo database migration, message queue, rate limiting, external dependency hoặc auth/RBAC.",
      "Khi hệ thống cần latency SLO, durability, consistency model, safe rollout và rollback rõ ràng."
    ],
    process: [
      "Model domain: bounded contexts, aggregates, invariants, ownership của read/write và lifecycle events.",
      "Chọn topology: modular monolith, service extraction, serverless, queue-backed worker hoặc event-driven flow theo operational need.",
      "Contract-first: OpenAPI, gRPC, AsyncAPI, event schemas, idempotency keys, pagination, error taxonomy và versioning.",
      "Thiết kế persistence: schema, indexes, migration plan, retention, encryption, backup/restore và consistency model.",
      "Thiết kế resilience: timeouts, retry budgets, backoff with jitter, DLQ, circuit breakers, bulkheads, rate limiting và graceful degradation.",
      "Định nghĩa operability: structured logs, traces, metrics, alerts, runbooks, canary/feature flags và rollback triggers."
    ],
    output: [
      "Domain và responsibility map.",
      "API/event contract kèm failure modes.",
      "Data model và migration strategy.",
      "Resilience, security và observability plan.",
      "Rollout, rollback và disaster recovery plan."
    ],
    guardrails: [
      "Ưu tiên topology đơn giản nhất vẫn giữ được invariant và đạt SLO.",
      "KHÔNG introduce async processing nếu thiếu idempotency, observability và replay semantics.",
      "KHÔNG gọi design là production-ready nếu thiếu rollback và data recovery."
    ]
  },
  "blog-content-writer": {
    title: "Viết blog content",
    summary: "Viết technical content có thesis rõ, bằng chứng vững, semantic SEO tự nhiên và giọng chuyên gia điềm tĩnh.",
    tags: ["Technical Writing", "SEO", "Editorial Strategy"],
    useWhen: [
      "Khi viết engineering articles, technical explainers, architecture postmortems, product notes hoặc public documentation.",
      "Khi cần biến ý tưởng thô thành bài viết có thesis, flow logic, ví dụ thật và reader takeaway rõ.",
      "Khi nội dung cần giữ tone bình tĩnh, chân thực, analytical, không hype và không sales."
    ],
    process: [
      "Chốt thesis: một claim cụ thể bài viết sẽ chứng minh, không chỉ đặt topic rộng.",
      "Mở từ tình huống cụ thể: code review, outage, trade-off sản phẩm, requirement mơ hồ, dashboard chậm hoặc khoảnh khắc đi làm.",
      "Xây mental model cho reader: giải thích thuật ngữ, context, trade-offs và constraints trước khi đưa lời khuyên.",
      "Chứng minh bằng diagrams, workflows, code snippets, benchmarks, standards, source citations hoặc realistic failure modes.",
      "Tối ưu cấu trúc: H1/H2/H3 rõ, keywords tự nhiên, internal links, meta title, meta description và canonical path.",
      "Kết bằng takeaway dùng được: mental model, checklist, decision rule hoặc reflection."
    ],
    output: [
      "SEO metadata và slug recommendation.",
      "Outline có reader intent và search intent.",
      "Full manuscript đúng format yêu cầu.",
      "Source notes, diagram ideas và internal-link suggestions.",
      "Short social summary khi cần."
    ],
    guardrails: [
      "KHÔNG keyword-stuff hoặc thổi phồng claim vượt khỏi evidence.",
      "KHÔNG bịa statistics, citations, benchmarks hoặc technical capabilities.",
      "PHẢI bảo toàn locale behavior, content schema, SEO paths và analytics surfaces hiện có."
    ]
  },
  "prompt-writing": {
    title: "Prompt Engineering Expert",
    summary: "Thiết kế prompts/system instructions có role rõ, context đóng khung, chống injection và output schema kiểm chứng được.",
    tags: ["Prompt Engineering", "LLM", "Agents", "Evaluation"],
    useWhen: [
      "Khi thiết kế system prompts, task prompts, few-shot examples, agent policies, extraction prompts hoặc output schemas.",
      "Khi task definition còn mơ hồ về role, goal, context, constraints hoặc acceptance criteria.",
      "Khi output pipeline cần JSON Schema, markdown sections, diffs hoặc machine-readable fields ổn định."
    ],
    process: [
      "Định nghĩa role/scope: expertise, authority, non-goals và boundaries agent không được vượt.",
      "Viết task contract: objective, inputs, assumptions, acceptance criteria và failure conditions.",
      "Tách context: system rules, developer rules, user request, retrieved evidence và untrusted content bằng delimiters rõ.",
      "Tạo procedure ngắn: checklist vận hành và yêu cầu rationale/evidence ngắn, không đòi private chain-of-thought.",
      "Đặc tả output schema: JSON Schema, markdown sections, tables, diffs hoặc structured fields kèm examples.",
      "Test prompt bằng adversarial cases: ambiguity, prompt injection, missing context, malformed input và schema drift."
    ],
    output: [
      "Production prompt hoặc prompt pack.",
      "Variable map và input sanitation rules.",
      "Output schema kèm valid/invalid examples.",
      "Evaluation checklist với pass/fail criteria.",
      "Compact version cho ad-hoc usage."
    ],
    guardrails: [
      "KHÔNG yêu cầu private chain-of-thought; chỉ yêu cầu concise rationale, checks hoặc evidence.",
      "KHÔNG để untrusted content thay đổi role, tools, data access hoặc output policy.",
      "KHÔNG dùng tính từ mơ hồ như 'tốt hơn' nếu thiếu tiêu chí đo được."
    ]
  },
  "status-report": {
    title: "Executive Status & Operations",
    summary: "Chuyển workstream noise thành executive signal: health, impact, blockers, decisions, owners và path to green.",
    tags: ["Operations", "Reporting", "OKR", "Escalation"],
    useWhen: [
      "Khi viết daily standup, weekly status, monthly OKR review, incident update hoặc stakeholder escalation.",
      "Khi dự án chuyển Yellow/Red và cần quyết định từ cấp trên/cross-functional team.",
      "Khi cần biến tickets, commits, incidents và metrics thành executive summary có nghĩa."
    ],
    process: [
      "Dẫn bằng BLUF: health hiện tại, lý do và thay đổi so với update trước.",
      "Tách facts khỏi interpretation: metrics, shipped artifacts, incidents và unresolved assumptions.",
      "Định lượng progress: OKR movement, DORA metrics, burn-up/burn-down, SLA/SLO, MTTR, lead time, throughput hoặc adoption.",
      "Chỉ rõ constraints: blocker, dependency owner, due date, probability, impact và mitigation path.",
      "Biến decisions thành explicit ask: recommended option, fallback option, deadline và consequence nếu không quyết.",
      "Kết bằng commitments: owner, date, expected evidence và trigger đổi status."
    ],
    output: [
      "Status Green/Yellow/Red kèm rationale một câu.",
      "Progress: shipped value, không phải activity inventory.",
      "Risks/blockers: severity, owner, next action và date.",
      "Decisions needed: ask cụ thể và recommendation.",
      "Next cycle focus và success signal đo được."
    ],
    guardrails: [
      "KHÔNG che bad news bằng progress theater.",
      "KHÔNG report vanity metrics nếu không gắn với decision hoặc outcome.",
      "KHÔNG gán ownership mơ hồ kiểu 'team'; phải có role/person chịu trách nhiệm."
    ]
  },
  "doc-spec-tech-spec": {
    title: "Technical Specification & RFC",
    summary: "Viết specs decision-ready, nối product intent với architecture, NFRs, threat model, rollout và verification.",
    tags: ["RFC", "ADR", "Architecture", "NFR"],
    useWhen: [
      "Khi viết RFCs, ADRs, technical specs, migration plans, system designs hoặc implementation handoffs.",
      "Trước các features có scope lớn, cross-service dependencies, schema migrations hoặc production data impact.",
      "Khi design có rủi ro security, privacy, performance, SEO, accessibility, analytics hoặc locale behavior."
    ],
    process: [
      "Framing vấn đề: tại sao cần làm, ai bị ảnh hưởng, hiện tại vỡ ở đâu và success nghĩa là gì.",
      "Kiểm soát scope: goals, non-goals, assumptions, constraints và unresolved questions.",
      "Mô tả proposed design: architecture diagram, data model, APIs/events, dependencies, edge cases và compatibility rules.",
      "So sánh alternatives: cost, complexity, risk, reversibility và time-to-value của ít nhất hai hướng khả thi.",
      "Risk model: STRIDE, privacy impact, failure domains, blast radius, data migration risk và operational load.",
      "Delivery plan: implementation slices, test matrix, observability, rollout, rollback và post-launch validation."
    ],
    output: [
      "RFC hoặc ADR hoàn chỉnh sẵn sàng review.",
      "Decision table với alternatives và recommendation.",
      "Implementation plan và ticket breakdown.",
      "Test, rollout, observability và rollback checklist.",
      "Sign-off list theo stakeholder function."
    ],
    guardrails: [
      "KHÔNG biến assumptions thành requirements nếu chưa validate.",
      "KHÔNG bỏ non-goals; đó là scope control.",
      "KHÔNG ship spec chạm production data nếu thiếu rollback và recovery details."
    ]
  },
  "proposal-slide-pitch": {
    title: "Strategic Pitch & Proposal",
    summary: "Xây proposal nối pain, value, ROI, risk, proof và request for decision thật cụ thể.",
    tags: ["Proposal", "Strategy", "Executive Communication"],
    useWhen: [
      "Khi viết executive proposal, product strategy memo, budget ask, pitch deck hoặc technical-business trade-off narrative.",
      "Khi cần thuyết phục C-level, sponsor hoặc budget owner approve dự án.",
      "Khi phải giải thích trade-offs kiến trúc phức tạp cho non-technical stakeholders."
    ],
    process: [
      "Calibrate audience: họ value gì, sợ gì, fund gì và có quyền approve tới đâu.",
      "Frame the gap: current cost, risk, delay, churn, manual work, missed revenue hoặc strategic exposure.",
      "Nêu thesis một câu: nên làm gì và vì sao phải làm bây giờ.",
      "Chứng minh feasibility: benchmark, customer signal, PoC, architecture validation, financial model hoặc comparable case.",
      "Định lượng impact: ROI, payback period, cost avoided, cycle-time reduction, risk reduction hoặc option value.",
      "Chốt ask: decision, budget, owner, date, success metric và fallback nếu bị decline."
    ],
    output: [
      "Thesis một câu và 30-second pitch.",
      "Slide-by-slide narrative hoặc memo structure.",
      "ROI và risk model.",
      "Objection-handling matrix.",
      "Final decision request và next-step plan."
    ],
    guardrails: [
      "KHÔNG dùng buzzwords nếu không tạo decision value.",
      "KHÔNG overpromise adoption, revenue, cost saving hoặc delivery date.",
      "KHÔNG giấu ask; ambiguity làm executive decision chết."
    ]
  },
  "ai-operating-system": {
    title: "AI Operating System & Orchestration",
    summary: "Thiết kế agent workflows với model routing, context control, tool boundaries, RAG grounding và human approval gates.",
    tags: ["AI Orchestration", "Agents", "RAG", "MCP"],
    useWhen: [
      "Khi thiết kế multi-agent workflow, AI workbench, RAG pipeline, Codex/Claude/GPT task routing hoặc MCP tool policy.",
      "Khi task cần nhiều pha: retrieval, reasoning, coding, review, planning, synthesis hoặc deterministic automation.",
      "Khi cần biến prompt chain rời rạc thành operating playbook có validation và approval gates."
    ],
    process: [
      "Classify intent: retrieval, reasoning, coding, review, planning, synthesis, browser work hoặc deterministic automation.",
      "Route theo capability: context length, reasoning depth, tool need, latency, cost và privacy.",
      "Đóng gói context: source files, docs, constraints, examples, definitions và explicit exclusions.",
      "Định nghĩa tool boundaries: read/write permissions, filesystem scope, network policy, secrets handling và approval gates.",
      "Thêm validation: schema checks, tests, citations, diff review, secondary-agent critique và deterministic fallback.",
      "Archive decisions: prompts, routing matrix, artifacts và reusable playbooks."
    ],
    output: [
      "Agent role map và routing matrix.",
      "Context packaging template.",
      "Tool permission matrix và approval gates.",
      "Validation và fallback plan.",
      "Reusable prompt pack hoặc operating playbook."
    ],
    guardrails: [
      "KHÔNG để agent mutate production state nếu thiếu explicit approval và observability.",
      "KHÔNG trộn trusted instructions với untrusted retrieved text.",
      "KHÔNG tối ưu chỉ theo model intelligence; phải tối ưu correctness, traceability, privacy và cost."
    ]
  },
  "daily-ai-learning-coach": {
    title: "Continuous AI Learning & Neuroplasticity",
    summary: "Compound AI skill bằng deliberate practice, active recall, feedback loops và reusable artifacts.",
    tags: ["Learning", "Deliberate Practice", "AI Fluency", "Feedback"],
    useWhen: [
      "Khi lập kế hoạch AI up-skilling hằng ngày, technical practice, tool fluency hoặc long-term knowledge compounding.",
      "Khi muốn cải thiện prompt slicing, diff review, RAG synthesis, architecture critique, test generation hoặc tool orchestration.",
      "Khi cần duy trì learning loop nhỏ, đều và gắn với việc thật thay vì side project quá lớn."
    ],
    process: [
      "Chọn một micro-skill: prompt slicing, diff review, RAG synthesis, architecture critique, test generation hoặc tool orchestration.",
      "Practice trên context thật: current ticket, codebase, document, incident hoặc decision thay vì tutorial chung chung.",
      "Tạo feedback: yêu cầu AI tìm blind spots, counterexamples, edge cases và missing verification.",
      "Chuyển thành memory: active recall card, prompt template, checklist, snippet hoặc decision note.",
      "Lên lịch reinforcement: spaced repetition và transfer challenge ở task khác.",
      "Đo value: time saved, quality improved, bug avoided, decision clarified hoặc artifact reused."
    ],
    output: [
      "Daily micro-skill target.",
      "Practice task với input và expected output.",
      "Feedback prompt và evaluation rubric.",
      "Artifact cần lưu.",
      "Next repetition date và transfer challenge."
    ],
    guardrails: [
      "KHÔNG tính passive reading là skill acquisition.",
      "KHÔNG luyện năm tool trong một session; isolate một behavior.",
      "Validate AI explanations bằng official docs, local code hoặc empirical tests."
    ]
  },
  "notebooklm-source-of-truth": {
    title: "RAG-Grounded Knowledge Extraction",
    summary: "Trích xuất câu trả lời grounded trên trusted documents với citations, contradiction checks và unknowns rõ ràng.",
    tags: ["RAG", "Citations", "Research", "Knowledge Graph"],
    useWhen: [
      "Khi làm việc với document sets dày: PRDs, RFCs, research papers, financial reports hoặc knowledge bases.",
      "Khi mọi technical claim cần citation để audit.",
      "Khi cần extraction, synthesis, comparison, timeline reconstruction hoặc gap analysis."
    ],
    process: [
      "Sanitize sources: loại bỏ secrets, credentials, PII và tài liệu ngoài approved scope.",
      "Retrieve hẹp: query theo entity, date, decision, metric, requirement, contradiction và dependency.",
      "Extract facts: chỉ quote/paraphrase điều source support và giữ source IDs.",
      "Synthesize cẩn trọng: tách direct evidence, inferred interpretation, conflicts và unknowns.",
      "Build structure: timeline, entity map, decision log, requirement matrix hoặc FAQ theo task.",
      "Identify gaps: nêu evidence thiếu và source nào có thể resolve."
    ],
    output: [
      "Direct answer với citations cho factual claims.",
      "Evidence table: claim, source, confidence, date và caveat.",
      "Contradictions và outdated-source warnings.",
      "Entity/timeline/decision map khi hữu ích.",
      "Unknowns và recommended follow-up sources."
    ],
    guardrails: [
      "Nếu source không support claim, ghi rõ: not provided in the source.",
      "KHÔNG dùng external knowledge nếu task không cho phép.",
      "KHÔNG gom conflicting sources thành một sự thật giả."
    ]
  },
  "ai-delivery-factory": {
    title: "Autonomous Delivery & CI/CD",
    summary: "Điều phối AI-assisted delivery từ scoped requirement tới implementation, verification, PR và release-ready handoff.",
    tags: ["AI Delivery", "CI/CD", "Testing", "Automation"],
    useWhen: [
      "Khi AI agents hỗ trợ implement features, refactors, migrations, test suites, CI changes hoặc release handoffs.",
      "Khi workflow cần separation of duties giữa specification, coding, review và verification.",
      "Khi agent được phép edit, commit, push, open PR hoặc chỉ prepare patch tùy approval."
    ],
    process: [
      "Scope work: restate requirement, acceptance criteria, non-goals, affected surfaces và risk level.",
      "Slice execution: chia implementation chunks nhỏ, mỗi chunk có verification check.",
      "Implement bằng local context: theo patterns hiện có, preserve unrelated user changes, tránh broad refactor.",
      "Shift-left verification: typecheck, lint, unit/integration/E2E, schema, accessibility và security checks tùy scope.",
      "Review diff: kiểm staged changes, secrets, artifacts, analytics wiring và migration safety.",
      "Handoff sạch: Conventional Commit, push khi có approval, PR notes có impact và verification."
    ],
    output: [
      "Execution plan và changed-file summary.",
      "Verification evidence với command results.",
      "Commit message và PR body draft.",
      "Release/deployment/rollback notes.",
      "Remaining risks hoặc follow-up tickets."
    ],
    guardrails: [
      "KHÔNG include secrets, local build output, runtime metadata hoặc unrelated user changes vào commit.",
      "KHÔNG dùng agent-generated diff làm approval cho chính nó.",
      "KHÔNG deploy hoặc mutate production nếu human chưa explicitly request."
    ]
  },
  "claude-deep-review": {
    title: "Adversarial Semantic Review",
    summary: "Dùng adversarial review để lộ assumptions, failure modes, ambiguity và system-level fragility.",
    tags: ["Adversarial Review", "Red Teaming", "Architecture", "Security"],
    useWhen: [
      "Khi cần critique sâu cho PRs, RFCs, architecture proposals, incident narratives, strategy memos hoặc AI-generated plans.",
      "Khi design có rủi ro concurrency, data integrity, security vectors, scale limits hoặc rollout ambiguity.",
      "Khi cần một reviewer độc lập nói thẳng về weakest links trước khi execution."
    ],
    process: [
      "Decompose system: actors, data flows, state transitions, dependencies, trust boundaries và failure domains.",
      "Attack assumptions: invalid input, high concurrency, partial failure, network partition, stale cache, malicious user và operator error.",
      "Trace blast radius: data corruption, availability loss, privacy breach, customer impact, cost explosion và operational burden.",
      "Challenge alternatives: so proposed path với hướng đơn giản hơn, an toàn hơn, rẻ hơn hoặc dễ rollback hơn.",
      "Rewrite weak language: loại ambiguity, unsupported claims, hidden dependencies và false certainty.",
      "Đưa mitigation cụ thể: fixes, validation steps và decision gates."
    ],
    output: [
      "Critical risks và exploit/failure narrative.",
      "Assumptions cần chứng minh.",
      "Alternative designs kèm trade-offs.",
      "Mitigation plan xếp theo risk reduction.",
      "Go/No-Go recommendation với evidence threshold."
    ],
    guardrails: [
      "Nói thẳng nhưng dựa trên evidence; critique work, không critique author.",
      "KHÔNG chấp nhận 'probably fine' cho security, data integrity hoặc rollback.",
      "KHÔNG dừng ở critique; phải đưa smallest path để giảm risk."
    ]
  },
  "career-ai-strategy": {
    title: "Capability Compounding & Leverage",
    summary: "Xây career leverage bền bằng Staff-level scope, AI fluency, portfolio evidence và compounding systems.",
    tags: ["Career Strategy", "Staff Engineer", "Leverage", "Portfolio"],
    useWhen: [
      "Khi lập career plan, Staff/Principal path, promotion packet, AI leverage strategy hoặc portfolio roadmap.",
      "Khi cần hệ thống hóa project impact thành artifacts: ADRs, postmortems, engineering writing, OSS, talks hoặc internal tools.",
      "Khi muốn giữ optionality giữa Staff IC, engineering manager, founder, consultant hoặc AI systems specialist."
    ],
    process: [
      "Định nghĩa career thesis: bạn giải quyết market problem nào tốt hơn nhờ skill stack của mình.",
      "Audit capability: technical depth, system design, product sense, communication, leadership, AI fluency và business judgment.",
      "Xác định leverage assets: tools, standards, playbooks, public writing, OSS, talks, mentorship và architecture artifacts.",
      "Chọn bets: 2-3 projects có asymmetric upside, visible impact và reusable proof.",
      "Xây 90-day operating plan: outcomes, rituals, artifacts, stakeholder alignment và weekly feedback loops.",
      "Track evidence: before/after metrics, adoption, reliability gains, time saved, decisions influenced và people enabled."
    ],
    output: [
      "Career thesis và positioning statement.",
      "Capability matrix với gaps và proof.",
      "90-day leverage roadmap.",
      "Portfolio artifact plan.",
      "Mentorship, visibility và stakeholder strategy."
    ],
    guardrails: [
      "KHÔNG tối ưu job-title aesthetics hơn real scope và outcomes.",
      "KHÔNG nhầm tool usage với AI fluency; đo quality, speed, judgment và leverage.",
      "KHÔNG hy sinh technical depth cho breadth nông."
    ]
  },
  "engineering-decision-map": {
    title: "Systemic Decision Topography",
    summary: "Map business requirements tới domain invariants, architecture options, trade-offs, risks và operational readiness.",
    tags: ["Decision Matrix", "Systems Thinking", "Trade-offs", "Requirements"],
    useWhen: [
      "Khi requirements còn mơ hồ, decisions cross-functional hoặc architecture phải cân bằng product, data và operations.",
      "Khi feature chạm core domain, data consistency, integrations, permissions hoặc migration.",
      "Khi cần biết việc gì AI có thể execute và việc gì human architect phải chốt."
    ],
    process: [
      "Extract invariants: điều gì luôn phải đúng với users, money, permissions, data và compliance.",
      "Map toàn stack: business process, domain objects, API contracts, data stores, infrastructure, operations và support.",
      "Generate options: CRUD, CQRS, event sourcing, queue-backed workflows, modular monolith, service extraction hoặc Strangler Fig.",
      "Score trade-offs: reversibility, delivery speed, data consistency, operational complexity, cost, reliability và team fit.",
      "Run FMEA: failure modes, blast radius, detection, mitigation, rollback và graceful degradation.",
      "Chốt decision: two-way door vs one-way door, accepted tech debt và validation milestone."
    ],
    output: [
      "Requirement-to-architecture map.",
      "Weighted decision matrix.",
      "Recommended option và rejected alternatives.",
      "Risk register và mitigation plan.",
      "Operational readiness và rollout outline."
    ],
    guardrails: [
      "KHÔNG chọn technology thú vị nếu boring technology giữ invariant đủ tốt.",
      "KHÔNG finalize decision nếu thiếu observability và rollback.",
      "Phải nói rõ breaking point của design, không ngầm hứa scale vô hạn."
    ]
  },
  "staff-engineer-ai-review-pack": {
    title: "Staff-Level Architectural Audit",
    summary: "Audit technical changes rủi ro cao qua lăng kính Product, Architecture, Security, Data, SRE, QA và Rollout.",
    tags: ["Staff Engineer", "Architecture Review", "PRR", "Risk Audit"],
    useWhen: [
      "Khi review major architectural change, multi-system integration, sensitive-data feature, migration hoặc launch readiness.",
      "Khi PR/RFC tác động Tier-1 services, API contracts, schema changes, auth model hoặc SLO.",
      "Khi cần Production Readiness Review trước merge/go-live."
    ],
    process: [
      "Product lens: validate user value, rollout segment, acceptance criteria và cost of delay/simplification.",
      "Architecture lens: boundaries, coupling, compatibility, contracts, extensibility và architectural drift.",
      "Security/privacy lens: STRIDE, IAM/RBAC/ABAC, data exposure, tenant isolation, secrets, encryption và auditability.",
      "Data lens: migration safety, index/lock behavior, backfill, consistency, retention, backup/restore và reconciliation.",
      "SRE lens: SLO impact, capacity, alerts, dashboards, runbooks, on-call load, failure domains và rollback triggers.",
      "QA lens: unit, integration, E2E, contract, load, chaos, accessibility và exploratory test coverage."
    ],
    output: [
      "Cross-functional risk matrix.",
      "Hard blockers và launch conditions.",
      "Production readiness score với Go/No-Go recommendation.",
      "Required sign-offs và owners.",
      "Evolution path từ current state tới target state."
    ],
    guardrails: [
      "KHÔNG approve big-bang rewrite nếu thiếu incremental migration plan.",
      "KHÔNG chấp nhận launch readiness nếu thiếu measurable SLOs và rollback triggers.",
      "Ưu tiên data integrity, privacy và reliability hơn delivery optics."
    ]
  },
  "data-resilience-observability-review": {
    title: "Distributed Resilience & Telemetry",
    summary: "Review data integrity, distributed resilience, telemetry và recovery plan trước khi hệ thống gánh production load.",
    tags: ["Data", "Resilience", "Observability", "SRE"],
    useWhen: [
      "Khi thiết kế databases, caches, queues, search indexes, event streams, third-party integrations hoặc production readiness reviews.",
      "Khi PR thay đổi schema, query pattern, consistency model, cache layer, queue semantics hoặc recovery behavior.",
      "Khi cần chuẩn bị SLO dashboards, alerting, runbooks, restore tests và go-live checklist."
    ],
    process: [
      "Data integrity: transaction boundaries, isolation level, constraints, idempotency, deduplication, reconciliation và migration safety.",
      "Query/storage: indexes, cardinality, locking, hot partitions, N+1 access, connection pooling, retention và archival.",
      "Cache/queue behavior: invalidation, stampede protection, TTL, ordering, replay, DLQ, poison messages và backpressure.",
      "Failure simulation: network partition, slow dependency, partial write, duplicate event, region failover và third-party outage.",
      "Telemetry: RED/USE metrics, OpenTelemetry traces, structured logs, correlation IDs, dashboards, SLO burn alerts và runbooks.",
      "Recovery: backup restore, point-in-time recovery, RPO/RTO, rollback scripts và data repair procedure."
    ],
    output: [
      "Consistency và data-integrity assessment.",
      "Failure-mode matrix với mitigation.",
      "Telemetry specification và dashboard plan.",
      "Load, chaos và restore test plan.",
      "Go-live checklist với rollback/recovery triggers."
    ],
    guardrails: [
      "KHÔNG giả định network, clock, cache, queue hoặc third-party dependency luôn reliable.",
      "KHÔNG log PII, secrets, tokens hoặc sensitive payloads.",
      "KHÔNG page humans bằng non-actionable alerts."
    ]
  },
  "installed-skill-library-cartographer": {
    title: "Bản đồ Skill đã cài",
    summary: "Inventory skill đã install, loại duplicate, phân loại capability và biến playbook rải rác thành hệ thống routing dùng được.",
    tags: ["Skill Inventory", "Agent Routing", "Taxonomy", "Governance"],
    useWhen: [
      "Dựa trên lần quét local mới nhất: 14.541 raw SKILL.md, 5.035 unique contents, 3.116 unique names, overlap lớn giữa Codex, Claude, Gemini, Antigravity CLI/IDE và local agent runtimes.",
      "Khi cần tổng hợp skill từ Codex, Claude, Gemini, Antigravity, local .agents, plugin, marketplace hoặc project-local skills.",
      "Khi thư viện skill có quá nhiều bản duplicate/cache và cần rút thành capability taxonomy rõ.",
      "Khi muốn update Studio skill library dựa trên corpus thật thay vì cảm tính."
    ],
    process: [
      "Inventory sources: Codex, Claude, Gemini, Antigravity CLI/IDE, local .agents, project-local skills, plugins và marketplace caches.",
      "Extract metadata: name, description, trigger rules, domain keywords, output expectations và safety constraints.",
      "Cluster capabilities: engineering, frontend/UI, backend/platform, security, AI agents, research, content, product, operations, mobile và learning.",
      "Tìm gaps: capability có nhiều trong installed skills nhưng thiếu trong public Studio skill library.",
      "Synthesize target skills: merge playbooks trùng nhau thành expert skills rõ, không duplicate.",
      "Validate fit: mỗi final skill phải có trigger, required context, process, output contract và guardrails."
    ],
    output: [
      "Inventory summary: raw files, unique contents, unique names và runtime coverage.",
      "Capability taxonomy gắn với source families.",
      "Gap analysis so với current skill library.",
      "Đề xuất additions/merges/removals.",
      "Bản English và Vietnamese copy-ready."
    ],
    guardrails: [
      "KHÔNG public local paths, username, token, credential hoặc private workspace details.",
      "KHÔNG phình library bằng cách copy mọi duplicate skill vào UI.",
      "KHÔNG bê nguyên marketplace/cache content nếu chưa normalize theo vocabulary và nhu cầu của owner."
    ]
  },
  "ai-product-evaluation": {
    title: "AI Product & Evaluation",
    summary: "Đưa AI feature từ demo ấn tượng thành product đáng tin bằng evals, safety boundaries, cost controls và user value đo được.",
    tags: ["AI Product", "Evals", "LLM Quality", "Trust"],
    useWhen: [
      "Khi thiết kế, audit hoặc ship AI product features, agents, copilots, chat interfaces, retrieval systems hoặc model-powered workflows.",
      "Khi cần phân biệt demo đẹp với production behavior đáng tin.",
      "Khi cần đo hallucination, tool-call accuracy, citation fidelity, latency, token spend và task completion."
    ],
    process: [
      "Định nghĩa product promise: AI giúp user làm gì và tuyệt đối không được làm gì.",
      "Tách demo khỏi production: grounding, permissions, fallback UX, observability, rate limits và abuse controls.",
      "Build evals: golden tasks, adversarial prompts, regression suites, human review rubrics và acceptance thresholds.",
      "Đo quality/cost: success rate, hallucination rate, tool-call accuracy, citation fidelity, latency, token spend và support impact.",
      "Thiết kế trust UX: source display, confidence language, editability, audit trail, undo, escalation và human handoff.",
      "Plan rollout: shadow mode, allowlist, feature flag, red-team review, telemetry, incident playbook và model/provider rollback."
    ],
    output: [
      "AI feature brief với promise, non-goals và risk class.",
      "Evaluation plan với datasets, rubrics, thresholds và owners.",
      "Safety và trust UX checklist.",
      "Cost/latency budget và monitoring plan.",
      "Rollout và rollback plan."
    ],
    guardrails: [
      "KHÔNG ship AI feature nếu evals không khớp real user tasks.",
      "KHÔNG che uncertainty, missing sources hoặc model limitations khỏi user.",
      "KHÔNG cấp write access cho agent nếu thiếu permission boundaries và audit logs."
    ]
  },
  "agent-tools-mcp-automation": {
    title: "Agent Tools, MCP & Workflow Automation",
    summary: "Thiết kế tool-using agents ổn định qua MCP, GitHub, Slack, Gmail, Outlook, Notion, Airtable, browser và local CLI.",
    tags: ["MCP", "Automation", "Integrations", "Tool Use"],
    useWhen: [
      "Khi agent cần dùng tools, connectors, MCP servers, CLIs, browsers hoặc app integrations để hoàn thành workflow.",
      "Khi task có read/write permissions, app account boundary, schema, pagination hoặc state mutation.",
      "Khi cần automation đáng tin nhưng vẫn có audit trail và approval gates."
    ],
    process: [
      "Discover tools: inspect schemas và required IDs trước khi execute.",
      "Classify actions: read-only, draft creation, user-reviewed write, immediate write, scheduled action, destructive action hoặc external publish.",
      "Normalize inputs: resolve IDs, validate schemas, handle time zones, sanitize untrusted content và preserve source links.",
      "Execute safely: batch chỉ khi independent, paginate tới completeness, checkpoint long work và giữ outputs inspectable.",
      "Verify results: so returned state với requested state, record links/artifacts và surface partial failures.",
      "Handoff: summary ngắn, artifacts, residual risk và next human decision nếu cần."
    ],
    output: [
      "Tooling plan với app, action, permission level và risk class.",
      "Schema-compliant execution inputs.",
      "Result summary kèm source links hoặc artifact references.",
      "Failure/retry notes và unresolved blockers.",
      "Audit trail cho state-changing actions."
    ],
    guardrails: [
      "KHÔNG execute write/destructive actions nếu thiếu explicit approval hoặc draft-first workflow.",
      "KHÔNG bịa tool slugs, API fields, account IDs, channel IDs, folder IDs hoặc file IDs.",
      "KHÔNG expose secrets, OAuth tokens, private payloads hoặc unrelated app data."
    ]
  },
  "product-analytics-growth": {
    title: "Product Analytics & Growth Experimentation",
    summary: "Biến behavior data thành quyết định qua event taxonomy, funnels, cohorts, A/B tests, attribution và growth loops.",
    tags: ["Analytics", "Growth", "Experimentation", "PostHog"],
    useWhen: [
      "Khi thiết kế analytics, audit tracking, plan growth experiments, đo funnel hoặc quyết định feature có hiệu quả không.",
      "Khi public route, CTA, filter, command UI, form hoặc outbound link cần tracking đúng.",
      "Khi cần nối product metric với decision thay vì vanity dashboard."
    ],
    process: [
      "Define decision: metric move/không move/inconclusive thì quyết định gì thay đổi.",
      "Design event taxonomy: event names, properties, identity resolution, source surface và versioning.",
      "Validate instrumentation: page views, click events, forms, filters, outbound links, search/command UIs và error states.",
      "Analyze behavior: funnels, cohorts, retention curves, segmentation, drop-offs, correlation và qualitative context.",
      "Plan experiments: hypothesis, primary metric, guardrail metrics, sample size, ramp plan và stop conditions.",
      "Report learning: what changed, what did not, confidence level, next decision và follow-up instrumentation."
    ],
    output: [
      "Tracking plan với events, properties, owners và surfaces.",
      "Funnel/cohort dashboard spec.",
      "Experiment brief với hypothesis, metrics và guardrails.",
      "Data quality checklist.",
      "Decision memo với recommendation."
    ],
    guardrails: [
      "KHÔNG optimize vanity metrics nếu không ảnh hưởng decision.",
      "KHÔNG thêm public surfaces nếu thiếu analytics theo convention của product.",
      "KHÔNG bỏ qua privacy choices, Do Not Track, consent hoặc autocapture/session-recording constraints."
    ]
  },
  "research-market-intelligence": {
    title: "Research & Market Intelligence",
    summary: "Tạo research grounded từ local docs, web sources, competitors, customers, papers và market signals với confidence rõ.",
    tags: ["Research", "Market Intelligence", "Source Grounding", "Synthesis"],
    useWhen: [
      "Khi làm market research, competitor analysis, product discovery, customer insight synthesis hoặc technical literature review.",
      "Khi cần current web research hoặc local-only research có source boundaries rõ.",
      "Khi quyết định cần evidence table thay vì opinion."
    ],
    process: [
      "Frame question: decision, scope, non-goals, assumptions và confidence cần đạt.",
      "Start local: inspect provided docs, repo notes, prior decisions và internal artifacts trước external lookup.",
      "Gather evidence: ưu tiên primary sources, so dates, kiểm tra incentives của source và capture citations.",
      "Analyze patterns: user segments, competitors, jobs-to-be-done, willingness to pay, adoption barriers và market timing.",
      "Tách signal khỏi speculation: label facts, inferences, weak signals, contradictions và unknowns.",
      "Recommend action: next decision hoặc experiment nhỏ nhất để giảm uncertainty."
    ],
    output: [
      "Research brief với question, scope và confidence.",
      "Evidence table với source, date, claim và caveat.",
      "Competitor/customer/theme synthesis.",
      "Unknowns và risk register.",
      "Recommended next experiment hoặc decision."
    ],
    guardrails: [
      "KHÔNG browse external nếu task yêu cầu local-only.",
      "KHÔNG biến outdated/secondhand claims thành current primary evidence.",
      "KHÔNG giấu uncertainty; phải label confidence và proof gaps."
    ]
  },
  "security-privacy-threat-modeling": {
    title: "Security, Privacy & Threat Modeling",
    summary: "Audit abuse paths, auth flaws, PII exposure, supply-chain risk, compliance gaps và secure rollout.",
    tags: ["Security", "Privacy", "Threat Modeling", "Compliance"],
    useWhen: [
      "Khi change chạm authentication, authorization, user input, sensitive data, payments, uploads, integrations, AI tools hoặc infrastructure.",
      "Khi cần review data flow, logs, analytics properties, secrets hoặc third-party processors.",
      "Khi cần Go/No-Go security recommendation trước rollout."
    ],
    process: [
      "Map assets/trust boundaries: user data, credentials, tokens, payments, internal APIs, model context và admin tools.",
      "Run STRIDE/LINDDUN: spoofing, tampering, repudiation, information disclosure, denial of service, elevation và privacy risks.",
      "Test abuse paths: injection, XSS, CSRF, IDOR, SSRF, RCE, path traversal, prompt injection và privilege escalation.",
      "Check privacy: data minimization, consent, PII redaction, logging hygiene, analytics properties, retention và deletion.",
      "Assess supply chain: dependencies, SCA, SAST, secrets scanning, container/IaC drift và CI permissions.",
      "Define mitigations: hard blockers, compensating controls, test cases, monitoring, rollout constraints và incident runbook."
    ],
    output: [
      "Threat model với assets, actors, boundaries và assumptions.",
      "Vulnerability findings xếp severity.",
      "Privacy impact notes và data-flow diagram.",
      "Required fixes và verification tests.",
      "Go/No-Go security recommendation."
    ],
    guardrails: [
      "KHÔNG log, copy hoặc publish secrets, tokens, private keys hoặc sensitive payloads.",
      "KHÔNG nói chung chung 'sanitize input'; phải nêu exact control và location.",
      "KHÔNG approve sensitive-data features nếu thiếu auditability và rollback."
    ]
  },
  "design-system-ui-craft": {
    title: "Design System & UI Craft",
    summary: "Tạo interface polished, accessible, responsive bằng design system, component libraries, visual hierarchy và interaction states.",
    tags: ["Design System", "UI", "Accessibility", "Responsive"],
    useWhen: [
      "Khi build hoặc refine product UI, design systems, dashboards, landing pages, mobile layouts, component libraries hoặc prototypes.",
      "Khi cần UI vừa đẹp vừa usable, có state coverage và responsive constraints.",
      "Khi cần nối design craft với telemetry và implementation."
    ],
    process: [
      "Understand job: repeated workflow, scanning pattern, decision load và error recovery của user.",
      "Use existing system first: tokens, spacing, icons, button semantics, tabs, menus, forms, charts, tables và empty states.",
      "Design complete states: hover, focus, disabled, loading, skeleton, empty, error, success, overflow, long text và mobile.",
      "Build visual hierarchy: typography scale, spacing rhythm, contrast, density, grouping, affordances và layout constraints.",
      "Verify craft: screenshot review, responsive checks, no overlap, stable dimensions, keyboard navigation và color contrast.",
      "Connect telemetry: track UI decisions, filters, commands, CTAs, forms, outbound links và preference changes."
    ],
    output: [
      "UI concept và layout rationale.",
      "Component/state inventory.",
      "Responsive và accessibility checklist.",
      "Implementation notes gắn với design system hiện có.",
      "Screenshot hoặc browser-verification plan khi cần."
    ],
    guardrails: [
      "KHÔNG làm landing page khi user yêu cầu tool hoặc app.",
      "KHÔNG dùng decorative gradients/orbs thay cho visual assets liên quan product.",
      "KHÔNG ship text overflow, overlap hoặc vỡ trên mobile."
    ]
  },
  "mobile-platform-engineering": {
    title: "Mobile Platform Engineering",
    summary: "Build/review iOS, Android, SwiftUI, Kotlin, React Native và app-store workflows với performance và release discipline.",
    tags: ["Mobile", "iOS", "Android", "SwiftUI"],
    useWhen: [
      "Khi làm native iOS, Android, SwiftUI, Kotlin, React Native, app packaging, app-store release hoặc mobile UI/performance audit.",
      "Khi mobile change cần device matrix, accessibility, crash reporting, privacy declaration và phased rollout.",
      "Khi cần bridge giữa product UX và app-store/release constraints."
    ],
    process: [
      "Define platform boundaries: native vs cross-platform, shared logic, UI ownership, device support và release cadence.",
      "Design lifecycle behavior: launch, navigation, state restoration, background tasks, permissions, offline mode và error recovery.",
      "Optimize performance: startup time, scrolling, image memory, layout passes, concurrency, battery, network và caching.",
      "Verify UI: device matrix, orientation, Dynamic Type, TalkBack/VoiceOver, keyboard, gestures và visual regression.",
      "Harden release: signing, provisioning, app-store metadata, privacy labels, crash monitoring, phased rollout và rollback.",
      "Capture evidence: simulator/device logs, screenshots, test reports, crash-free sessions và release notes."
    ],
    output: [
      "Platform architecture và release plan.",
      "UI/performance risk matrix.",
      "Test matrix across devices và OS versions.",
      "Store submission checklist.",
      "Post-release monitoring và rollback notes."
    ],
    guardrails: [
      "KHÔNG xem simulator success là device readiness.",
      "KHÔNG bỏ qua accessibility, privacy declarations hoặc app-store review constraints.",
      "KHÔNG ship mobile changes nếu thiếu crash/analytics visibility."
    ]
  },
  "data-ml-science-workflow": {
    title: "Data, ML & Scientific Workflow",
    summary: "Xử lý data, ML và science tasks bằng reproducible notebooks, trustworthy sources, evaluation, provenance và statistical caution.",
    tags: ["Data", "ML", "Science", "Reproducibility"],
    useWhen: [
      "Khi làm data analysis, ML experiments, scientific APIs, bioinformatics, finance data, geospatial work, notebooks hoặc dashboards.",
      "Khi analysis có risk về financial, health, science, compliance, privacy hoặc production impact.",
      "Khi cần evidence và caveat rõ thay vì model output trôi chảy."
    ],
    process: [
      "Define hypothesis/decision: analysis có thể và không thể chứng minh điều gì.",
      "Audit data provenance: source, freshness, sampling bias, schema quality, missing values, leakage và sensitive fields.",
      "Build reproducibly: environment, seed, notebook/script split, versioned data, deterministic transforms và assumptions.",
      "Analyze rigorously: baselines, confidence intervals, error bars, ablations, train/test split và OOD checks.",
      "Validate with domain sense: so known constraints, source docs và independent sanity checks.",
      "Communicate limits: uncertainty, caveats, failed approaches, ethical constraints và next experiment."
    ],
    output: [
      "Analysis plan và data dictionary.",
      "Reproducible notebook/script outline.",
      "Findings với confidence và caveats.",
      "Evaluation table và error analysis.",
      "Recommendation hoặc next experiment."
    ],
    guardrails: [
      "KHÔNG ám chỉ causality từ correlation nếu thiếu identification strategy.",
      "KHÔNG xem model output là truth nếu thiếu validation và error analysis.",
      "KHÔNG expose sensitive, medical, financial hoặc proprietary data trong public artifacts."
    ]
  }
};


type VietnameseSkillExpertAddendum = {
  role: string;
  heuristics: string[];
  failureModes: string[];
  gates: string[];
};

function buildVietnameseExpertAddendum({
  role,
  heuristics,
  failureModes,
  gates
}: VietnameseSkillExpertAddendum): string[] {
  return [
    "",
    "## Lăng kính senior/expert",
    `- ${role}`,
    ...heuristics.map((item) => `- ${item}`),
    "",
    "## Bẫy chuyên môn dễ bị bỏ sót",
    ...failureModes.map((item) => `- ${item}`),
    "",
    "## Quality gates",
    ...gates.map((item) => `- ${item}`)
  ];
}

const vietnameseSkillExpertAddenda: Record<string, VietnameseSkillExpertAddendum> = {
  "code-review": {
    role: "Review như người sẽ chịu trách nhiệm production nếu change này gây incident lúc 2 giờ sáng.",
    heuristics: [
      "Đọc diff qua invariant: tiền, quyền truy cập, identity, dữ liệu, locale, SEO, analytics, cache và rollback.",
      "Trace cả happy path lẫn abandoned path: double click, stale tab, retry, partial write, duplicate event, disabled user và request timeout.",
      "Xem test như evidence, không xem test như bảo chứng; mock phải được đối chiếu với contract thật.",
      "Review code shape trước code style: data structure, design pattern, service boundary và helper extraction phải hợp workflow thật."
    ],
    failureModes: [
      "Race condition, stale closure, optimistic UI rollback hoặc retry tạo side effect trùng nhưng unit test vẫn xanh.",
      "Một sửa UI nhỏ làm vỡ tracking, canonical path, accessibility, focus order hoặc localized copy ở route khác.",
      "Migration hoặc schema change hợp lệ về cú pháp nhưng tạo lock, backfill chậm, old-reader break hoặc rollback không thể làm sạch data.",
      "Tên design pattern nghe đúng nhưng boundary sai: business rule trôi vào controller, persistence trôi lên UI, hoặc generic utility bắt đầu giữ product state."
    ],
    gates: [
      "Finding Blocker/Major phải có evidence, impact và smallest fix.",
      "High-risk diff phải có negative-path verification hoặc residual-risk note rõ.",
      "Reviewer phải biết signal nào chứng minh production khỏe sau merge.",
      "Diff thêm service, repository, shared utility, pattern hoặc data structure mới phải có ghi chú ngắn về ownership và lý do chọn."
    ]
  },
  "frontend-architecture": {
    role: "Thiết kế như Staff Frontend Architect cân bằng product speed, design-system integrity, accessibility và runtime performance.",
    heuristics: [
      "Tách ownership theo route, data loader, URL state, interaction state, visual primitive, analytics surface và error recovery.",
      "Model UI như state machine: loading, empty, partial, permission, optimistic, failed, retrying, success và stale data.",
      "Budget cho nội dung xấu nhất: bản dịch dài, dataset rỗng, network chậm, reduced motion, keyboard-only và viewport hẹp."
    ],
    failureModes: [
      "Hydration mismatch hoặc client-only state làm lệch SEO, first interaction, analytics hoặc cache freshness.",
      "Component đẹp trên mock nhưng không có stable dimensions nên real data gây CLS, overlap, truncation hoặc mobile unusable.",
      "Global state được thêm để giải quyết vấn đề local, tạo coupling và stale state giữa các route."
    ],
    gates: [
      "State taxonomy, responsive matrix và focus order phải rõ trước khi gọi UI ready.",
      "LCP, INP, CLS, bundle budget, keyboard flow và PageTracker/event tracking có owner.",
      "Không ship component mới nếu thiếu empty/error/disabled/loading/mobile behavior."
    ]
  },
  "backend-architecture": {
    role: "Thiết kế như Backend Architect chịu trách nhiệm invariant, compatibility, migration safety và operational load.",
    heuristics: [
      "Bắt đầu từ invariant trước topology: điều gì vẫn phải đúng sau retry, duplicate message, partial failure, replay và operator error.",
      "Chọn consistency model có chủ đích: strong, read-your-writes, monotonic read, eventual consistency hoặc compensating transaction.",
      "Giữ boring architecture cho tới khi throughput, data gravity, ownership hoặc compliance buộc phải phức tạp hơn."
    ],
    failureModes: [
      "Async flow thiếu idempotency, DLQ, replay strategy, reconciliation và observability sẽ biến bug thành data loss âm thầm.",
      "Retry không phân biệt transient/permanent error nên nhân đôi thanh toán, gửi mail trùng hoặc ghi event sai thứ tự.",
      "Schema migration bỏ qua lock behavior, index build, backfill throttle, old readers và rollback data."
    ],
    gates: [
      "Mỗi mutation path phải có authz, idempotency key, validation, audit signal và rollback semantics.",
      "Contract phải có pagination, error taxonomy, rate limit, versioning và compatibility note.",
      "SLO, timeout, retry budget, alert và runbook đủ để on-call xử lý."
    ]
  },
  "blog-content-writer": {
    role: "Viết như senior technical editor bảo vệ trust, precision, source fidelity và working memory của reader.",
    heuristics: [
      "Biến topic rộng thành một thesis, một reader, một decision và một mental model đáng nhớ.",
      "Dùng thuật ngữ chuyên ngành khi nó mang tải giải thích; định nghĩa bằng ngữ cảnh, failure mode và trade-off.",
      "SEO semantic phải nâng clarity, không thay giọng tác giả bằng keyword stuffing."
    ],
    failureModes: [
      "Bài nghe có vẻ expert nhưng thiếu falsifiable claim, source trail, ví dụ vận hành hoặc trade-off thật.",
      "Nội dung có nhiều heading nhưng không có narrative spine nên reader không biết phải làm gì tiếp.",
      "Claim về performance, security, AI capability hoặc market trend vượt khỏi evidence."
    ],
    gates: [
      "Có thesis rõ, heading hierarchy sạch, metadata/slug/schema đúng và internal link hợp lý.",
      "Strong claim phải được source, demo, code, benchmark hoặc caveat nâng đỡ.",
      "Giọng viết giữ bình tĩnh, sắc bén, không hype và không sales."
    ]
  },
  "prompt-writing": {
    role: "Thiết kế prompt như một typed interface chịu được ambiguity, prompt injection, tool use và downstream parsing.",
    heuristics: [
      "Tách authority layers: system, developer, user task, retrieved evidence, examples và untrusted payload.",
      "Định nghĩa prompt bằng contract: input, precondition, allowed tools, output schema, validation, error và fallback.",
      "Dùng examples để khóa intent; dùng counterexamples để khóa thứ không được làm."
    ],
    failureModes: [
      "Prompt dài nhưng không binding vì thiếu acceptance criteria, negative constraints, schema examples và eval cases.",
      "Untrusted content có thể đổi role, tool boundary, safety policy, source hierarchy hoặc output format.",
      "Output nhìn đúng nhưng không machine-parse được vì schema không nói rõ optional/null/error state."
    ],
    gates: [
      "Prompt pack phải có adversarial tests, malformed-input tests và schema validation.",
      "Không yêu cầu private chain-of-thought; chỉ yêu cầu rationale/evidence/checks ngắn.",
      "Structured output có valid/invalid examples và recovery path."
    ]
  },
  "status-report": {
    role: "Viết như operator cho lãnh đạo cần hiểu risk, decision và path-to-green trong dưới một phút.",
    heuristics: [
      "Tách activity khỏi value shipped, risk retired, decision unblocked và customer/system impact.",
      "Dùng leading indicators để phát hiện drift trước khi lagging metric xấu đi.",
      "Escalation tốt phải nói consequence of no decision, không chỉ báo rằng có blocker."
    ],
    failureModes: [
      "Green status che scope creep, dependency drift, quality debt hoặc blocker không owner.",
      "Metric đúng nhưng không actionable vì không gắn với decision hoặc threshold.",
      "Update kể nhiều việc đã làm nhưng không trả lời project khỏe hay không."
    ],
    gates: [
      "Mỗi blocker có owner, next action, due date, impact và escalation threshold.",
      "Health status có rationale một câu và thay đổi so với update trước.",
      "Decision ask có recommendation, fallback và deadline."
    ]
  },
  "doc-spec-tech-spec": {
    role: "Viết như RFC owner phải tạo được consensus trước khi code bắt đầu.",
    heuristics: [
      "Non-goals phải sắc như goals; phần không loại trừ rõ sẽ trở thành scope debt.",
      "Phân loại decision: two-way door cần tốc độ, one-way door cần evidence và sign-off.",
      "Spec tốt phải nối product intent với NFRs, data model, threat model, rollout và verification."
    ],
    failureModes: [
      "Spec mô tả solution nhưng không chứng minh problem, user impact hoặc operational constraint.",
      "Migration, privacy, observability, compatibility và rollback bị đẩy sang implementation lúc chi phí đã cao.",
      "Alternative section yếu nên reviewer không thấy vì sao hướng được chọn là tốt nhất trong constraints."
    ],
    gates: [
      "Có alternatives, trade-off matrix, risk register, test matrix, rollout/rollback plan.",
      "Open question có owner, decision date và impact nếu chưa resolve.",
      "Production-data change phải có migration choreography và recovery procedure."
    ]
  },
  "proposal-slide-pitch": {
    role: "Giao tiếp như executive operator biến ambiguity thành investment case có thể quyết định ngay.",
    heuristics: [
      "Dịch feature thành business levers: revenue, cost, risk, cycle time, resilience, compliance hoặc option value.",
      "Viết cho nhiều lens cùng lúc: CFO nhìn ROI, CTO nhìn feasibility/risk, Product nhìn adoption, Ops nhìn execution.",
      "Đặt ask sớm; deck giấu decision sẽ buộc stakeholder tự suy diễn."
    ],
    failureModes: [
      "Proposal thuyết phục nhưng không fundable vì thiếu owner, budget, timeline, risk và success metric.",
      "Technical win được kể bằng jargon nên mỗi stakeholder nghe thành một proposal khác nhau.",
      "Không prewire objection về cost, adoption, timing, opportunity cost và delivery risk."
    ],
    gates: [
      "Có one-sentence thesis, decision request, quantified impact model và fallback path.",
      "Objection matrix bao phủ cost, risk, timing, feasibility, adoption và opportunity cost.",
      "Success metric đo được sau launch, không chỉ là output đã ship."
    ]
  },
  "ai-operating-system": {
    role: "Thiết kế như AI systems architect xây workflow đáng tin, không chỉ sưu tầm prompt.",
    heuristics: [
      "Route theo task physics: retrieval, reasoning, coding, validation, UI verification, state mutation và synthesis là các job khác nhau.",
      "Xem context như supply chain: provenance, freshness, trust level, compression, redaction và exclusion đều quan trọng.",
      "Đặt validation layer trước khi orchestration phức tạp; multi-agent không tự tạo correctness."
    ],
    failureModes: [
      "Nhiều agent làm tăng latency và contradiction nhưng không có owner, schema hoặc arbitration rule.",
      "Agent có tool access quá rộng rồi vượt qua privacy, filesystem, app account hoặc production boundary.",
      "Memory/RAG chứa source cũ hoặc untrusted text nhưng được đưa vào prompt như instruction đáng tin."
    ],
    gates: [
      "Mỗi agent có role, inputs, tools, write boundary, output schema và verification owner.",
      "Critical workflow có secondary review, deterministic checks và human approval gates.",
      "Routing matrix nói rõ model nào dùng cho việc gì, vì sao và khi nào fallback."
    ]
  },
  "daily-ai-learning-coach": {
    role: "Coach như người thiết kế deliberate practice để AI fluency compound thành judgment, không thành tool-hopping.",
    heuristics: [
      "Luyện một micro-skill mỗi lần: task slicing, source grounding, diff review, eval design hoặc architecture critique.",
      "Dùng retrieval practice, interleaving và spaced repetition để biến kiến thức thành reflex.",
      "Practice trên work artifact thật để feedback có cost và context."
    ],
    failureModes: [
      "Xem video, đọc thread hoặc đổi tool liên tục nhưng không tạo artifact hay behavior mới.",
      "Outsource suy nghĩ cho AI nên tốc độ tăng nhưng mental model yếu đi.",
      "Học quá rộng khiến không có transfer từ bài tập sang task production."
    ],
    gates: [
      "Mỗi session có input thật, expected output, feedback prompt và saved artifact.",
      "Có active recall card hoặc checklist để dùng lại trong tuần.",
      "Đo value bằng bug tránh được, decision rõ hơn, time saved hoặc artifact reused."
    ]
  },
  "notebooklm-source-of-truth": {
    role: "Làm như knowledge analyst bảo vệ source fidelity, citation granularity và explicit unknowns.",
    heuristics: [
      "Xếp hạng source theo trust, date, authority, directness và conflict potential.",
      "Tách claim, evidence, inference và caveat để tránh biến synthesis thành hallucination có citation.",
      "Dùng contradiction matrix khi nhiều tài liệu nói khác nhau về cùng entity, metric hoặc decision."
    ],
    failureModes: [
      "Citation gắn với đoạn có liên quan lỏng lẻo nhưng không support claim chính.",
      "Source cũ bị dùng như hiện tại, nhất là policy, pricing, API behavior, legal hoặc org ownership.",
      "Tổng hợp mượt làm mất unknowns, caveats và boundary của corpus."
    ],
    gates: [
      "Fact claim có source/date/confidence; inference phải được label rõ.",
      "Nếu corpus không có câu trả lời, ghi not provided in the source.",
      "Sensitive docs được redaction trước khi đưa vào output public."
    ]
  },
  "ai-delivery-factory": {
    role: "Điều phối như delivery lead giữ con người sở hữu requirement, risk và release judgment trong khi AI tăng tốc execution.",
    heuristics: [
      "Tách roles: spec writer, implementer, reviewer, tester, release owner và post-launch observer.",
      "Mỗi implementation slice phải có verification command hoặc observable artifact.",
      "Review staged diff như supply-chain artifact: secrets, generated output, unrelated changes, analytics và migration risk."
    ],
    failureModes: [
      "Agent ship nhanh nhưng thiếu acceptance criteria nên đúng code mà sai product behavior.",
      "AI-generated tests assert implementation detail thay vì user-visible contract.",
      "Commit lẫn runtime files, local metadata, generated build output hoặc unrelated user changes."
    ],
    gates: [
      "Có scope, non-goals, changed-file summary, verification evidence và residual risk.",
      "Commit/PR dùng Conventional Commit và mô tả impact, test, deployment/rollback.",
      "Production mutation hoặc deploy chỉ làm khi user đã explicit request."
    ]
  },
  "claude-deep-review": {
    role: "Review như adversarial architect tìm assumption yếu nhất trước khi nó thành incident.",
    heuristics: [
      "Decompose actors, trust boundaries, state transitions, dependency graph và failure domains.",
      "Dùng FMEA, STRIDE, pre-mortem và counterfactual để hỏi design vỡ ở đâu.",
      "So proposed path với simpler, safer, cheaper, more reversible alternatives."
    ],
    failureModes: [
      "Critique nghe sắc nhưng không đưa mitigation nhỏ nhất để giảm risk.",
      "Review chỉ nhìn code/proposal mà bỏ qua operator error, stale cache, clock skew, network partition và malicious user.",
      "Weak language như probably, should, likely che assumption chưa chứng minh."
    ],
    gates: [
      "Mỗi critical risk có failure narrative, blast radius, detection và mitigation.",
      "Go/No-Go recommendation có evidence threshold.",
      "Assumption quan trọng có test, metric, owner hoặc explicit decision."
    ]
  },
  "career-ai-strategy": {
    role: "Tư vấn như Staff/Principal career strategist tối ưu asymmetric leverage và evidence nhìn thấy được.",
    heuristics: [
      "Định nghĩa career thesis: market problem nào mình giải tốt hơn nhờ technical depth, product sense và AI fluency.",
      "Chọn bets theo option value: artifact reusable, audience rõ, feedback nhanh và upside lớn.",
      "Biến work thật thành proof: ADR, postmortem, tooling, writing, talk, mentorship và metric before/after."
    ],
    failureModes: [
      "Tối ưu title hoặc tool stack thay vì scope, judgment và outcomes.",
      "Portfolio nhiều activity nhưng thiếu narrative về problem, trade-off, impact và learning.",
      "AI usage rộng nhưng không chứng minh quality, speed, leverage hoặc better decisions."
    ],
    gates: [
      "90-day plan có outcomes, rituals, artifacts, stakeholders và weekly feedback loop.",
      "Capability matrix tách depth, breadth, communication, leadership, AI fluency và business judgment.",
      "Mỗi asset có target audience và reuse path."
    ]
  },
  "engineering-decision-map": {
    role: "Map quyết định như systems thinker nối requirement, invariant, architecture option và operational consequence.",
    heuristics: [
      "Extract invariants trước khi brainstorm solution: users, money, permissions, data, compliance và support.",
      "Dùng weighted decision matrix nhưng ghi rõ weight đến từ business priority nào.",
      "Xem reversibility như tài sản: option dễ rollback có thể thắng option tối ưu nhưng brittle."
    ],
    failureModes: [
      "Decision bị kéo bởi công nghệ thú vị thay vì invariant và team fit.",
      "Matrix cho điểm nhưng không có threshold, assumption hoặc sensitivity analysis.",
      "Bỏ qua support workflow, incident handling và migration path nên design chỉ đẹp trên diagram."
    ],
    gates: [
      "Có requirement-to-architecture map và rejected alternatives.",
      "Risk register bao gồm detection, mitigation, rollback và owner.",
      "Breaking point của design được nói rõ, không hứa scale vô hạn."
    ]
  },
  "staff-engineer-ai-review-pack": {
    role: "Audit như Staff Engineer chịu trách nhiệm production readiness ở ranh giới product, architecture, security, data, SRE và QA.",
    heuristics: [
      "Review theo lens độc lập rồi tổng hợp: Product, Architecture, Security/Privacy, Data, SRE, QA, Rollout.",
      "Phân biệt hard blocker, launch condition, accepted risk và follow-up debt.",
      "Ưu tiên blast radius reduction hơn optics của timeline."
    ],
    failureModes: [
      "PRR checklist đầy đủ nhưng không có owner hoặc evidence cho từng launch condition.",
      "Big-bang rewrite thiếu strangler path, compatibility bridge, backfill/reconciliation và rollback.",
      "SLO, dashboard, alert, runbook và on-call load được bàn sau khi go-live."
    ],
    gates: [
      "Có cross-functional risk matrix và Go/No-Go recommendation.",
      "Launch condition có owner, verification signal và deadline.",
      "Không approve nếu data integrity, privacy hoặc rollback chưa rõ."
    ]
  },
  "data-resilience-observability-review": {
    role: "Review như SRE/Data Reliability engineer giả định network, clock, queue, cache và third-party đều có thể fail.",
    heuristics: [
      "Đánh giá consistency, idempotency, ordering, replay, deduplication và reconciliation trước throughput.",
      "Thiết kế telemetry theo RED/USE, correlation ID, trace span, SLO burn rate và actionable alerts.",
      "Recovery phải được test: backup restore, point-in-time recovery, data repair và rollback script."
    ],
    failureModes: [
      "Alert nhiều nhưng không actionable, gây alert fatigue và che incident thật.",
      "Cache invalidation thiếu contract nên stale read thành data integrity bug.",
      "Queue lag, poison message, hot partition hoặc out-of-order event không có detection."
    ],
    gates: [
      "Có failure-mode matrix với detection, mitigation và runbook.",
      "RPO/RTO, backup restore và rollback/recovery triggers rõ.",
      "Không log PII, secret, token hoặc sensitive payload."
    ]
  },
  "installed-skill-library-cartographer": {
    role: "Làm như taxonomy architect biến hàng nghìn skill cài rải rác thành capability map dùng được.",
    heuristics: [
      "Deduplicate theo content hash, normalized name và source family vì cache/plugin tạo rất nhiều bản sao.",
      "Giữ provenance ở mức capability, không public local paths, username hoặc private workspace details.",
      "Merge playbook trùng nhau thành canonical skills có trigger, context, process, output và guardrails."
    ],
    failureModes: [
      "Copy nguyên marketplace/cache content làm library phình to nhưng routing kém.",
      "Đếm số skill như quality signal trong khi duplicate và stale versions chiếm phần lớn corpus.",
      "Taxonomy quá rộng nên AI agent không biết khi nào chọn skill nào."
    ],
    gates: [
      "Inventory có raw count, unique content, unique names và runtime coverage ở dạng aggregate.",
      "Gap analysis so current Studio library dẫn tới add/merge/remove rõ.",
      "Final copy không lộ path, token, private repo, customer data hoặc vendor-specific noise."
    ]
  },
  "ai-product-evaluation": {
    role: "Đánh giá như AI Product/Eval Lead đưa feature từ demo đẹp tới product đáng tin.",
    heuristics: [
      "Định nghĩa product promise và non-goals trước model choice; eval phải đo promise đó.",
      "Xây eval pyramid: golden tasks, adversarial prompts, regression suite, human rubric và production telemetry.",
      "Theo dõi quality/cost cùng lúc: task success, hallucination, tool-call accuracy, citation fidelity, latency và token spend."
    ],
    failureModes: [
      "Demo success nhờ curated prompt nhưng real users có messy input, missing context và conflicting sources.",
      "Evals quá nhỏ hoặc quá synthetic nên không bắt được retrieval drift, prompt injection và silent degradation.",
      "Trust UX che uncertainty khiến user hiểu nhầm output là authoritative."
    ],
    gates: [
      "Có acceptance thresholds, guardrail metrics, red-team cases và model/provider rollback.",
      "Write actions cần permission boundary, audit log, undo/escalation và human approval khi risk cao.",
      "Telemetry phải phân biệt quality issue, retrieval issue, tool issue và user-abandonment."
    ]
  },
  "agent-tools-mcp-automation": {
    role: "Thiết kế như automation architect cho agents dùng tools có schema, permission, audit và recovery rõ.",
    heuristics: [
      "Resolve IDs bằng read step trước write step; tên người, channel, folder hoặc issue title không đủ để mutate state.",
      "Phân loại action: read-only, draft, reviewed write, immediate write, scheduled, destructive hoặc external publish.",
      "Batch chỉ khi calls độc lập; pagination phải chạy tới completeness nếu user cần toàn bộ kết quả."
    ],
    failureModes: [
      "Tool call đúng schema nhưng sai account, sai mailbox, sai timezone hoặc sai target ID.",
      "Long workflow không checkpoint nên partial failure không thể resume hoặc audit.",
      "Agent tóm tắt kết quả nhưng không verify returned state với requested state."
    ],
    gates: [
      "Mọi write/destructive action có explicit approval hoặc draft-first path.",
      "Execution note lưu app, action, permission level, artifact/source link và failure/retry state.",
      "Không bịa tool slug, API field, account ID, channel ID, folder ID hoặc file ID."
    ]
  },
  "product-analytics-growth": {
    role: "Làm như product analytics/growth lead nối instrumentation với decision, không chỉ dashboard.",
    heuristics: [
      "Mỗi event tồn tại vì một decision; nếu metric move/không move mà không đổi hành động thì đó là vanity.",
      "Thiết kế identity, property taxonomy, source surface và event versioning trước khi analyze funnel.",
      "Experiment cần primary metric, guardrails, SRM check, sample size, ramp plan và stop condition."
    ],
    failureModes: [
      "Event drift: cùng một hành vi được track bằng nhiều tên/properties khác nhau qua thời gian.",
      "Identity contamination làm cohort, attribution và retention sai nhưng dashboard vẫn đẹp.",
      "A/B test bị kết luận quá sớm hoặc thiếu guardrail metrics nên tăng conversion nhưng hại quality."
    ],
    gates: [
      "Tracking plan có event, properties, owner, surface và privacy constraint.",
      "Dashboard spec nói rõ decision, baseline, segment và confidence.",
      "Không phá Do Not Track, disabled autocapture/session recording hoặc consent choices."
    ]
  },
  "research-market-intelligence": {
    role: "Nghiên cứu như analyst phân biệt evidence hierarchy, incentives, freshness và confidence.",
    heuristics: [
      "Bắt đầu bằng decision question; research không có decision sẽ dễ thành collection notes.",
      "Ưu tiên primary sources, so date, kiểm author incentive và label source trust.",
      "Dùng Bayesian update: evidence mới làm tăng/giảm confidence thế nào, chưa đủ thì cần experiment gì."
    ],
    failureModes: [
      "Secondhand/outdated claim được trình bày như current market fact.",
      "Competitor analysis chỉ liệt kê feature mà không phân tích positioning, pricing power, wedge và switching cost.",
      "Research mượt nhưng che contradictions, unknowns và weak signals."
    ],
    gates: [
      "Evidence table có source, date, claim, caveat và confidence.",
      "Synthesis tách facts, inferences, speculation và recommended next experiment.",
      "High-stakes/current claims phải verify bằng source mới và primary khi có thể."
    ]
  },
  "security-privacy-threat-modeling": {
    role: "Audit như security/privacy architect nhìn abuse economics, trust boundaries và blast radius.",
    heuristics: [
      "Map assets, actors, data flows, trust boundaries và privilege transitions trước khi list vulnerabilities.",
      "Chạy STRIDE cho security và LINDDUN cho privacy; AI context cũng là data-flow surface.",
      "Đánh giá exploitability qua preconditions, attacker capability, detection, blast radius và compensating controls."
    ],
    failureModes: [
      "Generic sanitize input advice không chỉ ra exact sink, encoder, validator hoặc boundary.",
      "IDOR/tenant isolation leak xảy ra ở query layer dù route đã auth.",
      "Logs, analytics properties, prompt context hoặc support tooling vô tình chứa PII/secret."
    ],
    gates: [
      "Finding có severity, affected location, exploit path, impact và fix/verification cụ thể.",
      "Sensitive-data flow có minimization, retention, deletion, audit và rollback story.",
      "Không approve write-capable AI/tooling nếu thiếu permission boundary và audit trail."
    ]
  },
  "design-system-ui-craft": {
    role: "Thiết kế như product UI craft lead ưu tiên workflow thật, state coverage, accessibility và visual hierarchy.",
    heuristics: [
      "Bắt đầu từ repeated workflow, scan pattern, decision load và error recovery của user.",
      "Dùng tokens/component library hiện có trước; nếu phá pattern phải có lý do UX rõ.",
      "Thiết kế cho content thật: long label, empty list, dense data, mobile, hover/focus/disabled/loading/error."
    ],
    failureModes: [
      "UI đẹp như mock nhưng không có state matrix, keyboard path, focus management hoặc contrast đủ.",
      "Card/gradient/decorative layer che mất job chính của tool hoặc dashboard.",
      "Text overflow, layout shift hoặc icon-only control không tooltip làm experience thiếu polished."
    ],
    gates: [
      "Có component/state inventory và responsive verification.",
      "Không có overlap, truncation vô lý, inaccessible focus trap hoặc mobile break.",
      "Interaction quan trọng có analytics event theo convention hiện có."
    ]
  },
  "mobile-platform-engineering": {
    role: "Review như mobile platform lead chịu trách nhiệm lifecycle, device fragmentation, performance và app-store release.",
    heuristics: [
      "Thiết kế theo lifecycle: cold start, background/foreground, permission denial, offline, deep link và state restoration.",
      "Device matrix phải phản ánh OS versions, screen sizes, Dynamic Type, TalkBack/VoiceOver và low-memory behavior.",
      "Release plan gồm signing, provisioning, privacy labels, crash monitoring, phased rollout và rollback/kill switch."
    ],
    failureModes: [
      "Simulator xanh nhưng device thật lag, crash do memory, gesture conflict hoặc permission edge case.",
      "Network/offline state thiếu retry/backoff/cache nên mobile UX vỡ ngoài văn phòng.",
      "Store metadata/privacy declaration không khớp behavior nên bị reject hoặc tạo compliance risk."
    ],
    gates: [
      "Có test matrix across devices/OS và evidence từ device hoặc lý do rõ nếu chỉ simulator.",
      "Startup, scroll, image memory, battery/network usage và crash-free signal được theo dõi.",
      "Accessibility và privacy declaration không bị xem như post-release chore."
    ]
  },
  "data-ml-science-workflow": {
    role: "Làm như data/ML scientist thận trọng về provenance, leakage, uncertainty và reproducibility.",
    heuristics: [
      "Định nghĩa hypothesis và decision trước notebook; analysis không thể chứng minh mọi thứ.",
      "Audit provenance: source, license, freshness, sampling bias, missingness, schema drift, leakage và sensitive fields.",
      "Đánh giá bằng baseline, confidence interval, calibration, ablation, error analysis và OOD checks."
    ],
    failureModes: [
      "Train/test leakage hoặc temporal leakage làm model nhìn tốt nhưng fail trong production.",
      "Correlation được kể như causality dù thiếu identification strategy hoặc experiment design.",
      "Notebook phụ thuộc state ẩn, seed không cố định, data version không rõ nên không reproduce được."
    ],
    gates: [
      "Có data dictionary, reproducible environment, seed, versioned inputs và assumption log.",
      "Findings có uncertainty, caveats, failed approaches và domain sanity checks.",
      "Không expose medical, financial, proprietary hoặc sensitive data trong public artifacts."
    ]
  }
};

const vietnameseChecklistCopies: Record<string, LocalizedChecklistCopy> = {
  "ticket-intake-to-start": {
    title: "Từ ticket đến commit đầu tiên",
    summary: "Checklist biến ticket thành scope, context, plan và bước implementation đầu tiên.",
    whenToUse: "Dùng trước khi code một task đến từ product, support, design hoặc engineer khác.",
    tags: ["Ticket", "Scope", "Bắt đầu làm"]
  },
  "ai-driven-engineering-foundation-roadmap": {
    title: "Roadmap nền tảng engineering thời AI",
    summary: "Roadmap nhiều lớp để xây senior engineering judgment trong thời AI.",
    whenToUse: "Dùng hằng ngày trước hoặc sau việc kỹ thuật, nhất là task chạm architecture, data, reliability hoặc rollout.",
    tags: ["Engineering foundation", "Architecture", "Production"]
  },
  "engineering-delivery-checklist": {
    title: "Checklist delivery engineering",
    summary: "Checklist tám phase từ intake đến post-rollout review.",
    whenToUse: "Dùng khi task có thể ảnh hưởng architecture, data, traffic, user, production operation hoặc handoff.",
    tags: ["Task", "Delivery", "Rollout"]
  },
  "senior-engineer-reflex": {
    title: "Senior engineer reflex",
    summary: "Bộ câu hỏi compact cho mọi feature: business, product, domain, API, data, consistency, resilience, security, observability và rollout.",
    whenToUse: "Dùng trước implementation khi task nhìn có vẻ đơn giản nhưng có thể ẩn risk production, data hoặc user.",
    tags: ["Senior reflex", "Câu hỏi", "Risk"]
  },
  "capstone-production-project": {
    title: "Capstone production project",
    summary: "Lab dài hạn mô phỏng e-commerce, subscription hoặc booking để gom architecture, data, resilience, event và observability.",
    whenToUse: "Dùng như lab thực chiến để biến roadmap thành evidence và năng lực engineering có thể nhìn thấy.",
    tags: ["Capstone", "Practice", "Portfolio"]
  },
  "module-creation": {
    title: "Tạo module mới",
    summary: "Checklist thêm route, feature module, service module hoặc reusable component mà không leak responsibility.",
    whenToUse: "Dùng khi thêm một feature surface hoặc reusable module mới.",
    tags: ["Module", "Architecture", "Frontend", "Backend"]
  },
  "ai-system-engineering-roadmap": {
    title: "AI system engineering roadmap",
    summary: "Checklist học hằng ngày cho SDLC ownership, distributed architecture, storage systems và AI-assisted engineering review.",
    whenToUse: "Dùng như bản đồ up-skill AI hằng ngày khi mục tiêu là ra quyết định kỹ thuật tốt hơn, không chỉ code nhanh hơn.",
    tags: ["AI up-skill", "System engineering", "Distributed systems", "Storage", "SDLC"]
  },
  "release-readiness": {
    title: "Release readiness",
    summary: "Checklist quyết định một change đã đủ sẵn sàng để rời branch hay chưa.",
    whenToUse: "Dùng trước khi merge, tag hoặc chuẩn bị production deployment.",
    tags: ["Release", "QA", "Merge"]
  },
  "rollout-plan": {
    title: "Kế hoạch rollout",
    summary: "Checklist đưa code đã merge tới production adoption có guardrails.",
    whenToUse: "Dùng cho staged release, feature flag, customer cohort, migration hoặc UI change có impact lớn.",
    tags: ["Rollout", "Feature flag", "Monitoring"]
  },
  "daily-ai-learning-loop": {
    title: "Vòng học AI hằng ngày",
    summary: "Một loop ngắn mỗi ngày: một practice hữu ích, một artifact được lưu và một review.",
    whenToUse: "Dùng mỗi sáng và tối khi muốn compound AI skill đều mà không quá tải ngày làm việc.",
    tags: ["Daily", "AI learning", "Habit"]
  },
  "weekly-ai-os-review": {
    title: "Weekly AI OS review",
    summary: "Review tuần cho công việc, học tập, tài chính, cuộc sống và workflow AI cần tích lũy.",
    whenToUse: "Dùng cuối tuần để biến việc dùng AI rời rạc thành hệ thống có thể dùng lại.",
    tags: ["Weekly review", "Life OS", "Career"]
  },
  "ai-tool-routing-decision-tree": {
    title: "Decision tree chọn AI tool",
    summary: "Checklist chọn NotebookLM, GPT, Claude, Codex hoặc Antigravity trước khi bắt đầu.",
    whenToUse: "Dùng khi task mơ hồ, lớn hoặc dễ rơi vào việc hỏi mọi AI tool cùng lúc.",
    tags: ["Tool routing", "Decision", "Guardrails"]
  },
  "ai-assisted-feature-workflow": {
    title: "Workflow feature có AI hỗ trợ",
    summary: "Workflow đầy đủ từ idea đến spec, implementation, review, rollout và knowledge archive.",
    whenToUse: "Dùng cho product hoặc engineering change có ý nghĩa, nơi nhiều AI tool có thể hỗ trợ mà không mất ownership.",
    tags: ["Feature", "GPT", "Claude", "Codex", "Antigravity"]
  },
  "ninety-day-ai-skill-plan": {
    title: "Kế hoạch nâng AI skill 90 ngày",
    summary: "Kế hoạch theo phase để biến AI tool thành practice hằng ngày, engineering leverage, career asset và personal OS.",
    whenToUse: "Dùng như quarterly roadmap để tăng AI literacy và biến stack hiện có thành leverage bền.",
    tags: ["90 ngày", "Roadmap", "AI literacy"]
  }
};

const vietnameseSectionCopies: Record<string, LocalizedSectionCopy> = {
  understand: { title: "Hiểu task", detail: "Đảm bảo đây là một vấn đề thật, không chỉ là một yêu cầu đổi UI hoặc đổi code." },
  prepare: { title: "Chuẩn bị trước khi làm", detail: "Giảm uncertainty trước khi mở rộng phạm vi đọc file." },
  execute: { title: "Bắt đầu implementation", detail: "Giữ thay đổi đầu tiên nhỏ, rõ và dễ review." },
  "code-design": { title: "Layer 1: Nền tảng thiết kế code", detail: "Xây codebase dễ test, refactor và dễ hướng dẫn AI mà không phá architecture." },
  "data-consistency": { title: "Layer 2: Data và consistency", detail: "Nhiều vấn đề production đến từ data model, migration, query hoặc consistency assumption yếu." },
  "distributed-resilience": { title: "Layer 3: Distributed systems và resilience", detail: "Dependency có thể fail nhưng hệ thống không nhất thiết phải sập dây chuyền." },
  "events-cqrs": { title: "Layer 4: Event-driven architecture, CQRS và Event Sourcing", detail: "Chỉ dùng event khi phù hợp domain và vận hành, không dùng vì nghe advanced." },
  "performance-observability": { title: "Layer 5: Performance, cache và production operation", detail: "Reliability cần signal trước rollout, không chỉ fix sau khi user than phiền." },
  intake: { title: "Phase 1: Intake", detail: "Hiểu vấn đề thật trước khi chọn shape kỹ thuật." },
  discovery: { title: "Phase 2: Discovery", detail: "Map hệ thống hiện tại trước khi thay đổi." },
  design: { title: "Phase 3: Design", detail: "So sánh option và chọn design đơn giản nhất xử lý đúng risk." },
  "implementation-plan": { title: "Phase 4: Implementation plan", detail: "Biến design thành các PR nhỏ có thể review." },
  "coding-review": { title: "Phase 5: Coding và review", detail: "Giữ implementation đúng boundary và behavior production." },
  "pre-rollout": { title: "Phase 6: Verification trước rollout", detail: "Chứng minh feature chịu được happy path và failure path." },
  rollout: { title: "Phase 7: Rollout", detail: "Release từng bước nhỏ và theo dõi user impact." },
  "post-rollout": { title: "Phase 8: Post-rollout", detail: "Biến delivery thành learning và system memory." },
  "business-product-domain": { title: "Business, product và domain", detail: "Nối implementation với outcome thật." },
  "api-data-consistency": { title: "API, data và consistency", detail: "Làm rõ contract và state change." },
  "resilience-security": { title: "Resilience và security", detail: "Giả định dependency và user có thể hành xử ngoài dự đoán." },
  "observability-rollout": { title: "Observability và rollout", detail: "Quyết định hệ thống chứng minh health bằng signal nào." },
  "feature-set": { title: "Product surface", detail: "Chọn domain buộc phải xử lý trade-off production thật." },
  "foundation-requirements": { title: "Foundation requirements", detail: "Chứng minh hệ thống có boundary và data decision rõ." },
  "resilience-events": { title: "Resilience và events", detail: "Practice failure path thể hiện senior judgment." },
  "production-requirements": { title: "Production requirements", detail: "Vận hành lab như một hệ thống thật, không chỉ demo." },
  boundary: { title: "Định nghĩa boundary", detail: "Một module nên có một lý do chính để thay đổi." },
  frontend: { title: "Frontend checks", detail: "Giữ UI ổn định, accessible và đo lường được." },
  backend: { title: "Backend checks", detail: "Làm rõ contract trước khi implementation detail lan rộng." },
  verification: { title: "Verification", detail: "Module chưa xong nếu sau này không thể thay đổi an toàn." },
  "sdlc-ownership": { title: "Pillar 1: SDLC ownership", detail: "Giữ ownership của con người rõ ràng trong khi AI tăng tốc implementation." },
  "distributed-resilience-advanced": { title: "Pillar 2: Distributed architecture và resilience", detail: "Học pattern giúp system đúng khi state, time và dependency trở nên phức tạp." },
  "storage-scale": { title: "Pillar 3: Large-scale storage", detail: "Xây trực giác về storage cho performance, availability và data evolution an toàn." },
  "ai-engineering-review": { title: "Pillar 4: Professional AI engineering workflow", detail: "Dùng AI như analyst, critic, test strategist và production reviewer, nhưng judgment cuối vẫn là của mình." },
  quality: { title: "Quality gate", detail: "Xác nhận change đúng, có test và review được." },
  risk: { title: "Risk gate", detail: "Làm release có thể rollback và quan sát được." },
  handoff: { title: "Handoff", detail: "Để lại đủ context cho reviewer và operator." },
  "during-rollout": { title: "Trong rollout", detail: "Đi từng bước nhỏ và theo dõi leading indicators." },
  "after-rollout": { title: "Sau rollout", detail: "Đóng loop thay vì chỉ ship code." },
  "morning-orientation": { title: "Định hướng buổi sáng", detail: "Chọn một practice AI phù hợp với việc thật trong ngày." },
  "workday-application": { title: "Áp dụng trong ngày làm việc", detail: "Học qua task thật thay vì chỉ xem tool." },
  "evening-review": { title: "Review buổi tối", detail: "Đóng loop khi context còn mới." },
  "capture-week": { title: "Capture tuần", detail: "Gom đủ fact để không review chỉ bằng trí nhớ." },
  "review-patterns": { title: "Review pattern", detail: "Tìm signal lặp lại, không chỉ task đã xong." },
  "plan-next-week": { title: "Plan tuần tới", detail: "Biến reflection thành operating plan nhỏ." },
  "choose-first-tool": { title: "Chọn tool đầu tiên", detail: "Bắt đầu bằng tool khớp với bottleneck chính." },
  safety: { title: "Safety guardrails", detail: "Bảo vệ secrets, production và judgment." },
  shape: { title: "Shape công việc", detail: "Dùng AI để clarify bài toán trước khi giao implementation." },
  "review-release": { title: "Review và release", detail: "Tách execution khỏi review và release judgment." },
  "week-one": { title: "Tuần 1: setup hệ thống", detail: "Tạo container trước khi tối ưu workflow." },
  "days-eight-thirty": { title: "Ngày 8-30: productivity công việc", detail: "Biến việc lặp lại thành playbook." },
  "days-thirty-one-sixty": { title: "Ngày 31-60: career leverage", detail: "Chuyển việc làm thành evidence và asset." },
  "days-sixty-one-ninety": { title: "Ngày 61-90: life, finance, future", detail: "Mở rộng operating system ra ngoài code." }
};

const vietnameseStepCopies: Record<string, LocalizedStepCopy> = {
  "read-ticket": { label: "Đọc ticket và restate mục tiêu trong một câu." },
  "identify-user": { label: "Xác định user, route, workflow hoặc system boundary bị ảnh hưởng." },
  acceptance: { label: "Tách acceptance criteria rõ ràng và đánh dấu phần còn thiếu." },
  impact: { label: "Kiểm tra ảnh hưởng product, SEO, analytics, locale, accessibility và privacy." },
  "find-patterns": { label: "Tìm pattern, test, helper và ownership boundary gần nhất." },
  "decide-scope": { label: "Tách must-have khỏi nice-to-have cleanup." },
  "plan-verification": { label: "Chọn command, screenshot hoặc manual check chứng minh task đã đúng." },
  "note-risk": { label: "Ghi assumption rủi ro nhất trước khi implement." },
  "small-diff": { label: "Bắt đầu bằng edit nhỏ nhất có thể review." },
  "update-tests": { label: "Thêm hoặc sửa test tại đúng boundary thay đổi behavior." },
  "update-tracking": { label: "Cập nhật PostHog khi thêm navigation, CTA, filter, form, preference hoặc route mới." },
  checkpoint: { label: "Checkpoint nếu scope hoặc risk thay đổi." },
  principles: { label: "Học SOLID, DRY, KISS, YAGNI, dependency direction và refactoring patterns." },
  architecture: { label: "Practice Clean Architecture, Hexagonal Architecture, Onion Architecture và Modular Monolith trước microservices." },
  ddd: { label: "Học DDD tactical patterns.", detail: "Entity, Value Object, Aggregate, Repository, Domain Service và Application Service." },
  patterns: { label: "Xây pattern catalog theo ngữ cảnh.", detail: "Creational, structural, behavioral, enterprise, integration, resilience và delivery patterns." },
  tests: { label: "Chọn testing layer đúng.", detail: "Unit, integration, contract, E2E, property-based, migration và rollback tests." },
  modeling: { label: "Học relational modeling, constraints, normalization, denormalization, multi-tenant data, soft delete và temporal data." },
  transactions: { label: "Hiểu ACID, isolation levels, locks, deadlocks và transaction boundaries." },
  indexes: { label: "Practice indexing bằng evidence.", detail: "B-tree, composite, covering, partial, expression, GIN, GiST, SP-GiST, BRIN và EXPLAIN ANALYZE." },
  migration: { label: "Thiết kế data migration và rollback trước khi code lands." },
  replication: { label: "Học replication và availability.", detail: "Primary-replica, async lag, read-after-write, failover, split brain, RPO, RTO và disaster recovery." },
  timeouts: { label: "Set timeout trước retry." },
  retry: { label: "Dùng bounded retry với exponential backoff và jitter khi operation an toàn." },
  "circuit-breaker": { label: "Hiểu Circuit Breaker sâu.", detail: "Closed, open, half-open, sliding windows, slow-call threshold, fallback và exception classification." },
  bulkhead: { label: "Dùng Bulkhead, rate limiting, throttling, backpressure, fallback và graceful degradation khi cần." },
  idempotency: { label: "Thiết kế idempotency, deduplication, distributed lock, DLQ và queue-based load leveling." },
  "event-types": { label: "So sánh direct API call, queue, pub/sub, log stream, Event Sourcing và CDC." },
  "event-sourcing": { label: "Học Event Sourcing sâu.", detail: "Domain event, event store, aggregate stream, append-only log, projection, snapshot, replay và event versioning." },
  cqrs: { label: "Hiểu CQRS flow.", detail: "Command, handler, aggregate, event, projection handler, read model và query." },
  outbox: { label: "Dùng Transactional Outbox, Inbox, Idempotent Consumer, Saga, DLQ, schema versioning và Anti-Corruption Layer khi vấn đề cần." },
  "avoid-overuse": { label: "Tránh Event Sourcing cho CRUD đơn giản hoặc team chưa vận hành được event schema/projection." },
  cache: { label: "Học cache-aside, read-through, write-through, write-behind, TTL, eviction, stampede, hot key, CDN và materialized view." },
  scale: { label: "Practice pagination, batch processing, async jobs, load tests và đo p50/p95/p99 latency." },
  otel: { label: "Dùng khái niệm OpenTelemetry.", detail: "Metrics, logs, traces, correlation ID, distributed tracing và spans." },
  slo: { label: "Học SLI, SLO, SLA, error budget, RED/USE metrics, alert, runbook, incident và postmortem." },
  "well-architected": { label: "Review operational excellence, security, reliability, performance efficiency, cost và sustainability." },
  business: { label: "Nêu business hoặc user problem và success metric." },
  scope: { label: "Clarify scope, out-of-scope, deadline, priority và affected users." },
  constraints: { label: "Kiểm tra dependency, security, privacy, legal, data migration, backward compatibility và production traffic impact." },
  questions: { label: "Nhờ AI đặt câu hỏi clarification theo business, product, data, API, security, reliability, rollout và observability." },
  flow: { label: "Xác định service, route, job, API, event, data store, owner và pattern hiện có." },
  history: { label: "Kiểm tra incident, bottleneck, dashboard, log và legacy constraint liên quan." },
  "risk-register": { label: "Nhờ AI tạo dependency map, impacted components, integration points, risk và missing information." },
  adr: { label: "Tạo ADR khi decision ảnh hưởng architecture, data, dependency hoặc rollout." },
  options: { label: "So sánh ít nhất ba option theo complexity, scalability, consistency, cost, migration, rollback và maintainability." },
  "technical-decisions": { label: "Quyết định sync/async, CRUD/CQRS/Event Sourcing, index, transaction boundary, cache, idempotency, retry, Circuit Breaker và security model." },
  slice: { label: "Chia việc theo backend, database, API contract, tests, observability, rollout và documentation." },
  compatibility: { label: "Plan migration, feature flag, backward-compatible API, monitoring, rollback và owner review." },
  "test-plan": { label: "Định nghĩa unit, integration, contract, E2E, load, security, migration và rollback checks." },
  boundaries: { label: "Kiểm tra architecture boundary, transaction boundary, validation, error handling và ownership." },
  "side-effects": { label: "Đảm bảo retry không tạo duplicate side effect và sensitive data không bị log." },
  review: { label: "Nhờ AI review như principal engineer về correctness, race, consistency, security, observability, performance, maintainability và rollback risk." },
  signals: { label: "Chuẩn bị dashboard, alert, runbook, rollback path và customer impact checks." },
  readiness: { label: "Nhờ AI tạo production readiness checklist với failure scenarios, monitoring, abort criteria, rollback và data validation." },
  "dark-launch": { label: "Deploy dark nếu có thể, rồi bật internal users trước canary." },
  monitor: { label: "Theo dõi success metric, error rate, latency, DB load, query plan, queue lag, cache hit/miss và support signal." },
  abort: { label: "Định nghĩa success criteria, abort criteria, rollback owner, communication plan và kill switch." },
  outcome: { label: "So sánh expected metrics với actual outcome, regression, incident, near miss và alert noise." },
  docs: { label: "Cập nhật docs, ADR, runbook, Studio checklist và follow-up tickets." },
  learning: { label: "Ghi lại lesson sau rollout để task sau bắt đầu tốt hơn." },
  product: { label: "Happy path, edge case, undo behavior, pending/failed state và audit need là gì?" },
  domain: { label: "Entity chính, aggregate boundary, state transition, invariant và domain event là gì?" },
  api: { label: "API sync hay async, có idempotency, versioning, pagination và backward compatibility không?" },
  data: { label: "Schema, migration, index, query scale, retention và PII concern là gì?" },
  consistency: { label: "Cần strong consistency hay eventual consistency, có race hoặc duplicate event không?" },
  dependency: { label: "Dependency nào có thể fail, chậm hoặc trả partial failure?" },
  protection: { label: "Timeout, retry, Circuit Breaker, fallback, rate limit và idempotency đã có chưa?" },
  security: { label: "Ai được dùng, authorization ra sao, input nào cần validate và dữ liệu nào không được log?" },
  release: { label: "Có feature flag, canary, abort criteria, rollback path, migration rollback và monitoring owner chưa?" },
  domains: { label: "Build user, catalog, cart, order, payment, inventory, notification, promotion, admin, audit và reporting flows." },
  evidence: { label: "Lưu ADR, diagram, test evidence, rollout notes và postmortem làm portfolio artifacts." },
  postgres: { label: "Model PostgreSQL tables, constraints, migrations, indexes, query plans và backup/restore." },
  payment: { label: "Build payment Saga với Circuit Breaker, fallback và duplicate-payment protection." },
  dashboard: { label: "Tạo dashboard request rate, errors, latency, DB latency, queue lag, cache hit rate, dependency failure và business metrics." },
  owner: { label: "Nêu module sở hữu gì và phụ thuộc gì." },
  inputs: { label: "Định nghĩa inputs, outputs và invalid states." },
  placement: { label: "Đặt file theo pattern có sẵn thay vì tạo folder style mới." },
  "public-api": { label: "Expose public API nhỏ và giữ internals private." },
  states: { label: "Cover UI states." },
  loading: { label: "Loading hoặc pending state." },
  empty: { label: "Empty state." },
  error: { label: "Error hoặc permission state." },
  mobile: { label: "Mobile và narrow viewport behavior." },
  tokens: { label: "Dùng token, icon, spacing và card rule có sẵn." },
  tracking: { label: "Thêm event cho page, CTA, filter, search, preference hoặc outbound khi cần." },
  a11y: { label: "Kiểm tra label, focus order, keyboard path và contrast." },
  contract: { label: "Document API/job contract và validation rules." },
  auth: { label: "Kiểm tra authorization, ownership và audit needs." },
  observability: { label: "Thêm logs, metrics, alerts và business events nếu user behavior thay đổi." },
  manual: { label: "Manual check workflow chính và một failure path." },
  screenshots: { label: "Đính kèm screenshot cho UI changes hoặc nói rõ vì sao không cần." },
  "ai-paradox": { label: "Theo dõi AI paradox.", detail: "Không merge code phức tạp do AI sinh nếu chưa hiểu mechanism và consequence production." },
  "productive-friction": { label: "Giữ productive friction trong workflow.", detail: "Dùng manual review, context-seeding và no-AI zones khi học hoặc onboarding." },
  "nine-phases": { label: "Review 9 phase SDLC.", detail: "Strategy, requirements, architecture, coding, QA, release, observability, maintenance và iteration." },
  "telemetry-layers": { label: "Map telemetry qua 8 layer.", detail: "Edge/network, service, application, data, Kubernetes, serverless/PaaS, CI/CD và incident response." },
  "event-sourcing-cqrs": { label: "Học Event Sourcing cộng CQRS như operational model.", detail: "Event store, aggregate stream, snapshot, projection, optimistic concurrency và read model rebuild." },
  "schema-evolution": { label: "Practice event schema evolution.", detail: "Tolerant deserialization, upcasting, versioned events và hot/warm/cold event storage." },
  "retry-composition": { label: "Compose retry trước Circuit Breaker có chủ ý.", detail: "Dùng bounded retry với backoff/jitter rồi ghi final outcome vào breaker." },
  "btree-lsm": { label: "So sánh B-Tree và LSM-Tree.", detail: "Read-heavy in-place update so với write-heavy append-only, compaction và Bloom filters." },
  "index-mastery": { label: "Master practical indexing.", detail: "Clustered, non-clustered, composite, covering index, leftmost prefix rule và index invalidation." },
  "replication-consensus": { label: "Học replication và consensus.", detail: "Sync, async, semi-sync, Raft/Multi-Paxos quorum, physical/logical replication và replication slots." },
  "sharding-transactions": { label: "Học sharding và distributed transactions.", detail: "Consistent hashing, virtual nodes, hotspot mitigation, 2PC trade-off và Saga." },
  "ai-elicitation": { label: "Nhờ AI clarify requirements trước implementation.", detail: "Group câu hỏi theo business, product, data, API, security, reliability, rollout và observability." },
  "adversarial-review": { label: "Chạy adversarial architecture review.", detail: "Challenge race condition, consistency bug, security gap, performance bottleneck và failure scenario." },
  "test-security": { label: "Tạo test và security matrix.", detail: "Unit, integration, contract, E2E, migration, rollback, static security checks và dependency failure paths." },
  "daily-artifact": { label: "Lưu một learning artifact mỗi ngày.", detail: "ADR, prompt, query plan, resilience note, rollout checklist, runbook hoặc postmortem lesson." },
  "feature-flag": { label: "Dùng feature flag hoặc staged path khi blast radius cao." },
  analytics: { label: "Xác nhận PostHog event vẫn fire và event mới đặt tên nhất quán." },
  rollback: { label: "Viết rollback steps và owner của quyết định." },
  summary: { label: "PR summary nêu behavior thay đổi và route bị ảnh hưởng." },
  "target": { label: "Định nghĩa target cohort: internal, beta, percentage, tenant hoặc geography." },
  flag: { label: "Xác nhận flag/config default và kill switch owner." },
  baseline: { label: "Ghi baseline metrics, conversion, error rate và support signal." },
  comms: { label: "Chuẩn bị release note, support note và owner escalation path." },
  phases: { label: "Roll out theo phase." },
  "phase-internal": { label: "Internal hoặc dogfood users." },
  "phase-beta": { label: "Small beta cohort." },
  "phase-percent": { label: "10%, 25%, 50%, rồi 100% nếu khỏe." },
  "phase-enterprise": { label: "Named tenants chỉ khi support đã sẵn sàng." },
  observe: { label: "Theo dõi errors, latency, conversion, PostHog events và support tickets." },
  pause: { label: "Pause rollout nếu chạm rollback trigger." },
  log: { label: "Log mỗi phase change với timestamp, owner và reason." },
  compare: { label: "So sánh post-rollout metrics với baseline." },
  cleanup: { label: "Gỡ stale flags, temporary code và support workaround." },
  learn: { label: "Ghi điều làm team bất ngờ." },
  "follow-up": { label: "Tạo follow-up ticket cho debt, docs và analytics gaps." },
  energy: { label: "Ghi energy hiện tại, obligations và open loops." },
  "top-three": { label: "Chọn top 3 outcomes cho ngày." },
  practice: { label: "Chọn một AI skill để practice.", detail: "Ví dụ: chia task cho Codex tốt hơn, Claude critique, NotebookLM source synthesis hoặc GPT decision framing." },
  "time-block": { label: "Giữ một time block nhỏ cho practice." },
  "route-tool": { label: "Route task tới đúng tool trước khi prompt." },
  "write-prompt": { label: "Viết prompt có role, goal, context, output và guardrails." },
  "save-artifact": { label: "Lưu một artifact.", detail: "Prompt, checklist, decision note, diff, screenshot hoặc lesson." },
  "avoid-noise": { label: "Dừng lại nếu AI loop rộng hơn task thật." },
  done: { label: "Liệt kê việc đã xong, chưa xong và lý do." },
  "tool-signal": { label: "Ghi tool AI nào giúp và chỗ nào gây nhiễu." },
  "prompt-improvement": { label: "Viết một cải tiến prompt cho ngày mai." },
  archive: { label: "Archive lesson vào NotebookLM, ChatGPT Project hoặc Studio." },
  work: { label: "Tóm tắt shipped work, PRs, blockers, incidents và team moments." },
  "life-finance": { label: "Ghi health, energy, finance, relationships và admin signals." },
  sources: { label: "Đưa docs/notes hữu ích vào NotebookLM khi cần source grounding." },
  "wins-losses": { label: "Viết wins, losses và điều thay đổi từ tuần trước." },
  avoidance: { label: "Nêu một quyết định hoặc cuộc trò chuyện đang bị né." },
  "ai-leverage": { label: "Xác định nơi AI tạo leverage và nơi tạo rework." },
  "hard-truth": { label: "Viết một hard truth ảnh hưởng tuần tới." },
  priorities: { label: "Chọn top 5 priorities cho tuần tới." },
  "one-workflow": { label: "Chọn một AI workflow để cải thiện có chủ ý." },
  "one-artifact": { label: "Commit một artifact nhìn thấy được.", detail: "Blog draft, RFC, automation demo, checklist hoặc portfolio note." },
  "one-boundary": { label: "Đặt một boundary để bảo vệ attention và data safety." },
  source: { label: "Nếu câu trả lời phải dựa trên docs/notes upload, bắt đầu bằng NotebookLM." },
  research: { label: "Nếu cần web research nhiều nguồn, bắt đầu bằng GPT Deep Research." },
  decision: { label: "Nếu là strategy, planning hoặc trade-off analysis, bắt đầu bằng GPT." },
  critique: { label: "Nếu cần critique sâu, architecture review hoặc sensitive writing, bắt đầu bằng Claude." },
  repo: { label: "Nếu task đổi code trong repo, bắt đầu bằng Codex hoặc Claude Code." },
  prototype: { label: "Nếu task cần UI/browser verification hoặc prototype end-to-end, bắt đầu bằng Antigravity." },
  brief: { label: "Viết brief ngắn: goal, constraints, sources, acceptance criteria và guardrails." },
  "execute-review": { label: "Cho một AI execute và AI khác review khi quality risk đáng kể." },
  artifact: { label: "Yêu cầu artifact có thể inspect.", detail: "Diff, checklist, report, screenshot, decision matrix hoặc test evidence." },
  redact: { label: "Redact secrets, private keys, customer data và sensitive company details." },
  "no-destructive": { label: "Không để agent chạy destructive command hoặc production migration nếu chưa review rõ." },
  "human-decision": { label: "Giữ medical, legal, financial và production-risk decisions cho human owner." },
  "gpt-prd": { label: "Nhờ GPT tạo problem statement, user stories, acceptance criteria, non-goals, risks, rollout và test plan." },
  "claude-review": { label: "Nhờ Claude challenge architecture, assumptions, failure modes và minimum viable scope." },
  codex: { label: "Dùng Codex cho repo tasks có tests, clean diff, refactor, migration và PR-ready work." },
  antigravity: { label: "Dùng Antigravity cho UI-heavy prototype, browser verification, screenshot và end-to-end artifact." },
  "ai-review": { label: "Dùng Claude hoặc GPT review diff về correctness, security, edge cases, test gaps và migration risk." },
  "human-review": { label: "Human owner review trade-off và quyết định merge cuối." },
  "release-note": { label: "Dùng GPT cho release note, stakeholder update và rollout checklist." },
  projects: { label: "Tạo năm ChatGPT Projects.", detail: "PhongOS, Engineering Leadership, Finance & Investment, Learning & Research, Writing / Personal Brand." },
  notebooks: { label: "Tạo năm NotebookLM notebooks.", detail: "Career Archive, Finance Library, Learning AI/Systems, Life Archive, Work Knowledge Base." },
  templates: { label: "Lưu prompt templates cho Codex, Claude, Antigravity, NotebookLM và GPT." },
  logs: { label: "Tạo decision_log, career_roadmap, finance_snapshot và folder AI Operating System." },
  "pr-review": { label: "Tạo PR review playbook." },
  incident: { label: "Tạo incident và postmortem workflow." },
  feature: { label: "Tạo workflow từ feature spec đến implementation." },
  ship: { label: "Ship một AI-assisted feature và một refactor hoặc test improvement." },
  portfolio: { label: "Draft evidence cho Staff Engineer portfolio." },
  writing: { label: "Draft ba bài technical writing." },
  "internal-proposal": { label: "Viết một internal proposal về AI-assisted engineering workflow." },
  demo: { label: "Build một demo automation bằng Codex hoặc Antigravity." },
  finance: { label: "Tạo finance dashboard và investment checklist." },
  "career-strategy": { label: "Tạo career strategy 3 năm với ba scenario." },
  "learning-roadmap": { label: "Tạo 12-month learning roadmap và weekly review habit ổn định." }
};

const vietnameseRoadmapCopies: Record<string, LocalizedRoadmapTopicCopy> = {
  architecture: {
    title: "Source & Architecture",
    tagline: "Cấu trúc code để chịu được growth, team và thay đổi.",
    cadence: "Mỗi ngày một bài architecture trong 30 ngày.",
    entries: [
      "Boundary module trước tên folder",
      "Service nhỏ vẫn cần architecture",
      "Dependency direction bằng ngôn ngữ đơn giản",
      "Khi shared library trở thành shared pain",
      "Ports and adapters trong một product nhỏ",
      "Clean Architecture không cần ceremony nặng",
      "Feature folders hay layer folders",
      "Tách một component lớn sao cho an toàn",
      "Architecture diagram đầu tiên thật sự hữu ích",
      "Vì sao data ownership thay đổi mọi thứ",
      "Event-driven architecture không hype",
      "Timeout, retry và cái giá của hy vọng",
      "Cache là contract, không phải thủ thuật",
      "Scale database theo đúng thứ tự",
      "Cái giá ẩn của microservices",
      "Checklist sức khỏe cho practical monolith",
      "API contract biết già đi cùng hệ thống",
      "Observability như một design choice",
      "Chọn boundary theo tốc độ thay đổi",
      "Architecture decision cho teammate tương lai",
      "Refactor về một core rõ hơn",
      "Khi queue giúp ích và khi queue che giấu delay",
      "CQRS chỉ sau khi model đơn giản bắt đầu đau",
      "Resilience patterns cho team bình thường",
      "Checklist ngày đầu cho service mới",
      "Đặt tên theo responsibility",
      "Architecture review trước khi rewrite",
      "Technical debt xuất hiện thế nào trong handoff",
      "Giữ diagram gần với code",
      "Con đường bình tĩnh từ messy đến maintainable"
    ]
  },
  culture: {
    title: "Engineering Culture",
    tagline: "Review, feedback, mentorship và team giúp con người phát triển.",
    cadence: "Mỗi ngày một bài culture trong 30 ngày.",
    entries: [
      "Code review như shared thinking",
      "Disagree mà không làm chậm team",
      "Pull request khiến reviewer tin tưởng",
      "Feedback vẫn giữ cánh cửa mở",
      "Mentor mà không giành bàn phím",
      "Kind engineering vẫn cần standards",
      "Chi phí âm thầm của ownership mơ hồ",
      "Junior học từ decision được nhìn thấy",
      "Cách hỏi help tốt hơn",
      "Khi senior engineer nên viết ít code hơn",
      "Team ritual xứng đáng có mặt trong calendar",
      "Phục hồi sau một review căng",
      "Khác biệt giữa speed và pressure",
      "Xây trust bằng lời hứa nhỏ được giữ",
      "Onboarding cũng là architecture",
      "Cuộc họp sau incident",
      "Làm estimate bớt cá nhân hóa",
      "Một script bình tĩnh cho feedback khó",
      "Giữ standard mà không gatekeep",
      "Khi sự im lặng trong team trở thành signal",
      "Reviewer như người đọc tương lai",
      "Giúp người khác mà không thành bottleneck",
      "Team khỏe xử lý unfinished work thế nào",
      "Chi phí của hero culture",
      "Viết docs như chăm sóc teammate tương lai",
      "Checklist senior engineer hữu ích",
      "Nhận ra burnout trước khi performance giảm",
      "Tạo chỗ cho nhiều working styles",
      "Vì sao clarity tử tế hơn softness",
      "Team culture chịu được áp lực"
    ]
  },
  ai: {
    title: "AI & The Future",
    tagline: "Từ context engineering tới AI product đáng tin trong production.",
    cadence: "Mỗi ngày một bài AI trong 30 ngày.",
    entries: [
      "Từ prompt sang workflow",
      "Context engineering cho developer hằng ngày",
      "Khi câu trả lời của AI cần một test",
      "Thói quen hỏi AI về trade-off",
      "Agent như teammate có boundary",
      "Cách review code do AI viết",
      "Rủi ro âm thầm của cognitive debt",
      "Chỉ automate sau khi hiểu việc đó",
      "Workflow AI thực tế cho pull request",
      "Vì sao ví dụ tốt hơn instruction dài",
      "Khác biệt giữa chat và system design",
      "AI literacy cho engineer không chuyên AI",
      "Giữ judgment trong loop",
      "Prompt debug bắt đầu từ evidence",
      "Dùng AI để học mà không outsource việc học",
      "Một eval nhỏ trước claim lớn",
      "Agent handoff không mất context",
      "Cái giá của việc tin một câu trả lời trôi chảy",
      "Product team nên mô tả AI feature thế nào",
      "Từ prototype demo đến production behavior",
      "AI tools để đọc codebase",
      "AI giúp gì trong incident response",
      "Viết ticket tốt hơn cho coding agent",
      "Security review cho thay đổi có AI hỗ trợ",
      "Đo thời gian tiết kiệm một cách trung thực",
      "Khi không nên dùng agent",
      "Xây AI feature quanh user trust",
      "Vai trò tương lai của software engineer",
      "Checklist bình tĩnh khi adopt AI tool mới",
      "Làm việc thông minh hơn mà không cẩu thả"
    ]
  },
  "ways-of-working": {
    title: "Ways of Working",
    tagline: "Cách software team thật sự vận hành và delivery cùng nhau.",
    cadence: "Mỗi ngày một bài working-method trong 30 ngày.",
    entries: [
      "Agile ceremonies như feedback loops",
      "Scrum không giả vờ plan luôn hoàn hảo",
      "Daily standup làm thay đổi decision",
      "Sprint planning như risk discovery",
      "Vì sao estimate là conversation",
      "Definition of done giúp tránh rework",
      "Release planning với value và risk",
      "Vai trò BA khi work còn mơ hồ",
      "Product owner bảo vệ focus thế nào",
      "QA như partner trước đoạn cuối",
      "Làm startup mà không xem chaos là bản sắc",
      "Làm công ty lớn mà không biến mất",
      "Outsourcing và vấn đề context",
      "Handoff giữ ownership sống",
      "Viết requirement để người khác test được",
      "User story không giấu complexity",
      "Pre-mortem thực tế cho delivery",
      "Khi roadmap gặp capacity thật",
      "Team quyết định không làm gì như thế nào",
      "Quản lý dependency không blame",
      "Cách bình tĩnh xử lý scope change",
      "Retrospective thay đổi một behavior",
      "Vì sao WIP limit là một sự tử tế",
      "Khác biệt giữa bận và đang tiến lên",
      "Làm blocker visible sớm hơn",
      "Dùng status update tốt hơn",
      "Release note như delivery artifact",
      "So sánh delivery culture giữa công ty",
      "Khi process giúp và khi process che giấu",
      "Một tháng teamwork phần mềm tốt hơn"
    ]
  },
  perspectives: {
    title: "Perspectives & Field Notes",
    tagline: "Reflection cá nhân từ công việc, học tập, con người và career growth.",
    cadence: "Mỗi ngày một field note trong 30 ngày.",
    entries: [
      "Thói quen nhỏ thay đổi cách tôi đọc công việc",
      "Một bài học yên lặng từ release bị trễ",
      "Vì sao preparation thường vô hình",
      "Ngày tôi học cách hỏi câu rõ hơn",
      "Bàn làm việc bừa bộn giải thích technical debt",
      "Khác biệt giữa kiên nhẫn và chờ đợi",
      "Một chuyến đi làm dài dạy gì về năng lượng",
      "Kỹ năng nhận ra weak signals",
      "Vì sao progress chậm khi nó đang diễn ra",
      "Một ghi chú về ambition và attention",
      "Học từ người làm việc khác mình",
      "Khi helpful trở nên quá đắt",
      "Chi phí riêng tư của context switching",
      "Một quan hệ tốt hơn với unfinished work",
      "Tôi học gì từ một checklist đơn giản",
      "Sự bình tĩnh sau khi chọn scope nhỏ hơn",
      "Vì sao system tốt thường có vẻ boring",
      "Can đảm viết ghi chú thô đầu tiên",
      "Bảo vệ attention một cách nhẹ nhàng",
      "Khác biệt giữa confidence và evidence",
      "Vì sao quiet consistency compound",
      "Một reflection về việc xin feedback",
      "Công việc phía sau kết quả cuối sạch sẽ",
      "Giữ sự tử tế khi chịu áp lực",
      "Giá trị ẩn của handoff rõ ràng",
      "Một plan thất bại vẫn dạy được gì",
      "Career lesson trong repeated practice",
      "Vì sao đúng pace đôi khi chậm hơn",
      "Một ghi chú cho tuần khó tiếp theo",
      "Tháng này sẽ hiện rõ sau này"
    ]
  }
};

const vietnameseRoadmapAngles = [
  "Bắt đầu từ một tình huống công việc quen thuộc, rồi chỉ ra trade-off.",
  "So sánh shortcut hấp dẫn với chi phí maintain về sau.",
  "Giải thích bằng một kịch bản delivery nhỏ của team."
];

const vietnameseRoadmapIntents = ["giảng giải", "hỗ trợ quyết định", "đồng bộ team"];

const vietnameseRoadmapFormats: Record<BlogRoadmapEntry["format"], string> = {
  "case note": "ghi chú tình huống",
  explainer: "bài giải thích",
  "field guide": "hướng dẫn thực chiến"
};

const vietnameseBlogRoadmapTicketChecklist = [
  "Xác nhận locale đang chọn và canonical category path.",
  "Tạo một Multica ticket tập trung cho từng bài trong roadmap.",
  "Đính kèm title, angle, intent và source category.",
  "Giữ metadata bài viết khớp với blog schema hiện có.",
  "Chạy content checks trước khi đánh dấu writing ticket sẵn sàng."
];

const vietnameseFlowGroupCopies: Record<string, LocalizedFlowGroupCopy> = {
  architecture: {
    title: "Kiến trúc & System Design",
    subtitle: "Chốt quyết định trước khi vẽ box.",
    description:
      "Các flow dành cho system design, architecture review và những quyết định khó ở ranh giới module, dữ liệu, team và vận hành."
  },
  production: {
    title: "Production & Delivery",
    subtitle: "Cẩn thận hơn khi đã có người dùng thật.",
    description:
      "Các flow dành cho incident, release readiness, rollout gate và handoff vận hành, để bảo vệ reliability mà không làm mọi thay đổi bị nặng nề."
  },
  "ai-and-career": {
    title: "AI Delivery & Career Proof",
    subtitle: "Biến công việc thành leverage.",
    description:
      "Các flow dành cho delivery có AI hỗ trợ và câu chuyện portfolio, giúp engineering judgment hiện rõ mà không biến thành copy marketing."
  }
};

const vietnameseFlowCopies: Record<string, LocalizedFlowCopy> = {
  "system-design": {
    title: "Flow System Design",
    summary:
      "Một đường đi bình tĩnh từ đề bài còn rộng tới kiến trúc rõ: requirement, capacity, data, API, failure modes và trade-off đi đúng thứ tự.",
    seoTitle: "Flow system design cho senior software engineer",
    seoDescription:
      "Flow system design thực dụng để làm rõ requirement, chọn boundary, model dữ liệu, xử lý scale và giải thích trade-off mạch lạc.",
    useWhen:
      "Dùng khi đề bài còn rộng, ví dụ thiết kế notification system, booking platform, feed hoặc một workflow nội bộ.",
    outcome:
      "Một narrative có thể share, thể hiện judgment senior: điều gì quan trọng, điều gì có thể chờ, rủi ro nằm ở đâu và hệ thống sẽ tiến hóa thế nào.",
    officeExample:
      "Product manager muốn thêm flow onboarding đối tác. Thay vì nhảy ngay vào service và queue, flow này bắt đầu từ ai đổi dữ liệu nào, bước nào cần duyệt và rollback quan trọng ở đâu.",
    tags: ["System Design", "Architecture", "Trade-off", "Interview"],
    steps: {
      "frame-problem": {
        title: "Đóng khung bài toán",
        detail: "Nói lại user, job, constraint và non-goal trước khi gọi tên công nghệ.",
        evidence: "Mục tiêu business, actor, read/write path, latency hoặc reliability expectation.",
        output: "Problem frame ngắn và danh sách assumption cần confirm."
      },
      "shape-interfaces": {
        title: "Định hình interface",
        detail: "Phác API, event, user action và admin action quanh workflow thật.",
        evidence: "Request mẫu, tên event, idempotency, permission và error path.",
        output: "Ghi chú API/event contract cùng các boundary đầu tiên."
      },
      "model-data": {
        title: "Model dữ liệu",
        detail: "Chọn ownership, consistency rule, index, retention và hướng migration.",
        evidence: "Entity chính, invariant, query pattern, lifecycle state và nhu cầu audit.",
        output: "Data sketch kèm consistency và migration note."
      },
      "design-runtime": {
        title: "Thiết kế runtime",
        detail: "Đặt service, queue, cache, worker và gateway chỉ khi chúng giải quyết một áp lực rõ.",
        evidence: "Capacity estimate, fan-out, dependency limit, hot path và deploy constraint.",
        output: "Runtime architecture có lý do cho từng phần chuyển động."
      },
      "stress-failures": {
        title: "Stress failure modes",
        detail: "Đi qua dependency chậm, request trùng, partial write, deploy lỗi và stale read.",
        evidence: "Timeout, retry budget, DLQ, backpressure, observability và rollback trigger.",
        output: "Failure-mode table với mitigation và monitoring hook."
      },
      "explain-evolution": {
        title: "Giải thích hướng tiến hóa",
        detail: "Nói rõ bản đầu tiên thực tế, điểm gãy và design tiếp theo khi traffic hoặc team lớn hơn.",
        evidence: "Sức team hiện tại, đường tăng traffic, độ trưởng thành vận hành và trần chi phí.",
        output: "Roadmap theo phiên bản: v1, trigger scale và alternative đã từ chối."
      }
    },
    artifacts: ["Problem frame", "API/event notes", "Data ownership sketch", "Runtime diagram", "Failure-mode table", "Evolution roadmap"],
    cvSignals: ["System design judgment", "Backend và platform thinking", "Giao tiếp trade-off", "Operational maturity"]
  },
  "architecture-decision": {
    title: "Flow quyết định kiến trúc",
    summary:
      "Một đường RFC/ADR gọn để biến nhiều lựa chọn rối thành một recommendation rõ, có trade-off và rollback.",
    seoTitle: "Flow quyết định kiến trúc với tư duy RFC và ADR",
    seoDescription:
      "Flow quyết định kiến trúc để so sánh option, cân trade-off, ghi rủi ro và align team trước khi implement.",
    useWhen:
      "Dùng trước khi feature vượt ranh giới module, đổi ownership dữ liệu, thêm integration mới hoặc kéo theo dependency khó quay lại.",
    outcome:
      "Một decision note giúp teammate hiểu không chỉ chọn gì, mà vì sao các hướng khác bị loại.",
    officeExample:
      "Team đang tranh luận có nên thêm queue cho partner sync. Flow này tách nhu cầu thật, hành vi khi lỗi, chi phí support của team và thời điểm async processing thật sự đáng giá.",
    tags: ["RFC", "ADR", "Architecture Review", "Decision Matrix"],
    steps: {
      "name-decision": {
        title: "Gọi tên quyết định",
        detail: "Viết quyết định thành một câu và thu scope đủ nhỏ để có thể approve.",
        evidence: "Nỗi đau hiện tại, hệ thống bị ảnh hưởng, owner, deadline và phần ngoài scope.",
        output: "Decision statement có scope và non-goal."
      },
      "extract-invariants": {
        title: "Rút invariant",
        detail: "Liệt kê điều luôn phải đúng với user, tiền, permission, data, audit và support.",
        evidence: "Domain rule, compliance, support workflow và incident production.",
        output: "Danh sách invariant mà mọi option phải giữ được."
      },
      "compare-options": {
        title: "So sánh option thật",
        detail: "Đánh giá hai hoặc ba hướng thực dụng, không dựng một design hoàn hảo để thắng strawman.",
        evidence: "Chi phí delivery, reversibility, performance, reliability, fit với team và migration về sau.",
        output: "Option table với trade-off trung thực."
      },
      "risk-gates": {
        title: "Đặt risk gate",
        detail: "Chốt validation, telemetry, rollout và rollback trước khi implementation bắt đầu.",
        evidence: "Test, dashboard, feature flag, migration script, runbook và owner sign-off.",
        output: "Decision gate và launch condition."
      },
      "write-decision": {
        title: "Viết decision note",
        detail: "Giữ note đủ ngắn để đọc lúc review, nhưng đủ đầy để sống qua handoff.",
        evidence: "Option được chọn, alternative bị loại, accepted debt và revisit trigger.",
        output: "ADR/RFC entry sẵn sàng review."
      }
    },
    artifacts: ["Decision statement", "Invariant list", "Option matrix", "Risk gates", "ADR/RFC note"],
    cvSignals: ["Architecture leadership", "Làm rõ requirement", "Align cross-team", "Quản trị rủi ro"]
  },
  "incident-response": {
    title: "Flow xử lý incident",
    summary:
      "Một đường xử lý incident từ signal đầu tiên tới rollback, communication, root cause và follow-up thật sự.",
    seoTitle: "Flow xử lý production incident cho engineering team",
    seoDescription:
      "Flow incident cho triage, kiểm soát blast radius, rollback, communication, root cause analysis và follow-up.",
    useWhen:
      "Dùng khi alert, phản hồi khách hàng, deploy regression hoặc lỗi đối tác tạo áp lực và team cần một thứ tự bình tĩnh.",
    outcome:
      "Incident được kiểm soát: decision visible, user được bảo vệ và postmortem tạo ra prevention work thật.",
    officeExample:
      "Sau release, checkout latency tăng và support nhận complaint trùng lặp. Flow này giữ team khỏi đoán mò bằng cách tách signal, mitigation, rollback và root cause.",
    tags: ["Incident", "SRE", "Rollback", "Postmortem"],
    steps: {
      "confirm-signal": {
        title: "Xác nhận signal",
        detail: "Tách incident có impact thật khỏi metric nhiễu hoặc một dependency chập chờn.",
        evidence: "Alert, dashboard, log, trace, customer report, timeline deploy và segment bị ảnh hưởng.",
        output: "Trạng thái incident, severity và owner ban đầu."
      },
      "contain-blast-radius": {
        title: "Giới hạn blast radius",
        detail: "Bảo vệ user trước bằng flag, rate limit, rollback, shift traffic hoặc tạm disable.",
        evidence: "Feature flag, release version, dependency health, error budget và rollback path an toàn.",
        output: "Mitigation action kèm impact dự kiến."
      },
      "coordinate-room": {
        title: "Điều phối phòng incident",
        detail: "Chia incident lead, comms, investigation và verification để team không giẫm chân nhau.",
        evidence: "Owner, timestamp, hypothesis hiện tại, message cho khách hàng và mốc update tiếp theo.",
        output: "Timeline incident và cadence communication chung."
      },
      "verify-recovery": {
        title: "Xác nhận recovery",
        detail: "Đừng đóng incident chỉ vì một graph đẹp hơn; kiểm user path và downstream queue.",
        evidence: "SLO, synthetic check, real traffic, queue depth, support signal và error-rate recovery.",
        output: "Recovery confirmation và watch window."
      },
      "write-postmortem": {
        title: "Viết follow-up",
        detail: "Biến incident thành prevention work mà không đổ lỗi cho người chạm deploy.",
        evidence: "Root cause, contributing factor, missed detection và prevention option.",
        output: "Postmortem, action item, owner và due date."
      }
    },
    artifacts: ["Severity note", "Mitigation log", "Incident timeline", "Recovery checklist", "Postmortem actions"],
    cvSignals: ["Production ownership", "Reliability thinking", "Stakeholder communication", "Bình tĩnh khi áp lực"]
  },
  "release-readiness": {
    title: "Flow release readiness",
    summary:
      "Một rollout gate để kiểm scope, test, observability, migration safety, communication và rollback trước khi release.",
    seoTitle: "Flow release readiness cho rollout phần mềm an toàn",
    seoDescription:
      "Flow release readiness để kiểm test, analytics, migration safety, observability, communication, rollout gate và rollback plan.",
    useWhen:
      "Dùng trước khi feature lên production, nhất là khi chạm checkout, authentication, data migration, integration hoặc route public.",
    outcome:
      "Một release có thể giải thích, quan sát, pause và rollback mà không cần dọn dẹp kiểu chữa cháy sau đó.",
    officeExample:
      "Team chuẩn bị ship một dashboard filter mới có analytics và SEO. Flow này kiểm behavior, tracking, empty state và rollback trước khi nút deploy trở nên quá hấp dẫn.",
    tags: ["Release", "Rollout", "QA", "Observability"],
    steps: {
      "confirm-scope": {
        title: "Xác nhận scope",
        detail: "So release với ticket, acceptance criteria, non-goal và behavior user thấy được.",
        evidence: "Ticket, diff summary, screenshot, copy change và route bị ảnh hưởng.",
        output: "Scope release và non-goal rõ ràng."
      },
      "verify-behavior": {
        title: "Verify behavior",
        detail: "Chạy check đúng với risk: unit, integration, E2E, accessibility, typecheck và smoke thủ công.",
        evidence: "Command output, test coverage, browser check, mobile check và gap còn lại.",
        output: "Verification note kèm residual risk."
      },
      "check-data": {
        title: "Kiểm data và migration",
        detail: "Review schema change, backfill, index, cache, analytics event và SEO path.",
        evidence: "Migration plan, rollback script, data volume, event name, canonical URL và sitemap impact.",
        output: "Checklist sẵn sàng cho data và tracking."
      },
      "prepare-observability": {
        title: "Chuẩn bị observability",
        detail: "Đảm bảo release quan sát được bằng signal có thể hành động, không chỉ graph đẹp.",
        evidence: "Dashboard, alert, log, trace, feature flag và owner coverage.",
        output: "Watch plan và escalation path."
      },
      "rollout-decision": {
        title: "Chốt rollout decision",
        detail: "Chọn gradual rollout, release ngay, hold hoặc rollback dựa trên evidence.",
        evidence: "Risk score, user segment, support readiness, deploy window và rollback confidence.",
        output: "Go/hold decision kèm rollback trigger."
      }
    },
    artifacts: ["Scope note", "Verification evidence", "Data và analytics checklist", "Watch plan", "Rollout decision"],
    cvSignals: ["End-to-end delivery", "QA judgment", "SEO và analytics awareness", "Release ownership"]
  },
  "ai-delivery": {
    title: "Flow delivery có AI hỗ trợ",
    summary:
      "Một cách dùng AI agent có kiểm soát cho implementation, không mất scope, privacy, test và judgment của engineer.",
    seoTitle: "Flow delivery phần mềm có AI hỗ trợ và human review",
    seoDescription:
      "Flow AI-assisted delivery để scope task, đóng gói context, apply change, verify behavior và handoff công việc sẵn sàng review.",
    useWhen:
      "Dùng khi AI agent hỗ trợ coding, review, research, docs, refactor hoặc sinh test trong một codebase thật.",
    outcome:
      "Một change sẵn sàng review, trong đó AI giúp tăng tốc và tăng coverage, còn engineer vẫn giữ ownership về scope, correctness và release risk.",
    officeExample:
      "Một teammate yêu cầu feature mới trong Studio. Flow này biến request thành context có ranh giới, nói rõ phần không được đụng, verify analytics/SEO rồi review diff trước khi commit.",
    tags: ["AI Delivery", "Agents", "Code Review", "Verification"],
    steps: {
      "scope-task": {
        title: "Scope task",
        detail: "Dịch request thành acceptance criteria, surface bị ảnh hưởng, non-goal và privacy boundary.",
        evidence: "User request, repo instruction, local constraint, analytics rule và quyền deploy.",
        output: "Task brief có ranh giới rõ."
      },
      "package-context": {
        title: "Đóng gói context",
        detail: "Đưa cho agent file, example, convention, test và cảnh báo thật sự liên quan.",
        evidence: "Pattern hiện có, component tương tự, data model, locale behavior và test.",
        output: "Context pack và implementation hint."
      },
      "execute-small": {
        title: "Làm theo lát nhỏ",
        detail: "Giữ edit hẹp, dùng abstraction sẵn có và verify từng boundary rủi ro trước khi đi tiếp.",
        evidence: "Diff chunk, compile feedback, UI behavior và file ngoài scope không đổi.",
        output: "Implementation diff tập trung."
      },
      "verify-review": {
        title: "Verify và review",
        detail: "Chạy test, đọc diff, kiểm chất lượng copy, analytics wiring và security/privacy implication.",
        evidence: "Test output, manual check, changed-file list và residual risk.",
        output: "Verification summary và review note."
      },
      "handoff-clean": {
        title: "Handoff sạch",
        detail: "Chuẩn bị commit, PR, release note hoặc deploy chỉ khi request của người dùng cho phép.",
        evidence: "Git status, staged diff, commit message, PR checklist và trạng thái approval.",
        output: "Handoff sẵn sàng cho commit/PR/deploy."
      }
    },
    artifacts: ["Task brief", "Context pack", "Focused diff", "Verification note", "Review handoff"],
    cvSignals: ["AI fluency", "Engineering judgment", "Privacy awareness", "Modern delivery practice"]
  },
  "portfolio-story": {
    title: "Flow kể câu chuyện portfolio",
    summary:
      "Một cách biến công việc kỹ thuật thật thành câu chuyện CV, blog hoặc phỏng vấn rõ ràng mà không đánh bóng quá mức.",
    seoTitle: "Flow kể câu chuyện engineering portfolio cho CV và phỏng vấn",
    seoDescription:
      "Flow portfolio story để biến công việc engineering thành context, action, trade-off, impact, evidence và bài học tiếp theo.",
    useWhen:
      "Dùng sau một project, incident, migration, release, khoảnh khắc leadership hoặc trade-off khó đáng để trở thành career evidence.",
    outcome:
      "Một câu chuyện grounded có thể chuyển thành CV bullet, blog post, câu trả lời phỏng vấn hoặc portfolio case study.",
    officeExample:
      "Một refactor làm giảm support noise nhưng không có headline quá kịch tính. Flow này giữ lại before/after, áp lực quyết định và giá trị vận hành âm thầm.",
    tags: ["CV", "Portfolio", "Writing", "Career"],
    steps: {
      "capture-context": {
        title: "Ghi lại context",
        detail: "Nói rõ tình huống team, pain của user, constraint và vì sao việc này quan trọng lúc đó.",
        evidence: "Ticket, incident note, stakeholder request, metric, support theme hoặc code-health signal.",
        output: "Context paragraph cụ thể, không phóng đại."
      },
      "show-actions": {
        title: "Cho thấy hành động",
        detail: "Mô tả điều anh đổi, quyết định, phối hợp hoặc làm đơn giản hơn bằng ngôn ngữ engineering rõ.",
        evidence: "Diff, design note, PR discussion, rollout plan, test evidence hoặc migration record.",
        output: "Action list có cả technical detail và collaboration detail."
      },
      "name-tradeoffs": {
        title: "Gọi tên trade-off",
        detail: "Giải thích constraint làm công việc này đáng chú ý: thời gian, reliability, UX, cost, privacy hoặc sức team.",
        evidence: "Option bị từ chối, accepted debt, rollback plan hoặc future trigger.",
        output: "Trade-off note thể hiện judgment."
      },
      "prove-impact": {
        title: "Chứng minh impact",
        detail: "Dùng số liệu khi có, nhưng vẫn ghi lại risk giảm, handoff sạch hơn, reliability tốt hơn hoặc support nhanh hơn.",
        evidence: "Before/after metric, customer signal, deploy health, incident giảm hoặc adoption của team.",
        output: "Impact statement có evidence và caveat."
      },
      "shape-story": {
        title: "Định dạng câu chuyện",
        detail: "Biến raw material thành đúng format cho CV, interview, blog hoặc portfolio page.",
        evidence: "Audience, keyword, role đang nhắm tới, proof link và boundary bảo mật.",
        output: "CV bullet, STAR answer, blog outline hoặc case-study draft."
      }
    },
    artifacts: ["Context paragraph", "Action list", "Trade-off note", "Impact statement", "Story draft"],
    cvSignals: ["Giao tiếp impact", "Senior engineer narrative", "Business awareness", "Reflective practice"]
  }
};

function isVietnameseLocale(locale: string): boolean {
  return locale.toLowerCase().split("-")[0] === "vi";
}

function buildVietnameseSkillMarkdown(skillId: string, skill: LocalizedSkillCopy): string {
  const sections = [
    `# ${skill.title} Skill`,
    "",
    skill.summary,
    "",
    "## Dùng khi",
    ...skill.useWhen.map((item) => `- ${item}`),
    "",
    "## Quy trình",
    ...skill.process.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Output format",
    ...skill.output.map((item) => `- ${item}`),
    "",
    "## Guardrails",
    ...skill.guardrails.map((item) => `- ${item}`)
  ];
  const expertAddendum = vietnameseSkillExpertAddenda[skillId];

  if (expertAddendum) {
    sections.push(...buildVietnameseExpertAddendum(expertAddendum));
  }

  return sections.join("\n");
}

function localizeChecklistStep(step: StudioChecklistStep): StudioChecklistStep {
  const copy = vietnameseStepCopies[step.id];
  return {
    ...step,
    label: copy?.label ?? step.label,
    detail: copy?.detail ?? step.detail,
    children: step.children?.map(localizeChecklistStep)
  };
}

function localizeChecklistSection(section: StudioChecklistSection): StudioChecklistSection {
  const copy = vietnameseSectionCopies[section.id];
  return {
    ...section,
    title: copy?.title ?? section.title,
    detail: copy?.detail ?? section.detail,
    steps: section.steps.map(localizeChecklistStep)
  };
}

function localizeRoadmapTopic(topic: BlogRoadmapTopic): BlogRoadmapTopic {
  const copy = vietnameseRoadmapCopies[topic.id];
  if (!copy) return topic;

  return {
    ...topic,
    title: copy.title,
    tagline: copy.tagline,
    cadence: copy.cadence,
    entries: topic.entries.map((entry, index) => ({
      ...entry,
      title: copy.entries[index] ?? entry.title,
      angle: vietnameseRoadmapAngles[index % vietnameseRoadmapAngles.length],
      intent: vietnameseRoadmapIntents[index % vietnameseRoadmapIntents.length],
      format: vietnameseRoadmapFormats[entry.format] ?? entry.format
    }))
  };
}

function localizeFlowStep(step: StudioFlowStep, flowCopy: LocalizedFlowCopy): StudioFlowStep {
  const copy = flowCopy.steps[step.id];
  return {
    ...step,
    title: copy?.title ?? step.title,
    detail: copy?.detail ?? step.detail,
    evidence: copy?.evidence ?? step.evidence,
    output: copy?.output ?? step.output
  };
}

function localizeFlow(flow: StudioFlow): StudioFlow {
  const copy = vietnameseFlowCopies[flow.id];
  if (!copy) return flow;

  return {
    ...flow,
    title: copy.title,
    summary: copy.summary,
    seoTitle: copy.seoTitle,
    seoDescription: copy.seoDescription,
    useWhen: copy.useWhen,
    outcome: copy.outcome,
    officeExample: copy.officeExample,
    tags: copy.tags,
    steps: flow.steps.map((step) => localizeFlowStep(step, copy)),
    artifacts: copy.artifacts,
    cvSignals: copy.cvSignals
  };
}

function localizeFlowGroup(group: StudioFlowGroup): StudioFlowGroup {
  const copy = vietnameseFlowGroupCopies[group.id];
  if (!copy) return group;

  return {
    ...group,
    title: copy.title,
    subtitle: copy.subtitle,
    description: copy.description
  };
}

export function getLocalizedStudioAiSkills(locale: string): StudioAiSkill[] {
  if (!isVietnameseLocale(locale)) return studioAiSkills;

  return studioAiSkills.map((skill) => {
    const copy = vietnameseSkillCopies[skill.id];
    if (!copy) return skill;

    return {
      ...skill,
      title: copy.title,
      summary: copy.summary,
      tags: copy.tags,
      markdown: buildVietnameseSkillMarkdown(skill.id, copy)
    };
  });
}

export function getLocalizedStudioWorkflowChecklists(locale: string): StudioWorkflowChecklist[] {
  if (!isVietnameseLocale(locale)) return studioWorkflowChecklists;

  return studioWorkflowChecklists.map((checklist) => {
    const copy = vietnameseChecklistCopies[checklist.id];
    return {
      ...checklist,
      title: copy?.title ?? checklist.title,
      summary: copy?.summary ?? checklist.summary,
      whenToUse: copy?.whenToUse ?? checklist.whenToUse,
      tags: copy?.tags ?? checklist.tags,
      sections: checklist.sections.map(localizeChecklistSection)
    };
  });
}

export function getLocalizedBlogRoadmapTopics(locale: string): BlogRoadmapTopic[] {
  if (!isVietnameseLocale(locale)) return blogRoadmapTopics;
  return blogRoadmapTopics.map(localizeRoadmapTopic);
}

export function getLocalizedBlogRoadmapTicketChecklist(locale: string): string[] {
  if (!isVietnameseLocale(locale)) return blogRoadmapTicketChecklist;
  return vietnameseBlogRoadmapTicketChecklist;
}

export function getLocalizedStudioFlows(locale: string): StudioFlow[] {
  if (!isVietnameseLocale(locale)) return studioFlows;
  return studioFlows.map(localizeFlow);
}

export function getLocalizedStudioFlowGroups(locale: string): StudioFlowGroup[] {
  if (!isVietnameseLocale(locale)) return studioFlowGroups;
  return studioFlowGroups.map(localizeFlowGroup);
}
