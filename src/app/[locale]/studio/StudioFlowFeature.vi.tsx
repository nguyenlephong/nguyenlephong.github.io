"use client";

import {
  getLocalizedStudioFlowGroups,
  getLocalizedStudioFlows
} from "./studio.localized-content";
import { getLocalizedStudioDemoFlows } from "./studio.localized-demos";
import StudioFlowFeature from "./StudioFlowFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

const localizedFlows = getLocalizedStudioDemoFlows(
  getLocalizedStudioFlows("vi"),
  "vi"
);

export default function StudioFlowVietnamese(props: StudioFeatureProps) {
  return (
    <StudioFlowFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      locale={props.locale}
      copy={props.copy}
      onActivate={props.onActivate}
      localizedFlows={localizedFlows}
      localizedGroups={getLocalizedStudioFlowGroups("vi")}
    />
  );
}
