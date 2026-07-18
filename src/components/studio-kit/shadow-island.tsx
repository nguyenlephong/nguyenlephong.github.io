"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ShadowIslandProps = {
  children: ReactNode;
  fallback?: ReactNode;
  heading: ReactNode;
  styles: string;
  label?: string;
};

export function ShadowIsland({ children, fallback = null, heading, styles, label }: ShadowIslandProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadowRoot =
      host.shadowRoot ?? host.attachShadow({ mode: "open", delegatesFocus: true });
    setRoot(shadowRoot);
  }, []);

  return (
    <div
      ref={hostRef}
      aria-label={label}
      data-studio-shadow-host=""
      data-shadow-ready={root ? "true" : "false"}
      style={{ display: "block", minHeight: "100vh" }}
    >
      {heading}
      {root
        ? createPortal(
            <>
              <style>{styles}</style>
              {children}
            </>,
            root
          )
        : fallback}
    </div>
  );
}
