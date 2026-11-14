import type { StudioWorkflowChecklist } from "./studio.data";

export type StudioPublicModuleRouteId =
  | "delivery-checklists"
  | "flow-react-flow-system-blueprint"
  | "ai-agent-setup";

export type StudioPublicModuleSlug = "checklists" | "system-maps" | "ai-setup";

export type StudioPublicModuleCatalogEntry = {
  routeId: StudioPublicModuleRouteId;
  /** Server-rendered page /[locale]/studio/{slug}. */
  slug: StudioPublicModuleSlug;
};

/** The three Studio modules, in reading order (MEP-56: checklists first). */
export const studioPublicModuleCatalog = [
  { routeId: "delivery-checklists", slug: "checklists" },
  { routeId: "flow-react-flow-system-blueprint", slug: "system-maps" },
  { routeId: "ai-agent-setup", slug: "ai-setup" }
] as const satisfies readonly StudioPublicModuleCatalogEntry[];

/**
 * Delivery checklists shown in Studio, in reading order: the two release gates
 * first (MEP-56). Personal study plans stay in the data file, unpublished.
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
  publicModules: studioPublicModuleCatalog,
  deliveryChecklistIds: studioDeliveryChecklistIds
} as const;
