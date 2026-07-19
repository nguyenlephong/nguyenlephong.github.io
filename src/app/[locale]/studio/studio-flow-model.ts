
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioFlow, StudioFlowArchitectureEdgeSpec } from "./studio.data";
import type { CSSProperties } from "react";
import type { StudioFlowCanvasMode, StudioFlowCanvasTone, StudioFlowLayoutMode } from "./studio-flow-contract";
import { formatStudioFlowLabel } from "./studio-flow-format";
import type { StudioFlowCanvasNode, StudioFlowEdge, StudioFlowMarkerType } from "./StudioFlowCanvasRuntime";

export type StudioFlowSnapshot = {
  nodes: StudioFlowCanvasNode[];
  edges: StudioFlowEdge[];
  hiddenGroupIds: string[];
  layoutMode: StudioFlowLayoutMode;
};

export const FLOW_HISTORY_LIMIT = 24;
const FLOW_NODE_WIDTH = 240;
const FLOW_NODE_HEIGHT = 112;
const FLOW_GROUP_MARGIN = 24;
const FLOW_MARKER_ARROW = "arrow" as StudioFlowMarkerType;
export const FLOW_MARKER_ARROW_CLOSED = "arrowclosed" as StudioFlowMarkerType;

const flowCanvasTones: StudioFlowCanvasTone[] = [
  "source",
  "process",
  "agent",
  "review",
  "storage",
  "event",
  "external",
  "risk",
  "output"
];

export const flowCanvasToneColors: Record<StudioFlowCanvasTone, string> = {
  source: "#2563eb",
  process: "#0f766e",
  agent: "#d97706",
  review: "#7c3aed",
  storage: "#0891b2",
  event: "#9333ea",
  external: "#64748b",
  risk: "#dc2626",
  output: "#16a34a"
};

const reactFlowExampleFamilyLabels: Record<string, string> = {
  overview: "Overview",
  interaction: "Interaction",
  grouping: "Subflows & Grouping",
  layout: "Layout",
  styling: "Styling",
  whiteboard: "Whiteboard",
  architecture: "Software Architecture"
};

export function getReactFlowFamilyLabel(family: string, copy: StudioUiCopy["flows"]) {
  return copy.familyLabels[family] ?? reactFlowExampleFamilyLabels[family] ?? family;
}

export function buildStudioFlowCanvas(flow: StudioFlow, copy: StudioUiCopy["flows"], viewId?: string): {
  nodes: StudioFlowCanvasNode[];
  edges: StudioFlowEdge[];
} {
  if (flow.architectureDemo) {
    return buildArchitectureDemoCanvas(flow, copy, viewId);
  }

  const nodes = flow.steps.map<StudioFlowCanvasNode>((step, index) => {
    const tone = flowCanvasTones[index % flowCanvasTones.length] ?? "process";
    return {
      id: step.id,
      type: "studioFlow",
      position: {
        x: index * 270,
        y: index % 2 === 0 ? 34 : 178
      },
      data: {
        kind: "step",
        title: step.title,
        detail: step.output,
        badge: String(index + 1).padStart(2, "0"),
        tone,
        kindLabel: copy.nodeLabels["step"],
        toneLabel: copy.nodeLabels[tone],
        scratchLabel: copy.scratch,
        hiddenLabel: copy.hiddenCount.toLocaleLowerCase()
      }
    };
  });

  const outcomeNode: StudioFlowCanvasNode = {
    id: `${flow.id}-outcome`,
    type: "studioFlow",
    position: { x: flow.steps.length * 270 + 16, y: 90 },
    data: {
      kind: "detail",
      title: copy.chartOutcome,
      detail: flow.outcome,
      badge: "goal",
      tone: "output",
      kindLabel: copy.nodeLabels["detail"],
      toneLabel: copy.nodeLabels["output"],
      scratchLabel: copy.scratch,
      hiddenLabel: copy.hiddenCount.toLocaleLowerCase()
    }
  };

  const edges: StudioFlowEdge[] = [];
  for (let index = 1; index < nodes.length; index += 1) {
    const source = nodes[index - 1];
    const target = nodes[index];
    if (!source || !target) continue;

    const tone = target.data.tone;
    edges.push({
      id: `${source.id}-${target.id}`,
      source: source.id,
      target: target.id,
      type: "smoothstep",
      animated: index < 3,
      markerEnd: { type: FLOW_MARKER_ARROW_CLOSED },
      style: { stroke: flowCanvasToneColors[tone], strokeWidth: 2 }
    });
  }

  const lastStep = nodes.at(-1);
  if (lastStep) {
    edges.push({
      id: `${lastStep.id}-${outcomeNode.id}`,
      source: lastStep.id,
      target: outcomeNode.id,
      type: "smoothstep",
      markerEnd: { type: FLOW_MARKER_ARROW_CLOSED },
      style: { stroke: flowCanvasToneColors.output, strokeWidth: 2 }
    });
  }

  return { nodes: [...nodes, outcomeNode], edges };
}

function getStudioFlowEdgeMarker(marker: StudioFlowArchitectureEdgeSpec["marker"]): StudioFlowEdge["markerEnd"] {
  if (marker === "arrow") return { type: FLOW_MARKER_ARROW };
  if (marker === "arrowClosed") return { type: FLOW_MARKER_ARROW_CLOSED };
  return undefined;
}

function buildArchitectureDemoCanvas(flow: StudioFlow, copy: StudioUiCopy["flows"], viewId?: string): {
  nodes: StudioFlowCanvasNode[];
  edges: StudioFlowEdge[];
} {
  const demo = flow.architectureDemo;
  if (!demo) return { nodes: [], edges: [] };
  const view = demo.views.find((candidate) => candidate.id === viewId)
    ?? demo.views.find((candidate) => candidate.id === demo.defaultViewId)
    ?? demo.views[0];
  const viewNodes = view?.nodes ?? demo.nodes;
  const viewEdges = view?.edges ?? demo.edges;

  const nodes = viewNodes.map<StudioFlowCanvasNode>((node) => ({
    id: node.id,
    type: "studioFlow",
    position: node.position,
    zIndex: node.kind === "group" ? 0 : 2,
    style: node.size ? { width: node.size.width, height: node.size.height } : undefined,
    data: {
      kind: node.kind,
      title: node.title,
      detail: node.detail,
      badge: node.badge,
      tone: node.tone,
      kindLabel: copy.nodeLabels[node.kind],
      toneLabel: copy.nodeLabels[node.tone],
      scratchLabel: copy.scratch,
      hiddenLabel: copy.hiddenCount.toLocaleLowerCase(),
      active: node.kind !== "group",
      compact: node.compact
    }
  }));

  const edges = viewEdges.map<StudioFlowEdge>((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    label: edge.label,
    animated: edge.animated,
    markerEnd: getStudioFlowEdgeMarker(edge.marker),
    style: { stroke: flowCanvasToneColors[edge.tone], strokeWidth: edge.animated ? 2.4 : 1.8 },
    labelStyle: { fill: flowCanvasToneColors[edge.tone], fontSize: 11, fontWeight: 700 },
    labelBgStyle: { fill: "var(--card)", fillOpacity: 0.86 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 6
  }));

  return { nodes, edges };
}

export function cloneStudioFlowNodes(nodes: StudioFlowCanvasNode[]): StudioFlowCanvasNode[] {
  return nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
    style: node.style ? { ...node.style } : undefined
  }));
}

export function cloneStudioFlowEdges(edges: StudioFlowEdge[]): StudioFlowEdge[] {
  return edges.map((edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : undefined,
    markerEnd: edge.markerEnd && typeof edge.markerEnd === "object" ? { ...edge.markerEnd } : edge.markerEnd,
    markerStart: edge.markerStart && typeof edge.markerStart === "object" ? { ...edge.markerStart } : edge.markerStart,
    style: edge.style ? { ...edge.style } : undefined,
    labelStyle: edge.labelStyle ? { ...edge.labelStyle } : undefined,
    labelBgStyle: edge.labelBgStyle ? { ...edge.labelBgStyle } : undefined
  }));
}

export function createStudioFlowSnapshot(
  nodes: StudioFlowCanvasNode[],
  edges: StudioFlowEdge[],
  hiddenGroupIds: string[],
  layoutMode: StudioFlowLayoutMode
): StudioFlowSnapshot {
  return {
    nodes: cloneStudioFlowNodes(nodes),
    edges: cloneStudioFlowEdges(edges),
    hiddenGroupIds: [...hiddenGroupIds],
    layoutMode
  };
}

function parseFlowDimension(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function getStudioFlowNodeSize(node: StudioFlowCanvasNode) {
  return {
    width: parseFlowDimension(node.style?.width ?? node.width, node.data.kind === "group" ? 520 : FLOW_NODE_WIDTH),
    height: parseFlowDimension(node.style?.height ?? node.height, node.data.kind === "group" ? 320 : FLOW_NODE_HEIGHT)
  };
}

function isNodeInsideGroup(node: StudioFlowCanvasNode, groupNode: StudioFlowCanvasNode) {
  if (node.id === groupNode.id || node.data.kind === "group") return false;
  const groupSize = getStudioFlowNodeSize(groupNode);
  const nodeCenter = {
    x: node.position.x + FLOW_NODE_WIDTH / 2,
    y: node.position.y + FLOW_NODE_HEIGHT / 2
  };
  return nodeCenter.x >= groupNode.position.x + FLOW_GROUP_MARGIN
    && nodeCenter.x <= groupNode.position.x + groupSize.width - FLOW_GROUP_MARGIN
    && nodeCenter.y >= groupNode.position.y + FLOW_GROUP_MARGIN
    && nodeCenter.y <= groupNode.position.y + groupSize.height - FLOW_GROUP_MARGIN;
}

function getStudioFlowGroupChildren(nodes: StudioFlowCanvasNode[]) {
  const groups = nodes.filter((node) => node.data.kind === "group");
  const childrenByGroup = new Map<string, string[]>();

  groups.forEach((groupNode) => {
    childrenByGroup.set(
      groupNode.id,
      nodes.filter((node) => isNodeInsideGroup(node, groupNode)).map((node) => node.id)
    );
  });

  return childrenByGroup;
}

export function getLayoutedStudioFlowNodes(nodes: StudioFlowCanvasNode[], layoutMode: StudioFlowLayoutMode) {
  if (layoutMode === "source") return cloneStudioFlowNodes(nodes);

  const sortedNodes = nodes
    .filter((node) => node.data.kind !== "group")
    .sort((left, right) => left.position.x - right.position.x || left.position.y - right.position.y);
  const columns = layoutMode === "grid" ? Math.max(2, Math.ceil(Math.sqrt(sortedNodes.length))) : sortedNodes.length;
  const horizontalGap = layoutMode === "compact" ? 238 : layoutMode === "wide" ? 340 : 290;
  const verticalGap = layoutMode === "compact" ? 128 : layoutMode === "wide" ? 178 : 150;
  const positions = new Map<string, { x: number; y: number }>();

  sortedNodes.forEach((node, index) => {
    if (layoutMode === "horizontal" || layoutMode === "compact" || layoutMode === "wide") {
      positions.set(node.id, { x: index * horizontalGap, y: index % 2 === 0 ? 0 : verticalGap });
      return;
    }
    if (layoutMode === "vertical") {
      positions.set(node.id, { x: index % 2 === 0 ? 0 : horizontalGap, y: index * verticalGap });
      return;
    }
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions.set(node.id, { x: column * horizontalGap, y: row * (verticalGap + 20) });
  });

  return nodes.map((node) => ({
    ...node,
    hidden: node.data.kind === "group" ? true : undefined,
    position: positions.get(node.id) ?? node.position,
    data: { ...node.data }
  }));
}

export function getSourcePositionedStudioFlowNodes(
  nodes: StudioFlowCanvasNode[],
  sourceNodes: StudioFlowCanvasNode[]
): StudioFlowCanvasNode[] {
  const sourceById = new Map(sourceNodes.map((node) => [node.id, node]));

  return nodes.map((node) => {
    const sourceNode = sourceById.get(node.id);
    if (!sourceNode) {
      return {
        ...node,
        data: { ...node.data },
        position: { ...node.position },
        style: node.style ? { ...node.style } : undefined
      };
    }

    return {
      ...node,
      hidden: sourceNode.hidden,
      position: { ...sourceNode.position },
      style: sourceNode.style ? { ...sourceNode.style } : undefined,
      data: {
        ...node.data,
        compact: sourceNode.data.compact,
        collapsed: false,
        hiddenChildCount: undefined
      }
    };
  });
}

export function getDisplayStudioFlowNodes(
  nodes: StudioFlowCanvasNode[],
  hiddenGroupIds: string[],
  layoutMode: StudioFlowLayoutMode,
  canvasMode: StudioFlowCanvasMode
): StudioFlowCanvasNode[] {
  const hiddenGroups = new Set(hiddenGroupIds);
  const groupChildren = getStudioFlowGroupChildren(nodes);
  const hiddenChildren = new Set<string>();
  hiddenGroups.forEach((groupId) => {
    groupChildren.get(groupId)?.forEach((nodeId) => hiddenChildren.add(nodeId));
  });

  return nodes.map<StudioFlowCanvasNode>((node) => {
    const collapsed = hiddenGroups.has(node.id);
    const isGroup = node.data.kind === "group";
    const passthroughGroupStyle = isGroup && canvasMode !== "edit"
      ? ({ ...node.style, pointerEvents: "none" } satisfies CSSProperties)
      : node.style;
    return {
      ...node,
      hidden: Boolean(node.hidden) || hiddenChildren.has(node.id) || (layoutMode !== "source" && isGroup),
      style: passthroughGroupStyle,
      selectable: !isGroup || canvasMode === "edit",
      draggable: canvasMode === "edit" && !isGroup,
      connectable: canvasMode === "edit" && !isGroup,
      data: {
        ...node.data,
        collapsed,
        editable: canvasMode === "edit",
        hiddenChildCount: isGroup ? groupChildren.get(node.id)?.length ?? 0 : undefined
      }
    };
  });
}

export function getDisplayStudioFlowEdges(edges: StudioFlowEdge[], nodes: StudioFlowCanvasNode[]) {
  const visibleNodeIds = new Set(nodes.filter((node) => !node.hidden).map((node) => node.id));
  return edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
}

let scratchNodeSequence = 0;

export function createScratchNodeId(prefix: string) {
  scratchNodeSequence += 1;
  const uniquePart = globalThis.crypto?.randomUUID?.() ?? scratchNodeSequence.toString(36);
  return `${prefix}-${Date.now().toString(36)}-${scratchNodeSequence.toString(36)}-${uniquePart}`;
}

export function createScratchNoteNode(copy: StudioUiCopy["flows"], anchorNode?: StudioFlowCanvasNode): StudioFlowCanvasNode {
  const position = anchorNode
    ? { x: anchorNode.position.x + 280, y: anchorNode.position.y + 24 }
    : { x: 40, y: 40 };
  return {
    id: createScratchNodeId("scratch-note"),
    type: "studioFlow",
    position,
    data: {
      kind: "note",
      title: copy.reviewNote,
      detail: copy.temporaryAnnotation,
      badge: "note",
      tone: "review",
      kindLabel: copy.nodeLabels["note"],
      toneLabel: copy.nodeLabels["review"],
      scratchLabel: copy.scratch,
      hiddenLabel: copy.hiddenCount.toLocaleLowerCase(),
      active: true,
      scratch: true
    }
  };
}

export function cloneStudioFlowNodeForPaste(node: StudioFlowCanvasNode): StudioFlowCanvasNode {
  return {
    ...node,
    id: createScratchNodeId(`${node.id}-copy`),
    selected: true,
    position: { x: node.position.x + 36, y: node.position.y + 36 },
    data: {
      ...node.data,
      badge: node.data.badge ?? "copy",
      scratch: true
    }
  };
}

export function getStudioFlowMetrics(nodes: StudioFlowCanvasNode[], edges: StudioFlowEdge[]) {
  return {
    nodeCount: nodes.filter((node) => !node.hidden && node.data.kind !== "group").length,
    edgeCount: edges.length,
    groupCount: nodes.filter((node) => node.data.kind === "group").length,
    hiddenCount: nodes.filter((node) => node.hidden).length
  };
}

export function getConnectedStudioFlowNodeIds(activeNodeId: string | null, edges: StudioFlowEdge[]) {
  if (!activeNodeId) return null;
  const ids = new Set<string>([activeNodeId]);
  edges.forEach((edge) => {
    if (edge.source === activeNodeId) ids.add(edge.target);
    if (edge.target === activeNodeId) ids.add(edge.source);
  });
  return ids;
}

export type StudioFlowTrailItem = {
  edge: StudioFlowEdge;
  node: StudioFlowCanvasNode;
};

export function getStudioFlowTrail(
  activeNodeId: string | null,
  nodes: StudioFlowCanvasNode[],
  edges: StudioFlowEdge[]
): { incoming: StudioFlowTrailItem[]; outgoing: StudioFlowTrailItem[] } {
  if (!activeNodeId) return { incoming: [], outgoing: [] };
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  return edges.reduce<{ incoming: StudioFlowTrailItem[]; outgoing: StudioFlowTrailItem[] }>(
    (trail, edge) => {
      if (edge.source === activeNodeId) {
        const targetNode = nodeById.get(edge.target);
        if (targetNode) trail.outgoing.push({ edge, node: targetNode });
      }
      if (edge.target === activeNodeId) {
        const sourceNode = nodeById.get(edge.source);
        if (sourceNode) trail.incoming.push({ edge, node: sourceNode });
      }
      return trail;
    },
    { incoming: [], outgoing: [] }
  );
}
