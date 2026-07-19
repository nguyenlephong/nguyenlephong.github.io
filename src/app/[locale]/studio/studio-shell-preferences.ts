import type { IconType } from "react-icons";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";
import type {
  StudioContentLayout, StudioFont, StudioLayoutPreference, StudioNavbarStyle,
  StudioResolvedTheme, StudioSidebarCollapsible, StudioSidebarVariant, StudioThemeSetting
} from "./studio-shell-copy";

const STUDIO_THEME_STORAGE_KEY = "studio_theme_preference";
const STUDIO_FONT_STORAGE_KEY = "studio_font_preference";
const LAYOUT_STORAGE_KEY = "studio_layout_preference";
const STUDIO_LAYOUT_PREFERENCE_VERSION = 2;

export const themeOptions: Array<{ value: StudioThemeSetting; label: string; icon: IconType }> = [
  { value: "light", label: "Light", icon: LuSun },
  { value: "system", label: "System", icon: LuMonitor },
  { value: "dark", label: "Dark", icon: LuMoon }
];

export const fontOptions: Array<{ value: StudioFont; label: string; detail: string }> = [
  { value: "inter", label: "Inter", detail: "CV default" },
  { value: "source", label: "Source Sans 3", detail: "Calm sans" },
  { value: "plex", label: "IBM Plex Sans", detail: "Technical sans" },
  { value: "atkinson", label: "Atkinson Hyperlegible", detail: "Readable sans" },
  { value: "lora", label: "Lora", detail: "Serif reading" },
  { value: "be-vietnam", label: "Be Vietnam Pro", detail: "Vietnamese-friendly" }
];

export const contentLayoutOptions: Array<{ value: StudioContentLayout; label: string }> = [
  { value: "centered", label: "Centered" },
  { value: "full-width", label: "Full width" }
];

export const navbarStyleOptions: Array<{ value: StudioNavbarStyle; label: string }> = [
  { value: "sticky", label: "Sticky" },
  { value: "scroll", label: "Scroll" }
];

export const sidebarVariantOptions: Array<{ value: StudioSidebarVariant; label: string }> = [
  { value: "inset", label: "Inset" },
  { value: "sidebar", label: "Sidebar" },
  { value: "floating", label: "Floating" }
];

export const sidebarCollapsibleOptions: Array<{ value: StudioSidebarCollapsible; label: string }> = [
  { value: "icon", label: "Icon" },
  { value: "offcanvas", label: "Offcanvas" }
];


export const defaultLayoutPreference: StudioLayoutPreference = {
  contentLayout: "full-width",
  navbarStyle: "sticky",
  sidebarVariant: "sidebar",
  sidebarCollapsible: "icon"
};

export const legacyLayoutPreference: StudioLayoutPreference = {
  contentLayout: "centered",
  navbarStyle: "sticky",
  sidebarVariant: "inset",
  sidebarCollapsible: "icon"
};


export function isSameLayoutPreference(a: StudioLayoutPreference, b: StudioLayoutPreference): boolean {
  return a.contentLayout === b.contentLayout
    && a.navbarStyle === b.navbarStyle
    && a.sidebarVariant === b.sidebarVariant
    && a.sidebarCollapsible === b.sidebarCollapsible;
}

export function isStudioThemeSetting(value: unknown): value is StudioThemeSetting {
  return value === "light" || value === "dark" || value === "system";
}

export function isStudioFont(value: unknown): value is StudioFont {
  return fontOptions.some((option) => option.value === value);
}

export function isStudioContentLayout(value: unknown): value is StudioContentLayout {
  return value === "centered" || value === "full-width";
}

export function isStudioNavbarStyle(value: unknown): value is StudioNavbarStyle {
  return value === "sticky" || value === "scroll";
}

export function isStudioSidebarVariant(value: unknown): value is StudioSidebarVariant {
  return value === "inset" || value === "sidebar" || value === "floating";
}

export function isStudioSidebarCollapsible(value: unknown): value is StudioSidebarCollapsible {
  return value === "icon" || value === "offcanvas";
}

export function resolveStudioTheme(setting: StudioThemeSetting): StudioResolvedTheme {
  if (typeof window === "undefined") return setting === "dark" ? "dark" : "light";
  if (setting === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return setting;
}

export function readInitialThemeSetting(): StudioThemeSetting {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(STUDIO_THEME_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as { theme_setting?: unknown } : null;
    if (isStudioThemeSetting(parsed?.theme_setting)) return parsed.theme_setting;
  } catch {
    // ignore malformed persisted preferences
  }

  return "system";
}

export function readInitialFont(): StudioFont {
  if (typeof window === "undefined") return "inter";

  try {
    const stored = localStorage.getItem(STUDIO_FONT_STORAGE_KEY);
    if (isStudioFont(stored)) return stored;
  } catch {
    // ignore unavailable storage
  }

  return "inter";
}

export function readInitialLayoutPreference(): StudioLayoutPreference {
  if (typeof window === "undefined") return defaultLayoutPreference;

  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    const parsed = stored
      ? JSON.parse(stored) as Partial<Record<keyof StudioLayoutPreference, unknown>> & { version?: unknown }
      : null;
    const restoredPreference = {
      contentLayout: isStudioContentLayout(parsed?.contentLayout) ? parsed.contentLayout : defaultLayoutPreference.contentLayout,
      navbarStyle: isStudioNavbarStyle(parsed?.navbarStyle) ? parsed.navbarStyle : defaultLayoutPreference.navbarStyle,
      sidebarVariant: isStudioSidebarVariant(parsed?.sidebarVariant) ? parsed.sidebarVariant : defaultLayoutPreference.sidebarVariant,
      sidebarCollapsible: isStudioSidebarCollapsible(parsed?.sidebarCollapsible) ? parsed.sidebarCollapsible : defaultLayoutPreference.sidebarCollapsible
    };

    if (parsed?.version !== STUDIO_LAYOUT_PREFERENCE_VERSION && isSameLayoutPreference(restoredPreference, legacyLayoutPreference)) {
      return defaultLayoutPreference;
    }

    return restoredPreference;
  } catch {
    return defaultLayoutPreference;
  }
}

export function applyThemePreference(setting: StudioThemeSetting): StudioResolvedTheme {
  const resolved = resolveStudioTheme(setting);
  document.documentElement.setAttribute("data-theme", resolved);
  try {
    localStorage.setItem(STUDIO_THEME_STORAGE_KEY, JSON.stringify({ theme: resolved, theme_setting: setting }));
  } catch {
    // ignore unavailable storage
  }
  return resolved;
}

export function applyFontPreference(font: StudioFont): void {
  try {
    localStorage.setItem(STUDIO_FONT_STORAGE_KEY, font);
  } catch {
    // ignore unavailable storage
  }
}

export function persistLayoutPreference(preference: StudioLayoutPreference): void {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ ...preference, version: STUDIO_LAYOUT_PREFERENCE_VERSION }));
  } catch {
    // ignore unavailable storage
  }
}
