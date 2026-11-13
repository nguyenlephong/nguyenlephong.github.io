import type { StudioWorkflowChecklist } from "./studio.data";

export const studioRouteCatalog = [
  { id: "welcome", kind: "welcome" },
  { id: "ai-agent-setup", kind: "ai-setup" },
  { id: "ai-skills", kind: "ai-skills" },
  { id: "delivery-checklists", kind: "checklists" },
  { id: "flow-system-design", kind: "flows" },
  { id: "flow-architecture-decision", kind: "flows" },
  { id: "flow-incident-response", kind: "flows" },
  { id: "flow-release-readiness", kind: "flows" },
  { id: "flow-ai-delivery", kind: "flows" },
  { id: "flow-portfolio-story", kind: "flows" },
  { id: "flow-react-flow-architecture-demo", kind: "flows" },
  { id: "flow-react-flow-system-blueprint", kind: "flows" }
] as const;

export type StudioRouteId = (typeof studioRouteCatalog)[number]["id"];
export type StudioRouteKind = (typeof studioRouteCatalog)[number]["kind"];

export const STUDIO_DEFAULT_ROUTE: StudioRouteId = "welcome";

export const studioRouteIds = studioRouteCatalog.map((route) => route.id) as StudioRouteId[];

export const studioRouteKindById = Object.fromEntries(
  studioRouteCatalog.map((route) => [route.id, route.kind])
) as Record<StudioRouteId, StudioRouteKind>;

/**
 * Routes intentionally omitted from navigation but supported as stable direct
 * links through the `route` query parameter or matching URL hash.
 */
export const studioDeepLinkRouteIds = [
  "flow-system-design",
  "flow-architecture-decision",
  "flow-incident-response",
  "flow-release-readiness",
  "flow-ai-delivery",
  "flow-portfolio-story"
] as const satisfies readonly StudioRouteId[];

export type StudioDeepLinkRouteId = (typeof studioDeepLinkRouteIds)[number];

export type StudioNavIconKey = "smile" | "sparkles" | "command" | "clipboard-list" | "workflow";

export type StudioNavCatalogItem = {
  id: string;
  title: string;
  routeId: StudioRouteId;
  icon?: StudioNavIconKey;
  badge?: "new" | "soon";
  subItems?: readonly StudioNavCatalogItem[];
};

export type StudioNavCatalogGroup = {
  id: number;
  label: string;
  items: readonly StudioNavCatalogItem[];
};

export const studioNavCatalog = [
  {
    id: 1,
    label: "Personal Studio",
    // MEP-56: delivery checklists lead, then system maps, then the AI setup notes.
    items: [
      { id: "welcome", title: "Welcome", routeId: "welcome", icon: "smile" },
      { id: "delivery-checklists", title: "Checklists", routeId: "delivery-checklists", icon: "clipboard-list" },
      {
        id: "flow-menu",
        title: "Flow Menu",
        routeId: "flow-react-flow-system-blueprint",
        icon: "workflow",
        subItems: [
          { id: "flow-react-flow-system-blueprint", title: "Blueprint", routeId: "flow-react-flow-system-blueprint" },
          { id: "flow-react-flow-architecture-demo", title: "Example", routeId: "flow-react-flow-architecture-demo" }
        ]
      },
      { id: "ai-agent-setup", title: "AI Setup", routeId: "ai-agent-setup", icon: "sparkles" },
      { id: "ai-skills", title: "AI Skills", routeId: "ai-skills", icon: "command" }
    ]
  }
] as const satisfies readonly StudioNavCatalogGroup[];

export type StudioPublicModuleRouteId =
  | "delivery-checklists"
  | "flow-react-flow-system-blueprint"
  | "ai-agent-setup";

export type StudioPublicModuleSlug = "checklists" | "system-maps" | "ai-setup";

export type StudioPublicModuleCatalogEntry = {
  routeId: StudioPublicModuleRouteId;
  /** Crawlable page /[locale]/studio/{slug} that opens the shell on this route. */
  slug: StudioPublicModuleSlug;
};

export const studioPublicModuleCatalog = [
  { routeId: "delivery-checklists", slug: "checklists" },
  { routeId: "flow-react-flow-system-blueprint", slug: "system-maps" },
  { routeId: "ai-agent-setup", slug: "ai-setup" }
] as const satisfies readonly StudioPublicModuleCatalogEntry[];

export const studioWelcomeRouteIds = studioPublicModuleCatalog.map(
  (module) => module.routeId
) as StudioPublicModuleRouteId[];

/**
 * Delivery checklists shown in Studio, in reading order. Personal study plans
 * (roadmaps, daily and weekly AI practice, the 90-day plan) stay in the data
 * file but are not published here (MEP-56).
 */
export const studioDeliveryChecklistIds = [
  "release-readiness",
  "rollout-plan",
  "ticket-intake-to-start",
  "engineering-delivery-checklist",
  "module-creation",
  "senior-engineer-reflex",
  "ai-assisted-feature-workflow"
] as const;

export function selectStudioDeliveryChecklists(checklists: readonly StudioWorkflowChecklist[]): StudioWorkflowChecklist[] {
  return studioDeliveryChecklistIds.flatMap((id) => checklists.filter((checklist) => checklist.id === id));
}

export const studioCatalog = {
  defaultRouteId: STUDIO_DEFAULT_ROUTE,
  routes: studioRouteCatalog,
  routeIds: studioRouteIds,
  routeKindById: studioRouteKindById,
  deepLinkRouteIds: studioDeepLinkRouteIds,
  navGroups: studioNavCatalog,
  publicModules: studioPublicModuleCatalog,
  welcomeRouteIds: studioWelcomeRouteIds,
  deliveryChecklistIds: studioDeliveryChecklistIds
} as const;
