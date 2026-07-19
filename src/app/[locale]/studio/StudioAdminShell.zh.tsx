"use client";

import { StudioAdminShell } from "./studio-admin-shell";
import { chineseStudioCopy } from "./studio-shell-copy.zh";

export default function StudioAdminShellChinese({ locale }: { locale: string }) {
  return <StudioAdminShell locale={locale} copy={chineseStudioCopy} />;
}
