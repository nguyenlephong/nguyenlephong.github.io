"use client";

import { track } from "@/lib/analytics";
import { LuExternalLink, LuLink, LuSmile, LuSparkles, LuWorkflow } from "react-icons/lu";
import { studioCatalog, type StudioRouteId } from "./studio-route-catalog";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioUiCopy } from "./studio-shell-copy";
import {
  getLocalizedProfileItems,
  getLocalizedRouteDefinitions,
  profileHref,
  routeHref,
  type StudioRouteActivationSource
} from "./studio-shell-navigation";

export default function StudioWelcomeFeature({
  route,
  locale,
  copy,
  onActivate
}: Readonly<{
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}>) {
  const localizedRoutes = getLocalizedRouteDefinitions(copy);
  const usefulLinks = getLocalizedProfileItems(copy).filter((item) => ["home", "notes", "blog", "apps", "resume"].includes(item.id));
  const studioShortcuts: StudioRouteId[] = studioCatalog.welcomeRouteIds;

  return (
    <section className="route-page welcome-route" data-studio-module="welcome">
      <div className="welcome-shell">
        <div className="welcome-intro">
          <span className="welcome-eyebrow"><LuSparkles aria-hidden="true" /> {copy.welcome.eyebrow}</span>
          <h2>{route.title}</h2>
          <p>{copy.welcome.lead}</p>
          <div className="welcome-note-strip">
            <LuSmile aria-hidden="true" />
            <span>{copy.welcome.note}</span>
          </div>
        </div>

        <section className="welcome-panel" aria-label={copy.welcome.studioLinks}>
          <div className="welcome-panel-head">
            <span><LuWorkflow aria-hidden="true" /></span>
            <div>
              <h2>{copy.welcome.studioLinks}</h2>
              <p>{route.description}</p>
            </div>
          </div>
          <div className="welcome-shortcut-grid">
            {studioShortcuts.map((routeId) => {
              const shortcutRoute = localizedRoutes[routeId];
              const shortcutCopy = copy.welcome.routeCards[routeId];
              const Icon = shortcutRoute.icon;
              return (
                <a
                  key={routeId}
                  href={routeHref(routeId)}
                  className="welcome-shortcut"
                  onClick={(event) => {
                    event.preventDefault();
                    onActivate(routeId, "route_actions");
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{shortcutCopy?.label ?? shortcutRoute.title}</strong>
                    <small>{shortcutCopy?.detail ?? shortcutRoute.description}</small>
                  </span>
                  <em>{copy.welcome.open}</em>
                </a>
              );
            })}
          </div>
        </section>
      </div>

      <section className="welcome-link-band" aria-label={copy.welcome.publicLinks}>
        <div className="welcome-link-head">
          <span><LuLink aria-hidden="true" /></span>
          <div>
            <h2>{copy.welcome.publicLinks}</h2>
            <p>{copy.profileNavigationDetail}</p>
          </div>
        </div>
        <div className="welcome-link-grid">
          {usefulLinks.map((item) => {
            const Icon = item.icon;
            const linkCopy = copy.welcome.linkCards[item.id];
            return (
              <a
                key={item.id}
                href={profileHref(locale, item.href)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={() => {
                  track("studio_profile_nav_click", {
                    target: item.id,
                    source: "welcome",
                    external: Boolean(item.external)
                  });
                }}
              >
                <Icon aria-hidden="true" />
                <span>
                  <strong>{linkCopy?.label ?? item.label}</strong>
                  <small>{linkCopy?.detail ?? item.detail}</small>
                </span>
                <LuExternalLink aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>
    </section>
  );
}
