"use client";

import { StudioAdminShell } from "./studio-admin-shell";
import { koreanStudioCopy } from "./studio-shell-copy.ko";

export default function StudioAdminShellKorean({ locale }: { locale: string }) {
  return <StudioAdminShell locale={locale} copy={koreanStudioCopy} />;
}
