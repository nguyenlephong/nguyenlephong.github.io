"use client";

import { formatStudioFlowLabel } from "./studio-flow-format";
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioFlowCanvasNode } from "./StudioFlowCanvasRuntime";
import type { StudioFlowTrailItem } from "./studio-flow-model";

export function StudioFlowTrailColumn({
  label,
  items,
  emptyLabel,
  moreLabel,
  onSelectNode
}: {
  label: string;
  items: StudioFlowTrailItem[];
  emptyLabel: string;
  moreLabel: (count: number) => string;
  onSelectNode: (nodeId: string) => void;
}) {
  const visibleItems = items.slice(0, 3);
  return (
    <section>
      <h4>{label}</h4>
      {visibleItems.length === 0 ? <span className="flow-trail-empty">{emptyLabel}</span> : null}
      {visibleItems.map((item) => (
        <button
          key={item.edge.id}
          type="button"
          className="flow-trail-node-button"
          onClick={() => onSelectNode(item.node.id)}
          title={item.node.data.title}
        >
          <small>{String(item.edge.label ?? item.edge.id)}</small>
          <strong>{item.node.data.title}</strong>
        </button>
      ))}
      {items.length > visibleItems.length ? (
        <span className="flow-trail-more">{moreLabel(items.length - visibleItems.length)}</span>
      ) : null}
    </section>
  );
}

export function StudioFlowTrailPanel({
  activeNode,
  incoming,
  outgoing,
  focusMode,
  copy,
  onSelectNode
}: {
  activeNode: StudioFlowCanvasNode | null;
  incoming: StudioFlowTrailItem[];
  outgoing: StudioFlowTrailItem[];
  focusMode: boolean;
  copy: StudioUiCopy["flows"];
  onSelectNode: (nodeId: string) => void;
}) {
  if (!activeNode) return null;
  return (
    <div className={`flow-trail-panel${focusMode ? " is-isolated" : ""}`}>
      <StudioFlowTrailColumn
        label={copy.upstream}
        items={incoming}
        emptyLabel={copy.trailEmpty}
        moreLabel={copy.trailMore}
        onSelectNode={onSelectNode}
      />
      <section className="flow-trail-current">
        <h4>{copy.current}</h4>
        <strong>{activeNode.data.title}</strong>
        <small>{activeNode.data.badge ?? formatStudioFlowLabel(activeNode.data.kind)}</small>
      </section>
      <StudioFlowTrailColumn
        label={copy.downstream}
        items={outgoing}
        emptyLabel={copy.trailEmpty}
        moreLabel={copy.trailMore}
        onSelectNode={onSelectNode}
      />
    </div>
  );
}
