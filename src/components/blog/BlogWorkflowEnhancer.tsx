"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface BlogWorkflowEnhancerProps {
  locale: string;
  workflow: boolean;
  diagram: boolean;
}

/**
 * Mount the optional article runtimes (workflow canvas, diagram viewer) only
 * for an article that rendered their explicit markers. Each implementation
 * stays behind its own dynamic boundary, so ordinary articles download neither.
 */
export default function BlogWorkflowEnhancer({
  locale,
  workflow,
  diagram
}: BlogWorkflowEnhancerProps) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-article-content]");
    if (!root) return;

    let active = true;
    const cleanups: Array<() => void> = [];
    const keep = (cleanup: () => void) => {
      if (active) cleanups.push(cleanup);
      else cleanup();
    };

    if (workflow) {
      void import("./blog-workflow-canvas")
        .then(({ mountBlogWorkflowCanvases }) => {
          if (active) keep(mountBlogWorkflowCanvases(root, locale));
        })
        .catch(() => {
          // Optional illustration failure must not affect the article.
        });
    }
    if (diagram) {
      void import("./blog-diagram-viewer")
        .then(({ mountBlogDiagrams }) => {
          if (active) keep(mountBlogDiagrams(root, locale));
        })
        .catch(() => {
          // Without the viewer the inline SVG still reads fine.
        });
    }

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [locale, pathname, workflow, diagram]);

  return null;
}
