
import type { StudioMetric } from "./studio-route-contract";
import type { StudioRouteId } from "./studio-route-catalog";
import {
  LuAlarmClock, LuArrowUpDown, LuBadgeDollarSign, LuBanknote, LuBarChart, LuBell,
  LuBookOpenCheck, LuBoxes, LuBriefcase, LuCalendarDays, LuCheck, LuCheckCircle2,
  LuClipboardList, LuCreditCard, LuDatabase, LuFileText, LuFingerprint,
  LuFlag, LuGauge, LuGithub, LuGraduationCap, LuHelpCircle, LuKanbanSquare,
  LuLayoutDashboard, LuLineChart, LuLink, LuListTodo, LuLock, LuMail, LuMailOpen,
  LuMessageSquare, LuMonitor, LuPin, LuReply, LuRotateCw, LuServer,
  LuShoppingBag, LuSlidersHorizontal, LuTag, LuUser, LuUserPlus,
  LuUsers, LuWaves
} from "react-icons/lu";

export const defaultMetrics: StudioMetric[] = [
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

export const routeMetrics: Partial<Record<StudioRouteId, StudioMetric[]>> = {
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
