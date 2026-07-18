"use client";

import type { ReactNode } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ViewportPortal,
  type Connection,
  type Edge,
  type EdgeChange,
  type MarkerType,
  type Node,
  type NodeChange,
  type NodeProps,
  type ReactFlowInstance,
  type ReactFlowProps
} from "@xyflow/react";
import {
  LuArchive,
  LuBarChart,
  LuCheckCircle2,
  LuDatabase,
  LuFileText,
  LuFlag,
  LuGlobe,
  LuHelpCircle,
  LuLineChart,
  LuLock,
  LuServer,
  LuSettings,
  LuUsers,
  LuWorkflow
} from "react-icons/lu";
import type {
  StudioFlowCanvasNodeData,
  StudioFlowCanvasNodeKind,
  StudioFlowHelperLines
} from "./studio-flow-contract";
import { formatStudioFlowLabel } from "./studio-flow-format";

export type StudioFlowCanvasNode = Node<StudioFlowCanvasNodeData, "studioFlow">;
export type StudioFlowEdge = Edge;
export type StudioFlowConnection = Connection;
export type StudioFlowNodeChange = NodeChange<StudioFlowCanvasNode>;
export type StudioFlowEdgeChange = EdgeChange<Edge>;
export type StudioFlowInstance = ReactFlowInstance<StudioFlowCanvasNode, Edge>;
export type StudioFlowMarkerType = MarkerType;

export type StudioFlowCanvasRuntimeProps = Omit<
  ReactFlowProps<StudioFlowCanvasNode, Edge>,
  "children" | "nodeTypes"
> & {
  blueprint: boolean;
  helperLines: StudioFlowHelperLines;
  showMiniMap: boolean;
  surfaceClassName: string;
  trailPanel: ReactNode;
};

function renderStudioFlowNodeIcon(kind: StudioFlowCanvasNodeKind, badge?: string) {
  if (kind === "database" || badge === "db") return <LuDatabase />;
  if (kind === "cache" || badge === "cache") return <LuArchive />;
  if (kind === "queue" || kind === "topic" || badge === "event") return <LuWorkflow />;
  if (kind === "worker" || badge === "async") return <LuSettings />;
  if (kind === "external" || badge === "external" || badge === "edge") return <LuGlobe />;
  if (kind === "gateway" || badge === "service") return <LuServer />;
  if (kind === "input" || badge === "client") return <LuUsers />;
  if (kind === "output") return <LuCheckCircle2 />;
  if (kind === "risk") return <LuFlag />;
  if (kind === "note") return <LuFileText />;
  if (kind === "decision") return <LuHelpCircle />;
  if (badge === "security") return <LuLock />;
  if (badge === "ops") return <LuLineChart />;
  if (badge === "analytics") return <LuBarChart />;
  return <LuServer />;
}

function StudioFlowCanvasNodeCard({ data, selected }: NodeProps<StudioFlowCanvasNode>) {
  const canConnect = data.kind !== "group";
  const detail = data.collapsed && data.hiddenChildCount
    ? `${data.detail} ${data.hiddenChildCount} ${data.hiddenLabel ?? "hidden"}.`
    : data.detail;
  const kindLabel = data.kindLabel ?? formatStudioFlowLabel(data.kind);
  const toneLabel = data.toneLabel ?? formatStudioFlowLabel(data.tone);

  return (
    <div className={`flow-react-node flow-react-node--${data.kind} tone-${data.tone}${data.active ? " is-active" : ""}${data.compact ? " is-compact" : ""}${data.collapsed ? " is-collapsed" : ""}${data.scratch ? " is-scratch" : ""}${data.dimmed ? " is-dimmed" : ""}${selected ? " is-selected" : ""}`}>
      {canConnect && <Handle type="target" position={Position.Left} />}
      {canConnect && <Handle className="flow-react-handle-top" type="target" position={Position.Top} />}
      <div className="flow-react-node-topline">
        <span className="flow-react-node-icon" aria-hidden="true">{renderStudioFlowNodeIcon(data.kind, data.badge)}</span>
        <span className="flow-react-node-type">{kindLabel}</span>
        {data.badge && <span className="flow-react-node-badge">{data.badge}</span>}
      </div>
      <strong>{data.title}</strong>
      <small>{detail}</small>
      <div className="flow-react-node-footer">
        <span>{toneLabel}</span>
        {data.scratch && <em>{data.scratchLabel ?? "Scratch"}</em>}
        {data.hiddenChildCount ? <em>{data.hiddenChildCount} {data.hiddenLabel ?? "hidden"}</em> : null}
      </div>
      {canConnect && <Handle type="source" position={Position.Right} />}
      {canConnect && <Handle className="flow-react-handle-bottom" type="source" position={Position.Bottom} />}
    </div>
  );
}

const studioFlowNodeTypes = { studioFlow: StudioFlowCanvasNodeCard };

export function applyStudioFlowNodeChanges(changes: StudioFlowNodeChange[], nodes: StudioFlowCanvasNode[]) {
  return applyNodeChanges(changes, nodes);
}

export function applyStudioFlowEdgeChanges(changes: StudioFlowEdgeChange[], edges: Edge[]) {
  return applyEdgeChanges(changes, edges);
}

export function addStudioFlowEdge(connection: Connection | Edge, edges: Edge[]) {
  return addEdge(connection, edges);
}

export default function StudioFlowCanvasRuntime({
  blueprint,
  helperLines,
  showMiniMap,
  surfaceClassName,
  trailPanel,
  ...flowProps
}: StudioFlowCanvasRuntimeProps) {
  return (
    <div className={surfaceClassName} data-studio-flow-runtime="true">
      <ReactFlow {...flowProps} nodeTypes={studioFlowNodeTypes}>
        <Background color="color-mix(in srgb, var(--foreground) 12%, transparent)" gap={22} />
        <Controls showInteractive={false} />
        <Panel position="top-center" className="flow-trail-panel-host">{trailPanel}</Panel>
        <ViewportPortal>
          {helperLines.x !== null && <div className="flow-helper-line is-vertical" style={{ left: helperLines.x }} />}
          {helperLines.y !== null && <div className="flow-helper-line is-horizontal" style={{ top: helperLines.y }} />}
        </ViewportPortal>
        {showMiniMap && (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            bgColor="var(--flow-minimap-bg)"
            maskColor="var(--flow-minimap-mask)"
            maskStrokeColor="var(--flow-minimap-stroke)"
            maskStrokeWidth={blueprint ? 1.15 : 1.8}
            nodeColor="var(--flow-minimap-node-fill)"
            nodeStrokeColor="var(--flow-minimap-node-stroke)"
            nodeStrokeWidth={blueprint ? 1.15 : 2.6}
            nodeBorderRadius={blueprint ? 4 : 8}
          />
        )}
      </ReactFlow>
    </div>
  );
}
