export const studioRouteCatalog = [
  { id: "welcome", kind: "welcome" },
  { id: "default", kind: "default" },
  { id: "crm", kind: "dashboard" },
  { id: "finance", kind: "finance" },
  { id: "analytics", kind: "analytics" },
  { id: "productivity", kind: "productivity" },
  { id: "ecommerce", kind: "ecommerce" },
  { id: "academy", kind: "academy" },
  { id: "logistics", kind: "logistics" },
  { id: "infrastructure", kind: "infrastructure" },
  { id: "email", kind: "mail" },
  { id: "chat", kind: "chat" },
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
  { id: "flow-react-flow-system-blueprint", kind: "flows" },
  { id: "calendar", kind: "calendar" },
  { id: "kanban", kind: "kanban" },
  { id: "invoice", kind: "invoice" },
  { id: "users", kind: "users" },
  { id: "roles", kind: "roles" },
  { id: "auth-login-v1", kind: "auth" },
  { id: "auth-login-v2", kind: "auth" },
  { id: "auth-register-v1", kind: "auth" },
  { id: "auth-register-v2", kind: "auth" },
  { id: "legacy-default", kind: "legacy" },
  { id: "legacy-crm", kind: "legacy" },
  { id: "legacy-finance", kind: "legacy" },
  { id: "legacy-analytics", kind: "legacy" }
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
  "default",
  "crm",
  "finance",
  "analytics",
  "productivity",
  "ecommerce",
  "academy",
  "logistics",
  "infrastructure",
  "email",
  "chat",
  "flow-system-design",
  "flow-architecture-decision",
  "flow-incident-response",
  "flow-release-readiness",
  "flow-ai-delivery",
  "flow-portfolio-story",
  "calendar",
  "kanban",
  "invoice",
  "users",
  "roles",
  "auth-login-v1",
  "auth-login-v2",
  "auth-register-v1",
  "auth-register-v2",
  "legacy-default",
  "legacy-crm",
  "legacy-finance",
  "legacy-analytics"
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
    items: [
      { id: "welcome", title: "Welcome", routeId: "welcome", icon: "smile" },
      { id: "ai-agent-setup", title: "AI Setup", routeId: "ai-agent-setup", icon: "sparkles", badge: "new" },
      { id: "ai-skills", title: "AI Skills", routeId: "ai-skills", icon: "command", badge: "new" },
      { id: "delivery-checklists", title: "Checklists", routeId: "delivery-checklists", icon: "clipboard-list", badge: "new" },
      {
        id: "flow-menu",
        title: "Flow Menu",
        routeId: "flow-react-flow-architecture-demo",
        icon: "workflow",
        badge: "new",
        subItems: [
          { id: "flow-react-flow-architecture-demo", title: "Example", routeId: "flow-react-flow-architecture-demo" },
          { id: "flow-react-flow-system-blueprint", title: "Blueprint", routeId: "flow-react-flow-system-blueprint" }
        ]
      }
    ]
  }
] as const satisfies readonly StudioNavCatalogGroup[];

export type StudioPublicModuleRouteId =
  | "ai-agent-setup"
  | "ai-skills"
  | "delivery-checklists"
  | "flow-react-flow-architecture-demo";

export type StudioPublicModuleCatalogEntry = {
  routeId: StudioPublicModuleRouteId;
  flowId?: "react-flow-architecture-demo";
};

export const studioPublicModuleCatalog = [
  { routeId: "ai-agent-setup" },
  { routeId: "ai-skills" },
  { routeId: "delivery-checklists" },
  { routeId: "flow-react-flow-architecture-demo", flowId: "react-flow-architecture-demo" }
] as const satisfies readonly StudioPublicModuleCatalogEntry[];

export const studioWelcomeRouteIds = studioPublicModuleCatalog.map(
  (module) => module.routeId
) as StudioPublicModuleRouteId[];

export const studioCatalog = {
  defaultRouteId: STUDIO_DEFAULT_ROUTE,
  routes: studioRouteCatalog,
  routeIds: studioRouteIds,
  routeKindById: studioRouteKindById,
  deepLinkRouteIds: studioDeepLinkRouteIds,
  navGroups: studioNavCatalog,
  publicModules: studioPublicModuleCatalog,
  welcomeRouteIds: studioWelcomeRouteIds
} as const;
