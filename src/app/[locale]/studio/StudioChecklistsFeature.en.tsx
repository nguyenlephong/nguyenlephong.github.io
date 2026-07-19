"use client";

import { studioWorkflowChecklists } from "./studio.data";
import StudioChecklistsFeature from "./StudioChecklistsFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioChecklistsEnglish(props: StudioFeatureProps) {
  return (
    <StudioChecklistsFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      copy={props.copy}
      localizedChecklists={studioWorkflowChecklists}
    />
  );
}
