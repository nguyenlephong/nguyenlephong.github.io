import { selectStudioDeliveryChecklists } from "./studio-route-catalog";
import { studioAiWorkflowStepsByLocale } from "./studio-ai-workflow-steps";
import {
  studioFlows,
  studioFolders,
  studioNotes,
  studioWorkflowChecklists,
  type StudioFlowArchitectureNodeSpec,
  type StudioFlowArchitectureViewSpec,
  type StudioNote,
  type StudioWorkflowChecklist
} from "./studio.data";
import { getLocalizedStudioWorkflowChecklists } from "./studio.localized-content";
import { getLocalizedStudioDemoFlows } from "./studio.localized-demos";
import { getLocalizedStudioFolders, getLocalizedStudioNotes } from "./studio.localized-workspace";
import type { StudioContentLocale } from "./studio-static-content";

/** Server-side readers for the text the interactive Studio routes show. */

export function getStudioDeliveryChecklists(locale: StudioContentLocale): StudioWorkflowChecklist[] {
  return selectStudioDeliveryChecklists(
    locale === "vi" ? getLocalizedStudioWorkflowChecklists("vi") : studioWorkflowChecklists
  );
}

export type StudioSystemMapView = Pick<StudioFlowArchitectureViewSpec, "id" | "title" | "description" | "notes"> & {
  nodes: Pick<StudioFlowArchitectureNodeSpec, "id" | "title" | "detail">[];
};

/**
 * The focused blueprint views, each listing the components it introduces. The
 * full view repeats every node, so it is summarized by its zones instead.
 */
export function getStudioSystemMapViews(locale: StudioContentLocale): StudioSystemMapView[] {
  const flows = locale === "vi" ? getLocalizedStudioDemoFlows(studioFlows, "vi") : studioFlows;
  const views = flows.find((flow) => flow.id === "react-flow-system-blueprint")?.architectureDemo?.views ?? [];
  const seen = new Set<string>();
  const result: StudioSystemMapView[] = [];
  for (const view of views) {
    if (view.id === "blueprint-full") continue;
    const nodes: StudioSystemMapView["nodes"] = [];
    for (const { id, title, detail, kind } of view.nodes) {
      if (kind === "group" || seen.has(id)) continue;
      seen.add(id);
      nodes.push({ id, title, detail });
    }
    result.push({ id: view.id, title: view.title, description: view.description, notes: view.notes, nodes });
  }
  return result;
}

export function getStudioAiSetup(locale: StudioContentLocale): {
  workflowSteps: (typeof studioAiWorkflowStepsByLocale)["en"];
  notes: Pick<StudioNote, "id" | "title" | "summary">[];
} {
  const folders = locale === "vi" ? getLocalizedStudioFolders("vi") : studioFolders;
  const notes = locale === "vi" ? getLocalizedStudioNotes("vi") : studioNotes;
  const setupNoteIds = folders
    .find((folder) => folder.id === "machine-bootstrap")
    ?.groups.flatMap((group) => group.noteIds) ?? [];
  return {
    workflowSteps: studioAiWorkflowStepsByLocale[locale],
    notes: [...new Set(setupNoteIds)].flatMap((id) => {
      const note = notes.find((candidate) => candidate.id === id);
      return note ? [{ id: note.id, title: note.title, summary: note.summary }] : [];
    })
  };
}
