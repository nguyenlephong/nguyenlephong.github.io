import type { StudioFlowArchitectureDemo } from "./studio.data";

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
  nodes: [
    {
      id: "client-zone",
      kind: "group",
      tone: "source",
      title: "Client boundary",
      detail: "React Flow can show large zones or bounded contexts as group nodes.",
      badge: "group",
      position: { x: -620, y: -210 },
      size: { width: 500, height: 270 }
    },
    {
      id: "internet-user",
      kind: "input",
      tone: "source",
      title: "Input node",
      detail: "External user, mobile app, partner webhook, or scheduled trigger.",
      badge: "built-in",
      position: { x: -560, y: -125 }
    },
    {
      id: "web-app",
      kind: "default",
      tone: "process",
      title: "Default node",
      detail: "Web app or BFF layer that starts the product workflow.",
      badge: "built-in",
      position: { x: -330, y: -125 }
    },
    {
      id: "response",
      kind: "output",
      tone: "output",
      title: "Output node",
      detail: "User response, notification, receipt, or final state.",
      badge: "built-in",
      position: { x: -330, y: 10 }
    },
    {
      id: "edge-zone",
      kind: "group",
      tone: "review",
      title: "Edge and policy boundary",
      detail: "Architecture diagrams need places where security, routing, and policy decisions are visible.",
      badge: "group",
      position: { x: -40, y: -230 },
      size: { width: 620, height: 310 }
    },
    {
      id: "api-gateway",
      kind: "gateway",
      tone: "review",
      title: "API Gateway",
      detail: "Ingress, rate limiting, auth handoff, routing, and request shaping.",
      badge: "gateway",
      position: { x: 40, y: -135 }
    },
    {
      id: "auth-service",
      kind: "service",
      tone: "review",
      title: "Auth service",
      detail: "A normal service card for identity, token exchange, and session checks.",
      badge: "service",
      position: { x: 310, y: -170 }
    },
    {
      id: "policy-decision",
      kind: "decision",
      tone: "review",
      title: "Policy?",
      detail: "Decision node for permission, tenancy, rollout, or compliance gate.",
      badge: "decision",
      position: { x: 320, y: -5 },
      size: { width: 168, height: 132 }
    },
    {
      id: "rate-limit-risk",
      kind: "risk",
      tone: "risk",
      title: "Risk gate",
      detail: "Show throttling, abuse control, security review, or unresolved decision.",
      badge: "risk",
      position: { x: 55, y: 40 }
    },
    {
      id: "domain-zone",
      kind: "group",
      tone: "process",
      title: "Domain services",
      detail: "Use group nodes to show bounded contexts without hiding the inner flow.",
      badge: "sub-flow",
      position: { x: -620, y: 160 },
      size: { width: 880, height: 390 }
    },
    {
      id: "order-service",
      kind: "service",
      tone: "process",
      title: "Order service",
      detail: "Command handling, validation, idempotency, and aggregate ownership.",
      badge: "service",
      position: { x: -540, y: 280 }
    },
    {
      id: "inventory-service",
      kind: "service",
      tone: "process",
      title: "Inventory service",
      detail: "Another service node shows peer dependency and boundary choices.",
      badge: "service",
      position: { x: -230, y: 250 }
    },
    {
      id: "worker",
      kind: "worker",
      tone: "agent",
      title: "Worker",
      detail: "Async processor for retries, side effects, and long-running jobs.",
      badge: "worker",
      position: { x: -230, y: 410 }
    },
    {
      id: "order-queue",
      kind: "queue",
      tone: "event",
      title: "Queue",
      detail: "Buffered command stream, DLQ, retry budget, and backpressure.",
      badge: "async",
      position: { x: 25, y: 385 }
    },
    {
      id: "domain-events",
      kind: "topic",
      tone: "event",
      title: "Event topic",
      detail: "Pub/sub fan-out for analytics, projections, and downstream systems.",
      badge: "event",
      position: { x: -5, y: 220 }
    },
    {
      id: "data-zone",
      kind: "group",
      tone: "storage",
      title: "Data plane",
      detail: "Storage, cache, read model, and data product can stay visually separate.",
      badge: "group",
      position: { x: 350, y: 180 },
      size: { width: 700, height: 370 }
    },
    {
      id: "primary-db",
      kind: "database",
      tone: "storage",
      title: "Primary DB",
      detail: "Cylinder shape for source-of-truth storage and transactional state.",
      badge: "database",
      position: { x: 440, y: 265 }
    },
    {
      id: "redis-cache",
      kind: "cache",
      tone: "storage",
      title: "Cache",
      detail: "Stacked shape for Redis, CDN cache, local cache, or materialized lookup.",
      badge: "cache",
      position: { x: 700, y: 255 }
    },
    {
      id: "warehouse",
      kind: "database",
      tone: "storage",
      title: "Warehouse",
      detail: "Read model, BI table, lakehouse, or audit archive.",
      badge: "read model",
      position: { x: 720, y: 415 }
    },
    {
      id: "payment-provider",
      kind: "external",
      tone: "external",
      title: "External SaaS",
      detail: "Dashed node for payment provider, partner API, KYC vendor, or cloud service.",
      badge: "external",
      position: { x: 1100, y: 290 }
    },
    {
      id: "ops-zone",
      kind: "group",
      tone: "risk",
      title: "Operations and reliability",
      detail: "Architecture maps can show release gates, observability, rollback, and operational ownership.",
      badge: "group",
      position: { x: 670, y: -220 },
      size: { width: 620, height: 300 }
    },
    {
      id: "observability",
      kind: "note",
      tone: "risk",
      title: "Telemetry note",
      detail: "Annotation node for logs, traces, metrics, alert owner, and dashboard.",
      badge: "note",
      position: { x: 760, y: -145 }
    },
    {
      id: "rollback",
      kind: "risk",
      tone: "risk",
      title: "Rollback plan",
      detail: "Risk node for migration reversibility, feature flag, and blast radius.",
      badge: "control",
      position: { x: 1040, y: -145 }
    },
    {
      id: "audit-log",
      kind: "database",
      tone: "risk",
      title: "Audit log",
      detail: "Append-only trail for financial, privacy, or admin-impacting actions.",
      badge: "audit",
      position: { x: 910, y: 15 }
    }
  ],
  edges: [
    {
      id: "user-web",
      source: "internet-user",
      target: "web-app",
      type: "straight",
      label: "straight edge",
      tone: "source",
      marker: "arrowClosed"
    },
    {
      id: "web-gateway",
      source: "web-app",
      target: "api-gateway",
      type: "smoothstep",
      label: "smoothstep request",
      tone: "process",
      marker: "arrowClosed"
    },
    {
      id: "gateway-auth",
      source: "api-gateway",
      target: "auth-service",
      type: "step",
      label: "step auth check",
      tone: "review",
      marker: "arrowClosed"
    },
    {
      id: "gateway-policy",
      source: "api-gateway",
      target: "policy-decision",
      type: "default",
      label: "default decision edge",
      tone: "review",
      marker: "arrowClosed"
    },
    {
      id: "gateway-risk",
      source: "api-gateway",
      target: "rate-limit-risk",
      type: "simplebezier",
      label: "simplebezier risk path",
      tone: "risk",
      marker: "arrow"
    },
    {
      id: "policy-order",
      source: "policy-decision",
      target: "order-service",
      type: "smoothstep",
      label: "allowed command",
      tone: "process",
      marker: "arrowClosed"
    },
    {
      id: "order-inventory",
      source: "order-service",
      target: "inventory-service",
      type: "default",
      label: "sync call",
      tone: "process",
      marker: "arrowClosed"
    },
    {
      id: "order-db",
      source: "order-service",
      target: "primary-db",
      type: "smoothstep",
      label: "transaction",
      tone: "storage",
      marker: "arrowClosed"
    },
    {
      id: "order-cache",
      source: "order-service",
      target: "redis-cache",
      type: "simplebezier",
      label: "read-through cache",
      tone: "storage",
      marker: "arrow"
    },
    {
      id: "order-events",
      source: "order-service",
      target: "domain-events",
      type: "step",
      label: "animated publish",
      tone: "event",
      marker: "arrowClosed",
      animated: true
    },
    {
      id: "events-worker",
      source: "domain-events",
      target: "worker",
      type: "smoothstep",
      label: "async consume",
      tone: "event",
      marker: "arrowClosed",
      animated: true
    },
    {
      id: "worker-queue",
      source: "worker",
      target: "order-queue",
      type: "straight",
      label: "retry / DLQ",
      tone: "event",
      marker: "arrowClosed",
      animated: true
    },
    {
      id: "events-warehouse",
      source: "domain-events",
      target: "warehouse",
      type: "simplebezier",
      label: "projection",
      tone: "storage",
      marker: "arrow"
    },
    {
      id: "order-payment",
      source: "order-service",
      target: "payment-provider",
      type: "smoothstep",
      label: "partner API",
      tone: "external",
      marker: "arrowClosed"
    },
    {
      id: "provider-response",
      source: "payment-provider",
      target: "response",
      type: "step",
      label: "final status",
      tone: "output",
      marker: "arrowClosed"
    },
    {
      id: "gateway-observability",
      source: "api-gateway",
      target: "observability",
      type: "simplebezier",
      label: "metrics / traces",
      tone: "risk",
      marker: "arrow"
    },
    {
      id: "order-audit",
      source: "order-service",
      target: "audit-log",
      type: "smoothstep",
      label: "append audit",
      tone: "risk",
      marker: "arrowClosed"
    },
    {
      id: "rollback-audit",
      source: "rollback",
      target: "audit-log",
      type: "straight",
      label: "release evidence",
      tone: "risk",
      marker: "arrow"
    }
  ]
};
