"use client";

import { studioAiSkills } from "./studio.data";
import StudioAiSkillsFeature from "./StudioAiSkillsFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioAiSkillsEnglish(props: StudioFeatureProps) {
  return (
    <StudioAiSkillsFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      copy={props.copy}
      localizedSkills={studioAiSkills}
    />
  );
}
