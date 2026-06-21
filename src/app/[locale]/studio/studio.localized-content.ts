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
    title: "Review code",
    summary: "Review thay đổi theo correctness, maintainability, test, security và tác động người dùng.",
    tags: ["Code review", "Rủi ro", "Testing"],
    useWhen: [
      "Khi review pull request, local diff hoặc code do AI sinh ra.",
      "Khi cần tìm blocker trước khi bàn tới style hoặc preference.",
      "Khi thay đổi chạm UI, data, security, rollout hoặc tracking."
    ],
    process: [
      "Đọc mục tiêu thay đổi và bề mặt sản phẩm bị ảnh hưởng.",
      "Tìm blocker trước: sai behavior, mất dữ liệu, lỗi security, privacy, build hoặc user flow.",
      "So sánh code với acceptance criteria, không review theo cảm giác.",
      "Kiểm tra empty, loading, error, mobile, accessibility và analytics nếu có UI.",
      "Đọc test để biết bug nào sẽ được bắt lại nếu regression xảy ra.",
      "Viết comment cụ thể theo file/line và nêu hậu quả."
    ],
    output: ["Findings theo severity.", "Câu hỏi còn mở.", "Fix đề xuất.", "Khoảng trống verification."],
    guardrails: [
      "Không khen trước khi liệt kê issue.",
      "Không yêu cầu refactor ngoài scope.",
      "Không block vì preference nếu behavior đúng.",
      "Nếu không có issue, nói rõ và nêu residual risk."
    ]
  },
  "frontend-architecture": {
    title: "Kiến trúc frontend",
    summary: "Lập kế hoạch frontend quanh route, state, component, responsive và tracking.",
    tags: ["Frontend", "Architecture", "UI"],
    useWhen: [
      "Trước khi build hoặc refactor một feature UI.",
      "Khi route mới có state, filter, search, form, CTA hoặc PostHog event.",
      "Khi mobile/tablet là một phần của acceptance criteria."
    ],
    process: [
      "Xác định route boundary và component ownership nhỏ nhất.",
      "Tách server data, client state, visual component và interaction handler.",
      "Liệt kê loading, empty, partial data, error, disabled, mobile và desktop states.",
      "Giữ layout ổn định bằng responsive constraints, không dùng font scale theo viewport.",
      "Tái dùng token, icon, component và motion pattern có sẵn.",
      "Thêm tracking cho navigation, filter, form, CTA, preference và outbound link."
    ],
    output: ["Component tree.", "State model.", "Danh sách event tracking.", "Edge cases.", "Thứ tự implementation."],
    guardrails: [
      "Không biến app/tool thành landing page.",
      "Không dùng nested cards hoặc decoration không thuộc design system.",
      "Mobile và tablet phải được xem như first-class behavior."
    ]
  },
  "backend-architecture": {
    title: "Kiến trúc backend",
    summary: "Định hình backend quanh contract, data ownership, reliability, security và rollout.",
    tags: ["Backend", "API", "Data"],
    useWhen: [
      "Khi thiết kế API, service, job, integration hoặc data workflow.",
      "Khi thay đổi có migration, queue, external dependency hoặc auth.",
      "Khi cần rollout an toàn thay vì chỉ viết endpoint."
    ],
    process: [
      "Định nghĩa service sở hữu gì và chỉ đọc gì.",
      "Viết API/job contract trước implementation detail.",
      "Xác định validation, authorization, idempotency, rate limit và audit.",
      "Map schema migration, backfill, index, retention và privacy.",
      "Thiết kế failure behavior: timeout, retry, DLQ, fallback và alert.",
      "Lập rollout với feature flag, canary, dark launch, migration window và rollback."
    ],
    output: ["Boundary và responsibility.", "Contract.", "Data changes.", "Failure modes.", "Rollout và verification plan."],
    guardrails: [
      "Không che ownership mơ hồ bằng generic utility.",
      "Không thêm async flow nếu chưa có retry và observability.",
      "Không claim production-ready nếu chưa có rollback."
    ]
  },
  "blog-content-writer": {
    title: "Viết blog content",
    summary: "Viết bài kỹ thuật hoặc reflection theo giọng profile bình tĩnh, rõ ràng.",
    tags: ["Blog", "Copywriting", "Content"],
    useWhen: [
      "Khi viết blog, note, technical explainer hoặc bài profile.",
      "Khi cần biến ý tưởng thô thành bài có flow đọc dễ nắm.",
      "Khi bài cần giữ giọng chân thành, không hype và không bán hàng."
    ],
    process: [
      "Mở bằng một tình huống công việc hoặc đời sống cụ thể.",
      "Nối tình huống đó với insight sâu hơn.",
      "Dùng ví dụ, workflow, tool và trade-off thay vì claim trừu tượng.",
      "Chia section rõ khi format cho phép.",
      "Kết bằng một reflection hữu ích hoặc câu hỏi mở."
    ],
    output: ["Title options.", "Hook ngắn.", "Full draft.", "Bản LinkedIn/Facebook nếu cần.", "Ý tưởng bài tiếp theo."],
    guardrails: [
      "Không bịa nguồn.",
      "Không lạm dụng buzzword.",
      "Không viết như landing page khóa học.",
      "Giữ SEO, locale và schema hiện có khi sửa source."
    ]
  },
  "prompt-writing": {
    title: "Viết prompt",
    summary: "Biến yêu cầu mơ hồ thành prompt có cấu trúc và output lặp lại được.",
    tags: ["Prompt", "AI workflow", "Quality"],
    useWhen: [
      "Khi task chưa rõ role, goal, context hoặc output.",
      "Khi cần prompt dùng lại cho Codex, Claude, GPT, Gemini hoặc agent khác.",
      "Khi output cần nhất quán, không chỉ đẹp câu chữ."
    ],
    process: [
      "Xác định role của AI.",
      "Viết goal cụ thể và acceptance criteria.",
      "Cung cấp context, constraints, ví dụ và nguồn liên quan.",
      "Nêu process AI phải theo.",
      "Chốt output format, tone, length và verification.",
      "Thêm guardrails: điều cần tránh, lúc nào phải hỏi lại."
    ],
    output: ["Prompt cuối.", "Vì sao cấu trúc này phù hợp.", "Bản ngắn hơn nếu dùng trong chat."],
    guardrails: [
      "Không làm prompt dài hơn nhu cầu thật.",
      "Không để AI đoán fact quan trọng.",
      "Tối ưu cho work hữu ích, không chỉ câu trả lời bóng bẩy."
    ]
  },
  "status-report": {
    title: "Report daily, weekly, monthly",
    summary: "Tạo status report ngắn gọn với progress, risk, blocker và next action.",
    tags: ["Report", "Daily", "Weekly"],
    useWhen: [
      "Khi cần cập nhật tiến độ theo ngày, tuần hoặc tháng.",
      "Khi phải nói rõ impact, risk và quyết định cần người khác hỗ trợ.",
      "Khi muốn tránh report dạng liệt kê activity rời rạc."
    ],
    process: [
      "Tách fact khỏi interpretation.",
      "Nêu impact trước activity.",
      "Đưa risk lên sớm và gắn owner hoặc next action.",
      "Giữ độ chi tiết đúng với audience.",
      "Nêu điều thay đổi so với report trước."
    ],
    output: ["Executive summary.", "Shipped / completed.", "In progress.", "Risks and blockers.", "Next plan.", "Decisions needed."],
    guardrails: [
      "Daily ngắn và tập trung blocker.",
      "Weekly nói progress, risk, scope và việc sắp tới.",
      "Monthly nói outcome, metric, lesson và điều chỉnh chiến lược."
    ]
  },
  "doc-spec-tech-spec": {
    title: "Doc, spec, tech spec",
    summary: "Viết spec nối product intent, technical plan, risk và verification.",
    tags: ["Spec", "Tech spec", "Documentation"],
    useWhen: [
      "Khi cần product spec, technical spec, RFC hoặc implementation plan.",
      "Khi thay đổi có dependency, owner, data, rollout hoặc security concern.",
      "Khi cần document để reviewer ra quyết định."
    ],
    process: [
      "Viết context, problem và user impact.",
      "Tách goals và non-goals.",
      "Mô tả user flow hoặc system flow.",
      "Đưa proposed solution và alternatives.",
      "Nêu data/API/component changes.",
      "Ghi risks, security, privacy, accessibility và observability.",
      "Chốt rollout, migration, rollback, test và acceptance criteria."
    ],
    output: ["Decision-ready spec.", "Open questions.", "Implementation checklist.", "Review checklist."],
    guardrails: [
      "Không giấu unknowns.",
      "Không biến assumption thành requirement.",
      "Không bỏ rollback hoặc verification cho production changes."
    ]
  },
  "proposal-slide-pitch": {
    title: "Proposal, slide, pitch deck",
    summary: "Frame proposal hoặc deck quanh audience, problem, option value, proof và quyết định tiếp theo.",
    tags: ["Proposal", "Slide", "Pitch"],
    useWhen: [
      "Khi cần internal buy-in, proposal, product pitch hoặc slide outline.",
      "Khi audience cần ra quyết định chứ không chỉ đọc thông tin.",
      "Khi phải nêu risk rõ nhưng vẫn giữ narrative mạch lạc."
    ],
    process: [
      "Bắt đầu bằng vấn đề của audience.",
      "Giải thích vì sao thời điểm này quan trọng.",
      "Nói solution trong một câu rõ.",
      "Chứng minh feasibility bằng data, ví dụ hoặc technical evidence.",
      "Nêu risk thật.",
      "Kết bằng quyết định hoặc next step cụ thể."
    ],
    output: ["One-line narrative.", "Slide-by-slide outline.", "Speaker notes.", "Risk và objection handling.", "Follow-up email draft."],
    guardrails: [
      "Không overclaim.",
      "Không dùng startup language chung chung.",
      "Mỗi slide chỉ nên làm một việc."
    ]
  },
  "ai-operating-system": {
    title: "AI operating system",
    summary: "Điều phối NotebookLM, GPT, Claude, Codex và Antigravity mà không tạo nhiễu AI.",
    tags: ["AI OS", "Tool routing", "Compounding"],
    useWhen: [
      "Khi bài toán rộng và cần biết tool nào làm phần nào.",
      "Khi context đang rời rạc giữa nhiều AI.",
      "Khi muốn biến một lần làm thành playbook dùng lại."
    ],
    process: [
      "Capture fact và source material trước.",
      "Clarify vấn đề thật và outcome mong muốn.",
      "Route việc qua tool chain nhỏ nhất đủ dùng.",
      "Cho một AI execute và một AI khác review khi risk đáng kể.",
      "Archive decision, prompt, result và lesson learned."
    ],
    output: ["Problem statement.", "Tool sequence phù hợp.", "Prompt cho từng tool.", "Risks và guardrails.", "Next action hôm nay."],
    guardrails: [
      "Không hỏi mọi tool cùng một câu mơ hồ.",
      "Không upload secrets, private keys, customer data hoặc dữ liệu công ty nhạy cảm vào personal AI.",
      "Final decision vẫn thuộc về người owner."
    ]
  },
  "daily-ai-learning-coach": {
    title: "Daily AI learning coach",
    summary: "Biến mỗi ngày thành vòng học AI nhỏ: một practice, một artifact, một review.",
    tags: ["Daily learning", "Habit", "AI literacy"],
    useWhen: [
      "Buổi sáng để chọn practice AI phù hợp với việc thật.",
      "Buổi tối để rút ra prompt, workflow hoặc lesson có thể lưu lại.",
      "Khi muốn nâng skill đều mà không biến học thành dự án nặng."
    ],
    process: [
      "Ghi energy, obligations, open loops và skill AI muốn luyện.",
      "Chọn top 3 outcomes cho ngày.",
      "Chọn một workflow AI để thực hành.",
      "Lưu một artifact nhỏ: prompt, checklist, decision, lesson hoặc example.",
      "Review cuối ngày: tool nào giúp, tool nào gây nhiễu."
    ],
    output: ["Plan sáng.", "Review tối.", "Prompt improvement.", "Workflow improvement.", "Practice tiếp theo."],
    guardrails: [
      "Giữ loop dưới 15 phút.",
      "Ưu tiên một experiment thực tế hơn năm mẹo AI chung chung.",
      "Kết thúc bằng artifact được lưu, không chỉ cảm giác productive."
    ]
  },
  "notebooklm-source-of-truth": {
    title: "NotebookLM source of truth",
    summary: "Dùng NotebookLM như knowledge base có nguồn cho học tập, career, finance và work memory.",
    tags: ["NotebookLM", "Knowledge base", "Citations"],
    useWhen: [
      "Khi câu trả lời phải bám vào tài liệu upload thay vì trí nhớ chung.",
      "Khi cần citations cho claim quan trọng.",
      "Khi muốn gom notes, docs, transcript, RFC, review hoặc decision log."
    ],
    process: [
      "Upload source phù hợp và đã redacted.",
      "Yêu cầu timeline các ý chính hoặc sự kiện.",
      "Yêu cầu claim có citations.",
      "Tìm mâu thuẫn hoặc dữ liệu còn thiếu.",
      "Tạo action plan 30 ngày hoặc study output."
    ],
    output: ["Timeline.", "Source-backed claims.", "Contradictions.", "Next questions.", "Study guide, flashcards, quiz hoặc practice projects."],
    guardrails: [
      "Redact sensitive data trước khi upload.",
      "Không dùng NotebookLM như chuyên gia cuối cùng cho medical, legal hoặc financial decision.",
      "Claim quan trọng phải có citation."
    ]
  },
  "ai-delivery-factory": {
    title: "AI delivery factory",
    summary: "Chia việc engineering qua GPT, Claude, Codex và Antigravity từ spec đến PR đã verify.",
    tags: ["Codex", "Antigravity", "Delivery"],
    useWhen: [
      "Khi làm feature, bugfix, refactor, migration hoặc prototype có UI.",
      "Khi cần nhiều bước: spec, review, implement, verify, release note.",
      "Khi muốn giữ diff nhỏ và review được."
    ],
    process: [
      "GPT tạo PRD, acceptance criteria, task slice, rollout và test plan.",
      "Claude review architecture, hidden assumptions, migration risk và edge cases.",
      "Codex implement repo task có scope rõ và test.",
      "Antigravity verify UI/browser flow và tạo artifact.",
      "Claude hoặc GPT review final diff, risk, release note và stakeholder update.",
      "NotebookLM archive PRD, RFC, decision và lesson."
    ],
    output: ["Task slices.", "Codex prompt skeleton.", "Verification evidence.", "PR-ready summary.", "Release/handoff note."],
    guardrails: [
      "Không giao một task quá lớn cho một agent.",
      "Không để AI implement cũng là reviewer duy nhất cho thay đổi risk cao.",
      "Không bỏ test chỉ vì agent nói code ổn."
    ]
  },
  "claude-deep-review": {
    title: "Claude deep review",
    summary: "Dùng Claude như reviewer suy luận chậm cho architecture, writing, PR và communication nhạy cảm.",
    tags: ["Claude", "Architecture", "Critique"],
    useWhen: [
      "Khi cần critique sâu hơn tốc độ execute.",
      "Khi design có scalability, operability, security hoặc migration risk.",
      "Khi cần viết communication rõ nhưng không quá cứng."
    ],
    process: [
      "Đưa context RFC/spec/diff summary.",
      "Yêu cầu review correctness, scalability, operability, security, privacy, migration và maintainability.",
      "Bắt Claude nêu hidden assumptions.",
      "Yêu cầu minimum viable version và long-term version.",
      "Sau review mới giao Codex/local tools execute."
    ],
    output: ["Top risks.", "Thay đổi nên làm trước implementation.", "Questions for stakeholders.", "MVP vs long-term.", "Suggested tests hoặc rollout guardrails."],
    guardrails: [
      "Yêu cầu Claude challenge assumption, không chỉ polish wording.",
      "Final decision vẫn thuộc human owner.",
      "Execution nên chuyển sang Codex hoặc local tools sau khi review rõ."
    ]
  },
  "career-ai-strategy": {
    title: "Career AI strategy",
    summary: "Dùng AI để xây evidence Staff-level, public writing, architecture portfolio và automation assets.",
    tags: ["Career", "Staff Engineer", "Portfolio"],
    useWhen: [
      "Khi review tuần/tháng về career leverage.",
      "Khi cần biến learning thành evidence nhìn thấy được.",
      "Khi cân nhắc Staff/Principal, EM/Director hoặc consulting/founder option."
    ],
    process: [
      "Viết career thesis hiện tại.",
      "Chọn bốn asset: AI Engineering Playbook, Architecture Portfolio, Public Writing, Automation Products.",
      "Tạo 3-year strategy theo từng scenario.",
      "Xác định evidence cần có cho từng role.",
      "Chốt 90-day actions và 1-year milestones."
    ],
    output: ["Career thesis.", "Portfolio evidence.", "Network strategy.", "Risks.", "90-day plan.", "Weekly AI usage."],
    guardrails: [
      "Tập trung evidence, không chạy theo title.",
      "Biến learning thành artifact.",
      "Giữ optionality thay vì khóa cứng một con đường."
    ]
  },
  "engineering-decision-map": {
    title: "Engineering decision map",
    summary: "Phân tích feature từ business need đến domain, contract, data, architecture, implementation, rollout và operation.",
    tags: ["Architecture", "Trade-off", "Production"],
    useWhen: [
      "Khi requirement vừa tới và cần lead technical direction trước khi code.",
      "Khi feature có data, consistency, integration hoặc rollout risk.",
      "Khi cần biết phần nào AI làm được và phần nào human phải quyết."
    ],
    process: [
      "Map business need: user, outcome, priority, metric, deadline.",
      "Map domain/use case: entity, aggregate, state transition, invariant.",
      "Map API/contract/workflow: sync/async, idempotency, versioning.",
      "Map data/consistency: schema, transaction, index, migration.",
      "Map architecture/patterns: monolith, event, CQRS, cache, resilience.",
      "Map implementation, test, rollout và observability."
    ],
    output: ["Questions.", "Risks.", "Options.", "Trade-offs.", "AI tasks.", "Human decisions.", "PR sequence.", "Verification plan."],
    guardrails: [
      "Không nhảy từ requirement sang code.",
      "Không che data consistency hoặc migration risk.",
      "Không đề xuất Event Sourcing, CQRS, microservices hoặc cache nếu chưa có lý do."
    ]
  },
  "staff-engineer-ai-review-pack": {
    title: "Staff engineer AI review pack",
    summary: "Dùng AI như requirement analyst, architect, adversarial reviewer, test strategist và production reviewer.",
    tags: ["Staff reflex", "Review", "AI workflow"],
    useWhen: [
      "Khi cần review requirement, design, PR hoặc rollout plan từ nhiều góc senior.",
      "Khi muốn AI phản biện thay vì chỉ hỗ trợ viết.",
      "Khi task có production risk."
    ],
    process: [
      "Requirement analyst tìm ambiguity và missing acceptance criteria.",
      "Architect đề xuất 3 option và so sánh trade-off.",
      "Adversarial reviewer tìm race, consistency, security, performance và failure scenarios.",
      "Test strategist tạo test matrix.",
      "Production readiness reviewer kiểm observability, alert, runbook, rollout, rollback và SLO impact."
    ],
    output: ["Clarification questions.", "Architecture options.", "Adversarial risks.", "Test matrix.", "Production readiness checklist."],
    guardrails: [
      "Luôn đưa context, constraints và quality bar.",
      "Hỏi critique trước implementation.",
      "Architecture và production decision cuối cùng vẫn thuộc human owner."
    ]
  },
  "data-resilience-observability-review": {
    title: "Review data, resilience, observability",
    summary: "Review database, indexing, consistency, dependency failure, cache behavior và production signals.",
    tags: ["Data", "Resilience", "Observability"],
    useWhen: [
      "Khi feature chạm database, external dependency, cache, event hoặc production traffic.",
      "Khi cần biết liệu design có chịu được failure path không.",
      "Khi phải chuẩn bị dashboard, alert và rollback trước rollout."
    ],
    process: [
      "Review schema, transaction boundary, isolation, index và query plan.",
      "Review migration có online được không và rollback/restore đã test chưa.",
      "Review consistency: strong vs eventual, duplicate events, idempotency, Saga/Outbox/CQRS/Event Sourcing.",
      "Review resilience: timeout, retry, Circuit Breaker, Bulkhead, rate limit, fallback.",
      "Review observability: business metric, technical metric, log không leak PII, trace, dashboard, alert, runbook."
    ],
    output: ["Blockers.", "Design risks.", "Suggested tests.", "Monitoring plan.", "Rollout guardrails."],
    guardrails: [
      "Không thêm cache nếu chưa rõ source of truth và invalidation.",
      "Không retry operation không idempotent.",
      "Không rollout nếu không biết signal nào chứng minh feature khỏe."
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
