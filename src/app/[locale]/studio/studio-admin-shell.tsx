"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { APP_ROUTE } from "@/app/app.const";
import { track } from "@/lib/analytics";
import { LuGithub, LuMoreVertical, LuPanelLeft, LuSearch, LuSettings, LuX } from "react-icons/lu";
import type { StudioRouteId } from "./studio-route-catalog";
import type { StudioUiCopy, StudioFont, StudioLayoutPreference, StudioResolvedTheme, StudioThemeSetting } from "./studio-shell-copy";
import {
  DEFAULT_ROUTE, getLocalizedNavGroups, getLocalizedProfileItems, getLocalizedRouteDefinitions,
  normalizeLocationRoute, profileHref, routeHref, trackStudioFlowSelect,
  type StudioRouteActivationSource
} from "./studio-shell-navigation";
import {
  applyFontPreference, applyThemePreference, defaultLayoutPreference,
  persistLayoutPreference, readInitialFont, readInitialLayoutPreference,
  readInitialThemeSetting, resolveStudioTheme
} from "./studio-shell-preferences";
import StudioRouteFeatureRegistry from "./StudioRouteFeatureRegistry";
import { studioCatalog } from "./studio-route-catalog";
import { StudioRouteOpenDeduper } from "./studio-route-open-deduper";

type StudioAdminShellProps = { locale: string; copy: StudioUiCopy };

import { CommandDialog, SidebarGroup, StudioPreferencesPanel } from "./StudioShellChrome";

export function StudioAdminShell({ locale, copy }: StudioAdminShellProps) {
  const [activeRoute, setActiveRoute] = useState<StudioRouteId>(() => (typeof window === "undefined" ? DEFAULT_ROUTE : normalizeLocationRoute()));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeSetting, setThemeSetting] = useState<StudioThemeSetting>(readInitialThemeSetting);
  const [resolvedTheme, setResolvedTheme] = useState<StudioResolvedTheme>(() => resolveStudioTheme(readInitialThemeSetting()));
  const [studioFont, setStudioFont] = useState<StudioFont>(readInitialFont);
  const [layoutPreference, setLayoutPreference] = useState<StudioLayoutPreference>(readInitialLayoutPreference);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const preferencesRef = useRef<HTMLDivElement>(null);
  const initialRouteRef = useRef(activeRoute);
  const routeOpenDeduperRef = useRef(new StudioRouteOpenDeduper());
  const localizedRoutes = useMemo(() => getLocalizedRouteDefinitions(copy), [copy]);
  const localizedNavGroups = useMemo(() => getLocalizedNavGroups(copy), [copy]);
  const localizedProfileItems = useMemo(() => getLocalizedProfileItems(copy), [copy]);
  const localizedPrimaryProfileActions = useMemo(
    () => localizedProfileItems.filter((item) => ["home", "blog", "notes"].includes(item.id)),
    [localizedProfileItems]
  );
  const localizedRouteResults = useMemo(() => localizedNavGroups.flatMap((group) => group.items), [localizedNavGroups]);
  const route = localizedRoutes[activeRoute];

  useEffect(() => {
    if (!routeOpenDeduperRef.current.claimInitialLocation()) return;
    const initialRoute = initialRouteRef.current;
    track("studio_route_open", {
      route_id: initialRoute,
      route_kind: studioCatalog.routeKindById[initialRoute],
      source: "initial_location"
    });
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = normalizeLocationRoute();
      setActiveRoute((currentRoute) => {
        if (routeOpenDeduperRef.current.isHistoryTransition(currentRoute, nextRoute)) {
          track("studio_route_open", {
            route_id: nextRoute,
            route_kind: studioCatalog.routeKindById[nextRoute],
            previous_route: currentRoute,
            source: "browser_history"
          });
          trackStudioFlowSelect(nextRoute, "browser_history", currentRoute);
        }
        return nextRoute;
      });
    };
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        track("studio_command_open", { source: "keyboard", active_route: activeRoute });
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setPreferencesOpen(false);
        setAccountOpen(false);
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeRoute]);

  useEffect(() => {
    if (!preferencesOpen) return undefined;

    const onPointerDown = (event: globalThis.MouseEvent) => {
      const path = event.composedPath();
      if (preferencesRef.current && !path.includes(preferencesRef.current)) {
        setPreferencesOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [preferencesOpen]);

  useEffect(() => {
    applyThemePreference(themeSetting);
  }, [themeSetting]);

  useEffect(() => {
    applyFontPreference(studioFont);
  }, [studioFont]);

  useEffect(() => {
    if (themeSetting !== "system") return undefined;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = () => {
      const resolved = applyThemePreference("system");
      setResolvedTheme(resolved);
    };

    query.addEventListener("change", onSystemThemeChange);
    return () => query.removeEventListener("change", onSystemThemeChange);
  }, [themeSetting]);

  const activateRoute = useCallback((routeId: StudioRouteId, source: StudioRouteActivationSource = "unknown") => {
    track("studio_route_open", {
      route_id: routeId,
      route_kind: studioCatalog.routeKindById[routeId],
      previous_route: activeRoute,
      source
    });
    trackStudioFlowSelect(routeId, source, activeRoute);
    setActiveRoute(routeId);
    setMobileSidebarOpen(false);
    setPreferencesOpen(false);
    setAccountOpen(false);
    const nextHref = routeHref(routeId, window.location.search);
    const currentHref = `${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.pushState(null, "", nextHref);
    }
  }, [activeRoute]);

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    activateRoute(DEFAULT_ROUTE, "brand");
  };

  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      track("studio_sidebar_toggle", {
        mode: "mobile",
        open_next: !mobileSidebarOpen,
        collapsible: layoutPreference.sidebarCollapsible
      });
      setMobileSidebarOpen((value) => !value);
      return;
    }

    if (layoutPreference.sidebarCollapsible === "offcanvas") {
      track("studio_sidebar_toggle", {
        mode: "desktop_offcanvas",
        open_next: !desktopSidebarOpen,
        collapsible: layoutPreference.sidebarCollapsible
      });
      setDesktopSidebarOpen((value) => !value);
      return;
    }

    track("studio_sidebar_toggle", {
      mode: "desktop_icon",
      collapsed_next: !sidebarCollapsed,
      collapsible: layoutPreference.sidebarCollapsible
    });
    setSidebarCollapsed((value) => !value);
  };

  const handleThemeChange = useCallback((setting: StudioThemeSetting) => {
    track("studio_preference_change", {
      preference: "theme",
      from: themeSetting,
      to: setting,
      resolved_to: resolveStudioTheme(setting)
    });
    setThemeSetting(setting);
    setResolvedTheme(applyThemePreference(setting));
  }, [themeSetting]);

  const handleFontChange = useCallback((font: StudioFont) => {
    track("studio_preference_change", {
      preference: "font",
      from: studioFont,
      to: font
    });
    setStudioFont(font);
    applyFontPreference(font);
  }, [studioFont]);

  const handleLayoutChange = useCallback((preference: Partial<StudioLayoutPreference>) => {
    const next = { ...layoutPreference, ...preference };
    (Object.entries(preference) as Array<[keyof StudioLayoutPreference, StudioLayoutPreference[keyof StudioLayoutPreference]]>)
      .forEach(([key, value]) => {
        if (layoutPreference[key] === value) return;
        track("studio_preference_change", {
          preference: key,
          from: layoutPreference[key],
          to: value
        });
      });

    setLayoutPreference(next);
    persistLayoutPreference(next);

    if (preference.sidebarCollapsible) {
      setSidebarCollapsed(false);
      setDesktopSidebarOpen(true);
    }
  }, [layoutPreference]);

  const handleRestoreLayout = useCallback(() => {
    track("studio_preference_restore", {
      previous_content_layout: layoutPreference.contentLayout,
      previous_navbar_style: layoutPreference.navbarStyle,
      previous_sidebar_variant: layoutPreference.sidebarVariant,
      previous_sidebar_collapsible: layoutPreference.sidebarCollapsible
    });
    setLayoutPreference(defaultLayoutPreference);
    persistLayoutPreference(defaultLayoutPreference);
    setSidebarCollapsed(false);
    setDesktopSidebarOpen(true);
  }, [layoutPreference]);

  const isIconCollapsed = layoutPreference.sidebarCollapsible === "icon" && sidebarCollapsed;
  const isSidebarHidden = layoutPreference.sidebarCollapsible === "offcanvas" && !desktopSidebarOpen;

  return (
    <div
      className={`studio-admin${isIconCollapsed ? " is-sidebar-collapsed" : ""}${isSidebarHidden ? " is-sidebar-hidden" : ""}${mobileSidebarOpen ? " is-mobile-open" : ""}${resolvedTheme === "dark" ? " is-dark" : ""}`}
      data-locale={locale}
      data-route={activeRoute}
      data-theme-setting={themeSetting}
      data-studio-font={studioFont}
      data-content-layout={layoutPreference.contentLayout}
      data-navbar-style={layoutPreference.navbarStyle}
      data-sidebar-variant={layoutPreference.sidebarVariant}
      data-sidebar-collapsible={layoutPreference.sidebarCollapsible}
    >
      <aside className="studio-sidebar" aria-label={copy.navLabel}>
        <div className="sidebar-header">
          <a className="sidebar-brand" href={routeHref(DEFAULT_ROUTE)} aria-label={copy.openStudio} onClick={handleBrandClick}>
            <span className="sidebar-brand-mark" aria-hidden="true">N</span>
            <span>{copy.brand}</span>
          </a>
          <button
            className="sidebar-close"
            type="button"
            onClick={() => {
              track("studio_sidebar_toggle", {
                mode: "mobile_close_button",
                open_next: false,
                collapsible: layoutPreference.sidebarCollapsible
              });
              setMobileSidebarOpen(false);
            }}
            aria-label={copy.closeNavigation}
          >
            <LuX aria-hidden="true" />
          </button>
        </div>

        <div className="sidebar-create">
          <button
            type="button"
            className="quick-create"
            onClick={() => {
              track("studio_command_open", { source: "sidebar_quick_search", active_route: activeRoute });
              setSearchOpen(true);
            }}
          >
            <LuSearch aria-hidden="true" />
            <span>{copy.findSetupNote}</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          {localizedNavGroups.map((group) => (
            <SidebarGroup
              key={group.id}
              group={group}
              activeRoute={activeRoute}
              expanded={expanded}
              collapsed={isIconCollapsed}
              onActivate={activateRoute}
              onToggle={(id) => setExpanded((value) => ({ ...value, [id]: !(value[id] ?? false) }))}
            />
          ))}
        </div>

        <div className="sidebar-footer">
          {!isIconCollapsed && (
            <section className="support-card">
              <strong>{copy.profileNavigationTitle}</strong>
              <p>{copy.profileNavigationDetail}</p>
              <div className="profile-link-grid">
                {localizedProfileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={profileHref(locale, item.href)}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      onClick={() => {
                        track("studio_profile_nav_click", {
                          target: item.id,
                          source: "sidebar_profile_grid",
                          external: Boolean(item.external)
                        });
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <a
            className="user-card"
            href={profileHref(locale, APP_ROUTE.HOME)}
            onClick={() => {
              track("studio_profile_nav_click", {
                target: "home",
                source: "user_card",
                external: false
              });
            }}
          >
            <span className="user-avatar">N</span>
            <span>
              <strong>Nguyen Le Phong</strong>
              <small>{copy.openProfileHome}</small>
            </span>
            <LuMoreVertical aria-hidden="true" />
          </a>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label={copy.closeNavigation}
          onClick={() => {
            track("studio_sidebar_toggle", {
              mode: "mobile_scrim",
              open_next: false,
              collapsible: layoutPreference.sidebarCollapsible
            });
            setMobileSidebarOpen(false);
          }}
        />
      )}

      <main className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-left">
            <button type="button" className="icon-button" aria-label={copy.toggleNavigation} onClick={toggleSidebar}>
              {mobileSidebarOpen ? <LuX aria-hidden="true" /> : <LuPanelLeft aria-hidden="true" />}
            </button>
            <span className="topbar-separator" aria-hidden="true" />
            <slot name="studio-page-heading" />
            <span className="topbar-separator" aria-hidden="true" />
            <button
              type="button"
              className="search-command"
              onClick={() => {
                track("studio_command_open", { source: "topbar", active_route: activeRoute });
                setSearchOpen(true);
              }}
            >
              <LuSearch aria-hidden="true" />
              <span>{copy.search}</span>
              <kbd>Cmd J</kbd>
            </button>
          </div>

          <div className="topbar-actions">
            <div className="preferences-anchor" ref={preferencesRef}>
              <button
                type="button"
                className="topbar-icon"
                aria-label={copy.openPreferences}
                aria-expanded={preferencesOpen}
                onClick={() => {
                  track("studio_preferences_panel_toggle", {
                    open_next: !preferencesOpen,
                    active_route: activeRoute
                  });
                  setPreferencesOpen((value) => !value);
                  setAccountOpen(false);
                }}
              >
                <LuSettings aria-hidden="true" />
              </button>
              {preferencesOpen && (
                <StudioPreferencesPanel
                  copy={copy}
                  themeSetting={themeSetting}
                  resolvedTheme={resolvedTheme}
                  font={studioFont}
                  layoutPreference={layoutPreference}
                  onThemeChange={handleThemeChange}
                  onFontChange={handleFontChange}
                  onLayoutChange={handleLayoutChange}
                  onRestoreLayout={handleRestoreLayout}
                />
              )}
            </div>
            <a
              className="topbar-icon"
              href="https://github.com/nguyenlephong"
              target="_blank"
              rel="noreferrer"
              aria-label={copy.openGithubProfile}
              onClick={() => {
                track("studio_profile_nav_click", {
                  target: "github",
                  source: "topbar",
                  external: true
                });
              }}
            >
              <LuGithub aria-hidden="true" />
            </a>
            <button
              type="button"
              className="topbar-avatar"
              onClick={() => {
                setAccountOpen((value) => !value);
                setPreferencesOpen(false);
              }}
              aria-label={copy.openAccountMenu}
            >
              N
            </button>
            {accountOpen && (
              <section className="account-popover">
                <strong>Nguyen Le Phong</strong>
                <span>Senior Software Engineer</span>
                <nav className="account-nav" aria-label={copy.profileNavigationTitle}>
                  {localizedProfileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={profileHref(locale, item.href)}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                        onClick={() => {
                          track("studio_profile_nav_click", {
                            target: item.id,
                            source: "account_menu",
                            external: Boolean(item.external)
                          });
                          setAccountOpen(false);
                        }}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </section>
            )}
          </div>
        </header>

        <div className="dashboard-content" id="dashboard">
          <StudioRouteFeatureRegistry
            routeId={activeRoute}
            locale={locale}
            copy={copy}
            profileActions={localizedPrimaryProfileActions}
            onActivate={activateRoute}
          />
        </div>
      </main>

      <CommandDialog
        open={searchOpen}
        query={searchQuery}
        locale={locale}
        activeRoute={activeRoute}
        copy={copy}
        routes={localizedRoutes}
        routeResults={localizedRouteResults}
        profileItems={localizedProfileItems}
        onQuery={setSearchQuery}
        onClose={() => setSearchOpen(false)}
        onActivate={activateRoute}
      />
    </div>
  );
}
