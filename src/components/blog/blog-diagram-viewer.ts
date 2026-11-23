import { track } from "@/lib/analytics";
import "./blog-diagram-viewer.css";

/**
 * Full-screen viewer for authored diagram figures (`<figure data-blog-diagram>`).
 * The figure stays a plain, crawlable inline SVG; this module only adds an
 * "expand" control and a dialog with pan, zoom, pinch, node details and,
 * for C4 figures sharing `data-c4-group`, level tabs plus drill-down.
 */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ViewerCopy {
  expand: string;
  close: string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
  levels: string;
  hint: string;
  pick: string;
  drill: string;
  clear: string;
}

const COPY: Record<"en" | "vi", ViewerCopy> = {
  en: {
    expand: "Open large",
    close: "Close",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit",
    levels: "C4 levels",
    hint: "Drag to move, scroll or pinch to zoom, + and - on the keyboard.",
    pick: "Pick a box to read what it does and why it is there.",
    drill: "Look inside",
    clear: "Back to the caption"
  },
  vi: {
    expand: "Xem lớn",
    close: "Đóng",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    fit: "Vừa khung",
    levels: "Các tầng C4",
    hint: "Kéo để di chuyển, cuộn hoặc chụm hai ngón để zoom, phím + và - cũng được.",
    pick: "Bấm vào một khối để xem nó làm gì và vì sao có nó.",
    drill: "Xem bên trong",
    clear: "Quay lại chú thích"
  }
};

const ZOOM_STEP = 1.4;
const TAP_SLOP = 6;
const SVG_NS = "http://www.w3.org/2000/svg";

const reducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function parseViewBox(svg: SVGSVGElement): Box {
  const [x = 0, y = 0, w = 1, h = 1] = (svg.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .map(Number);
  return { x, y, w, h };
}

/** Grow a box to the stage aspect so zooming never stretches the drawing. */
function fitAspect(box: Box, aspect: number): Box {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const w = Math.max(box.w, box.h * aspect);
  const h = w / aspect;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function icon(path: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", path);
  svg.append(p);
  return svg;
}

const ICONS = {
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  fit: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  close: "M6 6l12 12M18 6L6 18"
};

function iconButton(label: string, path: string, className = "bdv-tool"): HTMLButtonElement {
  const button = el("button", className);
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(icon(path));
  return button;
}

/** Clone a figure's SVG for the stage without duplicating the ids that label the original. */
function cloneForStage(source: SVGSVGElement): SVGSVGElement {
  const clone = source.cloneNode(true) as SVGSVGElement;
  const title = source.querySelector("title")?.textContent ?? "";
  clone.removeAttribute("aria-labelledby");
  clone.setAttribute("aria-label", title);
  clone.querySelectorAll("title[id], desc[id]").forEach((node) => node.removeAttribute("id"));
  clone.removeAttribute("class");
  clone.classList.add("dgm-svg", "bdv-svg");
  return clone;
}

class DiagramViewer {
  private readonly copy: ViewerCopy;
  private readonly dialog: HTMLDialogElement;
  private readonly stage: HTMLDivElement;
  private readonly tabs: HTMLDivElement;
  private readonly heading: HTMLHeadingElement;
  private readonly panel: HTMLElement;
  private figures: HTMLElement[] = [];
  private figure: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private base: Box = { x: 0, y: 0, w: 1, h: 1 };
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private frame = 0;
  private returnFocus: HTMLElement | null = null;
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private gesture: { moved: number; startDist: number; startBox: Box; target: Element | null } | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(locale: string, host: HTMLElement) {
    this.copy = COPY[locale === "vi" ? "vi" : "en"];
    this.dialog = el("dialog", "bdv");
    this.dialog.setAttribute("aria-labelledby", "bdv-heading");

    const bar = el("header", "bdv-bar");
    this.heading = el("h2", "bdv-heading");
    this.heading.id = "bdv-heading";
    this.tabs = el("div", "bdv-tabs");
    this.tabs.setAttribute("role", "group");
    this.tabs.setAttribute("aria-label", this.copy.levels);
    const tools = el("div", "bdv-tools");
    const zoomOut = iconButton(this.copy.zoomOut, ICONS.minus);
    const zoomIn = iconButton(this.copy.zoomIn, ICONS.plus);
    const fit = iconButton(this.copy.fit, ICONS.fit);
    const close = iconButton(this.copy.close, ICONS.close, "bdv-tool bdv-close");
    zoomOut.addEventListener("click", () => this.zoomBy(1 / ZOOM_STEP, null, true));
    zoomIn.addEventListener("click", () => this.zoomBy(ZOOM_STEP, null, true));
    fit.addEventListener("click", () => this.animateTo(this.base));
    close.addEventListener("click", () => this.dialog.close());
    tools.append(zoomOut, zoomIn, fit, close);
    bar.append(this.heading, this.tabs, tools);

    this.stage = el("div", "bdv-stage");
    this.stage.tabIndex = 0;
    this.stage.setAttribute("aria-describedby", "bdv-hint");
    this.panel = el("aside", "bdv-panel");
    this.panel.setAttribute("aria-live", "polite");
    const hint = el("p", "bdv-hint", this.copy.hint);
    hint.id = "bdv-hint";

    const body = el("div", "bdv-body");
    body.append(this.stage, this.panel);
    this.dialog.append(bar, body, hint);
    // Inside the article so the dialog inherits the article's accent tokens; showModal puts it in the top layer anyway.
    host.append(this.dialog);

    this.stage.addEventListener("wheel", this.onWheel, { passive: false });
    this.stage.addEventListener("pointerdown", this.onPointerDown);
    this.stage.addEventListener("pointermove", this.onPointerMove);
    this.stage.addEventListener("pointerup", this.onPointerUp);
    this.stage.addEventListener("pointercancel", this.onPointerUp);
    this.stage.addEventListener("dblclick", this.onDoubleClick);
    this.dialog.addEventListener("keydown", this.onKeyDown);
    this.dialog.addEventListener("close", this.onClose);
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.dialog.open || !this.svg) return;
      const keep = this.box.w >= this.base.w * 0.999;
      this.base = this.fittedBase();
      this.setBox(keep ? this.base : fitAspect(this.box, this.aspect()));
    });
    this.resizeObserver.observe(this.stage);
  }

  destroy(): void {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    if (this.dialog.open) this.dialog.close();
    this.dialog.remove();
  }

  open(figure: HTMLElement, figures: HTMLElement[], source: string, nodeId: string | null): void {
    this.figures = figures;
    this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!this.dialog.open) this.dialog.showModal();
    this.show(figure);
    if (nodeId) this.select(nodeId, "open");
    track("blog_diagram_open", { diagram: figure.dataset["blogDiagram"] ?? "", source });
  }

  private show(figure: HTMLElement): void {
    const source = figure.querySelector<SVGSVGElement>("svg");
    if (!source) return;
    this.figure = figure;
    this.svg = cloneForStage(source);
    this.stage.replaceChildren(this.svg);
    this.heading.textContent = source.querySelector("title")?.textContent ?? "";
    this.renderTabs();
    this.base = this.fittedBase();
    this.setBox(this.base);
    this.renderPanel(null);
    this.stage.focus({ preventScroll: true });
  }

  private group(): HTMLElement[] {
    const group = this.figure?.dataset["c4Group"];
    return group ? this.figures.filter((f) => f.dataset["c4Group"] === group) : [];
  }

  private renderTabs(): void {
    const group = this.group();
    this.tabs.hidden = group.length < 2;
    this.tabs.replaceChildren(
      ...group.map((figure) => {
        const button = el("button", "bdv-tab", figure.dataset["c4Level"] ?? "");
        button.type = "button";
        button.setAttribute("aria-pressed", String(figure === this.figure));
        button.addEventListener("click", () => this.switchTo(figure, "tab"));
        return button;
      })
    );
  }

  private switchTo(figure: HTMLElement, source: "tab" | "drill"): void {
    if (figure === this.figure) return;
    track("blog_diagram_switch", {
      diagram: figure.dataset["blogDiagram"] ?? "",
      from: this.figure?.dataset["blogDiagram"] ?? "",
      source
    });
    this.show(figure);
  }

  private aspect(): number {
    const rect = this.stage.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 9;
  }

  private fittedBase(): Box {
    if (!this.figure) return this.base;
    const source = this.figure.querySelector<SVGSVGElement>("svg");
    if (!source) return this.base;
    const vb = parseViewBox(source);
    const pad = vb.w * 0.02;
    return fitAspect({ x: vb.x - pad, y: vb.y - pad, w: vb.w + pad * 2, h: vb.h + pad * 2 }, this.aspect());
  }

  private setBox(box: Box): void {
    this.box = box;
    this.svg?.setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);
  }

  private clampBox(box: Box): Box {
    const minW = this.base.w / 10;
    const maxW = this.base.w * 1.6;
    const w = Math.min(maxW, Math.max(minW, box.w));
    const scale = w / box.w;
    const h = box.h * scale;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    // Keep some of the drawing on screen however far someone drags.
    const limitX = this.base.w / 2 + w / 2 - this.base.w * 0.1;
    const limitY = this.base.h / 2 + h / 2 - this.base.h * 0.1;
    const bx = this.base.x + this.base.w / 2;
    const by = this.base.y + this.base.h / 2;
    const ncx = Math.min(bx + limitX, Math.max(bx - limitX, cx));
    const ncy = Math.min(by + limitY, Math.max(by - limitY, cy));
    return { x: ncx - w / 2, y: ncy - h / 2, w, h };
  }

  private animateTo(target: Box): void {
    cancelAnimationFrame(this.frame);
    const goal = this.clampBox(target);
    if (reducedMotion()) {
      this.setBox(goal);
      return;
    }
    const from = this.box;
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / 320);
      const e = 1 - Math.pow(2, -10 * t);
      this.setBox({
        x: from.x + (goal.x - from.x) * e,
        y: from.y + (goal.y - from.y) * e,
        w: from.w + (goal.w - from.w) * e,
        h: from.h + (goal.h - from.h) * e
      });
      if (t < 1) this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  /** Client point to drawing coordinates for the current box. */
  private toDrawing(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.stage.getBoundingClientRect();
    return {
      x: this.box.x + ((clientX - rect.left) / rect.width) * this.box.w,
      y: this.box.y + ((clientY - rect.top) / rect.height) * this.box.h
    };
  }

  private zoomBy(factor: number, at: { x: number; y: number } | null, animate: boolean): void {
    const focus = at ?? { x: this.box.x + this.box.w / 2, y: this.box.y + this.box.h / 2 };
    const w = this.box.w / factor;
    const h = this.box.h / factor;
    const next = {
      x: focus.x - (focus.x - this.box.x) / factor,
      y: focus.y - (focus.y - this.box.y) / factor,
      w,
      h
    };
    if (animate) this.animateTo(next);
    else this.setBox(this.clampBox(next));
  }

  private panBy(dxPx: number, dyPx: number, from: Box): void {
    const rect = this.stage.getBoundingClientRect();
    this.setBox(
      this.clampBox({
        ...from,
        x: from.x - (dxPx / rect.width) * from.w,
        y: from.y - (dyPx / rect.height) * from.h
      })
    );
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    this.zoomBy(Math.exp(-delta * 0.0018), this.toDrawing(event.clientX, event.clientY), false);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    cancelAnimationFrame(this.frame);
    this.stage.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...this.pointers.values()];
    const [a, b] = points;
    this.gesture = {
      moved: this.gesture?.moved ?? 0,
      startDist: a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      startBox: this.box,
      target: points.length === 1 ? (event.target as Element) : null
    };
    this.stage.dataset["dragging"] = "true";
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const previous = this.pointers.get(event.pointerId);
    if (!previous || !this.gesture) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...this.pointers.values()];
    const [a, b] = points;
    if (a && b && this.gesture.startDist > 0) {
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = this.toDrawing((a.x + b.x) / 2, (a.y + b.y) / 2);
      this.zoomBy(dist / this.gesture.startDist, mid, false);
      this.gesture = { ...this.gesture, startDist: dist, startBox: this.box, moved: TAP_SLOP + 1 };
      return;
    }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    this.gesture.moved += Math.abs(dx) + Math.abs(dy);
    this.panBy(dx, dy, this.box);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (!this.pointers.delete(event.pointerId)) return;
    if (this.pointers.size > 0) return;
    const gesture = this.gesture;
    this.gesture = null;
    delete this.stage.dataset["dragging"];
    if (!gesture || gesture.moved > TAP_SLOP || !gesture.target) return;
    const node = gesture.target.closest<SVGGElement>("[data-c4-node]");
    if (node) this.select(node.dataset["c4Node"] ?? "", "tap");
    else this.renderPanel(null);
  };

  private readonly onDoubleClick = (event: MouseEvent): void => {
    if ((event.target as Element).closest("[data-c4-node]")) return;
    this.zoomBy(2, this.toDrawing(event.clientX, event.clientY), true);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.target instanceof HTMLButtonElement && (event.key === "Enter" || event.key === " ")) return;
    const panStep = 0.12;
    const actions: Record<string, () => void> = {
      "+": () => this.zoomBy(ZOOM_STEP, null, true),
      "=": () => this.zoomBy(ZOOM_STEP, null, true),
      "-": () => this.zoomBy(1 / ZOOM_STEP, null, true),
      "0": () => this.animateTo(this.base),
      ArrowLeft: () => this.animateTo({ ...this.box, x: this.box.x - this.box.w * panStep }),
      ArrowRight: () => this.animateTo({ ...this.box, x: this.box.x + this.box.w * panStep }),
      ArrowUp: () => this.animateTo({ ...this.box, y: this.box.y - this.box.h * panStep }),
      ArrowDown: () => this.animateTo({ ...this.box, y: this.box.y + this.box.h * panStep })
    };
    const action = actions[event.key];
    if (!action || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    action();
  };

  private readonly onClose = (): void => {
    cancelAnimationFrame(this.frame);
    this.pointers.clear();
    this.gesture = null;
    this.returnFocus?.focus({ preventScroll: true });
  };

  private select(nodeId: string, source: string): void {
    const node = this.svg?.querySelector<SVGGElement>(`[data-c4-node="${CSS.escape(nodeId)}"]`);
    if (!node) return;
    this.renderPanel(node);
    track("blog_diagram_select", {
      diagram: this.figure?.dataset["blogDiagram"] ?? "",
      node: nodeId,
      source
    });
  }

  private renderPanel(node: SVGGElement | null): void {
    this.svg?.querySelectorAll("[data-active]").forEach((n) => n.removeAttribute("data-active"));
    if (this.svg) this.svg.toggleAttribute("data-has-active", node !== null);
    if (!node) {
      const caption = this.figure?.querySelector("figcaption")?.textContent ?? "";
      this.panel.replaceChildren(el("p", "bdv-caption", caption), el("p", "bdv-pick", this.copy.pick));
      return;
    }
    node.setAttribute("data-active", "true");
    const data = node.dataset;
    const children: HTMLElement[] = [
      el("p", "bdv-tag", data["c4Tag"] ?? ""),
      el("h3", "bdv-name", data["c4Name"] ?? ""),
      el("p", "bdv-detail", data["c4Detail"] ?? "")
    ];
    const target = this.figures.find((f) => f.dataset["blogDiagram"] === data["c4Drill"]);
    if (target) {
      const drill = el("button", "bdv-drill", `${this.copy.drill}: ${target.dataset["c4Level"] ?? ""}`);
      drill.type = "button";
      drill.addEventListener("click", () => this.switchTo(target, "drill"));
      children.push(drill);
    }
    const clear = el("button", "bdv-clear", this.copy.clear);
    clear.type = "button";
    clear.addEventListener("click", () => this.renderPanel(null));
    children.push(clear);
    this.panel.replaceChildren(...children);
  }
}

/** Add expand controls to every diagram figure under `root`; returns a cleanup. */
export function mountBlogDiagrams(root: HTMLElement, locale: string): () => void {
  const figures = Array.from(root.querySelectorAll<HTMLElement>("figure[data-blog-diagram]"));
  if (figures.length === 0) return () => undefined;
  const copy = COPY[locale === "vi" ? "vi" : "en"];
  let viewer: DiagramViewer | null = null;
  const host = root.closest<HTMLElement>(".blog-article, .content-hub") ?? document.body;
  const getViewer = (): DiagramViewer => (viewer ??= new DiagramViewer(locale, host));
  const cleanups: Array<() => void> = [];

  for (const figure of figures) {
    const svg = figure.querySelector<SVGSVGElement>("svg");
    if (!svg) continue;
    const button = iconButton(copy.expand, ICONS.expand, "bdv-expand");
    button.append(document.createTextNode(copy.expand));
    const onButton = (): void => getViewer().open(figure, figures, "button", null);
    const onSvg = (event: MouseEvent): void => {
      const node = (event.target as Element).closest<SVGGElement>("[data-c4-node]");
      getViewer().open(figure, figures, node ? "node" : "figure", node?.dataset["c4Node"] ?? null);
    };
    button.addEventListener("click", onButton);
    svg.addEventListener("click", onSvg);
    figure.dataset["diagramReady"] = "true";
    svg.after(button);
    cleanups.push(() => {
      button.remove();
      svg.removeEventListener("click", onSvg);
      delete figure.dataset["diagramReady"];
    });
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    viewer?.destroy();
  };
}
