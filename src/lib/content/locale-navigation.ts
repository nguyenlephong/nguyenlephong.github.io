import type { Locale } from "@/i18n/routing";

export interface ContentLocaleRoute {
  availableLocales: readonly Locale[];
  fallbackPath: string;
}

/**
 * Keep the article URL only when the selected locale has authored content.
 * Otherwise, switch to that locale's collection instead of fabricating a
 * non-canonical article route.
 */
export function localeSwitchPath(
  pathname: string,
  nextLocale: Locale,
  contentRoute: ContentLocaleRoute | null
): string {
  if (!contentRoute || contentRoute.availableLocales.includes(nextLocale)) {
    return pathname;
  }

  return contentRoute.fallbackPath;
}
