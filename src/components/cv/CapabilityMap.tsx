"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject
} from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { track } from "@/lib/analytics";
import CapabilityMapDiagram, {
  MAP_VIEWBOX,
  capabilityKeys,
  zoneBounds,
  type CapabilityKey
} from "./CapabilityMapDiagram";
import { LuArrowDown } from "react-icons/lu";
import { caseFileId, openCaseFile, type CaseFileKey } from "./CaseFile";

// Zones with a case file in Projects: the panel links down to it.
const CASE_FILE_BY_ZONE: Partial<Record<CapabilityKey, CaseFileKey>> = {
  multiTenant: "logiup",
  zeroToPilot: "bonbon"
};

const CYCLE_MS = 7000;
const COMPACT_BELOW = 720; // stage width (px) under which the camera follows one zone
const CAMERA_MS = 520;

type Box = { x: number; y: number; w: number; h: number };
type SelectSource = "tab" | "map" | "keyboard";

function cameraFor(key: CapabilityKey, compact: boolean): Box {
  if (!compact) return MAP_VIEWBOX;
  const b = zoneBounds[key];
  return { x: b.x - 12, y: b.y - 12, w: b.w + 24, h: b.h + 24 };
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Tween the SVG viewBox so switching zones on a phone reads as one camera move.
 * Writes the attribute directly: re-rendering ~150 SVG nodes per frame is wasted work.
 */
function useCamera(
  svgRef: RefObject<SVGSVGElement | null>,
  target: Box,
  instant: boolean
) {
  const boxRef = useRef(target);
  const movedOnce = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    const from = boxRef.current;
    if (!svg) return;
    const same =
      from.x === target.x && from.y === target.y && from.w === target.w && from.h === target.h;
    if (same) return;
    // The first move is the phone layout settling after measurement: jump, do not zoom.
    const duration = instant || !movedOnce.current ? 0 : CAMERA_MS;
    movedOnce.current = true;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const k = duration ? easeOutExpo(Math.min(1, (now - start) / duration)) : 1;
      const next = {
        x: from.x + (target.x - from.x) * k,
        y: from.y + (target.y - from.y) * k,
        w: from.w + (target.w - from.w) * k,
        h: from.h + (target.h - from.h) * k
      };
      boxRef.current = next;
      svg.setAttribute("viewBox", `${next.x} ${next.y} ${next.w} ${next.h}`);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [svgRef, target.x, target.y, target.w, target.h, instant]);
}

export default function CapabilityMap() {
  const t = useTranslations("Summary.pillars");
  const caseLabels = useTranslations("Projects.labels");
  const summary = useTranslations("Summary");
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState<CapabilityKey>(capabilityKeys[0]);
  const [autoplay, setAutoplay] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;
    // Measure .cm itself: it is the @container the CSS layout switch uses.
    const ro = new ResizeObserver(([entry]) =>
      setCompact(entry.contentRect.width < COMPACT_BELOW)
    );
    // Autoplay needs the map mostly in view; motion only needs any part of it on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        setInView(entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35] }
    );
    ro.observe(root);
    io.observe(stage);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Off screen, freeze SMIL packets here and CSS loops via data-inview.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (visible) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [visible]);

  const cycling = autoplay && !paused && inView && !reduced;
  useEffect(() => {
    if (!cycling) return;
    const id = window.setTimeout(() => {
      const next =
        capabilityKeys[
          (capabilityKeys.indexOf(active) + 1) % capabilityKeys.length
        ];
      setActive(next);
    }, CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [cycling, active]);

  // Compact strip: keep the active tab visible without scrolling the page itself.
  useEffect(() => {
    if (!compact) return;
    const tab = tabRefs.current[capabilityKeys.indexOf(active)];
    const strip = tab?.parentElement;
    if (tab && strip)
      strip.scrollTo({
        left: tab.offsetLeft - strip.offsetLeft - 16,
        behavior: "smooth"
      });
  }, [active, compact]);

  const select = useCallback((key: CapabilityKey, source: SelectSource) => {
    setAutoplay(false);
    setActive(key);
    track("cv_capability_select", { capability: key, source });
  }, []);

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ];
    const jump = { Home: 0, End: capabilityKeys.length - 1 }[event.key];
    if (delta === undefined && jump === undefined) return;
    event.preventDefault();
    const next =
      jump ??
      (index + (delta ?? 0) + capabilityKeys.length) % capabilityKeys.length;
    select(capabilityKeys[next], "keyboard");
    tabRefs.current[next]?.focus();
  };

  useCamera(svgRef, cameraFor(active, compact), reduced);
  const figures = Object.fromEntries(
    capabilityKeys.map((k) => [k, t(`${k}.figure`)])
  ) as Record<CapabilityKey, string>;
  const caseFile = CASE_FILE_BY_ZONE[active];

  return (
    <div
      ref={rootRef}
      className="cm"
      data-inview={visible ? "true" : "false"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="cm-grid">
        <div ref={stageRef} className="cm-stage">
          <svg
            ref={svgRef}
            className="cm-svg"
            viewBox={`${MAP_VIEWBOX.x} ${MAP_VIEWBOX.y} ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          >
            <CapabilityMapDiagram
              active={active}
              onSelect={(key) => select(key, "map")}
              figures={figures}
              // Packets always render so SSR and client markup match; CSS hides them for reduced motion.
              animate
            />
          </svg>
        </div>

        <div
          className="cm-tabs"
          role="tablist"
          aria-label={summary("mapTabsLabel")}
          aria-orientation={compact ? "horizontal" : "vertical"}
        >
          {capabilityKeys.map((key, i) => {
            const selected = key === active;
            return (
              <button
                key={key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`cm-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="cm-panel"
                tabIndex={selected ? 0 : -1}
                className={selected && cycling ? "cm-tab is-cycling" : "cm-tab"}
                onClick={() => select(key, "tab")}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                <span className="cm-tab-label">{t(`${key}.tab`)}</span>
                <span className="cm-tab-meta">{t(`${key}.meta`)}</span>
              </button>
            );
          })}
        </div>

        <div
          id="cm-panel"
          className="cm-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`cm-tab-${active}`}
        >
          <div key={active} className="cm-panel-inner">
            <h3 className="cm-title">{t(`${active}.title`)}</h3>
            <p className="cm-body">{t(`${active}.body`)}</p>
            <p className="cm-proof">
              <strong>{t(`${active}.figure`)}</strong>{" "}
              {t(`${active}.figureLabel`)}
            </p>
            {caseFile && (
              <a
                className="cm-case-link"
                href={`#${caseFileId(caseFile)}`}
                onClick={() => openCaseFile(caseFile, "map")}
              >
                {caseLabels("caseFile")}
                <LuArrowDown size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
