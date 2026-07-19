"use client";

import StudioAuxiliaryRoutesFeature from "./StudioAuxiliaryRoutesFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioAuxiliaryRoutesFeatureAdapter(
  props: StudioFeatureProps
) {
  return (
    <StudioAuxiliaryRoutesFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      locale={props.locale}
      loadingLabel={props.copy.runtime.loading}
      dashboardCopy={props.copy.dashboard}
    />
  );
}
