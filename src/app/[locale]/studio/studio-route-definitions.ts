import type { StudioRoute } from "./studio-route-contract";
import type { StudioRouteId } from "./studio-route-catalog";
import { LuClipboardList, LuSmile, LuSparkles, LuWorkflow } from "react-icons/lu";

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
  "flow-react-flow-system-blueprint": createFlowRouteDefinition("flow-react-flow-system-blueprint", ["Full blueprint", "Focused views", "Production vocabulary"], ["DNS path mapped", "Runtime and storage linked", "Media fan-out modeled"])
};
