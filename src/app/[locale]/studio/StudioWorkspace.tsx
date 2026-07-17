"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { ShadowIsland } from "@/components/studio-kit";
import { StudioAdminShell } from "./studio-admin-shell";
import { studioShadowStyles } from "./studio.shadow-styles";

type StudioWorkspaceProps = {
  fallback: ReactNode;
  locale: string;
};

export default function StudioWorkspace({ fallback, locale }: StudioWorkspaceProps) {
  useEffect(() => {
    document.body.classList.add("studio-app-shell-active");
    return () => document.body.classList.remove("studio-app-shell-active");
  }, []);

  const workspaceLabel = locale === "vi"
    ? "Không gian làm việc Studio của Nguyễn Lê Phong"
    : "Nguyen Le Phong's personal Studio workspace";

  return (
    <ShadowIsland
      styles={studioShadowStyles}
      label={workspaceLabel}
      fallback={fallback}
    >
      <StudioAdminShell locale={locale} />
    </ShadowIsland>
  );
}
