"use client";

import {
  defaultStudioNoteId,
  studioFolders,
  studioNotes
} from "./studio.data";
import StudioAiSetupFeature from "./StudioAiSetupFeature";
import { studioAiWorkflowStepsByLocale } from "./studio-ai-workflow-steps";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioAiSetupEnglish(props: StudioFeatureProps) {
  return (
    <StudioAiSetupFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      locale={props.locale}
      copy={props.copy}
      profileActions={props.profileActions}
      defaultNoteId={defaultStudioNoteId}
      localizedFolders={studioFolders}
      localizedNotes={studioNotes}
      localizedWorkflowSteps={studioAiWorkflowStepsByLocale.en}
    />
  );
}
