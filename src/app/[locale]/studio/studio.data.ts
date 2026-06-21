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
    title: "Review code",
    summary: "Review a change for correctness, maintainability, tests, security, and user impact.",
    tags: ["Code review", "Risk", "Testing"],
    markdown: `# Code Review Skill

Use this skill when reviewing a pull request, local diff, or generated code change.

## Inputs I need
- Goal of the change.
- Files or diff to review.
- Product surface affected.
- Known constraints, rollout plan, and tests already run.

## Review process
1. Start with blocking issues: correctness, data loss, security, privacy, broken build, or broken user flow.
2. Check behavior against the stated goal. Do not review only style.
3. Verify error states, loading states, empty states, mobile behavior, and accessibility when UI is touched.
4. Check tests: what is covered, what is missing, and what would fail if the bug returns.
5. Look for unnecessary scope, hidden coupling, duplicated logic, and migration risk.
6. Keep comments specific. Point to file/line and explain the consequence.

## Output format
- Findings first, ordered by severity.
- Open questions or assumptions.
- Suggested fixes.
- Verification gaps.

## Guardrails
- Do not praise before listing issues.
- Do not request unrelated refactors.
- Do not block on preference if behavior is correct.
- If there are no issues, say that clearly and name residual risk.`
  },
  {
    id: "frontend-architecture",
    category: "engineering",
    title: "Frontend architecture",
    summary: "Plan a frontend feature around routes, state, components, responsiveness, and tracking.",
    tags: ["Frontend", "Architecture", "UI"],
    markdown: `# Frontend Architecture Skill

Use this skill before building or refactoring a frontend feature.

## Inputs I need
- User workflow and target route.
- Existing component patterns and design system constraints.
- Data shape, loading/error states, and permissions.
- Analytics events that must be preserved or added.

## Architecture process
1. Identify the route/page boundary and the smallest component ownership model.
2. Separate server data, client state, visual components, and interaction handlers.
3. Define states: loading, empty, partial data, error, disabled, mobile, desktop.
4. Keep layout stable with responsive constraints, not viewport-scaled font hacks.
5. Reuse existing tokens, components, icons, and motion patterns.
6. Add analytics for new navigation, filters, forms, CTAs, preferences, and outbound links.
7. Add tests at the risk boundary: route contract, interaction behavior, schema, or rendering.

## Output format
- Proposed component tree.
- State model.
- Event tracking list.
- Edge cases.
- Implementation order.

## Guardrails
- Do not create a landing page when the task is an app/tool surface.
- Do not use nested cards or decorative gradients unless the existing system requires them.
- Keep mobile behavior first-class.`
  },
  {
    id: "backend-architecture",
    category: "engineering",
    title: "Backend architecture",
    summary: "Shape backend work around contracts, data ownership, reliability, security, and rollout.",
    tags: ["Backend", "API", "Data"],
    markdown: `# Backend Architecture Skill

Use this skill when designing an API, service, job, integration, or data workflow.

## Inputs I need
- Business goal and domain objects.
- Existing API contracts, database tables, queues, jobs, and auth model.
- Expected traffic, latency, consistency, and failure tolerance.
- Migration and rollback constraints.

## Architecture process
1. Define the boundary: what this service owns and what it only reads.
2. Write the API or job contract before implementation details.
3. Identify validation, authorization, idempotency, rate limits, and audit needs.
4. Map data changes: schema migration, backfill, indexes, retention, and privacy.
5. Design failure behavior: retries, timeouts, dead-letter path, fallback, and alerting.
6. Define observability: logs, metrics, traces, PostHog/business events if user behavior changes.
7. Plan rollout: feature flag, canary, dark launch, migration window, rollback.

## Output format
- Boundary and responsibilities.
- Contract.
- Data model changes.
- Failure modes.
- Rollout and verification plan.

## Guardrails
- Do not hide unclear ownership behind a generic utility.
- Do not introduce async workflows without retry and observability decisions.
- Do not claim production readiness without rollback.`
  },
  {
    id: "blog-content-writer",
    category: "content",
    title: "Blog content writer",
    summary: "Write calm technical or reflective content in the profile voice.",
    tags: ["Blog", "Copywriting", "Content"],
    markdown: `# Blog Content Writer Skill

Use this skill for profile posts, blog articles, notes, technical explainers, and copywriting.

## Voice
- Calm, practical, sincere, and grounded.
- Explain like the reader is new, but keep the reasoning solid.
- Avoid hype, dunking, sales language, and motivational theater.

## Writing process
1. Open with a concrete work or life scene.
2. Connect the scene to the deeper lesson.
3. Use examples, workflows, tools, or trade-offs instead of abstract claims.
4. Make the structure easy to scan when the format allows sections.
5. End with a useful reflection or a question that invites perspective.

## Output format
- Strong title options.
- Short hook.
- Full draft.
- Optional LinkedIn/Facebook version.
- Suggested follow-up article idea.

## Guardrails
- Do not invent sources.
- Do not overuse buzzwords.
- Do not write like a course landing page.
- Preserve SEO, locale, and existing content schema when editing source.`
  },
  {
    id: "prompt-writing",
    category: "content",
    title: "Prompt writing",
    summary: "Turn vague requests into structured prompts that produce repeatable output.",
    tags: ["Prompt", "AI workflow", "Quality"],
    markdown: `# Prompt Writing Skill

Use this skill to turn a vague request into a reusable prompt for an AI assistant or agent.

## Prompt structure
1. Role: what perspective the assistant should take.
2. Goal: what outcome is needed.
3. Context: files, product, audience, constraints, examples.
4. Process: steps the assistant should follow.
5. Output: exact format, length, tone, and acceptance criteria.
6. Guardrails: what to avoid, what to verify, when to ask questions.

## Quality checklist
- The prompt gives enough context without hiding the actual task.
- It defines success and failure.
- It asks for evidence when accuracy matters.
- It limits style drift and unnecessary verbosity.
- It includes examples only when examples improve the output.

## Output format
- Final prompt.
- Why this structure works.
- Optional shorter version for chat tools.

## Guardrails
- Do not make the prompt longer than the task needs.
- Do not ask AI to guess missing facts when the cost of being wrong is high.
- Do not optimize only for a polished answer; optimize for useful work.`
  },
  {
    id: "status-report",
    category: "operations",
    title: "Daily, weekly, monthly report",
    summary: "Generate concise status reports with progress, risk, blockers, and next actions.",
    tags: ["Report", "Daily", "Weekly"],
    markdown: `# Status Report Skill

Use this skill for daily, weekly, or monthly engineering/product updates.

## Inputs I need
- Reporting period.
- Completed work.
- Work in progress.
- Blockers, risks, decisions needed.
- Metrics, incidents, release notes, or customer impact.

## Report process
1. Separate facts from interpretation.
2. State impact before activity.
3. Name risks early and attach an owner or next action.
4. Keep detail proportional to audience.
5. Include what changed since the last report.

## Output format
- Executive summary.
- Shipped / completed.
- In progress.
- Risks and blockers.
- Next plan.
- Decisions needed.

## Cadence rules
- Daily: short, action-oriented, focused on blockers.
- Weekly: progress, risk, scope, and upcoming work.
- Monthly: outcomes, metrics, lessons, and strategic adjustments.`
  },
  {
    id: "doc-spec-tech-spec",
    category: "engineering",
    title: "Doc, spec, tech spec",
    summary: "Write specs that align product intent, technical plan, risks, and verification.",
    tags: ["Spec", "Tech spec", "Documentation"],
    markdown: `# Doc / Spec / Tech Spec Skill

Use this skill to write a product spec, technical spec, RFC, or implementation plan.

## Inputs I need
- Problem statement and user impact.
- Current behavior and desired behavior.
- Constraints, dependencies, and owners.
- Relevant files, APIs, data models, and rollout concerns.

## Spec structure
1. Context and problem.
2. Goals and non-goals.
3. User flow or system flow.
4. Proposed solution.
5. Data/API/component changes.
6. Alternatives considered.
7. Risks, security, privacy, accessibility, and observability.
8. Rollout, migration, rollback.
9. Test and acceptance criteria.

## Output format
- Decision-ready spec.
- Open questions.
- Implementation checklist.
- Review checklist.

## Guardrails
- Do not hide unknowns.
- Do not turn assumptions into requirements.
- Do not skip rollback or verification for production changes.`
  },
  {
    id: "proposal-slide-pitch",
    category: "communication",
    title: "Proposal, slide, pitch deck",
    summary: "Frame a proposal or deck around audience, problem, option value, proof, and next decision.",
    tags: ["Proposal", "Slide", "Pitch"],
    markdown: `# Proposal / Slide / Pitch Deck Skill

Use this skill for proposals, internal buy-in, product pitches, and slide outlines.

## Inputs I need
- Audience and decision they need to make.
- Problem, cost of inaction, and desired outcome.
- Proposed solution, alternatives, timeline, and resources.
- Proof: data, examples, customer signal, technical feasibility.

## Deck process
1. Start with the audience's problem, not our feature.
2. Show why now matters.
3. Explain the solution in one clear sentence.
4. Prove feasibility with evidence.
5. Name risks honestly.
6. End with the specific decision or next step.

## Output format
- One-line narrative.
- Slide-by-slide outline.
- Speaker notes.
- Risk and objection handling.
- Follow-up email draft.

## Guardrails
- Do not overclaim.
- Do not use generic startup language.
- Do not make slides dense; each slide should carry one job.`
  },
  {
    id: "ai-operating-system",
    category: "strategy",
    title: "AI operating system",
    summary: "Route work through NotebookLM, GPT, Claude, Codex, and Antigravity without creating AI noise.",
    tags: ["AI OS", "Tool routing", "Compounding"],
    markdown: `# AI Operating System Skill

Use this skill when a problem feels broad and I need to decide which AI tool should do which part.

## Operating model
- NotebookLM keeps source-backed truth: uploaded docs, notes, PDFs, transcripts, reports, reviews, and decisions.
- GPT / ChatGPT acts as chief of staff: clarify goals, plan, research, compare trade-offs, and create action plans.
- Claude acts as deep critic: architecture review, writing polish, hidden assumptions, edge cases, and sensitive communication.
- Codex acts as delivery factory: repo changes, tests, refactors, migrations, and PR-ready diffs.
- Antigravity acts as agentic lab: prototype, UI verification, browser checks, multi-agent dev flows, and end-to-end artifacts.

## Process
1. Capture facts and source material first.
2. Clarify the real problem and the desired outcome.
3. Route the work to the smallest useful tool chain.
4. Let one AI execute and another AI review when risk is meaningful.
5. Archive the decision, prompt, result, and lesson learned.

## Output format
- Problem statement.
- Best tool sequence.
- Prompt for each tool.
- Risks and guardrails.
- Next action for today.

## Guardrails
- Do not ask every tool the same vague question.
- Do not upload secrets, private keys, customer data, or sensitive company data into personal AI tools.
- Do not let AI make final medical, legal, financial, or production-risk decisions without human review.`
  },
  {
    id: "daily-ai-learning-coach",
    category: "learning",
    title: "Daily AI learning coach",
    summary: "Turn every day into a small loop for learning AI, shipping better, and saving reusable prompts.",
    tags: ["Daily learning", "Habit", "AI literacy"],
    markdown: `# Daily AI Learning Coach Skill

Use this skill at the start or end of a day to compound AI skill without turning learning into a separate heavy project.

## Morning prompt
Today is [date].
Context:
- Energy:
- Work obligations:
- Open loops:
- One AI skill I want to improve:

Help me choose:
1. Top 3 outcomes for today.
2. One AI-assisted workflow to practice.
3. One thing to avoid or delay.
4. One small artifact to save: prompt, checklist, decision, lesson, or example.
5. A realistic time block plan.

## Evening prompt
Review today:
- Done:
- Not done:
- AI tool used:
- What worked:
- What was noisy:
- Lesson:

Extract:
1. One reusable prompt improvement.
2. One workflow improvement.
3. One thing to archive in NotebookLM or a Project.
4. One next practice for tomorrow.

## Guardrails
- Keep the loop under 15 minutes.
- Prefer one practical experiment over five abstract AI tips.
- End with one saved artifact, not only a feeling of productivity.`
  },
  {
    id: "notebooklm-source-of-truth",
    category: "learning",
    title: "NotebookLM source of truth",
    summary: "Use NotebookLM as a source-backed knowledge base for learning, career, finance, and work memory.",
    tags: ["NotebookLM", "Knowledge base", "Citations"],
    markdown: `# NotebookLM Source Of Truth Skill

Use this skill when the answer should be grounded in uploaded material instead of general memory.

## Best source types
- Books, papers, courses, docs, and transcript notes.
- RFCs, PRDs, postmortems, decision logs, and architecture notes.
- CV versions, performance reviews, job descriptions, feedback, and promotion material.
- Redacted financial statements, policies, investment notes, and planning documents.

## Prompt
Based only on the uploaded sources, create:
1. A timeline of important ideas or events.
2. Source-backed claims with citations.
3. Contradictions or missing data.
4. Ten questions I should answer next.
5. A 30-day action plan.

## Learning output
- Mind map.
- Study guide.
- Flashcards.
- Quiz questions.
- Practice projects.
- Misconceptions to watch.

## Guardrails
- Redact sensitive data before upload.
- Use citations for important claims.
- Treat NotebookLM as grounded memory, not as a final expert for medical, legal, or financial decisions.`
  },
  {
    id: "ai-delivery-factory",
    category: "engineering",
    title: "AI delivery factory",
    summary: "Split engineering work across GPT, Claude, Codex, and Antigravity from spec to verified PR.",
    tags: ["Codex", "Antigravity", "Delivery"],
    markdown: `# AI Delivery Factory Skill

Use this skill for feature work, refactors, migrations, bugfixes, and UI-heavy prototypes.

## Tool sequence
1. GPT: turn the idea into PRD, acceptance criteria, task slices, rollout, and test plan.
2. Claude: review architecture, hidden assumptions, migration risk, and edge cases.
3. Codex: implement bounded repo tasks, add tests, keep diff reviewable.
4. Antigravity: run app, verify UI/browser flows, capture screenshots/logs/artifacts.
5. Claude or GPT: review the final diff, risks, release note, and stakeholder update.
6. NotebookLM: archive PRD, RFC, decision, postmortem, and lessons learned.

## Codex prompt skeleton
Repo context:
- Stack:
- Branch:
- Relevant modules:
- Constraints:

Goal:
Implement [feature/fix/refactor].

Acceptance criteria:
1.
2.
3.

Rules:
- Do not change public API unless necessary.
- Add or adjust tests.
- Run relevant verification commands.
- Explain trade-offs.
- Keep the diff suitable for PR review.

## Guardrails
- Split large work into map, plan, execute, verify, and review.
- Do not let one agent both implement and be the only reviewer for risky changes.
- Do not skip tests because an agent says the code looks correct.`
  },
  {
    id: "claude-deep-review",
    category: "engineering",
    title: "Claude deep review",
    summary: "Use Claude as the slow-thinking reviewer for architecture, writing, PRs, and sensitive communication.",
    tags: ["Claude", "Architecture", "Critique"],
    markdown: `# Claude Deep Review Skill

Use this skill when I need careful critique more than fast execution.

## Architecture review prompt
Act as a Staff+ engineer reviewing this design.

Context:
[paste RFC/spec/diff summary]

Review for:
1. Correctness
2. Scalability
3. Operability
4. Security and privacy
5. Migration risk
6. Team maintainability
7. Hidden assumptions

Output:
- Top 5 risks.
- What should change before implementation.
- Questions to ask stakeholders.
- Minimum viable version.
- Long-term version.
- Suggested tests or rollout guardrails.

## Communication prompt
Help me write this message with clarity and care.
Separate facts, assumptions, emotions, and the decision needed.
Make it direct, calm, and hard to misunderstand.

## Guardrails
- Ask Claude to challenge assumptions, not only improve wording.
- Keep final decisions with the human owner.
- Use Codex or local tools for repo execution after the review is clear.`
  },
  {
    id: "career-ai-strategy",
    category: "strategy",
    title: "Career AI strategy",
    summary: "Use AI to build Staff-level evidence, public writing, architecture portfolio, and automation assets.",
    tags: ["Career", "Staff Engineer", "Portfolio"],
    markdown: `# Career AI Strategy Skill

Use this skill during weekly or monthly career planning.

## Career thesis
Build toward AI-native Staff Engineer / Tech Lead, with options toward AI platform leadership, consulting, or founder work.

## Four assets to compound
1. AI Engineering Playbook: how a team safely uses Codex, Claude, Antigravity, GPT, and NotebookLM.
2. Architecture Portfolio: RFCs, diagrams, migration notes, incident reviews, and trade-off memos.
3. Public Writing: calm posts about AI-native software engineering and leadership.
4. Automation Products: internal tools, agent workflows, and developer productivity demos.

## Prompt
I am a Lead Software Engineer.
Create a 3-year career strategy with these scenarios:
1. Staff / Principal Engineer
2. Engineering Manager / Director
3. Founder / Independent consultant

For each scenario, define:
- Required skills.
- Portfolio evidence.
- Network strategy.
- Compensation upside.
- Risks.
- 90-day actions.
- 1-year milestones.
- How AI tools should be used weekly.

## Guardrails
- Focus on evidence, not title-chasing.
- Convert learning into visible artifacts.
- Keep the plan flexible enough to preserve optionality.`
  },
  {
    id: "engineering-decision-map",
    category: "engineering",
    title: "Engineering decision map",
    summary: "Analyze a feature from business need through domain, contract, data, architecture, implementation, rollout, and operation.",
    tags: ["Architecture", "Trade-off", "Production"],
    markdown: `# Engineering Decision Map Skill

Use this skill when a requirement arrives and I need to lead the technical direction before asking AI to code.

## Seven-layer map
1. Business need: user, outcome, priority, success metric, deadline.
2. Domain / use case: entities, aggregate boundary, state transitions, invariants.
3. API / contract / workflow: sync or async, idempotency, versioning, backward compatibility.
4. Data model / consistency: schema, transaction boundary, index, migration, consistency model.
5. Architecture / patterns: modular monolith, microservice, event-driven, CQRS, Event Sourcing, cache, resilience.
6. Implementation / testing: PR slices, unit, integration, contract, E2E, load, migration, rollback tests.
7. Rollout / observability / operation: feature flag, canary, dashboard, alert, runbook, rollback owner.

## Prompt
Act as a Staff Software Engineer.
Given this requirement, analyze it through the seven-layer map.
For each layer, list:
- Key questions.
- Risks.
- Options.
- Trade-offs.
- What AI can implement.
- What a human must decide.

End with:
- Recommended architecture direction.
- Small PR sequence.
- Verification plan.
- Rollout and rollback plan.

## Guardrails
- Do not jump from requirement to code.
- Do not hide data consistency or migration risk.
- Do not recommend Event Sourcing, CQRS, microservices, or cache unless the problem justifies the cost.`
  },
  {
    id: "staff-engineer-ai-review-pack",
    category: "engineering",
    title: "Staff engineer AI review pack",
    summary: "Use AI as requirement analyst, architect, adversarial reviewer, test strategist, and production readiness reviewer.",
    tags: ["Staff reflex", "Review", "AI workflow"],
    markdown: `# Staff Engineer AI Review Pack Skill

Use this skill to make AI review a requirement, design, PR, or rollout plan from multiple senior engineering angles.

## 1. Requirement analyst
Read this requirement and identify ambiguity, hidden assumptions, edge cases, missing acceptance criteria, and stakeholder questions.
Group questions by business, product, data, API, security, reliability, rollout, and observability.

## 2. Architect
Propose 3 architecture options.
Compare scalability, complexity, operational burden, consistency, cost, security, migration effort, rollback strategy, and long-term maintainability.

## 3. Adversarial reviewer
Challenge this design.
Find race conditions, data consistency bugs, security risks, performance bottlenecks, hidden coupling, and production failure scenarios.

## 4. Test strategist
Generate a test matrix:
- Unit
- Integration
- Contract
- E2E
- Load
- Security
- Migration
- Rollback
- Chaos or dependency failure

## 5. Production readiness reviewer
Review this feature for production readiness.
Include observability, alerting, runbook, rollout, rollback, SLO impact, incident response, and customer impact checks.

## Guardrails
- Give AI the context, constraints, and quality bar.
- Ask for critique before implementation.
- Keep final architecture and production decisions with the human owner.`
  },
  {
    id: "data-resilience-observability-review",
    category: "engineering",
    title: "Data, resilience, observability review",
    summary: "Review a design for database correctness, indexing, consistency, dependency failure, cache behavior, and production signals.",
    tags: ["Data", "Resilience", "Observability"],
    markdown: `# Data, Resilience, Observability Review Skill

Use this skill when a feature touches database design, external dependencies, cache, events, or production traffic.

## Database review
- Does the schema match the domain?
- Are transaction boundaries clear?
- What isolation level assumptions exist?
- Does the query need a B-tree, composite, partial, expression, GIN, GiST, SP-GiST, or BRIN index?
- Does EXPLAIN ANALYZE confirm the plan?
- Can migration run online without dangerous locks?
- Is backup/restore or rollback tested?

## Consistency review
- Is strong consistency required or is eventual consistency acceptable?
- Is there a read-after-write issue?
- Are duplicate events/messages possible?
- Is idempotency required?
- Is Saga, Outbox, Inbox, CDC, CQRS, or Event Sourcing justified?

## Resilience review
- Is there a timeout?
- Is retry bounded with backoff and jitter?
- Is the operation idempotent?
- Is there a Circuit Breaker, Bulkhead, rate limit, fallback, or load shedding path?
- What happens when the dependency is slow, down, or returns partial failure?

## Observability review
- Business metric.
- Technical metric.
- Logs without PII.
- Trace with correlation ID.
- Dashboard before rollout.
- Alert based on user impact.
- Runbook and rollback owner.

## Output format
- Blockers.
- Design risks.
- Suggested tests.
- Monitoring plan.
- Rollout guardrails.`
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
        noteIds: ["ai-operating-system", "ai-driven-engineering-foundation"]
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
