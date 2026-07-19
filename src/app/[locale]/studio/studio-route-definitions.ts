import type { StudioRoute } from "./studio-route-contract";
import type { StudioRouteId } from "./studio-route-catalog";
import {
  LuBanknote, LuBarChart, LuBoxes, LuCalendarDays, LuClipboardList, LuFingerprint,
  LuGauge, LuGraduationCap, LuKanbanSquare, LuLayoutDashboard, LuListTodo, LuLock,
  LuMail, LuMessageSquare, LuServer, LuShoppingBag, LuSmile, LuSparkles, LuUsers,
  LuWorkflow
} from "react-icons/lu";

type StudioFlowRouteId = Extract<
  StudioRouteId,
  | "flow-system-design"
  | "flow-architecture-decision"
  | "flow-incident-response"
  | "flow-release-readiness"
  | "flow-ai-delivery"
  | "flow-portfolio-story"
  | "flow-react-flow-architecture-demo"
  | "flow-react-flow-system-blueprint"
>;

const flowRouteMetadata: Record<StudioFlowRouteId, Pick<StudioRoute, "title" | "description">> = {
  "flow-system-design": { title: "System Design Flow", description: "A repeatable path from an ambiguous problem to clear boundaries, explicit trade-offs, and known failure modes." },
  "flow-architecture-decision": { title: "Architecture Decision Flow", description: "A compact RFC and ADR path for comparing options, risk gates, and rollback choices." },
  "flow-incident-response": { title: "Incident Response Flow", description: "A response path covering verification, mitigation, communication, recovery, and learning." },
  "flow-release-readiness": { title: "Release Readiness Flow", description: "A final gate for scope, data, testing, observability, and rollback before production." },
  "flow-ai-delivery": { title: "AI-assisted Delivery Flow", description: "A delivery path that keeps task boundaries, source context, verification, and human judgment explicit." },
  "flow-portfolio-story": { title: "Portfolio Story Flow", description: "A path for turning verified engineering work into a clear, evidence-backed portfolio story." },
  "flow-react-flow-architecture-demo": { title: "React Flow Examples", description: "Interactive patterns for navigation, grouping, layout, whiteboards, and architecture diagrams." },
  "flow-react-flow-system-blueprint": { title: "System Blueprint", description: "A detailed map for DNS, edge policy, load balancing, storage, media processing, queues, and fan-out services." }
};

function createFlowRouteDefinition(
  routeId: StudioFlowRouteId,
  panels: string[],
  timeline: string[]
): StudioRoute {
  const metadata = flowRouteMetadata[routeId];
  return {
    id: routeId,
    title: metadata.title,
    description: metadata.description,
    kind: "flows",
    icon: LuWorkflow,
    badge: "new",
    metrics: [],
    panels,
    timeline
  };
}

function createAuthRouteDefinition(
  routeId: Extract<StudioRouteId, "auth-login-v1" | "auth-login-v2" | "auth-register-v1" | "auth-register-v2">,
  title: string,
  description: string,
  panels: string[],
  timeline: string[]
): StudioRoute {
  return { routeId, id: routeId, title, description, kind: "auth", icon: LuFingerprint, metrics: [], panels, timeline } as StudioRoute;
}

export const routeDefinitions: Record<StudioRouteId, StudioRoute> = {
  welcome: {
    id: "welcome",
    title: "Welcome",
    description: "A quiet starting point for the personal Studio: working notes, reusable workflows, and the public profile links I reach for most.",
    kind: "welcome",
    icon: LuSmile,
    metrics: [] ,
    panels: ["Start here", "Useful links", "Studio routes"],
    timeline: ["Open the right workspace", "Keep context close", "Move from idea to proof"]
  },
  default: {
    id: "default",
    title: "Engineering Ops",
    description: "Release health, traffic quality, rollout control, component inventory, and operational workstreams.",
    kind: "default",
    icon: LuLayoutDashboard,
    metrics: [] ,
    panels: ["Release Signal", "Component Inventory", "System Workstreams"],
    timeline: ["Gateway rollback criteria reviewed", "Feature flag audit completed", "PostHog anomaly window closed"]
  },
  crm: {
    id: "crm",
    title: "CRM",
    description: "Stakeholder follow-ups, delivery pipeline notes, and opportunity health in the Studio shell.",
    kind: "dashboard",
    icon: LuBarChart,
    metrics: [] ,
    panels: ["Pipeline Activity", "Task Reminders", "Opportunities"],
    timeline: ["Lead scored by AI", "Proposal follow-up due", "Enterprise deal moved to negotiation"]
  },
  finance: {
    id: "finance",
    title: "Personal Finances",
    description: "Accounts, transactions, and balance distribution with functional tabs.",
    kind: "finance",
    icon: LuBanknote,
    metrics: [] ,
    panels: ["Transactions Overview", "Balance Distribution", "Upcoming Transactions"],
    timeline: ["Updated 5 min ago", "Wallet synced", "Export prepared"]
  },
  analytics: {
    id: "analytics",
    title: "Hello, Aiy",
    description: "Monitor traffic, engagement, and conversion performance in one view.",
    kind: "analytics",
    icon: LuGauge,
    metrics: [] ,
    panels: ["Traffic Quality", "Realtime Visitors", "Top Traffic Sources"],
    timeline: ["Realtime audience refreshed", "Conversion goal updated", "Top page changed"]
  },
  productivity: {
    id: "productivity",
    title: "Good morning, Arham.",
    description: "Tasks, projects, focus time, and weekly planning blocks.",
    kind: "productivity",
    icon: LuListTodo,
    metrics: [] ,
    panels: ["Tasks Section", "Projects Section", "Quick Actions"],
    timeline: ["Focus block started", "Project status changed", "Weekly summary generated"]
  },
  ecommerce: {
    id: "ecommerce",
    title: "Store Overview",
    description: "Revenue, inventory, traffic sources, and recent orders.",
    kind: "ecommerce",
    icon: LuShoppingBag,
    metrics: [] ,
    panels: ["Store Traffic", "Top Products", "Recent Orders"],
    timeline: ["New order imported", "Inventory alert cleared", "Traffic source updated"]
  },
  academy: {
    id: "academy",
    title: "Academy Dashboard",
    description: "Class schedule, assignment status, and performance highlights.",
    kind: "academy",
    icon: LuGraduationCap,
    metrics: [] ,
    panels: ["Class Schedule", "Assignment Status", "Upcoming Events"],
    timeline: ["New announcement drafted", "Gradebook synced", "Assignment added"]
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    description: "Shipment routing, delivery states, and warehouse capacity.",
    kind: "logistics",
    icon: LuBoxes,
    metrics: [] ,
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
    metrics: [] ,
    panels: ["Project Environments", "Production Services", "Incident Ledger"],
    timeline: ["Production deploy passed", "Preview environment created", "Alert acknowledged"]
  },
  email: {
    id: "email",
    title: "Email",
    description: "Inbox, pinned messages, selected thread, attachments, and reply composer inside the Studio shell.",
    kind: "mail",
    icon: LuMail,
    metrics: [] ,
    panels: ["Inbox", "Conversation", "Composer"],
    timeline: ["Invoice email opened", "Newsletter archived", "Follow-up drafted"]
  },
  chat: {
    id: "chat",
    title: "Chat",
    description: "Conversation inbox with grouped threads, message composer, unread states, and contact profile.",
    kind: "chat",
    icon: LuMessageSquare,
    metrics: [] ,
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
    metrics: [] ,
    panels: ["Setup library", "Agent workflow", "Command runbook"],
    timeline: ["Skill library reviewed", "MCP install path captured", "Credential guardrail checked"]
  },
  "ai-skills": {
    id: "ai-skills",
    title: "AI Skills",
    description: "Reusable agent skills distilled from installed Codex, Claude, Gemini, Antigravity, and local skill libraries.",
    kind: "ai-skills",
    icon: LuSparkles,
    badge: "new",
    metrics: [] ,
    panels: ["Skill taxonomy", "Markdown preview", "Copy-ready prompt"],
    timeline: ["Installed skills inventoried", "Capability gaps mapped", "English and Vietnamese prompts prepared"]
  },
  "delivery-checklists": {
    id: "delivery-checklists",
    title: "Delivery Checklists",
    description: "Operating checklists from task intake through module work, release readiness, and rollout.",
    kind: "checklists",
    icon: LuClipboardList,
    badge: "new",
    metrics: [] ,
    panels: ["Task intake", "Module creation", "Release and rollout"],
    timeline: ["Ticket intake path mapped", "Module checklist nested", "Rollout phases captured"]
  },
  "flow-system-design": createFlowRouteDefinition("flow-system-design", ["Problem frame", "Runtime map", "Failure modes"], ["Requirement frame set", "Data ownership mapped", "Evolution path documented"]),
  "flow-architecture-decision": createFlowRouteDefinition("flow-architecture-decision", ["Decision scope", "Option matrix", "Risk gates"], ["Invariants listed", "Options compared", "Decision note ready"]),
  "flow-incident-response": createFlowRouteDefinition("flow-incident-response", ["Signal", "Mitigation", "Postmortem"], ["Signal confirmed", "Blast radius contained", "Follow-up owners assigned"]),
  "flow-release-readiness": createFlowRouteDefinition("flow-release-readiness", ["Scope", "Verification", "Rollout decision"], ["Scope checked", "Analytics and SEO reviewed", "Rollback trigger named"]),
  "flow-ai-delivery": createFlowRouteDefinition("flow-ai-delivery", ["Task brief", "Context pack", "Verification"], ["Boundaries set", "Focused diff reviewed", "Handoff prepared"]),
  "flow-portfolio-story": createFlowRouteDefinition("flow-portfolio-story", ["Context", "Trade-offs", "Impact"], ["Context captured", "Impact evidence selected", "Story draft shaped"]),
  "flow-react-flow-architecture-demo": createFlowRouteDefinition("flow-react-flow-architecture-demo", ["Node shapes", "Edge language", "Architecture zones"], ["Node primitives displayed", "Architecture shapes mapped", "Canvas controls enabled"]),
  "flow-react-flow-system-blueprint": createFlowRouteDefinition("flow-react-flow-system-blueprint", ["Full blueprint", "Focused views", "Production vocabulary"], ["DNS path mapped", "Runtime and storage linked", "Media fan-out modeled"]),
  calendar: {
    id: "calendar",
    title: "Calendar",
    description: "Event calendar with day blocks and meeting density.",
    kind: "calendar",
    icon: LuCalendarDays,
    metrics: [] ,
    panels: ["Month View", "Upcoming Events", "Availability"],
    timeline: ["Design review moved", "Focus block added", "Release check scheduled"]
  },
  kanban: {
    id: "kanban",
    title: "Kanban",
    description: "Task board with columns, cards, status, and review-ready engineering work.",
    kind: "kanban",
    icon: LuKanbanSquare,
    metrics: [] ,
    panels: ["Todo", "In progress", "Done"],
    timeline: ["Task moved to review", "Bug triaged", "Release note drafted"]
  },
  invoice: {
    id: "invoice",
    title: "Invoice",
    description: "Invoice form and preview surface with export action.",
    kind: "invoice",
    icon: LuClipboardList,
    metrics: [] ,
    panels: ["Client", "Line Items", "Preview"],
    timeline: ["Invoice preview updated", "Tax recalculated", "PDF export ready"]
  },
  users: {
    id: "users",
    title: "Users",
    description: "Users table with search, roles, and account status.",
    kind: "users",
    icon: LuUsers,
    metrics: [] ,
    panels: ["Directory", "Access", "Invitations"],
    timeline: ["User invited", "Role updated", "Account suspended"]
  },
  roles: {
    id: "roles",
    title: "Roles",
    description: "Role cards and permission groups.",
    kind: "roles",
    icon: LuLock,
    metrics: [] ,
    panels: ["Admin", "Editor", "Viewer"],
    timeline: ["Permission changed", "Role reviewed", "Access report exported"]
  },
  "auth-login-v1": createAuthRouteDefinition("auth-login-v1", "Login v1", "Authentication route preview opened inside Studio instead of a new project.", ["Credentials", "Social auth", "Security"], ["Session created", "Password reset checked", "Device trusted"]),
  "auth-login-v2": createAuthRouteDefinition("auth-login-v2", "Login v2", "Alternate authentication layout with the same shell behavior.", ["Credentials", "Magic link", "Security"], ["Magic link generated", "Session checked", "Device trusted"]),
  "auth-register-v1": {
    id: "auth-register-v1",
    title: "Register v1",
    description: "Registration screen preview with plan and role fields.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: [] ,
    panels: ["Account", "Profile", "Invite"],
    timeline: ["Invite accepted", "Profile created", "Welcome email queued"]
  },
  "auth-register-v2": {
    id: "auth-register-v2",
    title: "Register v2",
    description: "Second registration variant with workspace, invite, and access-review states.",
    kind: "auth",
    icon: LuFingerprint,
    metrics: [] ,
    panels: ["Account", "Workspace", "Invite"],
    timeline: ["Workspace created", "Invite accepted", "Welcome email queued"]
  },
  "legacy-default": {
    id: "legacy-default",
    title: "Default V1",
    description: "Legacy dashboard variant kept accessible from the source navigation.",
    kind: "legacy",
    icon: LuLayoutDashboard,
    metrics: [] ,
    panels: ["Proposal Sections", "Legacy Chart", "Queue"],
    timeline: ["Legacy chart refreshed", "Proposal section reviewed", "Queue exported"]
  },
  "legacy-crm": {
    id: "legacy-crm",
    title: "CRM V1",
    description: "Legacy CRM variant kept under the collapsible dashboard group.",
    kind: "legacy",
    icon: LuBarChart,
    metrics: [] ,
    panels: ["Overview Cards", "Recent Leads", "Insight Cards"],
    timeline: ["Lead imported", "Opportunity updated", "Campaign reviewed"]
  },
  "legacy-finance": {
    id: "legacy-finance",
    title: "Finance V1",
    description: "Legacy finance view with cash-flow and spending cards.",
    kind: "legacy",
    icon: LuBanknote,
    metrics: [] ,
    panels: ["Cash Flow", "Spending Breakdown", "Income Reliability"],
    timeline: ["Cash flow updated", "Budget reviewed", "Account synced"]
  },
  "legacy-analytics": {
    id: "legacy-analytics",
    title: "Analytics V1",
    description: "Legacy analytics view with drivers, risk ledger, and action queue.",
    kind: "legacy",
    icon: LuGauge,
    metrics: [] ,
    panels: ["Drivers Coverage", "Risk Ledger", "Action Queue"],
    timeline: ["Risk updated", "Driver reviewed", "Queue reordered"]
  }
};
