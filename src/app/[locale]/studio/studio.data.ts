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

export const studioAiSkills: StudioAiSkill[] = [
  {
    id: "code-review",
    category: "engineering",
    title: "Code Review Expert",
    summary: "Conduct rigorous code reviews focusing on cyclomatic complexity, OWASP Top 10, SOLID principles, and architectural drift.",
    tags: ["Code Review", "Static Analysis", "Security", "Quality"],
    markdown: `# Code Review Expert Skill

Use this skill when reviewing pull requests (PRs), analyzing diffs, or auditing codebases.

## Core Directives
- **Correctness & Edge Cases**: Identify off-by-one errors, race conditions, memory leaks, and unhandled exceptions.
- **Security & Privacy**: Enforce OWASP Top 10. Check for SQLi, XSS, CSRF, IDOR, improper auth, and PII leakage.
- **Architecture & Maintainability**: Enforce SOLID, DRY, and KISS principles. Flag architectural drift, tight coupling, and cyclic dependencies.
- **Performance**: Identify O(N^2) bottlenecks, N+1 query problems, and inefficient memory allocations.

## Systematic Review Process
1. **Context Verification**: Align diff changes with the PR's core intent. Identify missing domain logic.
2. **Threat Modeling**: Run a mental STRIDE analysis on new inputs/outputs.
3. **AST-level Analysis**: Check for anti-patterns specific to the language/framework.
4. **Test Coverage Analysis**: Verify unit, integration, and mutation testing coverage. Ensure edge-case combinatorial testing is present.

## Output Format
- **Critical Blockers**: Security vulnerabilities, data loss risks, or severe regressions (MUST FIX).
- **Architectural Feedback**: Structural improvements to reduce technical debt.
- **Micro-Optimizations**: Performance and readability nits.
- **Missing Verifications**: Test scenarios that are absent.

## Guardrails
- Reject stylistic bikeshedding; focus on objective metrics and AST logic.
- Do not approve without verified test coverage for new business logic.
- Halt review immediately if a critical security flaw is detected.
`
  },
  {
    id: "frontend-architecture",
    category: "engineering",
    title: "Frontend Architecture",
    summary: "Design scalable, high-performance web applications optimizing Core Web Vitals, state management, and component hydration.",
    tags: ["Frontend", "Architecture", "Web Vitals", "React"],
    markdown: `# Frontend Architecture Skill

Use this skill when scaffolding new web applications, designing component systems, or refactoring frontend monoliths.

## Core Directives
- **Rendering Strategy**: Decide between CSR, SSR, SSG, or ISR based on TTL, SEO, and personalization requirements.
- **State Management**: Segregate server state (e.g., TanStack Query) from global client state (e.g., Zustand, Redux) and ephemeral local state.
- **Performance Optimization**: Optimize Core Web Vitals (LCP, INP, CLS). Implement code splitting, route prefetching, and progressive hydration.
- **Accessibility & UX**: Enforce WCAG 2.1 AA compliance, semantic HTML, and ARIA landmarks.

## Architecture Process
1. **Boundary Definition**: Identify routing paradigms, layouts, and error boundaries.
2. **Data Fetching Layer**: Define caching invalidation strategies, optimistic UI updates, and retry mechanisms.
3. **Component Design**: Implement Atomic Design or feature-sliced design. Ensure UI components are pure and decoupled from business logic.
4. **Observability**: Integrate RUM (Real User Monitoring), error tracking, and performance tracing.

## Output Format
- **System Diagram**: Component hierarchy and data flow boundaries.
- **State Taxonomy**: Mapping of state locations and lifecycles.
- **Performance Budget**: Target metrics for bundles and Web Vitals.
- **Implementation Phases**: Step-by-step roadmap.

## Guardrails
- Avoid premature abstraction; prefer composition over inheritance.
- Prevent layout thrashing by enforcing strict CSS container sizing.
- Do not bypass accessibility requirements for aesthetic gains.
`
  },
  {
    id: "backend-architecture",
    category: "engineering",
    title: "Backend Architecture",
    summary: "Design robust distributed systems utilizing microservices, EDA, CQRS, and zero-trust security.",
    tags: ["Backend", "Distributed Systems", "API", "Scalability"],
    markdown: `# Backend Architecture Skill

Use this skill to design scalable APIs, asynchronous workers, event-driven topologies, and data persistence layers.

## Core Directives
- **Topology Design**: Choose between Modular Monolith, Microservices, or Serverless. Define bounded contexts (DDD).
- **Data Persistence**: Apply CAP Theorem. Select appropriate datastores (Relational, NoSQL, Time-Series, Graph). Design sharding and replication schemas.
- **Communication Patterns**: Define synchronous (REST/gRPC) vs. asynchronous (Message Brokers, Event Bus, Kafka) contracts. Implement Saga or Outbox patterns for distributed transactions.
- **Resilience**: Implement Circuit Breakers, Bulkheads, Token Bucket rate-limiting, and automatic retries with exponential backoff and jitter.

## Architecture Process
1. **Domain Modeling**: Map entities, aggregates, and value objects.
2. **Contract First**: Define OpenAPI/gRPC specs before implementation. Establish idempotency keys.
3. **Security Posture**: Implement Zero-Trust, mTLS, OAuth2/OIDC, and RBAC/ABAC at the API gateway layer.
4. **Observability**: Enforce structured logging, distributed tracing (OpenTelemetry), and RED/USE metrics.

## Output Format
- **C4 Model Context/Container Diagram**: High-level system interaction.
- **Data Schema & Migration Plan**: Table definitions and partitioning strategies.
- **API Contracts**: Endpoint definitions with failure mode modeling.
- **SLA/SLO Definitions**: Target availability and latency percentiles.

## Guardrails
- Do not introduce distributed systems complexity without justifying the operational overhead (OpEx).
- Ensure all mutation endpoints are strictly idempotent.
- Never design a system without a clear rollback and disaster recovery capability.
`
  },
  {
    id: "blog-content-writer",
    category: "content",
    title: "Technical Content Strategist",
    summary: "Produce high-signal, authoritative technical articles optimized for semantic search and cognitive retention.",
    tags: ["Content", "SEO", "Technical Writing"],
    markdown: `# Technical Content Strategist Skill

Use this skill for writing engineering blogs, technical deep-dives, architectural postmortems, and authoritative documentation.

## Core Directives
- **High Signal-to-Noise**: Eliminate fluff. Maximize information density.
- **Epistemic Rigor**: Back claims with empirical data, benchmarks, or verifiable industry standards.
- **Semantic Optimization**: Optimize for NLP and LSI keywords. Structure with precise heading hierarchies (H1 > H2 > H3) and semantic HTML.
- **Cognitive Load Reduction**: Use analogies, sequence diagrams, and code snippets to explain complex abstract concepts.

## Writing Process
1. **Hook & Premise**: State the core problem, the stakes, and the thesis in the first paragraph.
2. **Contextual Framing**: Establish the baseline architecture or technical landscape before introducing the solution.
3. **The 'How' and 'Why'**: Dive into the implementation details. Show the code, explain the trade-offs, and highlight the pitfalls.
4. **Conclusion & Synthesis**: Summarize the heuristic or mental model the reader should walk away with.

## Output Format
- **Metadata**: SEO Title, Meta Description, Canonical URL structure.
- **Outline**: Structural breakdown.
- **Full Manuscript**: The complete markdown text.
- **TL;DR**: A 3-bullet executive summary.

## Guardrails
- Avoid hyperbolic marketing jargon ("revolutionary", "game-changing").
- Do not invent statistics or hallucinate technical capabilities.
- Maintain a calm, objective, and expert tone.
`
  },
  {
    id: "prompt-writing",
    category: "content",
    title: "Prompt Engineering Expert",
    summary: "Design deterministic, injection-resistant LLM prompts using CoT, ToT, and strict output schema enforcement.",
    tags: ["Prompting", "LLM", "AI Output"],
    markdown: `# Prompt Engineering Expert Skill

Use this skill to design, refine, and optimize system instructions and few-shot prompts for LLM agents.

## Core Directives
- **Context Framing**: Establish precise role-playing boundaries and operating contexts to anchor the LLM's latent space.
- **Reasoning Elicitation**: Force Chain-of-Thought (CoT) or Tree-of-Thought (ToT) generation before the final output to improve logical coherence.
- **Constraint Programming**: Explicitly list positive constraints (MUST DO) and negative constraints (MUST NOT DO).
- **Schema Enforcement**: Define strict, parsable output structures (e.g., JSON Schema, Markdown tables).

## Prompt Architecture
1. **System Persona**: "You are an expert in X..."
2. **Task Definition**: Clear, unambiguous objective.
3. **Input Variables**: Placeholder interpolation instructions.
4. **Heuristics & Rules**: Behavioral guidelines and safety boundaries.
5. **Few-Shot Exemplars**: High-quality input/output pairs demonstrating the exact desired reasoning and format.

## Output Format
- **System Prompt**: The core instruction set.
- **User Prompt Template**: The dynamic input wrapper.
- **Evaluation Criteria**: How to test if the prompt succeeded.

## Guardrails
- Prevent prompt injection by explicitly sanitizing or isolating untrusted user input within delimiters (e.g., \`<user_input>\`).
- Avoid vague adjectives; use quantifiable metrics for tone and length.
- Never assume implicit knowledge; pass required facts in the context window.
`
  },
  {
    id: "status-report",
    category: "operations",
    title: "Executive Status & Operations",
    summary: "Synthesize OKRs, sprint velocity, MTTR, and critical path blockers into high-impact executive summaries.",
    tags: ["Operations", "Reporting", "Metrics"],
    markdown: `# Executive Status & Operations Skill

Use this skill to generate daily standup logs, weekly sprint retrospectives, or monthly OKR reviews.

## Core Directives
- **Bottom-Line Up Front (BLUF)**: State the health of the project and critical risks immediately.
- **Data-Driven Progress**: Quantify progress using burn-down rates, DORA metrics, or SLA compliance.
- **Bottleneck Identification**: Apply the Theory of Constraints. Highlight the exact node blocking the critical path.
- **Actionable Escalation**: Define exact decisions needed from stakeholders with clear binary options or recommendations.

## Reporting Process
1. **Data Aggregation**: Collect commits, incident logs, completed tickets, and metric dashboards.
2. **Signal Extraction**: Filter out routine operations; highlight anomalies, shipped value, and regressions.
3. **Risk Matrix**: Evaluate blockers on a Probability vs. Impact matrix.
4. **Next Steps**: Assign strict ownership and deadlines for mitigation tasks.

## Output Format
- **Executive Summary**: 2 sentences max. Health status (Green/Yellow/Red).
- **Key Milestones Achieved**: Quantified wins.
- **Critical Risks & Blockers**: Current fires and assigned firefighters.
- **Upcoming Cycle**: Strategic focus for the next period.

## Guardrails
- Eliminate vanity metrics; report only actionable KPIs.
- Do not obscure failures; practice blameless transparency.
- Keep the report scannable. Use bullet points and bold keywords.
`
  },
  {
    id: "doc-spec-tech-spec",
    category: "engineering",
    title: "Technical Specification & RFC",
    summary: "Author rigorous Architecture Decision Records (ADRs) and RFCs focusing on NFRs, STRIDE, and implementation paths.",
    tags: ["RFC", "ADR", "Documentation", "Architecture"],
    markdown: `# Technical Specification & RFC Skill

Use this skill to write engineering specs, Request for Comments (RFCs), Architecture Decision Records (ADRs), and system designs.

## Core Directives
- **Problem Space Definition**: Clearly articulate the 'Why' before the 'How'. Map user impact to technical necessity.
- **Non-Functional Requirements (NFRs)**: Explicitly define SLIs, SLAs, throughput, latency, security, and compliance constraints.
- **Alternative Analysis**: Rigorously evaluate at least two alternative architectures. Justify the chosen path using trade-off matrices.
- **Risk & Threat Modeling**: Perform a STRIDE analysis. Define failure domains, blast radius, and rollback strategies.

## Specification Structure
1. **Context & Scope**: Background, Goals, and strictly defined Non-Goals.
2. **Proposed Architecture**: System diagrams, API contracts, database schema migrations.
3. **Operational Readiness**: Observability metrics, deployment phasing (e.g., Canary), and data backfill strategies.
4. **Security & Privacy**: RBAC changes, PII handling, and encryption at rest/transit.

## Output Format
- **Complete RFC Document**: Ready for peer review.
- **Implementation Phasing**: Epic and ticket breakdown.
- **Reviewer Checklist**: Key areas requiring stakeholder sign-off.

## Guardrails
- Do not present a solution without proving the problem exists.
- Ensure 'Non-Goals' are explicit to prevent scope creep.
- Never omit the rollback or data migration strategy.
`
  },
  {
    id: "proposal-slide-pitch",
    category: "communication",
    title: "Strategic Pitch & Proposal",
    summary: "Construct compelling pitches leveraging Value Proposition Canvas, ROI modeling, and cognitive load reduction.",
    tags: ["Strategy", "Pitch", "Communication"],
    markdown: `# Strategic Pitch & Proposal Skill

Use this skill to build executive proposals, investor pitch decks, product strategy memos, and ROI justifications.

## Core Directives
- **Audience Calibration**: Tailor the narrative vector to the specific stakeholder (e.g., CFO cares about ROI/CapEx; CTO cares about scalability/OpEx).
- **Value Proposition**: Map features to direct business outcomes (revenue generation, cost reduction, risk mitigation).
- **Evidence-Based Anchoring**: Use behavioral economics. Anchor proposals with empirical data, TAM/SAM/SOM analysis, and competitive moats.
- **Cognitive Streamlining**: Apply the Minto Pyramid Principle. Lead with the conclusion, group supporting arguments, and order logically.

## Pitch Architecture
1. **The Hook (The Gap)**: The current painful reality vs. the potential future state.
2. **The Thesis**: One clear, definitive sentence describing the solution.
3. **The Proof**: Financial models, technical validation, or market traction.
4. **The Ask**: The precise decision, budget, or resource allocation required NOW.

## Output Format
- **Elevator Pitch**: 30-second summary.
- **Slide Deck Outline**: Slide-by-slide narrative arc with visual recommendations.
- **Objection Handling Matrix**: Anticipated pushback and data-backed rebuttals.

## Guardrails
- Do not bury the 'Ask' at the end; state the required decision early.
- Avoid text-heavy slides; shift dense information to the appendix.
- Eliminate buzzwords that do not convey precise technical or business meaning.
`
  },
  {
    id: "ai-operating-system",
    category: "strategy",
    title: "AI Operating System & Orchestration",
    summary: "Design multi-agent LLM routing topologies, RAG pipelines, and deterministic fallback mechanisms.",
    tags: ["AI Orchestration", "Agents", "RAG", "LLM"],
    markdown: `# AI Operating System & Orchestration Skill

Use this skill to architect and route tasks across multi-agent systems, balancing model intelligence, latency, and token cost.

## Core Directives
- **Model Routing**: Route complex reasoning tasks to frontier models (Claude 3.5 Sonnet, GPT-4o) and bounded/formatting tasks to smaller, faster models.
- **RAG Architecture**: Design semantic retrieval pipelines utilizing Vector DBs, hybrid search (BM25 + Dense), and context re-ranking.
- **Agentic Workflows**: Define clear action spaces, tool-use permissions (e.g., MCP), and cyclic reasoning loops (ReAct).
- **Context Management**: Implement semantic caching, context window pruning, and rolling memory summarization.

## Orchestration Process
1. **Intent Classification**: Determine if the task requires deterministic logic, retrieval, or generative reasoning.
2. **Pipeline Construction**: Map the sequence of agent interactions (e.g., Planner Agent -> Researcher Agent -> Coder Agent -> Reviewer Agent).
3. **Tool Provisioning**: Equip agents with strictly scoped, read/write isolated tools.
4. **Safety & Fallbacks**: Implement programmatic guardrails, output validation (e.g., JSON Schema), and deterministic fallbacks for hallucination recovery.

## Output Format
- **System Topology**: Diagram of agent roles, LLMs, and tool dependencies.
- **Routing Logic**: Heuristics for task delegation.
- **Prompt Specifications**: Core instructions for each sub-agent.

## Guardrails
- Never grant autonomous execution capabilities (e.g., shell access) without human-in-the-loop (HITL) approval for destructive actions.
- Do not load excessive, irrelevant data into the context window; optimize signal-to-noise.
- Always validate structured output from LLMs before passing it to downstream deterministic systems.
`
  },
  {
    id: "daily-ai-learning-coach",
    category: "learning",
    title: "Continuous AI Learning & Neuroplasticity",
    summary: "Optimize skill acquisition using spaced repetition, deliberate practice, and compounding mental models.",
    tags: ["Learning", "Habits", "Neuroplasticity", "Coaching"],
    markdown: `# Continuous AI Learning & Neuroplasticity Skill

Use this skill to design daily learning loops, master new technical domains, and compound knowledge through structured feedback.

## Core Directives
- **Deliberate Practice**: Focus on the edge of current capabilities. Identify specific micro-skills to drill.
- **Spaced Repetition**: Extract core concepts into flashcards or active recall prompts to combat the Ebbinghaus forgetting curve.
- **Mental Models**: Connect new information to existing architectural or programmatic heuristics (e.g., mapping React hooks to functional closures).
- **Friction Reduction**: Lower the activation energy for learning by establishing rapid, localized prototyping environments.

## Daily Loop Process
1. **Target Identification**: Define one atomic concept or workflow to master today.
2. **Active Exploration**: Use AI to simulate edge cases, generate adversarial examples, or build a minimal reproducible example (MRE).
3. **Feedback Extraction**: Have AI critique the implementation or understanding, highlighting blind spots.
4. **Knowledge Crystallization**: Document the mental model shift or reusable snippet in a personal knowledge graph (e.g., Obsidian/NotebookLM).

## Output Format
- **Daily Focus**: Atomic goal definition.
- **Practice Scenario**: A tailored coding or architectural challenge.
- **Concept Breakdown**: Deconstruction of the topic using analogies.
- **Retention Strategy**: Artifacts to save for long-term memory.

## Guardrails
- Do not consume tutorials passively; always generate code or architecture diagrams.
- Avoid context switching; master one micro-skill before moving to the next.
- Validate AI-generated explanations against official documentation.
`
  },
  {
    id: "notebooklm-source-of-truth",
    category: "learning",
    title: "RAG-Grounded Knowledge Extraction",
    summary: "Extract high-fidelity, citation-backed insights from trusted corpora using dense retrieval and epistemic rigor.",
    tags: ["Knowledge Graph", "RAG", "Citations", "Research"],
    markdown: `# RAG-Grounded Knowledge Extraction Skill

Use this skill when processing dense documents (PRDs, financial reports, research papers) where accuracy and source attribution are paramount.

## Core Directives
- **Strict Grounding**: Force the LLM to rely exclusively on the provided context window. Disable parametric memory fallback.
- **Citation Enforcement**: Require inline citations \`[Doc X, Page Y]\` for every factual claim, metric, or entity relationship.
- **Contradiction Detection**: Explicitly instruct the model to highlight conflicting information within the source documents.
- **Ontology Extraction**: Map out entities, relationships, and taxonomies to build structured knowledge graphs.

## Extraction Process
1. **Document Ingestion**: Parse and chunk source material logically (by paragraph or semantic boundary).
2. **Information Retrieval**: Execute focused queries against the document index.
3. **Synthesis & Attribution**: Generate the summary while maintaining absolute fidelity to the source text.
4. **Gap Analysis**: Identify missing data required to fully answer the prompt.

## Output Format
- **Executive Synthesis**: High-level overview.
- **Annotated Findings**: Detailed claims mapped to explicit citations.
- **Entity Relationship Map**: Key actors, components, and their links.
- **Blind Spots**: What the documents fail to address.

## Guardrails
- Zero tolerance for hallucination; if the data is not in the text, explicitly state "Not provided in the source".
- Do not interpolate external world knowledge.
- Sanitize output for sensitive PII or confidential IP before external sharing.
`
  },
  {
    id: "ai-delivery-factory",
    category: "engineering",
    title: "Autonomous Delivery & CI/CD",
    summary: "Orchestrate end-to-end software delivery pipelines leveraging AST manipulation, shift-left testing, and automated PR generation.",
    tags: ["CI/CD", "Automation", "Delivery", "Testing"],
    markdown: `# Autonomous Delivery & CI/CD Skill

Use this skill to automate feature implementation, manage zero-downtime deployments, and enforce shift-left security and testing.

## Core Directives
- **Pipeline Architecture**: Design robust CI/CD pipelines (GitHub Actions, GitLab CI) with isolated build, test, and deploy stages.
- **Static Analysis & Security**: Integrate SAST, DAST, SCA (Software Composition Analysis), and secret scanning directly into the pre-commit or CI hooks.
- **Automated Verification**: Enforce high coverage thresholds. Utilize AI to generate boundary-condition unit tests and property-based tests.
- **Deployment Strategy**: Implement Blue/Green, Canary, or Shadow deployments to minimize blast radius.

## Delivery Process
1. **Spec to Code**: Translate PRDs into atomic, testable functions using LLM codegen.
2. **Local Verification**: Run linters, formatters, and local test suites.
3. **PR Automation**: Generate semantic commits and comprehensive PR descriptions outlining the 'Why' and 'How'.
4. **Deployment & Validation**: Trigger CI/CD, monitor post-deployment metrics, and execute automated rollbacks if SLIs degrade.

## Output Format
- **CI/CD Configuration**: YAML pipeline definitions.
- **Test Strategy**: Generated test suites for the implementation.
- **PR Template**: Structured pull request body.
- **Rollback Runbook**: Automated scripts to revert state.

## Guardrails
- Never bypass branch protection rules or mandatory peer reviews for production deployments.
- Ensure all automated code generation is covered by deterministic unit tests.
- Treat infrastructure as code (IaC); do not make manual changes to deployment environments.
`
  },
  {
    id: "claude-deep-review",
    category: "engineering",
    title: "Adversarial Semantic Review",
    summary: "Perform deep, adversarial red-teaming on architectures, PRs, and strategic documents to expose hidden vulnerabilities.",
    tags: ["Review", "Adversarial", "Red Teaming", "Critique"],
    markdown: `# Adversarial Semantic Review Skill

Use this skill to simulate a Staff+ Engineer or Security Auditor performing a ruthless, rigorous critique of a system or document.

## Core Directives
- **Adversarial Mindset**: Actively seek to break the proposed system. Identify race conditions, algorithmic complexities, and security vectors.
- **Assumption Invalidation**: Expose implicit assumptions (e.g., "the network is reliable", "users will input valid data").
- **Blast Radius Analysis**: Map out the cascading effects of a subsystem failure.
- **Semantic Clarity**: Critique documentation and messaging for ambiguity, logical fallacies, and cognitive friction.

## Review Process
1. **Deconstruction**: Break the proposal down into atomic components and data flows.
2. **Stress Testing**: Apply edge-case inputs, high-concurrency loads, and malicious payload scenarios.
3. **Trade-off Evaluation**: Challenge the chosen architecture against viable alternatives regarding CapEx, OpEx, and DX (Developer Experience).
4. **Constructive Reframing**: Provide actionable, specific solutions to mitigate the discovered vulnerabilities.

## Output Format
- **Critical Vulnerabilities**: High-risk flaws (Must Fix).
- **Architectural Fragility**: Areas of high technical debt or coupling.
- **Implicit Assumptions**: Unvalidated beliefs underpinning the design.
- **Mitigation Roadmap**: Concrete architectural or code changes required.

## Guardrails
- Maintain a highly objective, dispassionate tone. Focus purely on technical merit.
- Do not provide superficial fixes; address the root cause in the architecture.
- Demand empirical evidence (benchmarks, math, security models) for bold claims.
`
  },
  {
    id: "career-ai-strategy",
    category: "strategy",
    title: "Capability Compounding & Leverage",
    summary: "Optimize career trajectory by building T-shaped skills, architectural equity, and high-leverage automation assets.",
    tags: ["Career", "Leverage", "Strategy", "Growth"],
    markdown: `# Capability Compounding & Leverage Skill

Use this skill to map out long-term professional development, build a Staff-level portfolio, and maximize impact-to-effort ratios.

## Core Directives
- **Asymmetric Leverage**: Focus on tasks that have a 10x ROI (e.g., building internal developer tools, fixing systemic CI/CD bottlenecks).
- **Architectural Equity**: Build a portfolio of ADRs, system designs, and postmortems that demonstrate cross-functional leadership.
- **Skill Stacking**: Combine distinct capabilities (e.g., Systems Engineering + AI Orchestration + Product Sense) to create a unique value proposition.
- **Visibility & Documentation**: Open-source internal knowledge. Write authoritative engineering blog posts and technical standards.

## Strategy Process
1. **Current State Analysis**: Audit current capabilities against the target role (Staff Engineer, Tech Lead, Founder).
2. **Gap Identification**: Map the technical, communicative, and strategic deficiencies.
3. **High-Leverage Interventions**: Define 3 projects that bridge the gap while delivering massive business value.
4. **Execution & Metric Tracking**: Establish KPIs for career progression (e.g., PRs merged, systems migrated, devs onboarded).

## Output Format
- **Capability Matrix**: Current vs. Target skills.
- **Leverage Roadmap**: 90-day execution plan for high-impact projects.
- **Portfolio Blueprint**: List of artifacts to generate and publish.
- **Mentorship Strategy**: Plan for managing up and lifting junior engineers.

## Guardrails
- Optimize for real business impact, not just resume-driven development.
- Avoid hoarding knowledge; true leverage comes from elevating the entire engineering org.
- Ensure technical depth is not sacrificed for breadth.
`
  },
  {
    id: "engineering-decision-map",
    category: "engineering",
    title: "Systemic Decision Topography",
    summary: "Navigate complex technical trade-offs using decision matrices, Conway's Law, and operational readiness frameworks.",
    tags: ["Decision Matrix", "Trade-offs", "Systems Thinking"],
    markdown: `# Systemic Decision Topography Skill

Use this skill to align business requirements with architectural patterns, data models, and operational realities.

## Core Directives
- **Holistic Mapping**: Traverse the stack from Business Intent -> Domain Logic -> API Contract -> Data Persistence -> Infrastructure -> Operations.
- **Trade-off Quantification**: Use weighted decision matrices to evaluate speed, consistency, availability, cost, and maintainability.
- **Conway's Law Alignment**: Ensure the software architecture mirrors the organizational communication structures to reduce friction.
- **Operational Expenditure (OpEx)**: Evaluate the long-term cost of maintaining the system (monitoring, on-call, upgrades) vs. the initial CapEx.

## Decision Process
1. **Requirement Extraction**: Distill the core business invariant that must hold true.
2. **Pattern Matching**: Evaluate standard architectural patterns (CQRS, Event Sourcing, CRUD, Strangler Fig) against the invariants.
3. **Failure Mode Effects Analysis (FMEA)**: Predict how the system will fail and design the graceful degradation path.
4. **Two-Way Door Analysis**: Determine if the decision is easily reversible. If yes, optimize for speed; if no, optimize for correctness.

## Output Format
- **Decision Matrix**: Evaluation of options against weighted criteria.
- **Chosen Architecture**: The selected path and its justification.
- **Accepted Tech Debt**: Explicit documentation of corners cut for speed.
- **Operational Runbook outline**: How to manage the system in production.

## Guardrails
- Avoid "Resume-Driven Development"; choose boring technology unless the problem demands a novel solution.
- Never finalize a design without defining the observability and rollback strategy.
- Explicitly state the limits of the system (e.g., "This design breaks at 10k TPS").
`
  },
  {
    id: "staff-engineer-ai-review-pack",
    category: "engineering",
    title: "Staff-Level Architectural Audit",
    summary: "Deploy multi-persona AI agents to audit cross-functional impact, API backward compatibility, and blast radius containment.",
    tags: ["Audit", "Staff Engineer", "Architecture", "Review"],
    markdown: `# Staff-Level Architectural Audit Skill

Use this skill to rigorously audit major architectural changes, multi-system integrations, and critical production deployments.

## Core Directives
- **Multi-Persona Simulation**: Evaluate the proposal from the perspective of an SRE, a Security Engineer, a Product Manager, and a DBA.
- **Blast Radius Containment**: Ensure failure domains are strictly isolated. Validate that a failure in one service does not cascade (Circuit Breakers).
- **Contract & Compatibility**: Enforce strict backward compatibility for APIs and database schemas. Validate API versioning strategies.
- **Architectural Drift Prevention**: Ensure the new implementation adheres to the established target architecture and doesn't introduce entropy.

## Audit Process
1. **SRE Review**: Analyze SLIs/SLOs, alerting thresholds, capacity planning, and deployment strategies (Blue/Green).
2. **Security Review**: Audit IAM roles, network boundaries, data encryption, and compliance requirements.
3. **DBA Review**: Evaluate query execution plans, index utilization, locking strategies, and data migration safety.
4. **Product Review**: Validate that the technical complexity is justified by the user value and matches the Go-To-Market timeline.

## Output Format
- **Cross-Functional Risk Matrix**: Heatmap of risks across domains.
- **Production Readiness Score**: Go/No-Go recommendation.
- **Hard Blockers**: Must-resolve architectural flaws.
- **Evolutionary Roadmap**: How to transition from current state to the proposed state safely.

## Guardrails
- Do not approve "Big Bang" rewrites without a Strangler Fig migration plan.
- Ensure all reviews demand quantifiable metrics (e.g., "What is the P99 latency target?").
- Prioritize system reliability and data integrity above all else.
`
  },
  {
    id: "data-resilience-observability-review",
    category: "engineering",
    title: "Distributed Resilience & Telemetry",
    summary: "Engineer robust systems using CAP theorem principles, distributed tracing, and fault-tolerant replication strategies.",
    tags: ["Resilience", "Observability", "Data", "SRE"],
    markdown: `# Distributed Resilience & Telemetry Skill

Use this skill when designing databases, caching layers, message queues, and high-availability production environments.

## Core Directives
- **Data Integrity & Consistency**: Navigate the CAP theorem. Define Eventual vs. Strong consistency requirements. Handle split-brain scenarios and replication lag.
- **Fault Tolerance**: Design for Byzantine and Crash-Stop failures. Implement automated failovers, leader election, and idempotent retries.
- **Deep Observability**: Implement the Three Pillars (Metrics, Logs, Traces). Use OpenTelemetry for distributed request tracing. Follow RED (Rate, Errors, Duration) and USE (Utilization, Saturation, Errors) methodologies.
- **State Management**: Design cache invalidation (e.g., write-through, cache-aside), connection pooling, and connection lifetime management.

## Review Process
1. **Schema & Index Analysis**: Validate Normalization (3NF) vs. Denormalization trade-offs. Analyze index cardinalities.
2. **Network Partition Simulation**: Trace system behavior when inter-service communication drops or introduces high latency.
3. **Telemetry Audit**: Ensure every state mutation emits an actionable metric or trace span.
4. **Disaster Recovery (DR)**: Review RPO (Recovery Point Objective) and RTO (Recovery Time Objective) capabilities.

## Output Format
- **Consistency Model**: Explicit documentation of data state across nodes.
- **Resilience Mechanisms**: Detailed fallback and retry logic configurations.
- **Telemetry Specifications**: Required dashboard panels and alert thresholds.
- **Load Testing Plan**: Strategies to find the system's breaking point.

## Guardrails
- Never assume the network is reliable.
- Do not log PII or sensitive credentials.
- Ensure alerts are actionable; eliminate alert fatigue by avoiding "informational" paging.
`
  }
];

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

export const defaultStudioNoteId = "ai-operating-system";
