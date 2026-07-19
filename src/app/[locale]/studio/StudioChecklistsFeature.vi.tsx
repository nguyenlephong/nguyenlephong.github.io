"use client";

import { getLocalizedStudioWorkflowChecklists } from "./studio.localized-content";
import StudioChecklistsFeature from "./StudioChecklistsFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioChecklistsVietnamese(props: StudioFeatureProps) {
  return (
    <StudioChecklistsFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      copy={props.copy}
      localizedChecklists={getLocalizedStudioWorkflowChecklists("vi")}
    />
  );
}
