"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ShadowIsland } from "@/components/studio-kit";
import StudioShellErrorBoundary, { StudioDeferredShellFallback } from "./StudioShellErrorBoundary";
import { createStudioFeatureLoadErrorCallback } from "./studio-feature-load-error";
import { normalizeStudioLocale, type StudioLocale } from "./studio-shell-copy";
import { studioWorkspaceCopy } from "./studio-workspace-copy";
import { track } from "@/lib/analytics";

const STUDIO_STYLESHEET_HREF = "/studio/studio-shadow.css";

type StudioWorkspaceProps = {
  fallback: ReactNode;
  heading: ReactNode;
  locale: string;
};

const StudioAdminShellEnglish = dynamic(() => import("./StudioAdminShell.en"), {
  ssr: false,
  loading: StudioDeferredShellFallback
});
const StudioAdminShellVietnamese = dynamic(() => import("./StudioAdminShell.vi"), {
  ssr: false,
  loading: StudioDeferredShellFallback
});
const StudioAdminShellChinese = dynamic(() => import("./StudioAdminShell.zh"), {
  ssr: false,
  loading: StudioDeferredShellFallback
});
const StudioAdminShellJapanese = dynamic(() => import("./StudioAdminShell.ja"), {
  ssr: false,
  loading: StudioDeferredShellFallback
});
const StudioAdminShellKorean = dynamic(() => import("./StudioAdminShell.ko"), {
  ssr: false,
  loading: StudioDeferredShellFallback
});
const StudioAdminShellFrench = dynamic(() => import("./StudioAdminShell.fr"), {
  ssr: false,
  loading: StudioDeferredShellFallback
});

const studioShellByLocale = {
  en: StudioAdminShellEnglish,
  vi: StudioAdminShellVietnamese,
  zh: StudioAdminShellChinese,
  ja: StudioAdminShellJapanese,
  ko: StudioAdminShellKorean,
  fr: StudioAdminShellFrench
} satisfies Record<StudioLocale, typeof StudioAdminShellEnglish>;

export default function StudioWorkspace({ fallback, heading, locale }: StudioWorkspaceProps) {
  useEffect(() => {
    document.body.classList.add("studio-app-shell-active");
    return () => document.body.classList.remove("studio-app-shell-active");
  }, []);

  const normalizedLocale = normalizeStudioLocale(locale);
  const copy = studioWorkspaceCopy[normalizedLocale];
  const Shell = studioShellByLocale[normalizedLocale];

  return (
    <ShadowIsland
      stylesheetHref={STUDIO_STYLESHEET_HREF}
      label={copy.label}
      fallback={fallback}
      heading={heading}
    >
      <StudioShellErrorBoundary
        copy={{ title: copy.loadErrorTitle, detail: copy.loadErrorDetail, reload: copy.reload }}
        onError={createStudioFeatureLoadErrorCallback(
          { featureId: "studio-shell", locale: normalizedLocale },
          track
        )}
      >
        <Shell locale={normalizedLocale} />
      </StudioShellErrorBoundary>
    </ShadowIsland>
  );
}
