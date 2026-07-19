import type { StudioRouteId, StudioRouteKind } from "./studio-route-catalog";

export type StudioFeatureLoadErrorPayload = {
  feature_id: string;
  locale: string;
  route_id?: StudioRouteId;
  route_kind?: StudioRouteKind;
};

type StudioFeatureLoadErrorContext = {
  featureId: string;
  locale: string;
  routeId?: StudioRouteId;
  routeKind?: StudioRouteKind;
};

type StudioFeatureLoadErrorCapture = (
  event: "studio_feature_load_error",
  properties: Record<string, unknown>
) => void;

/**
 * Build a zero-argument boundary callback from an explicit analytics allowlist.
 * React errors are intentionally never accepted so message and stack data cannot
 * accidentally cross the telemetry boundary.
 */
export function createStudioFeatureLoadErrorCallback(
  context: StudioFeatureLoadErrorContext,
  capture: StudioFeatureLoadErrorCapture
): () => void {
  const payload: StudioFeatureLoadErrorPayload = {
    feature_id: context.featureId,
    locale: context.locale,
    ...(context.routeId ? { route_id: context.routeId } : {}),
    ...(context.routeKind ? { route_kind: context.routeKind } : {})
  };

  return () => capture("studio_feature_load_error", payload);
}
