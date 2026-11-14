"use client";

import { defaultStudioNoteId } from "./studio.data";
import {
  getLocalizedStudioFolders,
  getLocalizedStudioNotes
} from "./studio.localized-workspace";
import StudioAiSetupFeature from "./StudioAiSetupFeature";
import { studioAiWorkflowStepsByLocale } from "./studio-ai-workflow-steps";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

export default function StudioAiSetupVietnamese(props: StudioFeatureProps) {
  return (
    <StudioAiSetupFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      locale={props.locale}
      copy={props.copy}
      profileActions={props.profileActions}
      defaultNoteId={defaultStudioNoteId}
      localizedFolders={getLocalizedStudioFolders("vi")}
      localizedNotes={getLocalizedStudioNotes("vi")}
      localizedWorkflowSteps={studioAiWorkflowStepsByLocale.vi}
    />
  );
}
