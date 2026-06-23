import { reactFlowArchitectureDemo } from "./studio.react-flow-architecture-demo";

export type StudioNoteStatus = "ready" | "draft" | "next";

export type StudioCommand = {
  label: string;
  command: string;
  note?: string;
};

export type StudioLink = {
  label: string;
  href: string;
  note?: string;
};

export type StudioChecklistItem = {
  label: string;
  detail?: string;
  checked?: boolean;
};

export type StudioNoteSection = {
  heading: string;
  body: string;
};

export type StudioNote = {
  id: string;
  folderId: string;
  title: string;
  subtitle: string;
  status: StudioNoteStatus;
  updatedAt: string;
  tags: string[];
  summary: string;
  sections: StudioNoteSection[];
  commands?: StudioCommand[];
  links?: StudioLink[];
  checklist?: StudioChecklistItem[];
};

export type StudioFolderGroup = {
  label: string;
  noteIds: string[];
};

export type StudioFolder = {
  id: string;
  label: string;
  subtitle: string;
  icon: "brain" | "laptop" | "terminal" | "palette" | "book";
  groups: StudioFolderGroup[];
};

export type BlogRoadmapStatus = "ready" | "outline" | "research";

export type BlogRoadmapEntry = {
  day: number;
  title: string;
  angle: string;
  intent: string;
  format: string;
  estimatedMinutes: number;
  status: BlogRoadmapStatus;
  ticketLabel: string;
};

export type BlogRoadmapTopic = {
  id: string;
  categorySlug: string;
  title: string;
  tagline: string;
  cadence: string;
  entries: BlogRoadmapEntry[];
};

export type StudioAiSkill = {
  id: string;
  category: "engineering" | "content" | "operations" | "communication" | "strategy" | "learning";
  title: string;
  summary: string;
  tags: string[];
  markdown: string;
};

export type StudioChecklistStep = {
  id: string;
  label: string;
  detail?: string;
  children?: StudioChecklistStep[];
};

export type StudioChecklistSection = {
  id: string;
  title: string;
  detail: string;
  steps: StudioChecklistStep[];
};

export type StudioWorkflowChecklist = {
  id: string;
  title: string;
  summary: string;
  whenToUse: string;
  tags: string[];
  sections: StudioChecklistSection[];
};

export type StudioFlowStep = {
  id: string;
  title: string;
  detail: string;
  evidence: string;
  output: string;
};

export type StudioFlowArchitectureNodeKind =
  | "input"
  | "default"
  | "output"
  | "group"
  | "service"
  | "gateway"
  | "database"
  | "queue"
  | "topic"
  | "cache"
  | "worker"
  | "external"
  | "decision"
  | "risk"
  | "note";

export type StudioFlowArchitectureTone =
  | "source"
  | "process"
  | "agent"
  | "review"
  | "output"
  | "storage"
  | "event"
  | "external"
  | "risk";

export type StudioFlowArchitectureNodeSpec = {
  id: string;
  kind: StudioFlowArchitectureNodeKind;
  tone: StudioFlowArchitectureTone;
  title: string;
  detail: string;
  badge: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
};

export type StudioFlowArchitectureEdgeSpec = {
  id: string;
  source: string;
  target: string;
  type: "default" | "straight" | "step" | "smoothstep" | "simplebezier";
  label: string;
  tone: StudioFlowArchitectureTone;
  marker?: "arrow" | "arrowClosed";
  animated?: boolean;
};

export type StudioFlowArchitectureDemo = {
  sections: {
    title: string;
    items: string[];
  }[];
  nodes: StudioFlowArchitectureNodeSpec[];
  edges: StudioFlowArchitectureEdgeSpec[];
};

export type StudioFlow = {
  id: string;
  groupId: string;
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  useWhen: string;
  outcome: string;
  officeExample: string;
  tags: string[];
  steps: StudioFlowStep[];
  artifacts: string[];
  cvSignals: string[];
  architectureDemo?: StudioFlowArchitectureDemo;
};

export type StudioFlowGroup = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  flowIds: string[];
};

export const studioCapturedAt = "2026-06-21";

const roadmapStatuses: BlogRoadmapStatus[] = ["ready", "outline", "research"];

function buildRoadmapEntries(
  topicId: string,
  titles: string[],
  angles: string[],
  intents: string[]
): BlogRoadmapEntry[] {
  return titles.map((title, index) => ({
    day: index + 1,
    title,
    angle: angles[index % angles.length],
    intent: intents[index % intents.length],
    format: index % 5 === 0 ? "field guide" : index % 3 === 0 ? "case note" : "explainer",
    estimatedMinutes: 45 + (index % 4) * 15,
    status: roadmapStatuses[index % roadmapStatuses.length],
    ticketLabel: `${topicId.toUpperCase()}-${String(index + 1).padStart(2, "0")}`
  }));
}

export const blogRoadmapTopics: BlogRoadmapTopic[] = [
  {
    id: "architecture",
    categorySlug: "architecture",
    title: "Source & Architecture",
    tagline: "Structure code so it survives growth, teams, and change.",
    cadence: "One architecture article per day for 30 days.",
    entries: buildRoadmapEntries(
      "architecture",
      [
        "Module boundaries before folder names",
        "A small service still needs an architecture",
        "Dependency direction in plain language",
        "When shared libraries become shared pain",
        "Ports and adapters in a small product",
        "Clean architecture without ceremony",
        "Feature folders versus layer folders",
        "How to split a large component carefully",
        "The first useful architecture diagram",
        "Why data ownership changes everything",
        "Event-driven architecture without hype",
        "Timeouts, retries, and the cost of hope",
        "Caching as a contract, not a trick",
        "Scaling the database in the right order",
        "The hidden price of microservices",
        "A practical monolith health checklist",
        "API contracts that age well",
        "Observability as a design choice",
        "How to choose a boundary by change rate",
        "Architecture decisions for future teammates",
        "Refactoring toward a clearer core",
        "When a queue helps and when it hides delay",
        "CQRS only after the simple model hurts",
        "Resilience patterns for ordinary teams",
        "A day-one checklist for new services",
        "Naming things by responsibility",
        "The architecture review before the rewrite",
        "How technical debt shows up in handoffs",
        "Keeping diagrams close to the code",
        "A calm path from messy to maintainable"
      ],
      [
        "Use a familiar codebase moment, then show the trade-off.",
        "Compare the tempting shortcut with the maintenance cost.",
        "Explain the idea through a small team delivery scenario."
      ],
      ["teach", "decision support", "team alignment"]
    )
  },
  {
    id: "culture",
    categorySlug: "culture",
    title: "Engineering Culture",
    tagline: "Reviews, feedback, mentorship, and teams that grow people.",
    cadence: "One culture article per day for 30 days.",
    entries: buildRoadmapEntries(
      "culture",
      [
        "Code review as shared thinking",
        "How to disagree without slowing the team",
        "The pull request that reviewers can trust",
        "Feedback that leaves the door open",
        "Mentoring without taking over the keyboard",
        "Why kind engineering still needs standards",
        "The quiet cost of vague ownership",
        "How juniors learn from visible decisions",
        "A better way to ask for help",
        "When senior engineers should write less code",
        "Team rituals that earn their calendar space",
        "How to recover after a tense review",
        "The difference between speed and pressure",
        "Building trust with small promises kept",
        "Why onboarding is architecture too",
        "The meeting after the incident",
        "How to make estimates less personal",
        "A calm script for difficult feedback",
        "Keeping standards without gatekeeping",
        "When silence in a team becomes a signal",
        "The reviewer as a future reader",
        "Helping without becoming the bottleneck",
        "How healthy teams handle unfinished work",
        "The cost of hero culture",
        "Writing docs as care for future teammates",
        "The useful senior engineer checklist",
        "How to notice burnout before performance drops",
        "Making room for different working styles",
        "Why clarity is kinder than softness",
        "A team culture that can survive pressure"
      ],
      [
        "Start from an ordinary team interaction.",
        "Keep the lesson practical and non-preachy.",
        "Name the behavior, then show the better pattern."
      ],
      ["reflection", "team practice", "mentorship"]
    )
  },
  {
    id: "ai",
    categorySlug: "ai",
    title: "AI & The Future",
    tagline: "From context engineering to reliable production AI products.",
    cadence: "One AI article per day for 30 days.",
    entries: buildRoadmapEntries(
      "ai",
      [
        "From prompts to workflows",
        "Context engineering for everyday developers",
        "When an AI answer needs a test",
        "The habit of asking AI for trade-offs",
        "Agents as teammates with boundaries",
        "How to review AI-written code",
        "The quiet risk of cognitive debt",
        "What to automate after you understand it",
        "A practical AI workflow for pull requests",
        "Why examples beat long instructions",
        "The difference between chat and system design",
        "AI literacy for non-AI engineers",
        "How to keep judgment in the loop",
        "The debugging prompt that starts with evidence",
        "Using AI to learn without outsourcing learning",
        "A small eval before a big claim",
        "Agent handoffs that do not lose context",
        "The cost of trusting a fluent answer",
        "How product teams should describe AI features",
        "From prototype demo to production behavior",
        "AI tools for reading a codebase",
        "Where AI helps in incident response",
        "Writing better tickets for coding agents",
        "The security review for AI-assisted changes",
        "How to measure time saved honestly",
        "When not to use an agent",
        "Building AI features around user trust",
        "The future role of the software engineer",
        "A calm checklist for adopting new AI tools",
        "Working smarter without becoming careless"
      ],
      [
        "Ground the AI idea in a real engineering workflow.",
        "Separate useful automation from unclear hype.",
        "Show how the human keeps responsibility."
      ],
      ["practical AI", "risk management", "workflow design"]
    )
  },
  {
    id: "ways-of-working",
    categorySlug: "ways-of-working",
    title: "Ways of Working",
    tagline: "How software teams actually operate and deliver together.",
    cadence: "One working-method article per day for 30 days.",
    entries: buildRoadmapEntries(
      "ways",
      [
        "Agile ceremonies as feedback loops",
        "Scrum without pretending the plan is perfect",
        "The daily standup that changes decisions",
        "Sprint planning as risk discovery",
        "Why estimates are conversations",
        "Definition of done that prevents rework",
        "Release planning with value and risk",
        "The BA role in unclear work",
        "How product owners protect focus",
        "QA as a partner before the end",
        "Working in a startup without chaos as identity",
        "Working in a big company without disappearing",
        "Outsourcing and the problem of context",
        "The handoff that keeps ownership alive",
        "How to write requirements people can test",
        "User stories that do not hide complexity",
        "A practical pre-mortem for delivery",
        "When the roadmap meets real capacity",
        "How teams decide what not to do",
        "Managing dependencies without blame",
        "The calm way to handle scope changes",
        "Retrospectives that change one behavior",
        "Why WIP limits are a kindness",
        "The difference between busy and moving",
        "How to make blockers visible early",
        "A better way to use status updates",
        "The release note as a delivery artifact",
        "How to compare company delivery cultures",
        "When process is helping and when it is hiding",
        "A month of better software teamwork"
      ],
      [
        "Explain the ceremony through a real delivery pressure.",
        "Keep the advice useful for BA, PM, QA, and engineers.",
        "Focus on trade-offs rather than a process slogan."
      ],
      ["delivery practice", "team operating model", "planning"]
    )
  },
  {
    id: "perspectives",
    categorySlug: "perspectives",
    title: "Perspectives & Field Notes",
    tagline: "Personal reflections from work, learning, people, and career growth.",
    cadence: "One reflective field note per day for 30 days.",
    entries: buildRoadmapEntries(
      "perspectives",
      [
        "The small habit that changed how I read work",
        "A quiet lesson from a delayed release",
        "Why preparation often looks invisible",
        "The day I learned to ask a clearer question",
        "How a messy desk explains technical debt",
        "The difference between patience and waiting",
        "What a long commute teaches about energy",
        "The skill of noticing weak signals",
        "Why progress feels slow while it is happening",
        "A note about ambition and attention",
        "Learning from people who work differently",
        "When being helpful becomes too expensive",
        "The private cost of context switching",
        "A better relationship with unfinished work",
        "What I learned from a simple checklist",
        "The calm after choosing a smaller scope",
        "Why good systems feel boring",
        "The courage to write the first rough note",
        "How to protect your attention gently",
        "The difference between confidence and evidence",
        "Why quiet consistency compounds",
        "A reflection on asking for feedback",
        "The work behind a clean final result",
        "How to stay kind under pressure",
        "The hidden value of a clear handoff",
        "What a failed plan can still teach",
        "The career lesson inside repeated practice",
        "Why the right pace is sometimes slower",
        "A note for the next difficult week",
        "The month that becomes visible later"
      ],
      [
        "Open with a small everyday scene.",
        "Connect the moment to work, learning, or growth.",
        "Leave the reader with a calm reflection."
      ],
      ["reflection", "career growth", "learning"]
    )
  }
];

export const blogRoadmapTicketChecklist = [
  "Confirm the selected locale and canonical category path.",
  "Create one focused Multica ticket per roadmap article.",
  "Attach the target title, angle, intent, and source category.",
  "Keep article metadata aligned with the existing blog schema.",
  "Run content checks before marking a writing ticket ready."
];

const baseStudioAiSkills: StudioAiSkill[] = [
  {
    id: "code-review",
    category: "engineering",
    title: "Code Review Expert",
    summary: "Review diffs like a Staff engineer: correctness first, security/privacy next, then maintainability, tests, and operational risk.",
    tags: ["Code Review", "Correctness", "Security", "Test Strategy"],
    markdown: `# Code Review Skill

Use this skill when reviewing pull requests, local diffs, generated code, refactors, migrations, or production bug fixes.

## Required Context
- The stated intent of the change, acceptance criteria, and user-facing behavior.
- The changed files, surrounding ownership boundaries, existing tests, and relevant runtime constraints.
- Any affected auth model, data model, analytics event, SEO path, feature flag, or rollout plan.

## Review Process
1. Validate intent: compare the diff against the requirement and identify missing behavior, accidental scope, or stale assumptions.
2. Prove correctness: inspect control flow, state transitions, boundary conditions, concurrency, nullability, idempotency, and failure paths.
3. Threat model the change: check OWASP Top 10, injection surfaces, authz/authn bypass, IDOR, CSRF/XSS, secrets, PII, and tenant isolation.
4. Assess architecture: flag coupling, leaky abstractions, cyclic dependencies, API compatibility breaks, schema drift, and long-term maintenance cost.
5. Check performance and operations: look for N+1 queries, algorithmic blowups, memory pressure, hydration regressions, observability gaps, and rollback risk.
6. Evaluate verification: confirm unit, integration, E2E, contract, accessibility, and regression tests match the changed behavior.

## Code Shape Review
- Data structures: confirm arrays, maps, sets, queues, trees, indexes, caches, and DTOs fit the access pattern instead of making every lookup or grouping O(n) by accident.
- Design patterns: prefer common, recognizable patterns only where they reduce complexity: Strategy for replaceable rules, Factory for creation policy, Adapter for external APIs, Repository for persistence boundaries, and State Machine for multi-step workflows.
- Clean architecture: domain rules should not depend on UI, framework, transport, ORM, analytics, or vendor SDK details; dependencies should point inward.
- Service boundaries: keep orchestration in application services, business rules in domain services, persistence behind repositories or gateways, and infrastructure concerns at the edge.
- Utility extraction: move reusable pure transforms, formatters, validators, parsers, and mappers into focused helpers; do not hide stateful business behavior inside generic utils.
- Function quality: functions should have one reason to change, clear inputs/outputs, small branching surface, typed errors where useful, and names that describe intent rather than implementation.

## Output Format
- Findings first, ordered by severity: Blocker, Major, Minor, Nit.
- Each finding must include file/line, observed evidence, impact, and the smallest practical fix.
- Include open questions only when they materially affect correctness, security, rollout, or product behavior.
- End with residual risk and verification gaps.

## Guardrails
- Do not spend review budget on personal style preferences when behavior, convention, and tests are sound.
- Do not approve new business logic without meaningful verification.
- Do not rewrite the whole design unless the current design creates measurable risk.
`
  },
  {
    id: "frontend-architecture",
    category: "engineering",
    title: "Frontend Architecture",
    summary: "Shape frontend systems around route boundaries, state ownership, accessibility, telemetry, and Core Web Vitals.",
    tags: ["Frontend", "React", "Web Vitals", "Accessibility"],
    markdown: `# Frontend Architecture Skill

Use this skill when designing routes, dashboards, component systems, forms, filters, search UIs, or frontend refactors.

## Required Context
- Target users, core workflow, device classes, locale behavior, and SEO requirements.
- Current routing framework, data fetching pattern, design system, analytics taxonomy, and accessibility baseline.
- Constraints around authentication, personalization, caching, hydration, and browser support.

## Architecture Process
1. Define route and layout boundaries, including loading, empty, error, partial-data, permission, and not-found states.
2. Choose rendering mode deliberately: SSR, SSG, ISR, CSR, streaming, or client-only islands based on freshness, SEO, privacy, and personalization.
3. Build a state taxonomy: server state, URL state, durable preferences, global app state, form state, and ephemeral component state.
4. Design component ownership: compose small primitives, keep domain logic outside visual shells, and avoid prop drilling through unrelated layers.
5. Protect interaction quality: keyboard access, focus management, ARIA semantics, reduced motion, color contrast, and responsive constraints.
6. Set a performance and analytics plan: LCP, INP, CLS, bundle budgets, event names, PageTracker usage, and meaningful funnel events.

## Output Format
- Route and component map with ownership boundaries.
- State and data-fetching plan with cache invalidation rules.
- UX state matrix for loading, empty, error, disabled, success, and responsive behavior.
- Performance, accessibility, and analytics checklist.
- Implementation slices ordered by risk.

## Guardrails
- Do not create global state for local interaction details.
- Do not ship a visual surface without keyboard, screen reader, and mobile behavior.
- Do not change existing analytics or locale behavior without an explicit migration plan.
`
  },
  {
    id: "backend-architecture",
    category: "engineering",
    title: "Backend Architecture",
    summary: "Design backend systems with clear domain ownership, explicit contracts, resilient data flows, and operable failure modes.",
    tags: ["Backend", "API Design", "Distributed Systems", "Reliability"],
    markdown: `# Backend Architecture Skill

Use this skill for APIs, services, background jobs, webhooks, event streams, data migrations, and integrations.

## Required Context
- Business invariant, owning domain, consumers, service boundaries, data classification, and compliance obligations.
- Expected throughput, latency SLOs, consistency requirements, durability requirements, and cost constraints.
- Current deployment model, observability stack, rollback path, and operational owner.

## Architecture Process
1. Model the domain: bounded contexts, aggregates, invariants, ownership of reads/writes, and lifecycle events.
2. Select topology: modular monolith, service extraction, serverless, queue-backed worker, or event-driven flow based on operational need.
3. Specify contracts first: OpenAPI, gRPC, AsyncAPI, event schemas, idempotency keys, pagination, error taxonomy, and versioning.
4. Design persistence: schema, indexes, migration plan, retention, encryption, backup/restore, and consistency model.
5. Build resilience: timeouts, retry budgets, backoff with jitter, DLQ, circuit breakers, bulkheads, rate limiting, and graceful degradation.
6. Define operability: structured logs, traces, metrics, alerts, runbooks, canary/feature flags, and rollback triggers.

## Output Format
- Domain and responsibility map.
- API/event contract with failure modes.
- Data model and migration strategy.
- Resilience, security, and observability plan.
- Rollout, rollback, and disaster recovery plan.

## Guardrails
- Prefer the simplest topology that preserves the invariant and meets SLOs.
- Do not introduce async processing without idempotency, observability, and replay semantics.
- Do not call a design production-ready without rollback and data recovery.
`
  },
  {
    id: "blog-content-writer",
    category: "content",
    title: "Technical Content Strategist",
    summary: "Write technical content with a clear thesis, grounded evidence, semantic SEO, and calm expert authority.",
    tags: ["Technical Writing", "SEO", "Editorial Strategy"],
    markdown: `# Blog Content Writer Skill

Use this skill for engineering articles, technical explainers, architectural postmortems, product notes, and public documentation.

## Required Context
- Target reader, publication surface, locale, category path, search intent, and desired level of technical depth.
- Existing voice, reserved technical terms, source material, diagrams, code snippets, and SEO metadata pattern.
- Claims that require citation, examples that must stay anonymous, and constraints around tone or privacy.

## Writing Process
1. Define the thesis: one specific claim the article will prove, not a broad topic label.
2. Open from a concrete situation: code review, outage, product trade-off, messy requirement, slow dashboard, or daily work moment.
3. Build the reader's model: explain terms, context, trade-offs, and constraints before prescribing a solution.
4. Prove with specifics: architecture diagrams, workflows, code, benchmarks, standards, source citations, or realistic failure modes.
5. Optimize structure: precise H1/H2/H3 hierarchy, natural keywords, internal links, meta title, meta description, and canonical path.
6. Close with a usable takeaway: a mental model, checklist, decision rule, or reflection the reader can apply.

## Output Format
- SEO metadata and slug recommendation.
- Working outline with reader intent and search intent.
- Full manuscript in the required format.
- Source notes, diagrams, and internal-link suggestions.
- Short social summary when needed.

## Guardrails
- Do not keyword-stuff or inflate claims beyond evidence.
- Do not invent statistics, citations, benchmarks, or capabilities.
- Preserve existing locale behavior, content schema, SEO paths, and analytics surfaces.
`
  },
  {
    id: "prompt-writing",
    category: "content",
    title: "Prompt Engineering Expert",
    summary: "Design prompts and system instructions with explicit roles, bounded context, injection resistance, and verifiable output schemas.",
    tags: ["Prompt Engineering", "LLM", "Agents", "Evaluation"],
    markdown: `# Prompt Writing Skill

Use this skill to design system prompts, task prompts, few-shot examples, agent policies, extraction prompts, and output schemas.

## Required Context
- Task objective, target model/tool, allowed tools, trust boundaries, input sources, and expected output consumer.
- Required domain facts, examples of success/failure, schema needs, tone constraints, and safety constraints.
- Which inputs are trusted operator instructions versus untrusted user or document content.

## Prompt Architecture
1. Role and scope: define expertise, authority, non-goals, and the boundaries the model must not cross.
2. Task contract: specify objective, inputs, assumptions, acceptance criteria, and failure conditions.
3. Context layout: separate system rules, developer rules, user request, retrieved evidence, and untrusted content with clear delimiters.
4. Procedure: give the model a concise operating checklist and require a short rationale, not hidden reasoning dumps.
5. Output schema: define JSON Schema, markdown sections, tables, diffs, or structured fields with examples.
6. Evaluation: create adversarial test cases for ambiguity, prompt injection, missing context, malformed input, and schema drift.

## Output Format
- Production prompt or prompt pack.
- Variable map and input sanitation rules.
- Output schema and valid/invalid examples.
- Evaluation checklist with pass/fail criteria.
- Compact version for ad-hoc use.

## Guardrails
- Do not ask for private chain-of-thought; ask for concise rationale, checks, or evidence.
- Do not let untrusted content redefine role, tools, data access, or output policy.
- Do not rely on adjectives such as "good" or "better" without measurable criteria.
`
  },
  {
    id: "status-report",
    category: "operations",
    title: "Executive Status & Operations",
    summary: "Turn workstream noise into executive signal: health, impact, blockers, decisions, owners, and path to green.",
    tags: ["Operations", "Reporting", "OKR", "Escalation"],
    markdown: `# Status Report Skill

Use this skill for daily standups, weekly status reports, monthly OKR reviews, incident updates, and stakeholder escalations.

## Required Context
- Audience, reporting cadence, workstream goal, current commitments, dates, owners, and decision rights.
- Evidence: shipped work, metrics, incidents, open blockers, dependency status, scope changes, and customer impact.
- Definitions of Green, Yellow, Red, and what escalation path exists.

## Reporting Process
1. Lead with BLUF: current health, reason, and what changed since the last update.
2. Separate facts from interpretation: metrics, shipped artifacts, incidents, and unresolved assumptions.
3. Quantify progress: OKR movement, DORA metrics, burn-up/burn-down, SLA/SLO, MTTR, lead time, throughput, or adoption.
4. Identify constraints: name the exact blocker, dependency owner, due date, probability, impact, and mitigation path.
5. Make decisions explicit: offer recommended option, fallback option, deadline, and consequence of no decision.
6. Close with next commitments: owner, date, expected evidence, and status-change trigger.

## Output Format
- Status: Green, Yellow, or Red, with one-sentence rationale.
- Progress: shipped value, not activity inventory.
- Risks and blockers: severity, owner, next action, and date.
- Decisions needed: precise ask and recommendation.
- Next cycle focus and measurable success signal.

## Guardrails
- Do not hide bad news behind progress theater.
- Do not report vanity metrics unless tied to a decision or outcome.
- Do not assign vague ownership such as "team"; name the accountable role or person.
`
  },
  {
    id: "doc-spec-tech-spec",
    category: "engineering",
    title: "Technical Specification & RFC",
    summary: "Write decision-ready specs that bind product intent to architecture, NFRs, threat model, rollout, and verification.",
    tags: ["RFC", "ADR", "Architecture", "NFR"],
    markdown: `# Doc / Spec / Tech Spec Skill

Use this skill for RFCs, ADRs, technical specifications, migration plans, system designs, and implementation handoffs.

## Required Context
- Product problem, user impact, scope, non-goals, stakeholders, deadlines, and success metrics.
- Current architecture, data model, API contracts, dependencies, operational constraints, and known incidents.
- Security, privacy, compliance, accessibility, SEO, analytics, and localization constraints when relevant.

## Specification Structure
1. Problem framing: why this exists, who it helps, what breaks today, and what success means.
2. Scope control: goals, non-goals, assumptions, constraints, and unresolved questions.
3. Proposed design: architecture diagram, data model, APIs/events, dependencies, edge cases, and compatibility rules.
4. Alternatives: compare at least two viable paths with cost, complexity, risk, reversibility, and time-to-value.
5. Risk model: STRIDE, privacy impact, failure domains, blast radius, data migration risk, and operational load.
6. Delivery plan: implementation slices, test matrix, observability, rollout, rollback, and post-launch validation.

## Output Format
- Complete RFC or ADR ready for review.
- Decision table with alternatives and recommendation.
- Implementation plan and ticket breakdown.
- Test, rollout, observability, and rollback checklist.
- Sign-off list by stakeholder function.

## Guardrails
- Do not treat assumptions as requirements without validation.
- Do not omit non-goals; they are scope control, not decoration.
- Do not ship a spec that changes production data without rollback and recovery details.
`
  },
  {
    id: "proposal-slide-pitch",
    category: "communication",
    title: "Strategic Pitch & Proposal",
    summary: "Build proposals that connect pain, value, ROI, risk, proof, and a concrete decision request.",
    tags: ["Proposal", "Strategy", "Executive Communication"],
    markdown: `# Proposal / Slide / Pitch Deck Skill

Use this skill for executive proposals, product strategy memos, budget asks, pitch decks, and technical-business trade-off narratives.

## Required Context
- Audience, decision maker, budget owner, desired action, political constraints, timeline, and competing priorities.
- Current pain, target outcome, evidence, costs, opportunity cost, risk profile, and available proof.
- Format: memo, slide outline, one-pager, spoken pitch, FAQ, or objection-handling sheet.

## Pitch Architecture
1. Audience calibration: map what each stakeholder values, fears, funds, and can approve.
2. Frame the gap: current cost, risk, delay, churn, manual work, missed revenue, or strategic exposure.
3. State the thesis: one direct sentence explaining what should be done and why now.
4. Prove feasibility: benchmark, customer signal, PoC, architecture validation, financial model, or comparable case.
5. Quantify impact: ROI, payback period, cost avoided, cycle-time reduction, risk reduction, or option value.
6. Make the ask: exact decision, budget, owner, date, success metric, and fallback if declined.

## Output Format
- One-sentence thesis and 30-second pitch.
- Slide-by-slide narrative or memo structure.
- ROI and risk model.
- Objection-handling matrix.
- Final decision request and next-step plan.

## Guardrails
- Do not use buzzwords that do not carry decision value.
- Do not overpromise adoption, revenue, cost savings, or delivery dates.
- Do not hide the ask; ambiguity kills executive decisions.
`
  },
  {
    id: "ai-operating-system",
    category: "strategy",
    title: "AI Operating System & Orchestration",
    summary: "Design agent workflows with model routing, context control, tool boundaries, RAG grounding, and human approval gates.",
    tags: ["AI Orchestration", "Agents", "RAG", "MCP"],
    markdown: `# AI Operating System Skill

Use this skill to design multi-agent workflows, AI workbenches, RAG pipelines, Codex/Claude/GPT task routing, and MCP tool policies.

## Required Context
- Workflow goal, data sensitivity, available tools, model/tool costs, latency tolerance, and approval requirements.
- Source-of-truth repositories, documents, issue trackers, logs, RAG indexes, and memory stores.
- Actions that are read-only, write-capable, destructive, external, or require human-in-the-loop approval.

## Orchestration Process
1. Classify intent: retrieval, reasoning, coding, review, planning, synthesis, browser work, or deterministic automation.
2. Route work by capability: assign models and agents based on context length, reasoning depth, tool need, latency, cost, and privacy.
3. Build the context package: source files, docs, constraints, examples, definitions, and explicit exclusions.
4. Define tool boundaries: read/write permissions, filesystem scope, network policy, secrets handling, and approval gates.
5. Add validation: schema checks, tests, citations, diff review, secondary-agent critique, and deterministic fallback paths.
6. Archive decisions: prompts, routing matrix, artifacts, and reusable playbooks.

## Output Format
- Agent role map and routing matrix.
- Context packaging template.
- Tool permission matrix and approval gates.
- Validation and fallback plan.
- Reusable prompt pack or operating playbook.

## Guardrails
- Do not let any agent mutate production state without explicit approval and observability.
- Do not mix trusted instructions with untrusted retrieved text.
- Do not optimize only for model intelligence; optimize for correctness, traceability, privacy, and cost.
`
  },
  {
    id: "daily-ai-learning-coach",
    category: "learning",
    title: "Continuous AI Learning & Neuroplasticity",
    summary: "Compound AI skill through deliberate practice, active recall, feedback loops, and reusable artifacts.",
    tags: ["Learning", "Deliberate Practice", "AI Fluency", "Feedback"],
    markdown: `# Daily AI Learning Coach Skill

Use this skill to plan daily AI up-skilling, technical practice, tool fluency, and long-term knowledge compounding.

## Required Context
- Target capability, current level, available time, active workstream, preferred tools, and desired artifact.
- Recent mistakes, repeated blockers, weak concepts, and high-leverage workflows worth practicing.
- Constraints around focus, energy, deadlines, and avoiding learning theater.

## Daily Loop Process
1. Pick one micro-skill: prompt slicing, diff review, RAG synthesis, architecture critique, test generation, or tool orchestration.
2. Practice on real context: a current ticket, codebase, document, incident, or decision rather than generic tutorials.
3. Generate feedback: ask the AI to find blind spots, counterexamples, edge cases, and missing verification.
4. Convert to memory: create an active recall card, prompt template, checklist, snippet, or decision note.
5. Schedule reinforcement: revisit at spaced intervals and test whether the skill transfers to a new task.
6. Measure value: time saved, quality improved, bug avoided, decision clarified, or artifact reused.

## Output Format
- Daily micro-skill target.
- Practice task with input and expected output.
- Feedback prompt and evaluation rubric.
- Artifact to save.
- Next repetition date and transfer challenge.

## Guardrails
- Do not count passive reading as skill acquisition.
- Do not practice five tools in one session; isolate one behavior.
- Validate AI explanations against official docs, local code, or empirical tests.
`
  },
  {
    id: "notebooklm-source-of-truth",
    category: "learning",
    title: "RAG-Grounded Knowledge Extraction",
    summary: "Extract source-grounded answers from trusted documents with citations, contradiction checks, and explicit unknowns.",
    tags: ["RAG", "Citations", "Research", "Knowledge Graph"],
    markdown: `# NotebookLM Source Of Truth Skill

Use this skill for dense document sets, NotebookLM-style corpora, PRDs, RFCs, research papers, financial reports, and knowledge bases.

## Required Context
- Source corpus, citation format, target question, audience, decision being supported, and allowed inference level.
- Source trust ranking, document dates, known outdated files, sensitive content rules, and required redactions.
- Whether the answer needs extraction, synthesis, comparison, timeline reconstruction, or gap analysis.

## Extraction Process
1. Sanitize sources: remove secrets, credentials, PII, and documents outside the approved scope.
2. Retrieve narrowly: query by entity, date, decision, metric, requirement, contradiction, and dependency.
3. Extract facts: quote or paraphrase only what the source supports and preserve source IDs.
4. Synthesize cautiously: separate direct evidence, inferred interpretation, conflicts, and unknowns.
5. Build structure: timeline, entity map, decision log, requirement matrix, or FAQ depending on the task.
6. Identify gaps: state what evidence is missing and what source would resolve it.

## Output Format
- Direct answer with citations for factual claims.
- Evidence table: claim, source, confidence, date, and caveat.
- Contradictions and outdated-source warnings.
- Entity/timeline/decision map when useful.
- Unknowns and recommended follow-up sources.

## Guardrails
- If the source does not support a claim, say "not provided in the source."
- Do not use external knowledge unless the task explicitly permits it.
- Do not collapse conflicting sources into a false single truth.
`
  },
  {
    id: "ai-delivery-factory",
    category: "engineering",
    title: "Autonomous Delivery & CI/CD",
    summary: "Run AI-assisted delivery from scoped requirement to implementation, verification, PR, and release-ready handoff.",
    tags: ["AI Delivery", "CI/CD", "Testing", "Automation"],
    markdown: `# AI Delivery Factory Skill

Use this skill when AI agents help implement features, refactors, migrations, test suites, CI changes, or release handoffs.

## Required Context
- Ticket scope, repository conventions, branch policy, test commands, CI gates, deployment model, and rollback constraints.
- Files likely affected, ownership boundaries, existing user changes, secrets policy, and verification expectations.
- Whether the agent may edit, commit, push, open PRs, deploy, or only prepare a patch.

## Delivery Process
1. Scope the work: restate requirement, acceptance criteria, non-goals, affected surfaces, and risk level.
2. Slice execution: create small implementation chunks with a verification check after each meaningful change.
3. Implement with local context: follow existing patterns, preserve unrelated user changes, and avoid broad refactors.
4. Shift-left verification: run typecheck, lint, unit/integration/E2E tests, schema checks, accessibility checks, and security scans as applicable.
5. Review the diff: inspect generated code, staged changes, secrets, artifacts, analytics wiring, and migration safety.
6. Handoff cleanly: commit with Conventional Commits, push only with approval, and prepare PR notes with impact and verification.

## Output Format
- Execution plan and changed-file summary.
- Verification evidence with command results.
- Commit message and PR body draft.
- Release, deployment, and rollback notes.
- Remaining risks or follow-up tickets.

## Guardrails
- Do not include secrets, local build output, runtime metadata, or unrelated user changes in commits.
- Do not use an agent-generated diff as its own approval.
- Do not deploy or mutate production unless the human explicitly requested that action.
`
  },
  {
    id: "claude-deep-review",
    category: "engineering",
    title: "Adversarial Semantic Review",
    summary: "Use adversarial review to expose hidden assumptions, failure modes, ambiguity, and system-level fragility.",
    tags: ["Adversarial Review", "Red Teaming", "Architecture", "Security"],
    markdown: `# Claude Deep Review Skill

Use this skill for deep critique of PRs, RFCs, architecture proposals, incident narratives, strategy memos, or AI-generated plans.

## Required Context
- Proposal, diff, system diagram, known constraints, success criteria, and the risk tolerance of the decision.
- Existing incidents, data model, dependency graph, auth model, rollout path, and what has already been validated.
- Reviewer lens: Staff engineer, SRE, security engineer, DBA, product operator, or executive stakeholder.

## Review Process
1. Decompose the system: actors, data flows, state transitions, dependencies, trust boundaries, and failure domains.
2. Attack assumptions: invalid input, high concurrency, partial failure, network partition, stale cache, malicious user, and operator error.
3. Trace blast radius: data corruption, availability loss, privacy breach, customer impact, cost explosion, and operational burden.
4. Challenge alternatives: compare the proposed path against simpler, safer, cheaper, or more reversible options.
5. Rewrite weak language: remove ambiguity, unsupported claims, hidden dependencies, and false certainty.
6. Produce mitigations: concrete fixes, validation steps, and decision gates.

## Output Format
- Critical risks and exploit/failure narrative.
- Assumptions that need proof.
- Alternative designs with trade-offs.
- Mitigation plan ranked by risk reduction.
- Go/No-Go recommendation with evidence threshold.

## Guardrails
- Be direct but evidence-based; critique the work, not the author.
- Do not accept "probably fine" for security, data integrity, or rollback.
- Do not stop at critique; provide the smallest path to reduce risk.
`
  },
  {
    id: "career-ai-strategy",
    category: "strategy",
    title: "Capability Compounding & Leverage",
    summary: "Build durable career leverage through Staff-level scope, AI fluency, portfolio evidence, and compounding systems.",
    tags: ["Career Strategy", "Staff Engineer", "Leverage", "Portfolio"],
    markdown: `# Career AI Strategy Skill

Use this skill for career planning, Staff/Principal path design, promotion packets, AI leverage strategy, and portfolio roadmaps.

## Required Context
- Target role, current level, domain, strengths, gaps, market direction, constraints, and available weekly capacity.
- Existing artifacts: projects, PRs, ADRs, incident work, mentoring, writing, talks, automation, and business outcomes.
- Desired optionality: Staff IC, engineering manager, founder, consultant, product-minded technologist, or AI systems specialist.

## Strategy Process
1. Define the career thesis: the market problem you solve better because of your skill stack.
2. Audit capability: technical depth, system design, product sense, communication, leadership, AI fluency, and business judgment.
3. Identify leverage assets: internal tools, standards, reusable playbooks, public writing, OSS, talks, mentorship, and architecture artifacts.
4. Choose bets: 2-3 projects with asymmetric upside, visible impact, and reusable proof.
5. Build a 90-day operating plan: outcomes, rituals, artifacts, stakeholder alignment, and weekly feedback loops.
6. Track evidence: before/after metrics, adoption, reliability gains, time saved, decisions influenced, and people enabled.

## Output Format
- Career thesis and positioning statement.
- Capability matrix with gaps and proof.
- 90-day leverage roadmap.
- Portfolio artifact plan.
- Mentorship, visibility, and stakeholder strategy.

## Guardrails
- Do not optimize for job-title aesthetics over real scope and outcomes.
- Do not confuse tool usage with AI fluency; measure quality, speed, judgment, and leverage.
- Do not sacrifice technical depth for shallow breadth.
`
  },
  {
    id: "engineering-decision-map",
    category: "engineering",
    title: "Systemic Decision Topography",
    summary: "Map business requirements to domain invariants, architecture options, trade-offs, risks, and operational readiness.",
    tags: ["Decision Matrix", "Systems Thinking", "Trade-offs", "Requirements"],
    markdown: `# Engineering Decision Map Skill

Use this skill when requirements are ambiguous, decisions are cross-functional, or architecture must balance product, data, and operations.

## Required Context
- Business goal, user journey, stakeholders, target metrics, hard constraints, and decision deadline.
- Current domain model, data ownership, integration points, delivery team shape, and operational support model.
- Quality attributes: latency, availability, consistency, security, accessibility, observability, maintainability, and cost.

## Decision Process
1. Extract invariants: what must always be true for users, money, permissions, data, and compliance.
2. Map the stack: business process, domain objects, API contracts, data stores, infrastructure, operations, and support.
3. Generate options: CRUD, CQRS, event sourcing, queue-backed workflows, modular monolith, service extraction, or Strangler Fig migration.
4. Score trade-offs: reversibility, delivery speed, data consistency, operational complexity, cost, reliability, and team fit.
5. Run FMEA: failure modes, blast radius, detection, mitigation, rollback, and graceful degradation.
6. Decide explicitly: two-way door versus one-way door, accepted technical debt, and validation milestone.

## Output Format
- Requirement-to-architecture map.
- Weighted decision matrix.
- Recommended option and rejected alternatives.
- Risk register and mitigation plan.
- Operational readiness and rollout outline.

## Guardrails
- Do not choose interesting technology when boring technology satisfies the invariant.
- Do not finalize a decision without observability and rollback.
- State the breaking point of the design instead of implying infinite scale.
`
  },
  {
    id: "staff-engineer-ai-review-pack",
    category: "engineering",
    title: "Staff-Level Architectural Audit",
    summary: "Audit high-risk technical changes through Staff-level lenses: product, architecture, security, data, SRE, QA, and rollout.",
    tags: ["Staff Engineer", "Architecture Review", "PRR", "Risk Audit"],
    markdown: `# Staff Engineer AI Review Pack Skill

Use this skill for major architectural changes, multi-system integrations, sensitive-data features, migrations, and launch readiness reviews.

## Required Context
- RFC/PR, target architecture, service map, data classification, dependency graph, timeline, and launch criteria.
- SLOs, API contracts, schema changes, auth model, observability, test strategy, and rollback constraints.
- Known risks, unresolved questions, and stakeholders who own sign-off.

## Audit Process
1. Product lens: validate user value, rollout segment, acceptance criteria, and cost of delaying or simplifying.
2. Architecture lens: check boundaries, coupling, compatibility, contracts, extensibility, and architectural drift.
3. Security/privacy lens: STRIDE, IAM/RBAC/ABAC, data exposure, tenant isolation, secrets, encryption, and auditability.
4. Data lens: migration safety, index/lock behavior, backfill, consistency, retention, backup, restore, and reconciliation.
5. SRE lens: SLO impact, capacity, alerts, dashboards, runbooks, on-call load, failure domains, and rollback triggers.
6. QA lens: unit, integration, E2E, contract, load, chaos, accessibility, and exploratory test coverage.

## Output Format
- Cross-functional risk matrix.
- Hard blockers and launch conditions.
- Production readiness score with Go/No-Go recommendation.
- Required sign-offs and owners.
- Evolution path from current state to target state.

## Guardrails
- Do not approve big-bang rewrites without an incremental migration plan.
- Do not accept launch readiness without measurable SLOs and rollback triggers.
- Prioritize data integrity, privacy, and reliability over delivery optics.
`
  },
  {
    id: "data-resilience-observability-review",
    category: "engineering",
    title: "Distributed Resilience & Telemetry",
    summary: "Review data integrity, distributed resilience, telemetry, and recovery plans before systems carry production load.",
    tags: ["Data", "Resilience", "Observability", "SRE"],
    markdown: `# Data, Resilience, Observability Review Skill

Use this skill for databases, caches, queues, search indexes, event streams, third-party integrations, and production readiness reviews.

## Required Context
- Data model, query patterns, traffic profile, consistency needs, RPO/RTO, SLOs, and downstream consumers.
- Current database/cache/queue/search topology, replication, backup, monitoring, alerting, and incident history.
- Sensitive data classification, retention policy, and logging restrictions.

## Review Process
1. Data integrity: transaction boundaries, isolation level, constraints, idempotency, deduplication, reconciliation, and migration safety.
2. Query and storage: indexes, cardinality, locking, hot partitions, N+1 access, connection pooling, retention, and archival.
3. Cache and queue behavior: invalidation, stampede protection, TTL, ordering, replay, DLQ, poison messages, and backpressure.
4. Failure simulation: network partition, slow dependency, partial write, duplicate event, region failover, and third-party outage.
5. Telemetry: RED/USE metrics, OpenTelemetry traces, structured logs, correlation IDs, dashboards, SLO burn alerts, and runbooks.
6. Recovery: backup restore, point-in-time recovery, RPO/RTO, rollback scripts, and data repair procedure.

## Output Format
- Consistency and data-integrity assessment.
- Failure-mode matrix with mitigation.
- Telemetry specification and dashboard plan.
- Load, chaos, and restore test plan.
- Go-live checklist with rollback and recovery triggers.

## Guardrails
- Never assume the network, clock, cache, queue, or third-party dependency is reliable.
- Do not log PII, secrets, tokens, or sensitive payloads.
- Do not page humans for non-actionable alerts.
`
  },
  {
    id: "installed-skill-library-cartographer",
    category: "strategy",
    title: "Installed Skill Library Cartographer",
    summary: "Inventory installed agent skills, remove duplicates, classify capabilities, and turn scattered playbooks into a usable routing system.",
    tags: ["Skill Inventory", "Agent Routing", "Taxonomy", "Governance"],
    markdown: `# Installed Skill Library Cartographer Skill

Use this skill when consolidating installed Codex, Claude, Gemini, Antigravity, local .agents, marketplace, plugin, or project skills into a coherent operating library.

## Corpus Coverage
- Latest local inventory pass: 14,541 raw \`SKILL.md\` files, 5,035 unique contents, 3,116 unique names, with heavy overlap across Codex, Claude, Gemini, Antigravity CLI/IDE, and local agent runtimes.
- Scan installed \`SKILL.md\` files across approved local roots before editing the canonical library.
- Deduplicate by content hash and normalized name because plugin caches and multi-runtime installs create many copies.
- Preserve source provenance at the capability level without exposing private absolute paths in public content.
- Treat vendor, marketplace, generated, translated, and project-local skills as signals, not as content to paste blindly.

## Analysis Process
1. Inventory sources: Codex, Claude, Gemini, Antigravity CLI/IDE, local .agents, project-local skills, plugins, and marketplace caches.
2. Extract metadata: name, description, trigger rules, domain keywords, output expectations, and safety constraints.
3. Cluster capabilities: engineering, frontend/UI, backend/platform, security, AI agents, research, content, product, operations, mobile, and learning.
4. Identify gaps: capabilities heavily represented in installed skills but missing from the public Studio skill library.
5. Synthesize target skills: merge overlapping playbooks into crisp, non-duplicative expert skills with clear use cases.
6. Validate fit: each final skill must have a precise trigger, required context, process, output contract, and guardrails.

## Output Format
- Inventory summary: raw files, unique content count, unique names, and runtime coverage.
- Capability taxonomy with mapped source families.
- Gap analysis against the current skill library.
- Proposed additions/merges/removals.
- Final copy-ready English and localized versions.

## Guardrails
- Do not publish local paths, usernames, tokens, credentials, or private workspace details.
- Do not inflate the library by copying every duplicate skill into the UI.
- Do not trust marketplace/cache content without normalizing it into the owner's vocabulary and needs.
`
  },
  {
    id: "ai-product-evaluation",
    category: "strategy",
    title: "AI Product & Evaluation",
    summary: "Move AI features from impressive demos to trustworthy products with evals, safety boundaries, cost controls, and measurable user value.",
    tags: ["AI Product", "Evals", "LLM Quality", "Trust"],
    markdown: `# AI Product & Evaluation Skill

Use this skill when designing, auditing, or shipping AI-powered product features, agents, copilots, chat interfaces, retrieval systems, or model-powered workflows.

## Required Context
- User job-to-be-done, risk level, model/provider, tool access, retrieval sources, latency budget, cost target, and trust boundary.
- Failure modes: hallucination, unsafe action, stale retrieval, prompt injection, privacy leak, refusal mismatch, and silent degradation.
- Business metric: adoption, task completion, deflection, time saved, quality improvement, revenue, retention, or risk reduction.

## Product Process
1. Define the product promise: what the AI must help the user accomplish and what it must never do.
2. Separate demo from production: specify grounding, permissions, fallback UX, observability, rate limits, and abuse controls.
3. Build evals: golden tasks, adversarial prompts, regression suites, human review rubrics, and acceptance thresholds.
4. Measure quality and cost: success rate, hallucination rate, tool-call accuracy, citation fidelity, latency, token spend, and support impact.
5. Design trust UX: source display, confidence language, editability, audit trail, undo, escalation, and human handoff.
6. Plan rollout: shadow mode, allowlist, feature flag, red-team review, telemetry, incident playbook, and model/provider rollback.

## Output Format
- AI feature brief with promise, non-goals, and risk class.
- Evaluation plan with datasets, rubrics, thresholds, and owners.
- Safety and trust UX checklist.
- Cost/latency budget and monitoring plan.
- Rollout and rollback plan.

## Guardrails
- Do not ship an AI feature without evals that match real user tasks.
- Do not hide uncertainty, missing sources, or model limitations from the user.
- Do not give agents write access to external systems without permission boundaries and audit logs.
`
  },
  {
    id: "agent-tools-mcp-automation",
    category: "operations",
    title: "Agent Tools, MCP & Workflow Automation",
    summary: "Design reliable tool-using agents across MCP, GitHub, Slack, Gmail, Outlook, Notion, Airtable, browsers, and local CLIs.",
    tags: ["MCP", "Automation", "Integrations", "Tool Use"],
    markdown: `# Agent Tools, MCP & Workflow Automation Skill

Use this skill when an agent needs to use tools, connectors, MCP servers, CLIs, browsers, or app integrations to complete a workflow.

## Required Context
- Target app/tool, available connector, account boundary, data sensitivity, read/write permissions, and approval requirement.
- Inputs, IDs, schemas, pagination behavior, rate limits, retry policy, and expected artifacts.
- Whether the workflow is independent, sequential, reversible, or state-mutating.

## Automation Process
1. Discover tools: inspect available schemas and required IDs before executing.
2. Classify actions: read-only, draft creation, user-reviewed write, immediate write, scheduled action, destructive action, or external publish.
3. Normalize inputs: resolve IDs, validate schemas, handle time zones, sanitize untrusted content, and preserve source links.
4. Execute safely: batch only independent calls, paginate to completeness, checkpoint long work, and keep outputs inspectable.
5. Verify results: compare returned state with requested state, record links/artifacts, and surface partial failures.
6. Handoff: provide concise summary, artifacts, residual risk, and the next human decision when needed.

## Output Format
- Tooling plan with app, action, permission level, and risk class.
- Schema-compliant execution inputs.
- Result summary with source links or artifact references.
- Failure/retry notes and unresolved blockers.
- Audit trail for state-changing actions.

## Guardrails
- Do not execute write/destructive actions without explicit approval or a draft-first workflow.
- Do not invent tool slugs, API fields, account IDs, channel IDs, folder IDs, or file IDs.
- Do not expose secrets, OAuth tokens, private payloads, or unrelated app data.
`
  },
  {
    id: "product-analytics-growth",
    category: "strategy",
    title: "Product Analytics & Growth Experimentation",
    summary: "Turn behavior data into decisions through event taxonomy, funnels, cohorts, A/B tests, attribution, and growth loops.",
    tags: ["Analytics", "Growth", "Experimentation", "PostHog"],
    markdown: `# Product Analytics & Growth Experimentation Skill

Use this skill when designing analytics, auditing tracking, planning growth experiments, measuring funnels, or deciding whether a feature worked.

## Required Context
- Product goal, user segment, north-star metric, funnel stage, current instrumentation, and decision that the data must support.
- Event taxonomy, identity model, consent/privacy rules, attribution model, experiment constraints, and dashboard owner.
- Baseline metrics and expected movement: activation, retention, conversion, engagement, revenue, or operational efficiency.

## Analytics Process
1. Define the decision: what will change if the metric moves, does not move, or is inconclusive.
2. Design event taxonomy: event names, properties, identity resolution, source surface, and versioning.
3. Validate instrumentation: page views, click events, forms, filters, outbound links, search/command UIs, and error states.
4. Analyze behavior: funnels, cohorts, retention curves, segmentation, drop-offs, correlation, and qualitative context.
5. Plan experiments: hypothesis, primary metric, guardrail metrics, sample size, ramp plan, and stop conditions.
6. Report learning: what changed, what did not, confidence level, next decision, and follow-up instrumentation.

## Output Format
- Tracking plan with events, properties, owners, and surfaces.
- Funnel/cohort dashboard spec.
- Experiment brief with hypothesis, metrics, and guardrails.
- Data quality checklist.
- Decision memo with recommendation.

## Guardrails
- Do not optimize vanity metrics that do not affect a decision.
- Do not add public surfaces without matching analytics when the product convention requires it.
- Do not ignore privacy choices, Do Not Track, consent, or autocapture/session-recording constraints.
`
  },
  {
    id: "research-market-intelligence",
    category: "learning",
    title: "Research & Market Intelligence",
    summary: "Produce grounded research from local docs, web sources, competitors, customers, papers, and market signals with explicit confidence.",
    tags: ["Research", "Market Intelligence", "Source Grounding", "Synthesis"],
    markdown: `# Research & Market Intelligence Skill

Use this skill for market research, competitor analysis, product discovery, customer insight synthesis, technical literature review, or strategic scanning.

## Required Context
- Research question, decision owner, time horizon, geography, industry, target segment, and acceptable source types.
- Existing local knowledge, internal docs, known competitors, source trust ranking, and required citation style.
- Whether the task needs current web research, local-only research, academic sources, interviews, or quantitative analysis.

## Research Process
1. Frame the question: define the decision, scope, non-goals, assumptions, and confidence needed.
2. Start local: inspect provided docs, repo notes, prior decisions, and internal artifacts before external lookup.
3. Gather evidence: use primary sources where possible, compare dates, check author/source incentives, and capture citations.
4. Analyze patterns: segment users, competitors, jobs-to-be-done, willingness to pay, adoption barriers, and market timing.
5. Separate signal from speculation: label facts, inferences, weak signals, contradictions, and unknowns.
6. Recommend action: produce the smallest next decision or experiment that reduces uncertainty.

## Output Format
- Research brief with question, scope, and confidence.
- Evidence table with source, date, claim, and caveat.
- Competitor/customer/theme synthesis.
- Unknowns and risk register.
- Recommended next experiment or decision.

## Guardrails
- Do not browse externally when the task is explicitly local-only.
- Do not present outdated or secondhand claims as current primary evidence.
- Do not hide uncertainty; label confidence and proof gaps clearly.
`
  },
  {
    id: "security-privacy-threat-modeling",
    category: "engineering",
    title: "Security, Privacy & Threat Modeling",
    summary: "Audit systems for abuse paths, auth flaws, PII exposure, supply-chain risk, compliance gaps, and secure rollout.",
    tags: ["Security", "Privacy", "Threat Modeling", "Compliance"],
    markdown: `# Security, Privacy & Threat Modeling Skill

Use this skill when a change touches authentication, authorization, user input, sensitive data, payments, file uploads, integrations, AI tools, infrastructure, or production operations.

## Required Context
- Assets, actors, trust boundaries, data classification, auth model, threat history, compliance constraints, and deployment scope.
- Inputs/outputs, storage locations, third-party processors, secrets, logs, analytics, and retention policy.
- Existing controls: IAM, RBAC/ABAC, CSP, CSRF, rate limiting, audit logs, encryption, scanning, and incident response.

## Review Process
1. Map assets and trust boundaries: user data, credentials, tokens, payments, internal APIs, model context, and admin tools.
2. Run STRIDE/LINDDUN: spoofing, tampering, repudiation, information disclosure, denial of service, elevation, linkability, identifiability, and non-repudiation.
3. Test abuse paths: injection, XSS, CSRF, IDOR, SSRF, RCE, path traversal, prompt injection, insecure deserialization, and privilege escalation.
4. Check privacy: data minimization, consent, PII redaction, logging hygiene, analytics properties, retention, and deletion.
5. Assess supply chain: dependencies, SCA, SAST, secrets scanning, container/IaC drift, and CI permissions.
6. Define mitigations: hard blockers, compensating controls, test cases, monitoring, rollout constraints, and incident runbook.

## Output Format
- Threat model with assets, actors, boundaries, and assumptions.
- Vulnerability findings ranked by severity.
- Privacy impact notes and data-flow diagram.
- Required fixes and verification tests.
- Go/No-Go security recommendation.

## Guardrails
- Do not log, copy, or publish secrets, tokens, private keys, or sensitive payloads.
- Do not rely on generic "sanitize input" advice; name the exact control and location.
- Do not approve sensitive-data features without auditability and rollback.
`
  },
  {
    id: "design-system-ui-craft",
    category: "engineering",
    title: "Design System & UI Craft",
    summary: "Create polished, accessible, responsive interfaces using design systems, component libraries, visual hierarchy, and interaction states.",
    tags: ["Design System", "UI", "Accessibility", "Responsive"],
    markdown: `# Design System & UI Craft Skill

Use this skill when building or refining product UI, design systems, dashboards, landing pages, mobile layouts, component libraries, or visual prototypes.

## Required Context
- Product type, user workflow, brand tone, existing design system, component library, icons, typography, color tokens, and density needs.
- Target viewports, accessibility requirements, interaction states, content length, data density, and performance constraints.
- Whether the surface is an operational tool, editorial page, portfolio, marketing page, game, or AI-native interface.

## Design Process
1. Understand the job: prioritize the user's repeated workflow, scanning pattern, decision load, and error recovery.
2. Use existing system first: tokens, spacing, icons, button semantics, tabs, menus, forms, charts, tables, and empty states.
3. Design complete states: hover, focus, disabled, loading, skeleton, empty, error, success, overflow, long text, and mobile.
4. Build visual hierarchy: typography scale, spacing rhythm, contrast, density, grouping, affordances, and layout constraints.
5. Verify craft: screenshot review, responsive checks, no overlap, stable dimensions, keyboard navigation, and color contrast.
6. Connect telemetry: track meaningful UI decisions, filters, commands, CTAs, forms, outbound links, and preference changes.

## Output Format
- UI concept and layout rationale.
- Component/state inventory.
- Responsive and accessibility checklist.
- Implementation notes tied to the existing design system.
- Screenshot or browser-verification plan when applicable.

## Guardrails
- Do not make a landing page when the user asked for a tool or app.
- Do not use decorative gradients/orbs as a substitute for product-relevant visual assets.
- Do not ship text that overflows, overlaps, or breaks on mobile.
`
  },
  {
    id: "mobile-platform-engineering",
    category: "engineering",
    title: "Mobile Platform Engineering",
    summary: "Build and review iOS, Android, SwiftUI, Kotlin, React Native, and app-store workflows with performance and release discipline.",
    tags: ["Mobile", "iOS", "Android", "SwiftUI"],
    markdown: `# Mobile Platform Engineering Skill

Use this skill for native iOS, Android, SwiftUI, Kotlin, React Native, app packaging, app-store release work, or mobile UI/performance audits.

## Required Context
- Platform, minimum OS, navigation model, design system, data layer, offline needs, permissions, app-store constraints, and release channel.
- Performance targets, accessibility expectations, device matrix, analytics events, crash reporting, and privacy declarations.
- Build tooling: Xcode, SwiftPM, Tuist, Gradle, Android SDK, CI, signing, provisioning, and store metadata.

## Engineering Process
1. Define platform boundaries: native versus cross-platform, shared logic, UI ownership, device support, and release cadence.
2. Design lifecycle behavior: app launch, navigation, state restoration, background tasks, permissions, offline mode, and error recovery.
3. Optimize performance: startup time, scrolling, image memory, layout passes, concurrency, battery, network usage, and caching.
4. Verify UI: device matrix, orientation, Dynamic Type, TalkBack/VoiceOver, keyboard, gestures, and visual regression.
5. Harden release: signing, provisioning, app-store metadata, privacy nutrition labels, crash monitoring, phased rollout, and rollback plan.
6. Capture evidence: simulator/device logs, screenshots, test reports, crash-free sessions, and release notes.

## Output Format
- Platform architecture and release plan.
- UI/performance risk matrix.
- Test matrix across devices and OS versions.
- Store submission checklist.
- Post-release monitoring and rollback notes.

## Guardrails
- Do not treat simulator success as device readiness.
- Do not ignore accessibility, privacy declarations, or app-store review constraints.
- Do not ship mobile changes without crash/analytics visibility.
`
  },
  {
    id: "data-ml-science-workflow",
    category: "learning",
    title: "Data, ML & Scientific Workflow",
    summary: "Handle data, ML, and science tasks with reproducible notebooks, trustworthy sources, evaluation, provenance, and statistical caution.",
    tags: ["Data", "ML", "Science", "Reproducibility"],
    markdown: `# Data, ML & Scientific Workflow Skill

Use this skill for data analysis, ML experiments, scientific APIs, bioinformatics, finance data, geospatial work, notebooks, dashboards, or model evaluation.

## Required Context
- Research question, dataset source, license, schema, missingness, time range, unit definitions, and decision the analysis supports.
- Tooling: Python/R/SQL/notebook, API, model type, evaluation metric, compute limits, and reproducibility requirement.
- Risk level: financial, health, science, compliance, privacy, or production-impacting analysis.

## Workflow Process
1. Define the hypothesis and decision: what the analysis can and cannot prove.
2. Audit data provenance: source, freshness, sampling bias, schema quality, missing values, leakage, and sensitive fields.
3. Build reproducibly: environment, seed, notebook/script split, versioned data, deterministic transforms, and documented assumptions.
4. Analyze rigorously: baselines, confidence intervals, error bars, ablations, train/test split, and out-of-distribution checks.
5. Validate with domain sense: compare against known constraints, source documentation, and independent sanity checks.
6. Communicate limits: uncertainty, caveats, failed approaches, ethical constraints, and next experiment.

## Output Format
- Analysis plan and data dictionary.
- Reproducible notebook/script outline.
- Findings with confidence and caveats.
- Evaluation table and error analysis.
- Recommendation or next experiment.

## Guardrails
- Do not imply causality from correlation without an identification strategy.
- Do not treat model output as truth without validation and error analysis.
- Do not expose sensitive, medical, financial, or proprietary data in public artifacts.
`
  }
];

function buildSkillExpertAddendum({
  role,
  heuristics,
  failureModes,
  gates
}: {
  role: string;
  heuristics: string[];
  failureModes: string[];
  gates: string[];
}): string {
  return [
    "## Senior Role Lens",
    `- ${role}`,
    ...heuristics.map((item) => `- ${item}`),
    "",
    "## Expert Failure Modes",
    ...failureModes.map((item) => `- ${item}`),
    "",
    "## Quality Gates",
    ...gates.map((item) => `- ${item}`)
  ].join("\n");
}

const studioAiSkillExpertAddenda: Record<string, string> = {
  "code-review": buildSkillExpertAddendum({
    role: "Act like the reviewer who will be paged if this change breaks at 2 a.m.; optimize for missed behavior, not clever comments.",
    heuristics: [
      "Review the diff against invariants: money, permissions, identity, data retention, locale, SEO, analytics, and rollback.",
      "Trace both the happy path and the abandoned path: cancelled request, stale tab, retry, partial write, duplicate event, and disabled user.",
      "Check code shape before style: the data structure, design pattern, service boundary, and utility extraction should match the real workflow."
    ],
    failureModes: [
      "A test passes because it mocks away the real contract: time, auth, network, storage, routing, or browser behavior.",
      "A small UI change breaks analytics, accessibility, locale paths, or cache invalidation outside the touched component.",
      "A familiar design-pattern name hides a wrong boundary: business rules leak into controllers, persistence leaks into UI, or generic utils start carrying product state."
    ],
    gates: [
      "Every blocker must explain impact, evidence, and smallest fix.",
      "Approval requires behavior coverage or an explicit residual-risk note.",
      "High-quality approval requires a short architecture note when the change introduces new services, repositories, utilities, patterns, or shared data structures."
    ]
  }),
  "frontend-architecture": buildSkillExpertAddendum({
    role: "Act like a Staff Frontend Architect balancing product speed, design-system integrity, accessibility, and runtime performance.",
    heuristics: [
      "Design around ownership boundaries: route, data loader, interaction state, visual primitive, analytics surface, and error recovery.",
      "Budget for worst-case content: long translations, empty datasets, slow networks, reduced motion, keyboard-only use, and narrow screens."
    ],
    failureModes: [
      "Hydration mismatch or client-only state quietly changes SEO, analytics, or first interaction latency.",
      "A beautiful component has no stable dimensions, so real data causes layout shift, overlap, or unusable mobile controls."
    ],
    gates: [
      "State taxonomy and responsive state matrix must be explicit.",
      "LCP, INP, CLS, keyboard flow, focus order, and event tracking must have an owner."
    ]
  }),
  "backend-architecture": buildSkillExpertAddendum({
    role: "Act like a Backend Architect responsible for domain ownership, compatibility, migration safety, and operational load.",
    heuristics: [
      "Start from invariants before topology: what must always be true after retries, duplicate messages, partial failures, and replays.",
      "Prefer boring boundaries until throughput, consistency, team ownership, or compliance forces a more complex shape."
    ],
    failureModes: [
      "Async flow without idempotency, replay strategy, dead-letter handling, or reconciliation becomes invisible data loss.",
      "A schema migration is technically valid but operationally unsafe because locks, backfills, rollbacks, or old readers were ignored."
    ],
    gates: [
      "Every mutation path has idempotency, authorization, observability, and rollback semantics.",
      "Contracts include pagination, error taxonomy, versioning, rate limits, and compatibility notes."
    ]
  }),
  "blog-content-writer": buildSkillExpertAddendum({
    role: "Act like a senior technical editor who protects trust, precision, source fidelity, and the reader's working memory.",
    heuristics: [
      "Turn a broad topic into one thesis, one reader, one decision, and one memorable mental model.",
      "Use expert vocabulary only when it carries explanatory load; define it through context, not glossary padding."
    ],
    failureModes: [
      "The article sounds expert but has no falsifiable claim, source trail, trade-off, or concrete operational example.",
      "SEO work becomes keyword stuffing and weakens the author's voice, locale fit, or semantic structure."
    ],
    gates: [
      "Metadata, slug, heading hierarchy, internal links, and schema fit the existing content system.",
      "Every strong claim is either sourced, demonstrated, or softened with clear uncertainty."
    ]
  }),
  "prompt-writing": buildSkillExpertAddendum({
    role: "Act like a prompt systems engineer designing instructions that survive ambiguity, injection, tool use, and downstream parsing.",
    heuristics: [
      "Separate authority layers: system rules, developer rules, user task, retrieved evidence, examples, and untrusted payloads.",
      "Design prompts as interfaces: inputs, preconditions, output contract, validation, errors, and fallback behavior."
    ],
    failureModes: [
      "The prompt is long but not binding: it lacks acceptance criteria, negative constraints, schema examples, or test cases.",
      "Untrusted content can redefine role, tools, safety policy, output format, or source hierarchy."
    ],
    gates: [
      "Prompt pack includes adversarial evals and malformed-input tests.",
      "Structured outputs have schema, valid/invalid examples, and a recovery path."
    ]
  }),
  "status-report": buildSkillExpertAddendum({
    role: "Act like an operator writing for leaders who need risk, decision, and path-to-green clarity in under one minute.",
    heuristics: [
      "Separate activity from value shipped, risk retired, decision unblocked, and customer/system impact.",
      "State the consequence of no decision; otherwise an escalation is only a status update."
    ],
    failureModes: [
      "Green status hides scope creep, dependency drift, quality debt, or a blocker with no owner.",
      "Metrics are accurate but non-actionable because they do not map to a decision."
    ],
    gates: [
      "Every blocker has owner, next action, due date, impact, and escalation threshold.",
      "Report fits the audience: engineer detail for execution, BLUF and trade-off for executives."
    ]
  }),
  "doc-spec-tech-spec": buildSkillExpertAddendum({
    role: "Act like an RFC owner who must earn implementation consensus before code starts.",
    heuristics: [
      "Write non-goals as aggressively as goals; unclear exclusions become scope debt.",
      "Make reversibility explicit: two-way-door decisions need speed, one-way-door decisions need evidence."
    ],
    failureModes: [
      "The spec describes a solution but never proves the product problem or operational constraint.",
      "Migration, rollback, privacy, observability, and compatibility are deferred until implementation, when they are most expensive."
    ],
    gates: [
      "RFC contains alternatives, trade-off matrix, risk register, test matrix, and rollout/rollback plan.",
      "All open questions have an owner, decision date, and impact if unresolved."
    ]
  }),
  "proposal-slide-pitch": buildSkillExpertAddendum({
    role: "Act like an executive communicator converting ambiguity into a decision-ready investment case.",
    heuristics: [
      "Translate features into business levers: revenue, cost, risk, cycle time, resilience, compliance, or strategic option value.",
      "Put the ask early; decks that hide the decision force stakeholders to infer the point."
    ],
    failureModes: [
      "The proposal is persuasive but not fundable because it lacks owner, budget, timeline, risk, and success metric.",
      "A technical win is framed without CFO/CTO/Product lenses, so each stakeholder hears a different proposal."
    ],
    gates: [
      "One thesis, one decision request, one quantified impact model, and one fallback path.",
      "Objection matrix covers cost, risk, timing, technical feasibility, adoption, and opportunity cost."
    ]
  }),
  "ai-operating-system": buildSkillExpertAddendum({
    role: "Act like an AI systems architect designing reliable agent workflows, not a prompt collector.",
    heuristics: [
      "Route by task physics: retrieval, reasoning, coding, validation, UI verification, state mutation, and summarization are different jobs.",
      "Treat context as a supply chain: provenance, freshness, trust level, compression, and exclusion matter."
    ],
    failureModes: [
      "Multi-agent orchestration adds latency and contradiction without a validation layer or ownership model.",
      "Agents receive broad tool access, then silently cross privacy, filesystem, or production boundaries."
    ],
    gates: [
      "Every agent has role, inputs, tools, write boundary, output schema, and verification owner.",
      "Critical workflows include secondary review, deterministic checks, and human approval gates."
    ]
  }),
  "daily-ai-learning-coach": buildSkillExpertAddendum({
    role: "Act like a learning systems coach who turns daily work into compounding evidence, not content consumption.",
    heuristics: [
      "Practice one micro-skill against real work, then save one artifact that can be reused or reviewed.",
      "Prefer retrieval, critique, and evaluation drills over endless new tool exploration."
    ],
    failureModes: [
      "Learning feels busy because it creates notes, but no prompt, checklist, test, demo, or decision improves.",
      "AI replaces the hard part of learning, so fluency rises while judgment weakens."
    ],
    gates: [
      "Each session produces a reusable artifact and a next transfer challenge.",
      "Spaced repetition tests recall and application, not recognition."
    ]
  }),
  "notebooklm-source-of-truth": buildSkillExpertAddendum({
    role: "Act like a source-grounded analyst who would rather say 'not provided' than invent a bridge.",
    heuristics: [
      "Rank sources by authority, date, proximity to decision, and conflict with newer artifacts.",
      "Separate extraction, synthesis, and inference so readers know what the corpus actually said."
    ],
    failureModes: [
      "A smooth summary hides contradictions, outdated specs, missing dates, or uncited claims.",
      "External model memory fills gaps that should remain explicit unknowns."
    ],
    gates: [
      "Every factual claim has citation, confidence, and caveat when needed.",
      "Contradictions and missing evidence are first-class outputs."
    ]
  }),
  "ai-delivery-factory": buildSkillExpertAddendum({
    role: "Act like an AI delivery lead coordinating spec, implementation, verification, review, and handoff without mixing duties.",
    heuristics: [
      "Slice work by independently verifiable behavior, not by files or agent convenience.",
      "Let AI accelerate boilerplate, search, test generation, and critique; keep architecture and merge decisions owned."
    ],
    failureModes: [
      "One agent plans, codes, reviews, and declares done, creating a closed loop with no independent evidence.",
      "Generated code is correct locally but misses analytics, locale, accessibility, migration, or release conventions."
    ],
    gates: [
      "Clean diff, focused commit, relevant tests, no secrets, no unrelated changes.",
      "Handoff includes verification commands, residual risk, deployment impact, and rollback notes."
    ]
  }),
  "claude-deep-review": buildSkillExpertAddendum({
    role: "Act like an adversarial Principal Engineer exposing what a friendly review would miss.",
    heuristics: [
      "Attack assumptions before implementation: scale, data consistency, auth, timing, operator behavior, and unhappy paths.",
      "Convert vague concerns into failure narratives: trigger, path, blast radius, detection, mitigation."
    ],
    failureModes: [
      "The critique is intense but unactionable because it lacks smallest fix and evidence threshold.",
      "The reviewer debates style while data integrity, rollback, or user trust risk remains unresolved."
    ],
    gates: [
      "Every major objection includes mitigation, validation, and owner.",
      "Go/No-Go recommendation states the evidence required to change the decision."
    ]
  }),
  "career-ai-strategy": buildSkillExpertAddendum({
    role: "Act like a Staff/Principal career strategist building proof of judgment, not a list of tools.",
    heuristics: [
      "Portfolio evidence should show scope, ambiguity handled, people influenced, risk reduced, and systems improved.",
      "AI leverage is credible only when it improves throughput without lowering explainability or review quality."
    ],
    failureModes: [
      "Career plan overfits to hot tools instead of durable capabilities: systems, product sense, communication, and leadership.",
      "Artifacts exist but do not prove business impact, technical depth, or cross-functional trust."
    ],
    gates: [
      "90-day plan has visible artifacts, measurable outcomes, and stakeholder feedback loops.",
      "Each capability gap maps to a project that creates value while building proof."
    ]
  }),
  "engineering-decision-map": buildSkillExpertAddendum({
    role: "Act like a systems decision maker translating product ambiguity into explicit trade-offs.",
    heuristics: [
      "Map invariants before components: user, money, permission, data, compliance, and operational truth.",
      "Score options by reversibility, blast radius, cognitive load, team ownership, and operational cost."
    ],
    failureModes: [
      "The team chooses architecture to avoid a hard product question.",
      "A one-way-door decision is treated like a reversible experiment."
    ],
    gates: [
      "Decision matrix includes rejected alternatives and accepted debt.",
      "Breaking point, observability, rollback, and owner are documented before implementation."
    ]
  }),
  "staff-engineer-ai-review-pack": buildSkillExpertAddendum({
    role: "Act like a Staff Engineer running a multi-lens production readiness review.",
    heuristics: [
      "Review through product, architecture, security, data, SRE, QA, accessibility, analytics, and release lenses.",
      "Ask which team owns the system six months after launch, not only who can build it this sprint."
    ],
    failureModes: [
      "A design passes engineering review but fails support, migration, on-call, or compliance reality.",
      "Risk matrix names risks but has no launch conditions or sign-off owners."
    ],
    gates: [
      "Hard blockers, launch conditions, owner map, and SLO impact are explicit.",
      "No big-bang rewrite without incremental migration and abort criteria."
    ]
  }),
  "data-resilience-observability-review": buildSkillExpertAddendum({
    role: "Act like an SRE/Data Reliability lead who assumes every dependency will eventually lie, lag, duplicate, or disappear.",
    heuristics: [
      "Design for restore, replay, reconciliation, and diagnosis before optimizing the happy-path query.",
      "Telemetry must answer: who is affected, what changed, where it slowed, what data is at risk, and when to rollback."
    ],
    failureModes: [
      "Dashboards look complete but cannot identify tenant, correlation ID, version, queue depth, or failed mutation.",
      "Backups exist but restore has never been rehearsed against real recovery objectives."
    ],
    gates: [
      "RPO/RTO, restore drill, load test, chaos scenario, and rollback trigger are defined.",
      "No PII/secrets in logs; every page alert has an action."
    ]
  }),
  "installed-skill-library-cartographer": buildSkillExpertAddendum({
    role: "Act like a capability architect turning thousands of local playbooks into a lean, owner-fit skill taxonomy.",
    heuristics: [
      "Count raw files, unique contents, unique names, duplicate families, runtime surfaces, and gaps against actual work.",
      "Use installed skills as research material; the final library should be smaller, sharper, and easier to route."
    ],
    failureModes: [
      "Copying every installed skill creates a bigger drawer, not a better operating system.",
      "Public content leaks local paths, usernames, marketplace cache noise, or private operational details."
    ],
    gates: [
      "Every added skill maps to a capability gap and a real use case.",
      "Inventory summary is aggregate-only and privacy-safe."
    ]
  }),
  "ai-product-evaluation": buildSkillExpertAddendum({
    role: "Act like an AI Product Lead plus Evaluation Engineer responsible for trust, usefulness, safety, and unit economics.",
    heuristics: [
      "Define the product promise and the model failure budget before choosing the model.",
      "Evaluate not only answer quality, but task completion, tool-call correctness, citation fidelity, refusal behavior, latency, and cost."
    ],
    failureModes: [
      "Demo tasks are too easy, so evals do not catch real ambiguity, stale retrieval, adversarial input, or workflow abandonment.",
      "The feature increases engagement while decreasing trust because users cannot inspect sources or undo actions."
    ],
    gates: [
      "Golden set, adversarial set, regression thresholds, and human review rubric exist before rollout.",
      "Trust UX covers source, uncertainty, editability, audit trail, escalation, and fallback."
    ]
  }),
  "agent-tools-mcp-automation": buildSkillExpertAddendum({
    role: "Act like a tooling platform engineer making agents useful without letting them become uncontrolled integration scripts.",
    heuristics: [
      "Treat every external tool call as a typed contract with permissions, pagination, retries, idempotency, and auditability.",
      "Prefer draft-first workflows for email, calendar, publishing, and anything user-visible."
    ],
    failureModes: [
      "Agent succeeds on one page of data and silently ignores pagination or partial failures.",
      "A connector action uses the wrong account, channel, folder, timezone, or shared mailbox because IDs were guessed."
    ],
    gates: [
      "Tool schemas, IDs, account boundary, and write permissions are verified before execution.",
      "State-changing actions produce inspectable result links or audit notes."
    ]
  }),
  "product-analytics-growth": buildSkillExpertAddendum({
    role: "Act like a product analytics lead protecting decision quality, event hygiene, and experiment validity.",
    heuristics: [
      "Start with the decision tree, then design the metric; otherwise dashboards become decorative.",
      "Watch identity resolution, event versioning, bot/internal traffic, cohort contamination, and guardrail metrics."
    ],
    failureModes: [
      "A/B test wins a click metric while harming retention, trust, accessibility, or revenue quality.",
      "Event names change casually and break historical dashboards or downstream analysis."
    ],
    gates: [
      "Tracking plan includes event owner, properties, trigger surface, privacy review, and migration notes.",
      "Experiment brief includes hypothesis, sample logic, stop rule, primary metric, and guardrails."
    ]
  }),
  "research-market-intelligence": buildSkillExpertAddendum({
    role: "Act like a research lead who distinguishes evidence, inference, weak signal, and narrative temptation.",
    heuristics: [
      "Prefer primary sources, dated evidence, customer language, and decision proximity over generic market summaries.",
      "Use research to reduce a concrete uncertainty, not to produce a longer report."
    ],
    failureModes: [
      "Competitor research copies positioning but misses distribution, switching cost, buyer inertia, and wedge strategy.",
      "A confident conclusion is built from stale sources, biased samples, or uncited synthesis."
    ],
    gates: [
      "Evidence table includes source, date, claim, caveat, and confidence.",
      "Recommendation states what experiment or decision should happen next."
    ]
  }),
  "security-privacy-threat-modeling": buildSkillExpertAddendum({
    role: "Act like a security architect looking for abuse economics, not only checklist compliance.",
    heuristics: [
      "Model attackers, insiders, confused deputies, compromised dependencies, prompt injection, and accidental data exposure.",
      "Trace sensitive data through logs, analytics, model context, caches, screenshots, exports, and support tooling."
    ],
    failureModes: [
      "Authentication is correct but authorization is object-level weak, creating IDOR or tenant data leaks.",
      "AI tooling leaks private context because retrieved content and instructions share the same trust boundary."
    ],
    gates: [
      "Threat model covers assets, actors, boundaries, abuse cases, mitigations, and verification tests.",
      "No sensitive feature ships without audit logs, least privilege, redaction, and incident path."
    ]
  }),
  "design-system-ui-craft": buildSkillExpertAddendum({
    role: "Act like a design systems lead who protects usability under real content, real data density, and real devices.",
    heuristics: [
      "Design for repeated work: scan speed, visual hierarchy, recoverability, keyboard flow, and low cognitive load.",
      "Test with long labels, translated text, empty datasets, dense tables, reduced motion, and touch targets."
    ],
    failureModes: [
      "The UI is beautiful in mock data but breaks with real content, permissions, loading, errors, or mobile constraints.",
      "A component library drifts because one-off styling bypasses tokens, semantics, or state coverage."
    ],
    gates: [
      "Every component has complete states and stable dimensions.",
      "Screenshot, responsive, keyboard, contrast, and no-overlap checks pass."
    ]
  }),
  "mobile-platform-engineering": buildSkillExpertAddendum({
    role: "Act like a mobile platform lead responsible for device reality, store constraints, performance, and release health.",
    heuristics: [
      "Simulator success is only a smoke test; device diversity, permissions, battery, memory, and network behavior decide quality.",
      "Mobile releases need telemetry, phased rollout, crash monitoring, app-store metadata, and privacy declarations."
    ],
    failureModes: [
      "SwiftUI or Compose state looks clean but breaks restoration, deep links, Dynamic Type, offline recovery, or accessibility.",
      "Store review fails because permissions, privacy labels, screenshots, or metadata were treated as afterthoughts."
    ],
    gates: [
      "Device matrix, accessibility pass, crash-free monitoring, and release checklist are defined.",
      "No release without rollback/disable path or customer support notes."
    ]
  }),
  "data-ml-science-workflow": buildSkillExpertAddendum({
    role: "Act like a data/ML reviewer who protects provenance, statistical validity, reproducibility, and decision humility.",
    heuristics: [
      "Ask what decision the analysis supports before selecting model, metric, chart, or notebook structure.",
      "Check leakage, sampling bias, stale data, units, missingness, confidence intervals, and baseline comparison."
    ],
    failureModes: [
      "A model improves a metric but fails under distribution shift, subgroup analysis, or operational constraints.",
      "A notebook is persuasive but unreproducible because data version, seed, environment, or transforms are implicit."
    ],
    gates: [
      "Data dictionary, provenance, reproducible environment, baseline, error analysis, and caveats are present.",
      "Claims distinguish correlation, prediction, causality, and speculation."
    ]
  })
};

export const studioAiSkills: StudioAiSkill[] = baseStudioAiSkills.map((skill) => {
  const expertAddendum = studioAiSkillExpertAddenda[skill.id];
  if (!expertAddendum) return skill;

  return {
    ...skill,
    markdown: `${skill.markdown.trim()}\n\n${expertAddendum}\n`
  };
});

export const studioWorkflowChecklists: StudioWorkflowChecklist[] = [
  {
    id: "ticket-intake-to-start",
    title: "Ticket intake to first commit",
    summary: "A checklist for turning a ticket into clear scope, context, plan, and first implementation step.",
    whenToUse: "Use before coding when a task arrives from product, support, design, or another engineer.",
    tags: ["Ticket", "Scoping", "Start work"],
    sections: [
      {
        id: "understand",
        title: "Understand the task",
        detail: "Make sure the work is a real problem, not only a requested change.",
        steps: [
          { id: "read-ticket", label: "Read the ticket and restate the goal in one sentence." },
          { id: "identify-user", label: "Identify the affected user, route, workflow, or system boundary." },
          { id: "acceptance", label: "Extract explicit acceptance criteria and mark missing criteria." },
          { id: "impact", label: "Check product, SEO, analytics, locale, accessibility, and privacy impact." }
        ]
      },
      {
        id: "prepare",
        title: "Prepare the work",
        detail: "Reduce uncertainty before opening files broadly.",
        steps: [
          { id: "find-patterns", label: "Find existing patterns, tests, helpers, and nearby ownership boundaries." },
          { id: "decide-scope", label: "Separate must-have changes from nice-to-have cleanup." },
          { id: "plan-verification", label: "Decide what commands, screenshots, or manual checks will prove the work." },
          { id: "note-risk", label: "Write down the highest-risk assumption before implementation." }
        ]
      },
      {
        id: "execute",
        title: "Start implementation",
        detail: "Make the first change easy to review.",
        steps: [
          { id: "small-diff", label: "Start with the smallest behavior-preserving edit." },
          { id: "update-tests", label: "Add or update tests at the same boundary as the behavior change." },
          { id: "update-tracking", label: "Update PostHog tracking when adding navigation, CTA, filters, forms, preferences, or new routes." },
          { id: "checkpoint", label: "Checkpoint with status if scope or risk changed." }
        ]
      }
    ]
  },
  {
    id: "ai-driven-engineering-foundation-roadmap",
    title: "AI-driven engineering foundation roadmap",
    summary: "A layered roadmap for building senior engineering judgment in the AI era.",
    whenToUse: "Use as a daily study map before or after engineering work, especially when a task touches architecture, data, reliability, or rollout.",
    tags: ["Engineering foundation", "Architecture", "Production"],
    sections: [
      {
        id: "code-design",
        title: "Layer 1: Code design foundation",
        detail: "Build codebases that are easy to test, refactor, and guide AI through without breaking architecture.",
        steps: [
          { id: "principles", label: "Study SOLID, DRY, KISS, YAGNI, dependency direction, and refactoring patterns." },
          { id: "architecture", label: "Practice Clean Architecture, Hexagonal Architecture, Onion Architecture, and Modular Monolith before jumping to microservices." },
          { id: "ddd", label: "Learn DDD tactical patterns.", detail: "Entity, Value Object, Aggregate, Repository, Domain Service, and Application Service." },
          { id: "patterns", label: "Build a pattern catalog by context.", detail: "Creational, structural, behavioral, enterprise, integration, resilience, and delivery patterns." },
          { id: "tests", label: "Choose the right testing layer.", detail: "Unit, integration, contract, E2E, property-based, migration, and rollback tests." }
        ]
      },
      {
        id: "data-consistency",
        title: "Layer 2: Data and consistency",
        detail: "Most production pain comes from weak data models, unsafe migrations, slow queries, or hidden consistency assumptions.",
        steps: [
          { id: "modeling", label: "Study relational modeling, constraints, normalization, denormalization, multi-tenant data, soft delete, and temporal data." },
          { id: "transactions", label: "Understand ACID, isolation levels, optimistic locks, pessimistic locks, deadlocks, and transaction boundaries." },
          { id: "indexes", label: "Practice indexing with evidence.", detail: "B-tree, composite, covering, partial, expression, GIN, GiST, SP-GiST, BRIN, and EXPLAIN ANALYZE." },
          { id: "migration", label: "Design data migration and rollback before code lands.", detail: "Backfill, online index, CDC, audit log, backup, restore, and compatibility." },
          { id: "replication", label: "Learn replication and availability.", detail: "Primary-replica, async lag, read-after-write, failover, split brain, RPO, RTO, and disaster recovery." }
        ]
      },
      {
        id: "distributed-resilience",
        title: "Layer 3: Distributed systems and resilience",
        detail: "A dependency can fail without taking the whole system down if the design has clear failure behavior.",
        steps: [
          { id: "timeouts", label: "Set timeouts before retries." },
          { id: "retry", label: "Use bounded retry with exponential backoff and jitter only when the operation is safe." },
          { id: "circuit-breaker", label: "Learn Circuit Breaker states.", detail: "Closed, open, and half-open." },
          { id: "bulkhead", label: "Use Bulkhead, rate limiting, throttling, backpressure, load shedding, fallback, and graceful degradation where needed." },
          { id: "idempotency", label: "Design idempotency, deduplication, distributed lock, DLQ, poison message handling, and queue-based load leveling." }
        ]
      },
      {
        id: "events-cqrs",
        title: "Layer 4: Event-driven architecture, CQRS, and Event Sourcing",
        detail: "Use events when they match the domain and operational model, not because they sound advanced.",
        steps: [
          { id: "event-types", label: "Compare direct API call, queue, pub/sub, log stream, Event Sourcing, and CDC." },
          { id: "event-sourcing", label: "Study Event Sourcing deeply.", detail: "Domain event, event store, aggregate stream, append-only log, projection, snapshot, replay, and event versioning." },
          { id: "cqrs", label: "Understand CQRS flow.", detail: "Command, handler, aggregate, event, projection handler, read model, and query." },
          { id: "outbox", label: "Use Transactional Outbox, Inbox, Idempotent Consumer, Saga, DLQ, schema versioning, and Anti-Corruption Layer when the problem needs them." },
          { id: "avoid-overuse", label: "Avoid Event Sourcing for simple CRUD or teams that cannot operate event schemas and projections yet." }
        ]
      },
      {
        id: "performance-observability",
        title: "Layer 5: Performance, cache, and production operation",
        detail: "Performance and reliability need signals before rollout, not only fixes after users complain.",
        steps: [
          { id: "cache", label: "Study cache-aside, read-through, write-through, write-behind, TTL, eviction, stampede, hot keys, CDN, and materialized views." },
          { id: "scale", label: "Practice pagination, batch processing, async jobs, load tests, and p50/p95/p99 latency measurement." },
          { id: "otel", label: "Use OpenTelemetry concepts.", detail: "Metrics, logs, traces, correlation ID, distributed tracing, and spans across services." },
          { id: "slo", label: "Learn SLI, SLO, SLA, error budget, RED metrics, USE metrics, alerting, runbooks, incidents, and postmortems." },
          { id: "well-architected", label: "Review operational excellence, security, reliability, performance efficiency, cost, and sustainability." }
        ]
      }
    ]
  },
  {
    id: "engineering-delivery-checklist",
    title: "Engineering delivery checklist",
    summary: "An eight-phase checklist from task intake to post-rollout review.",
    whenToUse: "Use whenever a task might affect architecture, data, traffic, users, production operation, or team handoff.",
    tags: ["Task", "Delivery", "Rollout"],
    sections: [
      {
        id: "intake",
        title: "Phase 1: Intake",
        detail: "Understand the real problem before choosing a technical shape.",
        steps: [
          { id: "business", label: "Name the business or user problem and the success metric." },
          { id: "scope", label: "Clarify scope, out-of-scope, deadline, priority, and affected users." },
          { id: "constraints", label: "Check dependencies, security, privacy, legal, data migration, backward compatibility, and production traffic impact." },
          { id: "questions", label: "Ask AI for clarification questions grouped by business, product, data, API, security, reliability, rollout, and observability." }
        ]
      },
      {
        id: "discovery",
        title: "Phase 2: Discovery",
        detail: "Map the current system before changing it.",
        steps: [
          { id: "flow", label: "Identify services, routes, jobs, APIs, events, data stores, owners, and existing patterns." },
          { id: "history", label: "Check related incidents, bottlenecks, dashboards, logs, and legacy constraints." },
          { id: "risk-register", label: "Ask AI for a dependency map, impacted components, integration points, risks, and missing information." }
        ]
      },
      {
        id: "design",
        title: "Phase 3: Design",
        detail: "Compare options and choose the simplest design that handles the real risk.",
        steps: [
          { id: "adr", label: "Create an ADR when the decision affects architecture, data, dependency, or rollout." },
          { id: "options", label: "Compare at least three options by complexity, scalability, consistency, cost, migration, rollback, and maintainability." },
          { id: "technical-decisions", label: "Decide sync API or async event, CRUD or CQRS or Event Sourcing, indexes, transaction boundary, cache, idempotency, retries, Circuit Breaker, and security model." }
        ]
      },
      {
        id: "implementation-plan",
        title: "Phase 4: Implementation plan",
        detail: "Turn the design into reviewable PRs.",
        steps: [
          { id: "slice", label: "Break work into backend, database, API contract, tests, observability, rollout, and documentation tasks." },
          { id: "compatibility", label: "Plan migration, feature flag, backward-compatible API changes, monitoring, rollback, and owner review." },
          { id: "test-plan", label: "Define unit, integration, contract, E2E, load, security, migration, and rollback checks." }
        ]
      },
      {
        id: "coding-review",
        title: "Phase 5: Coding and review",
        detail: "Keep implementation aligned with boundaries and production behavior.",
        steps: [
          { id: "boundaries", label: "Check architecture boundary, transaction boundary, validation, error handling, and ownership." },
          { id: "side-effects", label: "Verify retry cannot create duplicate side effects and sensitive data is not logged." },
          { id: "review", label: "Ask AI to review as a principal engineer for correctness, races, consistency, security, observability, performance, maintainability, and rollback risk." }
        ]
      },
      {
        id: "pre-rollout",
        title: "Phase 6: Verification before rollout",
        detail: "Prove the feature can survive normal and failure paths.",
        steps: [
          { id: "tests", label: "Run unit, integration, contract, E2E, load, security, migration dry-run, and backward compatibility checks as needed." },
          { id: "signals", label: "Prepare dashboard, alert, runbook, rollback path, and customer impact checks." },
          { id: "readiness", label: "Ask AI for a production readiness checklist with failure scenarios, monitoring, abort criteria, rollback, and data validation." }
        ]
      },
      {
        id: "rollout",
        title: "Phase 7: Rollout",
        detail: "Release in small steps and watch user impact.",
        steps: [
          { id: "dark-launch", label: "Deploy dark when possible, then enable internal users before canary." },
          { id: "monitor", label: "Monitor success metric, error rate, latency, DB load, query plan, queue lag, cache hit/miss, and support signal." },
          { id: "abort", label: "Define success criteria, abort criteria, rollback owner, communication plan, and kill switch." }
        ]
      },
      {
        id: "post-rollout",
        title: "Phase 8: Post-rollout",
        detail: "Turn delivery into learning and reusable system memory.",
        steps: [
          { id: "outcome", label: "Compare expected metrics with actual outcome, regressions, incidents, near misses, and alert noise." },
          { id: "docs", label: "Update docs, ADR, runbook, Studio checklist, and follow-up tickets." },
          { id: "review", label: "Ask AI for a post-rollout review with outcome, metrics, issues, user impact, technical debt, actions, and lessons learned." }
        ]
      }
    ]
  },
  {
    id: "senior-engineer-reflex",
    title: "Senior engineer reflex",
    summary: "A compact question set for any feature: business, product, domain, API, data, consistency, resilience, security, observability, and rollout.",
    whenToUse: "Use before implementation when the task feels simple but could hide production, data, or user risk.",
    tags: ["Senior reflex", "Questions", "Risk"],
    sections: [
      {
        id: "business-product-domain",
        title: "Business, product, and domain",
        detail: "Connect implementation to the real outcome.",
        steps: [
          { id: "business", label: "Which business metric, user group, and deadline matter here?" },
          { id: "product", label: "What are the happy path, edge cases, undo behavior, pending state, failed state, and audit needs?" },
          { id: "domain", label: "What are the main entities, aggregate boundary, state transitions, invariants, and domain events?" }
        ]
      },
      {
        id: "api-data-consistency",
        title: "API, data, and consistency",
        detail: "Make contracts and state changes explicit.",
        steps: [
          { id: "api", label: "Is the API sync or async, idempotent, versioned, paginated, and backward compatible?" },
          { id: "data", label: "What schema, migration, index, query scale, retention, and PII concerns exist?" },
          { id: "consistency", label: "Is strong consistency required, can eventual consistency work, and are race conditions or duplicate events possible?" }
        ]
      },
      {
        id: "resilience-security",
        title: "Resilience and security",
        detail: "Assume dependencies and users can behave unexpectedly.",
        steps: [
          { id: "dependency", label: "Which dependency can fail, slow down, or return partial failure?" },
          { id: "protection", label: "Are timeout, retry, Circuit Breaker, fallback, rate limit, and idempotency designed?" },
          { id: "security", label: "Who can use it, how is authorization enforced, what input is validated, and what should never be logged?" }
        ]
      },
      {
        id: "observability-rollout",
        title: "Observability and rollout",
        detail: "Decide how the system proves it is healthy.",
        steps: [
          { id: "signals", label: "What business metric, technical metric, trace, log, correlation ID, dashboard, and alert prove the feature is working?" },
          { id: "release", label: "Is there a feature flag, canary plan, abort criteria, rollback path, migration rollback, and monitoring owner?" },
          { id: "learning", label: "What should be archived after rollout so the next task starts with better judgment?" }
        ]
      }
    ]
  },
  {
    id: "capstone-production-project",
    title: "Capstone production project",
    summary: "A long-running e-commerce, subscription, or booking lab that combines architecture, data, resilience, events, and observability.",
    whenToUse: "Use as the practical lab for turning the roadmap into visible evidence and reusable engineering muscle.",
    tags: ["Capstone", "Practice", "Portfolio"],
    sections: [
      {
        id: "feature-set",
        title: "Product surface",
        detail: "Choose a domain that forces real production trade-offs.",
        steps: [
          { id: "domains", label: "Build user, catalog, cart, order, payment, inventory, notification, promotion, admin, audit, and reporting flows." },
          { id: "scope", label: "Start as a modular monolith before extracting services." },
          { id: "evidence", label: "Save ADRs, diagrams, test evidence, rollout notes, and postmortems as portfolio artifacts." }
        ]
      },
      {
        id: "foundation-requirements",
        title: "Foundation requirements",
        detail: "Prove the system has clear boundaries and data decisions.",
        steps: [
          { id: "architecture", label: "Use layered or hexagonal structure with module ownership." },
          { id: "postgres", label: "Model PostgreSQL tables, constraints, migrations, indexes, query plans, and backup/restore." },
          { id: "tests", label: "Add unit, integration, contract, E2E, migration, and rollback tests." }
        ]
      },
      {
        id: "resilience-events",
        title: "Resilience and events",
        detail: "Practice failure paths that show senior judgment.",
        steps: [
          { id: "cache", label: "Add Redis cache with invalidation, TTL, hit rate, and cache-down behavior." },
          { id: "outbox", label: "Use Outbox, queue worker, retry, DLQ, poison message runbook, and idempotent consumer." },
          { id: "payment", label: "Build a payment Saga with Circuit Breaker, fallback, and duplicate-payment protection." },
          { id: "event-sourcing", label: "Use Event Sourcing for the order lifecycle and CQRS read model for admin or reporting." }
        ]
      },
      {
        id: "production-requirements",
        title: "Production requirements",
        detail: "Operate the lab like a real system, not a demo.",
        steps: [
          { id: "otel", label: "Instrument OpenTelemetry traces, metrics, logs, and correlation IDs." },
          { id: "dashboard", label: "Create dashboards for request rate, errors, latency, DB latency, queue lag, cache hit rate, dependency failure, and business metrics." },
          { id: "rollout", label: "Use feature flags, zero-downtime migration, load test, runbook, alert, rollback drill, and post-rollout review." }
        ]
      }
    ]
  },
  {
    id: "module-creation",
    title: "Create a new module",
    summary: "A checklist for adding a route, feature module, service module, or reusable component without leaking responsibility.",
    whenToUse: "Use when adding a new feature surface or reusable module.",
    tags: ["Module", "Architecture", "Frontend", "Backend"],
    sections: [
      {
        id: "boundary",
        title: "Define the boundary",
        detail: "A module should have one reason to change.",
        steps: [
          { id: "owner", label: "Name what the module owns and what it depends on." },
          { id: "inputs", label: "Define inputs, outputs, and invalid states." },
          { id: "placement", label: "Place files beside existing patterns rather than inventing a new folder style." },
          { id: "public-api", label: "Expose a small public API and keep internals private." }
        ]
      },
      {
        id: "frontend",
        title: "Frontend checks",
        detail: "Keep the UI stable, accessible, and measurable.",
        steps: [
          {
            id: "states",
            label: "Cover UI states.",
            children: [
              { id: "loading", label: "Loading or pending state." },
              { id: "empty", label: "Empty state." },
              { id: "error", label: "Error or permission state." },
              { id: "mobile", label: "Mobile and narrow viewport behavior." }
            ]
          },
          { id: "tokens", label: "Use existing tokens, icons, spacing, and card rules." },
          { id: "tracking", label: "Add page, CTA, filter, search, preference, or outbound events when applicable." },
          { id: "a11y", label: "Check labels, focus order, keyboard path, and contrast." }
        ]
      },
      {
        id: "backend",
        title: "Backend checks",
        detail: "Make contracts explicit before implementation details spread.",
        steps: [
          { id: "contract", label: "Document API/job contract and validation rules." },
          { id: "auth", label: "Check authorization, ownership, and audit needs." },
          { id: "data", label: "Plan schema, indexes, migration, backfill, and retention." },
          { id: "observability", label: "Add logs, metrics, alerts, and business events if user behavior changes." }
        ]
      },
      {
        id: "verification",
        title: "Verification",
        detail: "A module is not done until it can be safely changed later.",
        steps: [
          { id: "unit", label: "Add focused unit or contract tests." },
          { id: "integration", label: "Add integration or route tests for cross-boundary behavior." },
          { id: "manual", label: "Run manual checks for the main workflow and one failure path." },
          { id: "docs", label: "Update docs, PR notes, and screenshots when the surface is user-facing." }
        ]
      }
    ]
  },
  {
    id: "ai-system-engineering-roadmap",
    title: "AI system engineering roadmap",
    summary: "A daily learning checklist for SDLC ownership, distributed architecture, storage systems, and AI-assisted engineering review.",
    whenToUse: "Use as the daily AI up-skill map when the goal is to become stronger at technical decisions, not only faster at code generation.",
    tags: ["AI up-skill", "System engineering", "Distributed systems", "Storage", "SDLC"],
    sections: [
      {
        id: "sdlc-ownership",
        title: "Pillar 1: SDLC ownership",
        detail: "Keep human ownership visible while AI accelerates implementation.",
        steps: [
          {
            id: "ai-paradox",
            label: "Watch the AI paradox.",
            detail: "Do not merge complex generated code without understanding the mechanism and production consequence."
          },
          {
            id: "productive-friction",
            label: "Keep productive friction in the workflow.",
            detail: "Use manual review, context-seeding sessions, and no-AI zones when learning or onboarding."
          },
          {
            id: "nine-phases",
            label: "Review the nine SDLC phases.",
            detail: "Strategy, requirements, architecture, coding, QA, release, observability, maintenance, and iteration."
          },
          {
            id: "telemetry-layers",
            label: "Map telemetry across eight layers.",
            detail: "Edge/network, service, application, data, Kubernetes, serverless/PaaS, CI/CD, and incident response."
          }
        ]
      },
      {
        id: "distributed-resilience-advanced",
        title: "Pillar 2: Distributed architecture and resilience",
        detail: "Learn the patterns that keep systems correct when state, time, and dependencies become messy.",
        steps: [
          {
            id: "event-sourcing-cqrs",
            label: "Study Event Sourcing plus CQRS as an operational model.",
            detail: "Event store, aggregate stream, snapshotting, projection, optimistic concurrency, and read model rebuild."
          },
          {
            id: "schema-evolution",
            label: "Practice event schema evolution.",
            detail: "Tolerant deserialization, upcasting, versioned events, and hot/warm/cold event storage."
          },
          {
            id: "circuit-breaker",
            label: "Understand Circuit Breaker deeply.",
            detail: "Closed, open, half-open, sliding windows, slow-call thresholds, fallback, and exception classification."
          },
          {
            id: "retry-composition",
            label: "Compose retry before Circuit Breaker deliberately.",
            detail: "Use bounded retry with exponential backoff and jitter, then record the final outcome into the breaker."
          }
        ]
      },
      {
        id: "storage-scale",
        title: "Pillar 3: Large-scale storage",
        detail: "Build the storage intuition needed for performance, availability, and safe data evolution.",
        steps: [
          {
            id: "btree-lsm",
            label: "Compare B-Tree and LSM-Tree.",
            detail: "Read-heavy in-place updates versus write-heavy append-only storage, compaction, and Bloom filters."
          },
          {
            id: "index-mastery",
            label: "Master practical indexing.",
            detail: "Clustered, non-clustered, composite, covering indexes, leftmost prefix rule, and index invalidation."
          },
          {
            id: "replication-consensus",
            label: "Study replication and consensus.",
            detail: "Sync, async, semi-sync replication, Raft/Multi-Paxos quorum, physical/logical replication, and replication slots."
          },
          {
            id: "sharding-transactions",
            label: "Learn sharding and distributed transactions.",
            detail: "Consistent hashing, virtual nodes, hotspot mitigation, 2PC trade-offs, and Saga as a practical alternative."
          }
        ]
      },
      {
        id: "ai-engineering-review",
        title: "Pillar 4: Professional AI engineering workflow",
        detail: "Use AI as analyst, critic, test strategist, and production reviewer while keeping final judgment human.",
        steps: [
          {
            id: "ai-elicitation",
            label: "Ask AI to clarify requirements before implementation.",
            detail: "Group questions by business, product, data, API, security, reliability, rollout, and observability."
          },
          {
            id: "adversarial-review",
            label: "Run adversarial architecture review.",
            detail: "Challenge race conditions, consistency bugs, security gaps, performance bottlenecks, and failure scenarios."
          },
          {
            id: "test-security",
            label: "Generate a test and security matrix.",
            detail: "Unit, integration, contract, E2E, migration, rollback, static security checks, and dependency failure paths."
          },
          {
            id: "daily-artifact",
            label: "Save one learning artifact per day.",
            detail: "ADR, prompt, query plan, resilience note, rollout checklist, runbook, or postmortem lesson."
          }
        ]
      }
    ]
  },
  {
    id: "release-readiness",
    title: "Release readiness",
    summary: "A checklist for deciding whether a change is ready to leave the branch.",
    whenToUse: "Use before merging, tagging, or preparing a production deployment.",
    tags: ["Release", "QA", "Merge"],
    sections: [
      {
        id: "quality",
        title: "Quality gate",
        detail: "Confirm the change is correct, tested, and reviewable.",
        steps: [
          { id: "scope", label: "Confirm PR scope matches the ticket and does not hide unrelated cleanup." },
          { id: "tests", label: "Run typecheck, tests, lint, and the relevant build command." },
          { id: "manual", label: "Manually check the critical route or workflow." },
          { id: "screenshots", label: "Attach screenshots for UI changes or explain why not." }
        ]
      },
      {
        id: "risk",
        title: "Risk gate",
        detail: "Make the release reversible and observable.",
        steps: [
          { id: "migration", label: "Confirm migrations and data changes are backward-compatible." },
          { id: "feature-flag", label: "Use a feature flag or staged path when blast radius is high." },
          { id: "analytics", label: "Confirm PostHog events still fire and new events are named consistently." },
          { id: "rollback", label: "Write rollback steps and who owns the decision." }
        ]
      },
      {
        id: "handoff",
        title: "Handoff",
        detail: "Leave enough context for reviewers and operators.",
        steps: [
          { id: "summary", label: "PR summary names changed behavior and affected routes." },
          { id: "verification", label: "Verification list includes exact commands and manual checks." },
          { id: "impact", label: "SEO, locale, analytics, content, and deployment impact are called out." },
          { id: "monitor", label: "Monitoring window and success signal are clear." }
        ]
      }
    ]
  },
  {
    id: "rollout-plan",
    title: "Rollout plan",
    summary: "A checklist for moving from merged code to production adoption with guardrails.",
    whenToUse: "Use for staged releases, feature flags, customer cohorts, migrations, or high-impact UI changes.",
    tags: ["Rollout", "Feature flag", "Monitoring"],
    sections: [
      {
        id: "pre-rollout",
        title: "Before rollout",
        detail: "Prepare the environment, audience, and fallback path.",
        steps: [
          { id: "target", label: "Define target cohort: internal, beta, percentage, tenant, or geography." },
          { id: "flag", label: "Confirm flag/config default and kill switch owner." },
          { id: "baseline", label: "Capture baseline metrics, conversion, error rate, and support signal." },
          { id: "comms", label: "Prepare release note, support note, and owner escalation path." }
        ]
      },
      {
        id: "during-rollout",
        title: "During rollout",
        detail: "Move in small steps and watch leading indicators.",
        steps: [
          {
            id: "phases",
            label: "Roll out by phase.",
            children: [
              { id: "phase-internal", label: "Internal or dogfood users." },
              { id: "phase-beta", label: "Small beta cohort." },
              { id: "phase-percent", label: "10%, 25%, 50%, then 100% if healthy." },
              { id: "phase-enterprise", label: "Named tenants only when support is ready." }
            ]
          },
          { id: "observe", label: "Watch errors, latency, conversion, PostHog events, and support tickets." },
          { id: "pause", label: "Pause rollout if any rollback trigger is reached." },
          { id: "log", label: "Log each phase change with timestamp, owner, and reason." }
        ]
      },
      {
        id: "after-rollout",
        title: "After rollout",
        detail: "Close the loop instead of only shipping the code.",
        steps: [
          { id: "compare", label: "Compare post-rollout metrics with baseline." },
          { id: "cleanup", label: "Remove stale flags, temporary code, and support workarounds." },
          { id: "learn", label: "Write down what surprised the team." },
          { id: "follow-up", label: "Create follow-up tickets for debt, docs, and analytics gaps." }
        ]
      }
    ]
  },
  {
    id: "daily-ai-learning-loop",
    title: "Daily AI learning loop",
    summary: "A short daily loop for improving AI skill through one useful practice, one saved artifact, and one review.",
    whenToUse: "Use every morning and evening when the goal is steady AI skill compounding without overloading the day.",
    tags: ["Daily", "AI learning", "Habit"],
    sections: [
      {
        id: "morning-orientation",
        title: "Morning orientation",
        detail: "Choose one AI practice that fits the day's real work.",
        steps: [
          { id: "energy", label: "Write current energy level, obligations, and open loops." },
          { id: "top-three", label: "Choose the top 3 outcomes for the day." },
          { id: "practice", label: "Pick one AI skill to practice.", detail: "Example: better Codex task slicing, Claude critique, NotebookLM source synthesis, or GPT decision framing." },
          { id: "time-block", label: "Reserve one small time block for the practice." }
        ]
      },
      {
        id: "workday-application",
        title: "Workday application",
        detail: "Learn through a real task instead of abstract tool browsing.",
        steps: [
          { id: "route-tool", label: "Route the task to the correct tool before prompting." },
          { id: "write-prompt", label: "Write the prompt with role, goal, context, output, and guardrails." },
          { id: "save-artifact", label: "Save one artifact.", detail: "Prompt, checklist, decision note, diff, screenshot, or lesson." },
          { id: "avoid-noise", label: "Stop if the AI loop becomes broader than the task." }
        ]
      },
      {
        id: "evening-review",
        title: "Evening review",
        detail: "Close the loop while the context is still fresh.",
        steps: [
          { id: "done", label: "List what was done, not done, and why." },
          { id: "tool-signal", label: "Note which AI tool helped and where it created noise." },
          { id: "prompt-improvement", label: "Write one prompt improvement for tomorrow." },
          { id: "archive", label: "Archive the lesson in NotebookLM, a ChatGPT Project, or Studio." }
        ]
      }
    ]
  },
  {
    id: "weekly-ai-os-review",
    title: "Weekly AI OS review",
    summary: "A weekly review for work, learning, finance, life, and the AI workflows that should compound.",
    whenToUse: "Use at the end of the week to convert scattered AI usage into reusable systems.",
    tags: ["Weekly review", "Life OS", "Career"],
    sections: [
      {
        id: "capture-week",
        title: "Capture the week",
        detail: "Collect enough facts to avoid reviewing only from memory.",
        steps: [
          { id: "work", label: "Summarize shipped work, PRs, blockers, incidents, and team moments." },
          { id: "learning", label: "List AI tools used, prompts saved, and workflows repeated." },
          { id: "life-finance", label: "Record health, energy, finance, relationships, and admin signals." },
          { id: "sources", label: "Move useful docs or notes into NotebookLM when source grounding matters." }
        ]
      },
      {
        id: "review-patterns",
        title: "Review patterns",
        detail: "Look for repeated signals, not only completed tasks.",
        steps: [
          { id: "wins-losses", label: "Write wins, losses, and what changed since last week." },
          { id: "avoidance", label: "Name one decision or conversation being avoided." },
          { id: "ai-leverage", label: "Identify where AI gave leverage and where it created rework." },
          { id: "hard-truth", label: "Write one hard truth that should influence next week." }
        ]
      },
      {
        id: "plan-next-week",
        title: "Plan next week",
        detail: "Turn reflection into a small operating plan.",
        steps: [
          { id: "priorities", label: "Choose top 5 priorities for the next week." },
          { id: "one-workflow", label: "Select one AI workflow to improve deliberately." },
          { id: "one-artifact", label: "Commit to one visible artifact.", detail: "Blog draft, RFC, automation demo, checklist, or portfolio note." },
          { id: "one-boundary", label: "Set one boundary to protect attention and data safety." }
        ]
      }
    ]
  },
  {
    id: "ai-tool-routing-decision-tree",
    title: "AI tool routing decision tree",
    summary: "A checklist for choosing NotebookLM, GPT, Claude, Codex, or Antigravity before starting work.",
    whenToUse: "Use when a task is vague, large, or tempting to ask every AI tool at once.",
    tags: ["Tool routing", "Decision", "Guardrails"],
    sections: [
      {
        id: "choose-first-tool",
        title: "Choose the first tool",
        detail: "Start with the tool that matches the bottleneck.",
        steps: [
          { id: "source", label: "If the answer must come from uploaded docs or notes, start with NotebookLM." },
          { id: "research", label: "If the question needs multi-source web research, start with GPT Deep Research." },
          { id: "decision", label: "If the task is strategy, planning, or trade-off analysis, start with GPT." },
          { id: "critique", label: "If the task needs deep critique, architecture review, or sensitive writing, start with Claude." },
          { id: "repo", label: "If the task changes code in a repo, start with Codex or Claude Code." },
          { id: "prototype", label: "If the task needs UI/browser verification or an end-to-end prototype, start with Antigravity." }
        ]
      },
      {
        id: "handoff",
        title: "Handoff between tools",
        detail: "Move only the useful context, not the whole conversation.",
        steps: [
          { id: "brief", label: "Write a short brief: goal, constraints, sources, acceptance criteria, and guardrails." },
          { id: "execute-review", label: "Let one AI execute and another AI review when quality risk is meaningful." },
          { id: "artifact", label: "Ask for an artifact that can be inspected.", detail: "Diff, checklist, report, screenshot, decision matrix, or test evidence." },
          { id: "archive", label: "Archive the final prompt, artifact, and lesson for reuse." }
        ]
      },
      {
        id: "safety",
        title: "Safety guardrails",
        detail: "Protect secrets, production, and judgment.",
        steps: [
          { id: "redact", label: "Redact secrets, private keys, customer data, and sensitive company details." },
          { id: "no-destructive", label: "Do not let agents run destructive commands or production migrations without explicit review." },
          { id: "tests", label: "Require tests or verification for code changes." },
          { id: "human-decision", label: "Keep final medical, legal, financial, and production-risk decisions with a human owner." }
        ]
      }
    ]
  },
  {
    id: "ai-assisted-feature-workflow",
    title: "AI-assisted feature workflow",
    summary: "A full feature workflow from idea to spec, implementation, review, rollout, and knowledge archive.",
    whenToUse: "Use for meaningful product or engineering changes where multiple AI tools can help without losing ownership.",
    tags: ["Feature", "GPT", "Claude", "Codex", "Antigravity"],
    sections: [
      {
        id: "shape",
        title: "Shape the work",
        detail: "Use AI to clarify the problem before assigning implementation.",
        steps: [
          { id: "gpt-prd", label: "Ask GPT for problem statement, user stories, acceptance criteria, non-goals, risks, rollout, and test plan." },
          { id: "claude-review", label: "Ask Claude to challenge architecture, assumptions, failure modes, and minimum viable scope." },
          { id: "slice", label: "Split into small Codex or Antigravity tasks that can be reviewed independently." }
        ]
      },
      {
        id: "execute",
        title: "Execute",
        detail: "Use the right agent for the right kind of work.",
        steps: [
          { id: "codex", label: "Use Codex for repo tasks with tests, clean diffs, refactors, migrations, and PR-ready work." },
          { id: "antigravity", label: "Use Antigravity for UI-heavy prototypes, browser verification, screenshots, and end-to-end artifacts." },
          { id: "checkpoint", label: "Checkpoint after each small task before expanding scope." }
        ]
      },
      {
        id: "review-release",
        title: "Review and release",
        detail: "Separate execution from review and release judgment.",
        steps: [
          { id: "ai-review", label: "Use Claude or GPT to review the diff for correctness, security, edge cases, test gaps, and migration risk." },
          { id: "human-review", label: "Human owner reviews trade-offs and final merge decision." },
          { id: "release-note", label: "Use GPT for release note, stakeholder update, and rollout checklist." },
          { id: "archive", label: "Archive PRD, RFC, decisions, test evidence, and postmortem notes in NotebookLM." }
        ]
      }
    ]
  },
  {
    id: "ninety-day-ai-skill-plan",
    title: "90-day AI skill plan",
    summary: "A phased plan for turning AI tools into daily practice, engineering leverage, career assets, and personal operating systems.",
    whenToUse: "Use as the quarterly roadmap for raising AI literacy and turning the stack into durable leverage.",
    tags: ["90 days", "Roadmap", "AI literacy"],
    sections: [
      {
        id: "week-one",
        title: "Week 1: setup the system",
        detail: "Create the containers before trying to optimize every workflow.",
        steps: [
          { id: "projects", label: "Create five ChatGPT Projects.", detail: "PhongOS, Engineering Leadership, Finance & Investment, Learning & Research, Writing / Personal Brand." },
          { id: "notebooks", label: "Create five NotebookLM notebooks.", detail: "Career Archive, Finance Library, Learning AI/Systems, Life Archive, Work Knowledge Base." },
          { id: "templates", label: "Save prompt templates for Codex, Claude, Antigravity, NotebookLM, and GPT." },
          { id: "logs", label: "Create decision_log, career_roadmap, finance_snapshot, and AI Operating System folders." }
        ]
      },
      {
        id: "days-eight-thirty",
        title: "Days 8-30: work productivity",
        detail: "Turn repeated engineering work into playbooks.",
        steps: [
          { id: "pr-review", label: "Create a PR review playbook." },
          { id: "incident", label: "Create incident and postmortem workflow." },
          { id: "feature", label: "Create feature spec to implementation workflow." },
          { id: "ship", label: "Ship one AI-assisted feature and one refactor or test improvement." }
        ]
      },
      {
        id: "days-thirty-one-sixty",
        title: "Days 31-60: career leverage",
        detail: "Convert work into evidence and assets.",
        steps: [
          { id: "portfolio", label: "Draft Staff Engineer portfolio evidence." },
          { id: "writing", label: "Draft three technical writing pieces." },
          { id: "internal-proposal", label: "Write one internal proposal for AI-assisted engineering workflow." },
          { id: "demo", label: "Build one demo automation with Codex or Antigravity." }
        ]
      },
      {
        id: "days-sixty-one-ninety",
        title: "Days 61-90: life, finance, future",
        detail: "Extend the operating system beyond code.",
        steps: [
          { id: "finance", label: "Create finance dashboard and investment checklist." },
          { id: "principles", label: "Write personal operating principles and boundaries." },
          { id: "career-strategy", label: "Create 3-year career strategy with three scenarios." },
          { id: "learning-roadmap", label: "Create 12-month learning roadmap and stable weekly review habit." }
        ]
      }
    ]
  }
];

export const studioFolders: StudioFolder[] = [
  {
    id: "machine-bootstrap",
    label: "Machine bootstrap",
    subtitle: "New laptop checklist",
    icon: "laptop",
    groups: [
      {
        label: "AI setup",
        noteIds: ["ai-operating-system", "ai-driven-engineering-foundation", "antigravity-awesome-skills", "open-design"]
      },
      {
        label: "Computer setup",
        noteIds: ["computer-baseline"]
      },
      {
        label: "Terminal setup",
        noteIds: ["terminal-baseline"]
      }
    ]
  },
  {
    id: "ai-learning",
    label: "AI learning",
    subtitle: "Things to study next",
    icon: "brain",
    groups: [
      {
        label: "Operating system",
        noteIds: ["ai-operating-system", "ai-driven-engineering-foundation", "ai-system-engineering-roadmap"]
      },
      {
        label: "Agent systems",
        noteIds: ["multi-agent-ai", "openhands", "crewai"]
      }
    ]
  },
  {
    id: "design-tools",
    label: "Design tools",
    subtitle: "Design support for agents",
    icon: "palette",
    groups: [
      {
        label: "Open Design",
        noteIds: ["open-design"]
      }
    ]
  }
];

export const studioNotes: StudioNote[] = [
  {
    id: "ai-operating-system",
    folderId: "machine-bootstrap",
    title: "AI Operating System",
    subtitle: "Daily direction for using NotebookLM, GPT, Claude, Codex, and Antigravity as one system.",
    status: "ready",
    updatedAt: "2026-06-21",
    tags: ["AI OS", "NotebookLM", "GPT", "Claude", "Codex", "Antigravity", "Daily learning"],
    summary:
      "This note turns the AI stack into a daily operating system: NotebookLM keeps source-backed truth, GPT plans, Claude critiques, Codex ships code, Antigravity verifies prototypes, and every useful lesson becomes a reusable artifact.",
    sections: [
      {
        heading: "The operating principle",
        body:
          "The bottleneck is not a lack of AI tools. The bottleneck is scattered context. The system should capture facts first, clarify the real problem, route work to the right tool, review risky output, and archive the lesson so tomorrow starts from a better baseline."
      },
      {
        heading: "Tool roles",
        body:
          "NotebookLM is the source-backed memory. GPT is the chief of staff for planning, research, decision support, and weekly reviews. Claude is the deep reviewer for architecture, writing, assumptions, and sensitive communication. Codex is the repo execution engine for PRs, tests, refactors, and migrations. Antigravity is the agentic lab for prototypes, UI flows, browser verification, and multi-agent dev experiments."
      },
      {
        heading: "Daily learning direction",
        body:
          "Each day should produce one small improvement: a better prompt, a reusable checklist, a reviewed diff, a clearer decision, a sourced note, or one saved workflow. The goal is not to use every tool every day; the goal is to make the right tool choice repeatable."
      },
      {
        heading: "Career direction",
        body:
          "The strongest path is AI-native Staff Engineer / Tech Lead: software architecture, agent orchestration, engineering leadership, product thinking, communication, and financial discipline. The assets to build are an AI engineering playbook, architecture portfolio, public writing, and automation demos."
      }
    ],
    commands: [
      {
        label: "Morning planning prompt",
        command:
          "Today is [date]. Energy: [x]. Obligations: [x]. Open loops: [x]. Help me choose top 3 outcomes, one AI workflow to practice, one thing to delay, one health/career action, and a realistic time-block plan.",
        note: "Use in the PhongOS / Life & Career project."
      },
      {
        label: "Weekly command center prompt",
        command:
          "Here is my current state: Work: [x]. Life: [x]. Finance: [x]. Health: [x]. Relationships: [x]. Learning: [x]. Create a one-page command center: what matters now, what is risky, what to ignore, decisions needed, and next actions for 7 days.",
        note: "Use on Sunday or before a high-context week."
      },
      {
        label: "Tool routing prompt",
        command:
          "I have this task: [task]. Decide the best AI tool sequence across NotebookLM, GPT, Claude, Codex, and Antigravity. Include why, prompts for each tool, guardrails, and the artifact I should save.",
        note: "Use when a task feels too broad or when tool choice is unclear."
      }
    ],
    checklist: [
      {
        label: "Create ChatGPT Projects.",
        detail: "PhongOS, Engineering Leadership, Finance & Investment, Learning & Research, Writing / Personal Brand."
      },
      {
        label: "Create NotebookLM notebooks.",
        detail: "Career Archive, Finance Library, Learning AI/Systems, Life Archive, Work Knowledge Base."
      },
      {
        label: "Save reusable prompt templates for GPT, Claude, Codex, Antigravity, and NotebookLM."
      },
      {
        label: "Run the daily AI learning loop at least once per workday."
      },
      {
        label: "Archive one useful lesson or artifact each week.",
        checked: true
      },
      {
        label: "Do not upload secrets, private keys, customer data, or sensitive company data into personal AI tools.",
        checked: true
      }
    ]
  },
  {
    id: "ai-driven-engineering-foundation",
    folderId: "machine-bootstrap",
    title: "AI-Driven Engineering Foundation",
    subtitle: "Daily roadmap for technical decision-making from task intake to production operation.",
    status: "ready",
    updatedAt: "2026-06-21",
    tags: ["Engineering roadmap", "Architecture", "Data", "Resilience", "Observability", "AI workflow"],
    summary:
      "This note keeps the long-term learning direction visible: AI can generate code quickly, but senior leverage comes from asking the right technical questions, choosing the right trade-offs, verifying failure modes, and owning production behavior.",
    sections: [
      {
        heading: "Why this matters",
        body:
          "The next step is not to ask AI for more code. The next step is to build a stronger decision map: what to ask AI to analyze, which assumptions to challenge, which risks require tests, and how to release without turning production into a guessing game."
      },
      {
        heading: "Seven layers from task to production",
        body:
          "Every meaningful task should pass through seven layers: business need, domain or use case, API or workflow contract, data and consistency model, architecture and patterns, implementation and testing, then rollout, observability, and operation."
      },
      {
        heading: "Knowledge layers to compound",
        body:
          "Study software design, data modeling, replication and consistency, distributed systems resilience, event-driven architecture with CQRS and Event Sourcing, caching and performance, observability, SRE, and production operation. The goal is not to memorize every term. The goal is to know when each idea becomes useful."
      },
      {
        heading: "Daily practice rule",
        body:
          "Before coding, read one layer and ask one senior reflex question. After coding, save one artifact: a better prompt, a query plan, an ADR, a test case, a rollout risk, a dashboard signal, or a small lesson for the next task."
      },
      {
        heading: "Capstone direction",
        body:
          "Use one long-running e-commerce, subscription, or booking platform as the lab. Start with a modular monolith, PostgreSQL, Redis cache, Outbox, queue worker, payment Saga, Circuit Breaker, CQRS read model, Event Sourcing for order lifecycle, OpenTelemetry, dashboards, feature flags, zero-downtime migration, load tests, runbooks, and ADRs."
      }
    ],
    commands: [
      {
        label: "Task clarification prompt",
        command:
          "Act as a Staff Software Engineer. Given this requirement, ask me the most important clarification questions before implementation. Group questions by business, product, data, API, security, reliability, rollout, and observability.",
        note: "Use before assigning a task to Codex or Antigravity."
      },
      {
        label: "Architecture decision prompt",
        command:
          "Create an Architecture Decision Record for this feature. Compare at least 3 options. For each option, analyze complexity, scalability, consistency, operational risk, cost, migration effort, rollback strategy, and long-term maintainability.",
        note: "Use when a change affects architecture, data, or production operation."
      },
      {
        label: "Production readiness prompt",
        command:
          "Generate a production readiness checklist for this feature. Include test cases, failure scenarios, monitoring, alerts, rollback, data migration validation, customer impact checks, and abort criteria.",
        note: "Use before rollout or before asking for final review."
      }
    ],
    checklist: [
      {
        label: "Read one roadmap layer before starting meaningful engineering work."
      },
      {
        label: "Ask one senior reflex question before implementation.",
        detail: "Business, product, domain, API, data, consistency, resilience, security, observability, or rollout."
      },
      {
        label: "Use AI first for analysis and critique, not only code generation."
      },
      {
        label: "Save one reusable artifact after each task.",
        detail: "Prompt, checklist, ADR, query plan, test matrix, runbook, rollout note, or postmortem lesson."
      },
      {
        label: "Move one capstone project forward every week."
      }
    ]
  },
  {
    id: "ai-system-engineering-roadmap",
    folderId: "ai-learning",
    title: "AI-Driven System Engineering Roadmap",
    subtitle: "Daily map for SDLC ownership, distributed systems, storage scale, and AI-assisted review.",
    status: "ready",
    updatedAt: "2026-06-21",
    tags: ["AI up-skill", "System engineering", "SDLC", "Distributed systems", "Storage", "AI workflow"],
    summary:
      "This roadmap keeps the next learning layer visible: AI can write code faster, but a senior engineer must own architecture decisions, verify distributed failure modes, understand storage trade-offs, and use AI as a disciplined reviewer.",
    sections: [
      {
        heading: "Core shift",
        body:
          "The goal is to move from syntax-level coding to system ownership. AI can draft code and tests, but the engineer still decides the domain model, data contract, consistency model, rollout path, observability plan, and acceptable operational risk."
      },
      {
        heading: "Pillar 1: SDLC ownership",
        body:
          "Study the full software lifecycle as a governance system: strategy and discovery, requirements and specification, architecture and design, implementation, QA, release, observability and incident response, maintenance and tech debt, then feedback and iteration. The habit to build is psychological ownership: never ship generated code that you cannot explain or monitor."
      },
      {
        heading: "Pillar 2: Distributed architecture and resilience",
        body:
          "Go deeper on Event Sourcing, CQRS, snapshots, optimistic concurrency, event schema evolution, hot/warm/cold event storage, Circuit Breaker states, sliding windows, fallback behavior, and retry with exponential backoff plus jitter. The practical question is always: what happens when dependency behavior is slow, duplicated, delayed, or partially failed?"
      },
      {
        heading: "Pillar 3: Large-scale storage",
        body:
          "Build storage intuition through B-Tree versus LSM-Tree, clustered and non-clustered indexes, composite and covering indexes, leftmost prefix rule, index invalidation, synchronous and asynchronous replication, Raft or Multi-Paxos quorum, logical replication, sharding, consistent hashing, virtual nodes, hotspot mitigation, 2PC, and Saga."
      },
      {
        heading: "Pillar 4: Professional AI engineering workflow",
        body:
          "Use AI first as requirement analyst, architecture challenger, test strategist, and production-readiness reviewer. Ask it to surface ambiguity, challenge race conditions and consistency assumptions, design test matrices, and list rollback or observability gaps before assigning code generation."
      }
    ],
    commands: [
      {
        label: "AI-first elicitation prompt",
        command:
          "Act as a staff software engineer. Given this requirement, ask me the most important clarification questions before implementation. Group questions by business, product, data, API, security, reliability, rollout, and observability.",
        note: "Use before turning a vague ticket into tasks."
      },
      {
        label: "Adversarial architecture review prompt",
        command:
          "Challenge this design. Find race conditions, data consistency bugs, security risks, performance bottlenecks, hidden operational assumptions, and production failure scenarios.",
        note: "Use before asking Codex or Antigravity to implement."
      },
      {
        label: "Test and security strategy prompt",
        command:
          "Generate a test matrix for this feature: unit, integration, contract, E2E, load, security, migration, rollback, and dependency failure scenarios. Identify which tests must block release.",
        note: "Use before rollout planning."
      }
    ],
    checklist: [
      {
        label: "Review one SDLC phase and one telemetry layer each week."
      },
      {
        label: "Study one distributed pattern deeply.",
        detail: "Event Sourcing, CQRS, Circuit Breaker, Retry, Saga, Outbox, or idempotent consumer."
      },
      {
        label: "Practice one storage topic with evidence.",
        detail: "Index plan, replication behavior, sharding trade-off, consistent hashing, or query plan."
      },
      {
        label: "Use AI as critic before using it as coder."
      },
      {
        label: "Archive one artifact daily so learning compounds.",
        checked: true
      }
    ]
  },
  {
    id: "antigravity-awesome-skills",
    folderId: "machine-bootstrap",
    title: "Antigravity Awesome Skills",
    subtitle: "The command that installs my reusable agent skill library.",
    status: "ready",
    updatedAt: "2026-06-20",
    tags: ["AI setup", "Antigravity", "Codex", "Claude", "Gemini", "Skills"],
    summary:
      "This is not a list of every installed skill. It is the install note I need when I move to a new machine: what to run, where the source lives, and what to ask an agent to restore.",
    sections: [
      {
        heading: "What this gives me",
        body:
          "Antigravity Awesome Skills is an installable library of reusable SKILL.md playbooks for AI coding assistants. I use it as a repeatable source for agent operating instructions instead of relying on memory or one-off prompts."
      },
      {
        heading: "Owner and source",
        body:
          "The GitHub owner is sickn33. The repository is the canonical source, and the hosted catalog is useful when I only need to search or share a link."
      },
      {
        heading: "How an agent should help me later",
        body:
          "When I send this note to an agent on a new laptop, the agent should first open the GitHub repo, check the latest README, then run the install command that matches the target tool. It should not copy credential files from an old machine."
      }
    ],
    commands: [
      {
        label: "Main install",
        command: "npx antigravity-awesome-skills",
        note: "Default command I want to remember first."
      },
      {
        label: "Antigravity CLI install",
        command: "npx antigravity-awesome-skills --agy",
        note:
          "Use when I want Antigravity CLI slash-command skills under ~/.gemini/antigravity-cli/skills."
      },
      {
        label: "Reduced install example",
        command:
          "npx antigravity-awesome-skills --path .agents/skills --category development,backend --risk safe,none",
        note: "Useful if a full install overloads a tool."
      },
      {
        label: "Claude plugin path",
        command:
          "/plugin marketplace add sickn33/antigravity-awesome-skills && /plugin install antigravity-awesome-skills",
        note: "Claude Code plugin install path mentioned in the getting-started docs."
      }
    ],
    links: [
      {
        label: "GitHub repository",
        href: "https://github.com/sickn33/antigravity-awesome-skills",
        note: "Canonical project page."
      },
      {
        label: "Getting started",
        href: "https://github.com/sickn33/antigravity-awesome-skills/blob/main/docs/users/getting-started.md",
        note: "Tool-specific install notes."
      },
      {
        label: "Hosted catalog",
        href: "https://sickn33.github.io/antigravity-awesome-skills",
        note: "Search and browse surface."
      }
    ],
    checklist: [
      {
        label: "Open the repository and confirm the latest install command.",
        checked: true
      },
      {
        label: "Run the installer for the target agent surface.",
        detail: "Antigravity, Claude Code, Codex, Gemini, Cursor, or another supported tool."
      },
      {
        label: "Restart the agent/CLI after install.",
        detail: "Many tools only discover new skills on startup."
      },
      {
        label: "Do not migrate credentials or OAuth cache files.",
        checked: true
      }
    ]
  },
  {
    id: "open-design",
    folderId: "design-tools",
    title: "Open Design",
    subtitle: "Design workspace and MCP helper for agent-driven UI artifacts.",
    status: "ready",
    updatedAt: "2026-06-20",
    tags: ["Design", "MCP", "Codex", "Claude", "Gemini", "Antigravity"],
    summary:
      "Open Design can support this Studio direction as a design reference and future MCP integration. I do not have a callable Open Design tool in this session, but the project itself is worth keeping in the setup notes.",
    sections: [
      {
        heading: "What it is",
        body:
          "Open Design describes itself as a local-first, open-source Claude Design alternative. It focuses on agent-native design artifacts: prototypes, dashboards, decks, images, videos, HyperFrames, design systems, plugins, and exportable HTML/PDF/PPTX/MP4 outputs."
      },
      {
        heading: "Why it belongs in this setup",
        body:
          "It matches the direction of this route: a Studio surface where agents can help create or polish interface artifacts. It also supports mainstream coding agents through an MCP install command."
      },
      {
        heading: "How to use it later",
        body:
          "On a new machine, install Open Design first, then wire MCP into the agent I want to use. For this repo, Codex and Antigravity are the first targets; Claude and Gemini are next."
      }
    ],
    commands: [
      {
        label: "Install Open Design MCP for Codex",
        command: "od mcp install codex"
      },
      {
        label: "Install Open Design MCP for Antigravity",
        command: "od mcp install antigravity"
      },
      {
        label: "Install Open Design MCP for Claude",
        command: "od mcp install claude"
      },
      {
        label: "Install Open Design MCP for Gemini",
        command: "od mcp install gemini"
      },
      {
        label: "Dry-run an MCP install",
        command: "od mcp install codex --print"
      }
    ],
    links: [
      {
        label: "GitHub repository",
        href: "https://github.com/nexu-io/open-design",
        note: "Open-source project page."
      },
      {
        label: "Website and download",
        href: "https://open-design.ai",
        note: "Product site linked from the repository."
      }
    ],
    checklist: [
      {
        label: "Install or open the native Open Design app."
      },
      {
        label: "Wire MCP into Codex.",
        detail: "Start with od mcp install codex."
      },
      {
        label: "Wire MCP into Antigravity if I want design support there."
      },
      {
        label: "Use Open Design as a reference for admin/workspace UI structure.",
        checked: true
      }
    ]
  },
  {
    id: "computer-baseline",
    folderId: "machine-bootstrap",
    title: "Computer setup",
    subtitle: "OS-level checklist before project work feels normal.",
    status: "draft",
    updatedAt: "2026-06-20",
    tags: ["Computer setup", "macOS", "Browser", "Security"],
    summary:
      "This note is for the non-terminal part of a new engineering machine: folders, browsers, fonts, login flows, and basic safety rules.",
    sections: [
      {
        heading: "Goal",
        body:
          "A new laptop should feel boring quickly: the same project folder layout, the same browsers for testing, the same fonts for long reading sessions, and no accidental movement of secrets into public notes."
      }
    ],
    checklist: [
      {
        label: "Create ~/Documents/Projects and clone active repositories."
      },
      {
        label: "Install browser set for development and OAuth testing."
      },
      {
        label: "Restore coding and reading fonts."
      },
      {
        label: "Re-authenticate tools instead of copying token files.",
        checked: true
      }
    ]
  },
  {
    id: "terminal-baseline",
    folderId: "machine-bootstrap",
    title: "Terminal setup",
    subtitle: "Command line baseline for engineering work.",
    status: "draft",
    updatedAt: "2026-06-20",
    tags: ["Terminal setup", "Git", "Node", "Bun", "PlantUML"],
    summary:
      "This note keeps the command-line setup close to the actual work: Git, GitHub CLI, Node/Bun, Java/PlantUML, deployment commands, and AI CLI install commands.",
    sections: [
      {
        heading: "Goal",
        body:
          "Before opening a big task, the terminal should already know who I am, how to authenticate, how to run the project, and how to validate docs or diagrams."
      }
    ],
    commands: [
      {
        label: "Run the local app",
        command: "npm run dev"
      },
      {
        label: "Typecheck",
        command: "npm run typecheck"
      },
      {
        label: "PlantUML syntax check",
        command: "java -jar plantuml.jar --check-syntax docs/diagrams/*.puml"
      }
    ],
    checklist: [
      {
        label: "Configure Git identity and SSH key workflow."
      },
      {
        label: "Log in to GitHub CLI."
      },
      {
        label: "Install Node, npm, Bun, Java, and project CLIs."
      },
      {
        label: "Keep install commands in this Studio page."
      }
    ]
  },
  {
    id: "multi-agent-ai",
    folderId: "ai-learning",
    title: "Multi-agent AI",
    subtitle: "How I want to study agent collaboration without losing judgment.",
    status: "next",
    updatedAt: "2026-06-20",
    tags: ["AI learning", "Multi-agent", "Workflow"],
    summary:
      "Future note for patterns where multiple agents help plan, code, review, test, or research without turning the workflow into noise.",
    sections: [
      {
        heading: "Question to answer",
        body:
          "When does a multi-agent setup produce better engineering judgment, and when is a single focused agent plus good tests enough?"
      }
    ],
    checklist: [
      {
        label: "Compare planner, implementer, reviewer, and verifier roles."
      },
      {
        label: "Write down failure modes before adding automation."
      }
    ]
  },
  {
    id: "openhands",
    folderId: "ai-learning",
    title: "OpenHands",
    subtitle: "Place to capture setup notes and real use cases later.",
    status: "next",
    updatedAt: "2026-06-20",
    tags: ["AI learning", "OpenHands"],
    summary:
      "A placeholder note for OpenHands. The useful future version should include install commands, project fit, and where it overlaps with Codex or Claude.",
    sections: [
      {
        heading: "Question to answer",
        body:
          "Is OpenHands best used as a local coding teammate, a sandboxed task runner, or a specialized workflow for longer autonomous changes?"
      }
    ]
  },
  {
    id: "crewai",
    folderId: "ai-learning",
    title: "CrewAI",
    subtitle: "Place to capture crew patterns after practical experiments.",
    status: "next",
    updatedAt: "2026-06-20",
    tags: ["AI learning", "CrewAI", "Agents"],
    summary:
      "A placeholder note for CrewAI. The future note should focus on when a crew abstraction helps more than a plain script or a single agent.",
    sections: [
      {
        heading: "Question to answer",
        body:
          "What tasks benefit from explicit roles, memory, and handoff between agents, and what tasks become slower because of that structure?"
      }
    ]
  }
];

export const studioFlowGroups: StudioFlowGroup[] = [
  {
    id: "architecture",
    title: "Architecture & System Design",
    subtitle: "Decide before drawing boxes.",
    description:
      "Flows for system design interviews, architecture reviews, and trade-off decisions where the hard part is choosing boundaries.",
    flowIds: ["system-design", "architecture-decision"]
  },
  {
    id: "production",
    title: "Production & Delivery",
    subtitle: "Move carefully when real users are involved.",
    description:
      "Flows for incidents, release readiness, rollout gates, and operational handoffs that protect reliability without slowing every change.",
    flowIds: ["incident-response", "release-readiness"]
  },
  {
    id: "ai-and-career",
    title: "AI Delivery & Career Proof",
    subtitle: "Turn work into leverage.",
    description:
      "Flows for AI-assisted delivery and portfolio stories that make engineering judgment visible without turning the work into marketing copy.",
    flowIds: ["ai-delivery", "portfolio-story"]
  },
  {
    id: "react-flow-library",
    title: "React Flow Library Demo",
    subtitle: "Show architecture shapes before choosing a diagram.",
    description:
      "A React Flow showcase for software architecture diagrams: built-in nodes, custom architecture shapes, groups, edge styles, labels, markers, minimap, controls, and background.",
    flowIds: ["react-flow-architecture-demo"]
  }
];

export const studioFlows: StudioFlow[] = [
  {
    id: "system-design",
    groupId: "architecture",
    title: "System Design Interview Flow",
    summary:
      "A calm path from vague prompt to clear architecture, with capacity, data, API, failure modes, and trade-offs handled in order.",
    seoTitle: "System Design Interview Flow for Senior Software Engineers",
    seoDescription:
      "A practical system design flow for framing requirements, choosing boundaries, modeling data, handling scale, and explaining trade-offs clearly.",
    useWhen:
      "Use this when a prompt starts broad, such as designing a notification system, a booking platform, a feed, or an internal workflow tool.",
    outcome:
      "A shareable design narrative that shows senior judgment: what matters, what can wait, where the risks are, and how the system evolves.",
    officeExample:
      "A product manager asks for a new partner onboarding flow. Instead of jumping to services and queues, this flow starts with who changes what data, which steps need approval, and where rollback matters.",
    tags: ["System Design", "Architecture", "Trade-offs", "Interview"],
    steps: [
      {
        id: "frame-problem",
        title: "Frame the problem",
        detail:
          "Restate users, jobs, constraints, and non-goals before naming any technology.",
        evidence: "Business goal, actor list, read/write paths, latency or reliability expectations.",
        output: "A short problem frame and a list of assumptions to confirm."
      },
      {
        id: "shape-interfaces",
        title: "Shape the interfaces",
        detail:
          "Sketch APIs, events, user actions, and admin actions around the real workflow.",
        evidence: "Request examples, event names, idempotency needs, permissions, and error paths.",
        output: "API/event contract notes with the first boundary decisions."
      },
      {
        id: "model-data",
        title: "Model the data",
        detail:
          "Choose ownership, consistency rules, indexes, retention, and migration direction.",
        evidence: "Core entities, invariants, query patterns, lifecycle states, and audit needs.",
        output: "Data model sketch plus consistency and migration notes."
      },
      {
        id: "design-runtime",
        title: "Design the runtime",
        detail:
          "Place services, queues, cache, workers, and gateways only where they solve a named pressure.",
        evidence: "Capacity estimate, fan-out, dependency limits, hot paths, and deployment constraints.",
        output: "Runtime architecture with the reason behind each moving part."
      },
      {
        id: "stress-failures",
        title: "Stress the failure modes",
        detail:
          "Walk through slow dependencies, duplicate requests, partial writes, bad deploys, and stale reads.",
        evidence: "Timeouts, retry budget, DLQ behavior, backpressure, observability, and rollback triggers.",
        output: "Failure-mode table with mitigation and monitoring hooks."
      },
      {
        id: "explain-evolution",
        title: "Explain the evolution path",
        detail:
          "Name the first practical version, the breaking points, and the next design when traffic or team size changes.",
        evidence: "Current team capacity, likely traffic curve, operational maturity, and cost ceiling.",
        output: "Versioned roadmap: v1, scale trigger, and rejected alternatives."
      }
    ],
    artifacts: [
      "Problem frame",
      "API and event notes",
      "Data ownership sketch",
      "Runtime diagram",
      "Failure-mode table",
      "Evolution roadmap"
    ],
    cvSignals: [
      "System design judgment",
      "Backend and platform thinking",
      "Trade-off communication",
      "Operational maturity"
    ]
  },
  {
    id: "architecture-decision",
    groupId: "architecture",
    title: "Architecture Decision Flow",
    summary:
      "A lightweight RFC/ADR path for turning messy options into one clear recommendation, including trade-offs and rollback.",
    seoTitle: "Architecture Decision Flow with RFC and ADR Thinking",
    seoDescription:
      "A practical architecture decision flow for comparing options, scoring trade-offs, documenting risks, and aligning teams before implementation.",
    useWhen:
      "Use this before a feature crosses module boundaries, changes data ownership, adds a new integration, or introduces a hard-to-reverse dependency.",
    outcome:
      "A decision note that helps teammates understand not only what was chosen, but why the rejected paths were rejected.",
    officeExample:
      "A team debates whether to add a queue for partner sync. This flow separates the real need, failure behavior, team support cost, and the moment where async processing actually earns its complexity.",
    tags: ["RFC", "ADR", "Architecture Review", "Decision Matrix"],
    steps: [
      {
        id: "name-decision",
        title: "Name the decision",
        detail:
          "Write the decision in one sentence and make the scope small enough to approve.",
        evidence: "Current pain, affected systems, owners, deadline, and what stays out of scope.",
        output: "Decision statement with scope and non-goals."
      },
      {
        id: "extract-invariants",
        title: "Extract invariants",
        detail:
          "List what must remain true for users, money, permissions, data, audit, and support.",
        evidence: "Domain rules, compliance needs, support workflows, and production incidents.",
        output: "Invariant list that every option must satisfy."
      },
      {
        id: "compare-options",
        title: "Compare real options",
        detail:
          "Evaluate two or three practical options, not a perfect design against a strawman.",
        evidence: "Delivery cost, reversibility, performance, reliability, team fit, and future migration.",
        output: "Option table with honest trade-offs."
      },
      {
        id: "risk-gates",
        title: "Set risk gates",
        detail:
          "Define validation, telemetry, rollout, and rollback before implementation starts.",
        evidence: "Tests, dashboards, feature flags, migration scripts, runbooks, and owner sign-off.",
        output: "Decision gates and launch conditions."
      },
      {
        id: "write-decision",
        title: "Write the decision",
        detail:
          "Keep the final note short enough to read during review, but complete enough to survive handoff.",
        evidence: "Chosen option, rejected alternatives, accepted debt, and revisit trigger.",
        output: "ADR/RFC entry ready for review."
      }
    ],
    artifacts: [
      "Decision statement",
      "Invariant list",
      "Option matrix",
      "Risk gates",
      "ADR/RFC note"
    ],
    cvSignals: [
      "Architecture leadership",
      "Requirement clarity",
      "Cross-team alignment",
      "Risk management"
    ]
  },
  {
    id: "incident-response",
    groupId: "production",
    title: "Production Incident Flow",
    summary:
      "A practical incident path from first signal to rollback, communication, root cause, and follow-up work.",
    seoTitle: "Production Incident Response Flow for Engineering Teams",
    seoDescription:
      "A production incident flow for triage, blast-radius control, rollback, communication, root cause analysis, and follow-up tracking.",
    useWhen:
      "Use this when alerts, customer reports, deploy regressions, or partner failures create pressure and the team needs calm sequencing.",
    outcome:
      "A controlled incident response where decisions are visible, users are protected, and the postmortem produces real prevention work.",
    officeExample:
      "After a release, checkout latency climbs and support sees duplicate complaints. This flow keeps the team from guessing by separating signal, mitigation, rollback, and root-cause work.",
    tags: ["Incident", "SRE", "Rollback", "Postmortem"],
    steps: [
      {
        id: "confirm-signal",
        title: "Confirm the signal",
        detail:
          "Separate a real user-impacting incident from a noisy metric or isolated dependency blip.",
        evidence: "Alert, dashboard, logs, traces, customer reports, deploy timeline, and affected segment.",
        output: "Incident status, severity, and initial owner."
      },
      {
        id: "contain-blast-radius",
        title: "Contain blast radius",
        detail:
          "Protect users first with flags, rate limits, rollback, traffic shift, or temporary disablement.",
        evidence: "Feature flags, release version, dependency health, error budget, and safe rollback path.",
        output: "Mitigation action with expected user impact."
      },
      {
        id: "coordinate-room",
        title: "Coordinate the room",
        detail:
          "Assign incident lead, comms, investigation, and verification so the team does not duplicate effort.",
        evidence: "Owners, timestamps, current hypothesis, customer message, and next update time.",
        output: "Shared incident timeline and communication cadence."
      },
      {
        id: "verify-recovery",
        title: "Verify recovery",
        detail:
          "Do not close the incident just because one graph improves; check the user path and downstream queues.",
        evidence: "SLOs, synthetic checks, real traffic, queue depth, support signal, and error-rate recovery.",
        output: "Recovery confirmation and watch window."
      },
      {
        id: "write-postmortem",
        title: "Write the follow-up",
        detail:
          "Turn the incident into prevention work without blaming the person who touched the deploy.",
        evidence: "Root cause, contributing factors, missed detection, and prevention options.",
        output: "Postmortem, action items, owners, and due dates."
      }
    ],
    artifacts: [
      "Severity note",
      "Mitigation log",
      "Incident timeline",
      "Recovery checklist",
      "Postmortem actions"
    ],
    cvSignals: [
      "Production ownership",
      "Reliability thinking",
      "Stakeholder communication",
      "Calm under pressure"
    ]
  },
  {
    id: "release-readiness",
    groupId: "production",
    title: "Release Readiness Flow",
    summary:
      "A rollout gate for checking scope, tests, observability, migration safety, communication, and rollback before release.",
    seoTitle: "Release Readiness Flow for Safe Software Rollouts",
    seoDescription:
      "A release readiness flow for validating tests, analytics, migration safety, observability, communication, rollout gates, and rollback plans.",
    useWhen:
      "Use this before a feature reaches production, especially when it touches checkout, authentication, data migration, integrations, or user-facing routes.",
    outcome:
      "A release that can be explained, monitored, paused, and rolled back without heroic cleanup after the fact.",
    officeExample:
      "A team is shipping a new dashboard filter with analytics and SEO changes. This flow makes sure behavior, tracking, empty states, and rollback are covered before the deploy button becomes tempting.",
    tags: ["Release", "Rollout", "QA", "Observability"],
    steps: [
      {
        id: "confirm-scope",
        title: "Confirm scope",
        detail:
          "Match the release to the ticket, acceptance criteria, non-goals, and user-facing behavior.",
        evidence: "Ticket, diff summary, screenshots, copy changes, and affected routes.",
        output: "Release scope and explicit non-goals."
      },
      {
        id: "verify-behavior",
        title: "Verify behavior",
        detail:
          "Run the checks that match the risk: unit, integration, E2E, accessibility, typecheck, and manual smoke.",
        evidence: "Command output, test coverage, browser checks, mobile checks, and known gaps.",
        output: "Verification note with remaining risk."
      },
      {
        id: "check-data",
        title: "Check data and migrations",
        detail:
          "Review schema changes, backfills, indexes, caches, analytics events, and SEO paths.",
        evidence: "Migration plan, rollback script, data volume, event names, canonical URLs, and sitemap impact.",
        output: "Data and tracking readiness checklist."
      },
      {
        id: "prepare-observability",
        title: "Prepare observability",
        detail:
          "Make sure the release can be watched after deploy with actionable signals, not vanity graphs.",
        evidence: "Dashboards, alerts, logs, traces, feature flags, and owner coverage.",
        output: "Watch plan and escalation path."
      },
      {
        id: "rollout-decision",
        title: "Make the rollout decision",
        detail:
          "Choose gradual rollout, immediate release, hold, or rollback based on evidence.",
        evidence: "Risk score, user segment, support readiness, deploy window, and rollback confidence.",
        output: "Go/hold decision with rollback trigger."
      }
    ],
    artifacts: [
      "Scope note",
      "Verification evidence",
      "Data and analytics checklist",
      "Watch plan",
      "Rollout decision"
    ],
    cvSignals: [
      "End-to-end delivery",
      "QA judgment",
      "SEO and analytics awareness",
      "Release ownership"
    ]
  },
  {
    id: "ai-delivery",
    groupId: "ai-and-career",
    title: "AI-Assisted Delivery Flow",
    summary:
      "A controlled way to use AI agents for implementation without losing scope, privacy, tests, or human judgment.",
    seoTitle: "AI-Assisted Software Delivery Flow with Human Review",
    seoDescription:
      "An AI-assisted delivery flow for scoping tasks, packaging context, applying changes, verifying behavior, and handing off review-ready work.",
    useWhen:
      "Use this when an AI agent helps with coding, review, research, docs, refactors, or test generation inside a real codebase.",
    outcome:
      "A review-ready change where AI helped with speed and coverage, while the engineer still owns scope, correctness, and release risk.",
    officeExample:
      "A teammate asks for a Studio feature. This flow turns the request into bounded context, tells the agent what not to touch, verifies analytics and SEO, then reviews the diff before commit.",
    tags: ["AI Delivery", "Agents", "Code Review", "Verification"],
    steps: [
      {
        id: "scope-task",
        title: "Scope the task",
        detail:
          "Translate the request into acceptance criteria, affected surfaces, non-goals, and privacy boundaries.",
        evidence: "User request, repo instructions, local constraints, analytics rules, and deployment permission.",
        output: "Task brief with clear boundaries."
      },
      {
        id: "package-context",
        title: "Package context",
        detail:
          "Give the agent the files, examples, conventions, tests, and warnings that matter.",
        evidence: "Existing patterns, similar components, data model, locale behavior, and tests.",
        output: "Context pack and implementation hints."
      },
      {
        id: "execute-small",
        title: "Execute in small slices",
        detail:
          "Keep edits narrow, use existing abstractions, and verify each risky boundary before moving on.",
        evidence: "Diff chunks, compile feedback, UI behavior, and unchanged unrelated files.",
        output: "Focused implementation diff."
      },
      {
        id: "verify-review",
        title: "Verify and review",
        detail:
          "Run tests, inspect the diff, check copy quality, analytics wiring, and security/privacy implications.",
        evidence: "Test output, manual checks, changed-file list, and residual risks.",
        output: "Verification summary and review notes."
      },
      {
        id: "handoff-clean",
        title: "Handoff cleanly",
        detail:
          "Prepare commit, PR, release notes, or deployment only when the human request allows it.",
        evidence: "Git status, staged diff, commit message, PR checklist, and approval state.",
        output: "Commit/PR/deploy-ready handoff."
      }
    ],
    artifacts: [
      "Task brief",
      "Context pack",
      "Focused diff",
      "Verification note",
      "Review handoff"
    ],
    cvSignals: [
      "AI fluency",
      "Engineering judgment",
      "Privacy awareness",
      "Modern delivery practice"
    ]
  },
  {
    id: "portfolio-story",
    groupId: "ai-and-career",
    title: "Portfolio Story Flow",
    summary:
      "A way to turn real engineering work into a clear CV, blog, or interview story without over-polishing the truth.",
    seoTitle: "Engineering Portfolio Story Flow for CV and Interview Proof",
    seoDescription:
      "A portfolio story flow for turning engineering work into clear context, actions, trade-offs, impact, evidence, and next-step learning.",
    useWhen:
      "Use this after a project, incident, migration, release, leadership moment, or hard trade-off that should become career evidence.",
    outcome:
      "A grounded story that can become a CV bullet, blog post, interview answer, or portfolio case study.",
    officeExample:
      "A refactor reduced support noise but did not have a dramatic headline. This flow captures the before/after, the decision pressure, and the quiet operational value.",
    tags: ["CV", "Portfolio", "Writing", "Career"],
    steps: [
      {
        id: "capture-context",
        title: "Capture context",
        detail:
          "Name the team situation, user pain, constraints, and why the work mattered at that moment.",
        evidence: "Ticket, incident note, stakeholder request, metric, support theme, or code health signal.",
        output: "Context paragraph that feels specific, not inflated."
      },
      {
        id: "show-actions",
        title: "Show the actions",
        detail:
          "Describe what you changed, decided, coordinated, or simplified in plain engineering language.",
        evidence: "Diff, design note, PR discussion, rollout plan, test evidence, or migration record.",
        output: "Action list with technical and collaboration detail."
      },
      {
        id: "name-tradeoffs",
        title: "Name the trade-offs",
        detail:
          "Explain the constraint that made the work interesting: time, reliability, UX, cost, privacy, or team capacity.",
        evidence: "Rejected option, accepted debt, rollback plan, or future trigger.",
        output: "Trade-off note that shows judgment."
      },
      {
        id: "prove-impact",
        title: "Prove the impact",
        detail:
          "Use numbers when available, but also capture reduced risk, cleaner handoff, better reliability, or faster support.",
        evidence: "Before/after metrics, customer signal, deploy health, incident reduction, or team adoption.",
        output: "Impact statement with evidence and caveat."
      },
      {
        id: "shape-story",
        title: "Shape the story",
        detail:
          "Turn the raw material into the right format for CV, interview, blog, or portfolio page.",
        evidence: "Audience, keyword, desired role, proof links, and confidentiality boundary.",
        output: "CV bullet, STAR answer, blog outline, or case-study draft."
      }
    ],
    artifacts: [
      "Context paragraph",
      "Action list",
      "Trade-off note",
      "Impact statement",
      "Story draft"
    ],
    cvSignals: [
      "Impact communication",
      "Senior engineer narrative",
      "Business awareness",
      "Reflective practice"
    ]
  },
  {
    id: "react-flow-architecture-demo",
    groupId: "react-flow-library",
    title: "React Flow Architecture Demo",
    summary:
      "A library-style canvas showing what @xyflow/react can express for software architecture: node shapes, groups, edge types, markers, labels, minimap, controls, and background.",
    seoTitle: "React Flow Architecture Demo for Software Diagrams",
    seoDescription:
      "A React Flow studio demo for software architecture diagrams with built-in node styles, custom architecture shapes, groups, edge types, labels, markers, minimap, controls, and background.",
    useWhen:
      "Use this when choosing how to model a system architecture, service map, platform topology, event flow, or deployment boundary with React Flow.",
    outcome:
      "A visual catalog of node and edge patterns that can be reused for architecture diagrams without confusing the demo with a product use-case map.",
    officeExample:
      "A team wants to explain a payment checkout architecture. This demo shows how to express client boundaries, API gateway, auth, services, database, cache, queue, event topic, external provider, observability, and rollback risk in one React Flow canvas.",
    tags: ["React Flow", "XYFlow", "Architecture Diagram", "Node Shapes", "Edge Types"],
    steps: [
      {
        id: "show-node-primitives",
        title: "Show node primitives",
        detail:
          "Render input, default, output, and group-style nodes before adding custom architecture vocabulary.",
        evidence: "Built-in node roles, labels, badges, handles, and grouping boundaries.",
        output: "A baseline canvas that shows the primitives React Flow starts from."
      },
      {
        id: "add-architecture-shapes",
        title: "Add architecture shapes",
        detail:
          "Use custom nodes for API gateways, services, workers, databases, cache, queues, topics, external systems, decisions, risks, and notes.",
        evidence: "Software architecture entities, deployment boundaries, data flow, and operational risk.",
        output: "A reusable shape catalog for system diagrams."
      },
      {
        id: "compare-edge-types",
        title: "Compare edge types",
        detail:
          "Show default, straight, step, smoothstep, and simplebezier edges with labels, arrows, and animated async paths.",
        evidence: "Synchronous call, async event, retry path, projection, observability, and rollback relationship.",
        output: "An edge language that makes architecture diagrams easier to read."
      },
      {
        id: "use-canvas-controls",
        title: "Use canvas controls",
        detail:
          "Keep Background, Controls, MiniMap, fitView, zoom, and pan available so large architecture maps remain inspectable.",
        evidence: "Large graph size, grouped zones, readable zoom level, and stable positions.",
        output: "A diagram surface that works for both overview and inspection."
      },
      {
        id: "model-system-architecture",
        title: "Model system architecture",
        detail:
          "Place client, edge, domain, data, external, and operations zones in one architecture story.",
        evidence: "Bounded context, service ownership, persistence, integration, telemetry, and rollout safety.",
        output: "A checkout-style reference architecture that demonstrates the full shape set."
      },
      {
        id: "turn-demo-into-template",
        title: "Turn demo into a template",
        detail:
          "Use the demo as a starting point for architecture review, RFC, ADR, onboarding, or incident explanation.",
        evidence: "Reusable node kinds, edge tones, zone layout, and copy that names real engineering trade-offs.",
        output: "A React Flow architecture template ready to adapt."
      }
    ],
    artifacts: [
      "React Flow node shape catalog",
      "Software architecture canvas",
      "Edge type comparison",
      "Group and boundary example",
      "Minimap and controls demo",
      "Reusable architecture template"
    ],
    cvSignals: [
      "React Flow implementation",
      "Software architecture visualization",
      "Diagram system design",
      "Platform communication"
    ],
    architectureDemo: reactFlowArchitectureDemo
  }
];

export const defaultStudioNoteId = "ai-operating-system";
