"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import type { IconType } from "react-icons";
import { APP_ROUTE } from "@/app/app.const";
import { track } from "@/lib/analytics";
import {
  defaultStudioNoteId,
  studioAiSkills,
  studioFlowGroups,
  studioFlows,
  studioFolders,
  studioNotes,
  studioWorkflowChecklists
} from "./studio.data";
import {
  getLocalizedStudioFlowGroups,
  getLocalizedStudioFlows,
  getLocalizedStudioAiSkills,
  getLocalizedStudioWorkflowChecklists
} from "./studio.localized-content";
import { getLocalizedStudioFolders, getLocalizedStudioNotes } from "./studio.localized-workspace";
import { getLocalizedStudioDemoFlows } from "./studio.localized-demos";
import {
  studioCatalog,
  type StudioNavCatalogItem,
  type StudioNavIconKey,
  type StudioRouteId
} from "./studio-route-catalog";
import StudioAuxiliaryDashboardsFeature from "./StudioAuxiliaryDashboardsFeature";
import StudioDeliverySignalFeature from "./StudioDeliverySignalFeature";
import StudioFlowCanvasFeature from "./StudioFlowCanvasFeature";
import { RouteHeading, RouteMetricGrid } from "./StudioRoutePrimitives";
import type { StudioMetric, StudioRoute } from "./studio-route-contract";
import type {
  StudioFlowCanvasMode,
  StudioFlowCanvasTone,
  StudioFlowHelperLines,
  StudioFlowLayoutMode
} from "./studio-flow-contract";
import { formatStudioFlowLabel } from "./studio-flow-format";
import { loadStudioFlowRuntime } from "./studio-flow-runtime-loader";
import { StudioRouteOpenDeduper } from "./studio-route-open-deduper";
import type {
  StudioFlowCanvasNode,
  StudioFlowConnection,
  StudioFlowEdge,
  StudioFlowEdgeChange,
  StudioFlowInstance,
  StudioFlowMarkerType,
  StudioFlowNodeChange
} from "./StudioFlowCanvasRuntime";
import type {
  StudioAiSkill,
  StudioChecklistStep,
  StudioFlow,
  StudioFlowArchitectureEdgeSpec,
  StudioNote,
  StudioNoteStatus,
  StudioWorkflowChecklist
} from "./studio.data";
import {
  LuAlarmClock,
  LuArchive,
  LuArrowLeft,
  LuArrowUpDown,
  LuBadgeDollarSign,
  LuBanknote,
  LuBarChart,
  LuBell,
  LuBookOpenCheck,
  LuBoxes,
  LuBriefcase,
  LuCalendarDays,
  LuCheck,
  LuCheckCircle2,
  LuChevronDown,
  LuChevronRight,
  LuClipboardList,
  LuCommand,
  LuCopy,
  LuCreditCard,
  LuDatabase,
  LuDownload,
  LuExternalLink,
  LuFilter,
  LuFlag,
  LuForward,
  LuFileText,
  LuFingerprint,
  LuGauge,
  LuGithub,
  LuGlobe,
  LuGraduationCap,
  LuHelpCircle,
  LuKanbanSquare,
  LuLayoutDashboard,
  LuLineChart,
  LuLink,
  LuListTodo,
  LuLock,
  LuMail,
  LuMailOpen,
  LuMapPin,
  LuMaximize2,
  LuMenu,
  LuMessageSquare,
  LuMinimize2,
  LuMonitor,
  LuMoon,
  LuMoreVertical,
  LuPanelLeft,
  LuPaperclip,
  LuPhone,
  LuPhoneCall,
  LuPin,
  LuPlusCircle,
  LuReply,
  LuReplyAll,
  LuRedo2,
  LuRotateCw,
  LuScanLine,
  LuSearch,
  LuSend,
  LuServer,
  LuSettings,
  LuShare2,
  LuShoppingBag,
  LuSlidersHorizontal,
  LuSmile,
  LuSparkles,
  LuSun,
  LuTag,
  LuType,
  LuUndo2,
  LuUser,
  LuUserPlus,
  LuUsers,
  LuWaves,
  LuWorkflow,
  LuX
} from "react-icons/lu";
type StudioAdminShellProps = {
  locale: string;
};

type MailAttachment = {
  id: string;
  name: string;
  size: string;
  kind: string;
};

type StudioMail = {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  receivedAt: string;
  folder: "inbox" | "drafts" | "sent" | "archive";
  isRead: boolean;
  isPinned: boolean;
  isPriority: boolean;
  labels: string[];
  attachments?: MailAttachment[];
  messageCount?: number;
};

type ChatMessage = {
  id: number;
  side: "in" | "out";
  text: string;
  time: string;
};

type ChatContact = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  timezone: string;
  status: string;
  qualifiedAt: string;
  tags: string[];
};

type StudioConversation = {
  id: number;
  group: "Pinned" | "Today" | "Yesterday";
  name: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isOnline: boolean;
  unreadCount: number;
  contact: ChatContact;
  messages: ChatMessage[];
};

type StudioNavItem = {
  id: string;
  title: string;
  icon?: IconType;
  routeId?: StudioRouteId;
  badge?: "new" | "soon";
  disabled?: boolean;
  subItems?: StudioNavItem[];
};

type StudioNavGroup = {
  id: number;
  label: string;
  items: StudioNavItem[];
};

type StudioProfileMenuItem = {
  id: string;
  label: string;
  detail: string;
  href: string;
  icon: IconType;
  external?: boolean;
};

const DEFAULT_ROUTE: StudioRouteId = studioCatalog.defaultRouteId;
const STUDIO_THEME_STORAGE_KEY = "studio_theme_preference";
const STUDIO_FONT_STORAGE_KEY = "studio_font_preference";
const LAYOUT_STORAGE_KEY = "studio_layout_preference";
const STUDIO_LAYOUT_PREFERENCE_VERSION = 2;

type StudioFlowId = (typeof studioFlows)[number]["id"];
type StudioFlowRouteId = Extract<StudioRouteId, `flow-${string}`>;

function flowRouteId(flowId: StudioFlowId): StudioFlowRouteId {
  return `flow-${flowId}` as StudioFlowRouteId;
}

function flowIdFromRoute(routeId: StudioRouteId): StudioFlowId | null {
  if (!routeId.startsWith("flow-")) return null;
  const flowId = routeId.slice("flow-".length) as StudioFlowId;
  return studioFlows.some((flow) => flow.id === flowId) ? flowId : null;
}

type StudioThemeSetting = "light" | "dark" | "system";
type StudioResolvedTheme = "light" | "dark";
type StudioFont = "inter" | "source" | "plex" | "atkinson" | "lora" | "be-vietnam";
type StudioContentLayout = "centered" | "full-width";
type StudioNavbarStyle = "sticky" | "scroll";
type StudioSidebarVariant = "inset" | "sidebar" | "floating";
type StudioSidebarCollapsible = "icon" | "offcanvas";
type StudioRouteActivationSource = "initial_location" | "brand" | "sidebar" | "command" | "route_actions" | "browser_history" | "unknown";

type StudioLayoutPreference = {
  contentLayout: StudioContentLayout;
  navbarStyle: StudioNavbarStyle;
  sidebarVariant: StudioSidebarVariant;
  sidebarCollapsible: StudioSidebarCollapsible;
};

const themeOptions: Array<{ value: StudioThemeSetting; label: string; icon: IconType }> = [
  { value: "light", label: "Light", icon: LuSun },
  { value: "system", label: "System", icon: LuMonitor },
  { value: "dark", label: "Dark", icon: LuMoon }
];

const fontOptions: Array<{ value: StudioFont; label: string; detail: string }> = [
  { value: "inter", label: "Inter", detail: "CV default" },
  { value: "source", label: "Source Sans 3", detail: "Calm sans" },
  { value: "plex", label: "IBM Plex Sans", detail: "Technical sans" },
  { value: "atkinson", label: "Atkinson Hyperlegible", detail: "Readable sans" },
  { value: "lora", label: "Lora", detail: "Serif reading" },
  { value: "be-vietnam", label: "Be Vietnam Pro", detail: "Vietnamese-friendly" }
];

const contentLayoutOptions: Array<{ value: StudioContentLayout; label: string }> = [
  { value: "centered", label: "Centered" },
  { value: "full-width", label: "Full width" }
];

const navbarStyleOptions: Array<{ value: StudioNavbarStyle; label: string }> = [
  { value: "sticky", label: "Sticky" },
  { value: "scroll", label: "Scroll" }
];

const sidebarVariantOptions: Array<{ value: StudioSidebarVariant; label: string }> = [
  { value: "inset", label: "Inset" },
  { value: "sidebar", label: "Sidebar" },
  { value: "floating", label: "Floating" }
];

const sidebarCollapsibleOptions: Array<{ value: StudioSidebarCollapsible; label: string }> = [
  { value: "icon", label: "Icon" },
  { value: "offcanvas", label: "Offcanvas" }
];

const profileMenuItems: StudioProfileMenuItem[] = [
  { id: "home", label: "Home", detail: "Profile overview.", href: APP_ROUTE.HOME, icon: LuGlobe },
  { id: "about", label: "About", detail: "Experience and background.", href: "/#about", icon: LuUser },
  { id: "gallery", label: "Gallery", detail: "Selected visual records.", href: APP_ROUTE.GALLERY, icon: LuSparkles },
  { id: "blog", label: "Blog", detail: "Long-form writing.", href: APP_ROUTE.BLOG, icon: LuBookOpenCheck },
  { id: "notes", label: "Notes", detail: "Shorter working notes.", href: APP_ROUTE.NOTES, icon: LuFileText },
  { id: "apps", label: "Apps", detail: "Small tools and experiments.", href: APP_ROUTE.APPS, icon: LuBoxes },
  { id: "resume", label: "Resume", detail: "Open the CV PDF.", href: APP_ROUTE.CV_PDF, icon: LuDownload, external: true }
];

const defaultLayoutPreference: StudioLayoutPreference = {
  contentLayout: "full-width",
  navbarStyle: "sticky",
  sidebarVariant: "sidebar",
  sidebarCollapsible: "icon"
};

const legacyLayoutPreference: StudioLayoutPreference = {
  contentLayout: "centered",
  navbarStyle: "sticky",
  sidebarVariant: "inset",
  sidebarCollapsible: "icon"
};

type StudioRouteCopy = {
  title: string;
  description: string;
  panels?: string[];
  timeline?: string[];
};

type StudioUiCopy = {
  brand: string;
  navLabel: string;
  navItems: Record<string, string>;
  profileItems: Record<string, { label: string; detail: string }>;
  profileMenuTitle: string;
  profileNavigationTitle: string;
  profileNavigationDetail: string;
  openProfileHome: string;
  findSetupNote: string;
  search: string;
  searchPlaceholder: string;
  commandPaletteLabel: string;
  closeSearch: string;
  openStudio: string;
  closeNavigation: string;
  toggleNavigation: string;
  openPreferences: string;
  openGithubProfile: string;
  openAccountMenu: string;
  routeKicker: {
    legacy: string;
    studio: string;
  };
  routeMetricsLabel: string;
  status: Record<StudioNoteStatus, string>;
  categories: Record<StudioAiSkill["category"] | "all", string>;
  routes: Partial<Record<StudioRouteId, StudioRouteCopy>>;
  welcome: {
    eyebrow: string;
    lead: string;
    note: string;
    studioLinks: string;
    publicLinks: string;
    open: string;
    routeCards: Partial<Record<StudioRouteId, { label: string; detail: string }>>;
    linkCards: Record<string, { label: string; detail: string }>;
  };
  flows: {
    emptyTitle: string;
    emptyDescription: string;
    menu: string;
    menuDetail: string;
    groupMenuLabel: string;
    flowListLabel: string;
    selectedFlow: string;
    chartLabel: string;
    chartHint: string;
    chartOutcome: string;
    exampleFamily: string;
    exampleView: string;
    exampleSelectorLabel: string;
    boardTools: string;
    viewNotes: string;
    useWhen: string;
    outcome: string;
    officeExample: string;
    artifacts: string;
    cvSignals: string;
    evidence: string;
    output: string;
    shareFlow: string;
    copied: string;
    openFlow: string;
    enterFullscreen: string;
    exitFullscreen: string;
    canvasMode: string;
    inspectMode: string;
    editMode: string;
    layoutMode: string;
    layoutSource: string;
    layoutHorizontal: string;
    layoutVertical: string;
    layoutGrid: string;
    layoutPreset: string;
    layoutPresetSource: string;
    layoutPresetCompact: string;
    layoutPresetWide: string;
    layoutPresetTall: string;
    layoutPresetGrid: string;
    applyLayout: string;
    resetBoard: string;
    undo: string;
    redo: string;
    copyNode: string;
    pasteNode: string;
    addNote: string;
    deleteNode: string;
    fitBoard: string;
    isolate: string;
    fullGraph: string;
    upstream: string;
    current: string;
    downstream: string;
    trailEmpty: string;
    trailMore: (count: number) => string;
    relationMap: string;
    nodeDetails: string;
    edgeDetails: string;
    inspector: string;
    selectedNode: string;
    selectedEdge: string;
    noSelection: string;
    nodeCount: string;
    edgeCount: string;
    groupCount: string;
    hiddenCount: string;
    tags: string;
    details: string;
    scratch: string;
    reviewNote: string;
    temporaryAnnotation: string;
    nodeLabels: Record<string, string>;
    familyLabels: Record<string, string>;
    collapseGroup: string;
    expandGroup: string;
    boardSandbox: string;
  };
  aiSetup: {
    addNote: string;
    setupLibrary: string;
    agentSetupNotes: string;
    agentRuntimes: string;
    selectedNote: string;
    updated: string;
    setupNoteTags: string;
    commandRunbook: string;
    commandRunbookDetail: string;
    setupCommands: string;
    referenceLinks: string;
    aiWorkflow: string;
    aiWorkflowDetail: string;
    setupChecklist: string;
    researchQueue: string;
  };
  aiSkills: {
    emptyTitle: string;
    emptyDescription: string;
    copyMarkdown: string;
    copied: string;
    copy: string;
    skillLibrary: string;
    skillLibraryDetail: string;
    categoriesLabel: string;
    skillCountLabel: (count: number) => string;
    selectedSkill: string;
    skillTags: string;
    useThisWhen: string;
    copyBehavior: string;
    copyBehaviorDetail: string;
    operatingRule: string;
    operatingRuleDetail: string;
  };
  checklists: {
    emptyTitle: string;
    emptyDescription: string;
    copyChecklist: string;
    copied: string;
    copy: string;
    menu: string;
    menuDetail: string;
    workflowListLabel: string;
    selectedChecklist: string;
    checklistTags: string;
    sections: string;
    steps: string;
    whenToUse: string;
    structure: string;
    structureDetail: (sections: number, steps: number) => string;
    markdownCopy: string;
    markdownUseWhen: string;
    detailsLabel: string;
  };
  preferences: {
    title: string;
    description: string;
    palette: string;
    themeMode: string;
    resolvedNow: string;
    font: string;
    pageLayout: string;
    pageLayoutHelp: string;
    navbarBehavior: string;
    navbarHelp: string;
    sidebarStyle: string;
    sidebarStyleHelp: string;
    collapseMode: string;
    collapseModeHelp: string;
    restoreDefaults: string;
    themeOptions: Record<StudioThemeSetting, string>;
    contentLayoutOptions: Record<StudioContentLayout, string>;
    navbarStyleOptions: Record<StudioNavbarStyle, string>;
    sidebarVariantOptions: Record<StudioSidebarVariant, string>;
    sidebarCollapsibleOptions: Record<StudioSidebarCollapsible, string>;
  };
};

const englishStudioCopy: StudioUiCopy = {
  brand: "Studio",
  navLabel: "Nguyen Le Phong's personal Studio",
  navItems: {
    welcome: "Start here",
    "ai-agent-setup": "AI Setup",
    "ai-skills": "AI Skills",
    "delivery-checklists": "Checklists",
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
    home: { label: "Home", detail: "Profile overview." },
    about: { label: "About", detail: "Experience and background." },
    gallery: { label: "Gallery", detail: "Selected visual records." },
    blog: { label: "Blog", detail: "Long-form writing." },
    notes: { label: "Notes", detail: "Shorter working notes." },
    apps: { label: "Apps", detail: "Small tools and experiments." },
    resume: { label: "Resume", detail: "Open the CV PDF." }
  },
  profileMenuTitle: "Profile menu",
  profileNavigationTitle: "Profile navigation",
  profileNavigationDetail: "Open any public profile section without leaving the Studio workspace.",
  openProfileHome: "Open profile home",
  findSetupNote: "Search Studio",
  search: "Search",
  searchPlaceholder: "Search Studio pages...",
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
  status: {
    ready: "Ready",
    draft: "Draft",
    next: "Planned"
  },
  categories: {
    all: "All",
    engineering: "Engineering",
    content: "Content",
    operations: "Operations",
    communication: "Communication",
    strategy: "Strategy",
    learning: "Learning"
  },
  routes: {
    welcome: {
      title: "Start here",
      description: "A practical index of my setup notes, reusable workflows, delivery checklists, and visual system maps.",
      panels: ["Choose a workspace", "Useful links", "Studio pages"],
      timeline: ["Choose the right workspace", "Keep the source material close", "Finish with something concrete"]
    },
    "ai-agent-setup": {
      title: "AI Setup",
      description: "Working notes for AI tools, MCP integrations, and a safe new-machine setup.",
      panels: ["Setup library", "Agent workflow", "Command runbook"],
      timeline: ["Skill library reviewed", "MCP install path captured", "Credential guardrail checked"]
    },
    "ai-skills": {
      title: "AI Skills",
      description: "Reusable instructions for focused work with Codex, Claude, Gemini, Antigravity, and other AI tools.",
      panels: ["Skill taxonomy", "Markdown preview", "Copy-ready prompt"],
      timeline: ["Installed skills inventoried", "Capability gaps mapped", "English and Vietnamese prompts prepared"]
    },
    "delivery-checklists": {
      title: "Engineering Checklists",
      description: "Practical checklists for understanding a task, making a change, reviewing it, and releasing it safely.",
      panels: ["Task intake", "Module creation", "Release and rollout"],
      timeline: ["Ticket intake path mapped", "Module checklist nested", "Rollout phases captured"]
    },
    "flow-system-design": {
      title: "System Design Flow",
      description: "A shareable system design path from vague prompt to architecture trade-offs, failure modes, and evolution plan.",
      panels: ["Problem frame", "Runtime map", "Failure modes"],
      timeline: ["Requirement frame set", "Data ownership mapped", "Evolution path documented"]
    },
    "flow-architecture-decision": {
      title: "Architecture Decision Flow",
      description: "A lightweight RFC/ADR flow for choosing between options with clear trade-offs, risk gates, and rollback.",
      panels: ["Decision scope", "Option matrix", "Risk gates"],
      timeline: ["Invariants listed", "Options compared", "Decision note ready"]
    },
    "flow-incident-response": {
      title: "Incident Response Flow",
      description: "A production incident flow for triage, mitigation, communication, recovery, and follow-up work.",
      panels: ["Signal", "Mitigation", "Postmortem"],
      timeline: ["Signal confirmed", "Blast radius contained", "Follow-up owners assigned"]
    },
    "flow-release-readiness": {
      title: "Release Readiness Flow",
      description: "A rollout gate for checking scope, verification, data, observability, and rollback before production.",
      panels: ["Scope", "Verification", "Rollout decision"],
      timeline: ["Scope checked", "Analytics and SEO reviewed", "Rollback trigger named"]
    },
    "flow-ai-delivery": {
      title: "AI-Assisted Delivery Flow",
      description: "A controlled delivery path for using AI agents without losing scope, privacy, tests, or human judgment.",
      panels: ["Task brief", "Context pack", "Verification"],
      timeline: ["Boundaries set", "Focused diff reviewed", "Handoff prepared"]
    },
    "flow-portfolio-story": {
      title: "Portfolio Story Flow",
      description: "A career-proof flow for turning real engineering work into grounded CV, blog, and interview stories.",
      panels: ["Context", "Trade-offs", "Impact"],
      timeline: ["Context captured", "Impact evidence selected", "Story draft shaped"]
    },
    "flow-react-flow-architecture-demo": {
      title: "React Flow Examples",
      description: "An interactive collection of React Flow patterns for navigation, grouping, layout, whiteboarding, and software architecture.",
      panels: ["Choose an example", "Explore the canvas", "Inspect architecture zones"],
      timeline: ["Choose a pattern", "Inspect its relationships", "Try the canvas controls"]
    },
    "flow-react-flow-system-blueprint": {
      title: "System Design Blueprint",
      description: "A detailed system map covering DNS, edge policy, load balancing, storage, media processing, queues, and fan-out services.",
      panels: ["Full system map", "Focused views", "Production components"],
      timeline: ["Trace the request path", "Inspect runtime and storage", "Follow media processing and fan-out"]
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
      "ai-agent-setup": { label: "AI Setup", detail: "Tool roles, MCP integrations, and new-machine setup notes." },
      "ai-skills": { label: "AI Skills", detail: "Reusable instructions for focused research, review, and implementation." },
      "delivery-checklists": { label: "Checklists", detail: "Step-by-step checks for task intake, implementation, review, and release." },
      "flow-react-flow-architecture-demo": { label: "Flow examples", detail: "Interactive patterns for architecture, layout, grouping, styling, and navigation." },
      "flow-react-flow-system-blueprint": { label: "System blueprint", detail: "A detailed map of DNS, runtime, storage, media processing, and fan-out." }
    },
    linkCards: {
      home: { label: "Home", detail: "Public profile overview." },
      notes: { label: "Notes", detail: "Short working notes and reflections." },
      blog: { label: "Blog", detail: "Longer technical and personal essays." },
      apps: { label: "Apps", detail: "Small tools and experiments." },
      resume: { label: "Resume", detail: "Open the latest PDF CV." }
    }
  },
  flows: {
    emptyTitle: "No flows are available yet",
    emptyDescription: "Published flows will appear here when they are ready.",
    menu: "Flow menu",
    menuDetail: "Reusable paths for system design, production delivery, AI-assisted engineering, and portfolio writing.",
    groupMenuLabel: "Flow groups",
    flowListLabel: "Shareable Studio flows",
    selectedFlow: "Selected Studio flow",
    chartLabel: "Flow chart",
    chartHint: "Read from left to right. Each node marks an action or decision, with evidence and output kept nearby.",
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
    boardSandbox: "Your edits stay in this browser session. Undo or reset them at any time; the source diagram is unchanged."
  },
  aiSetup: {
    addNote: "Add note",
    setupLibrary: "Setup library",
    agentSetupNotes: "Agent setup notes",
    agentRuntimes: "Agent runtimes",
    selectedNote: "Selected AI setup note",
    updated: "Updated",
    setupNoteTags: "Setup note tags",
    commandRunbook: "Command runbook",
    commandRunbookDetail: "Commands to verify before using them on a new machine.",
    setupCommands: "Setup commands",
    referenceLinks: "Reference links",
    aiWorkflow: "AI workflow",
    aiWorkflowDetail: "A simple path from source material to a checked, reusable result.",
    setupChecklist: "Setup checklist",
    researchQueue: "Research queue"
  },
  aiSkills: {
    emptyTitle: "No AI skills are available yet",
    emptyDescription: "Published skills will appear here when they are ready.",
    copyMarkdown: "Copy markdown",
    copied: "Copied",
    copy: "Copy",
    skillLibrary: "Skill library",
    skillLibraryDetail: "Reusable instructions you can copy into an AI work session.",
    categoriesLabel: "Skill categories",
    skillCountLabel: (count) => `${count} skills`,
    selectedSkill: "Selected AI skill markdown",
    skillTags: "Skill tags",
    useThisWhen: "Use this when",
    copyBehavior: "Copy behavior",
    copyBehaviorDetail: "The button copies the complete markdown instruction, including its process, expected output, and guardrails.",
    operatingRule: "Operating rule",
    operatingRuleDetail: "Use the instruction as a starting point. Keep the task boundaries, source material, and final judgment explicit."
  },
  checklists: {
    emptyTitle: "No checklists are available yet",
    emptyDescription: "Published checklists will appear here when they are ready.",
    copyChecklist: "Copy checklist",
    copied: "Copied",
    copy: "Copy",
    menu: "Checklist menu",
    menuDetail: "Step-by-step checks from task intake through release and rollout.",
    workflowListLabel: "Workflow checklists",
    selectedChecklist: "Selected workflow checklist",
    checklistTags: "Checklist tags",
    sections: "sections",
    steps: "steps",
    whenToUse: "When to use",
    structure: "Structure",
    structureDetail: (sections, steps) => `${sections} sections, ${steps} nested steps, copy-ready as markdown.`,
    markdownCopy: "Markdown copy",
    markdownUseWhen: "Use when",
    detailsLabel: "Checklist details"
  },
  preferences: {
    title: "Preferences",
    description: "Theme, font, and layout for this Studio workspace.",
    palette: "Appearance",
    themeMode: "Theme mode",
    resolvedNow: "Currently using",
    font: "Font",
    pageLayout: "Page layout",
    pageLayoutHelp: "Centered is easier to read. Full width gives diagrams and workspaces more room.",
    navbarBehavior: "Navbar behavior",
    navbarHelp: "Sticky keeps the controls visible. Scroll moves them with the page.",
    sidebarStyle: "Sidebar style",
    sidebarStyleHelp: "Choose how closely the navigation sits beside the workspace.",
    collapseMode: "Collapse mode",
    collapseModeHelp: "Icon leaves a narrow navigation rail. Offcanvas hides the sidebar completely on desktop.",
    restoreDefaults: "Restore layout defaults",
    themeOptions: { light: "Light", system: "System", dark: "Dark" },
    contentLayoutOptions: { centered: "Centered", "full-width": "Full width" },
    navbarStyleOptions: { sticky: "Sticky", scroll: "Scroll" },
    sidebarVariantOptions: { inset: "Inset", sidebar: "Sidebar", floating: "Floating" },
    sidebarCollapsibleOptions: { icon: "Icon", offcanvas: "Offcanvas" }
  }
};

type CompactStudioCopyConfig = {
  navLabel: string;
  navItems: Partial<Record<StudioRouteId, string>>;
  findSetupNote: string;
  search: string;
  searchPlaceholder: string;
  profileNavigationTitle: string;
  profileNavigationDetail: string;
  openProfileHome: string;
  status: StudioUiCopy["status"];
  categories: StudioUiCopy["categories"];
  routeText: {
    setup: Pick<StudioRouteCopy, "title" | "description">;
    skills: Pick<StudioRouteCopy, "title" | "description">;
    checklists: Pick<StudioRouteCopy, "title" | "description">;
  };
  aiSetup: Partial<StudioUiCopy["aiSetup"]>;
  aiSkills: Partial<StudioUiCopy["aiSkills"]>;
  checklists: Partial<StudioUiCopy["checklists"]>;
  preferences: Partial<StudioUiCopy["preferences"]>;
};

function createCompactStudioCopy(config: CompactStudioCopyConfig): StudioUiCopy {
  return {
    ...englishStudioCopy,
    navLabel: config.navLabel,
    navItems: { ...englishStudioCopy.navItems, ...config.navItems },
    findSetupNote: config.findSetupNote,
    search: config.search,
    searchPlaceholder: config.searchPlaceholder,
    profileNavigationTitle: config.profileNavigationTitle,
    profileNavigationDetail: config.profileNavigationDetail,
    openProfileHome: config.openProfileHome,
    status: config.status,
    categories: config.categories,
    routes: {
      welcome: { ...englishStudioCopy.routes.welcome!, title: "Welcome" },
      "ai-agent-setup": { ...englishStudioCopy.routes["ai-agent-setup"]!, ...config.routeText.setup },
      "ai-skills": { ...englishStudioCopy.routes["ai-skills"]!, ...config.routeText.skills },
      "delivery-checklists": { ...englishStudioCopy.routes["delivery-checklists"]!, ...config.routeText.checklists }
    },
    aiSetup: { ...englishStudioCopy.aiSetup, ...config.aiSetup },
    aiSkills: { ...englishStudioCopy.aiSkills, ...config.aiSkills },
    checklists: { ...englishStudioCopy.checklists, ...config.checklists },
    preferences: { ...englishStudioCopy.preferences, ...config.preferences }
  };
}

const studioCopyByLocale: Record<string, StudioUiCopy> = {
  en: englishStudioCopy,
  vi: {
    ...englishStudioCopy,
    navLabel: "Studio cá nhân của Nguyễn Lê Phong",
    navItems: {
      welcome: "Bắt đầu",
      "ai-agent-setup": "AI Setup",
      "ai-skills": "AI Skills",
      "delivery-checklists": "Checklists",
      "flow-menu": "Flow",
      "flow-system-design": "System Design",
      "flow-architecture-decision": "Architecture Decision",
      "flow-incident-response": "Incident Response",
      "flow-release-readiness": "Release Readiness",
      "flow-ai-delivery": "AI-assisted Delivery",
      "flow-portfolio-story": "Portfolio Story",
      "flow-react-flow-architecture-demo": "React Flow Examples",
      "flow-react-flow-system-blueprint": "System Blueprint"
    },
    profileItems: {
      home: { label: "Trang chủ", detail: "Tổng quan hồ sơ cá nhân." },
      about: { label: "Giới thiệu", detail: "Kinh nghiệm và nền tảng." },
      gallery: { label: "Hình ảnh", detail: "Những dấu mốc và hình ảnh chọn lọc." },
      blog: { label: "Blog", detail: "Bài viết dài." },
      notes: { label: "Ghi chép", detail: "Ghi chép ngắn từ công việc và đời sống." },
      apps: { label: "Ứng dụng", detail: "Công cụ nhỏ và những thử nghiệm cá nhân." },
      resume: { label: "CV", detail: "Mở bản CV dạng PDF." }
    },
    profileMenuTitle: "Hồ sơ cá nhân",
    profileNavigationTitle: "Đi tới trang khác",
    profileNavigationDetail: "Mở các phần trong hồ sơ công khai mà không phải rời Studio.",
    openProfileHome: "Mở trang hồ sơ chính",
    findSetupNote: "Tìm trong Studio",
    search: "Tìm kiếm",
    searchPlaceholder: "Tìm một trang trong Studio...",
    commandPaletteLabel: "Tìm trang trong Studio",
    closeSearch: "Đóng tìm kiếm",
    openStudio: "Mở Studio",
    closeNavigation: "Đóng menu",
    toggleNavigation: "Ẩn/hiện menu",
    openPreferences: "Mở tùy chỉnh Studio",
    openGithubProfile: "Mở hồ sơ GitHub",
    openAccountMenu: "Mở menu tài khoản",
    routeKicker: { legacy: "Bản cũ", studio: "Studio" },
    routeMetricsLabel: "Tóm tắt trang",
    status: { ready: "Dùng được", draft: "Đang viết", next: "Dự kiến" },
    categories: {
      all: "Tất cả",
      engineering: "Kỹ thuật",
      content: "Nội dung",
      operations: "Vận hành",
      communication: "Giao tiếp",
      strategy: "Chiến lược",
      learning: "Học tập"
    },
    routes: {
      welcome: {
        title: "Bắt đầu",
        description: "Mục lục gọn cho các ghi chú thiết lập, hướng dẫn dùng AI, danh sách kiểm tra và sơ đồ hệ thống tôi thường dùng.",
        panels: ["Chọn nơi cần mở", "Liên kết hữu ích", "Các trang trong Studio"],
        timeline: ["Chọn đúng chỗ làm việc", "Giữ tài liệu gốc bên cạnh", "Kết thúc bằng một kết quả cụ thể"]
      },
      "ai-agent-setup": {
        title: "AI Setup",
        description: "Ghi chú về vai trò của từng công cụ AI, cách nối MCP và cách chuẩn bị máy mới an toàn.",
        panels: ["Ghi chú thiết lập", "Cách phối hợp công cụ", "Lệnh cần dùng"],
        timeline: ["Kiểm lại thư viện hướng dẫn", "Lưu đúng đường cài MCP", "Không mang theo thông tin đăng nhập từ máy cũ"]
      },
      "ai-skills": {
        title: "AI Skills",
        description: "Những hướng dẫn có thể dùng lại khi nghiên cứu, phản biện, viết và làm việc với mã nguồn bằng các công cụ AI.",
        panels: ["Nhóm công việc", "Nội dung Markdown", "Bản có thể sao chép"],
        timeline: ["Kiểm kê hướng dẫn đang có", "Nhìn ra phần còn thiếu", "Chuẩn bị bản tiếng Anh và tiếng Việt"]
      },
      "delivery-checklists": {
        title: "Engineering Checklists",
        description: "Các bước cần kiểm từ lúc hiểu yêu cầu, sửa code, tự review đến khi release an toàn.",
        panels: ["Nhận việc", "Thực hiện thay đổi", "Release và theo dõi"],
        timeline: ["Làm rõ yêu cầu", "Review từng phần thay đổi", "Ghi rõ kế hoạch release và rollback"]
      },
      "flow-system-design": {
        title: "System Design Flow",
        description: "Cách đi từ một đề bài còn mơ hồ tới kiến trúc có ranh giới rõ, biết đánh đổi gì và sẽ hỏng ở đâu.",
        panels: ["Đóng khung bài toán", "Sơ đồ khi vận hành", "Tình huống hỏng hóc"],
        timeline: ["Làm rõ yêu cầu", "Chỉ ra nơi sở hữu dữ liệu", "Ghi lại hướng mở rộng về sau"]
      },
      "flow-architecture-decision": {
        title: "Architecture Decision Flow",
        description: "Khung RFC/ADR gọn để so sánh phương án, nêu rõ đánh đổi, ngưỡng rủi ro và đường quay lui.",
        panels: ["Phạm vi quyết định", "Bảng so sánh phương án", "Ngưỡng rủi ro"],
        timeline: ["Liệt kê điều không được phá vỡ", "So sánh các phương án", "Hoàn tất biên bản quyết định"]
      },
      "flow-incident-response": {
        title: "Incident Response Flow",
        description: "Các bước xác minh, giảm thiệt hại, thông báo, khôi phục và rút kinh nghiệm sau sự cố thật.",
        panels: ["Dấu hiệu", "Giảm thiệt hại", "Rút kinh nghiệm"],
        timeline: ["Xác nhận sự cố", "Khoanh vùng ảnh hưởng", "Giao rõ người xử lý việc còn lại"]
      },
      "flow-release-readiness": {
        title: "Release Readiness Flow",
        description: "Cửa kiểm cuối cho scope, dữ liệu, testing, observability và rollback trước khi lên production.",
        panels: ["Phạm vi", "Bằng chứng kiểm tra", "Quyết định phát hành"],
        timeline: ["Rà lại scope", "Kiểm tra analytics và SEO", "Nêu rõ lúc nào phải rollback"]
      },
      "flow-ai-delivery": {
        title: "AI-assisted Delivery Flow",
        description: "Cách dùng AI mà vẫn giữ đúng phạm vi, bảo vệ dữ liệu, kiểm thử đầy đủ và để con người chịu trách nhiệm quyết định.",
        panels: ["Đề bài", "Tài liệu cần thiết", "Kiểm chứng"],
        timeline: ["Chốt ranh giới", "Rà đúng phần thay đổi", "Chuẩn bị bàn giao"]
      },
      "flow-portfolio-story": {
        title: "Portfolio Story Flow",
        description: "Cách biến một việc kỹ thuật có thật thành câu chuyện cho CV, blog hoặc phỏng vấn mà không thổi phồng đóng góp.",
        panels: ["Bối cảnh", "Đánh đổi", "Kết quả"],
        timeline: ["Ghi đủ bối cảnh", "Chọn bằng chứng phù hợp", "Viết thành câu chuyện rõ ràng"]
      },
      "flow-react-flow-architecture-demo": {
        title: "React Flow Examples",
        description: "Bộ ví dụ tương tác về điều hướng, gom nhóm, bố cục, bảng phác thảo và sơ đồ kiến trúc bằng React Flow.",
        panels: ["Chọn ví dụ", "Khám phá sơ đồ", "Xem từng vùng kiến trúc"],
        timeline: ["Chọn kiểu sơ đồ", "Xem các mối liên hệ", "Thử công cụ trên bảng"]
      },
      "flow-react-flow-system-blueprint": {
        title: "System Blueprint",
        description: "Sơ đồ chi tiết cho DNS, edge policy, load balancing, storage, media processing, queue và các fan-out service.",
        panels: ["Sơ đồ đầy đủ", "Góc nhìn tập trung", "Thành phần khi vận hành"],
        timeline: ["Lần theo đường đi của yêu cầu", "Xem tầng chạy và lưu trữ", "Theo dõi xử lý media và phân phối dữ liệu"]
      }
    },
    welcome: {
      ...englishStudioCopy.welcome,
      eyebrow: "Bàn làm việc cá nhân",
      lead: "Tôi gom ở đây những thứ dùng thường xuyên trong công việc kỹ thuật: ghi chú thiết lập, hướng dẫn làm việc với AI, danh sách kiểm tra và sơ đồ hệ thống.",
      note: "Hãy chọn đúng trang cho việc đang làm, kiểm lại tài liệu gốc, rồi kết thúc bằng một quyết định, danh sách, sơ đồ hoặc thay đổi đã được kiểm chứng.",
      studioLinks: "Lối tắt trong Studio",
      publicLinks: "Liên kết trong hồ sơ",
      open: "Mở",
      routeCards: {
        "ai-agent-setup": { label: "AI Setup", detail: "Vai trò của từng công cụ, cách nối MCP và ghi chú chuẩn bị máy mới." },
        "ai-skills": { label: "AI Skills", detail: "Các skill dùng lại cho research, code và review." },
        "delivery-checklists": { label: "Checklists", detail: "Checklist từ lúc nhận task, code, review đến release." },
        "flow-react-flow-architecture-demo": { label: "React Flow Examples", detail: "Các React Flow pattern cho architecture diagram, layout, grouping và interaction." },
        "flow-react-flow-system-blueprint": { label: "System Blueprint", detail: "System map cho DNS, runtime, storage, media pipeline và fan-out." }
      },
      linkCards: {
        home: { label: "Trang chủ", detail: "Tổng quan hồ sơ cá nhân." },
        notes: { label: "Ghi chép", detail: "Những ghi chép ngắn từ công việc và đời sống." },
        blog: { label: "Blog", detail: "Bài viết dài hơn về kỹ thuật và trải nghiệm." },
        apps: { label: "Ứng dụng", detail: "Công cụ nhỏ và thử nghiệm cá nhân." },
        resume: { label: "CV", detail: "Mở bản CV PDF mới nhất." }
      }
    },
    flows: {
      ...englishStudioCopy.flows,
      emptyTitle: "Chưa có Flow nào",
      emptyDescription: "Flow đã hoàn thiện sẽ xuất hiện ở đây.",
      menu: "Flow Library",
      menuDetail: "Các flow dùng lại cho System Design, release lên production, AI-assisted engineering và xây portfolio.",
      groupMenuLabel: "Nhóm Flow",
      flowListLabel: "Các Flow trong Studio",
      selectedFlow: "Flow đang chọn",
      chartLabel: "Flow chart",
      chartHint: "Đọc từ trái sang phải. Mỗi node là một bước xử lý hoặc điểm ra quyết định, kèm evidence và output cần có.",
      chartOutcome: "Kết quả cần đạt",
      exampleFamily: "Example family",
      exampleView: "View",
      exampleSelectorLabel: "Chọn ví dụ React Flow",
      boardTools: "Board tools",
      viewNotes: "View notes",
      useWhen: "Dùng khi",
      outcome: "Kết quả",
      officeExample: "Ví dụ thực tế",
      artifacts: "Artifacts",
      cvSignals: "Portfolio evidence",
      evidence: "Evidence",
      output: "Output",
      shareFlow: "Chia sẻ Flow",
      copied: "Đã sao chép",
      openFlow: "Mở quy trình",
      enterFullscreen: "Mở toàn màn hình",
      exitFullscreen: "Thoát toàn màn hình",
      canvasMode: "Canvas mode",
      inspectMode: "Inspect",
      editMode: "Edit sandbox",
      layoutMode: "Layout",
      layoutSource: "Source",
      layoutHorizontal: "Ngang",
      layoutVertical: "Dọc",
      layoutGrid: "Lưới",
      layoutPreset: "Layout presets",
      layoutPresetSource: "Source",
      layoutPresetCompact: "Compact",
      layoutPresetWide: "Wide",
      layoutPresetTall: "Tall",
      layoutPresetGrid: "Grid",
      applyLayout: "Áp dụng layout",
      resetBoard: "Đặt lại",
      undo: "Hoàn tác",
      redo: "Làm lại",
      copyNode: "Copy node",
      pasteNode: "Paste node",
      addNote: "Thêm ghi chú",
      deleteNode: "Xóa node",
      fitBoard: "Vừa khung nhìn",
      isolate: "Isolate",
      fullGraph: "Full graph",
      upstream: "Upstream",
      current: "Đang chọn",
      downstream: "Downstream",
      trailEmpty: "Chưa có liên kết",
      trailMore: (count) => `+${count} nữa`,
      relationMap: "Relation map",
      nodeDetails: "Node details",
      edgeDetails: "Edge details",
      inspector: "Inspector",
      selectedNode: "Node đang chọn",
      selectedEdge: "Edge đang chọn",
      noSelection: "Chọn một node hoặc edge để xem chi tiết.",
      nodeCount: "Nodes",
      edgeCount: "Edges",
      groupCount: "Groups",
      hiddenCount: "Đang ẩn",
      tags: "Chủ đề của quy trình",
      details: "Thông tin quy trình",
      scratch: "Scratch",
      reviewNote: "Review note",
      temporaryAnnotation: "Ghi chú tạm trong phiên Studio này.",
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
      collapseGroup: "Thu gọn group",
      expandGroup: "Mở rộng group",
      boardSandbox: "Các chỉnh sửa chỉ tồn tại trong session này. Có thể undo hoặc reset bất cứ lúc nào; source diagram không bị thay đổi."
    },
    aiSetup: {
      ...englishStudioCopy.aiSetup,
      addNote: "Thêm note",
      setupLibrary: "Setup notes",
      agentSetupNotes: "AI setup notes",
      agentRuntimes: "AI runtimes",
      selectedNote: "Note đang chọn",
      updated: "Cập nhật",
      setupNoteTags: "Chủ đề của ghi chú",
      commandRunbook: "Command runbook",
      commandRunbookDetail: "Luôn đối chiếu tài liệu mới nhất trước khi chạy trên máy mới.",
      setupCommands: "Setup commands",
      referenceLinks: "Tài liệu tham khảo",
      aiWorkflow: "AI workflow",
      aiWorkflowDetail: "Một đường đi đơn giản từ tài liệu gốc đến kết quả đã được kiểm chứng và có thể dùng lại.",
      setupChecklist: "Setup checklist",
      researchQueue: "Research queue"
    },
    aiSkills: {
      ...englishStudioCopy.aiSkills,
      emptyTitle: "Chưa có AI Skill nào",
      emptyDescription: "Skill đã hoàn thiện sẽ xuất hiện ở đây.",
      copyMarkdown: "Sao chép Markdown",
      copied: "Đã sao chép",
      copy: "Sao chép",
      skillLibrary: "Skill Library",
      skillLibraryDetail: "Các skill có thể copy thẳng vào một phiên làm việc với AI.",
      categoriesLabel: "Nhóm công việc",
      skillCountLabel: (count) => `${count} skills`,
      selectedSkill: "Skill đang chọn",
      skillTags: "Chủ đề",
      useThisWhen: "Dùng khi",
      copyBehavior: "Nội dung được sao chép",
      copyBehaviorDetail: "Nút này copy toàn bộ Markdown, gồm workflow, expected output và guardrails.",
      operatingRule: "Cách dùng",
      operatingRuleDetail: "Hãy xem đây là điểm bắt đầu. Vẫn cần nêu rõ phạm vi, cung cấp đúng tài liệu gốc và tự chịu trách nhiệm cho quyết định cuối cùng."
    },
    checklists: {
      ...englishStudioCopy.checklists,
      emptyTitle: "Chưa có checklist nào",
      emptyDescription: "Checklist đã hoàn thiện sẽ xuất hiện ở đây.",
      copyChecklist: "Copy checklist",
      copied: "Đã sao chép",
      copy: "Sao chép",
      menu: "Checklist Library",
      menuDetail: "Các checklist từ lúc nhận task đến release và rollout.",
      workflowListLabel: "Workflow checklists",
      selectedChecklist: "Checklist đang chọn",
      checklistTags: "Chủ đề",
      sections: "phần",
      steps: "bước",
      whenToUse: "Khi dùng",
      structure: "Cấu trúc",
      structureDetail: (sections, steps) => `${sections} phần, ${steps} bước chi tiết, có thể sao chép dưới dạng Markdown.`,
      markdownCopy: "Bản Markdown",
      markdownUseWhen: "Dùng khi",
      detailsLabel: "Chi tiết checklist"
    },
    preferences: {
      ...englishStudioCopy.preferences,
      title: "Tùy chỉnh",
      description: "Chọn giao diện, phông chữ và cách trình bày cho Studio.",
      palette: "Giao diện",
      themeMode: "Chế độ màu",
      resolvedNow: "Đang áp dụng",
      font: "Phông chữ",
      pageLayout: "Bề rộng nội dung",
      pageLayoutHelp: "Căn giữa dễ đọc hơn. Toàn chiều rộng cho sơ đồ và khu làm việc nhiều chỗ hơn.",
      navbarBehavior: "Thanh công cụ",
      navbarHelp: "Cố định để luôn thấy các nút điều khiển. Cuộn để thanh này đi cùng nội dung.",
      sidebarStyle: "Kiểu thanh bên",
      sidebarStyleHelp: "Chọn cách thanh điều hướng nằm cạnh khu làm việc.",
      collapseMode: "Cách thu gọn",
      collapseModeHelp: "Biểu tượng giữ lại một dải điều hướng nhỏ. Ẩn hoàn toàn sẽ cất thanh bên trên máy tính.",
      restoreDefaults: "Khôi phục cách trình bày mặc định",
      themeOptions: { light: "Sáng", system: "Hệ thống", dark: "Tối" },
      contentLayoutOptions: { centered: "Căn giữa", "full-width": "Toàn chiều rộng" },
      navbarStyleOptions: { sticky: "Cố định", scroll: "Cuộn theo trang" },
      sidebarVariantOptions: { inset: "Liền khối", sidebar: "Thanh bên", floating: "Tách nền" },
      sidebarCollapsibleOptions: { icon: "Thu còn biểu tượng", offcanvas: "Ẩn hoàn toàn" }
    }
  },
  zh: createCompactStudioCopy({
    navLabel: "个人 Studio",
    navItems: { welcome: "Welcome", "ai-agent-setup": "AI 设置", "ai-skills": "AI 技能", "delivery-checklists": "清单" },
    findSetupNote: "查找设置笔记",
    search: "搜索",
    searchPlaceholder: "搜索 AI 设置...",
    profileNavigationTitle: "个人资料导航",
    profileNavigationDetail: "从 Studio 进入公开个人资料页面。",
    openProfileHome: "打开个人主页",
    status: { ready: "就绪", draft: "草稿", next: "下一步" },
    categories: { all: "全部", engineering: "工程", content: "内容", operations: "运营", communication: "沟通", strategy: "策略", learning: "学习" },
    routeText: {
      setup: { title: "AI Agent 设置", description: "用于 AI agent 工具、MCP 路径和安全机器初始化的个人设置笔记。" },
      skills: { title: "AI 技能", description: "可复制的 markdown 技能，用于代码评审、架构、内容、提示词、报告、规格和提案。" },
      checklists: { title: "交付清单", description: "从任务接收到模块工作、发布准备和上线的操作清单。" }
    },
    aiSetup: { ...englishStudioCopy.aiSetup, addNote: "添加笔记", commandRunbook: "命令 runbook", setupChecklist: "设置清单", researchQueue: "研究队列" },
    aiSkills: { ...englishStudioCopy.aiSkills, copyMarkdown: "复制 markdown", copied: "已复制", skillLibrary: "技能库", categoriesLabel: "技能分类" },
    checklists: { ...englishStudioCopy.checklists, copied: "已复制", menu: "清单菜单", sections: "部分", steps: "步骤", structureDetail: (sections, steps) => `${sections} 个部分，${steps} 个嵌套步骤，可复制为 markdown。` },
    preferences: { ...englishStudioCopy.preferences, title: "偏好设置", description: "Studio 工作区的主题、字体和布局。", themeMode: "主题模式", resolvedNow: "当前解析", pageLayout: "页面布局", navbarBehavior: "导航栏行为", sidebarStyle: "侧边栏样式", collapseMode: "折叠模式", restoreDefaults: "恢复默认布局", themeOptions: { light: "浅色", system: "系统", dark: "深色" }, contentLayoutOptions: { centered: "居中", "full-width": "全宽" }, navbarStyleOptions: { sticky: "固定", scroll: "滚动" }, sidebarVariantOptions: { inset: "内嵌", sidebar: "侧边栏", floating: "浮动" }, sidebarCollapsibleOptions: { icon: "图标", offcanvas: "抽屉" } }
  }),
  ja: createCompactStudioCopy({
    navLabel: "パーソナル Studio",
    navItems: { welcome: "Welcome", "ai-agent-setup": "AI セットアップ", "ai-skills": "AI スキル", "delivery-checklists": "チェックリスト" },
    findSetupNote: "セットアップノートを検索",
    search: "検索",
    searchPlaceholder: "AI セットアップを検索...",
    profileNavigationTitle: "プロフィールナビ",
    profileNavigationDetail: "Studio から公開プロフィールの各ページへ移動します。",
    openProfileHome: "プロフィールホームを開く",
    status: { ready: "準備済み", draft: "下書き", next: "次" },
    categories: { all: "すべて", engineering: "エンジニアリング", content: "コンテンツ", operations: "運用", communication: "コミュニケーション", strategy: "戦略", learning: "学習" },
    routeText: {
      setup: { title: "AI Agent セットアップ", description: "AI agent ツール、MCP パス、安全なマシン初期化のための個人セットアップノート。" },
      skills: { title: "AI スキル", description: "コードレビュー、アーキテクチャ、コンテンツ、プロンプト、レポート、仕様、提案に使える markdown スキル。" },
      checklists: { title: "デリバリーチェックリスト", description: "タスク受領からモジュール作業、リリース準備、ロールアウトまでの運用チェックリスト。" }
    },
    aiSetup: { ...englishStudioCopy.aiSetup, addNote: "ノート追加", commandRunbook: "コマンド runbook", setupChecklist: "セットアップチェックリスト", researchQueue: "調査キュー" },
    aiSkills: { ...englishStudioCopy.aiSkills, copyMarkdown: "Markdown をコピー", copied: "コピー済み", skillLibrary: "スキルライブラリ", categoriesLabel: "スキル分類" },
    checklists: { ...englishStudioCopy.checklists, copied: "コピー済み", menu: "チェックリストメニュー", sections: "セクション", steps: "ステップ", structureDetail: (sections, steps) => `${sections} セクション、${steps} 個のネストされたステップ。markdown としてコピーできます。` },
    preferences: { ...englishStudioCopy.preferences, title: "設定", description: "Studio ワークスペースのテーマ、フォント、レイアウト。", themeMode: "テーマモード", resolvedNow: "現在", pageLayout: "ページレイアウト", navbarBehavior: "ナビバー動作", sidebarStyle: "サイドバー形式", collapseMode: "折りたたみ方式", restoreDefaults: "レイアウト既定値に戻す", themeOptions: { light: "ライト", system: "システム", dark: "ダーク" }, contentLayoutOptions: { centered: "中央寄せ", "full-width": "全幅" }, navbarStyleOptions: { sticky: "固定", scroll: "スクロール" }, sidebarVariantOptions: { inset: "インセット", sidebar: "サイドバー", floating: "フローティング" }, sidebarCollapsibleOptions: { icon: "アイコン", offcanvas: "オフキャンバス" } }
  }),
  ko: createCompactStudioCopy({
    navLabel: "개인 Studio",
    navItems: { welcome: "Welcome", "ai-agent-setup": "AI 설정", "ai-skills": "AI 스킬", "delivery-checklists": "체크리스트" },
    findSetupNote: "설정 노트 찾기",
    search: "검색",
    searchPlaceholder: "AI 설정 검색...",
    profileNavigationTitle: "프로필 탐색",
    profileNavigationDetail: "Studio에서 공개 프로필 섹션으로 이동합니다.",
    openProfileHome: "프로필 홈 열기",
    status: { ready: "준비됨", draft: "초안", next: "다음" },
    categories: { all: "전체", engineering: "엔지니어링", content: "콘텐츠", operations: "운영", communication: "커뮤니케이션", strategy: "전략", learning: "학습" },
    routeText: {
      setup: { title: "AI Agent 설정", description: "AI agent 도구, MCP 경로, 안전한 머신 부트스트랩을 위한 개인 설정 노트." },
      skills: { title: "AI 스킬", description: "코드 리뷰, 아키텍처, 콘텐츠, 프롬프트, 보고서, 스펙, 제안서에 재사용할 수 있는 markdown 스킬." },
      checklists: { title: "딜리버리 체크리스트", description: "작업 접수부터 모듈 작업, 릴리스 준비, 롤아웃까지의 운영 체크리스트." }
    },
    aiSetup: { ...englishStudioCopy.aiSetup, addNote: "노트 추가", commandRunbook: "명령 runbook", setupChecklist: "설정 체크리스트", researchQueue: "리서치 큐" },
    aiSkills: { ...englishStudioCopy.aiSkills, copyMarkdown: "Markdown 복사", copied: "복사됨", skillLibrary: "스킬 라이브러리", categoriesLabel: "스킬 카테고리" },
    checklists: { ...englishStudioCopy.checklists, copied: "복사됨", menu: "체크리스트 메뉴", sections: "섹션", steps: "단계", structureDetail: (sections, steps) => `${sections}개 섹션, ${steps}개 중첩 단계, markdown 복사 가능.` },
    preferences: { ...englishStudioCopy.preferences, title: "환경설정", description: "Studio 워크스페이스의 테마, 폰트, 레이아웃.", themeMode: "테마 모드", resolvedNow: "현재 적용", pageLayout: "페이지 레이아웃", navbarBehavior: "Navbar 동작", sidebarStyle: "Sidebar 스타일", collapseMode: "접기 방식", restoreDefaults: "레이아웃 기본값 복원", themeOptions: { light: "라이트", system: "시스템", dark: "다크" }, contentLayoutOptions: { centered: "중앙", "full-width": "전체 폭" }, navbarStyleOptions: { sticky: "고정", scroll: "스크롤" }, sidebarVariantOptions: { inset: "Inset", sidebar: "Sidebar", floating: "Floating" }, sidebarCollapsibleOptions: { icon: "Icon", offcanvas: "Offcanvas" } }
  }),
  fr: createCompactStudioCopy({
    navLabel: "Studio personnel",
    navItems: { welcome: "Welcome", "ai-agent-setup": "Setup IA", "ai-skills": "Skills IA", "delivery-checklists": "Checklists" },
    findSetupNote: "Trouver une note",
    search: "Rechercher",
    searchPlaceholder: "Rechercher dans le setup IA...",
    profileNavigationTitle: "Navigation profil",
    profileNavigationDetail: "Aller vers les sections publiques du profil depuis Studio.",
    openProfileHome: "Ouvrir l'accueil du profil",
    status: { ready: "Prêt", draft: "Brouillon", next: "Suivant" },
    categories: { all: "Tout", engineering: "Ingénierie", content: "Contenu", operations: "Opérations", communication: "Communication", strategy: "Stratégie", learning: "Apprentissage" },
    routeText: {
      setup: { title: "Setup AI Agent", description: "Notes personnelles pour les outils AI agent, chemins MCP et bootstrap machine sécurisé." },
      skills: { title: "Skills IA", description: "Skills markdown réutilisables pour review code, architecture, contenu, prompts, rapports, specs et proposals." },
      checklists: { title: "Checklists de livraison", description: "Checklists de l'intake de tâche au module, release readiness et rollout." }
    },
    aiSetup: { ...englishStudioCopy.aiSetup, addNote: "Ajouter une note", commandRunbook: "Runbook commandes", setupChecklist: "Checklist setup", researchQueue: "File de recherche" },
    aiSkills: { ...englishStudioCopy.aiSkills, copyMarkdown: "Copier markdown", copied: "Copié", skillLibrary: "Bibliothèque de skills", categoriesLabel: "Catégories de skills" },
    checklists: { ...englishStudioCopy.checklists, copied: "Copié", menu: "Menu checklist", sections: "sections", steps: "étapes", structureDetail: (sections, steps) => `${sections} sections, ${steps} étapes imbriquées, copiables en markdown.` },
    preferences: { ...englishStudioCopy.preferences, title: "Préférences", description: "Thème, police et layout pour ce Studio.", themeMode: "Mode thème", resolvedNow: "Actuel", pageLayout: "Layout page", navbarBehavior: "Comportement navbar", sidebarStyle: "Style sidebar", collapseMode: "Mode de réduction", restoreDefaults: "Restaurer les valeurs par défaut", themeOptions: { light: "Clair", system: "Système", dark: "Sombre" }, contentLayoutOptions: { centered: "Centré", "full-width": "Pleine largeur" }, navbarStyleOptions: { sticky: "Sticky", scroll: "Scroll" }, sidebarVariantOptions: { inset: "Inset", sidebar: "Sidebar", floating: "Floating" }, sidebarCollapsibleOptions: { icon: "Icon", offcanvas: "Offcanvas" } }
  })
};

function getStudioCopy(locale: string): StudioUiCopy {
  return studioCopyByLocale[locale] ?? englishStudioCopy;
}

function getLocalizedProfileItems(copy: StudioUiCopy): StudioProfileMenuItem[] {
  return profileMenuItems.map((item) => ({
    ...item,
    ...(copy.profileItems[item.id] ?? {})
  }));
}

function getLocalizedNavItem(item: StudioNavItem, copy: StudioUiCopy): StudioNavItem {
  return {
    ...item,
    title: copy.navItems[item.id] ?? item.title,
    subItems: item.subItems?.map((subItem) => getLocalizedNavItem(subItem, copy))
  };
}

function getLocalizedNavGroups(copy: StudioUiCopy): StudioNavGroup[] {
  return navGroups.map((group) => ({
    ...group,
    label: copy.navLabel,
    items: group.items.map((item) => getLocalizedNavItem(item, copy))
  }));
}

function getLocalizedRouteDefinitions(copy: StudioUiCopy): Record<StudioRouteId, StudioRoute> {
  const localized = { ...routeDefinitions };

  (Object.entries(copy.routes) as Array<[StudioRouteId, StudioRouteCopy | undefined]>).forEach(([routeId, routeCopy]) => {
    if (!routeCopy || !localized[routeId]) return;
    localized[routeId] = {
      ...localized[routeId],
      ...routeCopy
    };
  });

  return localized;
}

function isSameLayoutPreference(a: StudioLayoutPreference, b: StudioLayoutPreference): boolean {
  return a.contentLayout === b.contentLayout
    && a.navbarStyle === b.navbarStyle
    && a.sidebarVariant === b.sidebarVariant
    && a.sidebarCollapsible === b.sidebarCollapsible;
}

function isStudioThemeSetting(value: unknown): value is StudioThemeSetting {
  return value === "light" || value === "dark" || value === "system";
}

function isStudioFont(value: unknown): value is StudioFont {
  return fontOptions.some((option) => option.value === value);
}

function isStudioContentLayout(value: unknown): value is StudioContentLayout {
  return value === "centered" || value === "full-width";
}

function isStudioNavbarStyle(value: unknown): value is StudioNavbarStyle {
  return value === "sticky" || value === "scroll";
}

function isStudioSidebarVariant(value: unknown): value is StudioSidebarVariant {
  return value === "inset" || value === "sidebar" || value === "floating";
}

function isStudioSidebarCollapsible(value: unknown): value is StudioSidebarCollapsible {
  return value === "icon" || value === "offcanvas";
}

function resolveStudioTheme(setting: StudioThemeSetting): StudioResolvedTheme {
  if (typeof window === "undefined") return setting === "dark" ? "dark" : "light";
  if (setting === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return setting;
}

function readInitialThemeSetting(): StudioThemeSetting {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(STUDIO_THEME_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as { theme_setting?: unknown } : null;
    if (isStudioThemeSetting(parsed?.theme_setting)) return parsed.theme_setting;
  } catch {
    // ignore malformed persisted preferences
  }

  return "system";
}

function readInitialFont(): StudioFont {
  if (typeof window === "undefined") return "inter";

  try {
    const stored = localStorage.getItem(STUDIO_FONT_STORAGE_KEY);
    if (isStudioFont(stored)) return stored;
  } catch {
    // ignore unavailable storage
  }

  return "inter";
}

function readInitialLayoutPreference(): StudioLayoutPreference {
  if (typeof window === "undefined") return defaultLayoutPreference;

  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    const parsed = stored
      ? JSON.parse(stored) as Partial<Record<keyof StudioLayoutPreference, unknown>> & { version?: unknown }
      : null;
    const restoredPreference = {
      contentLayout: isStudioContentLayout(parsed?.contentLayout) ? parsed.contentLayout : defaultLayoutPreference.contentLayout,
      navbarStyle: isStudioNavbarStyle(parsed?.navbarStyle) ? parsed.navbarStyle : defaultLayoutPreference.navbarStyle,
      sidebarVariant: isStudioSidebarVariant(parsed?.sidebarVariant) ? parsed.sidebarVariant : defaultLayoutPreference.sidebarVariant,
      sidebarCollapsible: isStudioSidebarCollapsible(parsed?.sidebarCollapsible) ? parsed.sidebarCollapsible : defaultLayoutPreference.sidebarCollapsible
    };

    if (parsed?.version !== STUDIO_LAYOUT_PREFERENCE_VERSION && isSameLayoutPreference(restoredPreference, legacyLayoutPreference)) {
      return defaultLayoutPreference;
    }

    return restoredPreference;
  } catch {
    return defaultLayoutPreference;
  }
}

function applyThemePreference(setting: StudioThemeSetting): StudioResolvedTheme {
  const resolved = resolveStudioTheme(setting);
  document.documentElement.setAttribute("data-theme", resolved);
  try {
    localStorage.setItem(STUDIO_THEME_STORAGE_KEY, JSON.stringify({ theme: resolved, theme_setting: setting }));
  } catch {
    // ignore unavailable storage
  }
  return resolved;
}

function applyFontPreference(font: StudioFont): void {
  try {
    localStorage.setItem(STUDIO_FONT_STORAGE_KEY, font);
  } catch {
    // ignore unavailable storage
  }
}

function persistLayoutPreference(preference: StudioLayoutPreference): void {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ ...preference, version: STUDIO_LAYOUT_PREFERENCE_VERSION }));
  } catch {
    // ignore unavailable storage
  }
}

const defaultMetrics: StudioMetric[] = [
  {
    label: "Release Health",
    value: "96.4%",
    helper: "Successful deploys this window",
    badge: "+4.8%",
    trend: "up",
    icon: LuCheckCircle2
  },
  {
    label: "Open Incidents",
    value: "2",
    helper: "Gateway and partner queues",
    badge: "-3",
    trend: "down",
    icon: LuFlag
  },
  {
    label: "P95 Latency",
    value: "182ms",
    helper: "Edge and backend aggregate",
    badge: "-28ms",
    trend: "up",
    icon: LuGauge
  },
  {
    label: "Flag Coverage",
    value: "38",
    helper: "Tenant and segment rules",
    badge: "+6",
    trend: "up",
    icon: LuSlidersHorizontal
  }
];

function getStudioFlow(flowId: StudioFlowId): StudioFlow {
  return studioFlows.find((flow) => flow.id === flowId) ?? studioFlows[0];
}

function flowMetrics(flowId: StudioFlowId): StudioMetric[] {
  const flow = getStudioFlow(flowId);
  if (flow.architectureDemo) {
    const views = flow.architectureDemo.views.length > 0
      ? flow.architectureDemo.views
      : [{ nodes: flow.architectureDemo.nodes, edges: flow.architectureDemo.edges }];
    const nodeKinds = new Set(views.flatMap((view) => view.nodes.map((node) => node.kind)));
    const edgeTypes = new Set(views.flatMap((view) => view.edges.map((edge) => edge.type)));
    const familyCount = new Set(flow.architectureDemo.views.map((view) => view.family)).size;
    return [
      { label: "Demo views", value: `${flow.architectureDemo.views.length}`, helper: "React Flow example modes", badge: "views", trend: "up", icon: LuLayoutDashboard },
      { label: "Families", value: `${familyCount}`, helper: "Overview, layout, architecture", badge: "menu", trend: "up", icon: LuFilter },
      { label: "Node shapes", value: `${nodeKinds.size}`, helper: "Built-in and custom nodes", badge: "shape", trend: "up", icon: LuBoxes },
      { label: "Edge types", value: `${edgeTypes.size}`, helper: "Default, straight, step, smoothstep, bezier", badge: "edge", trend: "up", icon: LuWorkflow },
    ];
  }
  return [
    { label: "Flow steps", value: `${flow.steps.length}`, helper: "Ordered checkpoints", badge: "url", trend: "up", icon: LuWorkflow },
    { label: "Artifacts", value: `${flow.artifacts.length}`, helper: "Reusable handoff outputs", badge: "share", trend: "up", icon: LuClipboardList },
    { label: "CV signals", value: `${flow.cvSignals.length}`, helper: "Proof points for interviews", badge: "proof", trend: "up", icon: LuBriefcase },
    { label: "Use case", value: "1", helper: "Office example included", badge: "human", trend: "up", icon: LuUsers }
  ];
}

const routeMetrics: Record<StudioRouteId, StudioMetric[]> = {
  welcome: [],
  default: defaultMetrics,
  crm: [
    { label: "Open Pipeline", value: "$84.2k", helper: "Weighted active deals", badge: "+8.4%", trend: "up", icon: LuBarChart },
    { label: "New Leads", value: "328", helper: "Inbound this month", badge: "+14%", trend: "up", icon: LuUserPlus },
    { label: "Win Rate", value: "42%", helper: "Closed won opportunities", badge: "+3.1%", trend: "up", icon: LuGauge },
    { label: "Follow-ups", value: "19", helper: "Tasks due today", badge: "-6%", trend: "down", icon: LuListTodo }
  ],
  finance: [
    { label: "Net Worth", value: "$128.4k", helper: "Across all tracked accounts", badge: "+5.8%", trend: "up", icon: LuBanknote },
    { label: "Monthly Cash Flow", value: "$4,860", helper: "Income after expenses", badge: "+9.2%", trend: "up", icon: LuLineChart },
    { label: "Savings Rate", value: "37%", helper: "Current month progress", badge: "+2.7%", trend: "up", icon: LuWaves },
    { label: "Upcoming Bills", value: "$940", helper: "Next 14 days", badge: "-4%", trend: "down", icon: LuCreditCard }
  ],
  analytics: [
    { label: "Visitors", value: "92.4k", helper: "Total sessions", badge: "+18%", trend: "up", icon: LuGauge },
    { label: "Conversion", value: "7.8%", helper: "Site to signup", badge: "+1.4%", trend: "up", icon: LuLineChart },
    { label: "Bounce Rate", value: "31%", helper: "Quality improved", badge: "-5%", trend: "up", icon: LuArrowUpDown },
    { label: "Realtime", value: "642", helper: "People active now", badge: "+22%", trend: "up", icon: LuUsers }
  ],
  productivity: [
    { label: "Focus Time", value: "5h 20m", helper: "Deep work today", badge: "+42m", trend: "up", icon: LuListTodo },
    { label: "Tasks Done", value: "18", helper: "Across active projects", badge: "+6", trend: "up", icon: LuCheck },
    { label: "Meetings", value: "4", helper: "Remaining today", badge: "-1", trend: "up", icon: LuCalendarDays },
    { label: "Notes", value: "27", helper: "Captured this week", badge: "+9", trend: "up", icon: LuFileText }
  ],
  ecommerce: [
    { label: "Store Revenue", value: "$42.8k", helper: "This month", badge: "+12%", trend: "up", icon: LuShoppingBag },
    { label: "Orders", value: "1,284", helper: "All channels", badge: "+8%", trend: "up", icon: LuClipboardList },
    { label: "AOV", value: "$74.20", helper: "Average order value", badge: "+3%", trend: "up", icon: LuBadgeDollarSign },
    { label: "Stock Alerts", value: "12", helper: "Need restocking", badge: "-4", trend: "up", icon: LuBoxes }
  ],
  academy: [
    { label: "Active Students", value: "1,048", helper: "Across all programs", badge: "+6%", trend: "up", icon: LuGraduationCap },
    { label: "Assignments", value: "214", helper: "Submitted this week", badge: "+18", trend: "up", icon: LuBookOpenCheck },
    { label: "Avg. Grade", value: "86%", helper: "Latest assessment", badge: "+4%", trend: "up", icon: LuGauge },
    { label: "Events", value: "7", helper: "Upcoming this week", badge: "+2", trend: "up", icon: LuCalendarDays }
  ],
  logistics: [
    { label: "Shipments", value: "428", helper: "Currently in transit", badge: "+11%", trend: "up", icon: LuBoxes },
    { label: "On-time Rate", value: "96.2%", helper: "Rolling 30 days", badge: "+1.8%", trend: "up", icon: LuGauge },
    { label: "Delayed", value: "14", helper: "Needs attention", badge: "-9", trend: "up", icon: LuBell },
    { label: "Warehouses", value: "8", helper: "Healthy capacity", badge: "+2", trend: "up", icon: LuDatabase }
  ],
  infrastructure: [
    { label: "Services", value: "42", helper: "Production workloads", badge: "+5", trend: "up", icon: LuServer },
    { label: "Deploys", value: "128", helper: "Last 7 days", badge: "+23%", trend: "up", icon: LuGithub },
    { label: "Incidents", value: "2", helper: "Open investigations", badge: "-3", trend: "up", icon: LuHelpCircle },
    { label: "Uptime", value: "99.98%", helper: "Platform average", badge: "+0.2%", trend: "up", icon: LuGauge }
  ],
  email: [
    { label: "Unread", value: "7", helper: "Messages that still need review", badge: "+3", trend: "up", icon: LuMailOpen },
    { label: "Pinned", value: "4", helper: "Kept at the top of the inbox", badge: "+1", trend: "up", icon: LuPin },
    { label: "Priority", value: "3", helper: "Marked for same-day reply", badge: "-2", trend: "up", icon: LuFlag },
    { label: "Drafts", value: "2", helper: "Replies prepared but not sent", badge: "+2", trend: "up", icon: LuReply }
  ],
  chat: [
    { label: "Open Threads", value: "24", helper: "Across inbox and channels", badge: "+5", trend: "up", icon: LuMessageSquare },
    { label: "Mentions", value: "3", helper: "Waiting for direct response", badge: "+1", trend: "up", icon: LuTag },
    { label: "Snoozed", value: "2", helper: "Deferred conversations", badge: "-1", trend: "up", icon: LuAlarmClock },
    { label: "Avg. Reply", value: "4m", helper: "Median response time today", badge: "+18%", trend: "up", icon: LuGauge }
  ],
  "ai-agent-setup": [
    { label: "Setup notes", value: `${studioNotes.length}`, helper: "Machine, AI OS, and research notes", badge: "+AI OS", trend: "up", icon: LuBookOpenCheck },
    { label: "Agent tools", value: "5", helper: "NotebookLM, GPT, Claude, Codex, Antigravity", badge: "ready", trend: "up", icon: LuSparkles },
    { label: "Prompt cards", value: "3", helper: "Daily, weekly, and tool routing", badge: "copy", trend: "up", icon: LuCommand },
    { label: "Safety checks", value: "6", helper: "Credential and workflow guardrails", badge: "stable", trend: "up", icon: LuLock }
  ],
  "ai-skills": [
    { label: "Skills", value: `${studioAiSkills.length}`, helper: "Reusable markdown prompts", badge: "copy", trend: "up", icon: LuSparkles },
    { label: "Engineering", value: `${studioAiSkills.filter((skill) => skill.category === "engineering").length}`, helper: "Code, frontend, backend, specs", badge: "core", trend: "up", icon: LuServer },
    { label: "Learning", value: `${studioAiSkills.filter((skill) => skill.category === "learning").length}`, helper: "Daily AI practice and source-backed study", badge: "daily", trend: "up", icon: LuBookOpenCheck },
    { label: "Strategy", value: `${studioAiSkills.filter((skill) => skill.category === "strategy").length}`, helper: "AI OS and career leverage", badge: "direction", trend: "up", icon: LuMapPin }
  ],
  "delivery-checklists": [
    { label: "Checklists", value: `${studioWorkflowChecklists.length}`, helper: "Task, AI learning, release, rollout", badge: "nested", trend: "up", icon: LuClipboardList },
    { label: "Sections", value: `${studioWorkflowChecklists.reduce((total, checklist) => total + checklist.sections.length, 0)}`, helper: "Reusable operating gates", badge: "mapped", trend: "up", icon: LuListTodo },
    { label: "Steps", value: `${studioWorkflowChecklists.reduce((total, checklist) => total + checklist.sections.reduce((sum, section) => sum + section.steps.length, 0), 0)}`, helper: "Parent checklist items", badge: "ready", trend: "up", icon: LuCheckCircle2 },
    { label: "AI plan", value: "90 days", helper: "Setup, work, career, life", badge: "compound", trend: "up", icon: LuFlag }
  ],
  "flow-system-design": flowMetrics("system-design"),
  "flow-architecture-decision": flowMetrics("architecture-decision"),
  "flow-incident-response": flowMetrics("incident-response"),
  "flow-release-readiness": flowMetrics("release-readiness"),
  "flow-ai-delivery": flowMetrics("ai-delivery"),
  "flow-portfolio-story": flowMetrics("portfolio-story"),
  "flow-react-flow-architecture-demo": flowMetrics("react-flow-architecture-demo"),
  "flow-react-flow-system-blueprint": flowMetrics("react-flow-system-blueprint"),
  calendar: [
    { label: "Today", value: "6", helper: "Events on the schedule", badge: "+2", trend: "up", icon: LuCalendarDays },
    { label: "Focus Blocks", value: "3h", helper: "Protected engineering time", badge: "+45m", trend: "up", icon: LuAlarmClock },
    { label: "Conflicts", value: "1", helper: "Needs a decision", badge: "-2", trend: "up", icon: LuBell },
    { label: "Available", value: "2.5h", helper: "Open booking capacity", badge: "+30m", trend: "up", icon: LuGauge }
  ],
  kanban: [
    { label: "Todo", value: "8", helper: "Ready for pickup", badge: "+2", trend: "up", icon: LuListTodo },
    { label: "In Progress", value: "5", helper: "Actively moving", badge: "+1", trend: "up", icon: LuKanbanSquare },
    { label: "Done", value: "14", helper: "Completed this sprint", badge: "+6", trend: "up", icon: LuCheckCircle2 },
    { label: "Blocked", value: "2", helper: "Needs escalation", badge: "-1", trend: "up", icon: LuFlag }
  ],
  invoice: [
    { label: "Subtotal", value: "$1,670", helper: "Current invoice draft", badge: "+2 lines", trend: "up", icon: LuBadgeDollarSign },
    { label: "Line Items", value: "2", helper: "Services captured", badge: "ready", trend: "up", icon: LuClipboardList },
    { label: "Tax", value: "$0", helper: "No tax applied", badge: "0%", trend: "up", icon: LuCreditCard },
    { label: "Due In", value: "14d", helper: "Payment window", badge: "net 14", trend: "up", icon: LuCalendarDays }
  ],
  users: [
    { label: "Active", value: "64", helper: "Enabled accounts", badge: "+4", trend: "up", icon: LuUsers },
    { label: "Pending", value: "7", helper: "Invites waiting", badge: "+2", trend: "up", icon: LuUserPlus },
    { label: "Suspended", value: "2", helper: "Access paused", badge: "-1", trend: "up", icon: LuLock },
    { label: "Teams", value: "6", helper: "Mapped departments", badge: "+1", trend: "up", icon: LuBriefcase }
  ],
  roles: [
    { label: "Roles", value: "3", helper: "Admin, Editor, Viewer", badge: "stable", trend: "up", icon: LuLock },
    { label: "Permissions", value: "18", helper: "Grouped access rules", badge: "+3", trend: "up", icon: LuSlidersHorizontal },
    { label: "Coverage", value: "68", helper: "Users with assigned roles", badge: "100%", trend: "up", icon: LuUsers },
    { label: "Reviews", value: "4", helper: "Quarterly checks due", badge: "+1", trend: "up", icon: LuCheck }
  ],
  "auth-login-v1": [
    { label: "Sessions", value: "128", helper: "Active browser sessions", badge: "+12", trend: "up", icon: LuFingerprint },
    { label: "MFA", value: "82%", helper: "Protected accounts", badge: "+5%", trend: "up", icon: LuLock },
    { label: "Trusted", value: "41", helper: "Recognized devices", badge: "+6", trend: "up", icon: LuMonitor },
    { label: "Resets", value: "3", helper: "Password reset checks", badge: "-2", trend: "up", icon: LuRotateCw }
  ],
  "auth-login-v2": [
    { label: "Magic Links", value: "29", helper: "Issued today", badge: "+8", trend: "up", icon: LuLink },
    { label: "Sessions", value: "116", helper: "Active browser sessions", badge: "+9", trend: "up", icon: LuFingerprint },
    { label: "MFA", value: "84%", helper: "Protected accounts", badge: "+7%", trend: "up", icon: LuLock },
    { label: "Blocked", value: "2", helper: "Suspicious attempts", badge: "-4", trend: "up", icon: LuFlag }
  ],
  "auth-register-v1": [
    { label: "Invites", value: "18", helper: "Open registration links", badge: "+5", trend: "up", icon: LuUserPlus },
    { label: "Completed", value: "12", helper: "Profiles finished", badge: "+4", trend: "up", icon: LuCheckCircle2 },
    { label: "Workspaces", value: "6", helper: "Created this week", badge: "+2", trend: "up", icon: LuBriefcase },
    { label: "Queued Mail", value: "12", helper: "Welcome emails ready", badge: "+4", trend: "up", icon: LuMail }
  ],
  "auth-register-v2": [
    { label: "Invites", value: "21", helper: "Open registration links", badge: "+7", trend: "up", icon: LuUserPlus },
    { label: "Profiles", value: "15", helper: "Submitted this week", badge: "+5", trend: "up", icon: LuUser },
    { label: "Teams", value: "4", helper: "Workspace mappings", badge: "+1", trend: "up", icon: LuUsers },
    { label: "Review", value: "3", helper: "Needs admin approval", badge: "-2", trend: "up", icon: LuCheck }
  ],
  "legacy-default": defaultMetrics,
  "legacy-crm": defaultMetrics,
  "legacy-finance": defaultMetrics,
  "legacy-analytics": defaultMetrics
};

function createFlowRouteDefinition(
  routeId: StudioFlowRouteId,
  flowId: StudioFlowId,
  panels: string[],
  timeline: string[]
): StudioRoute {
  const flow = getStudioFlow(flowId);
  return {
    id: routeId,
    title: flow.title,
    description: flow.summary,
    kind: "flows",
    icon: LuWorkflow,
    badge: "new",
    metrics: routeMetrics[routeId],
    panels,
    timeline
  };
}

function createAuthRouteDefinition(
  routeId: Extract<StudioRouteId, `auth-${string}`>,
  title: string,
  description: string,
  panels: string[],
  timeline: string[]
): StudioRoute {
  return {
    id: routeId,
    title,
    description,
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics[routeId],
    panels,
    timeline
  };
}

const routeDefinitions: Record<StudioRouteId, StudioRoute> = {
  welcome: {
    id: "welcome",
    title: "Welcome",
    description: "A quiet starting point for the personal Studio: working notes, reusable workflows, and the public profile links I reach for most.",
    kind: "welcome",
    icon: LuSmile,
    metrics: routeMetrics.welcome,
    panels: ["Start here", "Useful links", "Studio routes"],
    timeline: ["Open the right workspace", "Keep context close", "Move from idea to proof"]
  },
  default: {
    id: "default",
    title: "Engineering Ops",
    description: "Release health, traffic quality, rollout control, component inventory, and operational workstreams.",
    kind: "default",
    icon: LuLayoutDashboard,
    metrics: routeMetrics.default,
    panels: ["Release Signal", "Component Inventory", "System Workstreams"],
    timeline: ["Gateway rollback criteria reviewed", "Feature flag audit completed", "PostHog anomaly window closed"]
  },
  crm: {
    id: "crm",
    title: "CRM",
    description: "Stakeholder follow-ups, delivery pipeline notes, and opportunity health in the Studio shell.",
    kind: "dashboard",
    icon: LuBarChart,
    metrics: routeMetrics.crm,
    panels: ["Pipeline Activity", "Task Reminders", "Opportunities"],
    timeline: ["Lead scored by AI", "Proposal follow-up due", "Enterprise deal moved to negotiation"]
  },
  finance: {
    id: "finance",
    title: "Personal Finances",
    description: "Accounts, transactions, and balance distribution with functional tabs.",
    kind: "finance",
    icon: LuBanknote,
    metrics: routeMetrics.finance,
    panels: ["Transactions Overview", "Balance Distribution", "Upcoming Transactions"],
    timeline: ["Updated 5 min ago", "Wallet synced", "Export prepared"]
  },
  analytics: {
    id: "analytics",
    title: "Hello, Aiy",
    description: "Monitor traffic, engagement, and conversion performance in one view.",
    kind: "analytics",
    icon: LuGauge,
    metrics: routeMetrics.analytics,
    panels: ["Traffic Quality", "Realtime Visitors", "Top Traffic Sources"],
    timeline: ["Realtime audience refreshed", "Conversion goal updated", "Top page changed"]
  },
  productivity: {
    id: "productivity",
    title: "Good morning, Arham.",
    description: "Tasks, projects, focus time, and weekly planning blocks.",
    kind: "productivity",
    icon: LuListTodo,
    metrics: routeMetrics.productivity,
    panels: ["Tasks Section", "Projects Section", "Quick Actions"],
    timeline: ["Focus block started", "Project status changed", "Weekly summary generated"]
  },
  ecommerce: {
    id: "ecommerce",
    title: "Store Overview",
    description: "Revenue, inventory, traffic sources, and recent orders.",
    kind: "ecommerce",
    icon: LuShoppingBag,
    metrics: routeMetrics.ecommerce,
    panels: ["Store Traffic", "Top Products", "Recent Orders"],
    timeline: ["New order imported", "Inventory alert cleared", "Traffic source updated"]
  },
  academy: {
    id: "academy",
    title: "Academy Dashboard",
    description: "Class schedule, assignment status, and performance highlights.",
    kind: "academy",
    icon: LuGraduationCap,
    metrics: routeMetrics.academy,
    panels: ["Class Schedule", "Assignment Status", "Upcoming Events"],
    timeline: ["New announcement drafted", "Gradebook synced", "Assignment added"]
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    description: "Shipment routing, delivery states, and warehouse capacity.",
    kind: "logistics",
    icon: LuBoxes,
    metrics: routeMetrics.logistics,
    panels: ["Shipment Route Map", "Shipment List", "Delivery Details"],
    timeline: ["Route recalculated", "Driver checked in", "Warehouse capacity updated"]
  },
  infrastructure: {
    id: "infrastructure",
    title: "Infrastructure",
    description: "Project environments, deploys, incidents, and uptime signals.",
    kind: "infrastructure",
    icon: LuServer,
    badge: "new",
    metrics: routeMetrics.infrastructure,
    panels: ["Project Environments", "Production Services", "Incident Ledger"],
    timeline: ["Production deploy passed", "Preview environment created", "Alert acknowledged"]
  },
  email: {
    id: "email",
    title: "Email",
    description: "Inbox, pinned messages, selected thread, attachments, and reply composer inside the Studio shell.",
    kind: "mail",
    icon: LuMail,
    metrics: routeMetrics.email,
    panels: ["Inbox", "Conversation", "Composer"],
    timeline: ["Invoice email opened", "Newsletter archived", "Follow-up drafted"]
  },
  chat: {
    id: "chat",
    title: "Chat",
    description: "Conversation inbox with grouped threads, message composer, unread states, and contact profile.",
    kind: "chat",
    icon: LuMessageSquare,
    metrics: routeMetrics.chat,
    panels: ["Threads", "Conversation", "Profile"],
    timeline: ["Aiy sent a message", "Thread marked unread", "Attachment opened"]
  },
  "ai-agent-setup": {
    id: "ai-agent-setup",
    title: "AI Agent Setup",
    description: "Personal setup notes for my AI agent tools, MCP paths, and safe machine bootstrap.",
    kind: "ai-setup",
    icon: LuSparkles,
    badge: "new",
    metrics: routeMetrics["ai-agent-setup"],
    panels: ["Setup library", "Agent workflow", "Command runbook"],
    timeline: ["Skill library reviewed", "MCP install path captured", "Credential guardrail checked"]
  },
  "ai-skills": {
    id: "ai-skills",
    title: "AI Skills",
    description: "Reusable agent skills distilled from installed Codex, Claude, Gemini, Antigravity, and local skill libraries.",
    kind: "ai-skills",
    icon: LuSparkles,
    badge: "new",
    metrics: routeMetrics["ai-skills"],
    panels: ["Skill taxonomy", "Markdown preview", "Copy-ready prompt"],
    timeline: ["Installed skills inventoried", "Capability gaps mapped", "English and Vietnamese prompts prepared"]
  },
  "delivery-checklists": {
    id: "delivery-checklists",
    title: "Delivery Checklists",
    description: "Operating checklists from task intake through module work, release readiness, and rollout.",
    kind: "checklists",
    icon: LuClipboardList,
    badge: "new",
    metrics: routeMetrics["delivery-checklists"],
    panels: ["Task intake", "Module creation", "Release and rollout"],
    timeline: ["Ticket intake path mapped", "Module checklist nested", "Rollout phases captured"]
  },
  "flow-system-design": createFlowRouteDefinition("flow-system-design", "system-design", ["Problem frame", "Runtime map", "Failure modes"], ["Requirement frame set", "Data ownership mapped", "Evolution path documented"]),
  "flow-architecture-decision": createFlowRouteDefinition("flow-architecture-decision", "architecture-decision", ["Decision scope", "Option matrix", "Risk gates"], ["Invariants listed", "Options compared", "Decision note ready"]),
  "flow-incident-response": createFlowRouteDefinition("flow-incident-response", "incident-response", ["Signal", "Mitigation", "Postmortem"], ["Signal confirmed", "Blast radius contained", "Follow-up owners assigned"]),
  "flow-release-readiness": createFlowRouteDefinition("flow-release-readiness", "release-readiness", ["Scope", "Verification", "Rollout decision"], ["Scope checked", "Analytics and SEO reviewed", "Rollback trigger named"]),
  "flow-ai-delivery": createFlowRouteDefinition("flow-ai-delivery", "ai-delivery", ["Task brief", "Context pack", "Verification"], ["Boundaries set", "Focused diff reviewed", "Handoff prepared"]),
  "flow-portfolio-story": createFlowRouteDefinition("flow-portfolio-story", "portfolio-story", ["Context", "Trade-offs", "Impact"], ["Context captured", "Impact evidence selected", "Story draft shaped"]),
  "flow-react-flow-architecture-demo": createFlowRouteDefinition("flow-react-flow-architecture-demo", "react-flow-architecture-demo", ["Node shapes", "Edge language", "Architecture zones"], ["Node primitives displayed", "Architecture shapes mapped", "Canvas controls enabled"]),
  "flow-react-flow-system-blueprint": createFlowRouteDefinition("flow-react-flow-system-blueprint", "react-flow-system-blueprint", ["Full blueprint", "Focused views", "Production vocabulary"], ["DNS path mapped", "Runtime and storage linked", "Media fan-out modeled"]),
  calendar: {
    id: "calendar",
    title: "Calendar",
    description: "Event calendar with day blocks and meeting density.",
    kind: "calendar",
    icon: LuCalendarDays,
    metrics: routeMetrics.calendar,
    panels: ["Month View", "Upcoming Events", "Availability"],
    timeline: ["Design review moved", "Focus block added", "Release check scheduled"]
  },
  kanban: {
    id: "kanban",
    title: "Kanban",
    description: "Task board with columns, cards, status, and review-ready engineering work.",
    kind: "kanban",
    icon: LuKanbanSquare,
    metrics: routeMetrics.kanban,
    panels: ["Todo", "In progress", "Done"],
    timeline: ["Task moved to review", "Bug triaged", "Release note drafted"]
  },
  invoice: {
    id: "invoice",
    title: "Invoice",
    description: "Invoice form and preview surface with export action.",
    kind: "invoice",
    icon: LuClipboardList,
    metrics: routeMetrics.invoice,
    panels: ["Client", "Line Items", "Preview"],
    timeline: ["Invoice preview updated", "Tax recalculated", "PDF export ready"]
  },
  users: {
    id: "users",
    title: "Users",
    description: "Users table with search, roles, and account status.",
    kind: "users",
    icon: LuUsers,
    metrics: routeMetrics.users,
    panels: ["Directory", "Access", "Invitations"],
    timeline: ["User invited", "Role updated", "Account suspended"]
  },
  roles: {
    id: "roles",
    title: "Roles",
    description: "Role cards and permission groups.",
    kind: "roles",
    icon: LuLock,
    metrics: routeMetrics.roles,
    panels: ["Admin", "Editor", "Viewer"],
    timeline: ["Permission changed", "Role reviewed", "Access report exported"]
  },
  "auth-login-v1": createAuthRouteDefinition("auth-login-v1", "Login v1", "Authentication route preview opened inside Studio instead of a new project.", ["Credentials", "Social auth", "Security"], ["Session created", "Password reset checked", "Device trusted"]),
  "auth-login-v2": createAuthRouteDefinition("auth-login-v2", "Login v2", "Alternate authentication layout with the same shell behavior.", ["Credentials", "Magic link", "Security"], ["Magic link generated", "Session checked", "Device trusted"]),
  "auth-register-v1": {
    id: "auth-register-v1",
    title: "Register v1",
    description: "Registration screen preview with plan and role fields.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics["auth-register-v1"],
    panels: ["Account", "Profile", "Invite"],
    timeline: ["Invite accepted", "Profile created", "Welcome email queued"]
  },
  "auth-register-v2": {
    id: "auth-register-v2",
    title: "Register v2",
    description: "Second registration variant with workspace, invite, and access-review states.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics["auth-register-v2"],
    panels: ["Account", "Workspace", "Invite"],
    timeline: ["Workspace created", "Invite accepted", "Welcome email queued"]
  },
  "legacy-default": {
    id: "legacy-default",
    title: "Default V1",
    description: "Legacy dashboard variant kept accessible from the source navigation.",
    kind: "legacy",
    icon: LuLayoutDashboard,
    metrics: routeMetrics["legacy-default"],
    panels: ["Proposal Sections", "Legacy Chart", "Queue"],
    timeline: ["Legacy chart refreshed", "Proposal section reviewed", "Queue exported"]
  },
  "legacy-crm": {
    id: "legacy-crm",
    title: "CRM V1",
    description: "Legacy CRM variant kept under the collapsible dashboard group.",
    kind: "legacy",
    icon: LuBarChart,
    metrics: routeMetrics.crm,
    panels: ["Overview Cards", "Recent Leads", "Insight Cards"],
    timeline: ["Lead imported", "Opportunity updated", "Campaign reviewed"]
  },
  "legacy-finance": {
    id: "legacy-finance",
    title: "Finance V1",
    description: "Legacy finance view with cash-flow and spending cards.",
    kind: "legacy",
    icon: LuBanknote,
    metrics: routeMetrics.finance,
    panels: ["Cash Flow", "Spending Breakdown", "Income Reliability"],
    timeline: ["Cash flow updated", "Budget reviewed", "Account synced"]
  },
  "legacy-analytics": {
    id: "legacy-analytics",
    title: "Analytics V1",
    description: "Legacy analytics view with drivers, risk ledger, and action queue.",
    kind: "legacy",
    icon: LuGauge,
    metrics: routeMetrics.analytics,
    panels: ["Drivers Coverage", "Risk Ledger", "Action Queue"],
    timeline: ["Risk updated", "Driver reviewed", "Queue reordered"]
  }
};

const studioNavIcons: Record<StudioNavIconKey, IconType> = {
  smile: LuSmile,
  sparkles: LuSparkles,
  command: LuCommand,
  "clipboard-list": LuClipboardList,
  workflow: LuWorkflow
};

function hydrateStudioNavItem(item: StudioNavCatalogItem): StudioNavItem {
  return {
    ...item,
    icon: item.icon ? studioNavIcons[item.icon] : undefined,
    subItems: item.subItems?.map(hydrateStudioNavItem)
  };
}

const navGroups: StudioNavGroup[] = studioCatalog.navGroups.map((group) => ({
  ...group,
  items: group.items.map(hydrateStudioNavItem)
}));

const studioMails: StudioMail[] = [
  {
    id: "mail-incident-rollback",
    from: { name: "Olivia Rhye", email: "olivia.rhye@railway.co" },
    to: ["Nguyen Le Phong"],
    cc: ["Platform Team"],
    subject: "Staging gateway still returns 502 after rollback",
    body: "Hi Phong,\n\nThe latest rollback finished, but the staging gateway is still returning intermittent 502s. API traffic looks healthy; only the web container readiness probe keeps failing.\n\nCan you check whether the ingress path and service selector still match after the deployment rollback?\n\nThanks,\nOlivia",
    receivedAt: "Just now",
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["incident", "staging", "gateway"],
    attachments: [
      { id: "readiness-log", name: "readiness-log.txt", size: "42 KB", kind: "log" },
      { id: "ingress-diff", name: "ingress-diff.yaml", size: "18 KB", kind: "yaml" }
    ],
    messageCount: 5
  },
  {
    id: "mail-feature-flag",
    from: { name: "Drew Cano", email: "drew.cano@atlasworks.co" },
    to: ["Nguyen Le Phong"],
    subject: "Feature flag rollout plan for enterprise tenants",
    body: "Can we roll the new dashboard to three enterprise tenants first, then expand by percentage after the support window? I want the rollout notes to include rollback criteria and PostHog checks.",
    receivedAt: "12 min ago",
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["feature flag", "enterprise"],
    attachments: [{ id: "rollout-plan", name: "rollout-plan.md", size: "9 KB", kind: "doc" }],
    messageCount: 3
  },
  {
    id: "mail-certificate",
    from: { name: "Lana Steiner", email: "lana.steiner@monsoonanalytics.in" },
    to: ["Nguyen Le Phong"],
    cc: ["Security Review"],
    subject: "Partner certificate rotation confirmation",
    body: "The partner has issued a new certificate for the mTLS channel. Their old certificate expires next Friday. Please confirm whether we can overlap both certificates during the cutover window.",
    receivedAt: "1h ago",
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["mTLS", "security"],
    attachments: [{ id: "partner-cert", name: "partner-cert.pem", size: "3 KB", kind: "cert" }]
  },
  {
    id: "mail-observability",
    from: { name: "Andi Lane", email: "andi.lane@ledgerloop.io" },
    to: ["Nguyen Le Phong"],
    subject: "PostHog anomaly review after mobile release",
    body: "The mobile release looks stable overall, but checkout conversion dipped for one tenant after 10 AM. Can you review the event path and see whether this is a tracking gap or a product regression?",
    receivedAt: "Yesterday",
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: true,
    labels: ["PostHog", "release"]
  },
  {
    id: "mail-draft-runbook",
    from: { name: "Nguyen Le Phong", email: "phongnguyen.itengineer@gmail.com" },
    to: ["Delivery Team"],
    subject: "Draft: production recovery checklist",
    body: "Drafting a shorter runbook for production recovery: identify changed release, verify health checks, inspect ingress and load balancer path, confirm database migration status, decide rollback or hotfix owner.",
    receivedAt: "Draft",
    folder: "drafts",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["runbook", "draft"]
  }
];

const studioConversations: StudioConversation[] = [
  {
    id: 1,
    group: "Pinned",
    name: "Olivia Rhye",
    subject: "Deployment pipeline failing on staging",
    preview: "502s started after the latest build. Rollback did not clear the readiness failure.",
    time: "Just now",
    isUnread: true,
    isOnline: true,
    unreadCount: 4,
    contact: {
      name: "Olivia Rhye",
      role: "Senior DevOps Engineer",
      company: "Railway Systems Inc.",
      email: "olivia.rhye@railway.co",
      phone: "+1 (415) 555-0123",
      website: "railway.co",
      location: "San Francisco, CA",
      timezone: "PDT (UTC-7)",
      status: "P0",
      qualifiedAt: "Mar 5, 2026",
      tags: ["DevOps", "Gateway", "Enterprise"]
    },
    messages: [
      { id: 101, side: "in", text: "We are seeing 502s on staging right after the latest build. Rollback finished, but health checks are still red.", time: "10 min ago" },
      { id: 102, side: "out", text: "Thanks, Olivia. I am checking deploy logs, service selectors, and the gateway routing config now.", time: "8 min ago" },
      { id: 103, side: "in", text: "API traffic looks fine. The web container keeps failing readiness probes.", time: "5 min ago" },
      { id: 104, side: "out", text: "Found a staging env mismatch on the web workload. I am applying the fix and will confirm once probes recover.", time: "3 min ago" }
    ]
  },
  {
    id: 2,
    group: "Pinned",
    name: "Phoenix Baker",
    subject: "Refund for order #8823 double charged",
    preview: "Payment retry created a duplicate transaction this morning.",
    time: "5m",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Phoenix Baker",
      role: "Operations Lead",
      company: "Meridian Retail Group",
      email: "phoenix.baker@meridianretail.com",
      phone: "+1 (312) 555-0184",
      website: "meridianretail.com",
      location: "Chicago, IL",
      timezone: "CDT (UTC-5)",
      status: "Partner",
      qualifiedAt: "Jan 18, 2026",
      tags: ["Billing", "Enterprise"]
    },
    messages: [
      { id: 201, side: "in", text: "I was charged twice for order #8823. One payment cleared on the 3rd and the duplicate posted this morning.", time: "5 min ago" },
      { id: 202, side: "out", text: "I can see both transactions. I am checking which one was attached to the invoice.", time: "4 min ago" },
      { id: 203, side: "out", text: "The duplicate was a retry from the old payment method. I started the refund and sent the receipt to billing.", time: "2 min ago" }
    ]
  },
  {
    id: 3,
    group: "Today",
    name: "Lana Steiner",
    subject: "Analytics dashboard 403 after role update",
    preview: "Exports work, but dashboard views reject the new custom role.",
    time: "8m",
    isUnread: true,
    isOnline: false,
    unreadCount: 2,
    contact: {
      name: "Lana Steiner",
      role: "Data Platform Lead",
      company: "Monsoon Analytics",
      email: "lana.steiner@monsoonanalytics.in",
      phone: "+91 98765 43210",
      website: "monsoonanalytics.in",
      location: "Bengaluru, India",
      timezone: "IST (UTC+5:30)",
      status: "Qualified",
      qualifiedAt: "Apr 2, 2026",
      tags: ["IAM", "Analytics", "High Value"]
    },
    messages: [
      { id: 301, side: "in", text: "I am getting a 403 on analytics dashboards since yesterday's role update. Clearing cache did not help.", time: "8 min ago" },
      { id: 302, side: "out", text: "I will compare your new role against the dashboard permission set.", time: "7 min ago" },
      { id: 303, side: "out", text: "Analytics Viewer was dropped from your custom role. I reattached it for the workspace.", time: "3 min ago" }
    ]
  },
  {
    id: 4,
    group: "Today",
    name: "Candice Wu",
    subject: "Bulk export times out near 60 percent",
    preview: "The full shipment history export hits a gateway timeout during peak.",
    time: "10:15 AM",
    isUnread: false,
    isOnline: false,
    unreadCount: 0,
    contact: {
      name: "Candice Wu",
      role: "Data Engineer",
      company: "Harbor Ops",
      email: "candice.wu@harborops.com",
      phone: "+1 (206) 555-0172",
      website: "harborops.com",
      location: "Seattle, WA",
      timezone: "PDT (UTC-7)",
      status: "Lead",
      qualifiedAt: "May 10, 2026",
      tags: ["Data", "Performance"]
    },
    messages: [
      { id: 401, side: "in", text: "The bulk export keeps timing out. It reaches about 60 percent and then throws a gateway error.", time: "10:15 AM" },
      { id: 402, side: "out", text: "I will queue it as an async export and email the download link once it finishes.", time: "10:12 AM" }
    ]
  },
  {
    id: 5,
    group: "Yesterday",
    name: "Drew Cano",
    subject: "Onboarding docs for new backend hire",
    preview: "Need repo access, staging credentials, and branch naming rules.",
    time: "Yesterday",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Drew Cano",
      role: "Engineering Manager",
      company: "AtlasWorks",
      email: "drew.cano@atlasworks.co",
      phone: "+1 (512) 555-0166",
      website: "atlasworks.co",
      location: "Austin, TX",
      timezone: "CDT (UTC-5)",
      status: "Partner",
      qualifiedAt: "Aug 3, 2025",
      tags: ["Onboarding", "Platform"]
    },
    messages: [
      { id: 501, side: "in", text: "We have a backend developer starting Monday. What is the best onboarding path for repo access and environment setup?", time: "Yesterday" },
      { id: 502, side: "out", text: "I will send the standard engineering checklist with staging access and repository conventions.", time: "Yesterday" }
    ]
  }
];

function createWorkstreamRow(
  name: string,
  id: string,
  status: string,
  billing: string,
  plan: string,
  joined: string,
  time: string,
  billingTone: "paid" | "pending" | "unpaid"
) {
  return { name, id, status, billing, plan, joined, time, billingTone };
}

const workstreamRows = [
  createWorkstreamRow("Gateway rollout guardrails", "REL-204", "Healthy", "Ready", "Platform", "20th June 2026", "at 09:40 AM", "paid"),
  createWorkstreamRow("Partner mTLS certificate overlap", "SEC-118", "Watching", "Review", "Security", "20th June 2026", "at 08:15 AM", "pending"),
  createWorkstreamRow("Feature flag tenant expansion", "FF-089", "Healthy", "Ready", "Rollout", "19th June 2026", "at 05:35 PM", "paid"),
  createWorkstreamRow("Bulk export async worker", "PERF-047", "Blocked", "Risk", "Backend", "19th June 2026", "at 02:12 PM", "unpaid"),
  createWorkstreamRow("PostHog release anomaly review", "OBS-066", "Queued", "Next", "Observability", "18th June 2026", "at 11:08 AM", "pending")
];

const dashboardKpis = [
  { title: "Runtime Flags", value: "38", description: "Rules across 30+ tenants", tone: "success" },
  { title: "Deploy Train", value: "12", description: "Services released this week", tone: "neutral" },
  { title: "Load Path", value: "4", description: "Ingress and LB checks watched", tone: "warning" },
  { title: "Runbooks", value: "9", description: "Recovery paths kept current", tone: "success" }
];

const aiWorkflowSteps = [
  {
    title: "Capture",
    detail: "Put facts, source documents, logs, and notes into NotebookLM or a focused Project before asking for judgment.",
    state: "ready"
  },
  {
    title: "Clarify",
    detail: "Use GPT to separate goal, assumptions, constraints, decision, and next action.",
    state: "active"
  },
  {
    title: "Challenge",
    detail: "Use Claude to review weak assumptions, architecture risk, edge cases, and communication clarity.",
    state: "required"
  },
  {
    title: "Execute and archive",
    detail: "Use Codex or Antigravity for bounded work, then save the prompt, artifact, verification, and lesson.",
    state: "next"
  }
];

function getAiWorkflowSteps(locale: string) {
  if (locale !== "vi") return aiWorkflowSteps;

  return [
    {
      title: "Thu thập nguồn",
      detail: "Đưa dữ kiện, tài liệu gốc, log và ghi chú vào NotebookLM hoặc một dự án riêng trước khi nhờ AI đưa ra nhận định.",
      state: "ready"
    },
    {
      title: "Làm rõ bài toán",
      detail: "Dùng GPT để tách mục tiêu, giả định, giới hạn, quyết định cần đưa ra và việc tiếp theo.",
      state: "active"
    },
    {
      title: "Phản biện",
      detail: "Dùng Claude để soi giả định yếu, rủi ro kiến trúc, trường hợp khó và độ rõ của cách trình bày.",
      state: "required"
    },
    {
      title: "Thực hiện và lưu lại",
      detail: "Dùng Codex hoặc Antigravity cho phần việc có ranh giới rõ, rồi lưu câu lệnh, kết quả, bằng chứng kiểm tra và bài học.",
      state: "next"
    }
  ];
}

const aiRuntimeTargets = ["NotebookLM", "GPT", "Claude", "Codex", "Antigravity"];

const releaseChecklist = [
  { title: "Verify feature flag default fallback", tag: "Rollout", done: true },
  { title: "Check ingress and load balancer route parity", tag: "Infra", done: true },
  { title: "Review PostHog adoption and anomaly window", tag: "Observability", done: false },
  { title: "Confirm rollback owner and cutover criteria", tag: "Release", done: false }
];

const componentInventory = [
  "Sidebar",
  "Topbar",
  "Metric cards",
  "Tabs",
  "Selects",
  "Buttons",
  "Badges",
  "Tables",
  "Charts",
  "Timeline",
  "Command palette",
  "Shadow island"
];

const distributionSegments = [
  { label: "Feature flags", value: 38, color: "#171717" },
  { label: "API contracts", value: 24, color: "#525252" },
  { label: "Infra checks", value: 18, color: "#a3a3a3" },
  { label: "Runbooks", value: 20, color: "#d4d4d4" }
];

const flatRouteResults = navGroups.flatMap((group) =>
  group.items.flatMap((item) => {
    if (item.subItems) return item.subItems.filter((subItem) => subItem.routeId);
    return item.routeId ? [item] : [];
  })
);
const visibleRouteIds = new Set(
  flatRouteResults
    .map((item) => item.routeId)
    .filter((routeId): routeId is StudioRouteId => Boolean(routeId))
);
const studioRouteIdSet = new Set<StudioRouteId>(studioCatalog.routeIds);
const studioDeepLinkRouteIdSet = new Set<StudioRouteId>(studioCatalog.deepLinkRouteIds);

function isLocationRouteId(candidate: string): candidate is StudioRouteId {
  const routeId = candidate as StudioRouteId;
  return studioRouteIdSet.has(routeId) && (visibleRouteIds.has(routeId) || studioDeepLinkRouteIdSet.has(routeId));
}

function routeHref(routeId: StudioRouteId): string {
  const flowId = flowIdFromRoute(routeId);
  const flowQuery = flowId ? `&flow=${encodeURIComponent(flowId)}` : "";
  return `?route=${encodeURIComponent(routeId)}${flowQuery}#${routeId}`;
}

function normalizeHash(hash: string): StudioRouteId {
  const candidate = hash.replace(/^#\/?/, "");
  return isLocationRouteId(candidate) ? candidate : DEFAULT_ROUTE;
}

function normalizeLocationRoute(): StudioRouteId {
  const params = new URLSearchParams(window.location.search);
  const flowId = params.get("flow");
  if (flowId && studioFlows.some((flow) => flow.id === flowId)) {
    const routeId = flowRouteId(flowId);
    if (isLocationRouteId(routeId)) return routeId;
  }

  const routeId = params.get("route");
  if (routeId && isLocationRouteId(routeId)) return routeId;

  return normalizeHash(window.location.hash);
}

function studioFlowHref(locale: string, flowId: StudioFlowId): string {
  const prefix = locale ? `/${locale}` : "";
  return `${prefix}${APP_ROUTE.STUDIO}${routeHref(flowRouteId(flowId))}`;
}

function trackStudioFlowSelect(routeId: StudioRouteId, source: StudioRouteActivationSource, previousRoute?: StudioRouteId): void {
  const flowId = flowIdFromRoute(routeId);
  if (!flowId) return;
  const flow = getStudioFlow(flowId);
  track("studio_flow_select", {
    flow_id: flow.id,
    group_id: flow.groupId,
    route_id: routeId,
    source,
    previous_route: previousRoute
  });
}

function profileHref(locale: string, href: string): string {
  if (href.startsWith("http") || href.endsWith(".pdf")) return href;
  const prefix = locale ? `/${locale}` : "";
  if (href === APP_ROUTE.HOME) return prefix || APP_ROUTE.HOME;
  if (href.startsWith("/#")) return `${prefix}${href}`;
  if (href.startsWith("/")) return `${prefix}${href}`;
  return href;
}

function isItemActive(item: StudioNavItem, activeRoute: StudioRouteId): boolean {
  if (item.routeId === activeRoute) return true;
  return item.subItems?.some((subItem) => subItem.routeId === activeRoute) ?? false;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusText(status: StudioNote["status"], copy: StudioUiCopy = englishStudioCopy): string {
  return copy.status[status];
}

function skillCategoryLabel(category: StudioAiSkill["category"] | "all", copy: StudioUiCopy = englishStudioCopy): string {
  return copy.categories[category];
}

function renderChecklistStepMarkdown(step: StudioChecklistStep, depth = 0): string {
  const indent = "  ".repeat(depth);
  const detail = step.detail ? ` - ${step.detail}` : "";
  const children = step.children?.length
    ? `\n${step.children.map((child) => renderChecklistStepMarkdown(child, depth + 1)).join("\n")}`
    : "";
  return `${indent}- [ ] ${step.label}${detail}${children}`;
}

function renderChecklistMarkdown(checklist: StudioWorkflowChecklist, copy: StudioUiCopy = englishStudioCopy): string {
  return [
    `# ${checklist.title}`,
    "",
    checklist.summary,
    "",
    `${copy.checklists.markdownUseWhen}: ${checklist.whenToUse}`,
    "",
    ...checklist.sections.flatMap((section) => [
      `## ${section.title}`,
      section.detail,
      "",
      ...section.steps.map((step) => renderChecklistStepMarkdown(step)),
      ""
    ])
  ].join("\n").trim();
}

function countChecklistSteps(steps: StudioChecklistStep[]): number {
  return steps.reduce((total, step) => total + 1 + countChecklistSteps(step.children ?? []), 0);
}

function SidebarGroup({
  group,
  activeRoute,
  expanded,
  collapsed,
  onActivate,
  onToggle
}: {
  group: StudioNavGroup;
  activeRoute: StudioRouteId;
  expanded: Record<string, boolean>;
  collapsed: boolean;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="sidebar-group" aria-label={group.label}>
      {!collapsed && <p className="sidebar-group-label">{group.label}</p>}
      <div className="sidebar-menu">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item, activeRoute);

          if (item.subItems) {
            const open = expanded[item.id] ?? active;
            return (
              <div className="sidebar-tree" key={item.id}>
                <button
                  className={`sidebar-menu-button${active ? " is-active" : ""}`}
                  type="button"
                  aria-expanded={open}
                  onClick={() => {
                    if (item.routeId) {
                      if (!open) onToggle(item.id);
                      onActivate(item.routeId, "sidebar");
                      return;
                    }
                    onToggle(item.id);
                  }}
                >
                  {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
                  <span>{item.title}</span>
                  <LuChevronRight className="sidebar-chevron" aria-hidden="true" />
                </button>
                {open && !collapsed && (
                  <div className="sidebar-submenu">
                    {item.subItems.map((subItem) => (
                      <a
                        key={subItem.id}
                        href={routeHref(subItem.routeId ?? DEFAULT_ROUTE)}
                        className={`sidebar-submenu-link${subItem.routeId === activeRoute ? " is-active" : ""}`}
                        onClick={(event) => {
                          event.preventDefault();
                          onActivate(subItem.routeId ?? DEFAULT_ROUTE, "sidebar");
                        }}
                      >
                        {subItem.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (item.disabled || !item.routeId) {
            return (
              <span key={item.id} className="sidebar-menu-button is-disabled" aria-disabled="true">
                {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
                <span>{item.title}</span>
                {item.badge && <span className={`sidebar-badge badge-${item.badge}`}>{item.badge}</span>}
              </span>
            );
          }

          return (
            <a
              key={item.id}
              href={routeHref(item.routeId)}
              className={`sidebar-menu-button${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onActivate(item.routeId ?? DEFAULT_ROUTE, "sidebar");
              }}
            >
              {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
              <span>{item.title}</span>
              {item.badge && <span className={`sidebar-badge badge-${item.badge}`}>{item.badge}</span>}
            </a>
          );
        })}
      </div>
    </section>
  );
}

function DashboardKpiStrip() {
  return (
    <section className="ops-kpi-strip" aria-label="Studio component metrics">
      {dashboardKpis.map((item) => (
        <article className={`ops-kpi-card tone-${item.tone}`} key={item.title}>
          <span>{item.title}</span>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </section>
  );
}

function ComponentInventoryCard() {
  return (
    <section className="card route-panel component-inventory" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Component Inventory</h2>
          <p>Static frontend primitives currently represented inside this Studio shell.</p>
        </div>
      </header>
      <div className="component-token-grid">
        {componentInventory.map((item) => (
          <span className="component-token" key={item}>{item}</span>
        ))}
      </div>
      <div className="component-samples" aria-label="Component samples">
        <button type="button" className="outline-button">Outline</button>
        <button type="button" className="primary-icon" aria-label="Send sample"><LuSend aria-hidden="true" /></button>
        <span className="soft-pill">Badge</span>
        <label className="check-row">
          <input type="checkbox" defaultChecked />
          <span>Checkbox</span>
        </label>
      </div>
    </section>
  );
}

function DistributionCard() {
  const gradient = distributionSegments.reduce<{ cursor: number; stops: string[] }>(
    (accumulator, segment) => {
      const start = accumulator.cursor;
      const end = start + segment.value * 3.6;
      return {
        cursor: end,
        stops: [...accumulator.stops, `${segment.color} ${start}deg ${end}deg`]
      };
    },
    { cursor: 0, stops: [] }
  ).stops.join(", ");
  const donutStyle = { background: `conic-gradient(${gradient})` } satisfies CSSProperties;

  return (
    <section className="card route-panel distribution-card" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Control Surface</h2>
          <p>Coverage by operational control type.</p>
        </div>
      </header>
      <div className="distribution-layout">
        <div className="donut-chart" style={donutStyle} aria-label="Control surface distribution">
          <span>100%</span>
        </div>
        <div className="distribution-list">
          {distributionSegments.map((segment) => (
            <div key={segment.label}>
              <span style={{ background: segment.color }} aria-hidden="true" />
              <p>{segment.label}</p>
              <strong>{segment.value}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReleaseChecklistCard() {
  return (
    <section className="card route-panel checklist-panel" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Release Checklist</h2>
          <p>Frontend-only stateful checklist for deployment readiness.</p>
        </div>
      </header>
      <div className="task-list">
        {releaseChecklist.map((task) => (
          <label key={task.title} className="check-row checklist-row">
            <input type="checkbox" defaultChecked={task.done} />
            <span>
              <strong>{task.title}</strong>
              <small>{task.tag}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

function MailRoutePage({ route }: { route: StudioRoute }) {
  const [selectedMailId, setSelectedMailId] = useState(studioMails[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const selectedMail = studioMails.find((mail) => mail.id === selectedMailId) ?? studioMails[0];
  const filteredMails = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return studioMails;
    return studioMails.filter((mail) =>
      [mail.from.name, mail.from.email, mail.subject, mail.body, ...mail.labels].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query]);
  const mailGroups = [
    { id: "pinned", title: "Pinned", items: filteredMails.filter((mail) => mail.isPinned) },
    { id: "inbox", title: "Inbox", items: filteredMails.filter((mail) => !mail.isPinned && mail.folder === "inbox") },
    { id: "drafts", title: "Drafts", items: filteredMails.filter((mail) => mail.folder === "drafts") }
  ].filter((group) => group.items.length > 0);

  return (
    <section className="route-page mail-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <a className="outline-button" href="mailto:phongnguyen.itengineer@gmail.com">
            <LuMail aria-hidden="true" />
            Compose
          </a>
          <button type="button" className="outline-button">
            <LuArchive aria-hidden="true" />
            Archive
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="mail-workbench card" data-studio-module="mail">
        <aside className="mail-list-pane" aria-label="Mail inbox">
          <div className="mail-pane-toolbar">
            <div>
              <h2>Inbox</h2>
              <p>{filteredMails.length} messages</p>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Filter mail"><LuFilter aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Refresh mail"><LuRotateCw aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="More mail actions"><LuMoreVertical aria-hidden="true" /></button>
            </div>
          </div>

          <label className="studio-search-field">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search mail</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mail..." />
          </label>

          <div className="mail-groups">
            {mailGroups.map((group) => (
              <section className="mail-group" key={group.id}>
                <p className="mail-group-title">{group.title} ({group.items.length})</p>
                <div className="mail-row-list">
                  {group.items.map((mail) => (
                    <button
                      key={mail.id}
                      type="button"
                      className={`mail-row${mail.id === selectedMail.id ? " is-active" : ""}${!mail.isRead ? " is-unread" : ""}`}
                      onClick={() => setSelectedMailId(mail.id)}
                    >
                      <span className="mail-avatar" aria-hidden="true">{getInitials(mail.from.name)}</span>
                      <span className="mail-row-body">
                        <span className="mail-row-top">
                          <strong>{mail.from.name}</strong>
                          <small>{mail.receivedAt}</small>
                        </span>
                        <span className="mail-row-subject">
                          {mail.subject}
                          {!mail.isRead && <i aria-label="Unread message" />}
                        </span>
                        <span className="mail-row-preview">{mail.body}</span>
                        <span className="mail-labels" aria-label="Mail labels">
                          {mail.isPinned && <span><LuPin aria-hidden="true" />Pinned</span>}
                          {mail.labels.slice(0, 2).map((label) => <span key={label}>{label}</span>)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <article className="mail-detail-pane" aria-label="Selected email">
          <div className="mail-detail-toolbar">
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Close message"><LuX aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Previous message"><LuArrowLeft aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Next message"><LuChevronRight aria-hidden="true" /></button>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Pin thread"><LuPin aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Archive message"><LuArchive aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Reply"><LuReply aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="More actions"><LuMoreVertical aria-hidden="true" /></button>
            </div>
          </div>

          <div className="mail-message-head">
            <div>
              <h2>{selectedMail.subject}</h2>
              <p>{selectedMail.receivedAt}</p>
            </div>
            {selectedMail.isPriority && <span className="priority-pill"><LuFlag aria-hidden="true" />Priority</span>}
          </div>

          <div className="mail-recipient-row">
            <span className="mail-avatar" aria-hidden="true">{getInitials(selectedMail.from.name)}</span>
            <div>
              <strong>{selectedMail.from.name}</strong>
              <p>{selectedMail.from.email}</p>
              <small>To: {selectedMail.to.join(", ")}{selectedMail.cc?.length ? `; Cc: ${selectedMail.cc.join(", ")}` : ""}</small>
            </div>
          </div>

          {selectedMail.attachments?.length ? (
            <div className="attachment-list" aria-label="Attachments">
              <strong>Attachments ({selectedMail.attachments.length})</strong>
              <div>
                {selectedMail.attachments.map((attachment) => (
                  <button type="button" className="attachment-pill" key={attachment.id}>
                    <LuPaperclip aria-hidden="true" />
                    <span>{attachment.name}</span>
                    <small>{attachment.size}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mail-body">{selectedMail.body}</p>

          <div className="composer-box">
            <div className="composer-input">
              <LuReply aria-hidden="true" />
              <input placeholder={`Reply ${selectedMail.from.name}...`} />
            </div>
            <div className="composer-actions">
              <button type="button" className="icon-ghost" aria-label="Reply all"><LuReplyAll aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Forward"><LuForward aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Add emoji"><LuSmile aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Attach file"><LuPaperclip aria-hidden="true" /></button>
              <button type="button" className="primary-icon" aria-label="Send reply"><LuSend aria-hidden="true" /></button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ChatRoutePage({ route }: { route: StudioRoute }) {
  const [selectedConversationId, setSelectedConversationId] = useState(studioConversations[0]?.id ?? 0);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "snoozed" | "closed">("all");
  const [profileOpen, setProfileOpen] = useState(true);
  const activeConversation = studioConversations.find((conversation) => conversation.id === selectedConversationId) ?? studioConversations[0];
  const groupedConversations = studioConversations.reduce<Array<{ group: StudioConversation["group"]; items: StudioConversation[] }>>((groups, conversation) => {
    const group = groups.find((item) => item.group === conversation.group);
    if (group) group.items.push(conversation);
    else groups.push({ group: conversation.group, items: [conversation] });
    return groups;
  }, []);

  return (
    <section className="route-page chat-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <button type="button" className="outline-button"><LuMessageSquare aria-hidden="true" />New thread</button>
          <button type="button" className="outline-button" onClick={() => setProfileOpen((value) => !value)}>
            <LuUser aria-hidden="true" />
            Profile
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className={`chat-workbench card${profileOpen ? " has-profile" : ""}`} data-studio-module="chat">
        <aside className="chat-list-pane" aria-label="Chat conversations">
          <div className="mail-pane-toolbar">
            <div>
              <h2>Inbox</h2>
              <p>24 open conversations</p>
            </div>
            <button type="button" className="icon-ghost" aria-label="Filter conversations"><LuFilter aria-hidden="true" /></button>
          </div>

          <div className="chat-tabs" role="tablist" aria-label="Conversation states">
            {(["all", "open", "snoozed", "closed"] as const).map((tab) => (
              <button key={tab} type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <div className="chat-groups">
            {groupedConversations.map((group) => (
              <section className="chat-group" key={group.group}>
                <p className="mail-group-title">{group.group}</p>
                {group.items.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`chat-row${conversation.id === activeConversation.id ? " is-active" : ""}`}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <span className="chat-avatar" aria-hidden="true">
                      {getInitials(conversation.name)}
                      {conversation.isOnline && <i />}
                    </span>
                    <span className="chat-row-body">
                      <span className="mail-row-top"><strong>{conversation.name}</strong><small>{conversation.time}</small></span>
                      <span className="mail-row-subject">{conversation.subject}</span>
                      <span className="mail-row-preview">{conversation.preview}</span>
                    </span>
                    {conversation.isUnread && <span className="unread-count">{conversation.unreadCount}</span>}
                  </button>
                ))}
              </section>
            ))}
          </div>
        </aside>

        <article className="chat-thread-pane" aria-label="Active chat thread">
          <div className="chat-thread-head">
            <div className="chat-contact-summary">
              <span className="chat-avatar is-large" aria-hidden="true">
                {getInitials(activeConversation.contact.name)}
                {activeConversation.isOnline && <i />}
              </span>
              <div>
                <h2>{activeConversation.contact.name}</h2>
                <p>{activeConversation.contact.role}</p>
              </div>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Call"><LuPhoneCall aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Tag"><LuTag aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Snooze"><LuAlarmClock aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="View profile" onClick={() => setProfileOpen(true)}><LuUser aria-hidden="true" /></button>
            </div>
          </div>

          <div className="thread-date-divider"><span>May 6, 2026</span></div>

          <div className="message-list">
            {activeConversation.messages.map((message) => {
              const isOutbound = message.side === "out";
              return (
                <div key={message.id} className={`message-row${isOutbound ? " is-outbound" : ""}`}>
                  <span className="chat-avatar" aria-hidden="true">{getInitials(isOutbound ? "Nguyen Le Phong" : activeConversation.contact.name)}</span>
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <small>{message.time}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chat-composer">
            <div className="chat-composer-tabs">
              <button type="button" className="is-active">Reply</button>
              <button type="button">Internal note</button>
            </div>
            <textarea placeholder="Type your message..." aria-label="Type your message" />
            <div className="composer-actions">
              <button type="button" className="icon-ghost" aria-label="Format"><LuType aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Emoji"><LuSmile aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Attach file"><LuPaperclip aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Insert link"><LuLink aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="AI assist"><LuSparkles aria-hidden="true" /></button>
              <button type="button" className="primary-icon" aria-label="Send message"><LuSend aria-hidden="true" /></button>
            </div>
          </div>
        </article>

        {profileOpen && (
          <aside className="chat-profile-pane" aria-label="Contact profile">
            <div className="profile-head">
              <span className="chat-avatar is-large" aria-hidden="true">{getInitials(activeConversation.contact.name)}</span>
              <div>
                <h2>{activeConversation.contact.name}</h2>
                <p>{activeConversation.contact.role}</p>
              </div>
              <button type="button" className="icon-ghost" aria-label="Close profile" onClick={() => setProfileOpen(false)}><LuX aria-hidden="true" /></button>
            </div>
            <div className="profile-actions">
              <button type="button" className="icon-ghost" aria-label="Email"><LuMail aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Call"><LuPhoneCall aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Copy link"><LuCopy aria-hidden="true" /></button>
            </div>
            <div className="profile-tabs" role="tablist" aria-label="Profile tabs">
              <button type="button" className="is-active">Details</button>
              <button type="button">Files</button>
              <button type="button">Activity</button>
            </div>
            <div className="profile-detail-list">
              {[
                [LuMail, "Email", activeConversation.contact.email],
                [LuPhone, "Phone", activeConversation.contact.phone],
                [LuGlobe, "Website", activeConversation.contact.website],
                [LuBriefcase, "Company", activeConversation.contact.company],
                [LuCheckCircle2, "Stage", activeConversation.contact.status],
                [LuMonitor, "Timezone", activeConversation.contact.timezone],
                [LuMapPin, "Location", activeConversation.contact.location]
              ].map(([Icon, label, value]) => {
                const DetailIcon = Icon as IconType;
                return (
                  <div className="profile-detail-row" key={label as string}>
                    <DetailIcon aria-hidden="true" />
                    <span>{label as string}</span>
                    <strong>{value as string}</strong>
                  </div>
                );
              })}
            </div>
            <div className="profile-tags" aria-label="Contact tags">
              {activeConversation.contact.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

function AiAgentSetupPage({
  route,
  locale,
  copy,
  profileActions
}: {
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  profileActions: StudioProfileMenuItem[];
}) {
  const localizedFolders = useMemo(() => getLocalizedStudioFolders(locale), [locale]);
  const localizedNotes = useMemo(() => getLocalizedStudioNotes(locale), [locale]);
  const localizedWorkflowSteps = useMemo(() => getAiWorkflowSteps(locale), [locale]);
  const setupFolder = localizedFolders.find((folder) => folder.id === "machine-bootstrap");
  const setupGroups = setupFolder?.groups ?? [];
  const setupNoteIds = new Set(setupGroups.flatMap((group) => group.noteIds));
  const setupNotes = localizedNotes.filter((note) => setupNoteIds.has(note.id));
  const initialNoteId = setupNotes.some((note) => note.id === defaultStudioNoteId)
    ? defaultStudioNoteId
    : setupNotes[0]?.id ?? defaultStudioNoteId;
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const selectedNote = setupNotes.find((note) => note.id === selectedNoteId) ?? setupNotes[0] ?? localizedNotes[0];
  const workflowFolder = localizedFolders.find((folder) => folder.id === "ai-learning");
  const workflowNoteIds = new Set(workflowFolder?.groups.flatMap((group) => group.noteIds) ?? []);
  const workflowNotes = localizedNotes.filter((note) => workflowNoteIds.has(note.id));

  return (
    <section className="route-page ai-setup-route">
      <RouteHeading route={route} copy={copy}>
        <div className="route-actions">
          {profileActions.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                className="outline-button"
                href={profileHref(locale, item.href)}
                onClick={() => {
                  track("studio_profile_nav_click", {
                    target: item.id,
                    source: "route_actions",
                    external: Boolean(item.external)
                  });
                }}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </div>
      </RouteHeading>

      <div className="ai-setup-container card" data-studio-module="ai-agent-setup">
        <aside className="ai-setup-index" aria-label={copy.aiSetup.agentSetupNotes}>
          <div className="ai-pane-head">
            <span><LuSparkles aria-hidden="true" /></span>
            <div>
              <h2>{setupFolder?.label ?? copy.aiSetup.setupLibrary}</h2>
              <p>{setupFolder?.subtitle ?? copy.aiSetup.agentSetupNotes}</p>
            </div>
          </div>

          <div className="ai-runtime-strip" aria-label={copy.aiSetup.agentRuntimes}>
            {aiRuntimeTargets.map((target) => (
              <span key={target}>{target}</span>
            ))}
          </div>

          <div className="ai-setup-groups">
            {setupGroups.map((group) => (
              <section key={group.label} className="ai-setup-group">
                <p>{group.label}</p>
                <div>
                  {group.noteIds.map((noteId) => {
                    const note = localizedNotes.find((item) => item.id === noteId);
                    if (!note) return null;

                    return (
                      <button
                        key={note.id}
                        type="button"
                        className={`ai-note-button${selectedNote.id === note.id ? " is-active" : ""}`}
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        <span>
                          <strong>{note.title}</strong>
                          <small>{note.subtitle}</small>
                        </span>
                        <em>{statusText(note.status, copy)}</em>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <article id={selectedNote.id} className="ai-setup-reader" aria-label={copy.aiSetup.selectedNote}>
          <div className="ai-reader-head">
            <div>
              <span className={`ai-status-pill status-${selectedNote.status}`}>{statusText(selectedNote.status, copy)}</span>
              <h2>{selectedNote.title}</h2>
              <p>{selectedNote.summary}</p>
            </div>
            <small>{copy.aiSetup.updated} {selectedNote.updatedAt}</small>
          </div>

          <div className="ai-tag-list" aria-label={copy.aiSetup.setupNoteTags}>
            {selectedNote.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="ai-section-list">
            {selectedNote.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

          {selectedNote.commands?.length ? (
            <section className="ai-command-panel" aria-label={copy.aiSetup.setupCommands}>
              <div className="ai-panel-title">
                <LuCommand aria-hidden="true" />
                <div>
                  <h3>{copy.aiSetup.commandRunbook}</h3>
                  <p>{copy.aiSetup.commandRunbookDetail}</p>
                </div>
              </div>
              <div className="ai-command-list">
                {selectedNote.commands.map((command) => (
                  <article className="ai-command-card" key={`${command.label}-${command.command}`}>
                    <span>{command.label}</span>
                    <code>{command.command}</code>
                    {command.note && <p>{command.note}</p>}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {selectedNote.links?.length ? (
            <section className="ai-link-grid" aria-label={copy.aiSetup.referenceLinks}>
              {selectedNote.links.map((link) => (
                <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
                  <strong>{link.label}</strong>
                  {link.note && <span>{link.note}</span>}
                </a>
              ))}
            </section>
          ) : null}
        </article>

        <aside className="ai-workflow-rail" aria-label={copy.aiSetup.aiWorkflow}>
          <div className="ai-pane-head">
            <span><LuWaves aria-hidden="true" /></span>
            <div>
              <h2>{copy.aiSetup.aiWorkflow}</h2>
              <p>{copy.aiSetup.aiWorkflowDetail}</p>
            </div>
          </div>

          <div className="ai-workflow-steps">
            {localizedWorkflowSteps.map((step, index) => (
              <article key={step.title} className={`ai-workflow-step state-${step.state}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <section className="ai-checklist-panel">
            <h3>{copy.aiSetup.setupChecklist}</h3>
            <div>
              {selectedNote.checklist?.map((item) => (
                <label className="check-row checklist-row" key={item.label}>
                  <input type="checkbox" defaultChecked={item.checked} />
                  <span>
                    <strong>{item.label}</strong>
                    {item.detail && <small>{item.detail}</small>}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="ai-research-queue">
            <h3>{copy.aiSetup.researchQueue}</h3>
            {workflowNotes.map((note) => (
              <article key={note.id}>
                <strong>{note.title}</strong>
                <p>{note.subtitle}</p>
              </article>
            ))}
          </section>
        </aside>
      </div>
    </section>
  );
}

function AiSkillsPage({ route, locale, copy }: { route: StudioRoute; locale: string; copy: StudioUiCopy }) {
  const localizedSkills = useMemo(() => getLocalizedStudioAiSkills(locale), [locale]);
  const [selectedSkillId, setSelectedSkillId] = useState(localizedSkills[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<StudioAiSkill["category"] | "all">("all");
  const [copiedSkillId, setCopiedSkillId] = useState<string | null>(null);
  const visibleSkills = localizedSkills.filter((skill) => categoryFilter === "all" || skill.category === categoryFilter);
  const selectedSkill = localizedSkills.find((skill) => skill.id === selectedSkillId) ?? visibleSkills[0] ?? localizedSkills[0];
  const categories: Array<StudioAiSkill["category"] | "all"> = [
    "all",
    "strategy",
    "learning",
    "engineering",
    "content",
    "operations",
    "communication"
  ];

  const handleCategoryFilter = (category: StudioAiSkill["category"] | "all") => {
    const nextVisibleSkills = localizedSkills.filter((skill) => category === "all" || skill.category === category);
    setCategoryFilter(category);
    if (!nextVisibleSkills.some((skill) => skill.id === selectedSkillId)) {
      setSelectedSkillId(nextVisibleSkills[0]?.id ?? selectedSkillId);
    }
    track("studio_ai_skill_filter", {
      category,
      result_count: nextVisibleSkills.length
    });
  };

  const handleSkillSelect = (skill: StudioAiSkill) => {
    setSelectedSkillId(skill.id);
    track("studio_ai_skill_select", {
      skill_id: skill.id,
      category: skill.category
    });
  };

  const copySkill = async () => {
    if (!selectedSkill) return;

    try {
      await navigator.clipboard.writeText(selectedSkill.markdown);
      setCopiedSkillId(selectedSkill.id);
      window.setTimeout(() => setCopiedSkillId(null), 1600);
      track("studio_ai_skill_copy", {
        skill_id: selectedSkill.id,
        category: selectedSkill.category,
        markdown_length: selectedSkill.markdown.length
      });
    } catch {
      track("studio_ai_skill_copy", {
        skill_id: selectedSkill.id,
        category: selectedSkill.category,
        failed: true
      });
    }
  };

  if (!selectedSkill) {
    return (
      <section className="empty-route card">
        <LuSparkles aria-hidden="true" />
        <strong>{copy.aiSkills.emptyTitle}</strong>
        <p>{copy.aiSkills.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="route-page ai-skills-route">
      <RouteHeading route={route} copy={copy}>
        <button type="button" className="outline-button" onClick={copySkill}>
          {copiedSkillId === selectedSkill.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copiedSkillId === selectedSkill.id ? copy.aiSkills.copied : copy.aiSkills.copyMarkdown}
        </button>
      </RouteHeading>

      <div className="skill-library-workbench card" data-studio-module="ai-skills">
        <aside className="skill-index-pane" aria-label={copy.aiSkills.skillLibrary}>
          <div className="ai-pane-head">
            <span><LuCommand aria-hidden="true" /></span>
            <div>
              <h2>{copy.aiSkills.skillLibrary}</h2>
              <p>{copy.aiSkills.skillLibraryDetail}</p>
            </div>
          </div>

          <div className="skill-filter-control">
            <label htmlFor="ai-skill-category-filter">{copy.aiSkills.categoriesLabel}</label>
            <select
              id="ai-skill-category-filter"
              value={categoryFilter}
              onChange={(event) => handleCategoryFilter(event.currentTarget.value as StudioAiSkill["category"] | "all")}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {skillCategoryLabel(category, copy)}
                </option>
              ))}
            </select>
            <span>{copy.aiSkills.skillCountLabel(visibleSkills.length)}</span>
          </div>

          <div className="skill-list">
            {visibleSkills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                className={`skill-list-button${selectedSkill.id === skill.id ? " is-active" : ""}`}
                onClick={() => handleSkillSelect(skill)}
              >
                <em>{skillCategoryLabel(skill.category, copy)}</em>
                <span>
                  <strong>{skill.title}</strong>
                  <small>{skill.summary}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <article className="skill-reader-pane" aria-label={copy.aiSkills.selectedSkill}>
          <div className="skill-reader-head">
            <div>
              <span className="ai-status-pill status-ready">{skillCategoryLabel(selectedSkill.category, copy)}</span>
              <h2>{selectedSkill.title}</h2>
              <div className="skill-use-case">
                <strong>{copy.aiSkills.useThisWhen}</strong>
                <p>{selectedSkill.summary}</p>
              </div>
            </div>
            <button type="button" className="outline-button" onClick={copySkill}>
              {copiedSkillId === selectedSkill.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              {copiedSkillId === selectedSkill.id ? copy.aiSkills.copied : copy.aiSkills.copy}
            </button>
          </div>

          <div className="ai-tag-list" aria-label={copy.aiSkills.skillTags}>
            {selectedSkill.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <pre className="skill-markdown-preview"><code>{selectedSkill.markdown}</code></pre>
        </article>
      </div>
    </section>
  );
}

function ChecklistStepNode({
  checklistId,
  sectionId,
  step,
  depth = 0
}: {
  checklistId: string;
  sectionId: string;
  step: StudioChecklistStep;
  depth?: number;
}) {
  return (
    <li className="checklist-step-node" data-depth={depth}>
      <label className="check-row checklist-row">
        <input
          type="checkbox"
          onChange={(event) => {
            track("studio_checklist_item_toggle", {
              checklist_id: checklistId,
              section_id: sectionId,
              step_id: step.id,
              checked: event.currentTarget.checked
            });
          }}
        />
        <span>
          <strong>{step.label}</strong>
          {step.detail && <small>{step.detail}</small>}
        </span>
      </label>
      {step.children?.length ? (
        <ol>
          {step.children.map((child) => (
            <ChecklistStepNode
              key={child.id}
              checklistId={checklistId}
              sectionId={sectionId}
              step={child}
              depth={depth + 1}
            />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

function DeliveryChecklistsPage({ route, locale, copy }: { route: StudioRoute; locale: string; copy: StudioUiCopy }) {
  const localizedChecklists = useMemo(() => getLocalizedStudioWorkflowChecklists(locale), [locale]);
  const [selectedChecklistId, setSelectedChecklistId] = useState(localizedChecklists[0]?.id ?? "");
  const [copiedChecklistId, setCopiedChecklistId] = useState<string | null>(null);
  const selectedChecklist = localizedChecklists.find((checklist) => checklist.id === selectedChecklistId) ?? localizedChecklists[0];
  const selectedMarkdown = selectedChecklist ? renderChecklistMarkdown(selectedChecklist, copy) : "";
  const totalSteps = selectedChecklist?.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0) ?? 0;

  const handleChecklistSelect = (checklist: StudioWorkflowChecklist) => {
    setSelectedChecklistId(checklist.id);
    track("studio_checklist_select", {
      checklist_id: checklist.id,
      section_count: checklist.sections.length,
      step_count: checklist.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0)
    });
  };

  const copyChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      await navigator.clipboard.writeText(selectedMarkdown);
      setCopiedChecklistId(selectedChecklist.id);
      window.setTimeout(() => setCopiedChecklistId(null), 1600);
      track("studio_checklist_copy", {
        checklist_id: selectedChecklist.id,
        markdown_length: selectedMarkdown.length,
        section_count: selectedChecklist.sections.length,
        step_count: totalSteps
      });
    } catch {
      track("studio_checklist_copy", {
        checklist_id: selectedChecklist.id,
        failed: true
      });
    }
  };

  if (!selectedChecklist) {
    return (
      <section className="empty-route card">
        <LuClipboardList aria-hidden="true" />
        <strong>{copy.checklists.emptyTitle}</strong>
        <p>{copy.checklists.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="route-page delivery-checklists-route">
      <RouteHeading route={route} copy={copy}>
        <button type="button" className="outline-button" onClick={copyChecklist}>
          {copiedChecklistId === selectedChecklist.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copiedChecklistId === selectedChecklist.id ? copy.checklists.copied : copy.checklists.copyChecklist}
        </button>
      </RouteHeading>

      <div className="checklist-workbench card" data-studio-module="delivery-checklists">
        <aside className="checklist-index-pane" aria-label={copy.checklists.workflowListLabel}>
          <div className="ai-pane-head">
            <span><LuClipboardList aria-hidden="true" /></span>
            <div>
              <h2>{copy.checklists.menu}</h2>
              <p>{copy.checklists.menuDetail}</p>
            </div>
          </div>

          <div className="checklist-list">
            {localizedChecklists.map((checklist) => (
              <button
                key={checklist.id}
                type="button"
                className={`checklist-list-button${selectedChecklist.id === checklist.id ? " is-active" : ""}`}
                onClick={() => handleChecklistSelect(checklist)}
              >
                <span>
                  <strong>{checklist.title}</strong>
                  <small>{checklist.summary}</small>
                </span>
                <em>{checklist.sections.length} {copy.checklists.sections}</em>
              </button>
            ))}
          </div>
        </aside>

        <article className="checklist-reader-pane" aria-label={copy.checklists.selectedChecklist}>
          <div className="skill-reader-head">
            <div>
              <span className="ai-status-pill status-ready">{totalSteps} {copy.checklists.steps}</span>
              <h2>{selectedChecklist.title}</h2>
              <p>{selectedChecklist.summary}</p>
            </div>
            <button type="button" className="outline-button" onClick={copyChecklist}>
              {copiedChecklistId === selectedChecklist.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              {copiedChecklistId === selectedChecklist.id ? copy.checklists.copied : copy.checklists.copy}
            </button>
          </div>

          <div className="ai-tag-list" aria-label={copy.checklists.checklistTags}>
            {selectedChecklist.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="checklist-section-list">
            {selectedChecklist.sections.map((section) => (
              <section key={section.id} className="checklist-section-card">
                <header>
                  <h3>{section.title}</h3>
                  <p>{section.detail}</p>
                </header>
                <ol>
                  {section.steps.map((step) => (
                    <ChecklistStepNode
                      key={step.id}
                      checklistId={selectedChecklist.id}
                      sectionId={section.id}
                      step={step}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </article>

        <aside className="checklist-side-pane" aria-label={copy.checklists.detailsLabel}>
          <section>
            <h3>{copy.checklists.whenToUse}</h3>
            <p>{selectedChecklist.whenToUse}</p>
          </section>
          <section>
            <h3>{copy.checklists.structure}</h3>
            <p>{copy.checklists.structureDetail(selectedChecklist.sections.length, totalSteps)}</p>
          </section>
          <section>
            <h3>{copy.checklists.markdownCopy}</h3>
            <pre><code>{selectedMarkdown}</code></pre>
          </section>
        </aside>
      </div>
    </section>
  );
}

function WelcomePage({
  route,
  locale,
  copy,
  onActivate
}: Readonly<{
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}>) {
  const localizedRoutes = getLocalizedRouteDefinitions(copy);
  const usefulLinks = getLocalizedProfileItems(copy).filter((item) => ["home", "notes", "blog", "apps", "resume"].includes(item.id));
  const studioShortcuts: StudioRouteId[] = studioCatalog.welcomeRouteIds;

  return (
    <section className="route-page welcome-route" data-studio-module="welcome">
      <div className="welcome-shell">
        <div className="welcome-intro">
          <span className="welcome-eyebrow"><LuSparkles aria-hidden="true" /> {copy.welcome.eyebrow}</span>
          <h2>{route.title}</h2>
          <p>{copy.welcome.lead}</p>
          <div className="welcome-note-strip">
            <LuSmile aria-hidden="true" />
            <span>{copy.welcome.note}</span>
          </div>
        </div>

        <section className="welcome-panel" aria-label={copy.welcome.studioLinks}>
          <div className="welcome-panel-head">
            <span><LuWorkflow aria-hidden="true" /></span>
            <div>
              <h2>{copy.welcome.studioLinks}</h2>
              <p>{route.description}</p>
            </div>
          </div>
          <div className="welcome-shortcut-grid">
            {studioShortcuts.map((routeId) => {
              const shortcutRoute = localizedRoutes[routeId];
              const shortcutCopy = copy.welcome.routeCards[routeId];
              const Icon = shortcutRoute.icon;
              return (
                <a
                  key={routeId}
                  href={routeHref(routeId)}
                  className="welcome-shortcut"
                  onClick={(event) => {
                    event.preventDefault();
                    onActivate(routeId, "route_actions");
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{shortcutCopy?.label ?? shortcutRoute.title}</strong>
                    <small>{shortcutCopy?.detail ?? shortcutRoute.description}</small>
                  </span>
                  <em>{copy.welcome.open}</em>
                </a>
              );
            })}
          </div>
        </section>
      </div>

      <section className="welcome-link-band" aria-label={copy.welcome.publicLinks}>
        <div className="welcome-link-head">
          <span><LuLink aria-hidden="true" /></span>
          <div>
            <h2>{copy.welcome.publicLinks}</h2>
            <p>{copy.profileNavigationDetail}</p>
          </div>
        </div>
        <div className="welcome-link-grid">
          {usefulLinks.map((item) => {
            const Icon = item.icon;
            const linkCopy = copy.welcome.linkCards[item.id];
            return (
              <a
                key={item.id}
                href={profileHref(locale, item.href)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={() => {
                  track("studio_profile_nav_click", {
                    target: item.id,
                    source: "welcome",
                    external: Boolean(item.external)
                  });
                }}
              >
                <Icon aria-hidden="true" />
                <span>
                  <strong>{linkCopy?.label ?? item.label}</strong>
                  <small>{linkCopy?.detail ?? item.detail}</small>
                </span>
                <LuExternalLink aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>
    </section>
  );
}

type StudioFlowSnapshot = {
  nodes: StudioFlowCanvasNode[];
  edges: StudioFlowEdge[];
  hiddenGroupIds: string[];
  layoutMode: StudioFlowLayoutMode;
};

const FLOW_HISTORY_LIMIT = 24;
const FLOW_NODE_WIDTH = 240;
const FLOW_NODE_HEIGHT = 112;
const FLOW_GROUP_MARGIN = 24;
const FLOW_MARKER_ARROW = "arrow" as StudioFlowMarkerType;
const FLOW_MARKER_ARROW_CLOSED = "arrowclosed" as StudioFlowMarkerType;

const flowCanvasTones: StudioFlowCanvasTone[] = [
  "source",
  "process",
  "agent",
  "review",
  "storage",
  "event",
  "external",
  "risk",
  "output"
];

const flowCanvasToneColors: Record<StudioFlowCanvasTone, string> = {
  source: "#2563eb",
  process: "#0f766e",
  agent: "#d97706",
  review: "#7c3aed",
  storage: "#0891b2",
  event: "#9333ea",
  external: "#64748b",
  risk: "#dc2626",
  output: "#16a34a"
};

const reactFlowExampleFamilyLabels: Record<string, string> = {
  overview: "Overview",
  interaction: "Interaction",
  grouping: "Subflows & Grouping",
  layout: "Layout",
  styling: "Styling",
  whiteboard: "Whiteboard",
  architecture: "Software Architecture"
};

function getReactFlowFamilyLabel(family: string, copy: StudioUiCopy["flows"]) {
  return copy.familyLabels[family] ?? reactFlowExampleFamilyLabels[family] ?? family;
}

function buildStudioFlowCanvas(flow: StudioFlow, copy: StudioUiCopy["flows"], viewId?: string): {
  nodes: StudioFlowCanvasNode[];
  edges: StudioFlowEdge[];
} {
  if (flow.architectureDemo) {
    return buildArchitectureDemoCanvas(flow, copy, viewId);
  }

  const nodes = flow.steps.map<StudioFlowCanvasNode>((step, index) => {
    const tone = flowCanvasTones[index % flowCanvasTones.length] ?? "process";
    return {
      id: step.id,
      type: "studioFlow",
      position: {
        x: index * 270,
        y: index % 2 === 0 ? 34 : 178
      },
      data: {
        kind: "step",
        title: step.title,
        detail: step.output,
        badge: String(index + 1).padStart(2, "0"),
        tone,
        kindLabel: copy.nodeLabels["step"],
        toneLabel: copy.nodeLabels[tone],
        scratchLabel: copy.scratch,
        hiddenLabel: copy.hiddenCount.toLocaleLowerCase()
      }
    };
  });

  const outcomeNode: StudioFlowCanvasNode = {
    id: `${flow.id}-outcome`,
    type: "studioFlow",
    position: { x: flow.steps.length * 270 + 16, y: 90 },
    data: {
      kind: "detail",
      title: copy.chartOutcome,
      detail: flow.outcome,
      badge: "goal",
      tone: "output",
      kindLabel: copy.nodeLabels["detail"],
      toneLabel: copy.nodeLabels["output"],
      scratchLabel: copy.scratch,
      hiddenLabel: copy.hiddenCount.toLocaleLowerCase()
    }
  };

  const edges: StudioFlowEdge[] = [];
  for (let index = 1; index < nodes.length; index += 1) {
    const source = nodes[index - 1];
    const target = nodes[index];
    if (!source || !target) continue;

    const tone = target.data.tone;
    edges.push({
      id: `${source.id}-${target.id}`,
      source: source.id,
      target: target.id,
      type: "smoothstep",
      animated: index < 3,
      markerEnd: { type: FLOW_MARKER_ARROW_CLOSED },
      style: { stroke: flowCanvasToneColors[tone], strokeWidth: 2 }
    });
  }

  const lastStep = nodes.at(-1);
  if (lastStep) {
    edges.push({
      id: `${lastStep.id}-${outcomeNode.id}`,
      source: lastStep.id,
      target: outcomeNode.id,
      type: "smoothstep",
      markerEnd: { type: FLOW_MARKER_ARROW_CLOSED },
      style: { stroke: flowCanvasToneColors.output, strokeWidth: 2 }
    });
  }

  return { nodes: [...nodes, outcomeNode], edges };
}

function getStudioFlowEdgeMarker(marker: StudioFlowArchitectureEdgeSpec["marker"]): StudioFlowEdge["markerEnd"] {
  if (marker === "arrow") return { type: FLOW_MARKER_ARROW };
  if (marker === "arrowClosed") return { type: FLOW_MARKER_ARROW_CLOSED };
  return undefined;
}

function buildArchitectureDemoCanvas(flow: StudioFlow, copy: StudioUiCopy["flows"], viewId?: string): {
  nodes: StudioFlowCanvasNode[];
  edges: StudioFlowEdge[];
} {
  const demo = flow.architectureDemo;
  if (!demo) return { nodes: [], edges: [] };
  const view = demo.views.find((candidate) => candidate.id === viewId)
    ?? demo.views.find((candidate) => candidate.id === demo.defaultViewId)
    ?? demo.views[0];
  const viewNodes = view?.nodes ?? demo.nodes;
  const viewEdges = view?.edges ?? demo.edges;

  const nodes = viewNodes.map<StudioFlowCanvasNode>((node) => ({
    id: node.id,
    type: "studioFlow",
    position: node.position,
    zIndex: node.kind === "group" ? 0 : 2,
    style: node.size ? { width: node.size.width, height: node.size.height } : undefined,
    data: {
      kind: node.kind,
      title: node.title,
      detail: node.detail,
      badge: node.badge,
      tone: node.tone,
      kindLabel: copy.nodeLabels[node.kind],
      toneLabel: copy.nodeLabels[node.tone],
      scratchLabel: copy.scratch,
      hiddenLabel: copy.hiddenCount.toLocaleLowerCase(),
      active: node.kind !== "group",
      compact: node.compact
    }
  }));

  const edges = viewEdges.map<StudioFlowEdge>((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    label: edge.label,
    animated: edge.animated,
    markerEnd: getStudioFlowEdgeMarker(edge.marker),
    style: { stroke: flowCanvasToneColors[edge.tone], strokeWidth: edge.animated ? 2.4 : 1.8 },
    labelStyle: { fill: flowCanvasToneColors[edge.tone], fontSize: 11, fontWeight: 700 },
    labelBgStyle: { fill: "var(--card)", fillOpacity: 0.86 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 6
  }));

  return { nodes, edges };
}

function cloneStudioFlowNodes(nodes: StudioFlowCanvasNode[]): StudioFlowCanvasNode[] {
  return nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
    style: node.style ? { ...node.style } : undefined
  }));
}

function cloneStudioFlowEdges(edges: StudioFlowEdge[]): StudioFlowEdge[] {
  return edges.map((edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : undefined,
    markerEnd: edge.markerEnd && typeof edge.markerEnd === "object" ? { ...edge.markerEnd } : edge.markerEnd,
    markerStart: edge.markerStart && typeof edge.markerStart === "object" ? { ...edge.markerStart } : edge.markerStart,
    style: edge.style ? { ...edge.style } : undefined,
    labelStyle: edge.labelStyle ? { ...edge.labelStyle } : undefined,
    labelBgStyle: edge.labelBgStyle ? { ...edge.labelBgStyle } : undefined
  }));
}

function createStudioFlowSnapshot(
  nodes: StudioFlowCanvasNode[],
  edges: StudioFlowEdge[],
  hiddenGroupIds: string[],
  layoutMode: StudioFlowLayoutMode
): StudioFlowSnapshot {
  return {
    nodes: cloneStudioFlowNodes(nodes),
    edges: cloneStudioFlowEdges(edges),
    hiddenGroupIds: [...hiddenGroupIds],
    layoutMode
  };
}

function parseFlowDimension(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function getStudioFlowNodeSize(node: StudioFlowCanvasNode) {
  return {
    width: parseFlowDimension(node.style?.width ?? node.width, node.data.kind === "group" ? 520 : FLOW_NODE_WIDTH),
    height: parseFlowDimension(node.style?.height ?? node.height, node.data.kind === "group" ? 320 : FLOW_NODE_HEIGHT)
  };
}

function isNodeInsideGroup(node: StudioFlowCanvasNode, groupNode: StudioFlowCanvasNode) {
  if (node.id === groupNode.id || node.data.kind === "group") return false;
  const groupSize = getStudioFlowNodeSize(groupNode);
  const nodeCenter = {
    x: node.position.x + FLOW_NODE_WIDTH / 2,
    y: node.position.y + FLOW_NODE_HEIGHT / 2
  };
  return nodeCenter.x >= groupNode.position.x + FLOW_GROUP_MARGIN
    && nodeCenter.x <= groupNode.position.x + groupSize.width - FLOW_GROUP_MARGIN
    && nodeCenter.y >= groupNode.position.y + FLOW_GROUP_MARGIN
    && nodeCenter.y <= groupNode.position.y + groupSize.height - FLOW_GROUP_MARGIN;
}

function getStudioFlowGroupChildren(nodes: StudioFlowCanvasNode[]) {
  const groups = nodes.filter((node) => node.data.kind === "group");
  const childrenByGroup = new Map<string, string[]>();

  groups.forEach((groupNode) => {
    childrenByGroup.set(
      groupNode.id,
      nodes.filter((node) => isNodeInsideGroup(node, groupNode)).map((node) => node.id)
    );
  });

  return childrenByGroup;
}

function getLayoutedStudioFlowNodes(nodes: StudioFlowCanvasNode[], layoutMode: StudioFlowLayoutMode) {
  if (layoutMode === "source") return cloneStudioFlowNodes(nodes);

  const sortedNodes = nodes
    .filter((node) => node.data.kind !== "group")
    .sort((left, right) => left.position.x - right.position.x || left.position.y - right.position.y);
  const columns = layoutMode === "grid" ? Math.max(2, Math.ceil(Math.sqrt(sortedNodes.length))) : sortedNodes.length;
  const horizontalGap = layoutMode === "compact" ? 238 : layoutMode === "wide" ? 340 : 290;
  const verticalGap = layoutMode === "compact" ? 128 : layoutMode === "wide" ? 178 : 150;
  const positions = new Map<string, { x: number; y: number }>();

  sortedNodes.forEach((node, index) => {
    if (layoutMode === "horizontal" || layoutMode === "compact" || layoutMode === "wide") {
      positions.set(node.id, { x: index * horizontalGap, y: index % 2 === 0 ? 0 : verticalGap });
      return;
    }
    if (layoutMode === "vertical") {
      positions.set(node.id, { x: index % 2 === 0 ? 0 : horizontalGap, y: index * verticalGap });
      return;
    }
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions.set(node.id, { x: column * horizontalGap, y: row * (verticalGap + 20) });
  });

  return nodes.map((node) => ({
    ...node,
    hidden: node.data.kind === "group" ? true : undefined,
    position: positions.get(node.id) ?? node.position,
    data: { ...node.data }
  }));
}

function getSourcePositionedStudioFlowNodes(
  nodes: StudioFlowCanvasNode[],
  sourceNodes: StudioFlowCanvasNode[]
): StudioFlowCanvasNode[] {
  const sourceById = new Map(sourceNodes.map((node) => [node.id, node]));

  return nodes.map((node) => {
    const sourceNode = sourceById.get(node.id);
    if (!sourceNode) {
      return {
        ...node,
        data: { ...node.data },
        position: { ...node.position },
        style: node.style ? { ...node.style } : undefined
      };
    }

    return {
      ...node,
      hidden: sourceNode.hidden,
      position: { ...sourceNode.position },
      style: sourceNode.style ? { ...sourceNode.style } : undefined,
      data: {
        ...node.data,
        compact: sourceNode.data.compact,
        collapsed: false,
        hiddenChildCount: undefined
      }
    };
  });
}

function getDisplayStudioFlowNodes(
  nodes: StudioFlowCanvasNode[],
  hiddenGroupIds: string[],
  layoutMode: StudioFlowLayoutMode,
  canvasMode: StudioFlowCanvasMode
): StudioFlowCanvasNode[] {
  const hiddenGroups = new Set(hiddenGroupIds);
  const groupChildren = getStudioFlowGroupChildren(nodes);
  const hiddenChildren = new Set<string>();
  hiddenGroups.forEach((groupId) => {
    groupChildren.get(groupId)?.forEach((nodeId) => hiddenChildren.add(nodeId));
  });

  return nodes.map<StudioFlowCanvasNode>((node) => {
    const collapsed = hiddenGroups.has(node.id);
    const isGroup = node.data.kind === "group";
    const passthroughGroupStyle = isGroup && canvasMode !== "edit"
      ? ({ ...node.style, pointerEvents: "none" } satisfies CSSProperties)
      : node.style;
    return {
      ...node,
      hidden: Boolean(node.hidden) || hiddenChildren.has(node.id) || (layoutMode !== "source" && isGroup),
      style: passthroughGroupStyle,
      selectable: !isGroup || canvasMode === "edit",
      draggable: canvasMode === "edit" && !isGroup,
      connectable: canvasMode === "edit" && !isGroup,
      data: {
        ...node.data,
        collapsed,
        editable: canvasMode === "edit",
        hiddenChildCount: isGroup ? groupChildren.get(node.id)?.length ?? 0 : undefined
      }
    };
  });
}

function getDisplayStudioFlowEdges(edges: StudioFlowEdge[], nodes: StudioFlowCanvasNode[]) {
  const visibleNodeIds = new Set(nodes.filter((node) => !node.hidden).map((node) => node.id));
  return edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
}

let scratchNodeSequence = 0;

function createScratchNodeId(prefix: string) {
  scratchNodeSequence += 1;
  const uniquePart = globalThis.crypto?.randomUUID?.() ?? scratchNodeSequence.toString(36);
  return `${prefix}-${Date.now().toString(36)}-${scratchNodeSequence.toString(36)}-${uniquePart}`;
}

function createScratchNoteNode(copy: StudioUiCopy["flows"], anchorNode?: StudioFlowCanvasNode): StudioFlowCanvasNode {
  const position = anchorNode
    ? { x: anchorNode.position.x + 280, y: anchorNode.position.y + 24 }
    : { x: 40, y: 40 };
  return {
    id: createScratchNodeId("scratch-note"),
    type: "studioFlow",
    position,
    data: {
      kind: "note",
      title: copy.reviewNote,
      detail: copy.temporaryAnnotation,
      badge: "note",
      tone: "review",
      kindLabel: copy.nodeLabels["note"],
      toneLabel: copy.nodeLabels["review"],
      scratchLabel: copy.scratch,
      hiddenLabel: copy.hiddenCount.toLocaleLowerCase(),
      active: true,
      scratch: true
    }
  };
}

function cloneStudioFlowNodeForPaste(node: StudioFlowCanvasNode): StudioFlowCanvasNode {
  return {
    ...node,
    id: createScratchNodeId(`${node.id}-copy`),
    selected: true,
    position: { x: node.position.x + 36, y: node.position.y + 36 },
    data: {
      ...node.data,
      badge: node.data.badge ?? "copy",
      scratch: true
    }
  };
}

function getStudioFlowMetrics(nodes: StudioFlowCanvasNode[], edges: StudioFlowEdge[]) {
  return {
    nodeCount: nodes.filter((node) => !node.hidden && node.data.kind !== "group").length,
    edgeCount: edges.length,
    groupCount: nodes.filter((node) => node.data.kind === "group").length,
    hiddenCount: nodes.filter((node) => node.hidden).length
  };
}

function getConnectedStudioFlowNodeIds(activeNodeId: string | null, edges: StudioFlowEdge[]) {
  if (!activeNodeId) return null;
  const ids = new Set<string>([activeNodeId]);
  edges.forEach((edge) => {
    if (edge.source === activeNodeId) ids.add(edge.target);
    if (edge.target === activeNodeId) ids.add(edge.source);
  });
  return ids;
}

type StudioFlowTrailItem = {
  edge: StudioFlowEdge;
  node: StudioFlowCanvasNode;
};

function getStudioFlowTrail(
  activeNodeId: string | null,
  nodes: StudioFlowCanvasNode[],
  edges: StudioFlowEdge[]
): { incoming: StudioFlowTrailItem[]; outgoing: StudioFlowTrailItem[] } {
  if (!activeNodeId) return { incoming: [], outgoing: [] };
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  return edges.reduce<{ incoming: StudioFlowTrailItem[]; outgoing: StudioFlowTrailItem[] }>(
    (trail, edge) => {
      if (edge.source === activeNodeId) {
        const targetNode = nodeById.get(edge.target);
        if (targetNode) trail.outgoing.push({ edge, node: targetNode });
      }
      if (edge.target === activeNodeId) {
        const sourceNode = nodeById.get(edge.source);
        if (sourceNode) trail.incoming.push({ edge, node: sourceNode });
      }
      return trail;
    },
    { incoming: [], outgoing: [] }
  );
}

function StudioFlowTrailColumn({
  label,
  items,
  emptyLabel,
  moreLabel,
  onSelectNode
}: {
  label: string;
  items: StudioFlowTrailItem[];
  emptyLabel: string;
  moreLabel: (count: number) => string;
  onSelectNode: (nodeId: string) => void;
}) {
  const visibleItems = items.slice(0, 3);
  return (
    <section>
      <h4>{label}</h4>
      {visibleItems.length === 0 ? <span className="flow-trail-empty">{emptyLabel}</span> : null}
      {visibleItems.map((item) => (
        <button
          key={item.edge.id}
          type="button"
          className="flow-trail-node-button"
          onClick={() => onSelectNode(item.node.id)}
          title={item.node.data.title}
        >
          <small>{String(item.edge.label ?? item.edge.id)}</small>
          <strong>{item.node.data.title}</strong>
        </button>
      ))}
      {items.length > visibleItems.length ? (
        <span className="flow-trail-more">{moreLabel(items.length - visibleItems.length)}</span>
      ) : null}
    </section>
  );
}

function StudioFlowTrailPanel({
  activeNode,
  incoming,
  outgoing,
  focusMode,
  copy,
  onSelectNode
}: {
  activeNode: StudioFlowCanvasNode | null;
  incoming: StudioFlowTrailItem[];
  outgoing: StudioFlowTrailItem[];
  focusMode: boolean;
  copy: StudioUiCopy["flows"];
  onSelectNode: (nodeId: string) => void;
}) {
  if (!activeNode) return null;
  return (
    <div className={`flow-trail-panel${focusMode ? " is-isolated" : ""}`}>
      <StudioFlowTrailColumn
        label={copy.upstream}
        items={incoming}
        emptyLabel={copy.trailEmpty}
        moreLabel={copy.trailMore}
        onSelectNode={onSelectNode}
      />
      <section className="flow-trail-current">
        <h4>{copy.current}</h4>
        <strong>{activeNode.data.title}</strong>
        <small>{activeNode.data.badge ?? formatStudioFlowLabel(activeNode.data.kind)}</small>
      </section>
      <StudioFlowTrailColumn
        label={copy.downstream}
        items={outgoing}
        emptyLabel={copy.trailEmpty}
        moreLabel={copy.trailMore}
        onSelectNode={onSelectNode}
      />
    </div>
  );
}

function StudioFlowChart({ flow, copy, locale }: { flow: StudioFlow; copy: StudioUiCopy; locale: string }) {
  const demo = flow.architectureDemo;
  const demoViews = useMemo(() => demo?.views ?? [], [demo]);
  const initialDemoView = demoViews.find((view) => view.id === demo?.defaultViewId) ?? demoViews[0];
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [canvasMode, setCanvasMode] = useState<StudioFlowCanvasMode>("inspect");
  const [layoutMode, setLayoutMode] = useState<StudioFlowLayoutMode>("source");
  const [pendingLayoutMode, setPendingLayoutMode] = useState<StudioFlowLayoutMode>("source");
  const [focusMode, setFocusMode] = useState(false);
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [copiedNode, setCopiedNode] = useState<StudioFlowCanvasNode | null>(null);
  const [history, setHistory] = useState<StudioFlowSnapshot[]>([]);
  const [future, setFuture] = useState<StudioFlowSnapshot[]>([]);
  const [helperLines, setHelperLines] = useState<StudioFlowHelperLines>({ x: null, y: null });
  const flowInstanceRef = useRef<StudioFlowInstance | null>(null);
  const [demoSelection, setDemoSelection] = useState<{ flowId: StudioFlowId; family: string; viewId: string }>({
    flowId: flow.id,
    family: initialDemoView?.family ?? "architecture",
    viewId: initialDemoView?.id ?? ""
  });
  const activeSelection = demoSelection.flowId === flow.id
    ? demoSelection
    : {
      flowId: flow.id,
      family: initialDemoView?.family ?? "architecture",
      viewId: initialDemoView?.id ?? ""
    };
  const selectedFamily = activeSelection.family;
  const selectedViewId = activeSelection.viewId;

  const familyOptions = useMemo(() => {
    const families = new Map<string, string>();
    demoViews.forEach((view) => {
      if (!families.has(view.family)) families.set(view.family, getReactFlowFamilyLabel(view.family, copy.flows));
    });
    return Array.from(families, ([value, label]) => ({ value, label }));
  }, [copy.flows, demoViews]);
  const selectedFamilyViews = useMemo(
    () => demoViews.filter((view) => view.family === selectedFamily),
    [demoViews, selectedFamily]
  );
  const selectedView = demoViews.find((view) => view.id === selectedViewId)
    ?? selectedFamilyViews[0]
    ?? initialDemoView;
  const sourceCanvas = useMemo(
    () => buildStudioFlowCanvas(flow, copy.flows, selectedView?.id),
    [copy.flows, flow, selectedView?.id]
  );
  const [canvasNodes, setCanvasNodes] = useState<StudioFlowCanvasNode[]>(() => cloneStudioFlowNodes(sourceCanvas.nodes));
  const [canvasEdges, setCanvasEdges] = useState<StudioFlowEdge[]>(() => cloneStudioFlowEdges(sourceCanvas.edges));
  const canvasNodesRef = useRef(canvasNodes);
  const canvasEdgesRef = useRef(canvasEdges);
  const hiddenGroupIdsRef = useRef(hiddenGroupIds);
  const layoutModeRef = useRef(layoutMode);
  const isReactFlowDemo = Boolean(demo);
  const isBlueprintDiagram = flow.id === "react-flow-system-blueprint";
  const showMiniMap = !isBlueprintDiagram || selectedView?.id !== "blueprint-full";
  const rawDisplayNodes = useMemo(
    () => getDisplayStudioFlowNodes(canvasNodes, hiddenGroupIds, layoutMode, canvasMode),
    [canvasMode, canvasNodes, hiddenGroupIds, layoutMode]
  );
  const rawDisplayEdges = useMemo(() => getDisplayStudioFlowEdges(canvasEdges, rawDisplayNodes), [canvasEdges, rawDisplayNodes]);
  const relatedNodeIds = useMemo(
    () => getConnectedStudioFlowNodeIds(selectedNodeId, rawDisplayEdges),
    [rawDisplayEdges, selectedNodeId]
  );
  const focusedDisplayNodes = useMemo(
    () => (focusMode && relatedNodeIds ? rawDisplayNodes.filter((node) => relatedNodeIds.has(node.id)) : rawDisplayNodes),
    [focusMode, rawDisplayNodes, relatedNodeIds]
  );
  const focusedDisplayEdges = useMemo(
    () => (
      focusMode && relatedNodeIds
        ? rawDisplayEdges.filter((edge) => relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target))
        : rawDisplayEdges
    ),
    [focusMode, rawDisplayEdges, relatedNodeIds]
  );
  const displayNodes = useMemo(
    () => focusedDisplayNodes.map<StudioFlowCanvasNode>((node) => ({
      ...node,
      data: {
        ...node.data,
        dimmed: Boolean(relatedNodeIds && !relatedNodeIds.has(node.id))
      }
    })),
    [focusedDisplayNodes, relatedNodeIds]
  );
  const displayEdges = useMemo(
    () => focusedDisplayEdges.map<StudioFlowEdge>((edge) => {
      const isRelated = relatedNodeIds ? relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target) : false;
      return {
        ...edge,
        className: relatedNodeIds ? (isRelated ? "is-focus-edge" : "is-dimmed") : edge.className
      };
    }),
    [focusedDisplayEdges, relatedNodeIds]
  );
  const isCompactDiagram = displayNodes.some((node) => node.data.compact);
  const flowMetrics = useMemo(() => getStudioFlowMetrics(displayNodes, displayEdges), [displayEdges, displayNodes]);
  const selectedNode = displayNodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = displayEdges.find((edge) => edge.id === selectedEdgeId) ?? null;
  const trail = useMemo(
    () => getStudioFlowTrail(selectedNodeId, rawDisplayNodes, rawDisplayEdges),
    [rawDisplayEdges, rawDisplayNodes, selectedNodeId]
  );
  const groupNodes = useMemo(
    () => canvasNodes.filter((node) => node.data.kind === "group"),
    [canvasNodes]
  );
  const layoutPresetOptions = useMemo(
    () => [
      { mode: "source" as const, label: copy.flows.layoutPresetSource, icon: LuRotateCw },
      { mode: "compact" as const, label: copy.flows.layoutPresetCompact, icon: LuMinimize2 },
      { mode: "wide" as const, label: copy.flows.layoutPresetWide, icon: LuMaximize2 },
      { mode: "vertical" as const, label: copy.flows.layoutPresetTall, icon: LuArrowUpDown },
      { mode: "grid" as const, label: copy.flows.layoutPresetGrid, icon: LuLayoutDashboard }
    ],
    [copy.flows]
  );
  let fitViewPadding = 0.24;
  if (isReactFlowDemo) fitViewPadding = isBlueprintDiagram ? 0.08 : 0.14;
  if (isCompactDiagram && !isBlueprintDiagram) fitViewPadding = 0.18;

  const fitCurrentBoard = useCallback((duration = 260) => {
    void flowInstanceRef.current?.fitView({
      padding: fitViewPadding,
      duration,
      minZoom: isBlueprintDiagram ? 0.16 : isReactFlowDemo ? 0.26 : 0.5
    });
  }, [fitViewPadding, isBlueprintDiagram, isReactFlowDemo]);

  const scheduleFitBoard = useCallback(() => {
    window.setTimeout(() => fitCurrentBoard(220), 80);
  }, [fitCurrentBoard]);

  useEffect(() => {
    canvasNodesRef.current = canvasNodes;
  }, [canvasNodes]);

  useEffect(() => {
    canvasEdgesRef.current = canvasEdges;
  }, [canvasEdges]);

  useEffect(() => {
    hiddenGroupIdsRef.current = hiddenGroupIds;
  }, [hiddenGroupIds]);

  useEffect(() => {
    layoutModeRef.current = layoutMode;
  }, [layoutMode]);

  const resetCanvasToSource = useCallback((viewId?: string) => {
    const nextCanvas = buildStudioFlowCanvas(flow, copy.flows, viewId);
    setCanvasNodes(cloneStudioFlowNodes(nextCanvas.nodes));
    setCanvasEdges(cloneStudioFlowEdges(nextCanvas.edges));
    setHiddenGroupIds([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    setCopiedNode(null);
    setHistory([]);
    setFuture([]);
    setLayoutMode("source");
    setPendingLayoutMode("source");
    setHelperLines({ x: null, y: null });
    scheduleFitBoard();
  }, [copy.flows, flow, scheduleFitBoard]);

  useEffect(() => {
    if (!isBoardFullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsBoardFullscreen(false);
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener("keydown", onKeyDown);
    };
  }, [isBoardFullscreen]);

  useEffect(() => {
    const onResize = () => scheduleFitBoard();
    globalThis.addEventListener("resize", onResize);
    return () => globalThis.removeEventListener("resize", onResize);
  }, [scheduleFitBoard]);

  const captureHistory = useCallback(() => {
    const snapshot = createStudioFlowSnapshot(
      canvasNodesRef.current,
      canvasEdgesRef.current,
      hiddenGroupIdsRef.current,
      layoutModeRef.current
    );
    setHistory((current) => [...current.slice(-(FLOW_HISTORY_LIMIT - 1)), snapshot]);
    setFuture([]);
  }, []);

  const restoreSnapshot = useCallback((snapshot: StudioFlowSnapshot) => {
    setCanvasNodes(cloneStudioFlowNodes(snapshot.nodes));
    setCanvasEdges(cloneStudioFlowEdges(snapshot.edges));
    setHiddenGroupIds([...snapshot.hiddenGroupIds]);
    setLayoutMode(snapshot.layoutMode);
    setPendingLayoutMode(snapshot.layoutMode);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    setHelperLines({ x: null, y: null });
  }, []);

  const handleUndo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((current) => [
      createStudioFlowSnapshot(canvasNodesRef.current, canvasEdgesRef.current, hiddenGroupIdsRef.current, layoutModeRef.current),
      ...current.slice(0, FLOW_HISTORY_LIMIT - 1)
    ]);
    setHistory((current) => current.slice(0, -1));
    restoreSnapshot(previous);
    track("studio_flow_history_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "undo",
      remaining: Math.max(history.length - 1, 0)
    });
  };

  const handleRedo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((current) => [
      ...current.slice(-(FLOW_HISTORY_LIMIT - 1)),
      createStudioFlowSnapshot(canvasNodesRef.current, canvasEdgesRef.current, hiddenGroupIdsRef.current, layoutModeRef.current)
    ]);
    setFuture((current) => current.slice(1));
    restoreSnapshot(next);
    track("studio_flow_history_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "redo",
      remaining: Math.max(future.length - 1, 0)
    });
  };

  const handleNodesChange = useCallback((changes: StudioFlowNodeChange[]) => {
    void loadStudioFlowRuntime().then(({ applyStudioFlowNodeChanges }) => {
      setCanvasNodes((current) => applyStudioFlowNodeChanges(changes, current));
    });
  }, []);

  const handleEdgesChange = useCallback((changes: StudioFlowEdgeChange[]) => {
    void loadStudioFlowRuntime().then(({ applyStudioFlowEdgeChanges }) => {
      setCanvasEdges((current) => applyStudioFlowEdgeChanges(changes, current));
    });
  }, []);

  const updateHelperLines = useCallback((node: StudioFlowCanvasNode) => {
    const threshold = 8;
    let nextX: number | null = null;
    let nextY: number | null = null;
    for (const candidate of canvasNodesRef.current) {
      if (candidate.id === node.id || candidate.hidden || candidate.data.kind === "group") continue;
      if (Math.abs(candidate.position.x - node.position.x) <= threshold) nextX = candidate.position.x;
      if (Math.abs(candidate.position.y - node.position.y) <= threshold) nextY = candidate.position.y;
      if (nextX !== null && nextY !== null) break;
    }
    setHelperLines({ x: nextX, y: nextY });
  }, []);

  const handleConnect = useCallback((connection: StudioFlowConnection) => {
    if (canvasMode !== "edit" || !connection.source || !connection.target || connection.source === connection.target) return;
    captureHistory();
    const newEdge: StudioFlowEdge = {
      ...connection,
      id: createScratchNodeId("scratch-edge"),
      type: "smoothstep",
      label: "review link",
      markerEnd: { type: FLOW_MARKER_ARROW_CLOSED },
      style: { stroke: flowCanvasToneColors.review, strokeWidth: 2.2 },
      labelStyle: { fill: flowCanvasToneColors.review, fontSize: 11, fontWeight: 700 },
      labelBgStyle: { fill: "var(--card)", fillOpacity: 0.9 },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 6
    };
    void loadStudioFlowRuntime().then(({ addStudioFlowEdge }) => {
      setCanvasEdges((current) => addStudioFlowEdge(newEdge, current));
    });
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "connect",
      source_id: connection.source,
      target_id: connection.target
    });
  }, [canvasMode, captureHistory, flow.id, selectedView?.id]);

  const handleCanvasModeChange = (nextMode: StudioFlowCanvasMode) => {
    setCanvasMode(nextMode);
    setHelperLines({ x: null, y: null });
    track("studio_flow_canvas_mode_change", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      from: canvasMode,
      to: nextMode
    });
  };

  const handleApplyLayout = (nextLayoutMode = pendingLayoutMode) => {
    captureHistory();
    if (nextLayoutMode === "source") {
      setCanvasNodes((current) => getSourcePositionedStudioFlowNodes(current, sourceCanvas.nodes));
      setHiddenGroupIds([]);
    } else {
      setCanvasNodes((current) => getLayoutedStudioFlowNodes(current, nextLayoutMode));
    }
    setLayoutMode(nextLayoutMode);
    setPendingLayoutMode(nextLayoutMode);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    scheduleFitBoard();
    track("studio_flow_layout_apply", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      layout_mode: nextLayoutMode,
      node_count: canvasNodesRef.current.length,
      edge_count: canvasEdgesRef.current.length
    });
  };

  const handleResetBoard = () => {
    captureHistory();
    setCanvasNodes(cloneStudioFlowNodes(sourceCanvas.nodes));
    setCanvasEdges(cloneStudioFlowEdges(sourceCanvas.edges));
    setHiddenGroupIds([]);
    setLayoutMode("source");
    setPendingLayoutMode("source");
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    setHelperLines({ x: null, y: null });
    scheduleFitBoard();
    track("studio_flow_history_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "reset"
    });
  };

  const handleFitBoard = () => {
    fitCurrentBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "fit_view"
    });
  };

  const handleCopyNode = () => {
    if (!selectedNode || selectedNode.data.kind === "group") return;
    setCopiedNode(cloneStudioFlowNodeForPaste(selectedNode));
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "copy",
      node_id: selectedNode.id,
      node_kind: selectedNode.data.kind
    });
  };

  const handlePasteNode = () => {
    const sourceNode = copiedNode ?? (selectedNode && selectedNode.data.kind !== "group" ? selectedNode : null);
    if (!sourceNode) return;
    captureHistory();
    const pastedNode = cloneStudioFlowNodeForPaste(sourceNode);
    setCanvasNodes((current) => [
      ...current.map((node) => ({ ...node, selected: false })),
      pastedNode
    ]);
    setSelectedNodeId(pastedNode.id);
    setSelectedEdgeId(null);
    scheduleFitBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "paste",
      source_node_id: sourceNode.id,
      node_kind: sourceNode.data.kind
    });
  };

  const handleAddNote = () => {
    captureHistory();
    const noteNode = createScratchNoteNode(copy.flows, selectedNode ?? undefined);
    setCanvasNodes((current) => [
      ...current.map((node) => ({ ...node, selected: false })),
      noteNode
    ]);
    setSelectedNodeId(noteNode.id);
    setSelectedEdgeId(null);
    scheduleFitBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "add_note"
    });
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode || selectedNode.data.kind === "group") return;
    captureHistory();
    setCanvasNodes((current) => current.filter((node) => node.id !== selectedNode.id));
    setCanvasEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    scheduleFitBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "delete",
      node_id: selectedNode.id,
      node_kind: selectedNode.data.kind
    });
  };

  const handleToggleGroup = (groupId: string) => {
    captureHistory();
    let hiddenNext = false;
    setHiddenGroupIds((current) => {
      if (current.includes(groupId)) return current.filter((id) => id !== groupId);
      hiddenNext = true;
      return [...current, groupId];
    });
    scheduleFitBoard();
    track("studio_flow_group_visibility_toggle", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      group_id: groupId,
      hidden_next: hiddenNext
    });
  };

  const handleTrailNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    scheduleFitBoard();
    track("studio_flow_node_select", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      node_id: nodeId,
      source: "trail"
    });
  }, [flow.id, scheduleFitBoard, selectedView?.id]);

  const handleToggleFocusMode = useCallback((nextFocusMode = !focusMode) => {
    if (!selectedNode) return;
    setFocusMode(nextFocusMode);
    scheduleFitBoard();
    track("studio_flow_focus_toggle", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      node_id: selectedNode.id,
      enabled: nextFocusMode
    });
  }, [flow.id, focusMode, scheduleFitBoard, selectedNode, selectedView?.id]);

  const toggleFullscreen = () => {
    const fullscreenNext = !isBoardFullscreen;
    track("studio_flow_board_fullscreen_toggle", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      fullscreen_next: fullscreenNext
    });
    setIsBoardFullscreen(fullscreenNext);
  };

  return (
    <section className={`flow-chart-surface${isReactFlowDemo ? " is-architecture-demo" : ""}${isBlueprintDiagram ? " is-blueprint-diagram" : ""}${isCompactDiagram ? " is-compact-diagram" : ""}${isBoardFullscreen ? " is-fullscreen" : ""}`} aria-label={copy.flows.chartLabel}>
      <div className="flow-chart-head">
        <div>
          <h3>{selectedView?.title ?? flow.title}</h3>
        </div>
        <p>{selectedView?.description ?? copy.flows.chartHint}</p>
      </div>

      <div className={`flow-board-toolbar${demo && selectedView ? " has-selectors" : ""}`} aria-label={copy.flows.boardTools}>
        {demo && selectedView && (
          <div className="flow-example-toolbar" aria-label={copy.flows.exampleSelectorLabel}>
            <label>
              <span>{copy.flows.exampleFamily}</span>
              <select
                value={selectedFamily}
                onChange={(event) => {
                  const nextFamily = event.target.value;
                  const nextView = demo.views.find((view) => view.family === nextFamily);
                  track("studio_flow_example_select", {
                    flow_id: flow.id,
                    source: "family_select",
                    previous_family: selectedFamily,
                    previous_view_id: selectedView?.id,
                    next_family: nextFamily,
                    next_view_id: nextView?.id
                  });
                  setDemoSelection({
                    flowId: flow.id,
                    family: nextFamily,
                    viewId: nextView?.id ?? ""
                  });
                  resetCanvasToSource(nextView?.id);
                }}
              >
                {familyOptions.map((family) => (
                  <option key={family.value} value={family.value}>
                    {family.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{copy.flows.exampleView}</span>
              <select
                value={selectedView.id}
                onChange={(event) => {
                  const nextView = demo.views.find((view) => view.id === event.target.value);
                  track("studio_flow_example_select", {
                    flow_id: flow.id,
                    source: "view_select",
                    previous_family: selectedFamily,
                    previous_view_id: selectedView.id,
                    next_family: nextView?.family ?? selectedFamily,
                    next_view_id: event.target.value
                  });
                  setDemoSelection({
                    flowId: flow.id,
                    family: nextView?.family ?? selectedFamily,
                    viewId: event.target.value
                  });
                  resetCanvasToSource(event.target.value);
                }}
              >
                {selectedFamilyViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="flow-canvas-toolbar" aria-label={copy.flows.boardTools}>
          <div className="flow-layout-presets" aria-label={copy.flows.layoutPreset}>
            {layoutPresetOptions.map((preset) => {
              const PresetIcon = preset.icon;
              return (
                <button
                  key={preset.mode}
                  type="button"
                  className={layoutMode === preset.mode ? "is-active" : ""}
                  aria-pressed={layoutMode === preset.mode}
                  title={preset.label}
                  onClick={() => handleApplyLayout(preset.mode)}
                >
                  <PresetIcon aria-hidden="true" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
          <label>
            <span>{copy.flows.canvasMode}</span>
            <select
              value={canvasMode}
              onChange={(event) => handleCanvasModeChange(event.target.value as StudioFlowCanvasMode)}
            >
              <option value="inspect">{copy.flows.inspectMode}</option>
              <option value="edit">{copy.flows.editMode}</option>
            </select>
          </label>
          <label>
            <span>{copy.flows.layoutMode}</span>
            <select
              value={pendingLayoutMode}
              onChange={(event) => setPendingLayoutMode(event.target.value as StudioFlowLayoutMode)}
            >
              <option value="source">{copy.flows.layoutSource}</option>
              <option value="compact">{copy.flows.layoutPresetCompact}</option>
              <option value="horizontal">{copy.flows.layoutHorizontal}</option>
              <option value="wide">{copy.flows.layoutPresetWide}</option>
              <option value="vertical">{copy.flows.layoutVertical}</option>
              <option value="grid">{copy.flows.layoutGrid}</option>
            </select>
          </label>
          <button type="button" aria-label={copy.flows.applyLayout} title={copy.flows.applyLayout} onClick={() => handleApplyLayout()}>
            <LuArrowUpDown aria-hidden="true" />
            <span>{copy.flows.applyLayout}</span>
          </button>
          <button type="button" aria-label={copy.flows.fitBoard} title={copy.flows.fitBoard} onClick={handleFitBoard}>
            <LuScanLine aria-hidden="true" />
            <span>{copy.flows.fitBoard}</span>
          </button>
          <button type="button" aria-label={copy.flows.resetBoard} title={copy.flows.resetBoard} onClick={handleResetBoard}>
            <LuRotateCw aria-hidden="true" />
            <span>{copy.flows.resetBoard}</span>
          </button>
          <button type="button" aria-label={copy.flows.undo} title={copy.flows.undo} onClick={handleUndo} disabled={history.length === 0}>
            <LuUndo2 aria-hidden="true" />
            <span>{copy.flows.undo}</span>
          </button>
          <button type="button" aria-label={copy.flows.redo} title={copy.flows.redo} onClick={handleRedo} disabled={future.length === 0}>
            <LuRedo2 aria-hidden="true" />
            <span>{copy.flows.redo}</span>
          </button>
          <button type="button" aria-label={copy.flows.copyNode} title={copy.flows.copyNode} onClick={handleCopyNode} disabled={!selectedNode || selectedNode.data.kind === "group"}>
            <LuCopy aria-hidden="true" />
            <span>{copy.flows.copyNode}</span>
          </button>
          <button type="button" aria-label={copy.flows.pasteNode} title={copy.flows.pasteNode} onClick={handlePasteNode} disabled={!copiedNode && (!selectedNode || selectedNode.data.kind === "group")}>
            <LuClipboardList aria-hidden="true" />
            <span>{copy.flows.pasteNode}</span>
          </button>
          <button type="button" aria-label={copy.flows.addNote} title={copy.flows.addNote} onClick={handleAddNote}>
            <LuPlusCircle aria-hidden="true" />
            <span>{copy.flows.addNote}</span>
          </button>
          <button type="button" aria-label={copy.flows.deleteNode} title={copy.flows.deleteNode} onClick={handleDeleteSelectedNode} disabled={!selectedNode || selectedNode.data.kind === "group"}>
            <LuX aria-hidden="true" />
            <span>{copy.flows.deleteNode}</span>
          </button>
        </div>
        <div className="flow-board-actionbar">
          <button
            type="button"
            className="flow-board-fullscreen-button"
            aria-label={focusMode ? copy.flows.fullGraph : copy.flows.isolate}
            disabled={!selectedNode}
            onClick={() => handleToggleFocusMode()}
          >
            {focusMode ? <LuMaximize2 aria-hidden="true" /> : <LuMinimize2 aria-hidden="true" />}
            <span>{focusMode ? copy.flows.fullGraph : copy.flows.isolate}</span>
          </button>
          <button
            type="button"
            className="flow-board-fullscreen-button"
            aria-label={isBoardFullscreen ? copy.flows.exitFullscreen : copy.flows.enterFullscreen}
            onClick={toggleFullscreen}
          >
            {isBoardFullscreen ? <LuMinimize2 aria-hidden="true" /> : <LuMaximize2 aria-hidden="true" />}
            <span>{isBoardFullscreen ? copy.flows.exitFullscreen : copy.flows.enterFullscreen}</span>
          </button>
        </div>
      </div>

      <div className="flow-canvas-shell">
        <StudioFlowCanvasFeature
          key={selectedView?.id ?? flow.id}
          locale={locale}
          surfaceClassName={`flow-react-surface${isReactFlowDemo ? " is-architecture-demo" : ""}${isBlueprintDiagram ? " is-blueprint-diagram" : ""}${isCompactDiagram ? " is-compact-diagram" : ""}${canvasMode === "edit" ? " is-edit-mode" : ""}`}
          className="flow-react-canvas"
          nodes={displayNodes}
          edges={displayEdges}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
          }}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(event, node) => {
            event.stopPropagation();
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            track("studio_flow_node_select", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              node_id: node.id,
              node_kind: node.data.kind,
              node_tone: node.data.tone
            });
          }}
          onNodeDoubleClick={(event, node) => {
            event.stopPropagation();
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            setFocusMode(true);
            scheduleFitBoard();
            track("studio_flow_focus_toggle", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              node_id: node.id,
              enabled: true,
              source: "double_click"
            });
          }}
          onEdgeClick={(event, edge) => {
            event.stopPropagation();
            setSelectedEdgeId(edge.id);
            setSelectedNodeId(null);
            setFocusMode(false);
            track("studio_flow_node_select", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              edge_id: edge.id,
              source_id: edge.source,
              target_id: edge.target
            });
          }}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
            setFocusMode(false);
          }}
          onNodeDragStart={(_, node) => {
            if (canvasMode !== "edit") return;
            captureHistory();
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
          }}
          onNodeDrag={(_, node) => {
            if (canvasMode === "edit") updateHelperLines(node);
          }}
          onNodeDragStop={(_, node) => {
            setHelperLines({ x: null, y: null });
            if (canvasMode !== "edit") return;
            track("studio_flow_node_action", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              action: "move",
              node_id: node.id,
              node_kind: node.data.kind
            });
          }}
          fitView
          fitViewOptions={{
            padding: fitViewPadding,
            minZoom: isBlueprintDiagram ? 0.16 : isReactFlowDemo ? 0.26 : 0.5
          }}
          minZoom={isBlueprintDiagram ? 0.1 : 0.18}
          maxZoom={isBlueprintDiagram ? 1.9 : 1.6}
          nodesDraggable={canvasMode === "edit"}
          nodesConnectable={canvasMode === "edit"}
          deleteKeyCode={null}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          blueprint={isBlueprintDiagram}
          helperLines={helperLines}
          showMiniMap={showMiniMap}
          trailPanel={(
            <StudioFlowTrailPanel
              activeNode={selectedNode}
              incoming={trail.incoming}
              outgoing={trail.outgoing}
              focusMode={focusMode}
              copy={copy.flows}
              onSelectNode={handleTrailNodeSelect}
            />
          )}
        />

        <aside className="flow-inspector-panel" aria-label={copy.flows.inspector}>
          <div className="flow-inspector-head">
            <strong>{copy.flows.inspector}</strong>
            <span>{layoutMode === "source" ? copy.flows.layoutSource : layoutMode}</span>
          </div>
          <div className="flow-metric-strip" aria-label={copy.routeMetricsLabel}>
            <span><strong>{flowMetrics.nodeCount}</strong>{copy.flows.nodeCount}</span>
            <span><strong>{flowMetrics.edgeCount}</strong>{copy.flows.edgeCount}</span>
            <span><strong>{flowMetrics.groupCount}</strong>{copy.flows.groupCount}</span>
            <span><strong>{flowMetrics.hiddenCount}</strong>{copy.flows.hiddenCount}</span>
          </div>
          <p className="flow-sandbox-note">{copy.flows.boardSandbox}</p>
          <div className={`flow-selected-card${selectedNode ? " is-node" : ""}${selectedEdge ? " is-edge" : ""}`}>
            {selectedNode ? (
              <>
                <span>{copy.flows.nodeDetails}</span>
                <strong>{selectedNode.data.title}</strong>
                <p>{selectedNode.data.detail}</p>
                <div className="flow-node-meta-grid">
                  <small>{formatStudioFlowLabel(selectedNode.data.kind)}</small>
                  <small>{formatStudioFlowLabel(selectedNode.data.tone)}</small>
                  {selectedNode.data.badge ? <small>{selectedNode.data.badge}</small> : null}
                </div>
              </>
            ) : selectedEdge ? (
              <>
                <span>{copy.flows.edgeDetails}</span>
                <strong>{String(selectedEdge.label ?? selectedEdge.id)}</strong>
                <p>{`${selectedEdge.source} -> ${selectedEdge.target}`}</p>
                <small>{selectedEdge.type ?? "default"}</small>
              </>
            ) : (
              <p>{copy.flows.noSelection}</p>
            )}
          </div>
          {selectedNode && (
            <div className="flow-relation-map" aria-label={copy.flows.relationMap}>
              <div className="flow-relation-map-head">
                <strong>{copy.flows.relationMap}</strong>
                <button
                  type="button"
                  onClick={() => handleToggleFocusMode()}
                  disabled={!selectedNode}
                >
                  {focusMode ? copy.flows.fullGraph : copy.flows.isolate}
                </button>
              </div>
              <div className="flow-relation-columns">
                <StudioFlowTrailColumn
                  label={copy.flows.upstream}
                  items={trail.incoming}
                  emptyLabel={copy.flows.trailEmpty}
                  moreLabel={copy.flows.trailMore}
                  onSelectNode={handleTrailNodeSelect}
                />
                <StudioFlowTrailColumn
                  label={copy.flows.downstream}
                  items={trail.outgoing}
                  emptyLabel={copy.flows.trailEmpty}
                  moreLabel={copy.flows.trailMore}
                  onSelectNode={handleTrailNodeSelect}
                />
              </div>
            </div>
          )}
          {groupNodes.length > 0 && (
            <div className="flow-group-visibility" aria-label={copy.flows.groupCount}>
              {groupNodes.map((groupNode) => {
                const isHidden = hiddenGroupIds.includes(groupNode.id);
                return (
                  <button key={groupNode.id} type="button" onClick={() => handleToggleGroup(groupNode.id)}>
                    {isHidden ? <LuChevronRight aria-hidden="true" /> : <LuChevronDown aria-hidden="true" />}
                    <span>{groupNode.data.title}</span>
                    <small>{isHidden ? copy.flows.expandGroup : copy.flows.collapseGroup}</small>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {!demo && (
        <div className="flow-chart-outcome">
          <span>{copy.flows.chartOutcome}</span>
          <strong>{flow.outcome}</strong>
        </div>
      )}
    </section>
  );
}

function StudioFlowMenuPage({
  route,
  locale,
  copy,
  onActivate
}: {
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}) {
  const localizedFlows = useMemo(
    () => getLocalizedStudioDemoFlows(getLocalizedStudioFlows(locale), locale),
    [locale]
  );
  const localizedGroups = useMemo(() => getLocalizedStudioFlowGroups(locale), [locale]);
  const [copiedFlowId, setCopiedFlowId] = useState<string | null>(null);
  const selectedFlowId = flowIdFromRoute(route.id) ?? localizedFlows[0]?.id ?? "";
  const selectedFlow = localizedFlows.find((flow) => flow.id === selectedFlowId) ?? localizedFlows[0];
  const selectedGroup = selectedFlow ? localizedGroups.find((group) => group.id === selectedFlow.groupId) : undefined;

  const handleGroupSelect = (groupId: string) => {
    const firstFlowId = studioFlowGroups.find((group) => group.id === groupId)?.flowIds[0];
    if (!firstFlowId) return;
    track("studio_flow_group_select", {
      group_id: groupId,
      selected_flow_id: selectedFlow?.id,
      flow_count: studioFlows.filter((flow) => flow.groupId === groupId).length
    });
    onActivate(flowRouteId(firstFlowId), "route_actions");
  };

  const handleFlowSelect = (flowId: StudioFlowId) => {
    onActivate(flowRouteId(flowId), "route_actions");
  };

  const copyFlowLink = async () => {
    if (!selectedFlow) return;
    const href = `${window.location.origin}${studioFlowHref(locale, selectedFlow.id)}`;

    try {
      await navigator.clipboard.writeText(href);
      setCopiedFlowId(selectedFlow.id);
      window.setTimeout(() => setCopiedFlowId(null), 1600);
      track("studio_flow_share", {
        flow_id: selectedFlow.id,
        group_id: selectedFlow.groupId,
        share_path: studioFlowHref(locale, selectedFlow.id)
      });
    } catch {
      track("studio_flow_share", {
        flow_id: selectedFlow.id,
        group_id: selectedFlow.groupId,
        failed: true
      });
    }
  };

  if (!selectedFlow) {
    return (
      <section className="empty-route card">
        <LuWorkflow aria-hidden="true" />
        <strong>{copy.flows.emptyTitle}</strong>
        <p>{copy.flows.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="route-page studio-flow-route">
      {selectedFlow.architectureDemo && <h2 className="sr-only">{selectedFlow.title}</h2>}
      {!selectedFlow.architectureDemo && (
        <>
          <RouteHeading route={route} copy={copy}>
            <button type="button" className="outline-button" onClick={copyFlowLink}>
              {copiedFlowId === selectedFlow.id ? <LuCheck aria-hidden="true" /> : <LuShare2 aria-hidden="true" />}
              {copiedFlowId === selectedFlow.id ? copy.flows.copied : copy.flows.shareFlow}
            </button>
          </RouteHeading>

        </>
      )}

      <div
        className={`flow-workbench card${selectedFlow.architectureDemo ? " is-architecture-demo" : ""}`}
        data-studio-module="flow-menu"
      >
        {!selectedFlow.architectureDemo && (
          <aside className="flow-index-pane" aria-label={copy.flows.flowListLabel}>
            <div className="ai-pane-head">
              <span><LuWorkflow aria-hidden="true" /></span>
              <div>
                <h2>{copy.flows.menu}</h2>
                <p>{copy.flows.menuDetail}</p>
              </div>
            </div>

            <div className="flow-group-list" aria-label={copy.flows.groupMenuLabel}>
              {localizedGroups.map((group) => {
                const active = selectedFlow.groupId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`flow-group-button${active ? " is-active" : ""}`}
                    onClick={() => handleGroupSelect(group.id)}
                  >
                    <strong>{group.title}</strong>
                    <small>{group.subtitle}</small>
                  </button>
                );
              })}
            </div>

            <div className="flow-list">
              {localizedFlows.map((flow) => {
                const active = selectedFlow.id === flow.id;
                return (
                  <a
                    key={flow.id}
                    href={studioFlowHref(locale, flow.id)}
                    className={`flow-list-button${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      handleFlowSelect(flow.id);
                    }}
                  >
                    <span>
                      <strong>{flow.title}</strong>
                      <small>{flow.summary}</small>
                    </span>
                    <em>{flow.architectureDemo?.views.length ?? flow.steps.length}</em>
                  </a>
                );
              })}
            </div>
          </aside>
        )}

        <article id={`flow-${selectedFlow.id}`} className="flow-reader-pane" aria-label={copy.flows.selectedFlow}>
          {!selectedFlow.architectureDemo && (
            <>
              <div className="skill-reader-head">
                <div>
                  <span className="ai-status-pill status-ready">{selectedGroup?.title ?? selectedFlow.groupId}</span>
                  <h2>{selectedFlow.title}</h2>
                  <p>{selectedFlow.summary}</p>
                </div>
                <a className="outline-button" href={studioFlowHref(locale, selectedFlow.id)}>
                  <LuLink aria-hidden="true" />
                  {copy.flows.openFlow}
                </a>
              </div>

              <div className="ai-tag-list" aria-label={copy.flows.tags}>
                {selectedFlow.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </>
          )}

          <StudioFlowChart key={`${locale}:${selectedFlow.id}`} flow={selectedFlow} copy={copy} locale={locale} />

          {!selectedFlow.architectureDemo && (
            <ol className="flow-step-map" aria-label={`${copy.flows.evidence} / ${copy.flows.output}`}>
              {selectedFlow.steps.map((step, index) => (
                <li key={step.id} className="flow-step-node">
                  <span className="flow-step-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                    <dl>
                      <div>
                        <dt>{copy.flows.evidence}</dt>
                        <dd>{step.evidence}</dd>
                      </div>
                      <div>
                        <dt>{copy.flows.output}</dt>
                        <dd>{step.output}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        {!selectedFlow.architectureDemo && (
          <aside className="flow-side-pane" aria-label={copy.flows.details}>
            <section>
              <h3>{copy.flows.useWhen}</h3>
              <p>{selectedFlow.useWhen}</p>
            </section>
            <section>
              <h3>{copy.flows.outcome}</h3>
              <p>{selectedFlow.outcome}</p>
            </section>
            <section>
              <h3>{copy.flows.officeExample}</h3>
              <p>{selectedFlow.officeExample}</p>
            </section>
            <section>
              <h3>{copy.flows.artifacts}</h3>
              <ul>
                {selectedFlow.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{copy.flows.cvSignals}</h3>
              <ul>
                {selectedFlow.cvSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </section>
          </aside>
        )}
      </div>
    </section>
  );
}

function CalendarPage({ route }: { route: StudioRoute }) {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuCalendarDays aria-hidden="true" />
          New event
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <section className="calendar-card card">
        <div className="calendar-grid">
          {days.map((day) => (
            <button key={day} type="button" className={day === 20 || day === 24 ? "has-event" : ""}>
              <span>{day}</span>
              {(day === 20 || day === 24) && <small>{day === 20 ? "Review" : "Release"}</small>}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function KanbanPage({ route }: { route: StudioRoute }) {
  const columns = [
    { title: "Todo", tasks: ["Map admin routes", "Wire command search", "Check mobile drawer"] },
    { title: "In progress", tasks: ["Studio Shadow shell", "Route view parity"] },
    { title: "Done", tasks: ["Default dashboard replica", "CV return links"] }
  ];
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuKanbanSquare aria-hidden="true" />
          Add card
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="kanban-board">
        {columns.map((column) => (
          <section className="kanban-column" key={column.title}>
            <h2>{column.title}</h2>
            {column.tasks.map((task) => (
              <article className="kanban-card" key={task}>{task}</article>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

function InvoicePage({ route }: { route: StudioRoute }) {
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <a className="outline-button" href={APP_ROUTE.CV_PDF} target="_blank" rel="noreferrer">
          <LuDownload aria-hidden="true" />
          Export
        </a>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="invoice-layout">
        <section className="card route-panel">
          <h2>Invoice form</h2>
          {["Client", "Project", "Due date"].map((label) => (
            <label className="form-row" key={label}>
              <span>{label}</span>
              <input defaultValue={label === "Client" ? "Nguyen Le Phong" : ""} />
            </label>
          ))}
        </section>
        <section className="invoice-paper">
          <strong>Invoice #18425</strong>
          <p>Studio implementation</p>
          <div className="invoice-line"><span>Dashboard shell</span><b>$1,250.00</b></div>
          <div className="invoice-line"><span>Interaction testing</span><b>$420.00</b></div>
          <div className="invoice-total"><span>Total</span><b>$1,670.00</b></div>
        </section>
      </div>
    </section>
  );
}

function UsersRolesPage({ route }: { route: StudioRoute }) {
  const rows = route.kind === "roles"
    ? [
        ["Admin", "Full access", "8 users"],
        ["Editor", "Content and workflow", "18 users"],
        ["Viewer", "Read-only", "42 users"]
      ]
    : [
        ["Aiy Rand", "Product", "Active"],
        ["Sarah Parker", "Enterprise", "Active"],
        ["Michael Brown", "Growth", "Pending"],
        ["Linda Chen", "Analytics", "Active"]
      ];
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuUserPlus aria-hidden="true" />
          Invite
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <section className="card records-card">
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>{route.kind === "roles" ? "Role" : "User"}</th>
                <th>{route.kind === "roles" ? "Scope" : "Team"}</th>
                <th>{route.kind === "roles" ? "Members" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  <td><strong>{row[0]}</strong></td>
                  <td>{row[1]}</td>
                  <td><span className="soft-pill">{row[2]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function AuthPage({ route }: { route: StudioRoute }) {
  const isRegister = route.id.includes("register");
  return (
    <section className="auth-route">
      <RouteHeading route={route} />
      <RouteMetricGrid metrics={route.metrics} />
      <div className="auth-card card">
        <div className="auth-brand">
          <LuCommand aria-hidden="true" />
          <span>Studio</span>
        </div>
        <h3>{route.title}</h3>
        <p>{route.description}</p>
        <label className="form-row">
          <span>Email</span>
          <input type="email" defaultValue="phongnguyen.itengineer@gmail.com" />
        </label>
        {isRegister && (
          <label className="form-row">
            <span>Name</span>
            <input defaultValue="Nguyen Le Phong" />
          </label>
        )}
        <label className="form-row">
          <span>Password</span>
          <input type="password" defaultValue="studio-admin" />
        </label>
        <button type="button" className="primary-action">{isRegister ? "Create account" : "Sign in"}</button>
      </div>
    </section>
  );
}

function DefaultDashboard({
  locale,
  workstreamSearch,
  statusFilter,
  sortMode,
  onWorkstreamSearch,
  onStatusFilter,
  onSortMode
}: {
  locale: string;
  workstreamSearch: string;
  statusFilter: string;
  sortMode: string;
  onWorkstreamSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
}) {
  const filteredWorkstreams = useMemo(() => {
    const query = workstreamSearch.trim().toLowerCase();
    const rows = workstreamRows.filter((workstream) => {
      const matchesQuery = !query || [workstream.name, workstream.id, workstream.status, workstream.billing, workstream.plan].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all" || workstream.status.toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return rows.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "status") return a.status.localeCompare(b.status);
      return b.id.localeCompare(a.id);
    });
  }, [sortMode, statusFilter, workstreamSearch]);

  return (
    <section className="route-page">
      <RouteMetricGrid metrics={defaultMetrics} />

      <section className="card activity-card" id="release-signal" data-slot="card">
        <header className="card-header activity-header">
          <div>
            <h2>Release Activity</h2>
            <p>Release Signal across rollout volume, platform health, and incident noise.</p>
          </div>
          <div className="card-actions">
            <select className="native-select" defaultValue="quarter" aria-label="Period">
              <option value="quarter">6 weeks</option>
              <option value="sprint">Current sprint</option>
            </select>
            <select className="native-select" defaultValue="all" aria-label="Segment">
              <option value="all">All services</option>
              <option value="edge">Edge/API</option>
              <option value="workers">Workers</option>
            </select>
            <a href={APP_ROUTE.CV_PDF} className="outline-button" target="_blank" rel="noreferrer">
              View report
            </a>
          </div>
        </header>
        <StudioDeliverySignalFeature locale={locale} />
      </section>

      <section className="card records-card workstreams-card" id="system-workstreams" data-slot="card">
        <header className="card-header table-header">
          <div>
            <h2>12 Workstreams</h2>
            <p>System Workstreams with status, risk, area, and last-update activity.</p>
          </div>
          <a href={APP_ROUTE.CV_PDF} className="outline-button" target="_blank" rel="noreferrer">
            <LuDownload aria-hidden="true" />
            Export
          </a>
        </header>

        <div className="table-toolbar">
          <label className="workstream-search">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search workstreams</span>
            <input type="search" placeholder="Search workstreams..." value={workstreamSearch} onChange={(event) => onWorkstreamSearch(event.target.value)} />
          </label>
          <select className="native-select" value={statusFilter} onChange={(event) => onStatusFilter(event.target.value)} aria-label="Status filter">
            <option value="all">Status</option>
            <option value="healthy">Healthy</option>
            <option value="watching">Watching</option>
            <option value="blocked">Blocked</option>
            <option value="queued">Queued</option>
          </select>
          <span className="toolbar-spacer" />
          <select className="native-select" value={sortMode} onChange={(event) => onSortMode(event.target.value)} aria-label="Sort workstreams">
            <option value="joined">Last update</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="Select all workstreams" /></th>
                <th>Workstream</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Area</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkstreams.map((workstream) => (
                <tr key={workstream.id}>
                  <td><input type="checkbox" aria-label={`Select ${workstream.name}`} /></td>
                  <td data-label="Workstream">
                    <div className="workstream-cell">
                      <span className="workstream-avatar"><LuServer aria-hidden="true" /></span>
                      <span><strong>{workstream.name}</strong><small>{workstream.id}</small></span>
                    </div>
                  </td>
                  <td data-label="Status"><span className="soft-pill">{workstream.status}</span></td>
                  <td data-label="Risk">
                    <span className={`billing-pill billing-${workstream.billingTone}`}>
                      {workstream.billingTone === "paid" && <LuCheck aria-hidden="true" />}
                      {workstream.billing}
                    </span>
                  </td>
                  <td data-label="Area">{workstream.plan}</td>
                  <td data-label="Updated"><span className="joined-cell"><strong>{workstream.joined}</strong><small>{workstream.time}</small></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <DashboardKpiStrip />

      <div className="ops-detail-grid">
        <ComponentInventoryCard />
        <DistributionCard />
        <ReleaseChecklistCard />
      </div>
    </section>
  );
}

function RouteContent({
  route,
  locale,
  copy,
  profileActions,
  workstreamSearch,
  statusFilter,
  sortMode,
  onWorkstreamSearch,
  onStatusFilter,
  onSortMode,
  onActivate
}: {
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  profileActions: StudioProfileMenuItem[];
  workstreamSearch: string;
  statusFilter: string;
  sortMode: string;
  onWorkstreamSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}) {
  if (route.kind === "welcome") return <WelcomePage route={route} locale={locale} copy={copy} onActivate={onActivate} />;
  if (route.kind === "default") {
    return (
      <DefaultDashboard
        locale={locale}
        workstreamSearch={workstreamSearch}
        statusFilter={statusFilter}
        sortMode={sortMode}
        onWorkstreamSearch={onWorkstreamSearch}
        onStatusFilter={onStatusFilter}
        onSortMode={onSortMode}
      />
    );
  }
  if (route.kind === "mail") return <MailRoutePage route={route} />;
  if (route.kind === "chat") return <ChatRoutePage route={route} />;
  if (route.kind === "ai-setup") return <AiAgentSetupPage route={route} locale={locale} copy={copy} profileActions={profileActions} />;
  if (route.kind === "ai-skills") return <AiSkillsPage route={route} locale={locale} copy={copy} />;
  if (route.kind === "checklists") return <DeliveryChecklistsPage route={route} locale={locale} copy={copy} />;
  if (route.kind === "flows") return <StudioFlowMenuPage route={route} locale={locale} copy={copy} onActivate={onActivate} />;
  if (route.kind === "calendar") return <CalendarPage route={route} />;
  if (route.kind === "kanban") return <KanbanPage route={route} />;
  if (route.kind === "invoice") return <InvoicePage route={route} />;
  if (route.kind === "users" || route.kind === "roles") return <UsersRolesPage route={route} />;
  if (route.kind === "auth") return <AuthPage route={route} />;
  return <StudioAuxiliaryDashboardsFeature route={route} locale={locale} />;
}

function CommandDialog({
  open,
  query,
  locale,
  activeRoute,
  copy,
  routes,
  routeResults,
  profileItems,
  onQuery,
  onClose,
  onActivate
}: {
  open: boolean;
  query: string;
  locale: string;
  activeRoute: StudioRouteId;
  copy: StudioUiCopy;
  routes: Record<StudioRouteId, StudioRoute>;
  routeResults: StudioNavItem[];
  profileItems: StudioProfileMenuItem[];
  onQuery: (value: string) => void;
  onClose: () => void;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}) {
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return routeResults.filter((item) => {
      const route = item.routeId ? routes[item.routeId] : undefined;
      return !normalized || item.title.toLowerCase().includes(normalized) || route?.description.toLowerCase().includes(normalized);
    });
  }, [query, routeResults, routes]);

  if (!open) return null;

  return (
    <div className="command-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="command-dialog" role="dialog" aria-modal="true" aria-label={copy.commandPaletteLabel}>
        <div className="command-input-row">
          <LuSearch aria-hidden="true" />
          <input autoFocus value={query} onChange={(event) => onQuery(event.target.value)} placeholder={copy.searchPlaceholder} />
          <button type="button" onClick={onClose} aria-label={copy.closeSearch}>
            <LuX aria-hidden="true" />
          </button>
        </div>
        <div className="command-results">
          {results.map((item) => {
            const route = routes[item.routeId ?? DEFAULT_ROUTE];
            const Icon = route.icon;
            return (
              <a
                key={item.id}
                href={routeHref(route.id)}
                className={route.id === activeRoute ? "is-active" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  track("studio_command_result_click", {
                    route_id: route.id,
                    route_kind: route.kind,
                    query_length: query.trim().length
                  });
                  onActivate(route.id, "command");
                  onClose();
                }}
              >
                <Icon aria-hidden="true" />
                <span><strong>{item.title}</strong><small>{route.description}</small></span>
              </a>
            );
          })}
          <span className="command-section-label">{copy.profileMenuTitle}</span>
          {profileItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={profileHref(locale, item.href)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={() => {
                  track("studio_profile_nav_click", {
                    target: item.id,
                    source: "command_palette",
                    external: Boolean(item.external)
                  });
                  onClose();
                }}
              >
                <Icon aria-hidden="true" />
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StudioPreferencesPanel({
  copy,
  themeSetting,
  resolvedTheme,
  font,
  layoutPreference,
  onThemeChange,
  onFontChange,
  onLayoutChange,
  onRestoreLayout
}: {
  copy: StudioUiCopy;
  themeSetting: StudioThemeSetting;
  resolvedTheme: StudioResolvedTheme;
  font: StudioFont;
  layoutPreference: StudioLayoutPreference;
  onThemeChange: (setting: StudioThemeSetting) => void;
  onFontChange: (font: StudioFont) => void;
  onLayoutChange: (preference: Partial<StudioLayoutPreference>) => void;
  onRestoreLayout: () => void;
}) {
  const currentFont = fontOptions.find((option) => option.value === font) ?? fontOptions[0];

  return (
    <section className="preferences-popover" aria-label={copy.preferences.title}>
      <div className="preferences-head">
        <div>
          <h2>{copy.preferences.title}</h2>
          <p>{copy.preferences.description}</p>
        </div>
        <span className="theme-color-preview" aria-label={copy.preferences.palette}>
          <i />
          {copy.preferences.palette}
        </span>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.themeMode}</label>
        <div className="preference-segment" data-columns={themeOptions.length} role="radiogroup" aria-label={copy.preferences.themeMode}>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const active = themeSetting === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onThemeChange(option.value)}
            >
              <Icon aria-hidden="true" />
                <span>{copy.preferences.themeOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.resolvedNow}: {resolvedTheme}</p>
      </div>

      <div className="preference-section">
        <label htmlFor="studio-font-select">{copy.preferences.font}</label>
        <div className="preference-select-row">
          <LuType aria-hidden="true" />
          <select
            id="studio-font-select"
            className="native-select"
            value={font}
            onChange={(event) => onFontChange(event.target.value as StudioFont)}
          >
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <p>{currentFont.detail}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.pageLayout}</label>
        <div className="preference-segment" data-columns={contentLayoutOptions.length} role="radiogroup" aria-label={copy.preferences.pageLayout}>
          {contentLayoutOptions.map((option) => {
            const active = layoutPreference.contentLayout === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ contentLayout: option.value })}
              >
                <span>{copy.preferences.contentLayoutOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.pageLayoutHelp}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.navbarBehavior}</label>
        <div className="preference-segment" data-columns={navbarStyleOptions.length} role="radiogroup" aria-label={copy.preferences.navbarBehavior}>
          {navbarStyleOptions.map((option) => {
            const active = layoutPreference.navbarStyle === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ navbarStyle: option.value })}
              >
                <span>{copy.preferences.navbarStyleOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.navbarHelp}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.sidebarStyle}</label>
        <div className="preference-segment" data-columns={sidebarVariantOptions.length} role="radiogroup" aria-label={copy.preferences.sidebarStyle}>
          {sidebarVariantOptions.map((option) => {
            const active = layoutPreference.sidebarVariant === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ sidebarVariant: option.value })}
              >
                <span>{copy.preferences.sidebarVariantOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.sidebarStyleHelp}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.collapseMode}</label>
        <div className="preference-segment" data-columns={sidebarCollapsibleOptions.length} role="radiogroup" aria-label={copy.preferences.collapseMode}>
          {sidebarCollapsibleOptions.map((option) => {
            const active = layoutPreference.sidebarCollapsible === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ sidebarCollapsible: option.value })}
              >
                <span>{copy.preferences.sidebarCollapsibleOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.collapseModeHelp}</p>
      </div>

      <button type="button" className="restore-preferences" onClick={onRestoreLayout}>
        {copy.preferences.restoreDefaults}
      </button>
    </section>
  );
}

export function StudioAdminShell({ locale }: StudioAdminShellProps) {
  const [activeRoute, setActiveRoute] = useState<StudioRouteId>(() => (typeof window === "undefined" ? DEFAULT_ROUTE : normalizeLocationRoute()));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeSetting, setThemeSetting] = useState<StudioThemeSetting>(readInitialThemeSetting);
  const [resolvedTheme, setResolvedTheme] = useState<StudioResolvedTheme>(() => resolveStudioTheme(readInitialThemeSetting()));
  const [studioFont, setStudioFont] = useState<StudioFont>(readInitialFont);
  const [layoutPreference, setLayoutPreference] = useState<StudioLayoutPreference>(readInitialLayoutPreference);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [workstreamSearch, setWorkstreamSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("joined");
  const preferencesRef = useRef<HTMLDivElement>(null);
  const initialRouteRef = useRef(activeRoute);
  const routeOpenDeduperRef = useRef(new StudioRouteOpenDeduper());
  const copy = useMemo(() => getStudioCopy(locale), [locale]);
  const localizedRoutes = useMemo(() => getLocalizedRouteDefinitions(copy), [copy]);
  const localizedNavGroups = useMemo(() => getLocalizedNavGroups(copy), [copy]);
  const localizedProfileItems = useMemo(() => getLocalizedProfileItems(copy), [copy]);
  const localizedPrimaryProfileActions = useMemo(
    () => localizedProfileItems.filter((item) => ["home", "blog", "notes"].includes(item.id)),
    [localizedProfileItems]
  );
  const localizedRouteResults = useMemo(() => localizedNavGroups.flatMap((group) => group.items), [localizedNavGroups]);
  const route = localizedRoutes[activeRoute];

  useEffect(() => {
    if (!routeOpenDeduperRef.current.claimInitialLocation()) return;
    const initialRoute = initialRouteRef.current;
    track("studio_route_open", {
      route_id: initialRoute,
      route_kind: studioCatalog.routeKindById[initialRoute],
      source: "initial_location"
    });
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = normalizeLocationRoute();
      setActiveRoute((currentRoute) => {
        if (routeOpenDeduperRef.current.isHistoryTransition(currentRoute, nextRoute)) {
          track("studio_route_open", {
            route_id: nextRoute,
            route_kind: studioCatalog.routeKindById[nextRoute],
            previous_route: currentRoute,
            source: "browser_history"
          });
          trackStudioFlowSelect(nextRoute, "browser_history", currentRoute);
        }
        return nextRoute;
      });
    };
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        track("studio_command_open", { source: "keyboard", active_route: activeRoute });
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setPreferencesOpen(false);
        setAccountOpen(false);
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeRoute]);

  useEffect(() => {
    if (!preferencesOpen) return undefined;

    const onPointerDown = (event: globalThis.MouseEvent) => {
      const path = event.composedPath();
      if (preferencesRef.current && !path.includes(preferencesRef.current)) {
        setPreferencesOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [preferencesOpen]);

  useEffect(() => {
    applyThemePreference(themeSetting);
  }, [themeSetting]);

  useEffect(() => {
    applyFontPreference(studioFont);
  }, [studioFont]);

  useEffect(() => {
    if (themeSetting !== "system") return undefined;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = () => {
      const resolved = applyThemePreference("system");
      setResolvedTheme(resolved);
    };

    query.addEventListener("change", onSystemThemeChange);
    return () => query.removeEventListener("change", onSystemThemeChange);
  }, [themeSetting]);

  const activateRoute = useCallback((routeId: StudioRouteId, source: StudioRouteActivationSource = "unknown") => {
    track("studio_route_open", {
      route_id: routeId,
      route_kind: studioCatalog.routeKindById[routeId],
      previous_route: activeRoute,
      source
    });
    trackStudioFlowSelect(routeId, source, activeRoute);
    setActiveRoute(routeId);
    setMobileSidebarOpen(false);
    setPreferencesOpen(false);
    setAccountOpen(false);
    const nextHref = routeHref(routeId);
    const currentHref = `${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.pushState(null, "", nextHref);
    }
  }, [activeRoute]);

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    activateRoute(DEFAULT_ROUTE, "brand");
  };

  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      track("studio_sidebar_toggle", {
        mode: "mobile",
        open_next: !mobileSidebarOpen,
        collapsible: layoutPreference.sidebarCollapsible
      });
      setMobileSidebarOpen((value) => !value);
      return;
    }

    if (layoutPreference.sidebarCollapsible === "offcanvas") {
      track("studio_sidebar_toggle", {
        mode: "desktop_offcanvas",
        open_next: !desktopSidebarOpen,
        collapsible: layoutPreference.sidebarCollapsible
      });
      setDesktopSidebarOpen((value) => !value);
      return;
    }

    track("studio_sidebar_toggle", {
      mode: "desktop_icon",
      collapsed_next: !sidebarCollapsed,
      collapsible: layoutPreference.sidebarCollapsible
    });
    setSidebarCollapsed((value) => !value);
  };

  const handleThemeChange = useCallback((setting: StudioThemeSetting) => {
    track("studio_preference_change", {
      preference: "theme",
      from: themeSetting,
      to: setting,
      resolved_to: resolveStudioTheme(setting)
    });
    setThemeSetting(setting);
    setResolvedTheme(applyThemePreference(setting));
  }, [themeSetting]);

  const handleFontChange = useCallback((font: StudioFont) => {
    track("studio_preference_change", {
      preference: "font",
      from: studioFont,
      to: font
    });
    setStudioFont(font);
    applyFontPreference(font);
  }, [studioFont]);

  const handleLayoutChange = useCallback((preference: Partial<StudioLayoutPreference>) => {
    const next = { ...layoutPreference, ...preference };
    (Object.entries(preference) as Array<[keyof StudioLayoutPreference, StudioLayoutPreference[keyof StudioLayoutPreference]]>)
      .forEach(([key, value]) => {
        if (layoutPreference[key] === value) return;
        track("studio_preference_change", {
          preference: key,
          from: layoutPreference[key],
          to: value
        });
      });

    setLayoutPreference(next);
    persistLayoutPreference(next);

    if (preference.sidebarCollapsible) {
      setSidebarCollapsed(false);
      setDesktopSidebarOpen(true);
    }
  }, [layoutPreference]);

  const handleRestoreLayout = useCallback(() => {
    track("studio_preference_restore", {
      previous_content_layout: layoutPreference.contentLayout,
      previous_navbar_style: layoutPreference.navbarStyle,
      previous_sidebar_variant: layoutPreference.sidebarVariant,
      previous_sidebar_collapsible: layoutPreference.sidebarCollapsible
    });
    setLayoutPreference(defaultLayoutPreference);
    persistLayoutPreference(defaultLayoutPreference);
    setSidebarCollapsed(false);
    setDesktopSidebarOpen(true);
  }, [layoutPreference]);

  const isIconCollapsed = layoutPreference.sidebarCollapsible === "icon" && sidebarCollapsed;
  const isSidebarHidden = layoutPreference.sidebarCollapsible === "offcanvas" && !desktopSidebarOpen;

  return (
    <div
      className={`studio-admin${isIconCollapsed ? " is-sidebar-collapsed" : ""}${isSidebarHidden ? " is-sidebar-hidden" : ""}${mobileSidebarOpen ? " is-mobile-open" : ""}${resolvedTheme === "dark" ? " is-dark" : ""}`}
      data-locale={locale}
      data-route={activeRoute}
      data-theme-setting={themeSetting}
      data-studio-font={studioFont}
      data-content-layout={layoutPreference.contentLayout}
      data-navbar-style={layoutPreference.navbarStyle}
      data-sidebar-variant={layoutPreference.sidebarVariant}
      data-sidebar-collapsible={layoutPreference.sidebarCollapsible}
    >
      <aside className="studio-sidebar" aria-label={copy.navLabel}>
        <div className="sidebar-header">
          <a className="sidebar-brand" href={routeHref(DEFAULT_ROUTE)} aria-label={copy.openStudio} onClick={handleBrandClick}>
            <span className="sidebar-brand-mark" aria-hidden="true">N</span>
            <span>{copy.brand}</span>
          </a>
          <button
            className="sidebar-close"
            type="button"
            onClick={() => {
              track("studio_sidebar_toggle", {
                mode: "mobile_close_button",
                open_next: false,
                collapsible: layoutPreference.sidebarCollapsible
              });
              setMobileSidebarOpen(false);
            }}
            aria-label={copy.closeNavigation}
          >
            <LuX aria-hidden="true" />
          </button>
        </div>

        <div className="sidebar-create">
          <button
            type="button"
            className="quick-create"
            onClick={() => {
              track("studio_command_open", { source: "sidebar_quick_search", active_route: activeRoute });
              setSearchOpen(true);
            }}
          >
            <LuSearch aria-hidden="true" />
            <span>{copy.findSetupNote}</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          {localizedNavGroups.map((group) => (
            <SidebarGroup
              key={group.id}
              group={group}
              activeRoute={activeRoute}
              expanded={expanded}
              collapsed={isIconCollapsed}
              onActivate={activateRoute}
              onToggle={(id) => setExpanded((value) => ({ ...value, [id]: !(value[id] ?? false) }))}
            />
          ))}
        </div>

        <div className="sidebar-footer">
          {!isIconCollapsed && (
            <section className="support-card">
              <strong>{copy.profileNavigationTitle}</strong>
              <p>{copy.profileNavigationDetail}</p>
              <div className="profile-link-grid">
                {localizedProfileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={profileHref(locale, item.href)}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      onClick={() => {
                        track("studio_profile_nav_click", {
                          target: item.id,
                          source: "sidebar_profile_grid",
                          external: Boolean(item.external)
                        });
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <a
            className="user-card"
            href={profileHref(locale, APP_ROUTE.HOME)}
            onClick={() => {
              track("studio_profile_nav_click", {
                target: "home",
                source: "user_card",
                external: false
              });
            }}
          >
            <span className="user-avatar">N</span>
            <span>
              <strong>Nguyen Le Phong</strong>
              <small>{copy.openProfileHome}</small>
            </span>
            <LuMoreVertical aria-hidden="true" />
          </a>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label={copy.closeNavigation}
          onClick={() => {
            track("studio_sidebar_toggle", {
              mode: "mobile_scrim",
              open_next: false,
              collapsible: layoutPreference.sidebarCollapsible
            });
            setMobileSidebarOpen(false);
          }}
        />
      )}

      <main className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-left">
            <button type="button" className="icon-button" aria-label={copy.toggleNavigation} onClick={toggleSidebar}>
              {mobileSidebarOpen ? <LuX aria-hidden="true" /> : <LuPanelLeft aria-hidden="true" />}
            </button>
            <span className="topbar-separator" aria-hidden="true" />
            <slot name="studio-page-heading" />
            <span className="topbar-separator" aria-hidden="true" />
            <button
              type="button"
              className="search-command"
              onClick={() => {
                track("studio_command_open", { source: "topbar", active_route: activeRoute });
                setSearchOpen(true);
              }}
            >
              <LuSearch aria-hidden="true" />
              <span>{copy.search}</span>
              <kbd>Cmd J</kbd>
            </button>
          </div>

          <div className="topbar-actions">
            <div className="preferences-anchor" ref={preferencesRef}>
              <button
                type="button"
                className="topbar-icon"
                aria-label={copy.openPreferences}
                aria-expanded={preferencesOpen}
                onClick={() => {
                  track("studio_preferences_panel_toggle", {
                    open_next: !preferencesOpen,
                    active_route: activeRoute
                  });
                  setPreferencesOpen((value) => !value);
                  setAccountOpen(false);
                }}
              >
                <LuSettings aria-hidden="true" />
              </button>
              {preferencesOpen && (
                <StudioPreferencesPanel
                  copy={copy}
                  themeSetting={themeSetting}
                  resolvedTheme={resolvedTheme}
                  font={studioFont}
                  layoutPreference={layoutPreference}
                  onThemeChange={handleThemeChange}
                  onFontChange={handleFontChange}
                  onLayoutChange={handleLayoutChange}
                  onRestoreLayout={handleRestoreLayout}
                />
              )}
            </div>
            <a
              className="topbar-icon"
              href="https://github.com/nguyenlephong"
              target="_blank"
              rel="noreferrer"
              aria-label={copy.openGithubProfile}
              onClick={() => {
                track("studio_profile_nav_click", {
                  target: "github",
                  source: "topbar",
                  external: true
                });
              }}
            >
              <LuGithub aria-hidden="true" />
            </a>
            <button
              type="button"
              className="topbar-avatar"
              onClick={() => {
                setAccountOpen((value) => !value);
                setPreferencesOpen(false);
              }}
              aria-label={copy.openAccountMenu}
            >
              N
            </button>
            {accountOpen && (
              <section className="account-popover">
                <strong>Nguyen Le Phong</strong>
                <span>Senior Software Engineer</span>
                <nav className="account-nav" aria-label={copy.profileNavigationTitle}>
                  {localizedProfileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={profileHref(locale, item.href)}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                        onClick={() => {
                          track("studio_profile_nav_click", {
                            target: item.id,
                            source: "account_menu",
                            external: Boolean(item.external)
                          });
                          setAccountOpen(false);
                        }}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </section>
            )}
          </div>
        </header>

        <div className="dashboard-content" id="dashboard">
          <RouteContent
            route={route}
            locale={locale}
            copy={copy}
            profileActions={localizedPrimaryProfileActions}
            workstreamSearch={workstreamSearch}
            statusFilter={statusFilter}
            sortMode={sortMode}
            onWorkstreamSearch={setWorkstreamSearch}
            onStatusFilter={setStatusFilter}
            onSortMode={setSortMode}
            onActivate={activateRoute}
          />
        </div>
      </main>

      <CommandDialog
        open={searchOpen}
        query={searchQuery}
        locale={locale}
        activeRoute={activeRoute}
        copy={copy}
        routes={localizedRoutes}
        routeResults={localizedRouteResults}
        profileItems={localizedProfileItems}
        onQuery={setSearchQuery}
        onClose={() => setSearchOpen(false)}
        onActivate={activateRoute}
      />
    </div>
  );
}
