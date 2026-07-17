export type StudioFlowCanvasNodeKind =
  | "hub"
  | "step"
  | "detail"
  | "input"
  | "default"
  | "output"
  | "group"
  | "service"
  | "gateway"
  | "database"
  | "queue"
  | "topic"
  | "cache"
  | "worker"
  | "external"
  | "decision"
  | "risk"
  | "note"
  | "system";

export type StudioFlowCanvasTone =
  | "source"
  | "process"
  | "agent"
  | "review"
  | "output"
  | "storage"
  | "event"
  | "external"
  | "risk";

export type StudioFlowCanvasNodeData = {
  kind: StudioFlowCanvasNodeKind;
  title: string;
  detail: string;
  badge?: string;
  tone: StudioFlowCanvasTone;
  kindLabel?: string;
  toneLabel?: string;
  scratchLabel?: string;
  hiddenLabel?: string;
  active?: boolean;
  compact?: boolean;
  collapsed?: boolean;
  dimmed?: boolean;
  editable?: boolean;
  hiddenChildCount?: number;
  scratch?: boolean;
};

export type StudioFlowCanvasMode = "inspect" | "edit";
export type StudioFlowLayoutMode = "source" | "compact" | "horizontal" | "wide" | "vertical" | "grid";
export type StudioFlowHelperLines = { x: number | null; y: number | null };
