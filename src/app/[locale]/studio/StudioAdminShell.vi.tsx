"use client";

import { StudioAdminShell } from "./studio-admin-shell";
import { vietnameseStudioCopy } from "./studio-shell-copy.vi";

export default function StudioAdminShellVietnamese({ locale }: { locale: string }) {
  return <StudioAdminShell locale={locale} copy={vietnameseStudioCopy} />;
}
