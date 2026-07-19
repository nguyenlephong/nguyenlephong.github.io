"use client";

import StudioWelcomeFeature from "./StudioWelcomeFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioWelcomeFeatureAdapter(props: StudioFeatureProps) {
  const route = getLocalizedRouteDefinitions(props.copy)[props.routeId];
  return (
    <StudioWelcomeFeature
      route={route}
      locale={props.locale}
      copy={props.copy}
      onActivate={props.onActivate}
    />
  );
}
