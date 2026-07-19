"use client";

import {
  defaultStudioNoteId,
  studioFolders,
  studioNotes
} from "./studio.data";
import StudioAiSetupFeature, {
  type StudioAiWorkflowStep
} from "./StudioAiSetupFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

const workflowSteps: StudioAiWorkflowStep[] = [
  { title: "Capture", detail: "Put facts, source documents, logs, and notes into NotebookLM or a focused Project before asking for judgment.", state: "ready" },
  { title: "Clarify", detail: "Use GPT to separate goal, assumptions, constraints, decision, and next action.", state: "active" },
  { title: "Challenge", detail: "Use Claude to review weak assumptions, architecture risk, edge cases, and communication clarity.", state: "required" },
  { title: "Execute and archive", detail: "Use Codex or Antigravity for bounded work, then save the prompt, artifact, verification, and lesson.", state: "next" }
];

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
      localizedWorkflowSteps={workflowSteps}
    />
  );
}
