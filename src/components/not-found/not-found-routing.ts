import { routing, type Locale } from "@/i18n/routing";

export type NotFoundSurface = "blog" | "notes" | "other";
export type RecoveryTarget = "home" | "blog" | "notes" | "resume" | "contact";

export type NotFoundContext = {
  locale: Locale;
  surface: NotFoundSurface;
};

export const DEFAULT_NOT_FOUND_CONTEXT: NotFoundContext = {
  locale: routing.defaultLocale,
  surface: "other"
};

export function resolveNotFoundContext(pathname: string): NotFoundContext {
  const [pathOnly] = pathname.split(/[?#]/, 1);
  const segments = pathOnly.split("/").filter(Boolean);
  const requestedLocale = segments[0];
  const hasSupportedLocale = routing.locales.some(
    (locale) => locale === requestedLocale
  );
  const locale = hasSupportedLocale
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  const routeSegment = hasSupportedLocale ? segments[1] : segments[0];
  const surface: NotFoundSurface =
    routeSegment === "blog"
      ? "blog"
      : routeSegment === "notes"
        ? "notes"
        : "other";

  return { locale, surface };
}

export function orderedRecoveryTargets(
  surface: NotFoundSurface
): RecoveryTarget[] {
  if (surface === "blog") return ["blog", "notes", "home"];
  if (surface === "notes") return ["notes", "blog", "home"];
  // MEP-31: an unknown path is most often an old résumé or profile link, so offer those first.
  return ["home", "resume", "contact"];
}

// Mirrors APP_ROUTE.CV_PDF (tests/not-found-recovery.test.mjs keeps them equal); this module
// stays import-free beyond routing so the test can evaluate it directly.
export const RESUME_PDF_PATH = "/NguyenLePhong_Lead_Software_Engineer.pdf";

export function recoveryHref(locale: Locale, target: RecoveryTarget): string {
  if (target === "home") return `/${locale}`;
  if (target === "resume") return RESUME_PDF_PATH;
  if (target === "contact") return `/${locale}#contact`;
  return `/${locale}/${target}`;
}
