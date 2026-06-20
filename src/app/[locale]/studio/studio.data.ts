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

export const studioCapturedAt = "2026-06-20";

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
