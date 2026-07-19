"use client";

import { StudioAdminShell } from "./studio-admin-shell";
import { japaneseStudioCopy } from "./studio-shell-copy.ja";

export default function StudioAdminShellJapanese({ locale }: { locale: string }) {
  return <StudioAdminShell locale={locale} copy={japaneseStudioCopy} />;
}
