import { routing, type Locale } from "@/i18n/routing";

export type NotFoundSurface = "blog" | "notes" | "other";
export type RecoveryTarget = "home" | "blog" | "notes";

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
  return ["home", "blog", "notes"];
}

export function recoveryHref(locale: Locale, target: RecoveryTarget): string {
  if (target === "home") return `/${locale}`;
  return `/${locale}/${target}`;
}
