"use client";

import { useEffect } from "react";

interface BlogWorkflowEnhancerProps {
  locale: string;
}

/**
 * Mount the optional canvas runtime only for an article that rendered its
 * explicit workflow marker. The drawing implementation stays behind a second
 * dynamic boundary, so ordinary articles never download it.
 */
export default function BlogWorkflowEnhancer({
  locale
}: BlogWorkflowEnhancerProps) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-article-content]");
    if (!root) return;

    let active = true;
    let cleanup: (() => void) | undefined;

    void import("./blog-workflow-canvas")
      .then(({ mountBlogWorkflowCanvases }) => {
        if (!active) return;
        cleanup = mountBlogWorkflowCanvases(root, locale);
      })
      .catch(() => {
        // Optional illustration failure must not affect the article.
      });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [locale]);

  return null;
}
