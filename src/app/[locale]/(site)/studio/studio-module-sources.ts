import { selectStudioDeliveryChecklists } from "./studio-route-catalog";
import { studioAiWorkflowStepsByLocale } from "./studio-ai-workflow-steps";
import {
  studioAiSkills,
  studioFlows,
  studioFolders,
  studioNotes,
  studioWorkflowChecklists,
  type StudioAiSkill,
  type StudioChecklistStep,
  type StudioFlowArchitectureNodeSpec,
  type StudioNote,
  type StudioWorkflowChecklist
} from "./studio.data";
import { getLocalizedStudioAiSkills, getLocalizedStudioWorkflowChecklists } from "./studio.localized-content";
import { getLocalizedStudioDemoFlows } from "./studio.localized-demos";
import { getLocalizedStudioFolders, getLocalizedStudioNotes } from "./studio.localized-workspace";
import type { StudioContentLocale } from "./studio-static-content";

/** Server-side readers for the text and geometry the Studio pages render. */

export function getStudioDeliveryChecklists(locale: StudioContentLocale): StudioWorkflowChecklist[] {
  return selectStudioDeliveryChecklists(
    locale === "vi" ? getLocalizedStudioWorkflowChecklists("vi") : studioWorkflowChecklists
  );
}

export function countChecklistSteps(steps: readonly StudioChecklistStep[]): number {
  return steps.reduce((total, step) => total + 1 + countChecklistSteps(step.children ?? []), 0);
}

function checklistStepMarkdown(step: StudioChecklistStep, depth = 0): string {
  const indent = "  ".repeat(depth);
  const detail = step.detail ? ` - ${step.detail}` : "";
  const children = (step.children ?? []).map((child) => `\n${checklistStepMarkdown(child, depth + 1)}`).join("");
  return `${indent}- [ ] ${step.label}${detail}${children}`;
}

export function checklistMarkdown(checklist: StudioWorkflowChecklist, useWhenLabel: string): string {
  return [
    `# ${checklist.title}`, "", checklist.summary, "",
    `${useWhenLabel}: ${checklist.whenToUse}`, "",
    ...checklist.sections.flatMap((section) => [
      `## ${section.title}`, section.detail, "",
      ...section.steps.map((step) => checklistStepMarkdown(step)), ""
    ])
  ].join("\n").trim();
}

export type StudioMapBox = { x: number; y: number; width: number; height: number };
export type StudioMapZone = StudioMapBox & { id: string; title: string; detail: string };
export type StudioMapNode = StudioMapBox & { id: string; title: string; detail: string; badge: string; zoneId: string };
export type StudioMapEdge = { id: string; points: [number, number, number, number]; label: string };
export type StudioMapView = {
  id: string;
  title: string;
  description: string;
  notes: string[];
  bounds: StudioMapBox;
  zoneIds: string[];
  nodeIds: string[];
};
export type StudioSystemMap = {
  bounds: StudioMapBox;
  zones: StudioMapZone[];
  nodes: StudioMapNode[];
  edges: StudioMapEdge[];
  views: StudioMapView[];
};

// The data carries positions only; these sizes match the old canvas cards closely enough to keep the layout.
const NODE_SIZE = { width: 236, height: 96 };
const COMPACT_SIZE = { width: 188, height: 84 };
const MAP_PADDING = 80;

function boxOf(node: StudioFlowArchitectureNodeSpec): StudioMapBox {
  const size = node.size ?? (node.compact ? COMPACT_SIZE : NODE_SIZE);
  return { x: node.position.x, y: node.position.y, ...size };
}

function union(boxes: readonly StudioMapBox[], padding = 0): StudioMapBox {
  const minX = Math.min(...boxes.map((box) => box.x)) - padding;
  const minY = Math.min(...boxes.map((box) => box.y)) - padding;
  const maxX = Math.max(...boxes.map((box) => box.x + box.width)) + padding;
  const maxY = Math.max(...boxes.map((box) => box.y + box.height)) + padding;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function contains(zone: StudioMapBox, box: StudioMapBox): boolean {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return cx >= zone.x && cx <= zone.x + zone.width && cy >= zone.y && cy <= zone.y + zone.height;
}

/** Where the segment from a box's centre toward (tx, ty) leaves the box. */
function exitPoint(box: StudioMapBox, tx: number, ty: number): [number, number] {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const scale = Math.min(
    dx === 0 ? Infinity : box.width / 2 / Math.abs(dx),
    dy === 0 ? Infinity : box.height / 2 / Math.abs(dy)
  );
  return [cx + dx * scale, cy + dy * scale];
}

/** The full blueprint flattened into SVG geometry, plus the bounds of each focused view. */
export function getStudioSystemMap(locale: StudioContentLocale): StudioSystemMap {
  const flows = locale === "vi" ? getLocalizedStudioDemoFlows(studioFlows, "vi") : studioFlows;
  const demo = flows.find((flow) => flow.id === "react-flow-system-blueprint")?.architectureDemo;
  if (!demo) return { bounds: { x: 0, y: 0, width: 1, height: 1 }, zones: [], nodes: [], edges: [], views: [] };

  const zones: StudioMapZone[] = demo.nodes
    .filter((node) => node.kind === "group")
    .map((node) => ({ id: node.id, title: node.title, detail: node.detail, ...boxOf(node) }));
  const nodes: StudioMapNode[] = demo.nodes
    .filter((node) => node.kind !== "group")
    .map((node) => {
      const box = boxOf(node);
      const zoneId = zones.find((zone) => contains(zone, box))?.id ?? "";
      return { id: node.id, title: node.title, detail: node.detail, badge: node.badge, zoneId, ...box };
    });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const edges: StudioMapEdge[] = demo.edges.flatMap((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return [];
    const [x1, y1] = exitPoint(source, target.x + target.width / 2, target.y + target.height / 2);
    const [x2, y2] = exitPoint(target, source.x + source.width / 2, source.y + source.height / 2);
    return [{ id: edge.id, points: [x1, y1, x2, y2], label: edge.label }];
  });

  const views: StudioMapView[] = demo.views
    .filter((view) => view.id !== demo.defaultViewId)
    .map((view) => {
      const ids = new Set(view.nodes.map((node) => node.id));
      const viewZones = zones.filter((zone) => ids.has(zone.id));
      return {
        id: view.id,
        title: view.title,
        description: view.description,
        notes: view.notes,
        bounds: union(viewZones.length ? viewZones : nodes.filter((node) => ids.has(node.id)), MAP_PADDING / 2),
        zoneIds: viewZones.map((zone) => zone.id),
        nodeIds: nodes.filter((node) => ids.has(node.id)).map((node) => node.id)
      };
    });

  return { bounds: union([...zones, ...nodes], MAP_PADDING), zones, nodes, edges, views };
}

export function getStudioAiSetup(locale: StudioContentLocale): {
  workflowSteps: (typeof studioAiWorkflowStepsByLocale)["en"];
  notes: Pick<StudioNote, "id" | "title" | "summary">[];
  skills: Pick<StudioAiSkill, "id" | "title" | "summary" | "category" | "markdown">[];
} {
  const folders = locale === "vi" ? getLocalizedStudioFolders("vi") : studioFolders;
  const notes = locale === "vi" ? getLocalizedStudioNotes("vi") : studioNotes;
  const skills = locale === "vi" ? getLocalizedStudioAiSkills("vi") : studioAiSkills;
  const setupNoteIds = folders
    .find((folder) => folder.id === "machine-bootstrap")
    ?.groups.flatMap((group) => group.noteIds) ?? [];
  return {
    workflowSteps: studioAiWorkflowStepsByLocale[locale],
    notes: [...new Set(setupNoteIds)].flatMap((id) => {
      const note = notes.find((candidate) => candidate.id === id);
      return note ? [{ id: note.id, title: note.title, summary: note.summary }] : [];
    }),
    skills: skills.map(({ id, title, summary, category, markdown }) => ({ id, title, summary, category, markdown }))
  };
}
