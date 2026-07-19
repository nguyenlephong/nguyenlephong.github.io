
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  LuArrowUpDown, LuChevronDown, LuChevronRight, LuLayoutDashboard,
  LuMaximize2, LuMinimize2, LuRotateCw
} from "react-icons/lu";
import StudioFlowCanvasFeature from "./StudioFlowCanvasFeature";
import StudioFlowToolbar from "./StudioFlowToolbar";
import { StudioFlowTrailColumn, StudioFlowTrailPanel } from "./StudioFlowTrail";
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioRouteId } from "./studio-route-catalog";
import type { StudioFlow } from "./studio.data";
import type { StudioFlowCanvasMode, StudioFlowHelperLines, StudioFlowLayoutMode } from "./studio-flow-contract";
import { formatStudioFlowLabel } from "./studio-flow-format";
import { loadStudioFlowRuntime } from "./studio-flow-runtime-loader";
import type {
  StudioFlowCanvasNode, StudioFlowConnection, StudioFlowEdge, StudioFlowEdgeChange,
  StudioFlowInstance, StudioFlowNodeChange
} from "./StudioFlowCanvasRuntime";
import {
  FLOW_HISTORY_LIMIT, FLOW_MARKER_ARROW_CLOSED, buildStudioFlowCanvas,
  cloneStudioFlowEdges, cloneStudioFlowNodeForPaste, cloneStudioFlowNodes,
  createScratchNodeId, createScratchNoteNode, createStudioFlowSnapshot,
  flowCanvasToneColors, getConnectedStudioFlowNodeIds, getDisplayStudioFlowEdges,
  getDisplayStudioFlowNodes, getLayoutedStudioFlowNodes, getReactFlowFamilyLabel,
  getSourcePositionedStudioFlowNodes, getStudioFlowMetrics, getStudioFlowTrail,
  type StudioFlowSnapshot
} from "./studio-flow-model";

type StudioFlowId = StudioFlow["id"];

export default function StudioFlowChart({
  flow,
  copy,
  locale,
  routeId
}: {
  flow: StudioFlow;
  copy: StudioUiCopy;
  locale: string;
  routeId: StudioRouteId;
}) {
  const demo = flow.architectureDemo;
  const demoViews = useMemo(() => demo?.views ?? [], [demo]);
  const initialDemoView = demoViews.find((view) => view.id === demo?.defaultViewId) ?? demoViews[0];
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [canvasMode, setCanvasMode] = useState<StudioFlowCanvasMode>("inspect");
  const [layoutMode, setLayoutMode] = useState<StudioFlowLayoutMode>("source");
  const [pendingLayoutMode, setPendingLayoutMode] = useState<StudioFlowLayoutMode>("source");
  const [focusMode, setFocusMode] = useState(false);
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [copiedNode, setCopiedNode] = useState<StudioFlowCanvasNode | null>(null);
  const [history, setHistory] = useState<StudioFlowSnapshot[]>([]);
  const [future, setFuture] = useState<StudioFlowSnapshot[]>([]);
  const [helperLines, setHelperLines] = useState<StudioFlowHelperLines>({ x: null, y: null });
  const flowInstanceRef = useRef<StudioFlowInstance | null>(null);
  const [demoSelection, setDemoSelection] = useState<{ flowId: StudioFlowId; family: string; viewId: string }>({
    flowId: flow.id,
    family: initialDemoView?.family ?? "architecture",
    viewId: initialDemoView?.id ?? ""
  });
  const activeSelection = demoSelection.flowId === flow.id
    ? demoSelection
    : {
      flowId: flow.id,
      family: initialDemoView?.family ?? "architecture",
      viewId: initialDemoView?.id ?? ""
    };
  const selectedFamily = activeSelection.family;
  const selectedViewId = activeSelection.viewId;

  const familyOptions = useMemo(() => {
    const families = new Map<string, string>();
    demoViews.forEach((view) => {
      if (!families.has(view.family)) families.set(view.family, getReactFlowFamilyLabel(view.family, copy.flows));
    });
    return Array.from(families, ([value, label]) => ({ value, label }));
  }, [copy.flows, demoViews]);
  const selectedFamilyViews = useMemo(
    () => demoViews.filter((view) => view.family === selectedFamily),
    [demoViews, selectedFamily]
  );
  const selectedView = demoViews.find((view) => view.id === selectedViewId)
    ?? selectedFamilyViews[0]
    ?? initialDemoView;
  const sourceCanvas = useMemo(
    () => buildStudioFlowCanvas(flow, copy.flows, selectedView?.id),
    [copy.flows, flow, selectedView?.id]
  );
  const [canvasNodes, setCanvasNodes] = useState<StudioFlowCanvasNode[]>(() => cloneStudioFlowNodes(sourceCanvas.nodes));
  const [canvasEdges, setCanvasEdges] = useState<StudioFlowEdge[]>(() => cloneStudioFlowEdges(sourceCanvas.edges));
  const canvasNodesRef = useRef(canvasNodes);
  const canvasEdgesRef = useRef(canvasEdges);
  const hiddenGroupIdsRef = useRef(hiddenGroupIds);
  const layoutModeRef = useRef(layoutMode);
  const isReactFlowDemo = Boolean(demo);
  const isBlueprintDiagram = flow.id === "react-flow-system-blueprint";
  const showMiniMap = !isBlueprintDiagram || selectedView?.id !== "blueprint-full";
  const rawDisplayNodes = useMemo(
    () => getDisplayStudioFlowNodes(canvasNodes, hiddenGroupIds, layoutMode, canvasMode),
    [canvasMode, canvasNodes, hiddenGroupIds, layoutMode]
  );
  const rawDisplayEdges = useMemo(() => getDisplayStudioFlowEdges(canvasEdges, rawDisplayNodes), [canvasEdges, rawDisplayNodes]);
  const relatedNodeIds = useMemo(
    () => getConnectedStudioFlowNodeIds(selectedNodeId, rawDisplayEdges),
    [rawDisplayEdges, selectedNodeId]
  );
  const focusedDisplayNodes = useMemo(
    () => (focusMode && relatedNodeIds ? rawDisplayNodes.filter((node) => relatedNodeIds.has(node.id)) : rawDisplayNodes),
    [focusMode, rawDisplayNodes, relatedNodeIds]
  );
  const focusedDisplayEdges = useMemo(
    () => (
      focusMode && relatedNodeIds
        ? rawDisplayEdges.filter((edge) => relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target))
        : rawDisplayEdges
    ),
    [focusMode, rawDisplayEdges, relatedNodeIds]
  );
  const displayNodes = useMemo(
    () => focusedDisplayNodes.map<StudioFlowCanvasNode>((node) => ({
      ...node,
      data: {
        ...node.data,
        dimmed: Boolean(relatedNodeIds && !relatedNodeIds.has(node.id))
      }
    })),
    [focusedDisplayNodes, relatedNodeIds]
  );
  const displayEdges = useMemo(
    () => focusedDisplayEdges.map<StudioFlowEdge>((edge) => {
      const isRelated = relatedNodeIds ? relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target) : false;
      return {
        ...edge,
        className: relatedNodeIds ? (isRelated ? "is-focus-edge" : "is-dimmed") : edge.className
      };
    }),
    [focusedDisplayEdges, relatedNodeIds]
  );
  const isCompactDiagram = displayNodes.some((node) => node.data.compact);
  const flowMetrics = useMemo(() => getStudioFlowMetrics(displayNodes, displayEdges), [displayEdges, displayNodes]);
  const selectedNode = displayNodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = displayEdges.find((edge) => edge.id === selectedEdgeId) ?? null;
  const trail = useMemo(
    () => getStudioFlowTrail(selectedNodeId, rawDisplayNodes, rawDisplayEdges),
    [rawDisplayEdges, rawDisplayNodes, selectedNodeId]
  );
  const groupNodes = useMemo(
    () => canvasNodes.filter((node) => node.data.kind === "group"),
    [canvasNodes]
  );
  const layoutPresetOptions = useMemo(
    () => [
      { mode: "source" as const, label: copy.flows.layoutPresetSource, icon: LuRotateCw },
      { mode: "compact" as const, label: copy.flows.layoutPresetCompact, icon: LuMinimize2 },
      { mode: "wide" as const, label: copy.flows.layoutPresetWide, icon: LuMaximize2 },
      { mode: "vertical" as const, label: copy.flows.layoutPresetTall, icon: LuArrowUpDown },
      { mode: "grid" as const, label: copy.flows.layoutPresetGrid, icon: LuLayoutDashboard }
    ],
    [copy.flows]
  );
  let fitViewPadding = 0.24;
  if (isReactFlowDemo) fitViewPadding = isBlueprintDiagram ? 0.08 : 0.14;
  if (isCompactDiagram && !isBlueprintDiagram) fitViewPadding = 0.18;

  const fitCurrentBoard = useCallback((duration = 260) => {
    void flowInstanceRef.current?.fitView({
      padding: fitViewPadding,
      duration,
      minZoom: isBlueprintDiagram ? 0.16 : isReactFlowDemo ? 0.26 : 0.5
    });
  }, [fitViewPadding, isBlueprintDiagram, isReactFlowDemo]);

  const scheduleFitBoard = useCallback(() => {
    window.setTimeout(() => fitCurrentBoard(220), 80);
  }, [fitCurrentBoard]);

  useEffect(() => {
    canvasNodesRef.current = canvasNodes;
  }, [canvasNodes]);

  useEffect(() => {
    canvasEdgesRef.current = canvasEdges;
  }, [canvasEdges]);

  useEffect(() => {
    hiddenGroupIdsRef.current = hiddenGroupIds;
  }, [hiddenGroupIds]);

  useEffect(() => {
    layoutModeRef.current = layoutMode;
  }, [layoutMode]);

  const resetCanvasToSource = useCallback((viewId?: string) => {
    const nextCanvas = buildStudioFlowCanvas(flow, copy.flows, viewId);
    setCanvasNodes(cloneStudioFlowNodes(nextCanvas.nodes));
    setCanvasEdges(cloneStudioFlowEdges(nextCanvas.edges));
    setHiddenGroupIds([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    setCopiedNode(null);
    setHistory([]);
    setFuture([]);
    setLayoutMode("source");
    setPendingLayoutMode("source");
    setHelperLines({ x: null, y: null });
    scheduleFitBoard();
  }, [copy.flows, flow, scheduleFitBoard]);

  useEffect(() => {
    if (!isBoardFullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsBoardFullscreen(false);
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener("keydown", onKeyDown);
    };
  }, [isBoardFullscreen]);

  useEffect(() => {
    const onResize = () => scheduleFitBoard();
    globalThis.addEventListener("resize", onResize);
    return () => globalThis.removeEventListener("resize", onResize);
  }, [scheduleFitBoard]);

  const captureHistory = useCallback(() => {
    const snapshot = createStudioFlowSnapshot(
      canvasNodesRef.current,
      canvasEdgesRef.current,
      hiddenGroupIdsRef.current,
      layoutModeRef.current
    );
    setHistory((current) => [...current.slice(-(FLOW_HISTORY_LIMIT - 1)), snapshot]);
    setFuture([]);
  }, []);

  const restoreSnapshot = useCallback((snapshot: StudioFlowSnapshot) => {
    setCanvasNodes(cloneStudioFlowNodes(snapshot.nodes));
    setCanvasEdges(cloneStudioFlowEdges(snapshot.edges));
    setHiddenGroupIds([...snapshot.hiddenGroupIds]);
    setLayoutMode(snapshot.layoutMode);
    setPendingLayoutMode(snapshot.layoutMode);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    setHelperLines({ x: null, y: null });
  }, []);

  const handleUndo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((current) => [
      createStudioFlowSnapshot(canvasNodesRef.current, canvasEdgesRef.current, hiddenGroupIdsRef.current, layoutModeRef.current),
      ...current.slice(0, FLOW_HISTORY_LIMIT - 1)
    ]);
    setHistory((current) => current.slice(0, -1));
    restoreSnapshot(previous);
    track("studio_flow_history_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "undo",
      remaining: Math.max(history.length - 1, 0)
    });
  };

  const handleRedo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((current) => [
      ...current.slice(-(FLOW_HISTORY_LIMIT - 1)),
      createStudioFlowSnapshot(canvasNodesRef.current, canvasEdgesRef.current, hiddenGroupIdsRef.current, layoutModeRef.current)
    ]);
    setFuture((current) => current.slice(1));
    restoreSnapshot(next);
    track("studio_flow_history_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "redo",
      remaining: Math.max(future.length - 1, 0)
    });
  };

  const handleNodesChange = useCallback((changes: StudioFlowNodeChange[]) => {
    void loadStudioFlowRuntime().then(({ applyStudioFlowNodeChanges }) => {
      setCanvasNodes((current) => applyStudioFlowNodeChanges(changes, current));
    });
  }, []);

  const handleEdgesChange = useCallback((changes: StudioFlowEdgeChange[]) => {
    void loadStudioFlowRuntime().then(({ applyStudioFlowEdgeChanges }) => {
      setCanvasEdges((current) => applyStudioFlowEdgeChanges(changes, current));
    });
  }, []);

  const updateHelperLines = useCallback((node: StudioFlowCanvasNode) => {
    const threshold = 8;
    let nextX: number | null = null;
    let nextY: number | null = null;
    for (const candidate of canvasNodesRef.current) {
      if (candidate.id === node.id || candidate.hidden || candidate.data.kind === "group") continue;
      if (Math.abs(candidate.position.x - node.position.x) <= threshold) nextX = candidate.position.x;
      if (Math.abs(candidate.position.y - node.position.y) <= threshold) nextY = candidate.position.y;
      if (nextX !== null && nextY !== null) break;
    }
    setHelperLines({ x: nextX, y: nextY });
  }, []);

  const handleConnect = useCallback((connection: StudioFlowConnection) => {
    if (canvasMode !== "edit" || !connection.source || !connection.target || connection.source === connection.target) return;
    captureHistory();
    const newEdge: StudioFlowEdge = {
      ...connection,
      id: createScratchNodeId("scratch-edge"),
      type: "smoothstep",
      label: "review link",
      markerEnd: { type: FLOW_MARKER_ARROW_CLOSED },
      style: { stroke: flowCanvasToneColors.review, strokeWidth: 2.2 },
      labelStyle: { fill: flowCanvasToneColors.review, fontSize: 11, fontWeight: 700 },
      labelBgStyle: { fill: "var(--card)", fillOpacity: 0.9 },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 6
    };
    void loadStudioFlowRuntime().then(({ addStudioFlowEdge }) => {
      setCanvasEdges((current) => addStudioFlowEdge(newEdge, current));
    });
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "connect",
      source_id: connection.source,
      target_id: connection.target
    });
  }, [canvasMode, captureHistory, flow.id, selectedView?.id]);

  const handleCanvasModeChange = (nextMode: StudioFlowCanvasMode) => {
    setCanvasMode(nextMode);
    setHelperLines({ x: null, y: null });
    track("studio_flow_canvas_mode_change", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      from: canvasMode,
      to: nextMode
    });
  };

  const handleApplyLayout = (nextLayoutMode = pendingLayoutMode) => {
    captureHistory();
    if (nextLayoutMode === "source") {
      setCanvasNodes((current) => getSourcePositionedStudioFlowNodes(current, sourceCanvas.nodes));
      setHiddenGroupIds([]);
    } else {
      setCanvasNodes((current) => getLayoutedStudioFlowNodes(current, nextLayoutMode));
    }
    setLayoutMode(nextLayoutMode);
    setPendingLayoutMode(nextLayoutMode);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    scheduleFitBoard();
    track("studio_flow_layout_apply", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      layout_mode: nextLayoutMode,
      node_count: canvasNodesRef.current.length,
      edge_count: canvasEdgesRef.current.length
    });
  };

  const handleResetBoard = () => {
    captureHistory();
    setCanvasNodes(cloneStudioFlowNodes(sourceCanvas.nodes));
    setCanvasEdges(cloneStudioFlowEdges(sourceCanvas.edges));
    setHiddenGroupIds([]);
    setLayoutMode("source");
    setPendingLayoutMode("source");
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    setHelperLines({ x: null, y: null });
    scheduleFitBoard();
    track("studio_flow_history_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "reset"
    });
  };

  const handleFitBoard = () => {
    fitCurrentBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "fit_view"
    });
  };

  const handleCopyNode = () => {
    if (!selectedNode || selectedNode.data.kind === "group") return;
    setCopiedNode(cloneStudioFlowNodeForPaste(selectedNode));
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "copy",
      node_id: selectedNode.id,
      node_kind: selectedNode.data.kind
    });
  };

  const handlePasteNode = () => {
    const sourceNode = copiedNode ?? (selectedNode && selectedNode.data.kind !== "group" ? selectedNode : null);
    if (!sourceNode) return;
    captureHistory();
    const pastedNode = cloneStudioFlowNodeForPaste(sourceNode);
    setCanvasNodes((current) => [
      ...current.map((node) => ({ ...node, selected: false })),
      pastedNode
    ]);
    setSelectedNodeId(pastedNode.id);
    setSelectedEdgeId(null);
    scheduleFitBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "paste",
      source_node_id: sourceNode.id,
      node_kind: sourceNode.data.kind
    });
  };

  const handleAddNote = () => {
    captureHistory();
    const noteNode = createScratchNoteNode(copy.flows, selectedNode ?? undefined);
    setCanvasNodes((current) => [
      ...current.map((node) => ({ ...node, selected: false })),
      noteNode
    ]);
    setSelectedNodeId(noteNode.id);
    setSelectedEdgeId(null);
    scheduleFitBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "add_note"
    });
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode || selectedNode.data.kind === "group") return;
    captureHistory();
    setCanvasNodes((current) => current.filter((node) => node.id !== selectedNode.id));
    setCanvasEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusMode(false);
    scheduleFitBoard();
    track("studio_flow_node_action", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      action: "delete",
      node_id: selectedNode.id,
      node_kind: selectedNode.data.kind
    });
  };

  const handleToggleGroup = (groupId: string) => {
    captureHistory();
    let hiddenNext = false;
    setHiddenGroupIds((current) => {
      if (current.includes(groupId)) return current.filter((id) => id !== groupId);
      hiddenNext = true;
      return [...current, groupId];
    });
    scheduleFitBoard();
    track("studio_flow_group_visibility_toggle", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      group_id: groupId,
      hidden_next: hiddenNext
    });
  };

  const handleTrailNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    scheduleFitBoard();
    track("studio_flow_node_select", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      node_id: nodeId,
      source: "trail"
    });
  }, [flow.id, scheduleFitBoard, selectedView?.id]);

  const handleToggleFocusMode = useCallback((nextFocusMode = !focusMode) => {
    if (!selectedNode) return;
    setFocusMode(nextFocusMode);
    scheduleFitBoard();
    track("studio_flow_focus_toggle", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      node_id: selectedNode.id,
      enabled: nextFocusMode
    });
  }, [flow.id, focusMode, scheduleFitBoard, selectedNode, selectedView?.id]);

  const toggleFullscreen = () => {
    const fullscreenNext = !isBoardFullscreen;
    track("studio_flow_board_fullscreen_toggle", {
      flow_id: flow.id,
      view_id: selectedView?.id,
      fullscreen_next: fullscreenNext
    });
    setIsBoardFullscreen(fullscreenNext);
  };

  const handleFamilySelect = (nextFamily: string) => {
    if (!demo) return;
    const nextView = demo.views.find((view) => view.family === nextFamily);
    track("studio_flow_example_select", {
      flow_id: flow.id,
      source: "family_select",
      previous_family: selectedFamily,
      previous_view_id: selectedView?.id,
      next_family: nextFamily,
      next_view_id: nextView?.id
    });
    setDemoSelection({ flowId: flow.id, family: nextFamily, viewId: nextView?.id ?? "" });
    resetCanvasToSource(nextView?.id);
  };

  const handleViewSelect = (nextViewId: string) => {
    if (!demo || !selectedView) return;
    const nextView = demo.views.find((view) => view.id === nextViewId);
    track("studio_flow_example_select", {
      flow_id: flow.id,
      source: "view_select",
      previous_family: selectedFamily,
      previous_view_id: selectedView.id,
      next_family: nextView?.family ?? selectedFamily,
      next_view_id: nextViewId
    });
    setDemoSelection({
      flowId: flow.id,
      family: nextView?.family ?? selectedFamily,
      viewId: nextViewId
    });
    resetCanvasToSource(nextViewId);
  };

  return (
    <section className={`flow-chart-surface${isReactFlowDemo ? " is-architecture-demo" : ""}${isBlueprintDiagram ? " is-blueprint-diagram" : ""}${isCompactDiagram ? " is-compact-diagram" : ""}${isBoardFullscreen ? " is-fullscreen" : ""}`} aria-label={copy.flows.chartLabel}>
      <div className="flow-chart-head">
        <div>
          <h3>{selectedView?.title ?? flow.title}</h3>
        </div>
        <p>{selectedView?.description ?? copy.flows.chartHint}</p>
      </div>

      <StudioFlowToolbar
        demo={demo}
        selectedView={selectedView}
        selectedFamily={selectedFamily}
        selectedFamilyViews={selectedFamilyViews}
        familyOptions={familyOptions}
        layoutPresetOptions={layoutPresetOptions}
        layoutMode={layoutMode}
        pendingLayoutMode={pendingLayoutMode}
        canvasMode={canvasMode}
        historyCount={history.length}
        futureCount={future.length}
        canCopySelected={Boolean(selectedNode && selectedNode.data.kind !== "group")}
        canPasteSelected={Boolean(copiedNode || (selectedNode && selectedNode.data.kind !== "group"))}
        focusMode={focusMode}
        isBoardFullscreen={isBoardFullscreen}
        copy={copy.flows}
        onFamilySelect={handleFamilySelect}
        onViewSelect={handleViewSelect}
        onApplyLayout={handleApplyLayout}
        onCanvasModeChange={handleCanvasModeChange}
        onPendingLayoutModeChange={setPendingLayoutMode}
        onFitBoard={handleFitBoard}
        onResetBoard={handleResetBoard}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopyNode={handleCopyNode}
        onPasteNode={handlePasteNode}
        onAddNote={handleAddNote}
        onDeleteNode={handleDeleteSelectedNode}
        onToggleFocusMode={() => handleToggleFocusMode()}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="flow-canvas-shell">
        <StudioFlowCanvasFeature
          key={selectedView?.id ?? flow.id}
          locale={locale}
          routeId={routeId}
          surfaceClassName={`flow-react-surface${isReactFlowDemo ? " is-architecture-demo" : ""}${isBlueprintDiagram ? " is-blueprint-diagram" : ""}${isCompactDiagram ? " is-compact-diagram" : ""}${canvasMode === "edit" ? " is-edit-mode" : ""}`}
          className="flow-react-canvas"
          nodes={displayNodes}
          edges={displayEdges}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
          }}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(event, node) => {
            event.stopPropagation();
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            track("studio_flow_node_select", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              node_id: node.id,
              node_kind: node.data.kind,
              node_tone: node.data.tone
            });
          }}
          onNodeDoubleClick={(event, node) => {
            event.stopPropagation();
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            setFocusMode(true);
            scheduleFitBoard();
            track("studio_flow_focus_toggle", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              node_id: node.id,
              enabled: true,
              source: "double_click"
            });
          }}
          onEdgeClick={(event, edge) => {
            event.stopPropagation();
            setSelectedEdgeId(edge.id);
            setSelectedNodeId(null);
            setFocusMode(false);
            track("studio_flow_node_select", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              edge_id: edge.id,
              source_id: edge.source,
              target_id: edge.target
            });
          }}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
            setFocusMode(false);
          }}
          onNodeDragStart={(_, node) => {
            if (canvasMode !== "edit") return;
            captureHistory();
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
          }}
          onNodeDrag={(_, node) => {
            if (canvasMode === "edit") updateHelperLines(node);
          }}
          onNodeDragStop={(_, node) => {
            setHelperLines({ x: null, y: null });
            if (canvasMode !== "edit") return;
            track("studio_flow_node_action", {
              flow_id: flow.id,
              view_id: selectedView?.id,
              action: "move",
              node_id: node.id,
              node_kind: node.data.kind
            });
          }}
          fitView
          fitViewOptions={{
            padding: fitViewPadding,
            minZoom: isBlueprintDiagram ? 0.16 : isReactFlowDemo ? 0.26 : 0.5
          }}
          minZoom={isBlueprintDiagram ? 0.1 : 0.18}
          maxZoom={isBlueprintDiagram ? 1.9 : 1.6}
          nodesDraggable={canvasMode === "edit"}
          nodesConnectable={canvasMode === "edit"}
          deleteKeyCode={null}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          blueprint={isBlueprintDiagram}
          helperLines={helperLines}
          showMiniMap={showMiniMap}
          trailPanel={(
            <StudioFlowTrailPanel
              activeNode={selectedNode}
              incoming={trail.incoming}
              outgoing={trail.outgoing}
              focusMode={focusMode}
              copy={copy.flows}
              onSelectNode={handleTrailNodeSelect}
            />
          )}
        />

        <aside className="flow-inspector-panel" aria-label={copy.flows.inspector}>
          <div className="flow-inspector-head">
            <strong>{copy.flows.inspector}</strong>
            <span>{layoutMode === "source" ? copy.flows.layoutSource : layoutMode}</span>
          </div>
          <div className="flow-metric-strip" aria-label={copy.routeMetricsLabel}>
            <span><strong>{flowMetrics.nodeCount}</strong>{copy.flows.nodeCount}</span>
            <span><strong>{flowMetrics.edgeCount}</strong>{copy.flows.edgeCount}</span>
            <span><strong>{flowMetrics.groupCount}</strong>{copy.flows.groupCount}</span>
            <span><strong>{flowMetrics.hiddenCount}</strong>{copy.flows.hiddenCount}</span>
          </div>
          <p className="flow-sandbox-note">{copy.flows.boardSandbox}</p>
          <div className={`flow-selected-card${selectedNode ? " is-node" : ""}${selectedEdge ? " is-edge" : ""}`}>
            {selectedNode ? (
              <>
                <span>{copy.flows.nodeDetails}</span>
                <strong>{selectedNode.data.title}</strong>
                <p>{selectedNode.data.detail}</p>
                <div className="flow-node-meta-grid">
                  <small>{formatStudioFlowLabel(selectedNode.data.kind)}</small>
                  <small>{formatStudioFlowLabel(selectedNode.data.tone)}</small>
                  {selectedNode.data.badge ? <small>{selectedNode.data.badge}</small> : null}
                </div>
              </>
            ) : selectedEdge ? (
              <>
                <span>{copy.flows.edgeDetails}</span>
                <strong>{String(selectedEdge.label ?? selectedEdge.id)}</strong>
                <p>{`${selectedEdge.source} -> ${selectedEdge.target}`}</p>
                <small>{selectedEdge.type ?? "default"}</small>
              </>
            ) : (
              <p>{copy.flows.noSelection}</p>
            )}
          </div>
          {selectedNode && (
            <div className="flow-relation-map" aria-label={copy.flows.relationMap}>
              <div className="flow-relation-map-head">
                <strong>{copy.flows.relationMap}</strong>
                <button
                  type="button"
                  onClick={() => handleToggleFocusMode()}
                  disabled={!selectedNode}
                >
                  {focusMode ? copy.flows.fullGraph : copy.flows.isolate}
                </button>
              </div>
              <div className="flow-relation-columns">
                <StudioFlowTrailColumn
                  label={copy.flows.upstream}
                  items={trail.incoming}
                  emptyLabel={copy.flows.trailEmpty}
                  moreLabel={copy.flows.trailMore}
                  onSelectNode={handleTrailNodeSelect}
                />
                <StudioFlowTrailColumn
                  label={copy.flows.downstream}
                  items={trail.outgoing}
                  emptyLabel={copy.flows.trailEmpty}
                  moreLabel={copy.flows.trailMore}
                  onSelectNode={handleTrailNodeSelect}
                />
              </div>
            </div>
          )}
          {groupNodes.length > 0 && (
            <div className="flow-group-visibility" aria-label={copy.flows.groupCount}>
              {groupNodes.map((groupNode) => {
                const isHidden = hiddenGroupIds.includes(groupNode.id);
                return (
                  <button key={groupNode.id} type="button" onClick={() => handleToggleGroup(groupNode.id)}>
                    {isHidden ? <LuChevronRight aria-hidden="true" /> : <LuChevronDown aria-hidden="true" />}
                    <span>{groupNode.data.title}</span>
                    <small>{isHidden ? copy.flows.expandGroup : copy.flows.collapseGroup}</small>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {!demo && (
        <div className="flow-chart-outcome">
          <span>{copy.flows.chartOutcome}</span>
          <strong>{flow.outcome}</strong>
        </div>
      )}
    </section>
  );
}
