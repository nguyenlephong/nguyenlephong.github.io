import type {
  StudioFlowArchitectureDemo,
  StudioFlowArchitectureEdgeSpec,
  StudioFlowArchitectureNodeKind,
  StudioFlowArchitectureNodeSpec,
  StudioFlowArchitectureTone,
  StudioFlowArchitectureViewSpec
} from "./studio.data";

type BlueprintNodeInput = {
  id: string;
  kind: StudioFlowArchitectureNodeKind;
  tone: StudioFlowArchitectureTone;
  title: string;
  detail: string;
  badge: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  compact?: boolean;
};

type BlueprintEdgeInput = {
  id: string;
  source: string;
  target: string;
  label: string;
  tone: StudioFlowArchitectureTone;
  type?: StudioFlowArchitectureEdgeSpec["type"];
  marker?: StudioFlowArchitectureEdgeSpec["marker"];
  animated?: boolean;
};

function node(input: BlueprintNodeInput): StudioFlowArchitectureNodeSpec {
  return {
    id: input.id,
    kind: input.kind,
    tone: input.tone,
    title: input.title,
    detail: input.detail,
    badge: input.badge,
    position: { x: input.x, y: input.y },
    size: input.width && input.height ? { width: input.width, height: input.height } : undefined,
    compact: input.compact
  };
}

function edge(input: BlueprintEdgeInput): StudioFlowArchitectureEdgeSpec {
  return {
    id: input.id,
    source: input.source,
    target: input.target,
    type: input.type ?? "smoothstep",
    label: input.label,
    tone: input.tone,
    marker: input.marker ?? "arrowClosed",
    animated: input.animated
  };
}

function group(
  id: string,
  tone: StudioFlowArchitectureTone,
  title: string,
  detail: string,
  x: number,
  y: number,
  width: number,
  height: number
): StudioFlowArchitectureNodeSpec {
  return node({ id, kind: "group", tone, title, detail, badge: "zone", x, y, width, height });
}

const dnsNodes = [
  group("dns-zone", "source", "DNS resolution", "Root, TLD, authoritative nameserver, resolver, and client-visible IP discovery.", -1560, -920, 900, 430),
  node({ id: "client-phone", kind: "input", tone: "source", title: "Mobile / Browser", detail: "User enters the domain and starts the request path.", badge: "client", x: -1470, y: -780, compact: true }),
  node({ id: "recursive-resolver", kind: "gateway", tone: "source", title: "Recursive resolver", detail: "ISP or public resolver checks cache before walking DNS.", badge: "DNS", x: -1250, y: -800, compact: true }),
  node({ id: "root-ns", kind: "system", tone: "external", title: "Root NS", detail: "Returns the TLD nameserver for .com, .org, or another suffix.", badge: "root", x: -1480, y: -620, compact: true }),
  node({ id: "tld-ns", kind: "system", tone: "external", title: "TLD NS", detail: "Points the resolver toward the authoritative nameserver.", badge: "TLD", x: -1260, y: -600, compact: true }),
  node({ id: "authoritative-ns", kind: "system", tone: "external", title: "Authoritative NS", detail: "Returns the final record, TTL, and canonical target.", badge: "ANS", x: -1035, y: -630, compact: true }),
  node({ id: "resolved-ip", kind: "output", tone: "output", title: "Resolved IP", detail: "IP, CNAME, TTL, DNSSEC state, and cacheability.", badge: "A/AAAA", x: -810, y: -785, compact: true })
];

const requestNodes = [
  group("request-zone", "review", "Client request and edge policy", "Request metadata, security controls, CDN, API gateway, and response feedback.", -575, -920, 1180, 430),
  node({ id: "request-envelope", kind: "note", tone: "review", title: "Request envelope", detail: "Headers, request ID, idempotency key, auth token, locale, compression.", badge: "headers", x: -500, y: -790 }),
  node({ id: "cdn-edge", kind: "external", tone: "external", title: "CDN / Edge", detail: "TLS, static asset cache, WAF, bot checks, regional routing.", badge: "edge", x: -205, y: -800 }),
  node({ id: "api-gateway-blueprint", kind: "gateway", tone: "review", title: "API Gateway", detail: "Validation, auth handoff, rate limits, routing, metering, dedupe.", badge: "API", x: 80, y: -800 }),
  node({ id: "response-envelope", kind: "note", tone: "output", title: "Response envelope", detail: "4xx/5xx, pagination, cache headers, cookies, latency, error code.", badge: "response", x: 355, y: -790 }),
  node({ id: "security-options", kind: "risk", tone: "risk", title: "Security options", detail: "OAuth, WAF rules, TLS policy, CSRF, request signing, replay window.", badge: "security", x: -310, y: -610 }),
  node({ id: "observability-note", kind: "note", tone: "risk", title: "Metrics tape", detail: "Response time, failed status codes, active connections, error message.", badge: "metrics", x: 260, y: -610 })
];

const runtimeNodes = [
  group("runtime-zone", "process", "Load balancing and runtime", "Ingress routing, balancing choices, frontend servers, backend cluster, and dispatch path.", -1560, -400, 1370, 560),
  node({ id: "load-balancer", kind: "gateway", tone: "process", title: "Load Balancer", detail: "Round robin, weighted, least connections, hashing, health check.", badge: "LB", x: -1315, y: -225 }),
  node({ id: "frontend-servers", kind: "service", tone: "process", title: "Frontend servers", detail: "HTTP, WebSocket, SSE, short polling, stream API, live sessions.", badge: "FE", x: -1020, y: -250 }),
  node({ id: "edge-static", kind: "external", tone: "external", title: "CDN / Edge servers", detail: "Global static, ABR stream, miss handling, origin fetch, regional cache.", badge: "CDN", x: -700, y: -250 }),
  node({ id: "backend-cluster", kind: "service", tone: "agent", title: "Backend cluster", detail: "Cluster of services with microservice boundaries, autoscale, CPU and memory pressure.", badge: "BE", x: -1180, y: 5 }),
  node({ id: "message-dispatcher", kind: "worker", tone: "agent", title: "Message Dispatcher", detail: "Routes stream chunk messages to the active frontend connection owner.", badge: "dispatch", x: -785, y: 10 }),
  node({ id: "balancing-controls", kind: "note", tone: "review", title: "Balancing checklist", detail: "Input validation, auth, throttling, whitelist, flow control, TLS termination.", badge: "ops", x: -1510, y: 0 }),
  node({ id: "server-state", kind: "database", tone: "storage", title: "Connection table", detail: "User, connection object, server ownership, bandwidth, topics.", badge: "state", x: -495, y: -15 })
];

const coordinationNodes = [
  group("coordination-zone", "review", "Coordination primitives", "ID generation, locking, concurrency, and routing metadata that keep distributed writes stable.", -1560, 250, 900, 430),
  node({ id: "distributed-id", kind: "service", tone: "review", title: "Distributed ID", detail: "UUID, Snowflake, auto increment variants, Baidu UID, Sonyflake.", badge: "ID", x: -1480, y: 405, compact: true }),
  node({ id: "resource-lock", kind: "risk", tone: "risk", title: "Resource locking", detail: "Redis Redlock, Chubby, Zookeeper, lease timeout, lock contention.", badge: "lock", x: -1255, y: 405, compact: true }),
  node({ id: "concurrency-note", kind: "note", tone: "review", title: "Concurrency choices", detail: "Serial, batch, optimistic, pessimistic, retry, idempotent update.", badge: "model", x: -1030, y: 405 }),
  node({ id: "metadata-table", kind: "database", tone: "storage", title: "Streaming chunk metadata", detail: "Key, checksum, timestamp, server, object pointer, retry state.", badge: "table", x: -805, y: 405 })
];

const dataNodes = [
  group("data-zone-blueprint", "storage", "Databases and cache", "Primary storage, shards, replicas, cold storage, in-memory cache, and eviction policy.", -575, 210, 1180, 580),
  node({ id: "primary-db-blueprint", kind: "database", tone: "storage", title: "Databases", detail: "RDBMS, column wide, document, key-value, graph, quad tree, time-series.", badge: "base", x: -500, y: 410 }),
  node({ id: "shards", kind: "database", tone: "storage", title: "Shards", detail: "Range, hash, geographical, directory based, hot node hash.", badge: "shard", x: -245, y: 585, compact: true }),
  node({ id: "replicas", kind: "database", tone: "storage", title: "Replicas", detail: "Quorum, hinted handoff, Merkle tree, cross-geo, read/write split.", badge: "replica", x: -25, y: 585, compact: true }),
  node({ id: "cold-storage", kind: "database", tone: "external", title: "Cold storage", detail: "Old records, consistent hashing, hash rings, archival access.", badge: "cold", x: 205, y: 410 }),
  node({ id: "memory-cache", kind: "cache", tone: "storage", title: "In-memory cache", detail: "Write-through, read-through, write-around, write-back.", badge: "RAM", x: 430, y: 310, compact: true }),
  node({ id: "distributed-cache", kind: "cache", tone: "storage", title: "Distributed cache", detail: "Cache miss/hit, disk and memory usage, eviction and invalidation.", badge: "cache", x: 430, y: 515 }),
  node({ id: "eviction-policy", kind: "note", tone: "review", title: "Eviction policy", detail: "LRU, LFU, FIFO, MRU, random, least-used, on-demand expiration.", badge: "policy", x: -500, y: 250 })
];

const mediaNodes = [
  group("media-zone", "event", "Upload media pipeline", "Chunk upload, checksum validation, queueing, processing workers, and encoded storage.", 720, -400, 1180, 650),
  node({ id: "object-storage", kind: "database", tone: "storage", title: "Object Storage", detail: "Raw S3 chunks, multipart upload, object pointer, checksum source.", badge: "S3", x: 805, y: -165 }),
  node({ id: "object-chunk-note", kind: "note", tone: "event", title: "For every chunk", detail: "Count messages, consumption rate, in-transit, waiting for ack, queue limit.", badge: "chunk", x: 1035, y: -295 }),
  node({ id: "upload-queue", kind: "queue", tone: "event", title: "Message Queue", detail: "Broker, pub/sub, checksum validation, retry, backpressure.", badge: "queue", x: 1250, y: -145 }),
  node({ id: "processing-workers", kind: "worker", tone: "agent", title: "Processing Workers", detail: "Validate checksum, transcode, scan, compress, rate-limit, push outputs.", badge: "worker", x: 955, y: 75 }),
  node({ id: "encoded-storage", kind: "database", tone: "output", title: "Processed / Encoded Storage", detail: "Lossless or lossy encoding, object count, compression ratio, failed count.", badge: "media", x: 1525, y: 75 }),
  node({ id: "media-cost-note", kind: "note", tone: "risk", title: "Processing cost", detail: "Compute time, failed count, CPU/disk use, consumed storage, object count.", badge: "cost", x: 1255, y: 105 })
];

const fanoutNodes = [
  group("fanout-zone", "output", "Common fan-out services", "Pub/sub fan-out into notifications, search, analytics, recommendations, billing, and third-party services.", 720, 330, 1180, 460),
  node({ id: "pubsub-queue", kind: "topic", tone: "event", title: "Pub / Sub Queue", detail: "Brokered topics with retry keys and consumer groups.", badge: "pubsub", x: 805, y: 475 }),
  node({ id: "notification-service", kind: "service", tone: "output", title: "Notification Service", detail: "Spam controls, stop words, dedupe, retry with idempotent key.", badge: "notify", x: 1035, y: 600, compact: true }),
  node({ id: "recommendation-service", kind: "service", tone: "agent", title: "Recommendation Service", detail: "Content-based and collaborative filtering.", badge: "ML", x: 1265, y: 430, compact: true }),
  node({ id: "log-processing", kind: "worker", tone: "agent", title: "Log Processing", detail: "Normalize logs and publish observability streams.", badge: "logs", x: 1265, y: 555, compact: true }),
  node({ id: "search-service", kind: "service", tone: "process", title: "Search Service", detail: "Index documents and serve query traffic.", badge: "search", x: 1495, y: 430, compact: true }),
  node({ id: "analytics-service", kind: "service", tone: "process", title: "Analytics Service", detail: "Events, dashboards, cohorts, conversion, alerting.", badge: "BI", x: 1495, y: 555, compact: true }),
  node({ id: "payment-charge", kind: "external", tone: "external", title: "Payment Charge", detail: "Idempotent key, expired cards, insufficient balance, third-party bank.", badge: "pay", x: 1495, y: 680, compact: true })
];

const fullNodes: StudioFlowArchitectureNodeSpec[] = [
  ...dnsNodes,
  ...requestNodes,
  ...runtimeNodes,
  ...coordinationNodes,
  ...dataNodes,
  ...mediaNodes,
  ...fanoutNodes
];

const fullEdges: StudioFlowArchitectureEdgeSpec[] = [
  edge({ id: "client-resolver", source: "client-phone", target: "recursive-resolver", label: "domain lookup", tone: "source", type: "step", animated: true }),
  edge({ id: "resolver-root", source: "recursive-resolver", target: "root-ns", label: "root?", tone: "external", type: "smoothstep" }),
  edge({ id: "root-tld", source: "root-ns", target: "tld-ns", label: "TLD NS", tone: "external", type: "smoothstep" }),
  edge({ id: "tld-auth", source: "tld-ns", target: "authoritative-ns", label: "ANS", tone: "external", type: "smoothstep" }),
  edge({ id: "auth-ip", source: "authoritative-ns", target: "resolved-ip", label: "12.34.56.78", tone: "output", type: "step", animated: true }),
  edge({ id: "ip-cdn", source: "resolved-ip", target: "cdn-edge", label: "connect", tone: "source", type: "smoothstep", animated: true }),
  edge({ id: "request-cdn", source: "request-envelope", target: "cdn-edge", label: "request", tone: "review", type: "straight" }),
  edge({ id: "cdn-gateway", source: "cdn-edge", target: "api-gateway-blueprint", label: "origin miss", tone: "review", type: "smoothstep" }),
  edge({ id: "gateway-response", source: "api-gateway-blueprint", target: "response-envelope", label: "response", tone: "output", type: "straight" }),
  edge({ id: "security-gateway", source: "security-options", target: "api-gateway-blueprint", label: "policy", tone: "risk", type: "simplebezier" }),
  edge({ id: "gateway-metrics", source: "api-gateway-blueprint", target: "observability-note", label: "telemetry", tone: "risk", type: "simplebezier" }),
  edge({ id: "gateway-lb", source: "api-gateway-blueprint", target: "load-balancer", label: "route", tone: "process", type: "smoothstep", animated: true }),
  edge({ id: "lb-frontend", source: "load-balancer", target: "frontend-servers", label: "healthy target", tone: "process", type: "straight" }),
  edge({ id: "frontend-edge-static", source: "frontend-servers", target: "edge-static", label: "static / stream", tone: "external", type: "smoothstep" }),
  edge({ id: "frontend-backend", source: "frontend-servers", target: "backend-cluster", label: "API call", tone: "agent", type: "smoothstep", animated: true }),
  edge({ id: "backend-dispatcher", source: "backend-cluster", target: "message-dispatcher", label: "dispatch", tone: "agent", type: "straight" }),
  edge({ id: "dispatcher-state", source: "message-dispatcher", target: "server-state", label: "connection owner", tone: "storage", type: "smoothstep" }),
  edge({ id: "backend-id", source: "backend-cluster", target: "distributed-id", label: "new id", tone: "review", type: "smoothstep" }),
  edge({ id: "backend-lock", source: "backend-cluster", target: "resource-lock", label: "protect write", tone: "risk", type: "smoothstep" }),
  edge({ id: "backend-metadata", source: "backend-cluster", target: "metadata-table", label: "chunk row", tone: "storage", type: "smoothstep" }),
  edge({ id: "backend-primary", source: "backend-cluster", target: "primary-db-blueprint", label: "transaction", tone: "storage", type: "smoothstep" }),
  edge({ id: "primary-shards", source: "primary-db-blueprint", target: "shards", label: "partition", tone: "storage", type: "step" }),
  edge({ id: "primary-replicas", source: "primary-db-blueprint", target: "replicas", label: "replicate", tone: "storage", type: "step" }),
  edge({ id: "primary-cold", source: "primary-db-blueprint", target: "cold-storage", label: "archive", tone: "external", type: "smoothstep" }),
  edge({ id: "backend-cache", source: "backend-cluster", target: "memory-cache", label: "hot read", tone: "storage", type: "smoothstep" }),
  edge({ id: "cache-distributed", source: "memory-cache", target: "distributed-cache", label: "invalidate", tone: "storage", type: "smoothstep", animated: true }),
  edge({ id: "metadata-object", source: "metadata-table", target: "object-storage", label: "object pointer", tone: "event", type: "smoothstep" }),
  edge({ id: "object-queue", source: "object-storage", target: "upload-queue", label: "chunk event", tone: "event", type: "smoothstep", animated: true }),
  edge({ id: "queue-workers", source: "upload-queue", target: "processing-workers", label: "consume", tone: "agent", type: "smoothstep", animated: true }),
  edge({ id: "workers-storage", source: "processing-workers", target: "encoded-storage", label: "processed file", tone: "output", type: "smoothstep" }),
  edge({ id: "workers-cost", source: "processing-workers", target: "media-cost-note", label: "cost metrics", tone: "risk", type: "simplebezier" }),
  edge({ id: "encoded-pubsub", source: "encoded-storage", target: "pubsub-queue", label: "fan-out", tone: "event", type: "smoothstep", animated: true }),
  edge({ id: "pubsub-notify", source: "pubsub-queue", target: "notification-service", label: "notify", tone: "output", type: "smoothstep" }),
  edge({ id: "pubsub-reco", source: "pubsub-queue", target: "recommendation-service", label: "recommend", tone: "agent", type: "smoothstep" }),
  edge({ id: "pubsub-log", source: "pubsub-queue", target: "log-processing", label: "logs", tone: "agent", type: "smoothstep" }),
  edge({ id: "pubsub-search", source: "pubsub-queue", target: "search-service", label: "index", tone: "process", type: "smoothstep" }),
  edge({ id: "pubsub-analytics", source: "pubsub-queue", target: "analytics-service", label: "events", tone: "process", type: "smoothstep" }),
  edge({ id: "pubsub-payment", source: "pubsub-queue", target: "payment-charge", label: "charge", tone: "external", type: "smoothstep" })
];

function view(
  id: string,
  title: string,
  description: string,
  notes: string[],
  nodes: StudioFlowArchitectureNodeSpec[],
  edges: StudioFlowArchitectureEdgeSpec[]
): StudioFlowArchitectureViewSpec {
  return {
    id,
    family: "architecture",
    title,
    description,
    notes,
    nodes,
    edges
  };
}

const dnsIds = new Set(["dns-zone", "client-phone", "recursive-resolver", "root-ns", "tld-ns", "authoritative-ns", "resolved-ip", "request-zone", "cdn-edge", "api-gateway-blueprint"]);
const runtimeIds = new Set(["request-zone", "api-gateway-blueprint", "security-options", "observability-note", "runtime-zone", "load-balancer", "frontend-servers", "edge-static", "backend-cluster", "message-dispatcher", "server-state", "balancing-controls"]);
const storageIds = new Set(["runtime-zone", "backend-cluster", "coordination-zone", "distributed-id", "resource-lock", "concurrency-note", "metadata-table", "data-zone-blueprint", "primary-db-blueprint", "shards", "replicas", "cold-storage", "memory-cache", "distributed-cache", "eviction-policy"]);
const mediaIds = new Set(["coordination-zone", "metadata-table", "media-zone", "object-storage", "object-chunk-note", "upload-queue", "processing-workers", "encoded-storage", "media-cost-note", "fanout-zone", "pubsub-queue", "notification-service", "recommendation-service", "log-processing", "search-service", "analytics-service", "payment-charge"]);

function nodesById(ids: Set<string>) {
  return fullNodes.filter((candidate) => ids.has(candidate.id));
}

function edgesWithin(ids: Set<string>) {
  return fullEdges.filter((candidate) => ids.has(candidate.source) && ids.has(candidate.target));
}

const blueprintViews: StudioFlowArchitectureViewSpec[] = [
  view(
    "blueprint-full",
    "Full system blueprint",
    "A dense production-style map with DNS, edge policy, load balancing, backend services, cache, database, media processing, queues, and fan-out services on one React Flow canvas.",
    ["Large multi-zone canvas", "Mixed node shapes and grouped boundaries", "Animated async edges, labels, markers, minimap, controls, and fullscreen inspection"],
    fullNodes,
    fullEdges
  ),
  view(
    "blueprint-dns-request",
    "DNS to request path",
    "Zoom in on how a domain lookup turns into an edge request with policy checks, request metadata, and response metadata.",
    ["DNS resolver walk", "CDN and gateway boundary", "Security and observability notes near the request path"],
    nodesById(dnsIds),
    edgesWithin(dnsIds)
  ),
  view(
    "blueprint-runtime",
    "Runtime and load balancing",
    "Focus on API gateway handoff, load balancing, frontend servers, CDN edge, backend cluster, dispatcher, and connection state.",
    ["Balancing strategy as first-class diagram context", "Frontend and backend ownership visible", "Connection table and dispatcher path separated from request ingress"],
    nodesById(runtimeIds),
    edgesWithin(runtimeIds)
  ),
  view(
    "blueprint-storage",
    "Storage, cache, and coordination",
    "Inspect backend write stability, distributed IDs, locks, metadata, primary data, shards, replicas, cold storage, and cache policy.",
    ["Coordination primitives sit beside data storage", "Cache choices are not hidden behind the database", "Metadata table is visible as a routing artifact"],
    nodesById(storageIds),
    edgesWithin(storageIds)
  ),
  view(
    "blueprint-media-fanout",
    "Media upload and fan-out",
    "Trace raw object chunks through queue validation, workers, encoded storage, and fan-out services such as notification, search, analytics, and payment charge.",
    ["Queue-backed media processing", "Worker cost and retry signals", "Common downstream services shown as fan-out consumers"],
    nodesById(mediaIds),
    edgesWithin(mediaIds)
  )
];

export const reactFlowSystemBlueprintDemo: StudioFlowArchitectureDemo = {
  sections: [
    {
      title: "Blueprint-scale canvas",
      items: [
        "multi-zone system design map inspired by production architecture posters",
        "DNS, request metadata, load balancing, storage, media processing, queues, and fan-out services",
        "large graph remains inspectable through MiniMap, Controls, fitView, pan, zoom, and fullscreen"
      ]
    },
    {
      title: "React Flow power features",
      items: [
        "custom nodes for gateway, service, database, cache, queue, worker, risk, note, and external systems",
        "group nodes for visual zones without flattening the architecture",
        "edge labels, marker arrows, animated async paths, and multiple edge shapes"
      ]
    },
    {
      title: "Interview and review usage",
      items: [
        "use the full map to discuss architecture depth",
        "switch to focused views when the reviewer wants DNS, runtime, storage, or media details",
        "keep node copy concise so the graph stays usable instead of becoming a static poster"
      ]
    }
  ],
  defaultViewId: "blueprint-full",
  nodes: fullNodes,
  edges: fullEdges,
  views: blueprintViews
};
