"use client";

import { StudioAdminShell } from "./studio-admin-shell";
import { englishStudioCopy } from "./studio-shell-copy.en";

export default function StudioAdminShellEnglish({ locale }: { locale: string }) {
  return <StudioAdminShell locale={locale} copy={englishStudioCopy} />;
}
