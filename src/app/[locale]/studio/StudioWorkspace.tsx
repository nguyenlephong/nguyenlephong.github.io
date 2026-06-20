"use client";

import { useEffect } from "react";
import { ShadowIsland } from "@/components/studio-kit";
import { StudioAdminShell } from "./studio-admin-shell";
import { studioShadowStyles } from "./studio.shadow-styles";

type StudioWorkspaceProps = {
  locale: string;
};

export default function StudioWorkspace({ locale }: StudioWorkspaceProps) {
  useEffect(() => {
    document.body.classList.add("studio-app-shell-active");
    return () => document.body.classList.remove("studio-app-shell-active");
  }, []);

  return (
    <ShadowIsland styles={studioShadowStyles} label="Studio Admin dashboard">
      <StudioAdminShell locale={locale} />
    </ShadowIsland>
  );
}
