import type {
  StudioFlowArchitectureDemo,
  StudioFlowArchitectureEdgeSpec,
  StudioFlowArchitectureNodeSpec,
  StudioFlowArchitectureViewSpec
} from "./studio.data";

const serviceMapNodes: StudioFlowArchitectureNodeSpec[] = [
  {
    id: "client-zone",
    kind: "group",
    tone: "source",
    title: "Client boundary",
    detail: "Large visible zone for user-facing clients.",
    badge: "group",
    position: { x: -760, y: -270 },
    size: { width: 540, height: 250 }
  },
  {
    id: "internet-user",
    kind: "input",
    tone: "source",
    title: "Input node",
    detail: "Customer, partner webhook, scheduler, or mobile event.",
    badge: "built-in",
    position: { x: -700, y: -160 }
  },
  {
    id: "web-app",
    kind: "default",
    tone: "process",
    title: "Default node",
    detail: "Web app, BFF, dashboard, or internal UI surface.",
    badge: "built-in",
    position: { x: -450, y: -160 }
  },
  {
    id: "edge-zone",
    kind: "group",
    tone: "review",
    title: "Edge and policy boundary",
    detail: "Ingress, security controls, routing, and approval gates.",
    badge: "group",
    position: { x: -120, y: -270 },
    size: { width: 590, height: 300 }
  },
  {
    id: "api-gateway",
    kind: "gateway",
    tone: "review",
    title: "API Gateway",
    detail: "Ingress, rate limit, auth handoff, routing, and request shaping.",
    badge: "gateway",
    position: { x: -40, y: -165 }
  },
  {
    id: "auth-service",
    kind: "service",
    tone: "review",
    title: "Auth service",
    detail: "Token exchange, tenancy lookup, and session checks.",
    badge: "service",
    position: { x: 235, y: -195 }
  },
  {
    id: "policy-decision",
    kind: "decision",
    tone: "review",
    title: "Policy?",
    detail: "Permission, rollout, compliance, or tenancy branch.",
    badge: "decision",
    position: { x: 255, y: -35 },
    size: { width: 160, height: 128 }
  },
  {
    id: "rate-limit-risk",
    kind: "risk",
    tone: "risk",
    title: "Risk gate",
    detail: "Throttle abuse, isolate failures, and protect hot paths.",
    badge: "risk",
    position: { x: -40, y: -5 }
  },
  {
    id: "ops-zone",
    kind: "group",
    tone: "risk",
    title: "Operations and reliability",
    detail: "Release gates, observability, audit, and rollback controls.",
    badge: "group",
    position: { x: 560, y: -270 },
    size: { width: 660, height: 300 }
  },
  {
    id: "observability",
    kind: "note",
    tone: "risk",
    title: "Telemetry note",
    detail: "Logs, traces, metrics, owner, dashboard, and alert route.",
    badge: "note",
    position: { x: 640, y: -190 }
  },
  {
    id: "rollback",
    kind: "risk",
    tone: "risk",
    title: "Rollback plan",
    detail: "Feature flag, migration reverse path, and blast-radius limit.",
    badge: "control",
    position: { x: 930, y: -190 }
  },
  {
    id: "audit-log",
    kind: "database",
    tone: "risk",
    title: "Audit log",
    detail: "Append-only record for admin, money, and privacy actions.",
    badge: "audit",
    position: { x: 790, y: -30 }
  },
  {
    id: "domain-zone",
    kind: "group",
    tone: "process",
    title: "Domain services",
    detail: "Bounded context with services, stream, workers, and retry path.",
    badge: "sub-flow",
    position: { x: -760, y: 120 },
    size: { width: 900, height: 390 }
  },
  {
    id: "order-service",
    kind: "service",
    tone: "process",
    title: "Order service",
    detail: "Command handling, validation, idempotency, and aggregate owner.",
    badge: "service",
    position: { x: -690, y: 260 }
  },
  {
    id: "inventory-service",
    kind: "service",
    tone: "process",
    title: "Inventory service",
    detail: "Peer service that owns stock reservation and release.",
    badge: "service",
    position: { x: -410, y: 230 }
  },
  {
    id: "domain-events",
    kind: "topic",
    tone: "event",
    title: "Event topic",
    detail: "Pub/sub stream for projections and downstream consumers.",
    badge: "event",
    position: { x: -135, y: 220 }
  },
  {
    id: "worker",
    kind: "worker",
    tone: "agent",
    title: "Worker",
    detail: "Async processor for side effects and long-running jobs.",
    badge: "worker",
    position: { x: -410, y: 390 }
  },
  {
    id: "order-queue",
    kind: "queue",
    tone: "event",
    title: "Queue",
    detail: "Buffered command stream, retry budget, DLQ, and backpressure.",
    badge: "async",
    position: { x: -135, y: 390 }
  },
  {
    id: "data-zone",
    kind: "group",
    tone: "storage",
    title: "Data plane",
    detail: "Transactional source, cache, and read models stay separated.",
    badge: "group",
    position: { x: 235, y: 140 },
    size: { width: 690, height: 360 }
  },
  {
    id: "primary-db",
    kind: "database",
    tone: "storage",
    title: "Primary DB",
    detail: "Source-of-truth transactional storage.",
    badge: "database",
    position: { x: 315, y: 245 }
  },
  {
    id: "redis-cache",
    kind: "cache",
    tone: "storage",
    title: "Cache",
    detail: "Redis, CDN cache, local cache, or materialized lookup.",
    badge: "cache",
    position: { x: 615, y: 235 }
  },
  {
    id: "warehouse",
    kind: "database",
    tone: "storage",
    title: "Warehouse",
    detail: "Read model, BI table, lakehouse, or audit archive.",
    badge: "read model",
    position: { x: 615, y: 390 }
  },
  {
    id: "payment-provider",
    kind: "external",
    tone: "external",
    title: "External SaaS",
    detail: "Payment provider, partner API, KYC vendor, or cloud service.",
    badge: "external",
    position: { x: 1060, y: 225 }
  },
  {
    id: "response",
    kind: "output",
    tone: "output",
    title: "Output node",
    detail: "Final status, receipt, user notification, or public response.",
    badge: "built-in",
    position: { x: 1060, y: 385 }
  }
];

const serviceMapEdges: StudioFlowArchitectureEdgeSpec[] = [
  { id: "user-web", source: "internet-user", target: "web-app", type: "straight", label: "straight edge", tone: "source", marker: "arrowClosed" },
  { id: "web-gateway", source: "web-app", target: "api-gateway", type: "smoothstep", label: "smoothstep request", tone: "process", marker: "arrowClosed" },
  { id: "gateway-auth", source: "api-gateway", target: "auth-service", type: "step", label: "step auth check", tone: "review", marker: "arrowClosed" },
  { id: "gateway-policy", source: "api-gateway", target: "policy-decision", type: "default", label: "default decision", tone: "review", marker: "arrowClosed" },
  { id: "gateway-risk", source: "api-gateway", target: "rate-limit-risk", type: "simplebezier", label: "risk path", tone: "risk", marker: "arrow" },
  { id: "policy-order", source: "policy-decision", target: "order-service", type: "smoothstep", label: "allowed command", tone: "process", marker: "arrowClosed" },
  { id: "order-inventory", source: "order-service", target: "inventory-service", type: "default", label: "sync call", tone: "process", marker: "arrowClosed" },
  { id: "order-db", source: "order-service", target: "primary-db", type: "smoothstep", label: "transaction", tone: "storage", marker: "arrowClosed" },
  { id: "order-cache", source: "order-service", target: "redis-cache", type: "simplebezier", label: "read-through", tone: "storage", marker: "arrow" },
  { id: "order-events", source: "order-service", target: "domain-events", type: "step", label: "animated publish", tone: "event", marker: "arrowClosed", animated: true },
  { id: "events-worker", source: "domain-events", target: "worker", type: "smoothstep", label: "async consume", tone: "event", marker: "arrowClosed", animated: true },
  { id: "worker-queue", source: "worker", target: "order-queue", type: "straight", label: "retry / DLQ", tone: "event", marker: "arrowClosed", animated: true },
  { id: "events-warehouse", source: "domain-events", target: "warehouse", type: "simplebezier", label: "projection", tone: "storage", marker: "arrow" },
  { id: "order-payment", source: "order-service", target: "payment-provider", type: "smoothstep", label: "partner API", tone: "external", marker: "arrowClosed" },
  { id: "provider-response", source: "payment-provider", target: "response", type: "step", label: "final status", tone: "output", marker: "arrowClosed" },
  { id: "gateway-observability", source: "api-gateway", target: "observability", type: "simplebezier", label: "metrics / traces", tone: "risk", marker: "arrow" },
  { id: "order-audit", source: "order-service", target: "audit-log", type: "smoothstep", label: "append audit", tone: "risk", marker: "arrowClosed" },
  { id: "rollback-audit", source: "rollback", target: "audit-log", type: "straight", label: "release evidence", tone: "risk", marker: "arrow" }
];

const reactFlowViews: StudioFlowArchitectureViewSpec[] = [
  {
    id: "feature-overview",
    family: "overview",
    title: "Feature overview",
    description: "A compact map of built-in node roles, custom cards, labels, handles, markers, and canvas aids.",
    notes: ["Built-in input/default/output nodes", "Custom cards with multiple handles", "MiniMap, Controls, Background, markers, labels"],
    nodes: [
      { id: "overview-input", kind: "input", tone: "source", title: "Input", detail: "Entry trigger with left-to-right handle language.", badge: "built-in", position: { x: -520, y: -80 } },
      { id: "overview-default", kind: "default", tone: "process", title: "Default", detail: "Simple rectangular node for quick workflow sketches.", badge: "built-in", position: { x: -240, y: -80 } },
      { id: "overview-service", kind: "service", tone: "agent", title: "Custom node", detail: "React component node with badge, body copy, and themed status.", badge: "custom", position: { x: 40, y: -80 } },
      { id: "overview-output", kind: "output", tone: "output", title: "Output", detail: "Final state, user response, export, or completion signal.", badge: "built-in", position: { x: 330, y: -80 } },
      { id: "overview-note", kind: "note", tone: "review", title: "Panel overlay", detail: "Use fixed UI outside nodes for selectors and diagram controls.", badge: "panel", position: { x: -240, y: 110 } },
      { id: "overview-risk", kind: "risk", tone: "risk", title: "Highlighted state", detail: "Tone can mark error, warning, review, or blocked states.", badge: "state", position: { x: 40, y: 110 } }
    ],
    edges: [
      { id: "overview-edge-1", source: "overview-input", target: "overview-default", type: "smoothstep", label: "smoothstep", tone: "source", marker: "arrowClosed" },
      { id: "overview-edge-2", source: "overview-default", target: "overview-service", type: "default", label: "default", tone: "process", marker: "arrowClosed" },
      { id: "overview-edge-3", source: "overview-service", target: "overview-output", type: "straight", label: "straight", tone: "output", marker: "arrowClosed" },
      { id: "overview-edge-4", source: "overview-default", target: "overview-note", type: "step", label: "step", tone: "review", marker: "arrow" },
      { id: "overview-edge-5", source: "overview-service", target: "overview-risk", type: "simplebezier", label: "simplebezier", tone: "risk", marker: "arrow" }
    ]
  },
  {
    id: "subflows-grouping",
    family: "grouping",
    title: "Subflows and grouping",
    description: "Group boundaries, parent-child reading order, and nested systems without hiding important inner nodes.",
    notes: ["Group nodes for bounded contexts", "Child-like placement inside a visible boundary", "Cross-boundary edge from one subflow to another"],
    nodes: [
      { id: "group-client", kind: "group", tone: "source", title: "Client group", detail: "A parent-like visual boundary.", badge: "group", position: { x: -560, y: -180 }, size: { width: 460, height: 290 } },
      { id: "group-api", kind: "group", tone: "process", title: "API group", detail: "Nested service area.", badge: "group", position: { x: -20, y: -180 }, size: { width: 520, height: 290 } },
      { id: "group-mobile", kind: "input", tone: "source", title: "Mobile app", detail: "Child visual inside client group.", badge: "child", position: { x: -500, y: -70 } },
      { id: "group-web", kind: "default", tone: "source", title: "Web app", detail: "Sibling child node in same boundary.", badge: "child", position: { x: -275, y: -70 } },
      { id: "group-gateway", kind: "gateway", tone: "review", title: "Gateway", detail: "Boundary crossing starts here.", badge: "edge", position: { x: 35, y: -70 } },
      { id: "group-service", kind: "service", tone: "process", title: "Profile service", detail: "Service inside API group.", badge: "child", position: { x: 275, y: -70 } },
      { id: "group-db", kind: "database", tone: "storage", title: "Profile DB", detail: "Storage can sit inside or outside the group.", badge: "data", position: { x: 155, y: 95 } }
    ],
    edges: [
      { id: "group-mobile-gateway", source: "group-mobile", target: "group-gateway", type: "smoothstep", label: "client call", tone: "source", marker: "arrowClosed" },
      { id: "group-web-gateway", source: "group-web", target: "group-gateway", type: "smoothstep", label: "same parent", tone: "source", marker: "arrowClosed" },
      { id: "group-gateway-service", source: "group-gateway", target: "group-service", type: "step", label: "cross group", tone: "process", marker: "arrowClosed" },
      { id: "group-service-db", source: "group-service", target: "group-db", type: "smoothstep", label: "owns data", tone: "storage", marker: "arrowClosed" }
    ]
  },
  {
    id: "layout-dagre-tree",
    family: "layout",
    title: "Dagre-style tree",
    description: "A layered left-to-right tree for dependency graphs, org-like structures, and traceable decision paths.",
    notes: ["Hierarchy reads from left to right", "Siblings stay on separate rows", "Good for architecture dependency explanation"],
    nodes: [
      { id: "tree-root", kind: "input", tone: "source", title: "Root request", detail: "Single entry point for a layout tree.", badge: "root", position: { x: -560, y: 65 } },
      { id: "tree-router", kind: "gateway", tone: "review", title: "Router", detail: "Branches the request by path or tenant.", badge: "branch", position: { x: -280, y: 65 } },
      { id: "tree-a", kind: "service", tone: "process", title: "Service A", detail: "First branch at the same depth.", badge: "level 2", position: { x: 10, y: -85 } },
      { id: "tree-b", kind: "service", tone: "process", title: "Service B", detail: "Second branch keeps horizontal spacing.", badge: "level 2", position: { x: 10, y: 215 } },
      { id: "tree-a-db", kind: "database", tone: "storage", title: "A database", detail: "Leaf node under Service A.", badge: "leaf", position: { x: 310, y: -150 } },
      { id: "tree-a-cache", kind: "cache", tone: "storage", title: "A cache", detail: "Sibling leaf node.", badge: "leaf", position: { x: 310, y: 0 } },
      { id: "tree-b-worker", kind: "worker", tone: "agent", title: "Worker B", detail: "Async leaf under Service B.", badge: "leaf", position: { x: 310, y: 160 } },
      { id: "tree-b-topic", kind: "topic", tone: "event", title: "Topic B", detail: "Event leaf under Service B.", badge: "leaf", position: { x: 310, y: 310 } }
    ],
    edges: [
      { id: "tree-root-router", source: "tree-root", target: "tree-router", type: "smoothstep", label: "request", tone: "source", marker: "arrowClosed" },
      { id: "tree-router-a", source: "tree-router", target: "tree-a", type: "smoothstep", label: "path A", tone: "process", marker: "arrowClosed" },
      { id: "tree-router-b", source: "tree-router", target: "tree-b", type: "smoothstep", label: "path B", tone: "process", marker: "arrowClosed" },
      { id: "tree-a-db", source: "tree-a", target: "tree-a-db", type: "smoothstep", label: "read/write", tone: "storage", marker: "arrowClosed" },
      { id: "tree-a-cache", source: "tree-a", target: "tree-a-cache", type: "smoothstep", label: "cache", tone: "storage", marker: "arrowClosed" },
      { id: "tree-b-worker", source: "tree-b", target: "tree-b-worker", type: "smoothstep", label: "job", tone: "agent", marker: "arrowClosed", animated: true },
      { id: "tree-b-topic", source: "tree-b", target: "tree-b-topic", type: "smoothstep", label: "publish", tone: "event", marker: "arrowClosed", animated: true }
    ]
  },
  {
    id: "expand-collapse",
    family: "layout",
    title: "Expand and collapse",
    description: "A tree view pattern with expanded and collapsed branches represented as separate visible states.",
    notes: ["Useful for large architecture maps", "Collapsed branch keeps the graph readable", "Expanded branch shows children only when needed"],
    nodes: [
      { id: "expand-root", kind: "input", tone: "source", title: "Root", detail: "Main topic or system.", badge: "root", position: { x: -520, y: -40 } },
      { id: "expand-open", kind: "service", tone: "process", title: "Expanded branch", detail: "Children are visible below this node.", badge: "expanded", position: { x: -210, y: -140 } },
      { id: "expand-closed", kind: "service", tone: "review", title: "Collapsed branch", detail: "Children are represented by a summary node.", badge: "collapsed", position: { x: -210, y: 120 } },
      { id: "expand-child-a", kind: "database", tone: "storage", title: "Child A", detail: "Visible child in expanded branch.", badge: "child", position: { x: 110, y: -230 } },
      { id: "expand-child-b", kind: "queue", tone: "event", title: "Child B", detail: "Visible child in expanded branch.", badge: "child", position: { x: 110, y: -80 } },
      { id: "expand-summary", kind: "note", tone: "review", title: "+ 4 hidden nodes", detail: "Collapsed placeholder keeps the canvas compact.", badge: "summary", position: { x: 110, y: 120 } },
      { id: "expand-output", kind: "output", tone: "output", title: "Selected path", detail: "A focused branch can still reach the final output.", badge: "output", position: { x: 440, y: -40 } }
    ],
    edges: [
      { id: "expand-root-open", source: "expand-root", target: "expand-open", type: "smoothstep", label: "open", tone: "process", marker: "arrowClosed" },
      { id: "expand-root-closed", source: "expand-root", target: "expand-closed", type: "smoothstep", label: "collapsed", tone: "review", marker: "arrowClosed" },
      { id: "expand-open-a", source: "expand-open", target: "expand-child-a", type: "smoothstep", label: "visible", tone: "storage", marker: "arrowClosed" },
      { id: "expand-open-b", source: "expand-open", target: "expand-child-b", type: "smoothstep", label: "visible", tone: "event", marker: "arrowClosed" },
      { id: "expand-closed-summary", source: "expand-closed", target: "expand-summary", type: "straight", label: "summary", tone: "review", marker: "arrow" },
      { id: "expand-a-output", source: "expand-child-a", target: "expand-output", type: "smoothstep", label: "selected", tone: "output", marker: "arrowClosed" },
      { id: "expand-b-output", source: "expand-child-b", target: "expand-output", type: "smoothstep", label: "selected", tone: "output", marker: "arrowClosed" }
    ]
  },
  {
    id: "validation-helper-lines",
    family: "interaction",
    title: "Validation and helper lines",
    description: "A modeling view for allowed connections, rejected connections, and alignment helpers.",
    notes: ["Green path for valid connection", "Red risk node for rejected connection", "Guide notes mark alignment and spacing"],
    nodes: [
      { id: "validation-source", kind: "input", tone: "source", title: "Source handle", detail: "Only approved edge targets should connect.", badge: "source", position: { x: -500, y: 40 } },
      { id: "validation-service", kind: "service", tone: "process", title: "Allowed target", detail: "Valid connection path.", badge: "valid", position: { x: -180, y: -80 } },
      { id: "validation-risk", kind: "risk", tone: "risk", title: "Rejected target", detail: "Invalid edge or forbidden dependency.", badge: "blocked", position: { x: -180, y: 170 } },
      { id: "validation-db", kind: "database", tone: "storage", title: "Allowed storage", detail: "Service owns this dependency.", badge: "owned", position: { x: 150, y: -80 } },
      { id: "validation-guide-x", kind: "note", tone: "review", title: "Helper line", detail: "Shows row alignment while moving nodes.", badge: "guide", position: { x: 150, y: 170 } },
      { id: "validation-output", kind: "output", tone: "output", title: "Accepted graph", detail: "Only valid paths become part of the diagram.", badge: "done", position: { x: 460, y: 40 } }
    ],
    edges: [
      { id: "validation-valid", source: "validation-source", target: "validation-service", type: "smoothstep", label: "valid", tone: "process", marker: "arrowClosed" },
      { id: "validation-invalid", source: "validation-source", target: "validation-risk", type: "simplebezier", label: "blocked", tone: "risk", marker: "arrow" },
      { id: "validation-service-db", source: "validation-service", target: "validation-db", type: "step", label: "owns", tone: "storage", marker: "arrowClosed" },
      { id: "validation-guide", source: "validation-guide-x", target: "validation-output", type: "straight", label: "aligned", tone: "review", marker: "arrow" },
      { id: "validation-db-output", source: "validation-db", target: "validation-output", type: "smoothstep", label: "accepted", tone: "output", marker: "arrowClosed" }
    ]
  },
  {
    id: "whiteboard-annotation",
    family: "whiteboard",
    title: "Whiteboard annotation",
    description: "A diagramming surface with sticky notes, framed areas, annotation arrows, and sketch-like review cues.",
    notes: ["Whiteboard examples are custom patterns on top of React Flow", "Notes and frames make design reviews easier", "Sketch-like nodes can coexist with real architecture nodes"],
    nodes: [
      { id: "whiteboard-frame", kind: "group", tone: "review", title: "Review frame", detail: "Framed region for a workshop or review topic.", badge: "rectangle", position: { x: -520, y: -190 }, size: { width: 520, height: 320 } },
      { id: "whiteboard-note", kind: "note", tone: "review", title: "Sticky note", detail: "Open question, reviewer comment, or decision reminder.", badge: "note", position: { x: -455, y: -70 } },
      { id: "whiteboard-service", kind: "service", tone: "process", title: "Candidate design", detail: "The actual node still behaves like part of the graph.", badge: "node", position: { x: -195, y: -70 } },
      { id: "whiteboard-lasso", kind: "group", tone: "source", title: "Selection area", detail: "A lasso-like boundary can describe multi-node operations.", badge: "lasso", position: { x: 130, y: -170 }, size: { width: 430, height: 280 } },
      { id: "whiteboard-a", kind: "default", tone: "source", title: "Selected A", detail: "First selected node.", badge: "select", position: { x: 190, y: -65 } },
      { id: "whiteboard-b", kind: "default", tone: "source", title: "Selected B", detail: "Second selected node.", badge: "select", position: { x: 390, y: -65 } },
      { id: "whiteboard-risk", kind: "risk", tone: "risk", title: "Reviewer flag", detail: "Annotation edge points to the concern.", badge: "flag", position: { x: 100, y: 170 } },
      { id: "whiteboard-output", kind: "output", tone: "output", title: "Decision", detail: "Approved change or follow-up action.", badge: "done", position: { x: 410, y: 170 } }
    ],
    edges: [
      { id: "whiteboard-note-service", source: "whiteboard-note", target: "whiteboard-service", type: "simplebezier", label: "comment", tone: "review", marker: "arrow" },
      { id: "whiteboard-service-a", source: "whiteboard-service", target: "whiteboard-a", type: "smoothstep", label: "compare", tone: "process", marker: "arrowClosed" },
      { id: "whiteboard-a-b", source: "whiteboard-a", target: "whiteboard-b", type: "straight", label: "same selection", tone: "source", marker: "arrow" },
      { id: "whiteboard-risk-output", source: "whiteboard-risk", target: "whiteboard-output", type: "step", label: "resolved", tone: "output", marker: "arrowClosed" }
    ]
  },
  {
    id: "styling-dark-turbo",
    family: "styling",
    title: "Styling and theming",
    description: "A view focused on shape language, color tone, badges, dashed nodes, dotted nodes, and status emphasis.",
    notes: ["React Flow nodes can be plain CSS or design-system components", "Tone maps help encode meaning consistently", "Useful before designing a reusable diagram kit"],
    nodes: [
      { id: "style-source", kind: "input", tone: "source", title: "Source tone", detail: "Blue input family.", badge: "source", position: { x: -500, y: -110 } },
      { id: "style-process", kind: "service", tone: "process", title: "Process tone", detail: "Core service or action.", badge: "process", position: { x: -230, y: -110 } },
      { id: "style-event", kind: "topic", tone: "event", title: "Event tone", detail: "Dotted event stream.", badge: "event", position: { x: 40, y: -110 } },
      { id: "style-storage", kind: "database", tone: "storage", title: "Storage tone", detail: "Cylinder for data ownership.", badge: "storage", position: { x: 310, y: -110 } },
      { id: "style-external", kind: "external", tone: "external", title: "External tone", detail: "Dashed boundary for dependencies.", badge: "external", position: { x: -230, y: 115 } },
      { id: "style-risk", kind: "risk", tone: "risk", title: "Risk tone", detail: "High-attention status.", badge: "risk", position: { x: 40, y: 115 } },
      { id: "style-output", kind: "output", tone: "output", title: "Output tone", detail: "Completed or accepted result.", badge: "output", position: { x: 310, y: 115 } }
    ],
    edges: [
      { id: "style-1", source: "style-source", target: "style-process", type: "smoothstep", label: "primary", tone: "source", marker: "arrowClosed" },
      { id: "style-2", source: "style-process", target: "style-event", type: "smoothstep", label: "publish", tone: "event", marker: "arrowClosed", animated: true },
      { id: "style-3", source: "style-event", target: "style-storage", type: "step", label: "project", tone: "storage", marker: "arrowClosed" },
      { id: "style-4", source: "style-external", target: "style-risk", type: "simplebezier", label: "risk", tone: "risk", marker: "arrow" },
      { id: "style-5", source: "style-risk", target: "style-output", type: "straight", label: "resolve", tone: "output", marker: "arrowClosed" }
    ]
  },
  {
    id: "architecture-service-map",
    family: "architecture",
    title: "Software architecture service map",
    description: "A fuller architecture diagram with client, edge, domain, data, external, and operations zones.",
    notes: ["Designed for architecture review and onboarding", "Uses all custom architecture shapes", "Layout is spaced by zones to avoid node and edge overlap"],
    nodes: serviceMapNodes,
    edges: serviceMapEdges
  },
  {
    id: "event-driven-architecture",
    family: "architecture",
    title: "Event-driven architecture",
    description: "Producer, broker, queue, worker, projection, audit, and notification paths with animated async edges.",
    notes: ["Good for explaining async fan-out", "Animated edges distinguish event paths", "DLQ and audit are first-class nodes"],
    nodes: [
      { id: "eda-client", kind: "input", tone: "source", title: "Checkout request", detail: "Command enters the system once.", badge: "input", position: { x: -620, y: 20 } },
      { id: "eda-command", kind: "service", tone: "process", title: "Command service", detail: "Validates and writes the command.", badge: "service", position: { x: -330, y: 20 } },
      { id: "eda-outbox", kind: "database", tone: "storage", title: "Outbox", detail: "Transactional event record.", badge: "outbox", position: { x: -45, y: -115 } },
      { id: "eda-topic", kind: "topic", tone: "event", title: "Order topic", detail: "Fan-out event stream.", badge: "topic", position: { x: -45, y: 135 } },
      { id: "eda-worker-a", kind: "worker", tone: "agent", title: "Payment worker", detail: "Consumes payment events.", badge: "worker", position: { x: 260, y: -130 } },
      { id: "eda-worker-b", kind: "worker", tone: "agent", title: "Email worker", detail: "Consumes notification events.", badge: "worker", position: { x: 260, y: 70 } },
      { id: "eda-dlq", kind: "queue", tone: "risk", title: "DLQ", detail: "Failed messages with replay owner.", badge: "risk", position: { x: 260, y: 270 } },
      { id: "eda-provider", kind: "external", tone: "external", title: "Payment API", detail: "External dependency behind retries.", badge: "external", position: { x: 570, y: -130 } },
      { id: "eda-projection", kind: "database", tone: "storage", title: "Projection", detail: "Read model updated from events.", badge: "read", position: { x: 570, y: 70 } },
      { id: "eda-output", kind: "output", tone: "output", title: "User update", detail: "Receipt, email, or status page.", badge: "output", position: { x: 870, y: 70 } }
    ],
    edges: [
      { id: "eda-client-command", source: "eda-client", target: "eda-command", type: "smoothstep", label: "command", tone: "source", marker: "arrowClosed" },
      { id: "eda-command-outbox", source: "eda-command", target: "eda-outbox", type: "step", label: "write event", tone: "storage", marker: "arrowClosed" },
      { id: "eda-outbox-topic", source: "eda-outbox", target: "eda-topic", type: "smoothstep", label: "relay", tone: "event", marker: "arrowClosed", animated: true },
      { id: "eda-topic-worker-a", source: "eda-topic", target: "eda-worker-a", type: "smoothstep", label: "consume", tone: "event", marker: "arrowClosed", animated: true },
      { id: "eda-topic-worker-b", source: "eda-topic", target: "eda-worker-b", type: "smoothstep", label: "consume", tone: "event", marker: "arrowClosed", animated: true },
      { id: "eda-topic-dlq", source: "eda-topic", target: "eda-dlq", type: "step", label: "failure", tone: "risk", marker: "arrow" },
      { id: "eda-worker-provider", source: "eda-worker-a", target: "eda-provider", type: "smoothstep", label: "retry API", tone: "external", marker: "arrowClosed" },
      { id: "eda-worker-projection", source: "eda-worker-b", target: "eda-projection", type: "smoothstep", label: "update read", tone: "storage", marker: "arrowClosed" },
      { id: "eda-projection-output", source: "eda-projection", target: "eda-output", type: "straight", label: "notify", tone: "output", marker: "arrowClosed" }
    ]
  },
  {
    id: "deployment-topology",
    family: "architecture",
    title: "Deployment topology",
    description: "Region, VPC, cluster, service, data store, and external edge dependencies in one topology map.",
    notes: ["Use group nodes for deployment boundaries", "Clear zones help teams discuss ownership", "External dependencies stay outside the runtime boundary"],
    nodes: [
      { id: "deploy-region", kind: "group", tone: "review", title: "Region ap-southeast-1", detail: "Top-level cloud or datacenter boundary.", badge: "region", position: { x: -650, y: -230 }, size: { width: 780, height: 470 } },
      { id: "deploy-cluster", kind: "group", tone: "process", title: "Kubernetes cluster", detail: "Compute boundary inside the region.", badge: "cluster", position: { x: -560, y: -120 }, size: { width: 520, height: 280 } },
      { id: "deploy-edge", kind: "gateway", tone: "review", title: "Ingress", detail: "Load balancer, WAF, gateway, or edge route.", badge: "edge", position: { x: -820, y: -20 } },
      { id: "deploy-api", kind: "service", tone: "process", title: "API pod", detail: "Horizontally scaled application workload.", badge: "pod", position: { x: -500, y: -45 } },
      { id: "deploy-worker", kind: "worker", tone: "agent", title: "Worker pod", detail: "Background workload.", badge: "pod", position: { x: -235, y: -45 } },
      { id: "deploy-cache", kind: "cache", tone: "storage", title: "Redis", detail: "Shared cache inside private network.", badge: "cache", position: { x: -500, y: 95 } },
      { id: "deploy-db", kind: "database", tone: "storage", title: "Managed DB", detail: "Stateful managed service.", badge: "db", position: { x: 210, y: -45 } },
      { id: "deploy-observe", kind: "note", tone: "risk", title: "Observability", detail: "Logs, metrics, traces, and alert owner.", badge: "ops", position: { x: 210, y: 115 } },
      { id: "deploy-cdn", kind: "external", tone: "external", title: "CDN", detail: "Public cache and static assets.", badge: "external", position: { x: -820, y: -185 } },
      { id: "deploy-third-party", kind: "external", tone: "external", title: "Third-party API", detail: "External dependency with timeout budget.", badge: "external", position: { x: 520, y: -45 } },
      { id: "deploy-output", kind: "output", tone: "output", title: "Healthy release", detail: "Traffic, alerts, and rollback path are visible.", badge: "release", position: { x: 520, y: 135 } }
    ],
    edges: [
      { id: "deploy-cdn-edge", source: "deploy-cdn", target: "deploy-edge", type: "straight", label: "static + dynamic", tone: "external", marker: "arrowClosed" },
      { id: "deploy-edge-api", source: "deploy-edge", target: "deploy-api", type: "smoothstep", label: "route", tone: "review", marker: "arrowClosed" },
      { id: "deploy-api-worker", source: "deploy-api", target: "deploy-worker", type: "step", label: "job", tone: "agent", marker: "arrowClosed", animated: true },
      { id: "deploy-api-cache", source: "deploy-api", target: "deploy-cache", type: "smoothstep", label: "cache", tone: "storage", marker: "arrowClosed" },
      { id: "deploy-api-db", source: "deploy-api", target: "deploy-db", type: "smoothstep", label: "sql", tone: "storage", marker: "arrowClosed" },
      { id: "deploy-worker-third-party", source: "deploy-worker", target: "deploy-third-party", type: "smoothstep", label: "provider", tone: "external", marker: "arrowClosed" },
      { id: "deploy-db-observe", source: "deploy-db", target: "deploy-observe", type: "simplebezier", label: "signals", tone: "risk", marker: "arrow" },
      { id: "deploy-observe-output", source: "deploy-observe", target: "deploy-output", type: "straight", label: "release gate", tone: "output", marker: "arrowClosed" }
    ]
  },
  {
    id: "data-lineage",
    family: "architecture",
    title: "Data lineage",
    description: "Source systems, ingestion, transformation, storage, marts, BI, and audit ownership.",
    notes: ["Useful for analytics architecture", "Separates operational DB from warehouse and marts", "Shows audit and privacy boundaries"],
    nodes: [
      { id: "lineage-app", kind: "input", tone: "source", title: "Product events", detail: "Clicks, orders, sessions, and operational events.", badge: "source", position: { x: -610, y: -70 } },
      { id: "lineage-db", kind: "database", tone: "source", title: "Operational DB", detail: "Transactional source system.", badge: "source", position: { x: -610, y: 120 } },
      { id: "lineage-ingest", kind: "queue", tone: "event", title: "Ingestion", detail: "Batch or streaming ingest boundary.", badge: "ingest", position: { x: -300, y: 25 } },
      { id: "lineage-raw", kind: "database", tone: "storage", title: "Raw lake", detail: "Immutable raw zone.", badge: "raw", position: { x: 0, y: -70 } },
      { id: "lineage-transform", kind: "worker", tone: "agent", title: "Transform job", detail: "dbt, Spark, SQL job, or scheduled worker.", badge: "job", position: { x: 0, y: 120 } },
      { id: "lineage-warehouse", kind: "database", tone: "storage", title: "Warehouse", detail: "Clean shared analytical model.", badge: "warehouse", position: { x: 310, y: 25 } },
      { id: "lineage-mart", kind: "database", tone: "storage", title: "Domain mart", detail: "Team-owned metric tables.", badge: "mart", position: { x: 610, y: -70 } },
      { id: "lineage-bi", kind: "output", tone: "output", title: "BI dashboard", detail: "Decision surface for readers.", badge: "output", position: { x: 610, y: 120 } },
      { id: "lineage-audit", kind: "note", tone: "risk", title: "Privacy review", detail: "Retention, access, PII, lineage owner, and audit trail.", badge: "gate", position: { x: 310, y: 250 } }
    ],
    edges: [
      { id: "lineage-app-ingest", source: "lineage-app", target: "lineage-ingest", type: "smoothstep", label: "stream", tone: "event", marker: "arrowClosed", animated: true },
      { id: "lineage-db-ingest", source: "lineage-db", target: "lineage-ingest", type: "smoothstep", label: "cdc", tone: "event", marker: "arrowClosed", animated: true },
      { id: "lineage-ingest-raw", source: "lineage-ingest", target: "lineage-raw", type: "step", label: "land", tone: "storage", marker: "arrowClosed" },
      { id: "lineage-raw-transform", source: "lineage-raw", target: "lineage-transform", type: "smoothstep", label: "clean", tone: "agent", marker: "arrowClosed" },
      { id: "lineage-transform-warehouse", source: "lineage-transform", target: "lineage-warehouse", type: "smoothstep", label: "publish", tone: "storage", marker: "arrowClosed" },
      { id: "lineage-warehouse-mart", source: "lineage-warehouse", target: "lineage-mart", type: "smoothstep", label: "model", tone: "storage", marker: "arrowClosed" },
      { id: "lineage-warehouse-bi", source: "lineage-warehouse", target: "lineage-bi", type: "smoothstep", label: "serve", tone: "output", marker: "arrowClosed" },
      { id: "lineage-warehouse-audit", source: "lineage-warehouse", target: "lineage-audit", type: "straight", label: "review", tone: "risk", marker: "arrow" }
    ]
  }
];

export const reactFlowArchitectureDemo: StudioFlowArchitectureDemo = {
  sections: [
    {
      title: "Built-in primitives",
      items: [
        "input, default, output, and group-style nodes",
        "source and target handles on multiple sides",
        "node labels, badges, helper text, and status tone"
      ]
    },
    {
      title: "React Flow example families",
      items: [
        "overview, interaction, grouping, layout, styling, whiteboard, and architecture views",
        "subflows, expand/collapse, validation, helper lines, and annotation patterns",
        "dropdown-controlled views inside one Studio route"
      ]
    },
    {
      title: "Software architecture nodes",
      items: [
        "service, API gateway, worker, external dependency",
        "database, cache, queue, event topic, telemetry note",
        "decision, risk, policy gate, rollout boundary"
      ]
    },
    {
      title: "Edge language",
      items: [
        "default, straight, step, smoothstep, and simplebezier edges",
        "animated async paths, arrow markers, edge labels",
        "different stroke tones for sync, async, data, risk, and observability"
      ]
    },
    {
      title: "Canvas controls",
      items: [
        "Background grid, Controls, MiniMap, fitView",
        "large architecture map inside a constrained Studio panel",
        "stable node positions for screenshots and discussion"
      ]
    }
  ],
  defaultViewId: "architecture-service-map",
  nodes: serviceMapNodes,
  edges: serviceMapEdges,
  views: reactFlowViews
};
