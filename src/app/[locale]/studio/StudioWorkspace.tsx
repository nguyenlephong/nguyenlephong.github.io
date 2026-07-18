"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { ShadowIsland } from "@/components/studio-kit";
import { StudioAdminShell } from "./studio-admin-shell";

const STUDIO_STYLESHEET_HREF = "/studio/studio-shadow.css";

type StudioWorkspaceProps = {
  fallback: ReactNode;
  heading: ReactNode;
  locale: string;
};

export default function StudioWorkspace({ fallback, heading, locale }: StudioWorkspaceProps) {
  useEffect(() => {
    document.body.classList.add("studio-app-shell-active");
    return () => document.body.classList.remove("studio-app-shell-active");
  }, []);

  const workspaceLabel = locale === "vi"
    ? "Không gian làm việc Studio của Nguyễn Lê Phong"
    : "Nguyen Le Phong's personal Studio workspace";

  return (
    <ShadowIsland
      stylesheetHref={STUDIO_STYLESHEET_HREF}
      label={workspaceLabel}
      fallback={fallback}
      heading={heading}
    >
      <StudioAdminShell locale={locale} />
    </ShadowIsland>
  );
}
