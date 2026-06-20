"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { IconType } from "react-icons";
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
  LuInbox,
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

const DEFAULT_ROUTE: StudioRouteId = "default";
const resumePath = "/SoftwareEngineer_NguyenLePhong_0985490107_NoRefs.pdf";

const defaultMetrics: StudioMetric[] = [
  {
    label: "Total Revenue",
    value: "$1,250.00",
    helper: "Visitors for the last 6 months",
    badge: "+12.5%",
    trend: "up",
    icon: LuBadgeDollarSign
  },
  {
    label: "New Customers",
    value: "1,234",
    helper: "Acquisition needs attention",
    badge: "-20%",
    trend: "down",
    icon: LuUserPlus
  },
  {
    label: "Active Accounts",
    value: "45,678",
    helper: "Engagement exceeds targets",
    badge: "+12.5%",
    trend: "up",
    icon: LuUsers
  },
  {
    label: "Growth Rate",
    value: "4.5%",
    helper: "Meets growth projections",
    badge: "+4.5%",
    trend: "up",
    icon: LuWaves
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
    title: "Default",
    description: "Customer activity, recent subscribers, and high-level growth metrics.",
    kind: "default",
    icon: LuLayoutDashboard,
    metrics: routeMetrics.default,
    panels: ["Customer Activity", "Recent Customers", "Revenue Movement"],
    timeline: ["Revenue updated", "Customer import finished", "Subscriber export ready"]
  },
  crm: {
    id: "crm",
    title: "CRM",
    description: "Pipeline, task reminders, and opportunity health in the same pattern as the source admin.",
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
    description: "Task board with source-style columns and cards.",
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
    description: "Second registration variant from the source app navigation.",
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
    label: "Dashboards",
    items: [
      { id: "default", title: "Default", routeId: "default", icon: LuLayoutDashboard },
      { id: "crm", title: "CRM", routeId: "crm", icon: LuBarChart },
      { id: "finance", title: "Finance", routeId: "finance", icon: LuBanknote },
      { id: "analytics", title: "Analytics", routeId: "analytics", icon: LuGauge },
      { id: "productivity", title: "Productivity", routeId: "productivity", icon: LuListTodo },
      { id: "ecommerce", title: "E-commerce", routeId: "ecommerce", icon: LuShoppingBag },
      { id: "academy", title: "Academy", routeId: "academy", icon: LuGraduationCap },
      { id: "logistics", title: "Logistics", routeId: "logistics", icon: LuBoxes },
      { id: "infrastructure", title: "Infrastructure", routeId: "infrastructure", icon: LuServer, badge: "new" }
    ]
  },
  {
    id: 2,
    label: "Pages",
    items: [
      { id: "email", title: "Email", routeId: "email", icon: LuMail },
      { id: "chat", title: "Chat", routeId: "chat", icon: LuMessageSquare },
      { id: "calendar", title: "Calendar", routeId: "calendar", icon: LuCalendarDays },
      { id: "kanban", title: "Kanban", routeId: "kanban", icon: LuKanbanSquare },
      { id: "invoice", title: "Invoice", routeId: "invoice", icon: LuClipboardList },
      { id: "users", title: "Users", routeId: "users", icon: LuUsers },
      { id: "roles", title: "Roles", routeId: "roles", icon: LuLock },
      {
        id: "authentication",
        title: "Authentication",
        icon: LuFingerprint,
        subItems: [
          { id: "auth-login-v1", title: "Login v1", routeId: "auth-login-v1" },
          { id: "auth-login-v2", title: "Login v2", routeId: "auth-login-v2" },
          { id: "auth-register-v1", title: "Register v1", routeId: "auth-register-v1" },
          { id: "auth-register-v2", title: "Register v2", routeId: "auth-register-v2" }
        ]
      }
    ]
  },
  {
    id: 3,
    label: "Legacy",
    items: [
      {
        id: "legacy-dashboards",
        title: "Dashboards",
        subItems: [
          { id: "legacy-default", title: "Default V1", routeId: "legacy-default" },
          { id: "legacy-crm", title: "CRM V1", routeId: "legacy-crm" },
          { id: "legacy-finance", title: "Finance V1", routeId: "legacy-finance" },
          { id: "legacy-analytics", title: "Analytics V1", routeId: "legacy-analytics" }
        ]
      }
    ]
  },
  {
    id: 4,
    label: "Misc",
    items: [{ id: "others", title: "Others", icon: LuExternalLink, badge: "soon", disabled: true }]
  }
];

const studioMails: StudioMail[] = [
  {
    id: "mail-incident-rollback",
    from: { name: "Olivia Rhye", email: "olivia.rhye@railway.co" },
    to: ["Nguyen Le Phong"],
    cc: ["Platform Team"],
    subject: "Staging gateway still returns 502 after rollback",
    body: "Hi Phong,\n\nThe latest rollback finished, but the staging gateway is still returning intermittent 502s. API traffic looks healthy; only the web container readiness probe keeps failing.\n\nCan you check whether the ingress path and upstream service selector still match after the deployment rollback?\n\nThanks,\nOlivia",
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
      { id: 102, side: "out", text: "Thanks, Olivia. I am checking deploy logs, service selectors, and the upstream gateway config now.", time: "8 min ago" },
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
      status: "Customer",
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
      status: "Customer",
      qualifiedAt: "Aug 3, 2025",
      tags: ["Onboarding", "Platform"]
    },
    messages: [
      { id: 501, side: "in", text: "We have a backend developer starting Monday. What is the best onboarding path for repo access and environment setup?", time: "Yesterday" },
      { id: 502, side: "out", text: "I will send the standard engineering checklist with staging access and repository conventions.", time: "Yesterday" }
    ]
  }
];

const customers = [
  {
    name: "Sarah Parker",
    id: "#18425",
    status: "Subscribed",
    billing: "Paid",
    plan: "Enterprise",
    joined: "30th April 2026",
    time: "at 10:25 AM",
    billingTone: "paid"
  },
  {
    name: "Michael Brown",
    id: "#18424",
    status: "Inactive",
    billing: "Pending",
    plan: "Growth",
    joined: "29th April 2026",
    time: "at 10:08 AM",
    billingTone: "pending"
  },
  {
    name: "Linda Chen",
    id: "#18423",
    status: "Subscribed",
    billing: "Paid",
    plan: "Enterprise",
    joined: "28th April 2026",
    time: "at 09:44 AM",
    billingTone: "paid"
  },
  {
    name: "Ethan Brooks",
    id: "#18422",
    status: "Trial",
    billing: "Unpaid",
    plan: "Starter",
    joined: "27th April 2026",
    time: "at 05:16 PM",
    billingTone: "unpaid"
  }
];

const xTicks = ["Mar 25", "Apr 1", "Apr 8", "Apr 15", "Apr 22", "Apr 29", "May 6", "May 13", "May 21", "May 28", "Jun 4", "Jun 11", "Jun 20"];

const newCustomerValues = [72, 22, 28, 18, 20, 42, 18, 24, 19, 21, 34, 68, 28, 25, 23, 22, 76, 26, 34, 20, 22, 24, 22, 21, 33, 24, 66, 22, 28, 31, 33, 31, 26, 24, 48, 20, 22, 24, 44, 27, 35, 26, 76];
const activeAccountValues = [18, 17, 16, 17, 16, 18, 17, 16, 17, 18, 17, 16, 18, 17, 18, 17, 16, 17, 18, 17, 18, 16, 17, 18, 17, 16, 17, 18, 17, 16, 17, 16, 17, 18, 17, 17, 16, 18, 17, 18, 17, 16, 17];
const returningUserValues = [14, 13, 12, 13, 12, 12, 13, 14, 13, 12, 13, 12, 12, 13, 12, 13, 12, 13, 12, 12, 13, 14, 13, 12, 13, 12, 13, 12, 12, 13, 12, 13, 12, 13, 12, 12, 13, 12, 13, 12, 13, 12, 13];

const flatRouteResults = navGroups.flatMap((group) =>
  group.items.flatMap((item) => {
    if (item.subItems) return item.subItems.filter((subItem) => subItem.routeId);
    return item.routeId ? [item] : [];
  })
);

function routeHref(routeId: StudioRouteId): string {
  return `#${routeId}`;
}

function normalizeHash(hash: string): StudioRouteId {
  const candidate = hash.replace(/^#\/?/, "");
  return candidate in routeDefinitions ? (candidate as StudioRouteId) : DEFAULT_ROUTE;
}

function isItemActive(item: StudioNavItem, activeRoute: StudioRouteId): boolean {
  if (item.routeId === activeRoute) return true;
  return item.subItems?.some((subItem) => subItem.routeId === activeRoute) ?? false;
}

function linePoints(values: number[], maxValue = 82): string {
  const width = 1040;
  const height = 176;
  const xStep = width / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = Math.round(index * xStep);
      const y = Math.round(height - (value / maxValue) * height);
      return `${x},${y}`;
    })
    .join(" ");
}

function cvHref(): string {
  return resumePath;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

function CustomerActivityChart() {
  return (
    <svg className="activity-chart" viewBox="0 0 1080 300" role="img" aria-label="Customer activity chart">
      <g className="chart-grid">
        {[36, 84, 132, 180, 228, 276].map((y) => (
          <line key={y} x1="0" x2="1080" y1={y} y2={y} />
        ))}
      </g>
      <g transform="translate(0 58)">
        <polyline className="chart-line chart-new" points={linePoints(newCustomerValues)} />
        <polyline className="chart-line chart-active" points={linePoints(activeAccountValues)} />
        <polyline className="chart-line chart-returning" points={linePoints(returningUserValues)} />
      </g>
      <g className="chart-axis">
        {xTicks.map((tick, index) => (
          <text key={tick} x={(index / (xTicks.length - 1)) * 1040 + 10} y="292">
            {tick}
          </text>
        ))}
      </g>
    </svg>
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
  onActivate: (routeId: StudioRouteId) => void;
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
                          onActivate(subItem.routeId ?? DEFAULT_ROUTE);
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
                onActivate(item.routeId ?? DEFAULT_ROUTE);
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
          <CustomerActivityChart />
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
          <p>This tab is mounted and switchable, matching the tabbed behavior from the source admin.</p>
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
              <CustomerActivityChart />
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
            {["Review dashboard shell", "Compare source route behavior", "Ship PR update"].map((task) => (
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
        <a className="outline-button" href={resumePath} target="_blank" rel="noreferrer">
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
          <p>Studio Admin implementation</p>
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
      <section className="card customers-card">
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
          <span>Studio Admin</span>
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
  customerSearch,
  statusFilter,
  sortMode,
  onCustomerSearch,
  onStatusFilter,
  onSortMode
}: {
  customerSearch: string;
  statusFilter: string;
  sortMode: string;
  onCustomerSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
}) {
  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    const rows = customers.filter((customer) => {
      const matchesQuery = !query || [customer.name, customer.id, customer.status, customer.billing, customer.plan].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all" || customer.status.toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return rows.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "status") return a.status.localeCompare(b.status);
      return b.id.localeCompare(a.id);
    });
  }, [customerSearch, sortMode, statusFilter]);

  return (
    <section className="route-page">
      <RouteMetricGrid metrics={defaultMetrics} />

      <section className="card activity-card" data-slot="card">
        <header className="card-header activity-header">
          <div>
            <h2>Customer Activity</h2>
            <p>Customer activity for the last 3 months</p>
          </div>
          <div className="card-actions">
            <select className="native-select" defaultValue="quarter" aria-label="Period">
              <option value="quarter">3 months</option>
            </select>
            <select className="native-select" defaultValue="all" aria-label="Segment">
              <option value="all">All segments</option>
              <option value="paid">Paid</option>
              <option value="organic">Organic</option>
            </select>
            <a href={resumePath} className="outline-button" target="_blank" rel="noreferrer">
              View report
            </a>
          </div>
        </header>
        <div className="chart-legend" aria-hidden="true">
          <span><i className="legend-active" />Active Accounts</span>
          <span><i className="legend-new" />New Customers</span>
          <span><i className="legend-returning" />Returning Users</span>
        </div>
        <CustomerActivityChart />
      </section>

      <section className="card customers-card" data-slot="card">
        <header className="card-header table-header">
          <div>
            <h2>18,426 Customers</h2>
            <p>Recent customer records with plan, billing, status, and signup activity.</p>
          </div>
          <a href={resumePath} className="outline-button" target="_blank" rel="noreferrer">
            <LuDownload aria-hidden="true" />
            Export
          </a>
        </header>

        <div className="table-toolbar">
          <label className="customer-search">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search customers</span>
            <input type="search" placeholder="Search customers..." value={customerSearch} onChange={(event) => onCustomerSearch(event.target.value)} />
          </label>
          <select className="native-select" value={statusFilter} onChange={(event) => onStatusFilter(event.target.value)} aria-label="Status filter">
            <option value="all">Status</option>
            <option value="subscribed">Subscribed</option>
            <option value="inactive">Inactive</option>
            <option value="trial">Trial</option>
          </select>
          <span className="toolbar-spacer" />
          <select className="native-select" value={sortMode} onChange={(event) => onSortMode(event.target.value)} aria-label="Sort customers">
            <option value="joined">Joined date</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="Select all customers" /></th>
                <th>Customer</th>
                <th>Status</th>
                <th>Billing</th>
                <th>Plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td><input type="checkbox" aria-label={`Select ${customer.name}`} /></td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-avatar"><LuUsers aria-hidden="true" /></span>
                      <span><strong>{customer.name}</strong><small>{customer.id}</small></span>
                    </div>
                  </td>
                  <td><span className="soft-pill">{customer.status}</span></td>
                  <td>
                    <span className={`billing-pill billing-${customer.billingTone}`}>
                      {customer.billingTone === "paid" && <LuCheck aria-hidden="true" />}
                      {customer.billing}
                    </span>
                  </td>
                  <td>{customer.plan}</td>
                  <td><span className="joined-cell"><strong>{customer.joined}</strong><small>{customer.time}</small></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function RouteContent({
  route,
  customerSearch,
  statusFilter,
  sortMode,
  onCustomerSearch,
  onStatusFilter,
  onSortMode
}: {
  route: StudioRoute;
  customerSearch: string;
  statusFilter: string;
  sortMode: string;
  onCustomerSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
}) {
  if (route.kind === "default") {
    return (
      <DefaultDashboard
        customerSearch={customerSearch}
        statusFilter={statusFilter}
        sortMode={sortMode}
        onCustomerSearch={onCustomerSearch}
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
  activeRoute,
  onQuery,
  onClose,
  onActivate
}: {
  open: boolean;
  query: string;
  activeRoute: StudioRouteId;
  onQuery: (value: string) => void;
  onClose: () => void;
  onActivate: (routeId: StudioRouteId) => void;
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
          <input autoFocus value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search dashboards, pages, and legacy views..." />
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
                  onActivate(route.id);
                  onClose();
                }}
              >
                <Icon aria-hidden="true" />
                <span><strong>{item.title}</strong><small>{route.description}</small></span>
              </a>
            );
          })}
          <a href={cvHref()} className="command-cv-link" target="_blank" rel="noreferrer">
            <LuExternalLink aria-hidden="true" />
            <span><strong>Back to CV</strong><small>Open the CV PDF file.</small></span>
          </a>
        </div>
      </section>
    </div>
  );
}

export function StudioAdminShell({ locale }: StudioAdminShellProps) {
  const [activeRoute, setActiveRoute] = useState<StudioRouteId>(() => (typeof window === "undefined" ? DEFAULT_ROUTE : normalizeHash(window.location.hash)));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ authentication: false, "legacy-dashboards": false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("joined");
  const route = routeDefinitions[activeRoute];

  useEffect(() => {
    const syncRoute = () => setActiveRoute(normalizeHash(window.location.hash));
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
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setAccountOpen(false);
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activateRoute = useCallback((routeId: StudioRouteId) => {
    setActiveRoute(routeId);
    setMobileSidebarOpen(false);
    setAccountOpen(false);
    const nextHash = routeHref(routeId);
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  }, []);

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    activateRoute(DEFAULT_ROUTE);
  };

  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      setMobileSidebarOpen((value) => !value);
      return;
    }
    setSidebarCollapsed((value) => !value);
  };

  return (
    <div
      className={`studio-admin${sidebarCollapsed ? " is-sidebar-collapsed" : ""}${mobileSidebarOpen ? " is-mobile-open" : ""}${darkMode ? " is-dark" : ""}`}
      data-locale={locale}
      data-route={activeRoute}
    >
      <aside className="studio-sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <a className="sidebar-brand" href={routeHref(DEFAULT_ROUTE)} aria-label="Open default dashboard" onClick={handleBrandClick}>
            <LuCommand aria-hidden="true" />
            <span>Studio Admin</span>
          </a>
          <button className="sidebar-close" type="button" onClick={() => setMobileSidebarOpen(false)} aria-label="Close navigation">
            <LuX aria-hidden="true" />
          </button>
        </div>

        <div className="sidebar-create">
          <button type="button" className="quick-create" onClick={() => setSearchOpen(true)}>
            <LuPlusCircle aria-hidden="true" />
            <span>Quick Create</span>
          </button>
          <button type="button" className="mail-button" aria-label="Open email route" onClick={() => activateRoute("email")}>
            <LuInbox aria-hidden="true" />
          </button>
        </div>

        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <SidebarGroup
              key={group.id}
              group={group}
              activeRoute={activeRoute}
              expanded={expanded}
              collapsed={sidebarCollapsed}
              onActivate={activateRoute}
              onToggle={(id) => setExpanded((value) => ({ ...value, [id]: !(value[id] ?? false) }))}
            />
          ))}
        </div>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <section className="support-card">
              <strong>Looking for the CV?</strong>
              <p>
                The admin shell stays isolated here. Open the <a href={cvHref()} target="_blank" rel="noreferrer">CV file</a> any time.
              </p>
            </section>
          )}

          <a className="user-card" href={cvHref()} target="_blank" rel="noreferrer">
            <span className="user-avatar">N</span>
            <span>
              <strong>Nguyen Le Phong</strong>
              <small>Back to CV</small>
            </span>
            <LuMoreVertical aria-hidden="true" />
          </a>
        </div>
      </aside>

      {mobileSidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)} />}

      <main className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-left">
            <button type="button" className="icon-button" aria-label="Toggle navigation" onClick={toggleSidebar}>
              {mobileSidebarOpen ? <LuX aria-hidden="true" /> : <LuPanelLeft aria-hidden="true" />}
            </button>
            <span className="topbar-separator" aria-hidden="true" />
            <button type="button" className="search-command" onClick={() => setSearchOpen(true)}>
              <LuSearch aria-hidden="true" />
              <span>Search</span>
              <kbd>Cmd J</kbd>
            </button>
          </div>

          <div className="topbar-actions">
            <button type="button" className="topbar-icon" aria-label="Open settings" onClick={() => setAccountOpen((value) => !value)}>
              <LuSettings aria-hidden="true" />
            </button>
            <button type="button" className="topbar-icon" aria-label="Toggle theme" onClick={() => setDarkMode((value) => !value)}>
              {darkMode ? <LuSun aria-hidden="true" /> : <LuMoon aria-hidden="true" />}
            </button>
            <a
              className="topbar-icon"
              href="https://github.com/arhamkhnz/next-shadcn-admin-dashboard"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub repository"
            >
              <LuGithub aria-hidden="true" />
            </a>
            <button type="button" className="topbar-avatar" onClick={() => setAccountOpen((value) => !value)} aria-label="Open account menu">N</button>
            {accountOpen && (
              <section className="account-popover">
                <strong>Nguyen Le Phong</strong>
                <span>Studio preview account</span>
                <a href={cvHref()} target="_blank" rel="noreferrer">Back to CV</a>
              </section>
            )}
          </div>
        </header>

        <div className="dashboard-content" id="dashboard">
          <RouteContent
            route={route}
            customerSearch={customerSearch}
            statusFilter={statusFilter}
            sortMode={sortMode}
            onCustomerSearch={setCustomerSearch}
            onStatusFilter={setStatusFilter}
            onSortMode={setSortMode}
          />
        </div>
      </main>

      <CommandDialog
        open={searchOpen}
        query={searchQuery}
        activeRoute={activeRoute}
        onQuery={setSearchQuery}
        onClose={() => setSearchOpen(false)}
        onActivate={activateRoute}
      />
    </div>
  );
}
