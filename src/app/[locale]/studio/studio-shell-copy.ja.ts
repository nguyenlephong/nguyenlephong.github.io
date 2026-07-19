import type { StudioUiCopy } from "./studio-shell-copy";

export const japaneseStudioCopy: StudioUiCopy = {
  brand: "Studio",
  navLabel: "パーソナル Studio",
  navItems: {
    welcome: "Welcome",
    "ai-agent-setup": "AI セットアップ",
    "ai-skills": "AI スキル",
    "delivery-checklists": "チェックリスト",
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
  profileNavigationTitle: "プロフィールナビ",
  profileNavigationDetail:
    "Studio から公開プロフィールの各ページへ移動します。",
  openProfileHome: "プロフィールホームを開く",
  findSetupNote: "セットアップノートを検索",
  search: "検索",
  searchPlaceholder: "AI セットアップを検索...",
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
    loading: "Studio ワークスペースを読み込み中…",
    loadErrorTitle: "ワークスペースを利用できません",
    loadErrorDetail:
      "このワークスペースを読み込めませんでした。ナビゲーションと設定は引き続き利用できます。",
    reload: "Studio を再読み込み"
  },
  dashboard: {
    workstreamCount: (count) => `${count} 件のワークストリーム`,
    emptyTitle: "一致するワークストリームがありません",
    emptyDescription: "検索語またはステータスフィルターを調整してください。",
    clearFilters: "フィルターをクリア"
  },
  status: {
    ready: "準備済み",
    draft: "下書き",
    next: "次"
  },
  categories: {
    all: "すべて",
    engineering: "エンジニアリング",
    content: "コンテンツ",
    operations: "運用",
    communication: "コミュニケーション",
    strategy: "戦略",
    learning: "学習"
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
      title: "AI Agent セットアップ",
      description:
        "AI agent ツール、MCP パス、安全なマシン初期化のための個人セットアップノート。",
      panels: ["Setup library", "Agent workflow", "Command runbook"],
      timeline: [
        "Skill library reviewed",
        "MCP install path captured",
        "Credential guardrail checked"
      ]
    },
    "ai-skills": {
      title: "AI スキル",
      description:
        "コードレビュー、アーキテクチャ、コンテンツ、プロンプト、レポート、仕様、提案に使える markdown スキル。",
      panels: ["Skill taxonomy", "Markdown preview", "Copy-ready prompt"],
      timeline: [
        "Installed skills inventoried",
        "Capability gaps mapped",
        "English and Vietnamese prompts prepared"
      ]
    },
    "delivery-checklists": {
      title: "デリバリーチェックリスト",
      description:
        "タスク受領からモジュール作業、リリース準備、ロールアウトまでの運用チェックリスト。",
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
    addNote: "ノート追加",
    setupLibrary: "Setup library",
    agentSetupNotes: "Agent setup notes",
    agentRuntimes: "Agent runtimes",
    selectedNote: "Selected AI setup note",
    updated: "Updated",
    setupNoteTags: "Setup note tags",
    commandRunbook: "コマンド runbook",
    commandRunbookDetail:
      "Commands to verify before using them on a new machine.",
    setupCommands: "Setup commands",
    referenceLinks: "Reference links",
    aiWorkflow: "AI workflow",
    aiWorkflowDetail:
      "A simple path from source material to a checked, reusable result.",
    setupChecklist: "セットアップチェックリスト",
    researchQueue: "調査キュー"
  },
  aiSkills: {
    emptyTitle: "No AI skills are available yet",
    emptyDescription: "Published skills will appear here when they are ready.",
    copyMarkdown: "Markdown をコピー",
    copied: "コピー済み",
    copy: "Copy",
    skillLibrary: "スキルライブラリ",
    skillLibraryDetail:
      "Reusable instructions you can copy into an AI work session.",
    categoriesLabel: "スキル分類",
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
    copied: "コピー済み",
    copy: "Copy",
    menu: "チェックリストメニュー",
    menuDetail:
      "Step-by-step checks from task intake through release and rollout.",
    workflowListLabel: "Workflow checklists",
    selectedChecklist: "Selected workflow checklist",
    checklistTags: "Checklist tags",
    sections: "セクション",
    steps: "ステップ",
    whenToUse: "When to use",
    structure: "Structure",
    structureDetail: (sections, steps) =>
      `${sections} セクション、${steps} 個のネストされたステップ。markdown としてコピーできます。`,
    markdownCopy: "Markdown copy",
    markdownUseWhen: "Use when",
    detailsLabel: "Checklist details"
  },
  preferences: {
    title: "設定",
    description: "Studio ワークスペースのテーマ、フォント、レイアウト。",
    palette: "Appearance",
    themeMode: "テーマモード",
    resolvedNow: "現在",
    font: "Font",
    pageLayout: "ページレイアウト",
    pageLayoutHelp:
      "Centered is easier to read. Full width gives diagrams and workspaces more room.",
    navbarBehavior: "ナビバー動作",
    navbarHelp:
      "Sticky keeps the controls visible. Scroll moves them with the page.",
    sidebarStyle: "サイドバー形式",
    sidebarStyleHelp:
      "Choose how closely the navigation sits beside the workspace.",
    collapseMode: "折りたたみ方式",
    collapseModeHelp:
      "Icon leaves a narrow navigation rail. Offcanvas hides the sidebar completely on desktop.",
    restoreDefaults: "レイアウト既定値に戻す",
    themeOptions: {
      light: "ライト",
      system: "システム",
      dark: "ダーク"
    },
    contentLayoutOptions: {
      centered: "中央寄せ",
      "full-width": "全幅"
    },
    navbarStyleOptions: {
      sticky: "固定",
      scroll: "スクロール"
    },
    sidebarVariantOptions: {
      inset: "インセット",
      sidebar: "サイドバー",
      floating: "フローティング"
    },
    sidebarCollapsibleOptions: {
      icon: "アイコン",
      offcanvas: "オフキャンバス"
    }
  }
};
