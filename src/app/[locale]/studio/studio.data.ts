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
  category: "engineering" | "content" | "operations" | "communication";
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

export const studioCapturedAt = "2026-06-20";

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
        noteIds: ["antigravity-awesome-skills", "open-design"]
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

export const defaultStudioNoteId = "antigravity-awesome-skills";
