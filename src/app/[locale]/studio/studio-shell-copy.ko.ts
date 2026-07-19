import type { StudioUiCopy } from "./studio-shell-copy";

export const koreanStudioCopy: StudioUiCopy = {
  brand: "Studio",
  navLabel: "개인 Studio",
  navItems: {
    welcome: "Welcome",
    "ai-agent-setup": "AI 설정",
    "ai-skills": "AI 스킬",
    "delivery-checklists": "체크리스트",
    "flow-menu": "Flow Menu",
    "flow-system-design": "System Design",
    "flow-architecture-decision": "Architecture Decision",
    "flow-incident-response": "Incident Response",
    "flow-release-readiness": "Release Readiness",
    "flow-ai-delivery": "AI Delivery",
    "flow-portfolio-story": "Portfolio Story",
    "flow-react-flow-architecture-demo": "Flow examples",
    "flow-react-flow-system-blueprint": "System blueprint"
  },
  profileItems: {
    home: {
      label: "Home",
      detail: "Profile overview."
    },
    about: {
      label: "About",
      detail: "Experience and background."
    },
    gallery: {
      label: "Gallery",
      detail: "Selected visual records."
    },
    blog: {
      label: "Blog",
      detail: "Long-form writing."
    },
    notes: {
      label: "Notes",
      detail: "Shorter working notes."
    },
    apps: {
      label: "Apps",
      detail: "Small tools and experiments."
    },
    resume: {
      label: "Resume",
      detail: "Open the CV PDF."
    }
  },
  profileMenuTitle: "Profile menu",
  profileNavigationTitle: "프로필 탐색",
  profileNavigationDetail: "Studio에서 공개 프로필 섹션으로 이동합니다.",
  openProfileHome: "프로필 홈 열기",
  findSetupNote: "설정 노트 찾기",
  search: "검색",
  searchPlaceholder: "AI 설정 검색...",
  commandPaletteLabel: "Search Studio pages",
  closeSearch: "Close search",
  openStudio: "Open Studio",
  closeNavigation: "Close navigation",
  toggleNavigation: "Toggle navigation",
  openPreferences: "Open Studio preferences",
  openGithubProfile: "Open GitHub profile",
  openAccountMenu: "Open account menu",
  routeKicker: {
    legacy: "Legacy",
    studio: "Studio"
  },
  routeMetricsLabel: "Page summary",
  runtime: {
    loading: "Studio 워크스페이스를 불러오는 중…",
    loadErrorTitle: "워크스페이스를 사용할 수 없습니다",
    loadErrorDetail:
      "이 워크스페이스를 불러오지 못했습니다. 탐색과 환경설정은 계속 사용할 수 있습니다.",
    reload: "Studio 새로고침"
  },
  dashboard: {
    workstreamCount: (count) => `${count}개 워크스트림`,
    emptyTitle: "일치하는 워크스트림이 없습니다",
    emptyDescription:
      "검색어 또는 상태 필터를 조정하여 워크스트림을 확인하세요.",
    clearFilters: "필터 지우기"
  },
  status: {
    ready: "준비됨",
    draft: "초안",
    next: "다음"
  },
  categories: {
    all: "전체",
    engineering: "엔지니어링",
    content: "콘텐츠",
    operations: "운영",
    communication: "커뮤니케이션",
    strategy: "전략",
    learning: "학습"
  },
  routes: {
    welcome: {
      title: "Welcome",
      description:
        "A practical index of my setup notes, reusable workflows, delivery checklists, and visual system maps.",
      panels: ["Choose a workspace", "Useful links", "Studio pages"],
      timeline: [
        "Choose the right workspace",
        "Keep the source material close",
        "Finish with something concrete"
      ]
    },
    "ai-agent-setup": {
      title: "AI Agent 설정",
      description:
        "AI agent 도구, MCP 경로, 안전한 머신 부트스트랩을 위한 개인 설정 노트.",
      panels: ["Setup library", "Agent workflow", "Command runbook"],
      timeline: [
        "Skill library reviewed",
        "MCP install path captured",
        "Credential guardrail checked"
      ]
    },
    "ai-skills": {
      title: "AI 스킬",
      description:
        "코드 리뷰, 아키텍처, 콘텐츠, 프롬프트, 보고서, 스펙, 제안서에 재사용할 수 있는 markdown 스킬.",
      panels: ["Skill taxonomy", "Markdown preview", "Copy-ready prompt"],
      timeline: [
        "Installed skills inventoried",
        "Capability gaps mapped",
        "English and Vietnamese prompts prepared"
      ]
    },
    "delivery-checklists": {
      title: "딜리버리 체크리스트",
      description:
        "작업 접수부터 모듈 작업, 릴리스 준비, 롤아웃까지의 운영 체크리스트.",
      panels: ["Task intake", "Module creation", "Release and rollout"],
      timeline: [
        "Ticket intake path mapped",
        "Module checklist nested",
        "Rollout phases captured"
      ]
    }
  },
  welcome: {
    eyebrow: "Personal workbench",
    lead: "I keep the practical parts of my engineering work here: setup notes, reusable AI instructions, delivery checklists, and visual system maps.",
    note: "Choose the page that matches the job, check the source material, and finish with a useful decision, checklist, diagram, or verified change.",
    studioLinks: "Studio shortcuts",
    publicLinks: "Useful profile links",
    open: "Open",
    routeCards: {
      "ai-agent-setup": {
        label: "AI Setup",
        detail: "Tool roles, MCP integrations, and new-machine setup notes."
      },
      "ai-skills": {
        label: "AI Skills",
        detail:
          "Reusable instructions for focused research, review, and implementation."
      },
      "delivery-checklists": {
        label: "Checklists",
        detail:
          "Step-by-step checks for task intake, implementation, review, and release."
      },
      "flow-react-flow-architecture-demo": {
        label: "Flow examples",
        detail:
          "Interactive patterns for architecture, layout, grouping, styling, and navigation."
      },
      "flow-react-flow-system-blueprint": {
        label: "System blueprint",
        detail:
          "A detailed map of DNS, runtime, storage, media processing, and fan-out."
      }
    },
    linkCards: {
      home: {
        label: "Home",
        detail: "Public profile overview."
      },
      notes: {
        label: "Notes",
        detail: "Short working notes and reflections."
      },
      blog: {
        label: "Blog",
        detail: "Longer technical and personal essays."
      },
      apps: {
        label: "Apps",
        detail: "Small tools and experiments."
      },
      resume: {
        label: "Resume",
        detail: "Open the latest PDF CV."
      }
    }
  },
  flows: {
    emptyTitle: "No flows are available yet",
    emptyDescription: "Published flows will appear here when they are ready.",
    menu: "Flow menu",
    menuDetail:
      "Reusable paths for system design, production delivery, AI-assisted engineering, and portfolio writing.",
    groupMenuLabel: "Flow groups",
    flowListLabel: "Shareable Studio flows",
    selectedFlow: "Selected Studio flow",
    chartLabel: "Flow chart",
    chartHint:
      "Read from left to right. Each node marks an action or decision, with evidence and output kept nearby.",
    chartOutcome: "Target outcome",
    exampleFamily: "Example family",
    exampleView: "View",
    exampleSelectorLabel: "React Flow example selector",
    boardTools: "Board tools",
    viewNotes: "View notes",
    useWhen: "Use when",
    outcome: "Outcome",
    officeExample: "Practical example",
    artifacts: "Working artifacts",
    cvSignals: "Portfolio evidence",
    evidence: "Evidence",
    output: "Output",
    shareFlow: "Share flow",
    copied: "Copied",
    openFlow: "Open flow",
    enterFullscreen: "Fullscreen board",
    exitFullscreen: "Exit fullscreen",
    canvasMode: "Canvas mode",
    inspectMode: "Inspect",
    editMode: "Edit sandbox",
    layoutMode: "Layout",
    layoutSource: "Source",
    layoutHorizontal: "Horizontal",
    layoutVertical: "Vertical",
    layoutGrid: "Grid",
    layoutPreset: "Layout presets",
    layoutPresetSource: "Source",
    layoutPresetCompact: "Compact",
    layoutPresetWide: "Wide",
    layoutPresetTall: "Tall",
    layoutPresetGrid: "Grid",
    applyLayout: "Apply layout",
    resetBoard: "Reset",
    undo: "Undo",
    redo: "Redo",
    copyNode: "Copy node",
    pasteNode: "Paste node",
    addNote: "Add note",
    deleteNode: "Delete node",
    fitBoard: "Fit board",
    isolate: "Isolate",
    fullGraph: "Full graph",
    upstream: "Upstream",
    current: "Current",
    downstream: "Downstream",
    trailEmpty: "No link",
    trailMore: (count) => `+${count} more`,
    relationMap: "Relation map",
    nodeDetails: "Node details",
    edgeDetails: "Edge details",
    inspector: "Inspector",
    selectedNode: "Selected node",
    selectedEdge: "Selected edge",
    noSelection: "Select a node or edge to inspect it.",
    nodeCount: "Nodes",
    edgeCount: "Edges",
    groupCount: "Groups",
    hiddenCount: "Hidden",
    tags: "Flow tags",
    details: "Flow details",
    scratch: "Scratch",
    reviewNote: "Review note",
    temporaryAnnotation: "Temporary annotation for this Studio session.",
    nodeLabels: {
      hub: "Hub",
      step: "Step",
      detail: "Detail",
      input: "Input",
      default: "Default",
      output: "Output",
      group: "Group",
      service: "Service",
      gateway: "Gateway",
      database: "Database",
      queue: "Queue",
      topic: "Topic",
      cache: "Cache",
      worker: "Worker",
      external: "External",
      decision: "Decision",
      risk: "Risk",
      note: "Note",
      system: "System",
      source: "Source",
      process: "Process",
      agent: "Agent",
      review: "Review",
      storage: "Storage",
      event: "Event"
    },
    familyLabels: {
      overview: "Overview",
      interaction: "Interaction",
      grouping: "Subflows & Grouping",
      layout: "Layout",
      styling: "Styling",
      whiteboard: "Whiteboard",
      architecture: "Software Architecture"
    },
    collapseGroup: "Collapse group",
    expandGroup: "Expand group",
    boardSandbox:
      "Your edits stay in this browser session. Undo or reset them at any time; the source diagram is unchanged."
  },
  aiSetup: {
    addNote: "노트 추가",
    setupLibrary: "Setup library",
    agentSetupNotes: "Agent setup notes",
    agentRuntimes: "Agent runtimes",
    selectedNote: "Selected AI setup note",
    updated: "Updated",
    setupNoteTags: "Setup note tags",
    commandRunbook: "명령 runbook",
    commandRunbookDetail:
      "Commands to verify before using them on a new machine.",
    setupCommands: "Setup commands",
    referenceLinks: "Reference links",
    aiWorkflow: "AI workflow",
    aiWorkflowDetail:
      "A simple path from source material to a checked, reusable result.",
    setupChecklist: "설정 체크리스트",
    researchQueue: "리서치 큐"
  },
  aiSkills: {
    emptyTitle: "No AI skills are available yet",
    emptyDescription: "Published skills will appear here when they are ready.",
    copyMarkdown: "Markdown 복사",
    copied: "복사됨",
    copy: "Copy",
    skillLibrary: "스킬 라이브러리",
    skillLibraryDetail:
      "Reusable instructions you can copy into an AI work session.",
    categoriesLabel: "스킬 카테고리",
    skillCountLabel: (count) => `${count} skills`,
    selectedSkill: "Selected AI skill markdown",
    skillTags: "Skill tags",
    useThisWhen: "Use this when",
    copyBehavior: "Copy behavior",
    copyBehaviorDetail:
      "The button copies the complete markdown instruction, including its process, expected output, and guardrails.",
    operatingRule: "Operating rule",
    operatingRuleDetail:
      "Use the instruction as a starting point. Keep the task boundaries, source material, and final judgment explicit."
  },
  checklists: {
    emptyTitle: "No checklists are available yet",
    emptyDescription:
      "Published checklists will appear here when they are ready.",
    copyChecklist: "Copy checklist",
    copied: "복사됨",
    copy: "Copy",
    menu: "체크리스트 메뉴",
    menuDetail:
      "Step-by-step checks from task intake through release and rollout.",
    workflowListLabel: "Workflow checklists",
    selectedChecklist: "Selected workflow checklist",
    checklistTags: "Checklist tags",
    sections: "섹션",
    steps: "단계",
    whenToUse: "When to use",
    structure: "Structure",
    structureDetail: (sections, steps) =>
      `${sections}개 섹션, ${steps}개 중첩 단계, markdown 복사 가능.`,
    markdownCopy: "Markdown copy",
    markdownUseWhen: "Use when",
    detailsLabel: "Checklist details"
  },
  preferences: {
    title: "환경설정",
    description: "Studio 워크스페이스의 테마, 폰트, 레이아웃.",
    palette: "Appearance",
    themeMode: "테마 모드",
    resolvedNow: "현재 적용",
    font: "Font",
    pageLayout: "페이지 레이아웃",
    pageLayoutHelp:
      "Centered is easier to read. Full width gives diagrams and workspaces more room.",
    navbarBehavior: "Navbar 동작",
    navbarHelp:
      "Sticky keeps the controls visible. Scroll moves them with the page.",
    sidebarStyle: "Sidebar 스타일",
    sidebarStyleHelp:
      "Choose how closely the navigation sits beside the workspace.",
    collapseMode: "접기 방식",
    collapseModeHelp:
      "Icon leaves a narrow navigation rail. Offcanvas hides the sidebar completely on desktop.",
    restoreDefaults: "레이아웃 기본값 복원",
    themeOptions: {
      light: "라이트",
      system: "시스템",
      dark: "다크"
    },
    contentLayoutOptions: {
      centered: "중앙",
      "full-width": "전체 폭"
    },
    navbarStyleOptions: {
      sticky: "고정",
      scroll: "스크롤"
    },
    sidebarVariantOptions: {
      inset: "Inset",
      sidebar: "Sidebar",
      floating: "Floating"
    },
    sidebarCollapsibleOptions: {
      icon: "Icon",
      offcanvas: "Offcanvas"
    }
  }
};
