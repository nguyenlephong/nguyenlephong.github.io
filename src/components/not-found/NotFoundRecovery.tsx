"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import PageTracker from "@/components/analytics/PageTracker";
import { routing, LOCALE_LABELS, type Locale } from "@/i18n/routing";
import { track } from "@/lib/analytics";
import { getNotFoundCopy } from "./not-found-content";
import {
  DEFAULT_NOT_FOUND_CONTEXT,
  orderedRecoveryTargets,
  recoveryHref,
  resolveNotFoundContext,
  type RecoveryTarget
} from "./not-found-routing";

const SERVER_PATHNAME = "";

function subscribeToPathname(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getBrowserPathname() {
  return window.location.pathname;
}

function getServerPathname() {
  return SERVER_PATHNAME;
}

export default function NotFoundRecovery() {
  const pathname = useSyncExternalStore(
    subscribeToPathname,
    getBrowserPathname,
    getServerPathname
  );
  const ready = pathname !== SERVER_PATHNAME;
  const context = ready
    ? resolveNotFoundContext(pathname)
    : DEFAULT_NOT_FOUND_CONTEXT;
  const copy = getNotFoundCopy(context.locale);
  const analyticsContext = useMemo(
    () => ({
      detected_locale: context.locale,
      requested_surface: context.surface
    }),
    [context.locale, context.surface]
  );

  useEffect(() => {
    if (!ready) return;

    // Every authored route in this site is slash-less (trailingSlash is off).
    // GitHub Pages has no server-side redirect, so a trailing-slash link
    // (bookmarks, other sites, typos) lands here as a hard 404. Recover it
    // client-side by retrying the canonical slash-less path once.
    if (pathname.length > 1 && pathname.endsWith("/")) {
      const target =
        pathname.replace(/\/+$/, "") +
        window.location.search +
        window.location.hash;
      track(
        "not_found_trailing_slash_recovery",
        { from_pathname: pathname, to_pathname: target },
        { omitLocation: true }
      );
      window.location.replace(target || "/");
      return;
    }

    document.documentElement.lang = context.locale;
    document.title = copy.metaTitle;
  }, [context.locale, copy.metaTitle, pathname, ready]);

  const trackRecovery = (
    target: RecoveryTarget | "language_home",
    selectedLocale?: Locale
  ) => {
    track(
      "not_found_recovery_click",
      {
        target,
        detected_locale: context.locale,
        requested_surface: context.surface,
        selected_locale: selectedLocale ?? null
      },
      { omitLocation: true }
    );
  };

  return (
    <main
      className="not-found"
      data-not-found-locale={context.locale}
      data-not-found-surface={context.surface}
      data-not-found-ready={ready ? "true" : "false"}
    >
      {ready && (
        <PageTracker
          page="not_found"
          eventName="not_found_view"
          section={context.surface}
          context={analyticsContext}
          omitLocation
        />
      )}

      <section className="not-found__card" aria-labelledby="not-found-title">
        <p className="not-found__eyebrow">404 · {copy.eyebrow}</p>
        <h1 id="not-found-title">{copy.title}</h1>
        <p className="not-found__description">
          {copy.descriptions[context.surface]}
        </p>

        <nav className="not-found__actions" aria-label={copy.recoveryLabel}>
          {orderedRecoveryTargets(context.surface).map((target, index) => (
            <a
              key={target}
              className={index === 0 ? "not-found__primary" : undefined}
              href={recoveryHref(context.locale, target)}
              data-not-found-target={target}
              onClick={() => trackRecovery(target)}
            >
              {copy.actions[target]}
            </a>
          ))}
        </nav>
      </section>

      <section
        className="not-found__languages"
        aria-labelledby="not-found-language-title"
      >
        <div>
          <h2 id="not-found-language-title">{copy.languageTitle}</h2>
          <p>{copy.languageDescription}</p>
        </div>
        <ul>
          {routing.locales.map((locale) => (
            <li key={locale}>
              <a
                href={`/${locale}`}
                hrefLang={locale}
                lang={locale}
                onClick={() => trackRecovery("language_home", locale)}
              >
                <span aria-hidden="true">{LOCALE_LABELS[locale].flag}</span>
                {LOCALE_LABELS[locale].name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
