"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuMaximize, LuMinus, LuPlus } from "react-icons/lu";
import { track } from "@/lib/analytics";
import type { StudioMapBox, StudioSystemMap } from "./studio-module-sources";

type Labels = {
  line: string;
  map: string;
  wholeMap: string;
  zoomIn: string;
  zoomOut: string;
  hint: string;
  stages: Record<string, string>;
};

type Selection = { viewId: string | null; nodeId: string | null };

const ZOOM_STEP = 1.4;
const DURATION = 460;

function zoomBox(box: StudioMapBox, factor: number, limit: StudioMapBox): StudioMapBox {
  const width = Math.min(limit.width, Math.max(limit.width / 8, box.width / factor));
  const height = (box.height * width) / box.width;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/** Fit a box into the map's aspect so zooming never stretches the drawing. */
function fitAspect(box: StudioMapBox, aspect: number): StudioMapBox {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const width = Math.max(box.width, box.height * aspect);
  const height = width / aspect;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

export default function StudioSystemMapViewer({ map, labels }: Readonly<{ map: StudioSystemMap; labels: Labels }>) {
  const aspect = map.bounds.width / map.bounds.height;
  const [box, setBox] = useState<StudioMapBox>(map.bounds);
  const [selection, setSelection] = useState<Selection>({ viewId: null, nodeId: null });
  const boxRef = useRef(box);
  const frame = useRef(0);
  const figure = useRef<HTMLElement>(null);

  const animateTo = useCallback((target: StudioMapBox) => {
    cancelAnimationFrame(frame.current);
    const from = boxRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      boxRef.current = target;
      setBox(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const e = 1 - Math.pow(2, -10 * t);
      const next = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        width: from.width + (target.width - from.width) * e,
        height: from.height + (target.height - from.height) * e
      };
      boxRef.current = next;
      setBox(next);
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  const viewForZone = useCallback(
    (zoneId: string) => map.views.find((view) => view.zoneIds.includes(zoneId)) ?? null,
    [map.views]
  );

  const select = useCallback(
    (viewId: string | null, nodeId: string | null, source: string) => {
      setSelection({ viewId, nodeId });
      const view = map.views.find((candidate) => candidate.id === viewId);
      animateTo(view ? fitAspect(view.bounds, aspect) : map.bounds);
      track("studio_part_select", { module: "system-maps", part: nodeId ?? viewId ?? "whole-map", source });
    },
    [animateTo, aspect, map.bounds, map.views]
  );

  // Rows in the reading column below can point at the map.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-studio-map-node]") : null;
      if (!target) return;
      const node = map.nodes.find((candidate) => candidate.id === target.dataset["studioMapNode"]);
      if (!node) return;
      select(viewForZone(node.zoneId)?.id ?? null, node.id, "list");
      figure.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame.current);
    };
  }, [map.nodes, select, viewForZone]);

  const activeView = map.views.find((view) => view.id === selection.viewId) ?? null;
  const activeNode = map.nodes.find((node) => node.id === selection.nodeId) ?? null;
  const inView = (id: string) => !activeView || activeView.nodeIds.includes(id) || activeView.zoneIds.includes(id);

  return (
    <div className="studio-map">
      <nav className="studio-line" aria-label={labels.line}>
        <ol style={{ ["--studio-stops" as string]: map.views.length }}>
          {map.views.map((view) => (
            <li key={view.id}>
              <button
                type="button"
                className="studio-stop"
                aria-pressed={selection.viewId === view.id}
                onClick={() => select(selection.viewId === view.id ? null : view.id, null, "line")}
              >
                <span className="studio-stop__dot" aria-hidden="true" />
                <span className="studio-stop__stage">{labels.stages[view.id] ?? ""}</span>
                <span className="studio-stop__title">{view.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <figure className="studio-map__figure" ref={figure}>
        <div className="studio-map__tools">
          <button type="button" onClick={() => select(null, null, "whole")} disabled={!selection.viewId && box.width >= map.bounds.width}>
            <LuMaximize aria-hidden="true" />
            <span>{labels.wholeMap}</span>
          </button>
          <button type="button" aria-label={labels.zoomOut} onClick={() => animateTo(zoomBox(boxRef.current, 1 / ZOOM_STEP, map.bounds))}>
            <LuMinus aria-hidden="true" />
          </button>
          <button type="button" aria-label={labels.zoomIn} onClick={() => animateTo(zoomBox(boxRef.current, ZOOM_STEP, map.bounds))}>
            <LuPlus aria-hidden="true" />
          </button>
        </div>
        <svg
          className="studio-map__svg"
          viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
          role="img"
          aria-label={labels.map}
          data-zoomed={box.width < map.bounds.width * 0.75 ? "true" : undefined}
        >
          <defs>
            <marker id="studio-map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 1 L9 5 L0 9" className="studio-map__arrow" />
            </marker>
          </defs>
          {map.zones.map((zone) => (
            <g
              key={zone.id}
              className="studio-map__zone"
              data-dim={inView(zone.id) ? undefined : "true"}
              onClick={() => select(viewForZone(zone.id)?.id ?? null, null, "map")}
            >
              <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx={18} />
              <text x={zone.x + 4} y={zone.y - 18}>{zone.title}</text>
            </g>
          ))}
          {map.edges.map((edge) => (
            <line
              key={edge.id}
              className="studio-map__edge"
              x1={edge.points[0]}
              y1={edge.points[1]}
              x2={edge.points[2]}
              y2={edge.points[3]}
              markerEnd="url(#studio-map-arrow)"
            />
          ))}
          {map.nodes.map((node) => (
            <foreignObject
              key={node.id}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              className="studio-map__node"
              data-dim={inView(node.id) ? undefined : "true"}
              data-active={selection.nodeId === node.id ? "true" : undefined}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => select(viewForZone(node.zoneId)?.id ?? null, node.id, "map")}
              >
                <span className="studio-map__badge">{node.badge}</span>
                <span className="studio-map__title">{node.title}</span>
              </button>
            </foreignObject>
          ))}
        </svg>
        <figcaption className="studio-map__caption" aria-live="polite">
          {activeNode ? (
            <>
              <strong>{activeNode.title}</strong> {activeNode.detail}
            </>
          ) : activeView ? (
            <>
              <strong>{activeView.title}</strong> {activeView.description}
            </>
          ) : (
            labels.hint
          )}
        </figcaption>
      </figure>
    </div>
  );
}
