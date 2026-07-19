"use client";

import { StudioAdminShell } from "./studio-admin-shell";
import { frenchStudioCopy } from "./studio-shell-copy.fr";

export default function StudioAdminShellFrench({ locale }: { locale: string }) {
  return <StudioAdminShell locale={locale} copy={frenchStudioCopy} />;
}
