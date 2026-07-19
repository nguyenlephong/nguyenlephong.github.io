"use client";

import { useMemo } from "react";
import { track } from "@/lib/analytics";
import { LuChevronRight, LuSearch, LuType, LuX } from "react-icons/lu";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioRouteId } from "./studio-route-catalog";
import type {
  StudioFont,
  StudioLayoutPreference,
  StudioResolvedTheme,
  StudioThemeSetting,
  StudioUiCopy
} from "./studio-shell-copy";
import {
  DEFAULT_ROUTE,
  isItemActive,
  profileHref,
  routeHref,
  type StudioNavGroup,
  type StudioNavItem,
  type StudioProfileMenuItem,
  type StudioRouteActivationSource
} from "./studio-shell-navigation";
import {
  contentLayoutOptions,
  fontOptions,
  navbarStyleOptions,
  sidebarCollapsibleOptions,
  sidebarVariantOptions,
  themeOptions
} from "./studio-shell-preferences";

export function SidebarGroup({
  group,
  activeRoute,
  expanded,
  collapsed,
  onActivate,
  onToggle
}: {
  group: StudioNavGroup;
  activeRoute: StudioRouteId;
  expanded: Record<string, boolean>;
  collapsed: boolean;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="sidebar-group" aria-label={group.label}>
      {!collapsed && <p className="sidebar-group-label">{group.label}</p>}
      <div className="sidebar-menu">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item, activeRoute);

          if (item.subItems) {
            const open = expanded[item.id] ?? active;
            return (
              <div className="sidebar-tree" key={item.id}>
                <button
                  className={`sidebar-menu-button${active ? " is-active" : ""}`}
                  type="button"
                  aria-expanded={open}
                  onClick={() => {
                    if (item.routeId) {
                      if (!open) onToggle(item.id);
                      onActivate(item.routeId, "sidebar");
                      return;
                    }
                    onToggle(item.id);
                  }}
                >
                  {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
                  <span>{item.title}</span>
                  <LuChevronRight className="sidebar-chevron" aria-hidden="true" />
                </button>
                {open && !collapsed && (
                  <div className="sidebar-submenu">
                    {item.subItems.map((subItem) => (
                      <a
                        key={subItem.id}
                        href={routeHref(subItem.routeId ?? DEFAULT_ROUTE)}
                        className={`sidebar-submenu-link${subItem.routeId === activeRoute ? " is-active" : ""}`}
                        onClick={(event) => {
                          event.preventDefault();
                          onActivate(subItem.routeId ?? DEFAULT_ROUTE, "sidebar");
                        }}
                      >
                        {subItem.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (item.disabled || !item.routeId) {
            return (
              <span key={item.id} className="sidebar-menu-button is-disabled" aria-disabled="true">
                {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
                <span>{item.title}</span>
                {item.badge && <span className={`sidebar-badge badge-${item.badge}`}>{item.badge}</span>}
              </span>
            );
          }

          return (
            <a
              key={item.id}
              href={routeHref(item.routeId)}
              className={`sidebar-menu-button${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onActivate(item.routeId ?? DEFAULT_ROUTE, "sidebar");
              }}
            >
              {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
              <span>{item.title}</span>
              {item.badge && <span className={`sidebar-badge badge-${item.badge}`}>{item.badge}</span>}
            </a>
          );
        })}
      </div>
    </section>
  );
}
export function CommandDialog({
  open,
  query,
  locale,
  activeRoute,
  copy,
  routes,
  routeResults,
  profileItems,
  onQuery,
  onClose,
  onActivate
}: {
  open: boolean;
  query: string;
  locale: string;
  activeRoute: StudioRouteId;
  copy: StudioUiCopy;
  routes: Record<StudioRouteId, StudioRoute>;
  routeResults: StudioNavItem[];
  profileItems: StudioProfileMenuItem[];
  onQuery: (value: string) => void;
  onClose: () => void;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}) {
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return routeResults.filter((item) => {
      const route = item.routeId ? routes[item.routeId] : undefined;
      return !normalized || item.title.toLowerCase().includes(normalized) || route?.description.toLowerCase().includes(normalized);
    });
  }, [query, routeResults, routes]);

  if (!open) return null;

  return (
    <div className="command-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="command-dialog" role="dialog" aria-modal="true" aria-label={copy.commandPaletteLabel}>
        <div className="command-input-row">
          <LuSearch aria-hidden="true" />
          <input autoFocus value={query} onChange={(event) => onQuery(event.target.value)} placeholder={copy.searchPlaceholder} />
          <button type="button" onClick={onClose} aria-label={copy.closeSearch}>
            <LuX aria-hidden="true" />
          </button>
        </div>
        <div className="command-results">
          {results.map((item) => {
            const route = routes[item.routeId ?? DEFAULT_ROUTE];
            const Icon = route.icon;
            return (
              <a
                key={item.id}
                href={routeHref(route.id)}
                className={route.id === activeRoute ? "is-active" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  track("studio_command_result_click", {
                    route_id: route.id,
                    route_kind: route.kind,
                    query_length: query.trim().length
                  });
                  onActivate(route.id, "command");
                  onClose();
                }}
              >
                <Icon aria-hidden="true" />
                <span><strong>{item.title}</strong><small>{route.description}</small></span>
              </a>
            );
          })}
          <span className="command-section-label">{copy.profileMenuTitle}</span>
          {profileItems.map((item) => {
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
                    source: "command_palette",
                    external: Boolean(item.external)
                  });
                  onClose();
                }}
              >
                <Icon aria-hidden="true" />
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function StudioPreferencesPanel({
  copy,
  themeSetting,
  resolvedTheme,
  font,
  layoutPreference,
  onThemeChange,
  onFontChange,
  onLayoutChange,
  onRestoreLayout
}: {
  copy: StudioUiCopy;
  themeSetting: StudioThemeSetting;
  resolvedTheme: StudioResolvedTheme;
  font: StudioFont;
  layoutPreference: StudioLayoutPreference;
  onThemeChange: (setting: StudioThemeSetting) => void;
  onFontChange: (font: StudioFont) => void;
  onLayoutChange: (preference: Partial<StudioLayoutPreference>) => void;
  onRestoreLayout: () => void;
}) {
  const currentFont = fontOptions.find((option) => option.value === font) ?? fontOptions[0];

  return (
    <section className="preferences-popover" aria-label={copy.preferences.title}>
      <div className="preferences-head">
        <div>
          <h2>{copy.preferences.title}</h2>
          <p>{copy.preferences.description}</p>
        </div>
        <span className="theme-color-preview" aria-label={copy.preferences.palette}>
          <i />
          {copy.preferences.palette}
        </span>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.themeMode}</label>
        <div className="preference-segment" data-columns={themeOptions.length} role="radiogroup" aria-label={copy.preferences.themeMode}>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const active = themeSetting === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onThemeChange(option.value)}
            >
              <Icon aria-hidden="true" />
                <span>{copy.preferences.themeOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.resolvedNow}: {resolvedTheme}</p>
      </div>

      <div className="preference-section">
        <label htmlFor="studio-font-select">{copy.preferences.font}</label>
        <div className="preference-select-row">
          <LuType aria-hidden="true" />
          <select
            id="studio-font-select"
            className="native-select"
            value={font}
            onChange={(event) => onFontChange(event.target.value as StudioFont)}
          >
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <p>{currentFont.detail}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.pageLayout}</label>
        <div className="preference-segment" data-columns={contentLayoutOptions.length} role="radiogroup" aria-label={copy.preferences.pageLayout}>
          {contentLayoutOptions.map((option) => {
            const active = layoutPreference.contentLayout === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ contentLayout: option.value })}
              >
                <span>{copy.preferences.contentLayoutOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.pageLayoutHelp}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.navbarBehavior}</label>
        <div className="preference-segment" data-columns={navbarStyleOptions.length} role="radiogroup" aria-label={copy.preferences.navbarBehavior}>
          {navbarStyleOptions.map((option) => {
            const active = layoutPreference.navbarStyle === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ navbarStyle: option.value })}
              >
                <span>{copy.preferences.navbarStyleOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.navbarHelp}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.sidebarStyle}</label>
        <div className="preference-segment" data-columns={sidebarVariantOptions.length} role="radiogroup" aria-label={copy.preferences.sidebarStyle}>
          {sidebarVariantOptions.map((option) => {
            const active = layoutPreference.sidebarVariant === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ sidebarVariant: option.value })}
              >
                <span>{copy.preferences.sidebarVariantOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.sidebarStyleHelp}</p>
      </div>

      <div className="preference-section">
        <label>{copy.preferences.collapseMode}</label>
        <div className="preference-segment" data-columns={sidebarCollapsibleOptions.length} role="radiogroup" aria-label={copy.preferences.collapseMode}>
          {sidebarCollapsibleOptions.map((option) => {
            const active = layoutPreference.sidebarCollapsible === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? "is-active" : undefined}
                onClick={() => onLayoutChange({ sidebarCollapsible: option.value })}
              >
                <span>{copy.preferences.sidebarCollapsibleOptions[option.value]}</span>
              </button>
            );
          })}
        </div>
        <p>{copy.preferences.collapseModeHelp}</p>
      </div>

      <button type="button" className="restore-preferences" onClick={onRestoreLayout}>
        {copy.preferences.restoreDefaults}
      </button>
    </section>
  );
}
