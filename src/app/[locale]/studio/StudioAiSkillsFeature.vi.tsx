"use client";

import { getLocalizedStudioAiSkills } from "./studio.localized-content";
import StudioAiSkillsFeature from "./StudioAiSkillsFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioAiSkillsVietnamese(props: StudioFeatureProps) {
  return (
    <StudioAiSkillsFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      copy={props.copy}
      localizedSkills={getLocalizedStudioAiSkills("vi")}
    />
  );
}
