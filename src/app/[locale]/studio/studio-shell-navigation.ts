import type { IconType } from "react-icons";
import { LuBookOpenCheck, LuBoxes, LuClipboardList, LuCommand, LuDownload, LuFileText, LuGlobe, LuSmile, LuSparkles, LuUser, LuWorkflow } from "react-icons/lu";
import { APP_ROUTE } from "@/app/app.const";
import { track } from "@/lib/analytics";
import { studioCatalog, type StudioNavCatalogItem, type StudioNavIconKey, type StudioRouteId } from "./studio-route-catalog";
import type { StudioRoute } from "./studio-route-contract";
import { routeDefinitions } from "./studio-route-definitions";
import type { StudioRouteCopy, StudioUiCopy } from "./studio-shell-copy";
import { preserveStudioDashboardQueryParams } from "./studio-dashboard-query";

export type StudioRouteActivationSource = "initial_location" | "brand" | "sidebar" | "command" | "route_actions" | "browser_history" | "unknown";
export type StudioNavItem = {
  id: string;
  title: string;
  icon?: IconType;
  routeId?: StudioRouteId;
  badge?: "new" | "soon";
  disabled?: boolean;
  subItems?: StudioNavItem[];
};
export type StudioNavGroup = { id: number; label: string; items: StudioNavItem[] };
export type StudioProfileMenuItem = {
  id: string; label: string; detail: string; href: string; icon: IconType; external?: boolean;
};

export const DEFAULT_ROUTE: StudioRouteId = studioCatalog.defaultRouteId;

export const profileMenuItems: StudioProfileMenuItem[] = [
  { id: "home", label: "Home", detail: "Profile overview.", href: APP_ROUTE.HOME, icon: LuGlobe },
  { id: "about", label: "About", detail: "Experience and background.", href: "/#about", icon: LuUser },
  { id: "gallery", label: "Gallery", detail: "Selected visual records.", href: APP_ROUTE.GALLERY, icon: LuSparkles },
  { id: "blog", label: "Blog", detail: "Long-form writing.", href: APP_ROUTE.BLOG, icon: LuBookOpenCheck },
  { id: "notes", label: "Notes", detail: "Shorter working notes.", href: APP_ROUTE.NOTES, icon: LuFileText },
  { id: "apps", label: "Apps", detail: "Small tools and experiments.", href: APP_ROUTE.APPS, icon: LuBoxes },
  { id: "resume", label: "Resume", detail: "Open the CV PDF.", href: APP_ROUTE.CV_PDF, icon: LuDownload, external: true }
];


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

export const navGroups: StudioNavGroup[] = studioCatalog.navGroups.map((group) => ({
  ...group,
  items: group.items.map(hydrateStudioNavItem)
}));


export function getLocalizedProfileItems(copy: StudioUiCopy): StudioProfileMenuItem[] {
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

export function getLocalizedNavGroups(copy: StudioUiCopy): StudioNavGroup[] {
  return navGroups.map((group) => ({
    ...group,
    label: copy.navLabel,
    items: group.items.map((item) => getLocalizedNavItem(item, copy))
  }));
}

export function getLocalizedRouteDefinitions(copy: StudioUiCopy): Record<StudioRouteId, StudioRoute> {
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



const flatRouteResults = navGroups.flatMap((group) => group.items.flatMap((item) =>
  item.subItems ? item.subItems.filter((subItem) => subItem.routeId) : item.routeId ? [item] : []
));
const visibleRouteIds = new Set(flatRouteResults.map((item) => item.routeId).filter((id): id is StudioRouteId => Boolean(id)));
const routeIds = new Set<StudioRouteId>(studioCatalog.routeIds);
const deepLinkRouteIds = new Set<StudioRouteId>(studioCatalog.deepLinkRouteIds);

function isLocationRouteId(candidate: string): candidate is StudioRouteId {
  const routeId = candidate as StudioRouteId;
  return routeIds.has(routeId) && (visibleRouteIds.has(routeId) || deepLinkRouteIds.has(routeId));
}

export function flowIdFromRoute(routeId: StudioRouteId): string | null {
  return routeId.startsWith("flow-") ? routeId.slice("flow-".length) : null;
}

export function routeHref(routeId: StudioRouteId, currentSearch = ""): string {
  const flowId = flowIdFromRoute(routeId);
  const params = new URLSearchParams();
  params.set("route", routeId);
  if (flowId) params.set("flow", flowId);
  preserveStudioDashboardQueryParams(params, currentSearch);
  return `?${params.toString()}#${routeId}`;
}

function normalizeHash(hash: string): StudioRouteId {
  const candidate = hash.replace(/^#\/?/, "");
  return isLocationRouteId(candidate) ? candidate : DEFAULT_ROUTE;
}

export function normalizeLocationRoute(): StudioRouteId {
  const params = new URLSearchParams(window.location.search);
  const flowId = params.get("flow");
  if (flowId) {
    const flowRoute = ("flow-" + flowId) as StudioRouteId;
    if (isLocationRouteId(flowRoute)) return flowRoute;
  }
  const routeId = params.get("route");
  if (routeId && isLocationRouteId(routeId)) return routeId;
  return normalizeHash(window.location.hash);
}

const flowGroupById: Record<string, string> = {
  "system-design": "architecture", "architecture-decision": "architecture",
  "incident-response": "production", "release-readiness": "production",
  "ai-delivery": "ai-and-career", "portfolio-story": "ai-and-career",
  "react-flow-architecture-demo": "react-flow-library", "react-flow-system-blueprint": "react-flow-library"
};

export function trackStudioFlowSelect(routeId: StudioRouteId, source: StudioRouteActivationSource, previousRoute?: StudioRouteId): void {
  const flowId = flowIdFromRoute(routeId);
  if (!flowId) return;
  track("studio_flow_select", { flow_id: flowId, group_id: flowGroupById[flowId] ?? "unknown", route_id: routeId, source, previous_route: previousRoute });
}

export function profileHref(locale: string, href: string): string {
  if (href.startsWith("http") || href.endsWith(".pdf")) return href;
  const prefix = locale ? "/" + locale : "";
  if (href === APP_ROUTE.HOME) return prefix || APP_ROUTE.HOME;
  if (href.startsWith("/#") || href.startsWith("/")) return prefix + href;
  return href;
}

export function isItemActive(item: StudioNavItem, activeRoute: StudioRouteId): boolean {
  return item.routeId === activeRoute || (item.subItems?.some((subItem) => subItem.routeId === activeRoute) ?? false);
}
