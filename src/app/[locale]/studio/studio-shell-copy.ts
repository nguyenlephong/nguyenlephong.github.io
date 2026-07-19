import type { StudioRouteId } from "./studio-route-catalog";
import type { StudioAiSkill, StudioNoteStatus } from "./studio.data";

export type StudioThemeSetting = "light" | "dark" | "system";
export type StudioLocale = "en" | "vi" | "zh" | "ja" | "ko" | "fr";
export type StudioResolvedTheme = "light" | "dark";
export type StudioFont =
  | "inter"
  | "source"
  | "plex"
  | "atkinson"
  | "lora"
  | "be-vietnam";
export type StudioContentLayout = "centered" | "full-width";
export type StudioNavbarStyle = "sticky" | "scroll";
export type StudioSidebarVariant = "inset" | "sidebar" | "floating";
export type StudioSidebarCollapsible = "icon" | "offcanvas";
export type StudioRouteActivationSource =
  | "initial_location"
  | "brand"
  | "sidebar"
  | "command"
  | "route_actions"
  | "browser_history"
  | "unknown";

export type StudioLayoutPreference = {
  contentLayout: StudioContentLayout;
  navbarStyle: StudioNavbarStyle;
  sidebarVariant: StudioSidebarVariant;
  sidebarCollapsible: StudioSidebarCollapsible;
};

export type StudioRouteCopy = {
  title: string;
  description: string;
  panels?: string[];
  timeline?: string[];
};

export type StudioUiCopy = {
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
  runtime: {
    loading: string;
    loadErrorTitle: string;
    loadErrorDetail: string;
    reload: string;
  };
  dashboard: {
    workstreamCount: (count: number) => string;
    emptyTitle: string;
    emptyDescription: string;
    clearFilters: string;
  };
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
    routeCards: Partial<
      Record<StudioRouteId, { label: string; detail: string }>
    >;
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

export type StudioUiCopyData = Omit<
  StudioUiCopy,
  "dashboard" | "flows" | "aiSkills" | "checklists"
> & {
  dashboard: Omit<StudioUiCopy["dashboard"], "workstreamCount">;
  flows: Omit<StudioUiCopy["flows"], "trailMore">;
  aiSkills: Omit<StudioUiCopy["aiSkills"], "skillCountLabel">;
  checklists: Omit<StudioUiCopy["checklists"], "structureDetail">;
};

export type StudioUiCopyFormatters = {
  workstreamCount: StudioUiCopy["dashboard"]["workstreamCount"];
  trailMore: StudioUiCopy["flows"]["trailMore"];
  skillCountLabel: StudioUiCopy["aiSkills"]["skillCountLabel"];
  structureDetail: StudioUiCopy["checklists"]["structureDetail"];
};

export function createStudioUiCopy(
  data: StudioUiCopyData,
  formatters: StudioUiCopyFormatters
): StudioUiCopy {
  return {
    ...data,
    dashboard: {
      ...data.dashboard,
      workstreamCount: formatters.workstreamCount
    },
    flows: {
      ...data.flows,
      trailMore: formatters.trailMore
    },
    aiSkills: {
      ...data.aiSkills,
      skillCountLabel: formatters.skillCountLabel
    },
    checklists: {
      ...data.checklists,
      structureDetail: formatters.structureDetail
    }
  };
}

export function normalizeStudioLocale(locale: string): StudioLocale {
  switch (locale) {
    case "en":
    case "vi":
    case "zh":
    case "ja":
    case "ko":
    case "fr":
      return locale;
    default:
      return "en";
  }
}
