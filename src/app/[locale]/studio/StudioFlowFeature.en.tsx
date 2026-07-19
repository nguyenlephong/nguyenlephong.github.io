"use client";

import { studioFlowGroups, studioFlows } from "./studio.data";
import StudioFlowFeature from "./StudioFlowFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioFlowEnglish(props: StudioFeatureProps) {
  return (
    <StudioFlowFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      locale={props.locale}
      copy={props.copy}
      onActivate={props.onActivate}
      localizedFlows={studioFlows}
      localizedGroups={studioFlowGroups}
    />
  );
}
