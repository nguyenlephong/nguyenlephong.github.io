"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ShadowIslandProps = {
  children: ReactNode;
  fallback?: ReactNode;
  heading: ReactNode;
  stylesheetHref: string;
  label?: string;
};

type StylesheetStatus = "loading" | "ready" | "failed";
type StylesheetLoad = Exclude<StylesheetStatus, "loading">;

export function ShadowIsland({ children, fallback = null, heading, stylesheetHref, label }: ShadowIslandProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const [stylesheetLoad, setStylesheetLoad] = useState<{
    href: string;
    status: StylesheetLoad;
  } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadowRoot =
      host.shadowRoot ?? host.attachShadow({ mode: "open", delegatesFocus: true });
    setRoot(shadowRoot);
  }, []);

  const stylesheetStatus: StylesheetStatus = stylesheetLoad?.href === stylesheetHref
    ? stylesheetLoad.status
    : "loading";
  const stylesheetReady = stylesheetStatus === "ready";

  return (
    <div
      ref={hostRef}
      aria-label={label}
      data-studio-shadow-host=""
      data-shadow-ready={root && stylesheetReady ? "true" : "false"}
      data-shadow-stylesheet={stylesheetStatus}
      style={{ display: "block", minHeight: "100vh" }}
    >
      {heading}
      {root ? <div slot="studio-loading-fallback">{fallback}</div> : fallback}
      {root
        ? createPortal(
            <>
              <link
                rel="stylesheet"
                href={stylesheetHref}
                onLoad={() => setStylesheetLoad({ href: stylesheetHref, status: "ready" })}
                onError={() => setStylesheetLoad({ href: stylesheetHref, status: "failed" })}
              />
              {stylesheetReady
                ? children
                : (
                    <>
                      <slot name="studio-page-heading" />
                      <slot name="studio-loading-fallback" />
                    </>
                  )}
            </>,
            root
          )
        : null}
    </div>
  );
}
