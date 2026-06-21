"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import type { IconType } from "react-icons";
import { APP_ROUTE } from "@/app/app.const";
import { track } from "@/lib/analytics";
import {
  blogRoadmapTicketChecklist,
  blogRoadmapTopics,
  defaultStudioNoteId,
  studioAiSkills,
  studioFolders,
  studioNotes,
  studioWorkflowChecklists
} from "./studio.data";
import type {
  BlogRoadmapEntry,
  BlogRoadmapStatus,
  BlogRoadmapTopic,
  StudioAiSkill,
  StudioChecklistStep,
  StudioNote,
  StudioWorkflowChecklist
} from "./studio.data";
import {
  LuAlarmClock,
  LuArchive,
  LuArrowLeft,
  LuArrowUpDown,
  LuBadgeDollarSign,
  LuBanknote,
  LuBarChart,
  LuBell,
  LuBookOpenCheck,
  LuBoxes,
  LuBriefcase,
  LuCalendarDays,
  LuCheck,
  LuCheckCircle2,
  LuChevronDown,
  LuChevronRight,
  LuClipboardList,
  LuCommand,
  LuCopy,
  LuCreditCard,
  LuDatabase,
  LuDownload,
  LuExternalLink,
  LuFilter,
  LuFlag,
  LuForward,
  LuFileText,
  LuFingerprint,
  LuGauge,
  LuGithub,
  LuGlobe,
  LuGraduationCap,
  LuHelpCircle,
  LuKanbanSquare,
  LuLayoutDashboard,
  LuLineChart,
  LuLink,
  LuListTodo,
  LuLock,
  LuMail,
  LuMailOpen,
  LuMapPin,
  LuMenu,
  LuMessageSquare,
  LuMonitor,
  LuMoon,
  LuMoreVertical,
  LuPanelLeft,
  LuPaperclip,
  LuPhone,
  LuPhoneCall,
  LuPin,
  LuPlusCircle,
  LuReply,
  LuReplyAll,
  LuRotateCw,
  LuSearch,
  LuSend,
  LuServer,
  LuSettings,
  LuShoppingBag,
  LuSlidersHorizontal,
  LuSmile,
  LuSparkles,
  LuSun,
  LuTag,
  LuType,
  LuUser,
  LuUserPlus,
  LuUsers,
  LuWaves,
  LuX
} from "react-icons/lu";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type StudioAdminShellProps = {
  locale: string;
};

type StudioRouteId =
  | "default"
  | "crm"
  | "finance"
  | "analytics"
  | "productivity"
  | "ecommerce"
  | "academy"
  | "logistics"
  | "infrastructure"
  | "email"
  | "chat"
  | "ai-agent-setup"
  | "ai-skills"
  | "delivery-checklists"
  | "blog-roadmap"
  | "calendar"
  | "kanban"
  | "invoice"
  | "users"
  | "roles"
  | "auth-login-v1"
  | "auth-login-v2"
  | "auth-register-v1"
  | "auth-register-v2"
  | "legacy-default"
  | "legacy-crm"
  | "legacy-finance"
  | "legacy-analytics";

type StudioRouteKind =
  | "default"
  | "dashboard"
  | "finance"
  | "analytics"
  | "productivity"
  | "ecommerce"
  | "academy"
  | "logistics"
  | "infrastructure"
  | "mail"
  | "chat"
  | "ai-setup"
  | "ai-skills"
  | "checklists"
  | "roadmap"
  | "calendar"
  | "kanban"
  | "invoice"
  | "users"
  | "roles"
  | "auth"
  | "legacy";

type StudioMetric = {
  label: string;
  value: string;
  helper: string;
  badge: string;
  trend: "up" | "down";
  icon: IconType;
};

type StudioRoute = {
  id: StudioRouteId;
  title: string;
  description: string;
  kind: StudioRouteKind;
  icon: IconType;
  badge?: "new" | "soon";
  metrics: StudioMetric[];
  panels: string[];
  timeline: string[];
};

type MailAttachment = {
  id: string;
  name: string;
  size: string;
  kind: string;
};

type StudioMail = {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  receivedAt: string;
  folder: "inbox" | "drafts" | "sent" | "archive";
  isRead: boolean;
  isPinned: boolean;
  isPriority: boolean;
  labels: string[];
  attachments?: MailAttachment[];
  messageCount?: number;
};

type ChatMessage = {
  id: number;
  side: "in" | "out";
  text: string;
  time: string;
};

type ChatContact = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  timezone: string;
  status: string;
  qualifiedAt: string;
  tags: string[];
};

type StudioConversation = {
  id: number;
  group: "Pinned" | "Today" | "Yesterday";
  name: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isOnline: boolean;
  unreadCount: number;
  contact: ChatContact;
  messages: ChatMessage[];
};

type StudioNavItem = {
  id: string;
  title: string;
  icon?: IconType;
  routeId?: StudioRouteId;
  badge?: "new" | "soon";
  disabled?: boolean;
  subItems?: StudioNavItem[];
};

type StudioNavGroup = {
  id: number;
  label: string;
  items: StudioNavItem[];
};

type StudioProfileMenuItem = {
  id: string;
  label: string;
  detail: string;
  href: string;
  icon: IconType;
  external?: boolean;
};

const DEFAULT_ROUTE: StudioRouteId = "ai-agent-setup";
const STUDIO_THEME_STORAGE_KEY = "studio_theme_preference";
const STUDIO_FONT_STORAGE_KEY = "studio_font_preference";
const LAYOUT_STORAGE_KEY = "studio_layout_preference";
const STUDIO_LAYOUT_PREFERENCE_VERSION = 2;

type StudioThemeSetting = "light" | "dark" | "system";
type StudioResolvedTheme = "light" | "dark";
type StudioFont = "inter" | "source" | "plex" | "atkinson" | "lora" | "be-vietnam";
type StudioContentLayout = "centered" | "full-width";
type StudioNavbarStyle = "sticky" | "scroll";
type StudioSidebarVariant = "inset" | "sidebar" | "floating";
type StudioSidebarCollapsible = "icon" | "offcanvas";
type StudioRouteActivationSource = "brand" | "sidebar" | "command" | "browser_history" | "unknown";

type StudioLayoutPreference = {
  contentLayout: StudioContentLayout;
  navbarStyle: StudioNavbarStyle;
  sidebarVariant: StudioSidebarVariant;
  sidebarCollapsible: StudioSidebarCollapsible;
};

const themeOptions: Array<{ value: StudioThemeSetting; label: string; icon: IconType }> = [
  { value: "light", label: "Light", icon: LuSun },
  { value: "system", label: "System", icon: LuMonitor },
  { value: "dark", label: "Dark", icon: LuMoon }
];

const fontOptions: Array<{ value: StudioFont; label: string; detail: string }> = [
  { value: "inter", label: "Inter", detail: "CV default" },
  { value: "source", label: "Source Sans 3", detail: "Calm sans" },
  { value: "plex", label: "IBM Plex Sans", detail: "Technical sans" },
  { value: "atkinson", label: "Atkinson Hyperlegible", detail: "Readable sans" },
  { value: "lora", label: "Lora", detail: "Serif reading" },
  { value: "be-vietnam", label: "Be Vietnam Pro", detail: "Vietnamese-friendly" }
];

const contentLayoutOptions: Array<{ value: StudioContentLayout; label: string }> = [
  { value: "centered", label: "Centered" },
  { value: "full-width", label: "Full width" }
];

const navbarStyleOptions: Array<{ value: StudioNavbarStyle; label: string }> = [
  { value: "sticky", label: "Sticky" },
  { value: "scroll", label: "Scroll" }
];

const sidebarVariantOptions: Array<{ value: StudioSidebarVariant; label: string }> = [
  { value: "inset", label: "Inset" },
  { value: "sidebar", label: "Sidebar" },
  { value: "floating", label: "Floating" }
];

const sidebarCollapsibleOptions: Array<{ value: StudioSidebarCollapsible; label: string }> = [
  { value: "icon", label: "Icon" },
  { value: "offcanvas", label: "Offcanvas" }
];

const profileMenuItems: StudioProfileMenuItem[] = [
  { id: "home", label: "Home", detail: "Profile overview.", href: APP_ROUTE.HOME, icon: LuGlobe },
  { id: "about", label: "About", detail: "Experience and background.", href: "/#about", icon: LuUser },
  { id: "gallery", label: "Gallery", detail: "Selected visual records.", href: APP_ROUTE.GALLERY, icon: LuSparkles },
  { id: "blog", label: "Blog", detail: "Long-form writing.", href: APP_ROUTE.BLOG, icon: LuBookOpenCheck },
  { id: "notes", label: "Notes", detail: "Shorter working notes.", href: APP_ROUTE.NOTES, icon: LuFileText },
  { id: "apps", label: "Apps", detail: "Small tools and experiments.", href: APP_ROUTE.APPS, icon: LuBoxes },
  { id: "resume", label: "Resume", detail: "Open the CV PDF.", href: APP_ROUTE.CV_PDF, icon: LuDownload, external: true }
];

const primaryProfileActions = profileMenuItems.filter((item) => ["home", "blog", "notes"].includes(item.id));

const defaultLayoutPreference: StudioLayoutPreference = {
  contentLayout: "full-width",
  navbarStyle: "sticky",
  sidebarVariant: "sidebar",
  sidebarCollapsible: "icon"
};

const legacyLayoutPreference: StudioLayoutPreference = {
  contentLayout: "centered",
  navbarStyle: "sticky",
  sidebarVariant: "inset",
  sidebarCollapsible: "icon"
};

function isSameLayoutPreference(a: StudioLayoutPreference, b: StudioLayoutPreference): boolean {
  return a.contentLayout === b.contentLayout
    && a.navbarStyle === b.navbarStyle
    && a.sidebarVariant === b.sidebarVariant
    && a.sidebarCollapsible === b.sidebarCollapsible;
}

function isStudioThemeSetting(value: unknown): value is StudioThemeSetting {
  return value === "light" || value === "dark" || value === "system";
}

function isStudioFont(value: unknown): value is StudioFont {
  return fontOptions.some((option) => option.value === value);
}

function isStudioContentLayout(value: unknown): value is StudioContentLayout {
  return value === "centered" || value === "full-width";
}

function isStudioNavbarStyle(value: unknown): value is StudioNavbarStyle {
  return value === "sticky" || value === "scroll";
}

function isStudioSidebarVariant(value: unknown): value is StudioSidebarVariant {
  return value === "inset" || value === "sidebar" || value === "floating";
}

function isStudioSidebarCollapsible(value: unknown): value is StudioSidebarCollapsible {
  return value === "icon" || value === "offcanvas";
}

function resolveStudioTheme(setting: StudioThemeSetting): StudioResolvedTheme {
  if (typeof window === "undefined") return setting === "dark" ? "dark" : "light";
  if (setting === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return setting;
}

function readInitialThemeSetting(): StudioThemeSetting {
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

function readInitialFont(): StudioFont {
  if (typeof window === "undefined") return "inter";

  try {
    const stored = localStorage.getItem(STUDIO_FONT_STORAGE_KEY);
    if (isStudioFont(stored)) return stored;
  } catch {
    // ignore unavailable storage
  }

  return "inter";
}

function readInitialLayoutPreference(): StudioLayoutPreference {
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

function applyThemePreference(setting: StudioThemeSetting): StudioResolvedTheme {
  const resolved = resolveStudioTheme(setting);
  document.documentElement.setAttribute("data-theme", resolved);
  try {
    localStorage.setItem(STUDIO_THEME_STORAGE_KEY, JSON.stringify({ theme: resolved, theme_setting: setting }));
  } catch {
    // ignore unavailable storage
  }
  return resolved;
}

function applyFontPreference(font: StudioFont): void {
  try {
    localStorage.setItem(STUDIO_FONT_STORAGE_KEY, font);
  } catch {
    // ignore unavailable storage
  }
}

function persistLayoutPreference(preference: StudioLayoutPreference): void {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ ...preference, version: STUDIO_LAYOUT_PREFERENCE_VERSION }));
  } catch {
    // ignore unavailable storage
  }
}

const defaultMetrics: StudioMetric[] = [
  {
    label: "Release Health",
    value: "96.4%",
    helper: "Successful deploys this window",
    badge: "+4.8%",
    trend: "up",
    icon: LuCheckCircle2
  },
  {
    label: "Open Incidents",
    value: "2",
    helper: "Gateway and partner queues",
    badge: "-3",
    trend: "down",
    icon: LuFlag
  },
  {
    label: "P95 Latency",
    value: "182ms",
    helper: "Edge and backend aggregate",
    badge: "-28ms",
    trend: "up",
    icon: LuGauge
  },
  {
    label: "Flag Coverage",
    value: "38",
    helper: "Tenant and segment rules",
    badge: "+6",
    trend: "up",
    icon: LuSlidersHorizontal
  }
];

const routeMetrics: Record<StudioRouteId, StudioMetric[]> = {
  default: defaultMetrics,
  crm: [
    { label: "Open Pipeline", value: "$84.2k", helper: "Weighted active deals", badge: "+8.4%", trend: "up", icon: LuBarChart },
    { label: "New Leads", value: "328", helper: "Inbound this month", badge: "+14%", trend: "up", icon: LuUserPlus },
    { label: "Win Rate", value: "42%", helper: "Closed won opportunities", badge: "+3.1%", trend: "up", icon: LuGauge },
    { label: "Follow-ups", value: "19", helper: "Tasks due today", badge: "-6%", trend: "down", icon: LuListTodo }
  ],
  finance: [
    { label: "Net Worth", value: "$128.4k", helper: "Across all tracked accounts", badge: "+5.8%", trend: "up", icon: LuBanknote },
    { label: "Monthly Cash Flow", value: "$4,860", helper: "Income after expenses", badge: "+9.2%", trend: "up", icon: LuLineChart },
    { label: "Savings Rate", value: "37%", helper: "Current month progress", badge: "+2.7%", trend: "up", icon: LuWaves },
    { label: "Upcoming Bills", value: "$940", helper: "Next 14 days", badge: "-4%", trend: "down", icon: LuCreditCard }
  ],
  analytics: [
    { label: "Visitors", value: "92.4k", helper: "Total sessions", badge: "+18%", trend: "up", icon: LuGauge },
    { label: "Conversion", value: "7.8%", helper: "Site to signup", badge: "+1.4%", trend: "up", icon: LuLineChart },
    { label: "Bounce Rate", value: "31%", helper: "Quality improved", badge: "-5%", trend: "up", icon: LuArrowUpDown },
    { label: "Realtime", value: "642", helper: "People active now", badge: "+22%", trend: "up", icon: LuUsers }
  ],
  productivity: [
    { label: "Focus Time", value: "5h 20m", helper: "Deep work today", badge: "+42m", trend: "up", icon: LuListTodo },
    { label: "Tasks Done", value: "18", helper: "Across active projects", badge: "+6", trend: "up", icon: LuCheck },
    { label: "Meetings", value: "4", helper: "Remaining today", badge: "-1", trend: "up", icon: LuCalendarDays },
    { label: "Notes", value: "27", helper: "Captured this week", badge: "+9", trend: "up", icon: LuFileText }
  ],
  ecommerce: [
    { label: "Store Revenue", value: "$42.8k", helper: "This month", badge: "+12%", trend: "up", icon: LuShoppingBag },
    { label: "Orders", value: "1,284", helper: "All channels", badge: "+8%", trend: "up", icon: LuClipboardList },
    { label: "AOV", value: "$74.20", helper: "Average order value", badge: "+3%", trend: "up", icon: LuBadgeDollarSign },
    { label: "Stock Alerts", value: "12", helper: "Need restocking", badge: "-4", trend: "up", icon: LuBoxes }
  ],
  academy: [
    { label: "Active Students", value: "1,048", helper: "Across all programs", badge: "+6%", trend: "up", icon: LuGraduationCap },
    { label: "Assignments", value: "214", helper: "Submitted this week", badge: "+18", trend: "up", icon: LuBookOpenCheck },
    { label: "Avg. Grade", value: "86%", helper: "Latest assessment", badge: "+4%", trend: "up", icon: LuGauge },
    { label: "Events", value: "7", helper: "Upcoming this week", badge: "+2", trend: "up", icon: LuCalendarDays }
  ],
  logistics: [
    { label: "Shipments", value: "428", helper: "Currently in transit", badge: "+11%", trend: "up", icon: LuBoxes },
    { label: "On-time Rate", value: "96.2%", helper: "Rolling 30 days", badge: "+1.8%", trend: "up", icon: LuGauge },
    { label: "Delayed", value: "14", helper: "Needs attention", badge: "-9", trend: "up", icon: LuBell },
    { label: "Warehouses", value: "8", helper: "Healthy capacity", badge: "+2", trend: "up", icon: LuDatabase }
  ],
  infrastructure: [
    { label: "Services", value: "42", helper: "Production workloads", badge: "+5", trend: "up", icon: LuServer },
    { label: "Deploys", value: "128", helper: "Last 7 days", badge: "+23%", trend: "up", icon: LuGithub },
    { label: "Incidents", value: "2", helper: "Open investigations", badge: "-3", trend: "up", icon: LuHelpCircle },
    { label: "Uptime", value: "99.98%", helper: "Platform average", badge: "+0.2%", trend: "up", icon: LuGauge }
  ],
  email: [
    { label: "Unread", value: "7", helper: "Messages that still need review", badge: "+3", trend: "up", icon: LuMailOpen },
    { label: "Pinned", value: "4", helper: "Kept at the top of the inbox", badge: "+1", trend: "up", icon: LuPin },
    { label: "Priority", value: "3", helper: "Marked for same-day reply", badge: "-2", trend: "up", icon: LuFlag },
    { label: "Drafts", value: "2", helper: "Replies prepared but not sent", badge: "+2", trend: "up", icon: LuReply }
  ],
  chat: [
    { label: "Open Threads", value: "24", helper: "Across inbox and channels", badge: "+5", trend: "up", icon: LuMessageSquare },
    { label: "Mentions", value: "3", helper: "Waiting for direct response", badge: "+1", trend: "up", icon: LuTag },
    { label: "Snoozed", value: "2", helper: "Deferred conversations", badge: "-1", trend: "up", icon: LuAlarmClock },
    { label: "Avg. Reply", value: "4m", helper: "Median response time today", badge: "+18%", trend: "up", icon: LuGauge }
  ],
  "ai-agent-setup": [
    { label: "Setup notes", value: "6", helper: "Machine and agent references", badge: "+2", trend: "up", icon: LuBookOpenCheck },
    { label: "Agent tools", value: "4", helper: "Codex, Claude, Gemini, Antigravity", badge: "ready", trend: "up", icon: LuSparkles },
    { label: "MCP paths", value: "5", helper: "Install commands kept close", badge: "+3", trend: "up", icon: LuCommand },
    { label: "Safety checks", value: "4", helper: "Credential and workflow guardrails", badge: "stable", trend: "up", icon: LuLock }
  ],
  "ai-skills": [
    { label: "Skills", value: `${studioAiSkills.length}`, helper: "Reusable markdown prompts", badge: "copy", trend: "up", icon: LuSparkles },
    { label: "Engineering", value: `${studioAiSkills.filter((skill) => skill.category === "engineering").length}`, helper: "Code, frontend, backend, specs", badge: "core", trend: "up", icon: LuServer },
    { label: "Content", value: `${studioAiSkills.filter((skill) => skill.category === "content").length}`, helper: "Writing and prompt work", badge: "voice", trend: "up", icon: LuFileText },
    { label: "Ops", value: `${studioAiSkills.filter((skill) => skill.category === "operations" || skill.category === "communication").length}`, helper: "Reports, proposals, decks", badge: "ready", trend: "up", icon: LuClipboardList }
  ],
  "delivery-checklists": [
    { label: "Checklists", value: `${studioWorkflowChecklists.length}`, helper: "Task, module, release, rollout", badge: "nested", trend: "up", icon: LuClipboardList },
    { label: "Sections", value: `${studioWorkflowChecklists.reduce((total, checklist) => total + checklist.sections.length, 0)}`, helper: "Reusable operating gates", badge: "mapped", trend: "up", icon: LuListTodo },
    { label: "Steps", value: `${studioWorkflowChecklists.reduce((total, checklist) => total + checklist.sections.reduce((sum, section) => sum + section.steps.length, 0), 0)}`, helper: "Parent checklist items", badge: "ready", trend: "up", icon: LuCheckCircle2 },
    { label: "Rollout", value: "3 phases", helper: "Before, during, after", badge: "guarded", trend: "up", icon: LuFlag }
  ],
  "blog-roadmap": [
    { label: "Topics", value: `${blogRoadmapTopics.length}`, helper: "Existing blog categories in scope", badge: "mapped", trend: "up", icon: LuBookOpenCheck },
    { label: "Article tickets", value: `${blogRoadmapTopics.reduce((total, topic) => total + topic.entries.length, 0)}`, helper: "One daily idea per topic", badge: "30d", trend: "up", icon: LuListTodo },
    { label: "Ready drafts", value: `${blogRoadmapTopics.reduce((total, topic) => total + topic.entries.filter((entry) => entry.status === "ready").length, 0)}`, helper: "Can be ticketed first", badge: "next", trend: "up", icon: LuCheckCircle2 },
    { label: "Cadence", value: "5/day", helper: "One post per topic each day", badge: "daily", trend: "up", icon: LuCalendarDays }
  ],
  calendar: [
    { label: "Today", value: "6", helper: "Events on the schedule", badge: "+2", trend: "up", icon: LuCalendarDays },
    { label: "Focus Blocks", value: "3h", helper: "Protected engineering time", badge: "+45m", trend: "up", icon: LuAlarmClock },
    { label: "Conflicts", value: "1", helper: "Needs a decision", badge: "-2", trend: "up", icon: LuBell },
    { label: "Available", value: "2.5h", helper: "Open booking capacity", badge: "+30m", trend: "up", icon: LuGauge }
  ],
  kanban: [
    { label: "Todo", value: "8", helper: "Ready for pickup", badge: "+2", trend: "up", icon: LuListTodo },
    { label: "In Progress", value: "5", helper: "Actively moving", badge: "+1", trend: "up", icon: LuKanbanSquare },
    { label: "Done", value: "14", helper: "Completed this sprint", badge: "+6", trend: "up", icon: LuCheckCircle2 },
    { label: "Blocked", value: "2", helper: "Needs escalation", badge: "-1", trend: "up", icon: LuFlag }
  ],
  invoice: [
    { label: "Subtotal", value: "$1,670", helper: "Current invoice draft", badge: "+2 lines", trend: "up", icon: LuBadgeDollarSign },
    { label: "Line Items", value: "2", helper: "Services captured", badge: "ready", trend: "up", icon: LuClipboardList },
    { label: "Tax", value: "$0", helper: "No tax applied", badge: "0%", trend: "up", icon: LuCreditCard },
    { label: "Due In", value: "14d", helper: "Payment window", badge: "net 14", trend: "up", icon: LuCalendarDays }
  ],
  users: [
    { label: "Active", value: "64", helper: "Enabled accounts", badge: "+4", trend: "up", icon: LuUsers },
    { label: "Pending", value: "7", helper: "Invites waiting", badge: "+2", trend: "up", icon: LuUserPlus },
    { label: "Suspended", value: "2", helper: "Access paused", badge: "-1", trend: "up", icon: LuLock },
    { label: "Teams", value: "6", helper: "Mapped departments", badge: "+1", trend: "up", icon: LuBriefcase }
  ],
  roles: [
    { label: "Roles", value: "3", helper: "Admin, Editor, Viewer", badge: "stable", trend: "up", icon: LuLock },
    { label: "Permissions", value: "18", helper: "Grouped access rules", badge: "+3", trend: "up", icon: LuSlidersHorizontal },
    { label: "Coverage", value: "68", helper: "Users with assigned roles", badge: "100%", trend: "up", icon: LuUsers },
    { label: "Reviews", value: "4", helper: "Quarterly checks due", badge: "+1", trend: "up", icon: LuCheck }
  ],
  "auth-login-v1": [
    { label: "Sessions", value: "128", helper: "Active browser sessions", badge: "+12", trend: "up", icon: LuFingerprint },
    { label: "MFA", value: "82%", helper: "Protected accounts", badge: "+5%", trend: "up", icon: LuLock },
    { label: "Trusted", value: "41", helper: "Recognized devices", badge: "+6", trend: "up", icon: LuMonitor },
    { label: "Resets", value: "3", helper: "Password reset checks", badge: "-2", trend: "up", icon: LuRotateCw }
  ],
  "auth-login-v2": [
    { label: "Magic Links", value: "29", helper: "Issued today", badge: "+8", trend: "up", icon: LuLink },
    { label: "Sessions", value: "116", helper: "Active browser sessions", badge: "+9", trend: "up", icon: LuFingerprint },
    { label: "MFA", value: "84%", helper: "Protected accounts", badge: "+7%", trend: "up", icon: LuLock },
    { label: "Blocked", value: "2", helper: "Suspicious attempts", badge: "-4", trend: "up", icon: LuFlag }
  ],
  "auth-register-v1": [
    { label: "Invites", value: "18", helper: "Open registration links", badge: "+5", trend: "up", icon: LuUserPlus },
    { label: "Completed", value: "12", helper: "Profiles finished", badge: "+4", trend: "up", icon: LuCheckCircle2 },
    { label: "Workspaces", value: "6", helper: "Created this week", badge: "+2", trend: "up", icon: LuBriefcase },
    { label: "Queued Mail", value: "12", helper: "Welcome emails ready", badge: "+4", trend: "up", icon: LuMail }
  ],
  "auth-register-v2": [
    { label: "Invites", value: "21", helper: "Open registration links", badge: "+7", trend: "up", icon: LuUserPlus },
    { label: "Profiles", value: "15", helper: "Submitted this week", badge: "+5", trend: "up", icon: LuUser },
    { label: "Teams", value: "4", helper: "Workspace mappings", badge: "+1", trend: "up", icon: LuUsers },
    { label: "Review", value: "3", helper: "Needs admin approval", badge: "-2", trend: "up", icon: LuCheck }
  ],
  "legacy-default": defaultMetrics,
  "legacy-crm": defaultMetrics,
  "legacy-finance": defaultMetrics,
  "legacy-analytics": defaultMetrics
};

const routeDefinitions: Record<StudioRouteId, StudioRoute> = {
  default: {
    id: "default",
    title: "Engineering Ops",
    description: "Release health, traffic quality, rollout control, component inventory, and operational workstreams.",
    kind: "default",
    icon: LuLayoutDashboard,
    metrics: routeMetrics.default,
    panels: ["Release Signal", "Component Inventory", "System Workstreams"],
    timeline: ["Gateway rollback criteria reviewed", "Feature flag audit completed", "PostHog anomaly window closed"]
  },
  crm: {
    id: "crm",
    title: "CRM",
    description: "Stakeholder follow-ups, delivery pipeline notes, and opportunity health in the Studio shell.",
    kind: "dashboard",
    icon: LuBarChart,
    metrics: routeMetrics.crm,
    panels: ["Pipeline Activity", "Task Reminders", "Opportunities"],
    timeline: ["Lead scored by AI", "Proposal follow-up due", "Enterprise deal moved to negotiation"]
  },
  finance: {
    id: "finance",
    title: "Personal Finances",
    description: "Accounts, transactions, and balance distribution with functional tabs.",
    kind: "finance",
    icon: LuBanknote,
    metrics: routeMetrics.finance,
    panels: ["Transactions Overview", "Balance Distribution", "Upcoming Transactions"],
    timeline: ["Updated 5 min ago", "Wallet synced", "Export prepared"]
  },
  analytics: {
    id: "analytics",
    title: "Hello, Aiy",
    description: "Monitor traffic, engagement, and conversion performance in one view.",
    kind: "analytics",
    icon: LuGauge,
    metrics: routeMetrics.analytics,
    panels: ["Traffic Quality", "Realtime Visitors", "Top Traffic Sources"],
    timeline: ["Realtime audience refreshed", "Conversion goal updated", "Top page changed"]
  },
  productivity: {
    id: "productivity",
    title: "Good morning, Arham.",
    description: "Tasks, projects, focus time, and weekly planning blocks.",
    kind: "productivity",
    icon: LuListTodo,
    metrics: routeMetrics.productivity,
    panels: ["Tasks Section", "Projects Section", "Quick Actions"],
    timeline: ["Focus block started", "Project status changed", "Weekly summary generated"]
  },
  ecommerce: {
    id: "ecommerce",
    title: "Store Overview",
    description: "Revenue, inventory, traffic sources, and recent orders.",
    kind: "ecommerce",
    icon: LuShoppingBag,
    metrics: routeMetrics.ecommerce,
    panels: ["Store Traffic", "Top Products", "Recent Orders"],
    timeline: ["New order imported", "Inventory alert cleared", "Traffic source updated"]
  },
  academy: {
    id: "academy",
    title: "Academy Dashboard",
    description: "Class schedule, assignment status, and performance highlights.",
    kind: "academy",
    icon: LuGraduationCap,
    metrics: routeMetrics.academy,
    panels: ["Class Schedule", "Assignment Status", "Upcoming Events"],
    timeline: ["New announcement drafted", "Gradebook synced", "Assignment added"]
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    description: "Shipment routing, delivery states, and warehouse capacity.",
    kind: "logistics",
    icon: LuBoxes,
    metrics: routeMetrics.logistics,
    panels: ["Shipment Route Map", "Shipment List", "Delivery Details"],
    timeline: ["Route recalculated", "Driver checked in", "Warehouse capacity updated"]
  },
  infrastructure: {
    id: "infrastructure",
    title: "Infrastructure",
    description: "Project environments, deploys, incidents, and uptime signals.",
    kind: "infrastructure",
    icon: LuServer,
    badge: "new",
    metrics: routeMetrics.infrastructure,
    panels: ["Project Environments", "Production Services", "Incident Ledger"],
    timeline: ["Production deploy passed", "Preview environment created", "Alert acknowledged"]
  },
  email: {
    id: "email",
    title: "Email",
    description: "Inbox, pinned messages, selected thread, attachments, and reply composer inside the Studio shell.",
    kind: "mail",
    icon: LuMail,
    metrics: routeMetrics.email,
    panels: ["Inbox", "Conversation", "Composer"],
    timeline: ["Invoice email opened", "Newsletter archived", "Follow-up drafted"]
  },
  chat: {
    id: "chat",
    title: "Chat",
    description: "Conversation inbox with grouped threads, message composer, unread states, and contact profile.",
    kind: "chat",
    icon: LuMessageSquare,
    metrics: routeMetrics.chat,
    panels: ["Threads", "Conversation", "Profile"],
    timeline: ["Aiy sent a message", "Thread marked unread", "Attachment opened"]
  },
  "ai-agent-setup": {
    id: "ai-agent-setup",
    title: "AI Agent Setup",
    description: "Personal setup notes for my AI agent tools, MCP paths, and safe machine bootstrap.",
    kind: "ai-setup",
    icon: LuSparkles,
    badge: "new",
    metrics: routeMetrics["ai-agent-setup"],
    panels: ["Setup library", "Agent workflow", "Command runbook"],
    timeline: ["Skill library reviewed", "MCP install path captured", "Credential guardrail checked"]
  },
  "ai-skills": {
    id: "ai-skills",
    title: "AI Skills",
    description: "Reusable markdown skills for code review, architecture, content writing, prompts, reports, specs, and proposals.",
    kind: "ai-skills",
    icon: LuSparkles,
    badge: "new",
    metrics: routeMetrics["ai-skills"],
    panels: ["Skill library", "Markdown preview", "Copy-ready prompt"],
    timeline: ["Code review skill ready", "Architecture skills grouped", "Content and report prompts prepared"]
  },
  "delivery-checklists": {
    id: "delivery-checklists",
    title: "Delivery Checklists",
    description: "Operating checklists from task intake through module work, release readiness, and rollout.",
    kind: "checklists",
    icon: LuClipboardList,
    badge: "new",
    metrics: routeMetrics["delivery-checklists"],
    panels: ["Task intake", "Module creation", "Release and rollout"],
    timeline: ["Ticket intake path mapped", "Module checklist nested", "Rollout phases captured"]
  },
  "blog-roadmap": {
    id: "blog-roadmap",
    title: "Blog Roadmap",
    description: "A 30-day writing menu for every current blog topic, ready to turn into daily Multica article tickets.",
    kind: "roadmap",
    icon: LuBookOpenCheck,
    badge: "new",
    metrics: routeMetrics["blog-roadmap"],
    panels: ["Topic menu", "Daily article plan", "Ticket checklist"],
    timeline: ["Existing blog topics mapped", "Thirty daily prompts prepared", "Ticket handoff checklist ready"]
  },
  calendar: {
    id: "calendar",
    title: "Calendar",
    description: "Event calendar with day blocks and meeting density.",
    kind: "calendar",
    icon: LuCalendarDays,
    metrics: routeMetrics.calendar,
    panels: ["Month View", "Upcoming Events", "Availability"],
    timeline: ["Design review moved", "Focus block added", "Release check scheduled"]
  },
  kanban: {
    id: "kanban",
    title: "Kanban",
    description: "Task board with columns, cards, status, and review-ready engineering work.",
    kind: "kanban",
    icon: LuKanbanSquare,
    metrics: routeMetrics.kanban,
    panels: ["Todo", "In progress", "Done"],
    timeline: ["Task moved to review", "Bug triaged", "Release note drafted"]
  },
  invoice: {
    id: "invoice",
    title: "Invoice",
    description: "Invoice form and preview surface with export action.",
    kind: "invoice",
    icon: LuClipboardList,
    metrics: routeMetrics.invoice,
    panels: ["Client", "Line Items", "Preview"],
    timeline: ["Invoice preview updated", "Tax recalculated", "PDF export ready"]
  },
  users: {
    id: "users",
    title: "Users",
    description: "Users table with search, roles, and account status.",
    kind: "users",
    icon: LuUsers,
    metrics: routeMetrics.users,
    panels: ["Directory", "Access", "Invitations"],
    timeline: ["User invited", "Role updated", "Account suspended"]
  },
  roles: {
    id: "roles",
    title: "Roles",
    description: "Role cards and permission groups.",
    kind: "roles",
    icon: LuLock,
    metrics: routeMetrics.roles,
    panels: ["Admin", "Editor", "Viewer"],
    timeline: ["Permission changed", "Role reviewed", "Access report exported"]
  },
  "auth-login-v1": {
    id: "auth-login-v1",
    title: "Login v1",
    description: "Authentication route preview opened inside Studio instead of a new project.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics["auth-login-v1"],
    panels: ["Credentials", "Social auth", "Security"],
    timeline: ["Session created", "Password reset checked", "Device trusted"]
  },
  "auth-login-v2": {
    id: "auth-login-v2",
    title: "Login v2",
    description: "Alternate authentication layout with the same shell behavior.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics["auth-login-v2"],
    panels: ["Credentials", "Magic link", "Security"],
    timeline: ["Magic link generated", "Session checked", "Device trusted"]
  },
  "auth-register-v1": {
    id: "auth-register-v1",
    title: "Register v1",
    description: "Registration screen preview with plan and role fields.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics["auth-register-v1"],
    panels: ["Account", "Profile", "Invite"],
    timeline: ["Invite accepted", "Profile created", "Welcome email queued"]
  },
  "auth-register-v2": {
    id: "auth-register-v2",
    title: "Register v2",
    description: "Second registration variant with workspace, invite, and access-review states.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: routeMetrics["auth-register-v2"],
    panels: ["Account", "Workspace", "Invite"],
    timeline: ["Workspace created", "Invite accepted", "Welcome email queued"]
  },
  "legacy-default": {
    id: "legacy-default",
    title: "Default V1",
    description: "Legacy dashboard variant kept accessible from the source navigation.",
    kind: "legacy",
    icon: LuLayoutDashboard,
    metrics: routeMetrics["legacy-default"],
    panels: ["Proposal Sections", "Legacy Chart", "Queue"],
    timeline: ["Legacy chart refreshed", "Proposal section reviewed", "Queue exported"]
  },
  "legacy-crm": {
    id: "legacy-crm",
    title: "CRM V1",
    description: "Legacy CRM variant kept under the collapsible dashboard group.",
    kind: "legacy",
    icon: LuBarChart,
    metrics: routeMetrics.crm,
    panels: ["Overview Cards", "Recent Leads", "Insight Cards"],
    timeline: ["Lead imported", "Opportunity updated", "Campaign reviewed"]
  },
  "legacy-finance": {
    id: "legacy-finance",
    title: "Finance V1",
    description: "Legacy finance view with cash-flow and spending cards.",
    kind: "legacy",
    icon: LuBanknote,
    metrics: routeMetrics.finance,
    panels: ["Cash Flow", "Spending Breakdown", "Income Reliability"],
    timeline: ["Cash flow updated", "Budget reviewed", "Account synced"]
  },
  "legacy-analytics": {
    id: "legacy-analytics",
    title: "Analytics V1",
    description: "Legacy analytics view with drivers, risk ledger, and action queue.",
    kind: "legacy",
    icon: LuGauge,
    metrics: routeMetrics.analytics,
    panels: ["Drivers Coverage", "Risk Ledger", "Action Queue"],
    timeline: ["Risk updated", "Driver reviewed", "Queue reordered"]
  }
};

const navGroups: StudioNavGroup[] = [
  {
    id: 1,
    label: "Personal Studio",
    items: [
      {
        id: "ai-agent-setup",
        title: "AI Setup",
        routeId: "ai-agent-setup",
        icon: LuSparkles,
        badge: "new"
      },
      {
        id: "ai-skills",
        title: "AI Skills",
        routeId: "ai-skills",
        icon: LuCommand,
        badge: "new"
      },
      {
        id: "delivery-checklists",
        title: "Checklists",
        routeId: "delivery-checklists",
        icon: LuClipboardList,
        badge: "new"
      },
      {
        id: "blog-roadmap",
        title: "Blog Roadmap",
        routeId: "blog-roadmap",
        icon: LuBookOpenCheck,
        badge: "new"
      }
    ]
  }
];

const studioMails: StudioMail[] = [
  {
    id: "mail-incident-rollback",
    from: { name: "Olivia Rhye", email: "olivia.rhye@railway.co" },
    to: ["Nguyen Le Phong"],
    cc: ["Platform Team"],
    subject: "Staging gateway still returns 502 after rollback",
    body: "Hi Phong,\n\nThe latest rollback finished, but the staging gateway is still returning intermittent 502s. API traffic looks healthy; only the web container readiness probe keeps failing.\n\nCan you check whether the ingress path and service selector still match after the deployment rollback?\n\nThanks,\nOlivia",
    receivedAt: "Just now",
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["incident", "staging", "gateway"],
    attachments: [
      { id: "readiness-log", name: "readiness-log.txt", size: "42 KB", kind: "log" },
      { id: "ingress-diff", name: "ingress-diff.yaml", size: "18 KB", kind: "yaml" }
    ],
    messageCount: 5
  },
  {
    id: "mail-feature-flag",
    from: { name: "Drew Cano", email: "drew.cano@atlasworks.co" },
    to: ["Nguyen Le Phong"],
    subject: "Feature flag rollout plan for enterprise tenants",
    body: "Can we roll the new dashboard to three enterprise tenants first, then expand by percentage after the support window? I want the rollout notes to include rollback criteria and PostHog checks.",
    receivedAt: "12 min ago",
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["feature flag", "enterprise"],
    attachments: [{ id: "rollout-plan", name: "rollout-plan.md", size: "9 KB", kind: "doc" }],
    messageCount: 3
  },
  {
    id: "mail-certificate",
    from: { name: "Lana Steiner", email: "lana.steiner@monsoonanalytics.in" },
    to: ["Nguyen Le Phong"],
    cc: ["Security Review"],
    subject: "Partner certificate rotation confirmation",
    body: "The partner has issued a new certificate for the mTLS channel. Their old certificate expires next Friday. Please confirm whether we can overlap both certificates during the cutover window.",
    receivedAt: "1h ago",
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["mTLS", "security"],
    attachments: [{ id: "partner-cert", name: "partner-cert.pem", size: "3 KB", kind: "cert" }]
  },
  {
    id: "mail-observability",
    from: { name: "Andi Lane", email: "andi.lane@ledgerloop.io" },
    to: ["Nguyen Le Phong"],
    subject: "PostHog anomaly review after mobile release",
    body: "The mobile release looks stable overall, but checkout conversion dipped for one tenant after 10 AM. Can you review the event path and see whether this is a tracking gap or a product regression?",
    receivedAt: "Yesterday",
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: true,
    labels: ["PostHog", "release"]
  },
  {
    id: "mail-draft-runbook",
    from: { name: "Nguyen Le Phong", email: "phongnguyen.itengineer@gmail.com" },
    to: ["Delivery Team"],
    subject: "Draft: production recovery checklist",
    body: "Drafting a shorter runbook for production recovery: identify changed release, verify health checks, inspect ingress and load balancer path, confirm database migration status, decide rollback or hotfix owner.",
    receivedAt: "Draft",
    folder: "drafts",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["runbook", "draft"]
  }
];

const studioConversations: StudioConversation[] = [
  {
    id: 1,
    group: "Pinned",
    name: "Olivia Rhye",
    subject: "Deployment pipeline failing on staging",
    preview: "502s started after the latest build. Rollback did not clear the readiness failure.",
    time: "Just now",
    isUnread: true,
    isOnline: true,
    unreadCount: 4,
    contact: {
      name: "Olivia Rhye",
      role: "Senior DevOps Engineer",
      company: "Railway Systems Inc.",
      email: "olivia.rhye@railway.co",
      phone: "+1 (415) 555-0123",
      website: "railway.co",
      location: "San Francisco, CA",
      timezone: "PDT (UTC-7)",
      status: "P0",
      qualifiedAt: "Mar 5, 2026",
      tags: ["DevOps", "Gateway", "Enterprise"]
    },
    messages: [
      { id: 101, side: "in", text: "We are seeing 502s on staging right after the latest build. Rollback finished, but health checks are still red.", time: "10 min ago" },
      { id: 102, side: "out", text: "Thanks, Olivia. I am checking deploy logs, service selectors, and the gateway routing config now.", time: "8 min ago" },
      { id: 103, side: "in", text: "API traffic looks fine. The web container keeps failing readiness probes.", time: "5 min ago" },
      { id: 104, side: "out", text: "Found a staging env mismatch on the web workload. I am applying the fix and will confirm once probes recover.", time: "3 min ago" }
    ]
  },
  {
    id: 2,
    group: "Pinned",
    name: "Phoenix Baker",
    subject: "Refund for order #8823 double charged",
    preview: "Payment retry created a duplicate transaction this morning.",
    time: "5m",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Phoenix Baker",
      role: "Operations Lead",
      company: "Meridian Retail Group",
      email: "phoenix.baker@meridianretail.com",
      phone: "+1 (312) 555-0184",
      website: "meridianretail.com",
      location: "Chicago, IL",
      timezone: "CDT (UTC-5)",
      status: "Partner",
      qualifiedAt: "Jan 18, 2026",
      tags: ["Billing", "Enterprise"]
    },
    messages: [
      { id: 201, side: "in", text: "I was charged twice for order #8823. One payment cleared on the 3rd and the duplicate posted this morning.", time: "5 min ago" },
      { id: 202, side: "out", text: "I can see both transactions. I am checking which one was attached to the invoice.", time: "4 min ago" },
      { id: 203, side: "out", text: "The duplicate was a retry from the old payment method. I started the refund and sent the receipt to billing.", time: "2 min ago" }
    ]
  },
  {
    id: 3,
    group: "Today",
    name: "Lana Steiner",
    subject: "Analytics dashboard 403 after role update",
    preview: "Exports work, but dashboard views reject the new custom role.",
    time: "8m",
    isUnread: true,
    isOnline: false,
    unreadCount: 2,
    contact: {
      name: "Lana Steiner",
      role: "Data Platform Lead",
      company: "Monsoon Analytics",
      email: "lana.steiner@monsoonanalytics.in",
      phone: "+91 98765 43210",
      website: "monsoonanalytics.in",
      location: "Bengaluru, India",
      timezone: "IST (UTC+5:30)",
      status: "Qualified",
      qualifiedAt: "Apr 2, 2026",
      tags: ["IAM", "Analytics", "High Value"]
    },
    messages: [
      { id: 301, side: "in", text: "I am getting a 403 on analytics dashboards since yesterday's role update. Clearing cache did not help.", time: "8 min ago" },
      { id: 302, side: "out", text: "I will compare your new role against the dashboard permission set.", time: "7 min ago" },
      { id: 303, side: "out", text: "Analytics Viewer was dropped from your custom role. I reattached it for the workspace.", time: "3 min ago" }
    ]
  },
  {
    id: 4,
    group: "Today",
    name: "Candice Wu",
    subject: "Bulk export times out near 60 percent",
    preview: "The full shipment history export hits a gateway timeout during peak.",
    time: "10:15 AM",
    isUnread: false,
    isOnline: false,
    unreadCount: 0,
    contact: {
      name: "Candice Wu",
      role: "Data Engineer",
      company: "Harbor Ops",
      email: "candice.wu@harborops.com",
      phone: "+1 (206) 555-0172",
      website: "harborops.com",
      location: "Seattle, WA",
      timezone: "PDT (UTC-7)",
      status: "Lead",
      qualifiedAt: "May 10, 2026",
      tags: ["Data", "Performance"]
    },
    messages: [
      { id: 401, side: "in", text: "The bulk export keeps timing out. It reaches about 60 percent and then throws a gateway error.", time: "10:15 AM" },
      { id: 402, side: "out", text: "I will queue it as an async export and email the download link once it finishes.", time: "10:12 AM" }
    ]
  },
  {
    id: 5,
    group: "Yesterday",
    name: "Drew Cano",
    subject: "Onboarding docs for new backend hire",
    preview: "Need repo access, staging credentials, and branch naming rules.",
    time: "Yesterday",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Drew Cano",
      role: "Engineering Manager",
      company: "AtlasWorks",
      email: "drew.cano@atlasworks.co",
      phone: "+1 (512) 555-0166",
      website: "atlasworks.co",
      location: "Austin, TX",
      timezone: "CDT (UTC-5)",
      status: "Partner",
      qualifiedAt: "Aug 3, 2025",
      tags: ["Onboarding", "Platform"]
    },
    messages: [
      { id: 501, side: "in", text: "We have a backend developer starting Monday. What is the best onboarding path for repo access and environment setup?", time: "Yesterday" },
      { id: 502, side: "out", text: "I will send the standard engineering checklist with staging access and repository conventions.", time: "Yesterday" }
    ]
  }
];

const workstreamRows = [
  {
    name: "Gateway rollout guardrails",
    id: "REL-204",
    status: "Healthy",
    billing: "Ready",
    plan: "Platform",
    joined: "20th June 2026",
    time: "at 09:40 AM",
    billingTone: "paid"
  },
  {
    name: "Partner mTLS certificate overlap",
    id: "SEC-118",
    status: "Watching",
    billing: "Review",
    plan: "Security",
    joined: "20th June 2026",
    time: "at 08:15 AM",
    billingTone: "pending"
  },
  {
    name: "Feature flag tenant expansion",
    id: "FF-089",
    status: "Healthy",
    billing: "Ready",
    plan: "Rollout",
    joined: "19th June 2026",
    time: "at 05:35 PM",
    billingTone: "paid"
  },
  {
    name: "Bulk export async worker",
    id: "PERF-047",
    status: "Blocked",
    billing: "Risk",
    plan: "Backend",
    joined: "19th June 2026",
    time: "at 02:12 PM",
    billingTone: "unpaid"
  },
  {
    name: "PostHog release anomaly review",
    id: "OBS-066",
    status: "Queued",
    billing: "Next",
    plan: "Observability",
    joined: "18th June 2026",
    time: "at 11:08 AM",
    billingTone: "pending"
  }
];

const dashboardKpis = [
  { title: "Runtime Flags", value: "38", description: "Rules across 30+ tenants", tone: "success" },
  { title: "Deploy Train", value: "12", description: "Services released this week", tone: "neutral" },
  { title: "Load Path", value: "4", description: "Ingress and LB checks watched", tone: "warning" },
  { title: "Runbooks", value: "9", description: "Recovery paths kept current", tone: "success" }
];

const aiWorkflowSteps = [
  {
    title: "Context intake",
    detail: "Collect repo state, goal, constraints, and acceptance checks before I ask an agent to work.",
    state: "ready"
  },
  {
    title: "Agent run",
    detail: "Use Codex or another focused agent for one bounded implementation path at a time.",
    state: "active"
  },
  {
    title: "Verification",
    detail: "Run typecheck, route tests, visual audit, and deploy checks before calling work done.",
    state: "required"
  },
  {
    title: "Knowledge capture",
    detail: "Store useful commands, MCP setup, and failure notes back into this Studio.",
    state: "next"
  }
];

const aiRuntimeTargets = ["Codex", "Claude", "Antigravity", "Gemini"];

const releaseChecklist = [
  { title: "Verify feature flag default fallback", tag: "Rollout", done: true },
  { title: "Check ingress and load balancer route parity", tag: "Infra", done: true },
  { title: "Review PostHog adoption and anomaly window", tag: "Observability", done: false },
  { title: "Confirm rollback owner and cutover criteria", tag: "Release", done: false }
];

const componentInventory = [
  "Sidebar",
  "Topbar",
  "Metric cards",
  "Tabs",
  "Selects",
  "Buttons",
  "Badges",
  "Tables",
  "Charts",
  "Timeline",
  "Command palette",
  "Shadow island"
];

const distributionSegments = [
  { label: "Feature flags", value: 38, color: "#171717" },
  { label: "API contracts", value: 24, color: "#525252" },
  { label: "Infra checks", value: 18, color: "#a3a3a3" },
  { label: "Runbooks", value: 20, color: "#d4d4d4" }
];

const rolloutPulseMap = new Map([
  [0, 44],
  [6, 28],
  [11, 52],
  [15, 38],
  [23, 26],
  [30, 50],
  [36, 36],
  [45, 62],
  [53, 34],
  [60, 45],
  [66, 31],
  [73, 54],
  [79, 39],
  [86, 30]
]);

const releaseSignalChartData = Array.from({ length: 89 }, (_, index) => {
  const date = new Date(2026, 2, 24);
  date.setDate(date.getDate() + index);

  const baseline = 38 + ((index * 13) % 22) + Math.round(Math.sin(index * 0.62) * 6);
  const pulse = rolloutPulseMap.get(index) ?? 0;

  return {
    date: formatDateKey(date),
    rolloutVolume: Math.min(124, Math.max(24, baseline + pulse)),
    platformHealth: 64 + Math.round(Math.sin(index * 0.22) * 2) + (index % 11 === 0 ? 1 : 0),
    incidentNoise: 56 + Math.round(Math.cos(index * 0.18) * 2) - (index % 17 === 0 ? 1 : 0)
  };
});

const releaseSignalSeries = [
  { key: "platformHealth", label: "Platform health", color: "#525252" },
  { key: "rolloutVolume", label: "Rollout volume", color: "#d4d4d4" },
  { key: "incidentNoise", label: "Incident noise", color: "#171717" }
] as const;

type ReleaseSignalSeriesKey = (typeof releaseSignalSeries)[number]["key"];

const flatRouteResults = navGroups.flatMap((group) =>
  group.items.flatMap((item) => {
    if (item.subItems) return item.subItems.filter((subItem) => subItem.routeId);
    return item.routeId ? [item] : [];
  })
);
const visibleRouteIds = new Set(
  flatRouteResults
    .map((item) => item.routeId)
    .filter((routeId): routeId is StudioRouteId => Boolean(routeId))
);

function routeHref(routeId: StudioRouteId): string {
  return `#${routeId}`;
}

function normalizeHash(hash: string): StudioRouteId {
  const candidate = hash.replace(/^#\/?/, "");
  return candidate in routeDefinitions && visibleRouteIds.has(candidate as StudioRouteId)
    ? (candidate as StudioRouteId)
    : DEFAULT_ROUTE;
}

function profileHref(locale: string, href: string): string {
  if (href.startsWith("http") || href.endsWith(".pdf")) return href;
  const prefix = locale ? `/${locale}` : "";
  if (href === APP_ROUTE.HOME) return prefix || APP_ROUTE.HOME;
  if (href.startsWith("/#")) return `${prefix}${href}`;
  if (href.startsWith("/")) return `${prefix}${href}`;
  return href;
}

function isItemActive(item: StudioNavItem, activeRoute: StudioRouteId): boolean {
  if (item.routeId === activeRoute) return true;
  return item.subItems?.some((subItem) => subItem.routeId === activeRoute) ?? false;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseChartDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatChartTick(value: string): string {
  return parseChartDate(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatChartTooltipLabel(value: string): string {
  return parseChartDate(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusText(status: StudioNote["status"]): string {
  if (status === "ready") return "Ready";
  if (status === "draft") return "Draft";
  return "Next";
}

function roadmapStatusText(status: BlogRoadmapStatus): string {
  if (status === "ready") return "Ready";
  if (status === "outline") return "Outline";
  return "Research";
}

function skillCategoryLabel(category: StudioAiSkill["category"] | "all"): string {
  if (category === "all") return "All";
  if (category === "engineering") return "Engineering";
  if (category === "content") return "Content";
  if (category === "operations") return "Operations";
  return "Communication";
}

function renderChecklistStepMarkdown(step: StudioChecklistStep, depth = 0): string {
  const indent = "  ".repeat(depth);
  const detail = step.detail ? ` - ${step.detail}` : "";
  const children = step.children?.length
    ? `\n${step.children.map((child) => renderChecklistStepMarkdown(child, depth + 1)).join("\n")}`
    : "";
  return `${indent}- [ ] ${step.label}${detail}${children}`;
}

function renderChecklistMarkdown(checklist: StudioWorkflowChecklist): string {
  return [
    `# ${checklist.title}`,
    "",
    checklist.summary,
    "",
    `Use when: ${checklist.whenToUse}`,
    "",
    ...checklist.sections.flatMap((section) => [
      `## ${section.title}`,
      section.detail,
      "",
      ...section.steps.map((step) => renderChecklistStepMarkdown(step)),
      ""
    ])
  ].join("\n").trim();
}

function countChecklistSteps(steps: StudioChecklistStep[]): number {
  return steps.reduce((total, step) => total + 1 + countChecklistSteps(step.children ?? []), 0);
}

function MetricCard({ item }: { item: StudioMetric }) {
  const Icon = item.icon;

  return (
    <article className="metric-card" data-slot="card">
      <div className="metric-icon" aria-hidden="true">
        <Icon />
      </div>
      <p>{item.label}</p>
      <div className="metric-value-row">
        <strong>{item.value}</strong>
        <span className={`trend-badge trend-${item.trend}`}>
          <LuLineChart aria-hidden="true" />
          {item.badge}
        </span>
      </div>
      <span className="metric-helper">{item.helper}</span>
    </article>
  );
}

type StudioTooltipPayload = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
};

function StudioChartTooltip({
  active,
  label,
  payload
}: {
  active?: boolean;
  label?: string | number;
  payload?: StudioTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="studio-chart-tooltip">
      <strong>{typeof label === "string" ? formatChartTooltipLabel(label) : label}</strong>
      <div>
        {payload.map((item) => {
          const series = releaseSignalSeries.find((entry) => entry.key === item.dataKey);
          if (!series || item.value == null) return null;

          return (
            <span key={series.key}>
              <i style={{ background: series.color }} />
              <em>{series.label}</em>
              <b>{Number(item.value).toLocaleString("en-US")}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function DeliverySignalChart() {
  const [activeSeries, setActiveSeries] = useState<ReleaseSignalSeriesKey | "all">("all");
  const isDimmed = (key: ReleaseSignalSeriesKey) => activeSeries !== "all" && activeSeries !== key;

  return (
    <div className="studio-chart-shell">
      <div className="chart-legend interactive" aria-label="Release signal series">
        {releaseSignalSeries.map((series) => (
          <button
            key={series.key}
            type="button"
            className={activeSeries === series.key ? "is-active" : undefined}
            onBlur={() => setActiveSeries("all")}
            onClick={() => setActiveSeries((current) => (current === series.key ? "all" : series.key))}
            onFocus={() => setActiveSeries(series.key)}
            onMouseEnter={() => setActiveSeries(series.key)}
            onMouseLeave={() => setActiveSeries("all")}
          >
            <i style={{ background: series.color }} />
            {series.label}
          </button>
        ))}
      </div>
      <div className="studio-chart" role="img" aria-label="Release volume, platform health, and incident noise chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height: 320 }}>
          <ComposedChart data={releaseSignalChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="studioFillRolloutVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4d4d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#d4d4d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e5e5e5" strokeOpacity={0.72} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={42}
              tickFormatter={formatChartTick}
            />
            <YAxis hide domain={[0, 128]} />
            <Tooltip cursor={false} content={<StudioChartTooltip />} />
            <Area
              dataKey="rolloutVolume"
              type="natural"
              fill="url(#studioFillRolloutVolume)"
              stroke="#d4d4d4"
              strokeWidth={1.35}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              fillOpacity={isDimmed("rolloutVolume") ? 0.28 : 1}
              opacity={isDimmed("rolloutVolume") ? 0.35 : 1}
              isAnimationActive
              animationDuration={850}
            />
            <Line
              dataKey="platformHealth"
              type="natural"
              stroke="#525252"
              strokeWidth={1.55}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              opacity={isDimmed("platformHealth") ? 0.25 : 1}
              isAnimationActive
              animationDuration={900}
            />
            <Line
              dataKey="incidentNoise"
              type="natural"
              stroke="#171717"
              strokeWidth={1.35}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              opacity={isDimmed("incidentNoise") ? 0.25 : 1}
              isAnimationActive
              animationDuration={950}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SidebarGroup({
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
                  onClick={() => onToggle(item.id)}
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

function RouteHeading({ route, children }: { route: StudioRoute; children?: React.ReactNode }) {
  const Icon = route.icon;
  return (
    <div className="route-heading">
      <div>
        <div className="route-kicker">
          <Icon aria-hidden="true" />
          <span>{route.kind === "legacy" ? "Legacy" : "Studio route"}</span>
        </div>
        <h1>{route.title}</h1>
        <p>{route.description}</p>
      </div>
      {children}
    </div>
  );
}

function RouteMetricGrid({ metrics }: { metrics: StudioMetric[] }) {
  return (
    <section className="metric-grid" aria-label="Route metrics">
      {metrics.map((item) => (
        <MetricCard key={item.label} item={item} />
      ))}
    </section>
  );
}

function TimelineCard({ route }: { route: StudioRoute }) {
  return (
    <section className="card route-panel" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Activity</h2>
          <p>Recent events from this Studio view.</p>
        </div>
      </header>
      <div className="timeline-list">
        {route.timeline.map((item, index) => (
          <div className="timeline-item" key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelsCard({ route }: { route: StudioRoute }) {
  return (
    <section className="card route-panel" data-slot="card">
      <header className="card-header">
        <div>
          <h2>{route.title} modules</h2>
          <p>Route-specific sections are mounted without leaving `/studio`.</p>
        </div>
      </header>
      <div className="module-grid">
        {route.panels.map((panel) => (
          <article className="module-card" key={panel}>
            <strong>{panel}</strong>
            <span>Active</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardKpiStrip() {
  return (
    <section className="ops-kpi-strip" aria-label="Studio component metrics">
      {dashboardKpis.map((item) => (
        <article className={`ops-kpi-card tone-${item.tone}`} key={item.title}>
          <span>{item.title}</span>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </section>
  );
}

function ComponentInventoryCard() {
  return (
    <section className="card route-panel component-inventory" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Component Inventory</h2>
          <p>Static frontend primitives currently represented inside this Studio shell.</p>
        </div>
      </header>
      <div className="component-token-grid">
        {componentInventory.map((item) => (
          <span className="component-token" key={item}>{item}</span>
        ))}
      </div>
      <div className="component-samples" aria-label="Component samples">
        <button type="button" className="outline-button">Outline</button>
        <button type="button" className="primary-icon" aria-label="Send sample"><LuSend aria-hidden="true" /></button>
        <span className="soft-pill">Badge</span>
        <label className="check-row">
          <input type="checkbox" defaultChecked />
          <span>Checkbox</span>
        </label>
      </div>
    </section>
  );
}

function DistributionCard() {
  const gradient = distributionSegments.reduce<{ cursor: number; stops: string[] }>(
    (accumulator, segment) => {
      const start = accumulator.cursor;
      const end = start + segment.value * 3.6;
      return {
        cursor: end,
        stops: [...accumulator.stops, `${segment.color} ${start}deg ${end}deg`]
      };
    },
    { cursor: 0, stops: [] }
  ).stops.join(", ");
  const donutStyle = { background: `conic-gradient(${gradient})` } satisfies CSSProperties;

  return (
    <section className="card route-panel distribution-card" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Control Surface</h2>
          <p>Coverage by operational control type.</p>
        </div>
      </header>
      <div className="distribution-layout">
        <div className="donut-chart" style={donutStyle} aria-label="Control surface distribution">
          <span>100%</span>
        </div>
        <div className="distribution-list">
          {distributionSegments.map((segment) => (
            <div key={segment.label}>
              <span style={{ background: segment.color }} aria-hidden="true" />
              <p>{segment.label}</p>
              <strong>{segment.value}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReleaseChecklistCard() {
  return (
    <section className="card route-panel checklist-panel" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Release Checklist</h2>
          <p>Frontend-only stateful checklist for deployment readiness.</p>
        </div>
      </header>
      <div className="task-list">
        {releaseChecklist.map((task) => (
          <label key={task.title} className="check-row checklist-row">
            <input type="checkbox" defaultChecked={task.done} />
            <span>
              <strong>{task.title}</strong>
              <small>{task.tag}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

function DashboardRoutePage({ route }: { route: StudioRoute }) {
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <div className="route-actions">
          <button type="button" className="outline-button">
            <LuRotateCw aria-hidden="true" />
            Refresh
          </button>
          <button type="button" className="outline-button">
            <LuDownload aria-hidden="true" />
            Export
          </button>
        </div>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="route-grid">
        <section className="card activity-card route-wide-card" data-slot="card">
          <header className="card-header activity-header">
            <div>
              <h2>{route.panels[0]}</h2>
              <p>{route.description}</p>
            </div>
            <div className="card-actions">
              <button type="button" className="select-button">
                Overview
                <LuChevronDown aria-hidden="true" />
              </button>
              <button type="button" className="outline-button">View report</button>
            </div>
          </header>
          <DeliverySignalChart />
        </section>
        <TimelineCard route={route} />
        <PanelsCard route={route} />
      </div>
    </section>
  );
}

function FinanceLikePage({ route }: { route: StudioRoute }) {
  const [tab, setTab] = useState("dashboard");
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <div className="route-actions">
          <button type="button" className="outline-button">
            <LuSettings aria-hidden="true" />
            Settings
          </button>
          <button type="button" className="outline-button">
            <LuDownload aria-hidden="true" />
            Export
          </button>
        </div>
      </RouteHeading>
      <div className="tabs-row" role="tablist" aria-label={`${route.title} tabs`}>
        {["dashboard", "accounts", "transactions"].map((item) => (
          <button key={item} type="button" className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>
            {item === "dashboard" ? "Dashboard" : item === "accounts" ? "Accounts" : "Transactions"}
          </button>
        ))}
      </div>
      {tab === "dashboard" ? (
        <>
          <RouteMetricGrid metrics={route.metrics} />
          <div className="route-grid">
            <PanelsCard route={route} />
            <TimelineCard route={route} />
          </div>
        </>
      ) : (
        <section className="empty-route card">
          <LuCreditCard aria-hidden="true" />
          <strong>{tab === "accounts" ? "Accounts view" : "Transactions view"}</strong>
          <p>This tab is mounted and switchable, keeping the Studio shell state intact.</p>
        </section>
      )}
    </section>
  );
}

function AnalyticsPage({ route }: { route: StudioRoute }) {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "audience", "acquisition", "engagement", "conversions"];
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuSlidersHorizontal aria-hidden="true" />
          Filters
        </button>
      </RouteHeading>
      <div className="tabs-row tabs-wrap" role="tablist" aria-label="Analytics tabs">
        {tabs.map((item) => (
          <button key={item} type="button" className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <>
          <RouteMetricGrid metrics={route.metrics} />
          <div className="route-grid">
            <section className="card activity-card route-wide-card" data-slot="card">
              <header className="card-header activity-header">
                <div>
                  <h2>Traffic Quality</h2>
                  <p>{route.description}</p>
                </div>
                <button type="button" className="outline-button">View report</button>
              </header>
              <DeliverySignalChart />
            </section>
            <TimelineCard route={route} />
            <PanelsCard route={route} />
          </div>
        </>
      ) : (
        <section className="empty-route card">
          <LuGauge aria-hidden="true" />
          <strong>{tab[0].toUpperCase() + tab.slice(1)} view</strong>
          <p>The tab changes without a reload, keeping the Studio shell state intact.</p>
        </section>
      )}
    </section>
  );
}

function ProductivityPage({ route }: { route: StudioRoute }) {
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuListTodo aria-hidden="true" />
          New task
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="productivity-layout">
        <PanelsCard route={route} />
        <section className="card route-panel">
          <h2>Today</h2>
          <div className="task-list">
            {["Review dashboard shell", "Validate route behavior", "Ship PR update"].map((task) => (
              <label key={task} className="check-row">
                <input type="checkbox" />
                <span>{task}</span>
              </label>
            ))}
          </div>
        </section>
        <TimelineCard route={route} />
      </div>
    </section>
  );
}

function CommerceAcademyPage({ route }: { route: StudioRoute }) {
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <div className="route-actions">
          <button type="button" className="outline-button">
            <LuSettings aria-hidden="true" />
            Options
          </button>
          <button type="button" className="outline-button">
            <LuDownload aria-hidden="true" />
            Export
          </button>
        </div>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="route-grid">
        <PanelsCard route={route} />
        <TimelineCard route={route} />
      </div>
    </section>
  );
}

function MailRoutePage({ route }: { route: StudioRoute }) {
  const [selectedMailId, setSelectedMailId] = useState(studioMails[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const selectedMail = studioMails.find((mail) => mail.id === selectedMailId) ?? studioMails[0];
  const filteredMails = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return studioMails;
    return studioMails.filter((mail) =>
      [mail.from.name, mail.from.email, mail.subject, mail.body, ...mail.labels].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query]);
  const mailGroups = [
    { id: "pinned", title: "Pinned", items: filteredMails.filter((mail) => mail.isPinned) },
    { id: "inbox", title: "Inbox", items: filteredMails.filter((mail) => !mail.isPinned && mail.folder === "inbox") },
    { id: "drafts", title: "Drafts", items: filteredMails.filter((mail) => mail.folder === "drafts") }
  ].filter((group) => group.items.length > 0);

  return (
    <section className="route-page mail-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <a className="outline-button" href="mailto:phongnguyen.itengineer@gmail.com">
            <LuMail aria-hidden="true" />
            Compose
          </a>
          <button type="button" className="outline-button">
            <LuArchive aria-hidden="true" />
            Archive
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="mail-workbench card" data-studio-module="mail">
        <aside className="mail-list-pane" aria-label="Mail inbox">
          <div className="mail-pane-toolbar">
            <div>
              <h2>Inbox</h2>
              <p>{filteredMails.length} messages</p>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Filter mail"><LuFilter aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Refresh mail"><LuRotateCw aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="More mail actions"><LuMoreVertical aria-hidden="true" /></button>
            </div>
          </div>

          <label className="studio-search-field">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search mail</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mail..." />
          </label>

          <div className="mail-groups">
            {mailGroups.map((group) => (
              <section className="mail-group" key={group.id}>
                <p className="mail-group-title">{group.title} ({group.items.length})</p>
                <div className="mail-row-list">
                  {group.items.map((mail) => (
                    <button
                      key={mail.id}
                      type="button"
                      className={`mail-row${mail.id === selectedMail.id ? " is-active" : ""}${!mail.isRead ? " is-unread" : ""}`}
                      onClick={() => setSelectedMailId(mail.id)}
                    >
                      <span className="mail-avatar" aria-hidden="true">{getInitials(mail.from.name)}</span>
                      <span className="mail-row-body">
                        <span className="mail-row-top">
                          <strong>{mail.from.name}</strong>
                          <small>{mail.receivedAt}</small>
                        </span>
                        <span className="mail-row-subject">
                          {mail.subject}
                          {!mail.isRead && <i aria-label="Unread message" />}
                        </span>
                        <span className="mail-row-preview">{mail.body}</span>
                        <span className="mail-labels" aria-label="Mail labels">
                          {mail.isPinned && <span><LuPin aria-hidden="true" />Pinned</span>}
                          {mail.labels.slice(0, 2).map((label) => <span key={label}>{label}</span>)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <article className="mail-detail-pane" aria-label="Selected email">
          <div className="mail-detail-toolbar">
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Close message"><LuX aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Previous message"><LuArrowLeft aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Next message"><LuChevronRight aria-hidden="true" /></button>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Pin thread"><LuPin aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Archive message"><LuArchive aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Reply"><LuReply aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="More actions"><LuMoreVertical aria-hidden="true" /></button>
            </div>
          </div>

          <div className="mail-message-head">
            <div>
              <h2>{selectedMail.subject}</h2>
              <p>{selectedMail.receivedAt}</p>
            </div>
            {selectedMail.isPriority && <span className="priority-pill"><LuFlag aria-hidden="true" />Priority</span>}
          </div>

          <div className="mail-recipient-row">
            <span className="mail-avatar" aria-hidden="true">{getInitials(selectedMail.from.name)}</span>
            <div>
              <strong>{selectedMail.from.name}</strong>
              <p>{selectedMail.from.email}</p>
              <small>To: {selectedMail.to.join(", ")}{selectedMail.cc?.length ? `; Cc: ${selectedMail.cc.join(", ")}` : ""}</small>
            </div>
          </div>

          {selectedMail.attachments?.length ? (
            <div className="attachment-list" aria-label="Attachments">
              <strong>Attachments ({selectedMail.attachments.length})</strong>
              <div>
                {selectedMail.attachments.map((attachment) => (
                  <button type="button" className="attachment-pill" key={attachment.id}>
                    <LuPaperclip aria-hidden="true" />
                    <span>{attachment.name}</span>
                    <small>{attachment.size}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mail-body">{selectedMail.body}</p>

          <div className="composer-box">
            <div className="composer-input">
              <LuReply aria-hidden="true" />
              <input placeholder={`Reply ${selectedMail.from.name}...`} />
            </div>
            <div className="composer-actions">
              <button type="button" className="icon-ghost" aria-label="Reply all"><LuReplyAll aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Forward"><LuForward aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Add emoji"><LuSmile aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Attach file"><LuPaperclip aria-hidden="true" /></button>
              <button type="button" className="primary-icon" aria-label="Send reply"><LuSend aria-hidden="true" /></button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ChatRoutePage({ route }: { route: StudioRoute }) {
  const [selectedConversationId, setSelectedConversationId] = useState(studioConversations[0]?.id ?? 0);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "snoozed" | "closed">("all");
  const [profileOpen, setProfileOpen] = useState(true);
  const activeConversation = studioConversations.find((conversation) => conversation.id === selectedConversationId) ?? studioConversations[0];
  const groupedConversations = studioConversations.reduce<Array<{ group: StudioConversation["group"]; items: StudioConversation[] }>>((groups, conversation) => {
    const group = groups.find((item) => item.group === conversation.group);
    if (group) group.items.push(conversation);
    else groups.push({ group: conversation.group, items: [conversation] });
    return groups;
  }, []);

  return (
    <section className="route-page chat-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <button type="button" className="outline-button"><LuMessageSquare aria-hidden="true" />New thread</button>
          <button type="button" className="outline-button" onClick={() => setProfileOpen((value) => !value)}>
            <LuUser aria-hidden="true" />
            Profile
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className={`chat-workbench card${profileOpen ? " has-profile" : ""}`} data-studio-module="chat">
        <aside className="chat-list-pane" aria-label="Chat conversations">
          <div className="mail-pane-toolbar">
            <div>
              <h2>Inbox</h2>
              <p>24 open conversations</p>
            </div>
            <button type="button" className="icon-ghost" aria-label="Filter conversations"><LuFilter aria-hidden="true" /></button>
          </div>

          <div className="chat-tabs" role="tablist" aria-label="Conversation states">
            {(["all", "open", "snoozed", "closed"] as const).map((tab) => (
              <button key={tab} type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <div className="chat-groups">
            {groupedConversations.map((group) => (
              <section className="chat-group" key={group.group}>
                <p className="mail-group-title">{group.group}</p>
                {group.items.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`chat-row${conversation.id === activeConversation.id ? " is-active" : ""}`}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <span className="chat-avatar" aria-hidden="true">
                      {getInitials(conversation.name)}
                      {conversation.isOnline && <i />}
                    </span>
                    <span className="chat-row-body">
                      <span className="mail-row-top"><strong>{conversation.name}</strong><small>{conversation.time}</small></span>
                      <span className="mail-row-subject">{conversation.subject}</span>
                      <span className="mail-row-preview">{conversation.preview}</span>
                    </span>
                    {conversation.isUnread && <span className="unread-count">{conversation.unreadCount}</span>}
                  </button>
                ))}
              </section>
            ))}
          </div>
        </aside>

        <article className="chat-thread-pane" aria-label="Active chat thread">
          <div className="chat-thread-head">
            <div className="chat-contact-summary">
              <span className="chat-avatar is-large" aria-hidden="true">
                {getInitials(activeConversation.contact.name)}
                {activeConversation.isOnline && <i />}
              </span>
              <div>
                <h2>{activeConversation.contact.name}</h2>
                <p>{activeConversation.contact.role}</p>
              </div>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Call"><LuPhoneCall aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Tag"><LuTag aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Snooze"><LuAlarmClock aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="View profile" onClick={() => setProfileOpen(true)}><LuUser aria-hidden="true" /></button>
            </div>
          </div>

          <div className="thread-date-divider"><span>May 6, 2026</span></div>

          <div className="message-list">
            {activeConversation.messages.map((message) => {
              const isOutbound = message.side === "out";
              return (
                <div key={message.id} className={`message-row${isOutbound ? " is-outbound" : ""}`}>
                  <span className="chat-avatar" aria-hidden="true">{getInitials(isOutbound ? "Nguyen Le Phong" : activeConversation.contact.name)}</span>
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <small>{message.time}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chat-composer">
            <div className="chat-composer-tabs">
              <button type="button" className="is-active">Reply</button>
              <button type="button">Internal note</button>
            </div>
            <textarea placeholder="Type your message..." aria-label="Type your message" />
            <div className="composer-actions">
              <button type="button" className="icon-ghost" aria-label="Format"><LuType aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Emoji"><LuSmile aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Attach file"><LuPaperclip aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Insert link"><LuLink aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="AI assist"><LuSparkles aria-hidden="true" /></button>
              <button type="button" className="primary-icon" aria-label="Send message"><LuSend aria-hidden="true" /></button>
            </div>
          </div>
        </article>

        {profileOpen && (
          <aside className="chat-profile-pane" aria-label="Contact profile">
            <div className="profile-head">
              <span className="chat-avatar is-large" aria-hidden="true">{getInitials(activeConversation.contact.name)}</span>
              <div>
                <h2>{activeConversation.contact.name}</h2>
                <p>{activeConversation.contact.role}</p>
              </div>
              <button type="button" className="icon-ghost" aria-label="Close profile" onClick={() => setProfileOpen(false)}><LuX aria-hidden="true" /></button>
            </div>
            <div className="profile-actions">
              <button type="button" className="icon-ghost" aria-label="Email"><LuMail aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Call"><LuPhoneCall aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Copy link"><LuCopy aria-hidden="true" /></button>
            </div>
            <div className="profile-tabs" role="tablist" aria-label="Profile tabs">
              <button type="button" className="is-active">Details</button>
              <button type="button">Files</button>
              <button type="button">Activity</button>
            </div>
            <div className="profile-detail-list">
              {[
                [LuMail, "Email", activeConversation.contact.email],
                [LuPhone, "Phone", activeConversation.contact.phone],
                [LuGlobe, "Website", activeConversation.contact.website],
                [LuBriefcase, "Company", activeConversation.contact.company],
                [LuCheckCircle2, "Stage", activeConversation.contact.status],
                [LuMonitor, "Timezone", activeConversation.contact.timezone],
                [LuMapPin, "Location", activeConversation.contact.location]
              ].map(([Icon, label, value]) => {
                const DetailIcon = Icon as IconType;
                return (
                  <div className="profile-detail-row" key={label as string}>
                    <DetailIcon aria-hidden="true" />
                    <span>{label as string}</span>
                    <strong>{value as string}</strong>
                  </div>
                );
              })}
            </div>
            <div className="profile-tags" aria-label="Contact tags">
              {activeConversation.contact.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

function AiAgentSetupPage({ route, locale }: { route: StudioRoute; locale: string }) {
  const setupFolder = studioFolders.find((folder) => folder.id === "machine-bootstrap");
  const setupGroups = setupFolder?.groups ?? [];
  const setupNoteIds = new Set(setupGroups.flatMap((group) => group.noteIds));
  const setupNotes = studioNotes.filter((note) => setupNoteIds.has(note.id));
  const initialNoteId = setupNotes.some((note) => note.id === defaultStudioNoteId)
    ? defaultStudioNoteId
    : setupNotes[0]?.id ?? defaultStudioNoteId;
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const selectedNote = setupNotes.find((note) => note.id === selectedNoteId) ?? setupNotes[0] ?? studioNotes[0];
  const workflowFolder = studioFolders.find((folder) => folder.id === "ai-learning");
  const workflowNoteIds = new Set(workflowFolder?.groups.flatMap((group) => group.noteIds) ?? []);
  const workflowNotes = studioNotes.filter((note) => workflowNoteIds.has(note.id));

  return (
    <section className="route-page ai-setup-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          {primaryProfileActions.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                className="outline-button"
                href={profileHref(locale, item.href)}
                onClick={() => {
                  track("studio_profile_nav_click", {
                    target: item.id,
                    source: "route_actions",
                    external: Boolean(item.external)
                  });
                }}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
          <button type="button" className="outline-button">
            <LuPlusCircle aria-hidden="true" />
            Add note
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="ai-setup-container card" data-studio-module="ai-agent-setup">
        <aside className="ai-setup-index" aria-label="AI setup notes">
          <div className="ai-pane-head">
            <span><LuSparkles aria-hidden="true" /></span>
            <div>
              <h2>{setupFolder?.label ?? "Setup library"}</h2>
              <p>{setupFolder?.subtitle ?? "Agent setup notes"}</p>
            </div>
          </div>

          <div className="ai-runtime-strip" aria-label="Agent runtimes">
            {aiRuntimeTargets.map((target) => (
              <span key={target}>{target}</span>
            ))}
          </div>

          <div className="ai-setup-groups">
            {setupGroups.map((group) => (
              <section key={group.label} className="ai-setup-group">
                <p>{group.label}</p>
                <div>
                  {group.noteIds.map((noteId) => {
                    const note = studioNotes.find((item) => item.id === noteId);
                    if (!note) return null;

                    return (
                      <button
                        key={note.id}
                        type="button"
                        className={`ai-note-button${selectedNote.id === note.id ? " is-active" : ""}`}
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        <span>
                          <strong>{note.title}</strong>
                          <small>{note.subtitle}</small>
                        </span>
                        <em>{statusText(note.status)}</em>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <article className="ai-setup-reader" aria-label="Selected AI setup note">
          <div className="ai-reader-head">
            <div>
              <span className={`ai-status-pill status-${selectedNote.status}`}>{statusText(selectedNote.status)}</span>
              <h2>{selectedNote.title}</h2>
              <p>{selectedNote.summary}</p>
            </div>
            <small>Updated {selectedNote.updatedAt}</small>
          </div>

          <div className="ai-tag-list" aria-label="Setup note tags">
            {selectedNote.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="ai-section-list">
            {selectedNote.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

          {selectedNote.commands?.length ? (
            <section className="ai-command-panel" aria-label="Setup commands">
              <div className="ai-panel-title">
                <LuCommand aria-hidden="true" />
                <div>
                  <h3>Command runbook</h3>
                  <p>Commands to verify before using them on a new machine.</p>
                </div>
              </div>
              <div className="ai-command-list">
                {selectedNote.commands.map((command) => (
                  <article className="ai-command-card" key={`${command.label}-${command.command}`}>
                    <span>{command.label}</span>
                    <code>{command.command}</code>
                    {command.note && <p>{command.note}</p>}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {selectedNote.links?.length ? (
            <section className="ai-link-grid" aria-label="Reference links">
              {selectedNote.links.map((link) => (
                <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
                  <strong>{link.label}</strong>
                  {link.note && <span>{link.note}</span>}
                </a>
              ))}
            </section>
          ) : null}
        </article>

        <aside className="ai-workflow-rail" aria-label="AI workflow setup">
          <div className="ai-pane-head">
            <span><LuWaves aria-hidden="true" /></span>
            <div>
              <h2>AI workflow</h2>
              <p>First container for research and operating notes.</p>
            </div>
          </div>

          <div className="ai-workflow-steps">
            {aiWorkflowSteps.map((step, index) => (
              <article key={step.title} className={`ai-workflow-step state-${step.state}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <section className="ai-checklist-panel">
            <h3>Setup checklist</h3>
            <div>
              {selectedNote.checklist?.map((item) => (
                <label className="check-row checklist-row" key={item.label}>
                  <input type="checkbox" defaultChecked={item.checked} />
                  <span>
                    <strong>{item.label}</strong>
                    {item.detail && <small>{item.detail}</small>}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="ai-research-queue">
            <h3>Research queue</h3>
            {workflowNotes.map((note) => (
              <article key={note.id}>
                <strong>{note.title}</strong>
                <p>{note.subtitle}</p>
              </article>
            ))}
          </section>
        </aside>
      </div>
    </section>
  );
}

function AiSkillsPage({ route }: { route: StudioRoute }) {
  const [selectedSkillId, setSelectedSkillId] = useState(studioAiSkills[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<StudioAiSkill["category"] | "all">("all");
  const [copiedSkillId, setCopiedSkillId] = useState<string | null>(null);
  const visibleSkills = studioAiSkills.filter((skill) => categoryFilter === "all" || skill.category === categoryFilter);
  const selectedSkill = studioAiSkills.find((skill) => skill.id === selectedSkillId) ?? visibleSkills[0] ?? studioAiSkills[0];
  const categories: Array<StudioAiSkill["category"] | "all"> = ["all", "engineering", "content", "operations", "communication"];

  const handleCategoryFilter = (category: StudioAiSkill["category"] | "all") => {
    const nextVisibleSkills = studioAiSkills.filter((skill) => category === "all" || skill.category === category);
    setCategoryFilter(category);
    if (!nextVisibleSkills.some((skill) => skill.id === selectedSkillId)) {
      setSelectedSkillId(nextVisibleSkills[0]?.id ?? selectedSkillId);
    }
    track("studio_ai_skill_filter", {
      category,
      result_count: nextVisibleSkills.length
    });
  };

  const handleSkillSelect = (skill: StudioAiSkill) => {
    setSelectedSkillId(skill.id);
    track("studio_ai_skill_select", {
      skill_id: skill.id,
      category: skill.category
    });
  };

  const copySkill = async () => {
    if (!selectedSkill) return;

    try {
      await navigator.clipboard.writeText(selectedSkill.markdown);
      setCopiedSkillId(selectedSkill.id);
      window.setTimeout(() => setCopiedSkillId(null), 1600);
      track("studio_ai_skill_copy", {
        skill_id: selectedSkill.id,
        category: selectedSkill.category,
        markdown_length: selectedSkill.markdown.length
      });
    } catch {
      track("studio_ai_skill_copy", {
        skill_id: selectedSkill.id,
        category: selectedSkill.category,
        failed: true
      });
    }
  };

  if (!selectedSkill) {
    return (
      <section className="empty-route card">
        <LuSparkles aria-hidden="true" />
        <strong>Skill library is empty</strong>
        <p>Add markdown skills to Studio data before opening this menu.</p>
      </section>
    );
  }

  return (
    <section className="route-page ai-skills-route">
      <RouteHeading route={route}>
        <button type="button" className="outline-button" onClick={copySkill}>
          {copiedSkillId === selectedSkill.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copiedSkillId === selectedSkill.id ? "Copied" : "Copy markdown"}
        </button>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="skill-library-workbench card" data-studio-module="ai-skills">
        <aside className="skill-index-pane" aria-label="AI skill library">
          <div className="ai-pane-head">
            <span><LuCommand aria-hidden="true" /></span>
            <div>
              <h2>Skill library</h2>
              <p>Markdown prompts that can be copied into an agent session.</p>
            </div>
          </div>

          <div className="skill-filter-row" role="tablist" aria-label="Skill categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={categoryFilter === category ? "is-active" : undefined}
                onClick={() => handleCategoryFilter(category)}
              >
                {skillCategoryLabel(category)}
              </button>
            ))}
          </div>

          <div className="skill-list">
            {visibleSkills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                className={`skill-list-button${selectedSkill.id === skill.id ? " is-active" : ""}`}
                onClick={() => handleSkillSelect(skill)}
              >
                <span>
                  <strong>{skill.title}</strong>
                  <small>{skill.summary}</small>
                </span>
                <em>{skillCategoryLabel(skill.category)}</em>
              </button>
            ))}
          </div>
        </aside>

        <article className="skill-reader-pane" aria-label="Selected AI skill markdown">
          <div className="skill-reader-head">
            <div>
              <span className="ai-status-pill status-ready">{skillCategoryLabel(selectedSkill.category)}</span>
              <h2>{selectedSkill.title}</h2>
              <p>{selectedSkill.summary}</p>
            </div>
            <button type="button" className="outline-button" onClick={copySkill}>
              {copiedSkillId === selectedSkill.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              {copiedSkillId === selectedSkill.id ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="ai-tag-list" aria-label="Skill tags">
            {selectedSkill.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <pre className="skill-markdown-preview"><code>{selectedSkill.markdown}</code></pre>
        </article>

        <aside className="skill-side-pane" aria-label="Skill usage notes">
          <section>
            <h3>Use this when</h3>
            <p>{selectedSkill.summary}</p>
          </section>
          <section>
            <h3>Copy behavior</h3>
            <p>The button copies the raw markdown block, including headings, process, output format, and guardrails.</p>
          </section>
          <section>
            <h3>Operating rule</h3>
            <p>Keep the skill specific enough to be useful, but short enough to paste into Codex, Claude, Gemini, or another agent tool.</p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ChecklistStepNode({
  checklistId,
  sectionId,
  step,
  depth = 0
}: {
  checklistId: string;
  sectionId: string;
  step: StudioChecklistStep;
  depth?: number;
}) {
  return (
    <li className="checklist-step-node" data-depth={depth}>
      <label className="check-row checklist-row">
        <input
          type="checkbox"
          onChange={(event) => {
            track("studio_checklist_item_toggle", {
              checklist_id: checklistId,
              section_id: sectionId,
              step_id: step.id,
              checked: event.currentTarget.checked
            });
          }}
        />
        <span>
          <strong>{step.label}</strong>
          {step.detail && <small>{step.detail}</small>}
        </span>
      </label>
      {step.children?.length ? (
        <ol>
          {step.children.map((child) => (
            <ChecklistStepNode
              key={child.id}
              checklistId={checklistId}
              sectionId={sectionId}
              step={child}
              depth={depth + 1}
            />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

function DeliveryChecklistsPage({ route }: { route: StudioRoute }) {
  const [selectedChecklistId, setSelectedChecklistId] = useState(studioWorkflowChecklists[0]?.id ?? "");
  const [copiedChecklistId, setCopiedChecklistId] = useState<string | null>(null);
  const selectedChecklist = studioWorkflowChecklists.find((checklist) => checklist.id === selectedChecklistId) ?? studioWorkflowChecklists[0];
  const selectedMarkdown = selectedChecklist ? renderChecklistMarkdown(selectedChecklist) : "";
  const totalSteps = selectedChecklist?.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0) ?? 0;

  const handleChecklistSelect = (checklist: StudioWorkflowChecklist) => {
    setSelectedChecklistId(checklist.id);
    track("studio_checklist_select", {
      checklist_id: checklist.id,
      section_count: checklist.sections.length,
      step_count: checklist.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0)
    });
  };

  const copyChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      await navigator.clipboard.writeText(selectedMarkdown);
      setCopiedChecklistId(selectedChecklist.id);
      window.setTimeout(() => setCopiedChecklistId(null), 1600);
      track("studio_checklist_copy", {
        checklist_id: selectedChecklist.id,
        markdown_length: selectedMarkdown.length,
        section_count: selectedChecklist.sections.length,
        step_count: totalSteps
      });
    } catch {
      track("studio_checklist_copy", {
        checklist_id: selectedChecklist.id,
        failed: true
      });
    }
  };

  if (!selectedChecklist) {
    return (
      <section className="empty-route card">
        <LuClipboardList aria-hidden="true" />
        <strong>Checklist library is empty</strong>
        <p>Add workflow checklists to Studio data before opening this menu.</p>
      </section>
    );
  }

  return (
    <section className="route-page delivery-checklists-route">
      <RouteHeading route={route}>
        <button type="button" className="outline-button" onClick={copyChecklist}>
          {copiedChecklistId === selectedChecklist.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copiedChecklistId === selectedChecklist.id ? "Copied" : "Copy checklist"}
        </button>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="checklist-workbench card" data-studio-module="delivery-checklists">
        <aside className="checklist-index-pane" aria-label="Workflow checklists">
          <div className="ai-pane-head">
            <span><LuClipboardList aria-hidden="true" /></span>
            <div>
              <h2>Checklist menu</h2>
              <p>Operating lists from ticket intake to rollout.</p>
            </div>
          </div>

          <div className="checklist-list">
            {studioWorkflowChecklists.map((checklist) => (
              <button
                key={checklist.id}
                type="button"
                className={`checklist-list-button${selectedChecklist.id === checklist.id ? " is-active" : ""}`}
                onClick={() => handleChecklistSelect(checklist)}
              >
                <span>
                  <strong>{checklist.title}</strong>
                  <small>{checklist.summary}</small>
                </span>
                <em>{checklist.sections.length} sections</em>
              </button>
            ))}
          </div>
        </aside>

        <article className="checklist-reader-pane" aria-label="Selected workflow checklist">
          <div className="skill-reader-head">
            <div>
              <span className="ai-status-pill status-ready">{totalSteps} steps</span>
              <h2>{selectedChecklist.title}</h2>
              <p>{selectedChecklist.summary}</p>
            </div>
            <button type="button" className="outline-button" onClick={copyChecklist}>
              {copiedChecklistId === selectedChecklist.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              {copiedChecklistId === selectedChecklist.id ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="ai-tag-list" aria-label="Checklist tags">
            {selectedChecklist.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="checklist-section-list">
            {selectedChecklist.sections.map((section) => (
              <section key={section.id} className="checklist-section-card">
                <header>
                  <h3>{section.title}</h3>
                  <p>{section.detail}</p>
                </header>
                <ol>
                  {section.steps.map((step) => (
                    <ChecklistStepNode
                      key={step.id}
                      checklistId={selectedChecklist.id}
                      sectionId={section.id}
                      step={step}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </article>

        <aside className="checklist-side-pane" aria-label="Checklist details">
          <section>
            <h3>When to use</h3>
            <p>{selectedChecklist.whenToUse}</p>
          </section>
          <section>
            <h3>Structure</h3>
            <p>{selectedChecklist.sections.length} sections, {totalSteps} nested steps, copy-ready as markdown.</p>
          </section>
          <section>
            <h3>Markdown copy</h3>
            <pre><code>{selectedMarkdown}</code></pre>
          </section>
        </aside>
      </div>
    </section>
  );
}

function BlogRoadmapPage({ route, locale }: { route: StudioRoute; locale: string }) {
  const [selectedTopicId, setSelectedTopicId] = useState(blogRoadmapTopics[0]?.id ?? "");
  const [selectedDay, setSelectedDay] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BlogRoadmapStatus | "all">("all");
  const selectedTopic = blogRoadmapTopics.find((topic) => topic.id === selectedTopicId) ?? blogRoadmapTopics[0];
  const selectedEntry = selectedTopic?.entries.find((entry) => entry.day === selectedDay) ?? selectedTopic?.entries[0];
  const visibleEntries = selectedTopic?.entries.filter((entry) => statusFilter === "all" || entry.status === statusFilter) ?? [];
  const readyCount = selectedTopic?.entries.filter((entry) => entry.status === "ready").length ?? 0;
  const outlineCount = selectedTopic?.entries.filter((entry) => entry.status === "outline").length ?? 0;
  const researchCount = selectedTopic?.entries.filter((entry) => entry.status === "research").length ?? 0;
  const blogCategoryHref = selectedTopic ? `${profileHref(locale, APP_ROUTE.BLOG)}/${selectedTopic.categorySlug}` : profileHref(locale, APP_ROUTE.BLOG);

  const handleTopicSelect = (topic: BlogRoadmapTopic) => {
    const firstEntry = topic.entries[0];
    setSelectedTopicId(topic.id);
    setSelectedDay(firstEntry?.day ?? 1);
    setStatusFilter("all");
    track("studio_blog_roadmap_topic_select", {
      topic_id: topic.id,
      category_slug: topic.categorySlug,
      entries_count: topic.entries.length
    });
  };

  const handleEntrySelect = (entry: BlogRoadmapEntry) => {
    setSelectedDay(entry.day);
    track("studio_blog_roadmap_day_select", {
      topic_id: selectedTopic?.id,
      day: entry.day,
      status: entry.status,
      ticket_label: entry.ticketLabel
    });
  };

  const handleTicketAction = (action: "create_one" | "create_ready_batch") => {
    track("studio_blog_roadmap_ticket_action", {
      action,
      topic_id: selectedTopic?.id,
      day: selectedEntry?.day,
      ticket_label: selectedEntry?.ticketLabel,
      ready_count: readyCount
    });
  };

  if (!selectedTopic || !selectedEntry) {
    return (
      <section className="empty-route card">
        <LuBookOpenCheck aria-hidden="true" />
        <strong>Roadmap data is empty</strong>
        <p>Add blog roadmap topics to Studio data before opening this menu.</p>
      </section>
    );
  }

  return (
    <section className="route-page blog-roadmap-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <a className="outline-button" href={blogCategoryHref}>
            <LuBookOpenCheck aria-hidden="true" />
            Open category
          </a>
          <button type="button" className="outline-button" onClick={() => handleTicketAction("create_ready_batch")}>
            <LuPlusCircle aria-hidden="true" />
            Queue ready tickets
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="blog-roadmap-workbench card" data-studio-module="blog-roadmap">
        <aside className="roadmap-topic-pane" aria-label="Blog roadmap topics">
          <div className="ai-pane-head">
            <span><LuBookOpenCheck aria-hidden="true" /></span>
            <div>
              <h2>Topic menu</h2>
              <p>Current blog categories mapped to a one-month cadence.</p>
            </div>
          </div>

          <div className="roadmap-topic-list">
            {blogRoadmapTopics.map((topic) => {
              const active = topic.id === selectedTopic.id;
              const topicReady = topic.entries.filter((entry) => entry.status === "ready").length;
              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`roadmap-topic-button${active ? " is-active" : ""}`}
                  onClick={() => handleTopicSelect(topic)}
                >
                  <span>
                    <strong>{topic.title}</strong>
                    <small>{topic.tagline}</small>
                  </span>
                  <em>{topicReady}/{topic.entries.length}</em>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="roadmap-plan-pane" aria-label="Selected blog roadmap">
          <div className="roadmap-plan-head">
            <div>
              <span className="ai-status-pill status-ready">{selectedTopic.cadence}</span>
              <h2>{selectedTopic.title}</h2>
              <p>{selectedTopic.tagline}</p>
            </div>
            <div className="roadmap-status-strip" aria-label="Roadmap status counts">
              <span><strong>{readyCount}</strong> Ready</span>
              <span><strong>{outlineCount}</strong> Outline</span>
              <span><strong>{researchCount}</strong> Research</span>
            </div>
          </div>

          <div className="tabs-row tabs-wrap" role="tablist" aria-label="Roadmap status filters">
            {(["all", "ready", "outline", "research"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? "is-active" : undefined}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "All" : roadmapStatusText(status)}
              </button>
            ))}
          </div>

          <div className="roadmap-day-grid" aria-label="Thirty day roadmap">
            {visibleEntries.map((entry) => (
              <button
                key={entry.day}
                type="button"
                className={`roadmap-day-card status-${entry.status}${entry.day === selectedEntry.day ? " is-active" : ""}`}
                onClick={() => handleEntrySelect(entry)}
              >
                <span>Day {entry.day}</span>
                <strong>{entry.title}</strong>
                <small>{entry.intent} - {entry.format}</small>
              </button>
            ))}
          </div>
        </article>

        <aside className="roadmap-detail-pane" aria-label="Roadmap ticket detail">
          <div className="roadmap-ticket-card">
            <div className="roadmap-ticket-head">
              <span className={`ai-status-pill status-${selectedEntry.status}`}>{roadmapStatusText(selectedEntry.status)}</span>
              <strong>{selectedEntry.ticketLabel}</strong>
            </div>
            <h2>Day {selectedEntry.day}: {selectedEntry.title}</h2>
            <p>{selectedEntry.angle}</p>
            <dl className="roadmap-detail-list">
              <div>
                <dt>Intent</dt>
                <dd>{selectedEntry.intent}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{selectedEntry.format}</dd>
              </div>
              <div>
                <dt>Draft time</dt>
                <dd>{selectedEntry.estimatedMinutes} min</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{selectedTopic.categorySlug}</dd>
              </div>
            </dl>
            <button type="button" className="primary-action" onClick={() => handleTicketAction("create_one")}>
              Prepare Multica ticket
            </button>
          </div>

          <section className="ai-checklist-panel">
            <h3>Ticket handoff</h3>
            <div>
              {blogRoadmapTicketChecklist.map((item, index) => (
                <label className="check-row checklist-row" key={item}>
                  <input type="checkbox" defaultChecked={index < 3} />
                  <span>
                    <strong>{item}</strong>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function CalendarPage({ route }: { route: StudioRoute }) {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuCalendarDays aria-hidden="true" />
          New event
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <section className="calendar-card card">
        <div className="calendar-grid">
          {days.map((day) => (
            <button key={day} type="button" className={day === 20 || day === 24 ? "has-event" : ""}>
              <span>{day}</span>
              {(day === 20 || day === 24) && <small>{day === 20 ? "Review" : "Release"}</small>}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function KanbanPage({ route }: { route: StudioRoute }) {
  const columns = [
    { title: "Todo", tasks: ["Map admin routes", "Wire command search", "Check mobile drawer"] },
    { title: "In progress", tasks: ["Studio Shadow shell", "Route view parity"] },
    { title: "Done", tasks: ["Default dashboard replica", "CV return links"] }
  ];
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuKanbanSquare aria-hidden="true" />
          Add card
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="kanban-board">
        {columns.map((column) => (
          <section className="kanban-column" key={column.title}>
            <h2>{column.title}</h2>
            {column.tasks.map((task) => (
              <article className="kanban-card" key={task}>{task}</article>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

function InvoicePage({ route }: { route: StudioRoute }) {
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <a className="outline-button" href={APP_ROUTE.CV_PDF} target="_blank" rel="noreferrer">
          <LuDownload aria-hidden="true" />
          Export
        </a>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <div className="invoice-layout">
        <section className="card route-panel">
          <h2>Invoice form</h2>
          {["Client", "Project", "Due date"].map((label) => (
            <label className="form-row" key={label}>
              <span>{label}</span>
              <input defaultValue={label === "Client" ? "Nguyen Le Phong" : ""} />
            </label>
          ))}
        </section>
        <section className="invoice-paper">
          <strong>Invoice #18425</strong>
          <p>Studio implementation</p>
          <div className="invoice-line"><span>Dashboard shell</span><b>$1,250.00</b></div>
          <div className="invoice-line"><span>Interaction testing</span><b>$420.00</b></div>
          <div className="invoice-total"><span>Total</span><b>$1,670.00</b></div>
        </section>
      </div>
    </section>
  );
}

function UsersRolesPage({ route }: { route: StudioRoute }) {
  const rows = route.kind === "roles"
    ? [
        ["Admin", "Full access", "8 users"],
        ["Editor", "Content and workflow", "18 users"],
        ["Viewer", "Read-only", "42 users"]
      ]
    : [
        ["Aiy Rand", "Product", "Active"],
        ["Sarah Parker", "Enterprise", "Active"],
        ["Michael Brown", "Growth", "Pending"],
        ["Linda Chen", "Analytics", "Active"]
      ];
  return (
    <section className="route-page">
      <RouteHeading route={route}>
        <button type="button" className="outline-button">
          <LuUserPlus aria-hidden="true" />
          Invite
        </button>
      </RouteHeading>
      <RouteMetricGrid metrics={route.metrics} />
      <section className="card records-card">
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>{route.kind === "roles" ? "Role" : "User"}</th>
                <th>{route.kind === "roles" ? "Scope" : "Team"}</th>
                <th>{route.kind === "roles" ? "Members" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  <td><strong>{row[0]}</strong></td>
                  <td>{row[1]}</td>
                  <td><span className="soft-pill">{row[2]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function AuthPage({ route }: { route: StudioRoute }) {
  const isRegister = route.id.includes("register");
  return (
    <section className="auth-route">
      <RouteHeading route={route} />
      <RouteMetricGrid metrics={route.metrics} />
      <div className="auth-card card">
        <div className="auth-brand">
          <LuCommand aria-hidden="true" />
          <span>Studio</span>
        </div>
        <h1>{route.title}</h1>
        <p>{route.description}</p>
        <label className="form-row">
          <span>Email</span>
          <input type="email" defaultValue="phongnguyen.itengineer@gmail.com" />
        </label>
        {isRegister && (
          <label className="form-row">
            <span>Name</span>
            <input defaultValue="Nguyen Le Phong" />
          </label>
        )}
        <label className="form-row">
          <span>Password</span>
          <input type="password" defaultValue="studio-admin" />
        </label>
        <button type="button" className="primary-action">{isRegister ? "Create account" : "Sign in"}</button>
      </div>
    </section>
  );
}

function DefaultDashboard({
  workstreamSearch,
  statusFilter,
  sortMode,
  onWorkstreamSearch,
  onStatusFilter,
  onSortMode
}: {
  workstreamSearch: string;
  statusFilter: string;
  sortMode: string;
  onWorkstreamSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
}) {
  const filteredWorkstreams = useMemo(() => {
    const query = workstreamSearch.trim().toLowerCase();
    const rows = workstreamRows.filter((workstream) => {
      const matchesQuery = !query || [workstream.name, workstream.id, workstream.status, workstream.billing, workstream.plan].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all" || workstream.status.toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return rows.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "status") return a.status.localeCompare(b.status);
      return b.id.localeCompare(a.id);
    });
  }, [sortMode, statusFilter, workstreamSearch]);

  return (
    <section className="route-page">
      <RouteMetricGrid metrics={defaultMetrics} />

      <section className="card activity-card" id="release-signal" data-slot="card">
        <header className="card-header activity-header">
          <div>
            <h2>Release Activity</h2>
            <p>Release Signal across rollout volume, platform health, and incident noise.</p>
          </div>
          <div className="card-actions">
            <select className="native-select" defaultValue="quarter" aria-label="Period">
              <option value="quarter">6 weeks</option>
              <option value="sprint">Current sprint</option>
            </select>
            <select className="native-select" defaultValue="all" aria-label="Segment">
              <option value="all">All services</option>
              <option value="edge">Edge/API</option>
              <option value="workers">Workers</option>
            </select>
            <a href={APP_ROUTE.CV_PDF} className="outline-button" target="_blank" rel="noreferrer">
              View report
            </a>
          </div>
        </header>
        <DeliverySignalChart />
      </section>

      <section className="card records-card workstreams-card" id="system-workstreams" data-slot="card">
        <header className="card-header table-header">
          <div>
            <h2>12 Workstreams</h2>
            <p>System Workstreams with status, risk, area, and last-update activity.</p>
          </div>
          <a href={APP_ROUTE.CV_PDF} className="outline-button" target="_blank" rel="noreferrer">
            <LuDownload aria-hidden="true" />
            Export
          </a>
        </header>

        <div className="table-toolbar">
          <label className="workstream-search">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search workstreams</span>
            <input type="search" placeholder="Search workstreams..." value={workstreamSearch} onChange={(event) => onWorkstreamSearch(event.target.value)} />
          </label>
          <select className="native-select" value={statusFilter} onChange={(event) => onStatusFilter(event.target.value)} aria-label="Status filter">
            <option value="all">Status</option>
            <option value="healthy">Healthy</option>
            <option value="watching">Watching</option>
            <option value="blocked">Blocked</option>
            <option value="queued">Queued</option>
          </select>
          <span className="toolbar-spacer" />
          <select className="native-select" value={sortMode} onChange={(event) => onSortMode(event.target.value)} aria-label="Sort workstreams">
            <option value="joined">Last update</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="Select all workstreams" /></th>
                <th>Workstream</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Area</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkstreams.map((workstream) => (
                <tr key={workstream.id}>
                  <td><input type="checkbox" aria-label={`Select ${workstream.name}`} /></td>
                  <td data-label="Workstream">
                    <div className="workstream-cell">
                      <span className="workstream-avatar"><LuServer aria-hidden="true" /></span>
                      <span><strong>{workstream.name}</strong><small>{workstream.id}</small></span>
                    </div>
                  </td>
                  <td data-label="Status"><span className="soft-pill">{workstream.status}</span></td>
                  <td data-label="Risk">
                    <span className={`billing-pill billing-${workstream.billingTone}`}>
                      {workstream.billingTone === "paid" && <LuCheck aria-hidden="true" />}
                      {workstream.billing}
                    </span>
                  </td>
                  <td data-label="Area">{workstream.plan}</td>
                  <td data-label="Updated"><span className="joined-cell"><strong>{workstream.joined}</strong><small>{workstream.time}</small></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <DashboardKpiStrip />

      <div className="ops-detail-grid">
        <ComponentInventoryCard />
        <DistributionCard />
        <ReleaseChecklistCard />
      </div>
    </section>
  );
}

function RouteContent({
  route,
  locale,
  workstreamSearch,
  statusFilter,
  sortMode,
  onWorkstreamSearch,
  onStatusFilter,
  onSortMode
}: {
  route: StudioRoute;
  locale: string;
  workstreamSearch: string;
  statusFilter: string;
  sortMode: string;
  onWorkstreamSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
}) {
  if (route.kind === "default") {
    return (
      <DefaultDashboard
        workstreamSearch={workstreamSearch}
        statusFilter={statusFilter}
        sortMode={sortMode}
        onWorkstreamSearch={onWorkstreamSearch}
        onStatusFilter={onStatusFilter}
        onSortMode={onSortMode}
      />
    );
  }
  if (route.kind === "finance") return <FinanceLikePage route={route} />;
  if (route.kind === "analytics") return <AnalyticsPage route={route} />;
  if (route.kind === "productivity") return <ProductivityPage route={route} />;
  if (route.kind === "ecommerce" || route.kind === "academy" || route.kind === "logistics" || route.kind === "infrastructure") return <CommerceAcademyPage route={route} />;
  if (route.kind === "mail") return <MailRoutePage route={route} />;
  if (route.kind === "chat") return <ChatRoutePage route={route} />;
  if (route.kind === "ai-setup") return <AiAgentSetupPage route={route} locale={locale} />;
  if (route.kind === "ai-skills") return <AiSkillsPage route={route} />;
  if (route.kind === "checklists") return <DeliveryChecklistsPage route={route} />;
  if (route.kind === "roadmap") return <BlogRoadmapPage route={route} locale={locale} />;
  if (route.kind === "calendar") return <CalendarPage route={route} />;
  if (route.kind === "kanban") return <KanbanPage route={route} />;
  if (route.kind === "invoice") return <InvoicePage route={route} />;
  if (route.kind === "users" || route.kind === "roles") return <UsersRolesPage route={route} />;
  if (route.kind === "auth") return <AuthPage route={route} />;
  return <DashboardRoutePage route={route} />;
}

function CommandDialog({
  open,
  query,
  locale,
  activeRoute,
  onQuery,
  onClose,
  onActivate
}: {
  open: boolean;
  query: string;
  locale: string;
  activeRoute: StudioRouteId;
  onQuery: (value: string) => void;
  onClose: () => void;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
}) {
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return flatRouteResults.filter((item) => {
      const route = item.routeId ? routeDefinitions[item.routeId] : undefined;
      return !normalized || item.title.toLowerCase().includes(normalized) || route?.description.toLowerCase().includes(normalized);
    });
  }, [query]);

  if (!open) return null;

  return (
    <div className="command-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="command-dialog" role="dialog" aria-modal="true" aria-label="Search Studio routes">
        <div className="command-input-row">
          <LuSearch aria-hidden="true" />
          <input autoFocus value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search AI setup..." />
          <button type="button" onClick={onClose} aria-label="Close search">
            <LuX aria-hidden="true" />
          </button>
        </div>
        <div className="command-results">
          {results.map((item) => {
            const route = routeDefinitions[item.routeId ?? DEFAULT_ROUTE];
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
          <span className="command-section-label">Profile menu</span>
          {profileMenuItems.map((item) => {
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

function StudioPreferencesPanel({
  themeSetting,
  resolvedTheme,
  font,
  layoutPreference,
  onThemeChange,
  onFontChange,
  onLayoutChange,
  onRestoreLayout
}: {
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
    <section className="preferences-popover" aria-label="Studio preferences">
      <div className="preferences-head">
        <div>
          <h2>Preferences</h2>
          <p>Theme, font, and layout for this Studio workspace.</p>
        </div>
        <span className="theme-color-preview" aria-label="CV theme color">
          <i />
          CV palette
        </span>
      </div>

      <div className="preference-section">
        <label>Theme mode</label>
        <div className="preference-segment" data-columns={themeOptions.length} role="radiogroup" aria-label="Theme mode">
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
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p>Resolved now: {resolvedTheme}</p>
      </div>

      <div className="preference-section">
        <label htmlFor="studio-font-select">Font</label>
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
        <label>Page layout</label>
        <div className="preference-segment" data-columns={contentLayoutOptions.length} role="radiogroup" aria-label="Page layout">
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
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p>Centered keeps reading calm. Full width gives wider operations surfaces.</p>
      </div>

      <div className="preference-section">
        <label>Navbar behavior</label>
        <div className="preference-segment" data-columns={navbarStyleOptions.length} role="radiogroup" aria-label="Navbar behavior">
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
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p>Sticky keeps controls visible. Scroll lets the whole workspace move together.</p>
      </div>

      <div className="preference-section">
        <label>Sidebar style</label>
        <div className="preference-segment" data-columns={sidebarVariantOptions.length} role="radiogroup" aria-label="Sidebar style">
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
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p>Choose the density that matches the current setup work.</p>
      </div>

      <div className="preference-section">
        <label>Collapse mode</label>
        <div className="preference-segment" data-columns={sidebarCollapsibleOptions.length} role="radiogroup" aria-label="Collapse mode">
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
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p>Icon keeps the rail visible. Offcanvas hides it completely on desktop.</p>
      </div>

      <button type="button" className="restore-preferences" onClick={onRestoreLayout}>
        Restore layout defaults
      </button>
    </section>
  );
}

export function StudioAdminShell({ locale }: StudioAdminShellProps) {
  const [activeRoute, setActiveRoute] = useState<StudioRouteId>(() => (typeof window === "undefined" ? DEFAULT_ROUTE : normalizeHash(window.location.hash)));
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
  const [workstreamSearch, setWorkstreamSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("joined");
  const preferencesRef = useRef<HTMLDivElement>(null);
  const route = routeDefinitions[activeRoute];

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = normalizeHash(window.location.hash);
      setActiveRoute((currentRoute) => {
        if (currentRoute !== nextRoute) {
          track("studio_route_open", {
            route_id: nextRoute,
            route_kind: routeDefinitions[nextRoute].kind,
            previous_route: currentRoute,
            source: "browser_history"
          });
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
      route_kind: routeDefinitions[routeId].kind,
      previous_route: activeRoute,
      source
    });
    setActiveRoute(routeId);
    setMobileSidebarOpen(false);
    setPreferencesOpen(false);
    setAccountOpen(false);
    const nextHash = routeHref(routeId);
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
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
      <aside className="studio-sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <a className="sidebar-brand" href={routeHref(DEFAULT_ROUTE)} aria-label="Open Studio" onClick={handleBrandClick}>
            <Image src="/icon.png" alt="" width={28} height={28} />
            <span>Studio</span>
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
            aria-label="Close navigation"
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
            <span>Find setup note</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          {navGroups.map((group) => (
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
              <strong>Profile navigation</strong>
              <p>Move between the public profile sections from this Studio workspace.</p>
              <div className="profile-link-grid">
                {profileMenuItems.map((item) => {
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
              <small>Open profile home</small>
            </span>
            <LuMoreVertical aria-hidden="true" />
          </a>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close navigation"
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
            <button type="button" className="icon-button" aria-label="Toggle navigation" onClick={toggleSidebar}>
              {mobileSidebarOpen ? <LuX aria-hidden="true" /> : <LuPanelLeft aria-hidden="true" />}
            </button>
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
              <span>Search</span>
              <kbd>Cmd J</kbd>
            </button>
          </div>

          <div className="topbar-actions">
            <div className="preferences-anchor" ref={preferencesRef}>
              <button
                type="button"
                className="topbar-icon"
                aria-label="Open Studio preferences"
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
              aria-label="Open GitHub profile"
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
              aria-label="Open account menu"
            >
              N
            </button>
            {accountOpen && (
              <section className="account-popover">
                <strong>Nguyen Le Phong</strong>
                <span>Senior Software Engineer</span>
                <nav className="account-nav" aria-label="Profile navigation">
                  {profileMenuItems.map((item) => {
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
          <RouteContent
            route={route}
            locale={locale}
            workstreamSearch={workstreamSearch}
            statusFilter={statusFilter}
            sortMode={sortMode}
            onWorkstreamSearch={setWorkstreamSearch}
            onStatusFilter={setStatusFilter}
            onSortMode={setSortMode}
          />
        </div>
      </main>

      <CommandDialog
        open={searchOpen}
        query={searchQuery}
        locale={locale}
        activeRoute={activeRoute}
        onQuery={setSearchQuery}
        onClose={() => setSearchOpen(false)}
        onActivate={activateRoute}
      />
    </div>
  );
}
