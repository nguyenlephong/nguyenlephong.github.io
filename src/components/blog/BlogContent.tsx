"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

interface BlogContentProps {
  html: string;
}

type BlogWorkflowKind = "trekking";

interface BlogWorkflowCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: Array<{
    label: string;
    detail: string;
  }>;
}

const BLOG_WORKFLOW_COPY: Record<
  BlogWorkflowKind,
  Record<"en" | "vi", BlogWorkflowCopy>
> = {
  trekking: {
    en: {
      eyebrow: "Trail workflow",
      title: "Small pace, real summit",
      subtitle:
        "A hike behaves like a career: prepare, keep rhythm, pause well, then carry the lesson back.",
      steps: [
        { label: "Prepare", detail: "light bag" },
        { label: "Keep pace", detail: "steady step" },
        { label: "Pause well", detail: "recover" },
        { label: "Reach marker", detail: "notice progress" },
        { label: "Carry back", detail: "use the lesson" }
      ]
    },
    vi: {
      eyebrow: "Workflow trên đường trek",
      title: "Bước nhỏ, đỉnh thật",
      subtitle:
        "Một cung đường cũng giống hành trình nghề nghiệp: chuẩn bị, giữ nhịp, nghỉ đúng lúc, rồi mang bài học về lại công việc.",
      steps: [
        { label: "Chuẩn bị", detail: "đồ vừa đủ" },
        { label: "Bước đều", detail: "giữ nhịp" },
        { label: "Nghỉ đúng lúc", detail: "hồi sức" },
        { label: "Chạm mốc", detail: "nhìn lại" },
        { label: "Mang về", detail: "ứng dụng" }
      ]
    }
  }
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawBlogWorkflowCanvas(canvas: HTMLCanvasElement, locale: string) {
  const kind = canvas.dataset.blogWorkflow as BlogWorkflowKind | undefined;
  if (!kind || !(kind in BLOG_WORKFLOW_COPY)) return;

  const copy = BLOG_WORKFLOW_COPY[kind][locale === "vi" ? "vi" : "en"];
  const rootStyle = getComputedStyle(document.documentElement);
  const canvasStyle = getComputedStyle(canvas);
  const accent =
    canvasStyle.getPropertyValue("--blog-accent").trim() || "#0ea5a4";
  const bg = rootStyle.getPropertyValue("--bg").trim() || "#0b0f14";
  const bgMuted = rootStyle.getPropertyValue("--bg-muted").trim() || "#121820";
  const border = rootStyle.getPropertyValue("--border").trim() || "#2a3441";
  const fg = rootStyle.getPropertyValue("--fg").trim() || "#f8fafc";
  const fgMuted = rootStyle.getPropertyValue("--fg-muted").trim() || "#a7b0bd";
  const fgSubtle =
    rootStyle.getPropertyValue("--fg-subtle").trim() || "#7b8491";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(canvas.clientWidth, 320);
  const height = Math.max(canvas.clientHeight || Math.round(width * 0.46), 260);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const pad = Math.max(24, Math.min(48, width * 0.055));
  const mountainBase = height - pad * 1.25;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(0, mountainBase);
  ctx.lineTo(width * 0.18, height * 0.52);
  ctx.lineTo(width * 0.34, mountainBase);
  ctx.lineTo(width * 0.52, height * 0.44);
  ctx.lineTo(width * 0.76, mountainBase);
  ctx.lineTo(width, height * 0.5);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = pad * 1.1 + i * ((height - pad * 2.2) / 4);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = fgSubtle;
  ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(copy.eyebrow.toUpperCase(), pad, pad + 2);

  ctx.fillStyle = fg;
  ctx.font = `700 ${Math.max(18, Math.min(25, width / 31))}px system-ui, sans-serif`;
  ctx.fillText(copy.title, pad, pad + 35);

  ctx.fillStyle = fgMuted;
  ctx.font = `400 ${Math.max(12, Math.min(14, width / 54))}px system-ui, sans-serif`;
  const subtitle = copy.subtitle;
  const subtitleMaxWidth = Math.min(width - pad * 2, 720);
  const words = subtitle.split(" ");
  let line = "";
  let lineY = pad + 58;
  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > subtitleMaxWidth && line) {
      ctx.fillText(line, pad, lineY);
      line = word;
      lineY += 18;
    } else {
      line = testLine;
    }
    if (index === words.length - 1 && line) {
      ctx.fillText(line, pad, lineY);
    }
  });

  const trailTop = Math.max(pad + 96, height * 0.44);
  const trailAmplitude = Math.min(52, height * 0.15);
  const points = copy.steps.map((step, index) => {
    const t = index / (copy.steps.length - 1);
    return {
      ...step,
      x: pad + t * (width - pad * 2),
      y: trailTop + Math.sin(t * Math.PI * 1.65 - 0.35) * trailAmplitude
    };
  });

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 14;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    const prev = points[index - 1];
    const midX = (prev.x + point.x) / 2;
    const midY = (prev.y + point.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  });
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    const prev = points[index - 1];
    const midX = (prev.x + point.x) / 2;
    const midY = (prev.y + point.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  });
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();

  points.forEach((point, index) => {
    const cardWidth = Math.min(132, Math.max(96, width / 7.2));
    const cardHeight = 56;
    const cardX = Math.min(
      Math.max(point.x - cardWidth / 2, pad * 0.55),
      width - cardWidth - pad * 0.55
    );
    const cardY = point.y + (index % 2 === 0 ? 28 : -86);

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = bgMuted;
    roundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 12);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.font = `700 ${Math.max(11, Math.min(13, width / 68))}px system-ui, sans-serif`;
    ctx.fillText(point.label, cardX + 12, cardY + 23);
    ctx.fillStyle = fgSubtle;
    ctx.font = `500 ${Math.max(10, Math.min(12, width / 78))}px system-ui, sans-serif`;
    ctx.fillText(point.detail, cardX + 12, cardY + 42);
  });
}

/**
 * Renders authored, in-repo HTML for a blog post. Internal links are written
 * locale-agnostic (e.g. `/blog/architecture/...`) in the source and patched
 * here to include the active locale prefix so navigation stays within-locale.
 */
export default function BlogContent({ html }: BlogContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const anchors = root.querySelectorAll<HTMLAnchorElement>(
      'a[href^="/blog/"], a[href^="/thoughts/"], a[href^="/notes/"]'
    );
    anchors.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith(`/${locale}/`)) return;
      a.setAttribute("href", `/${locale}${href}`);
    });

    const canvases = Array.from(
      root.querySelectorAll<HTMLCanvasElement>("canvas[data-blog-workflow]")
    );
    const renderCanvases = () => {
      canvases.forEach((canvas) => drawBlogWorkflowCanvas(canvas, locale));
    };
    renderCanvases();
    window.addEventListener("resize", renderCanvases);
    return () => {
      window.removeEventListener("resize", renderCanvases);
    };
  }, [html, locale]);

  return (
    <div
      ref={ref}
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
