"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

// The career rail, drawn like a git graph in one SVG beside the role list.
// Lane 0 is the career line (Zalo PC from 2024); lane 1 is the NDSVN detour that
// forks off the senior role and merges back into the Lead role. Node positions are
// measured from the rows (`[data-node]` on each date line), so the drawing follows
// the text at every width and when a <details> opens.
export type NodeKind = "merge" | "branch" | "fork" | "commit" | "leaf";

type GraphNode = { kind: NodeKind; y: number };
type Geometry = {
  w: number;
  h: number;
  x0: number;
  x1: number;
  nodes: GraphNode[];
};

type Props = {
  listRef: RefObject<HTMLElement | null>;
  forkNote: string;
  mergeNote: string;
};

const BEND = 44;
const INSET = 7;

function measure(list: HTMLElement): Geometry | null {
  const row = list.querySelector<HTMLElement>(".xp-row");
  if (!row) return null;
  const listTop = list.getBoundingClientRect().top;
  // Computed grid tracks are resolved to px; the first one is the rail column.
  const w = parseFloat(getComputedStyle(row).gridTemplateColumns);
  const nodes = Array.from(
    list.querySelectorAll<HTMLElement>("[data-node]")
  ).map((el) => {
    const cs = getComputedStyle(el);
    const top = el.getBoundingClientRect().top - listTop;
    return {
      kind: el.dataset["node"] as NodeKind,
      y: Math.round(
        top + parseFloat(cs.paddingTop) + parseFloat(cs.lineHeight) / 2
      )
    };
  });
  if (!w || nodes.length === 0) return null;
  return {
    w,
    h: Math.ceil(list.offsetHeight),
    x0: INSET,
    x1: w - INSET,
    nodes
  };
}

export default function CareerGraph({ listRef, forkNote, mergeNote }: Props) {
  const [g, setG] = useState<Geometry | null>(null);
  const pulse = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(list);
        setG((prev) =>
          JSON.stringify(prev) === JSON.stringify(next) ? prev : next
        );
      });
    };
    // Height changes cover resize, font swap and <details> toggles.
    const ro = new ResizeObserver(update);
    ro.observe(list);
    document.fonts?.ready.then(update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [listRef]);

  // One pulse on the merge-back node the first time it is in view.
  const hasGeometry = g !== null;
  useEffect(() => {
    const ring = pulse.current;
    if (!ring) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        ring.dataset["seen"] = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -40% 0px" }
    );
    io.observe(ring);
    return () => io.disconnect();
  }, [hasGeometry]);

  if (!g) return null;
  const { w, h, x0, x1, nodes } = g;
  const merge = nodes.find((n) => n.kind === "merge");
  const fork = nodes.find((n) => n.kind === "fork");
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const mid = (x0 + x1) / 2;
  const half = BEND / 2;
  const branch =
    merge && fork
      ? `M${x0} ${fork.y} C${x0} ${fork.y - half} ${x1} ${fork.y - half} ${x1} ${fork.y - BEND}` +
        ` V${merge.y + BEND} C${x1} ${merge.y + half} ${x0} ${merge.y + half} ${x0} ${merge.y}`
      : null;

  return (
    <svg
      className="xp-graph"
      width={w}
      height={h}
      aria-hidden="true"
      focusable="false"
    >
      {first && last && (
        <path className="xp-graph-main" d={`M${x0} ${first.y} V${last.y}`} />
      )}
      {branch && <path className="xp-graph-branch" d={branch} />}
      {merge && fork && (
        <>
          <text
            className="xp-graph-note"
            transform={`translate(${mid + 4} ${merge.y + BEND + 8}) rotate(-90)`}
            textAnchor="end"
          >
            {mergeNote}
          </text>
          <text
            className="xp-graph-note"
            transform={`translate(${mid + 4} ${fork.y - BEND - 8}) rotate(-90)`}
            textAnchor="start"
          >
            {forkNote}
          </text>
        </>
      )}
      {nodes.map((n, i) => (
        <circle
          key={i}
          className={`xp-graph-node is-${n.kind}`}
          cx={n.kind === "branch" ? x1 : x0}
          cy={n.y}
          r={n.kind === "merge" ? 6.5 : n.kind === "leaf" ? 3.5 : 5}
        />
      ))}
      {merge && (
        <circle
          ref={pulse}
          className="xp-graph-pulse"
          cx={x0}
          cy={merge.y}
          r={6.5}
        />
      )}
    </svg>
  );
}
