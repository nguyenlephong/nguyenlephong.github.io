import {
  blogRoadmapTicketChecklist,
  blogRoadmapTopics,
  studioAiSkills,
  studioWorkflowChecklists
} from "./studio.data";
import type {
  BlogRoadmapEntry,
  BlogRoadmapTopic,
  StudioAiSkill,
  StudioChecklistSection,
  StudioChecklistStep,
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

const vietnameseSkillCopies: Record<string, LocalizedSkillCopy> = {
  "code-review": {
    title: "Code Review",
    summary: "Đánh giá PR nghiêm ngặt dựa trên correctness, security, test coverage và architecture impact.",
    tags: ["Code review", "Risk Management", "Quality Assurance"],
    useWhen: [
      "Khi thực hiện peer review cho pull request, local diff hoặc code do AI sinh ra.",
      "Khi cần xác định technical blockers trước khi feedback về code style.",
      "Khi thay đổi tác động đến UI, schema data, authorization model, rollout pattern hoặc tracking pipeline."
    ],
    process: [
      "Khảo sát mục tiêu kinh doanh và footprint của thay đổi trên toàn hệ thống.",
      "Tìm blocker ưu tiên: logic sai lệch (correctness), rủi ro mất mát dữ liệu, OWASP Top 10 vulnerabilities, privacy leaks, hoặc suy giảm Core Web Vitals.",
      "Đối chiếu code với acceptance criteria, rà soát invariant violations thay vì review theo cảm tính.",
      "Xác minh UI states: empty, loading, error, skeleton, responsive constraints và WCAG 2.1 AA accessibility.",
      "Đánh giá test coverage: unit, integration và E2E tests có bắt được regression cho các edge cases hay không.",
      "Ghi chú feedback với context chi tiết theo file/line, nêu rõ residual risk và hậu quả nếu không xử lý."
    ],
    output: [
      "Findings được phân loại theo severity (Blocker, Major, Minor, Nit).",
      "Các câu hỏi mở về architecture hoặc edge cases.",
      "Đề xuất refactor/fix cụ thể.",
      "Các lỗ hổng trong verification plan."
    ],
    guardrails: [
      "KHÔNG khen ngợi lấy lệ trước khi liệt kê critical issues.",
      "KHÔNG yêu cầu scope creep (refactor code ngoài phạm vi PR hiện tại).",
      "KHÔNG block PR vì preference cá nhân nếu behavior đã được cover bởi tests và tuân thủ convention.",
      "Nếu PR hoàn hảo, PHẢI nêu rõ lý do approve và ghi nhận residual risk."
    ]
  },
  "frontend-architecture": {
    title: "Kiến trúc Frontend",
    summary: "Thiết kế kiến trúc client-side tập trung vào component boundaries, state isolation, performance và analytics.",
    tags: ["Frontend", "Architecture", "System Design"],
    useWhen: [
      "Trước khi khởi tạo hoặc refactor một feature UI phức tạp.",
      "Khi route mới yêu cầu quản lý state (URL params, filters, context), forms, hoặc PostHog telemetry.",
      "Khi responsive design (Mobile/Tablet/Desktop) là mandatory constraint trong acceptance criteria."
    ],
    process: [
      "Xác định route boundary, composition pattern và atomic component ownership.",
      "Tách biệt rõ ràng giữa Server Data (fetching/caching), Client State (ephemeral), Visual Components (dumb) và Interaction Handlers.",
      "Liệt kê và handle toàn bộ permutation của UI states: loading, partial data, empty, error boundaries, disabled interactions.",
      "Thực thi responsive constraints qua CSS Grid/Flexbox và container queries, KHÔNG scale font tuyến tính theo viewport.",
      "Tái sử dụng design tokens, typography, icon sets và micro-interactions từ design system hiện có.",
      "Tích hợp event tracking (PostHog) cho tất cả routing, filter changes, form submissions và outbound links."
    ],
    output: [
      "Component tree & state distribution model.",
      "Data fetching strategy (CSR, SSR, SSG).",
      "Danh sách telemetry events.",
      "Edge cases resolution.",
      "Thứ tự implementation."
    ],
    guardrails: [
      "KHÔNG biến SaaS application tool thành một marketing landing page.",
      "KHÔNG lạm dụng prop drilling hoặc global state cho ephemeral data.",
      "Mobile/Tablet behavior PHẢI được thiết kế như first-class citizen, không phải afterthought."
    ]
  },
  "backend-architecture": {
    title: "Kiến trúc Backend",
    summary: "Thiết kế backend systems đảm bảo data integrity, isolation, security, resilience và safe rollout.",
    tags: ["Backend", "Distributed Systems", "Data"],
    useWhen: [
      "Khi thiết kế API contracts, microservices, async background jobs, webhook integrations hoặc data pipelines.",
      "Khi thay đổi kéo theo database migrations, message queues, rate limiting, external dependencies hoặc auth/RBAC.",
      "Khi bài toán yêu cầu zero-downtime deployment và safe rollout."
    ],
    process: [
      "Phân định rõ context boundaries: service nào sở hữu data (write), service nào chỉ consume (read).",
      "Định nghĩa strict API/job contract (OpenAPI/AsyncAPI) trước khi implement logic.",
      "Thiết kế cơ chế bảo vệ: input validation, authn/authz, idempotency keys, rate limiting và audit logging.",
      "Thiết kế data layer: schema migration strategy (expand/contract), index optimization, data retention và GDPR compliance.",
      "Thiết kế failure resilience: timeout bounds, exponential backoff retries, Dead Letter Queues (DLQ), Circuit Breakers và graceful degradation.",
      "Lên kế hoạch rollout: feature flags, canary release, dark launching, migration windows và rollback procedures."
    ],
    output: [
      "Bounded contexts & responsibility maps.",
      "API Contracts & Event schemas.",
      "Data layer changes & Migration plan.",
      "Failure mode analysis (FMEA).",
      "Rollout, Observability & Rollback plan."
    ],
    guardrails: [
      "KHÔNG che giấu domain ownership bằng các generic/shared utilities.",
      "KHÔNG thiết kế async flow nếu thiếu observability, retry mechanisms và idempotency.",
      "KHÔNG claim hệ thống là production-ready nếu chưa diễn tập phương án rollback và data recovery."
    ]
  },
  "blog-content-writer": {
    title: "Blog Content Writer",
    summary: "Biên soạn technical articles, reflections và system explainers với văn phong chuyên gia, gãy gọn, không cường điệu.",
    tags: ["Technical Writing", "Content Strategy", "SEO"],
    useWhen: [
      "Khi draft các bài technical blog, engineering notes, book reflections hoặc profile narratives.",
      "Khi cần cấu trúc hóa các ý tưởng thô thành một documentation có flow logic chặt chẽ, dễ tiêu hóa.",
      "Khi cần một tone giọng chân thực, analytical, không hype và tuyệt đối không sặc mùi sales/marketing."
    ],
    process: [
      "Hook người đọc bằng một operational incident, technical debt, hoặc tình huống đời sống cụ thể.",
      "Abstractize tình huống đó thành một engineering insight hoặc mental model sâu sắc.",
      "Chứng minh bằng architecture diagrams, code workflows, tooling choices và trade-offs thay vì nói suông.",
      "Tổ chức bài viết thành các semantic sections rõ ràng (H2, H3) để tối ưu scannability.",
      "Kết luận bằng một reflection mang tính hành động hoặc một open constraint để kích thích tư duy."
    ],
    output: [
      "3-5 biến thể Title tối ưu SEO.",
      "Hook paragraph (tối đa 3 câu).",
      "Full markdown draft với code snippets/mermaid diagrams.",
      "Social media abstract (LinkedIn/Twitter).",
      "Đề xuất ý tưởng spin-off."
    ],
    guardrails: [
      "KHÔNG hallucinate data, nguồn trích dẫn hoặc benchmarks.",
      "KHÔNG lạm dụng technical buzzwords nếu không phục vụ mục đích giải thích.",
      "KHÔNG dùng cấu trúc listicle sáo rỗng hoặc văn phong clickbait.",
      "PHẢI bảo toàn SEO metadata, locale paths và schema markup hiện có."
    ]
  },
  "prompt-writing": {
    title: "Prompt Engineering",
    summary: "Xây dựng AI prompts có cấu trúc chặt chẽ, deterministic và tái sử dụng được cho multi-agent orchestration.",
    tags: ["Prompt Engineering", "AI Operations", "LLM"],
    useWhen: [
      "Khi task definition còn mơ hồ về role, goal, context hoặc output schema.",
      "Khi cần xây dựng meta-prompts hoặc system instructions cho Codex, Claude, GPT, Gemini.",
      "Khi output pipeline yêu cầu định dạng machine-readable (JSON/XML) với tỷ lệ hallucination tiệm cận 0."
    ],
    process: [
      "Xác định Persona/Role của agent với expert context.",
      "Định nghĩa Goal cốt lõi và strict acceptance criteria.",
      "Tiêm System Context, constraints, few-shot examples và RAG references.",
      "Mô tả Step-by-step Reasoning Process (Chain of Thought) mà agent phải tuân thủ.",
      "Quy định Output Schema (JSON, Markdown, Code diff) và tone/style.",
      "Thiết lập Negative Constraints (Guardrails): những gì tuyệt đối không được làm hoặc phải fallback user."
    ],
    output: [
      "Production-ready System Prompt.",
      "Rationale giải thích kiến trúc của prompt.",
      "Lightweight version cho ad-hoc chat."
    ],
    guardrails: [
      "KHÔNG thiết kế prompt cồng kềnh, dư thừa token không mang lại signal.",
      "KHÔNG để agent tự đoán các domain invariants quan trọng.",
      "Tối ưu cho tỷ lệ hoàn thành task (task completion rate) và accuracy, KHÔNG tối ưu cho độ dài câu chữ."
    ]
  },
  "status-report": {
    title: "Executive Status Report",
    summary: "Tổng hợp báo cáo tiến độ (Daily/Weekly/Monthly) sắc bén, tập trung vào impact, blockers và path to green.",
    tags: ["Reporting", "Communication", "Leadership"],
    useWhen: [
      "Khi cần báo cáo async cho stakeholders về project health, engineering velocity hoặc sprint goals.",
      "Khi dự án gặp rủi ro và cần escalation để xin quyết định từ cấp trên/cross-functional teams.",
      "Khi cần chuyển hóa các Jira/Linear tickets thành một executive summary có ý nghĩa."
    ],
    process: [
      "Phân định rạch ròi giữa hard facts (metrics, commits, incidents) và interpretation.",
      "Sử dụng mô hình BLUF (Bottom Line Up Front): Nêu Business/System Impact trước khi liệt kê activities.",
      "Đưa Risks và Blockers lên đầu, gán rõ ownership và next action items.",
      "Điều chỉnh abstraction level phù hợp với audience (Engineers vs. C-Level).",
      "Đối chiếu delta changes so với reporting cycle trước đó."
    ],
    output: [
      "TL;DR / Executive Summary.",
      "Shipped / Value Delivered.",
      "In Progress / WIP Limits.",
      "Risks, Blockers & Mitigations.",
      "Decisions Needed (Escalation)."
    ],
    guardrails: [
      "Daily: Giới hạn dưới 3 bullet points, tập trung vào blockers và PR reviews.",
      "Weekly: Focus vào velocity, scope creep, integration risks và mục tiêu tuần tới.",
      "Monthly: Focus vào DORA metrics, system reliability, OKR outcomes và strategic pivots."
    ]
  },
  "doc-spec-tech-spec": {
    title: "Tech Spec & RFC",
    summary: "Soạn thảo Technical Specifications và RFCs liên kết product requirements với system design và rollout constraints.",
    tags: ["Architecture", "RFC", "Documentation"],
    useWhen: [
      "Trước khi implement các features có scope lớn, cross-service dependencies hoặc schema migrations.",
      "Khi cần đề xuất thay đổi kiến trúc (Architecture Decision Records - ADR) để xin consensus từ team.",
      "Khi technical design tiềm ẩn rủi ro về security, performance hoặc data privacy."
    ],
    process: [
      "Xác định Problem Statement, Business Context và User Impact.",
      "Phân định rõ Explicit Goals và Non-Goals (Out of scope).",
      "Phác thảo System Flow, Sequence Diagrams và Data Models.",
      "Đề xuất Solution và phân tích các Alternatives đã bị loại bỏ (Trade-offs).",
      "Đặc tả API Contracts, Database Schema Changes và Event Payloads.",
      "Phân tích Threat Model (STRIDE), Privacy implications, Accessibility và Observability metrics.",
      "Lên kế hoạch Rollout, Database Backfills, Migration scripts và Rollback triggers."
    ],
    output: [
      "Decision-ready Technical Specification/RFC.",
      "Danh sách Unresolved Questions.",
      "Implementation Phasing/Checklist.",
      "QA/Test Matrix Checklist."
    ],
    guardrails: [
      "KHÔNG che giấu 'Unknown Unknowns' hoặc technical debt.",
      "KHÔNG ngụy biện biến assumptions thành hard requirements mà không có validation.",
      "PHẢI có phương án Rollback deterministic cho mọi thay đổi chạm đến production data."
    ]
  },
  "proposal-slide-pitch": {
    title: "Executive Pitch & Proposal",
    summary: "Xây dựng business proposals và pitch decks tập trung vào ROI, risk mitigations và actionable decisions.",
    tags: ["Proposal", "Strategy", "Pitch"],
    useWhen: [
      "Khi cần thuyết phục stakeholders (C-level, Sponsors) cấp ngân sách hoặc phê duyệt dự án.",
      "Khi cấu trúc nội dung cho technical talk, All-hands presentation hoặc product launch.",
      "Khi cần present các trade-offs kiến trúc phức tạp cho non-technical audience."
    ],
    process: [
      "Mở đầu bằng Pain Point định lượng được của audience (Cost, Latency, Churn).",
      "Thiết lập Urgency: Tại sao status quo không còn khả thi (Why Now?).",
      "Trình bày Solution Hypothesis bằng một declarative sentence duy nhất.",
      "Chứng minh Feasibility qua Proof of Concept (PoC), benchmarks hoặc case studies.",
      "Trình bày Risk Mitigation Plan thẳng thắn, không né tránh điểm yếu.",
      "Đóng lại bằng Call to Action (CTA) hoặc Request for Decision (RFD) cụ thể."
    ],
    output: [
      "Elevator Pitch (1 câu).",
      "Slide-by-slide Narrative Outline.",
      "Speaker Notes & Talking Points.",
      "Pre-mortem Risk Analysis & FAQ.",
      "Follow-up Memo Draft."
    ],
    guardrails: [
      "KHÔNG overpromise hoặc bóp méo data benchmark.",
      "KHÔNG sử dụng startup jargon/buzzwords vô nghĩa (e.g., 'synergy', 'blockchain-powered' nếu không liên quan).",
      "Mỗi slide/section CHỈ phục vụ một single cognitive purpose."
    ]
  },
  "ai-operating-system": {
    title: "AI Operating System Orchestrator",
    summary: "Điều phối đa agent (NotebookLM, GPT, Claude, Codex, Antigravity) để xử lý workflows phức tạp mà không tạo noise.",
    tags: ["Multi-Agent", "Orchestration", "Productivity"],
    useWhen: [
      "Khi task vượt quá context window hoặc reasoning capacity của một single LLM.",
      "Khi cần pipeline phân mảnh: Research -> Architect -> Implement -> Review -> Document.",
      "Khi muốn chuẩn hóa một ad-hoc prompt chain thành một repeatable playbook."
    ],
    process: [
      "Data Ingestion: Thu thập system facts, logs, specs và source code context.",
      "Intent Clarification: Tinh lọc core problem và defined output schema.",
      "Agent Routing: Phân chia task cho right-sized tools (e.g., Claude cho System Design, Codex cho Implementation).",
      "Adversarial Review: Sử dụng một agent độc lập để critique output của agent thực thi.",
      "Knowledge Archiving: Tổng hợp decisions, prompts và diffs vào long-term memory (NotebookLM/ADR)."
    ],
    output: [
      "Refined Problem Statement.",
      "Agent Routing Matrix & Sequence Diagram.",
      "Context-rich Prompts cho từng step.",
      "Guardrails & Validation Scripts.",
      "Next immediate action."
    ],
    guardrails: [
      "KHÔNG broad-casting cùng một zero-shot prompt cho nhiều models.",
      "Tối kị việc leak production secrets, PII, hoặc proprietary algorithms vào external public LLMs.",
      "Human-in-the-loop: Con người PHẢI là người phê duyệt final state mutation."
    ]
  },
  "daily-ai-learning-coach": {
    title: "Daily AI Learning Coach",
    summary: "Tối ưu hóa quá trình học tập AI/Engineering hàng ngày thông qua micro-practices và artifact generation.",
    tags: ["Continuous Learning", "Habits", "Growth"],
    useWhen: [
      "Khi thiết lập focus blocks buổi sáng để align việc học với daily engineering tasks.",
      "Khi thực hiện retrospective buổi tối để trích xuất reusable prompts hoặc workflows.",
      "Khi cần duy trì skill compounding mà không bị burnout bởi các side projects khổng lồ."
    ],
    process: [
      "Assess: Ghi nhận energy levels, sprint obligations và open technical loops.",
      "Focus: Xác định Top 3 High-Leverage Outcomes (HLOs) cho ngày.",
      "Integrate: Chọn một AI workflow/tool để áp dụng trực tiếp vào một ticket đang làm.",
      "Extract: Tổng hợp kết quả thành một micro-artifact (ADR, cheat sheet, prompt template).",
      "Reflect: Phân tích tool ROI - agent nào mang lại value, agent nào sinh ra hallucination noise."
    ],
    output: [
      "Morning Focus Plan.",
      "Evening Retrospective.",
      "Tối ưu hóa Prompt Template.",
      "Workflow Adjustments.",
      "Next Micro-practice."
    ],
    guardrails: [
      "Giữ timebox cho learning loop dưới 15-20 phút.",
      "Thực hành in-context (trên code thật) thay vì đọc AI tutorials lý thuyết.",
      "Thành quả đo lường bằng tangible artifacts, KHÔNG đo bằng thời gian đọc."
    ]
  },
  "notebooklm-source-of-truth": {
    title: "NotebookLM Source of Truth",
    summary: "Khai thác NotebookLM như một hệ thống RAG tĩnh, cung cấp grounded answers với citations từ proprietary documents.",
    tags: ["NotebookLM", "RAG", "Knowledge Management"],
    useWhen: [
      "Khi context reasoning bắt buộc phải dựa 100% trên internal RFCs, postmortems hoặc codebase docs.",
      "Khi mọi technical claims cần phải có deterministic citations để audit.",
      "Khi cần trích xuất event timelines, architecture invariants từ lượng lớn unstructured text."
    ],
    process: [
      "Sanitize & Redact: Loại bỏ PII và credentials trước khi ingest tài liệu.",
      "Information Extraction: Yêu cầu trích xuất event timelines, dependency graphs hoặc decision logs.",
      "Fact-checking: Yêu cầu mọi output phải đi kèm inline citations.",
      "Contradiction Hunting: Prompt tìm kiếm các conflict giữa các specs hoặc outdated docs.",
      "Synthesis: Tạo actionable outputs như migration checklists, study guides hoặc FAQs."
    ],
    output: [
      "Chronological Timelines.",
      "Grounded, Cited Engineering Claims.",
      "Document Contradictions & Gaps.",
      "Follow-up Exploration Questions.",
      "Actionable Checklists/Guides."
    ],
    guardrails: [
      "PHẢI sanitize data trước khi upload.",
      "KHÔNG sử dụng NotebookLM cho real-time data hoặc code execution.",
      "Tất cả architectural claims PHẢI truy xuất ngược được về source file (Citations)."
    ]
  },
  "ai-delivery-factory": {
    title: "AI Delivery Factory",
    summary: "Pipeline tự động hóa từ Spec đến PR: Requirements -> Architecture -> Implementation -> Verification -> Handoff.",
    tags: ["SDLC", "Automation", "Delivery"],
    useWhen: [
      "Khi execute end-to-end features, complex refactors hoặc framework migrations.",
      "Khi workflow đòi hỏi strict separation of concerns giữa Specification, Coding và Review.",
      "Khi mục tiêu là tối thiểu hóa human boilerplate typing và tối đa hóa human code review."
    ],
    process: [
      "Requirement Phase (GPT/Claude): Phân rã Product Spec thành technical tasks, acceptance criteria và rollout plan.",
      "Design Phase (Claude): Review kiến trúc, xác định boundary conditions, edge cases và data migrations.",
      "Implementation Phase (Codex/Cursor): Code generation có test coverage cho các scoped tasks.",
      "Verification Phase (Antigravity/Local): Chạy test suites, lints, build checks và UI regression.",
      "Review Phase (Claude/GPT): Thực hiện automated diff review, security scan và sinh release notes.",
      "Archive Phase: Ghi nhận ADR và lessons learned vào wiki."
    ],
    output: [
      "Task Execution Slices.",
      "Contextual Prompts cho IDE/Agents.",
      "CI/CD Verification Evidence.",
      "PR Description & Diff Summary.",
      "Stakeholder Release Notes."
    ],
    guardrails: [
      "KHÔNG nhồi nhét epic-level scope vào một single prompt.",
      "Agent sinh code KHÔNG được phép làm agent duyệt code (Segregation of Duties).",
      "KHÔNG bypass unit/integration tests dựa trên lời khẳng định 'code looks good' của AI."
    ]
  },
  "claude-deep-review": {
    title: "Claude Deep Review",
    summary: "Khai thác Claude (Opus/Sonnet) như một Principal Engineer để critique kiến trúc, security và system trade-offs.",
    tags: ["Claude", "Critique", "System Design"],
    useWhen: [
      "Khi cần adversarial thinking để tìm kiếm lỗ hổng trong System Design hoặc RFCs.",
      "Khi kiến trúc tiềm ẩn rủi ro về concurrency, horizontal scalability, CAP theorem trade-offs.",
      "Khi cần tinh chỉnh external communication (postmortems, RCA) sắc bén, thấu cảm và minh bạch."
    ],
    process: [
      "Cung cấp raw context: Diffs, RFCs, DB schemas, hoặc system metrics.",
      "Force constraints: Yêu cầu review theo lăng kính Correctness, Scalability, Security, Privacy và Operability.",
      "Khám phá Unknowns: Prompt Claude chỉ ra các implicit assumptions và blind spots trong thiết kế.",
      "Phân rã lộ trình: Yêu cầu đề xuất Minimum Viable Architecture (MVA) và Long-term Evolution path.",
      "Tổng hợp feedback trước khi cấp quyền execute cho agent khác."
    ],
    output: [
      "Top Critical/Systemic Risks.",
      "Pre-implementation Refactoring suggestions.",
      "Stakeholder Clarification List.",
      "MVP vs. Target State Architecture.",
      "Rollout & Observability Guardrails."
    ],
    guardrails: [
      "Prompt phải ép Claude phản biện gay gắt, KHÔNG chấp nhận các lời khen ngợi xã giao.",
      "Human Tech Lead nắm quyền phủ quyết cuối cùng (Veto power) với các architecture decisions.",
      "Execution phase PHẢI tách biệt sau khi deep review hoàn tất."
    ]
  },
  "career-ai-strategy": {
    title: "Career AI Strategy",
    summary: "Xây dựng chiến lược phát triển sự nghiệp kỹ thuật (Staff/Principal path) thông qua AI leverage và portfolio building.",
    tags: ["Career Development", "Staff Path", "Strategy"],
    useWhen: [
      "Khi thực hiện performance reviews, định hướng thăng tiến hoặc chuyển đổi career tracks.",
      "Khi cần hệ thống hóa tacit knowledge thành public engineering blogs, OSS contributions hoặc talk proposals.",
      "Khi đánh giá ROI của các công nghệ mới và quyết định technical stack bet."
    ],
    process: [
      "Define Thesis: Xác định value proposition cốt lõi của bản thân trên thị trường tech.",
      "Identify Assets: Lập kế hoạch xây dựng 4 pillars: AI Playbooks, Architecture ADRs, Public Writing, OSS/Tools.",
      "Scenario Planning: Xây dựng roadmap 3 năm cho các ngã rẽ: Staff IC, Engineering Management, Solopreneur.",
      "Gap Analysis: Đối chiếu current skills với Staff-level expectations (Scope, Impact, Leadership).",
      "Execution: Thiết lập 90-day OKRs và weekly compounding habits."
    ],
    output: [
      "Personal Career Thesis.",
      "Portfolio of Evidence (Promotability).",
      "Networking & Mentorship Strategy.",
      "Risk Mitigation (Layoffs/AI replacement).",
      "90-day Actionable OKRs."
    ],
    guardrails: [
      "Tập trung vào Business Impact và Engineering Excellence, KHÔNG chạy theo hype titles.",
      "Luôn tài liệu hóa quá trình giải quyết vấn đề khó thành reusable assets.",
      "Duy trì optionality cao, tránh over-fitting vào một framework hoặc vendor duy nhất."
    ]
  },
  "engineering-decision-map": {
    title: "Engineering Decision Map",
    summary: "Phân tích đa chiều một feature từ Business Requirements mapping đến Data Models, Architecture và Production Operations.",
    tags: ["Systems Engineering", "Trade-offs", "Requirements"],
    useWhen: [
      "Giai đoạn Inception: Khi requirement còn mơ hồ và cần thiết lập technical direction foundation.",
      "Khi feature can thiệp sâu vào Core Domain, có risk về Data Consistency (Distributed Transactions) hoặc Integrations.",
      "Khi cần xác định rõ ranh giới: Việc gì có thể giao cho AI gen code, việc gì Human Architect phải chốt."
    ],
    process: [
      "Business Mapping: Xác định Users, Business Outcomes, KPIs, Priority và SLA constraints.",
      "Domain Mapping: Mô hình hóa Bounded Contexts, Aggregates, Entities và State Invariants.",
      "Contract Mapping: Thiết kế Sync/Async boundaries, API signatures, Event Payloads và Idempotency keys.",
      "Data Mapping: Xác định Database schema, Consistency models (ACID/BASE), Indexing và Migration scripts.",
      "Architecture Mapping: Lựa chọn Design patterns (Monolith, CQRS, Event-Driven), Caching strategy và Fault tolerance.",
      "Operations Mapping: Lên kế hoạch Testing, CI/CD, Feature Flags, Rollout phases và Observability."
    ],
    output: [
      "Clarification Backlog.",
      "Systemic Risks & Threat Model.",
      "Architecture Trade-off Analysis.",
      "AI vs. Human Responsibility Matrix.",
      "PR Sequencing & Rollout Verification."
    ],
    guardrails: [
      "KHÔNG viết line code nào nếu Data Models và API Contracts chưa được review.",
      "KHÔNG phớt lờ các rủi ro về Backward Compatibility và Data Migrations.",
      "KHÔNG over-engineer (ví dụ: dùng Kafka/Microservices cho CRUD app) nếu không có non-functional requirements ép buộc."
    ]
  },
  "staff-engineer-ai-review-pack": {
    title: "Staff Engineer AI Review Pack",
    summary: "Triển khai tổ hợp AI personas (Analyst, Architect, Security, QA, SRE) để review toàn diện technical designs.",
    tags: ["Staff Level", "Comprehensive Review", "System Design"],
    useWhen: [
      "Khi PR hoặc RFC có độ phức tạp cao, tác động đến Tier-1 services hoặc xử lý sensitive data.",
      "Khi cần stress-test một architecture design thông qua multi-perspective critique.",
      "Khi cần đảm bảo feature đạt chuẩn Production Readiness trước khi merge."
    ],
    process: [
      "[Analyst]: Rà soát edge cases, missing ACs, và logic holes trong requirements.",
      "[Architect]: Phân tích coupling, cohesion, extensibility và đề xuất 3 alternative designs với trade-offs.",
      "[Security/SRE]: Chạy STRIDE threat modeling, tìm kiếm race conditions, memory leaks, và SPOFs (Single Points of Failure).",
      "[QA]: Thiết kế Test Matrix phủ kín Unit, Integration, E2E, Load và Chaos engineering scenarios.",
      "[Ops]: Kiểm tra SLO impacts, tracing contexts, log levels, alert definitions và runbook procedures."
    ],
    output: [
      "Requirement Ambiguities.",
      "Architecture Alternatives (Pros/Cons).",
      "Adversarial Threat Vectors.",
      "Comprehensive Test Matrix.",
      "Production Readiness Checklist (PRR)."
    ],
    guardrails: [
      "Cung cấp đầy đủ System Context và Quality Gates trong prompt khởi tạo.",
      "Thực hiện critique phase TRƯỚC KHI code implementation bắt đầu.",
      "Các quyết định liên quan đến Data Security và System Architecture cuối cùng PHẢI do Human Staff/Principal duyệt."
    ]
  },
  "data-resilience-observability-review": {
    title: "Data, Resilience & Observability Review",
    summary: "Đánh giá chuyên sâu về độ bền vững của dữ liệu, khả năng chịu lỗi của hệ thống và khả năng giám sát trên production.",
    tags: ["SRE", "Database", "Resilience"],
    useWhen: [
      "Khi PR thay đổi Database Schemas, thêm Caching layers, hoặc integrate với 3rd-party services.",
      "Khi thiết kế hệ thống phải chịu được network partitions, instance failures hoặc traffic spikes (Chaos/Resilience testing).",
      "Khi chuẩn bị checklist cho Go-live, thiết lập Datadog/Grafana dashboards và PagerDuty alerts."
    ],
    process: [
      "Data Layer: Review Isolation levels, Transaction boundaries, N+1 queries, Index scans và schema migration safety (Zero-downtime).",
      "Consistency Layer: Đánh giá Strong vs. Eventual consistency, handling duplicate events, Idempotency tokens, Outbox/Saga patterns.",
      "Resilience Layer: Kiểm tra cấu hình Timeouts, Exponential Backoff Retries, Circuit Breakers, Bulkheads, Rate Limiting và Fallback routes.",
      "Observability Layer: Đảm bảo RED metrics (Rate, Errors, Duration), Distributed Tracing (OpenTelemetry), log formats (JSON), và tuyệt đối KHÔNG leak PII/Secrets vào logs.",
      "Rollout Layer: Rà soát Rollback scripts, Feature toggles, và Data restore procedures."
    ],
    output: [
      "Database/Query Bottlenecks.",
      "Distributed System Failure Risks.",
      "Chaos Testing Scenarios.",
      "Telemetry & Dashboard Specs.",
      "Rollout/Rollback Runbook."
    ],
    guardrails: [
      "KHÔNG introduce Caching nếu chưa định nghĩa rõ Cache Invalidation strategy và Cache Stampede protection.",
      "KHÔNG cấu hình Retry cho các operations không có tính chất Idempotent.",
      "Tín hiệu Go-live PHẢI dựa trên SLI/SLO metrics, không dựa trên cảm tính 'code chạy trên local'."
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

function isVietnameseLocale(locale: string): boolean {
  return locale.toLowerCase().split("-")[0] === "vi";
}

function buildVietnameseSkillMarkdown(skill: LocalizedSkillCopy): string {
  return [
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
  ].join("\n");
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
      markdown: buildVietnameseSkillMarkdown(copy)
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
