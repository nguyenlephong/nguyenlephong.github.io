"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { APP_ROUTE } from "@/app/app.const";
import {
  LuCheck,
  LuDownload,
  LuSearch,
  LuSend,
  LuServer
} from "react-icons/lu";
import { RouteMetricGrid } from "./StudioRoutePrimitives";
import StudioDeliverySignalFeature from "./StudioDeliverySignalFeature";
import { defaultMetrics } from "./studio-auxiliary-route-metrics";
import {
  defaultStudioDashboardQuery,
  readStudioDashboardQuery,
  writeStudioDashboardQuery,
  type StudioDashboardQueryState
} from "./studio-dashboard-query";
import type { StudioUiCopy } from "./studio-shell-copy";

function createWorkstreamRow(
  name: string,
  id: string,
  status: string,
  billing: string,
  plan: string,
  joined: string,
  time: string,
  billingTone: "paid" | "pending" | "unpaid"
) {
  return { name, id, status, billing, plan, joined, time, billingTone };
}

const workstreamRows = [
  createWorkstreamRow(
    "Gateway rollout guardrails",
    "REL-204",
    "Healthy",
    "Ready",
    "Platform",
    "20th June 2026",
    "at 09:40 AM",
    "paid"
  ),
  createWorkstreamRow(
    "Partner mTLS certificate overlap",
    "SEC-118",
    "Watching",
    "Review",
    "Security",
    "20th June 2026",
    "at 08:15 AM",
    "pending"
  ),
  createWorkstreamRow(
    "Feature flag tenant expansion",
    "FF-089",
    "Healthy",
    "Ready",
    "Rollout",
    "19th June 2026",
    "at 05:35 PM",
    "paid"
  ),
  createWorkstreamRow(
    "Bulk export async worker",
    "PERF-047",
    "Blocked",
    "Risk",
    "Backend",
    "19th June 2026",
    "at 02:12 PM",
    "unpaid"
  ),
  createWorkstreamRow(
    "PostHog release anomaly review",
    "OBS-066",
    "Queued",
    "Next",
    "Observability",
    "18th June 2026",
    "at 11:08 AM",
    "pending"
  )
];

const dashboardKpis = [
  {
    title: "Runtime Flags",
    value: "38",
    description: "Rules across 30+ tenants",
    tone: "success"
  },
  {
    title: "Deploy Train",
    value: "12",
    description: "Services released this week",
    tone: "neutral"
  },
  {
    title: "Load Path",
    value: "4",
    description: "Ingress and LB checks watched",
    tone: "warning"
  },
  {
    title: "Runbooks",
    value: "9",
    description: "Recovery paths kept current",
    tone: "success"
  }
];

const releaseChecklist = [
  { title: "Verify feature flag default fallback", tag: "Rollout", done: true },
  {
    title: "Check ingress and load balancer route parity",
    tag: "Infra",
    done: true
  },
  {
    title: "Review PostHog adoption and anomaly window",
    tag: "Observability",
    done: false
  },
  {
    title: "Confirm rollback owner and cutover criteria",
    tag: "Release",
    done: false
  }
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
          <p>
            Static frontend primitives currently represented inside this Studio
            shell.
          </p>
        </div>
      </header>
      <div className="component-token-grid">
        {componentInventory.map((item) => (
          <span className="component-token" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="component-samples" aria-label="Component samples">
        <button type="button" className="outline-button">
          Outline
        </button>
        <button type="button" className="primary-icon" aria-label="Send sample">
          <LuSend aria-hidden="true" />
        </button>
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
  const gradient = distributionSegments
    .reduce<{ cursor: number; stops: string[] }>(
      (accumulator, segment) => {
        const start = accumulator.cursor;
        const end = start + segment.value * 3.6;
        return {
          cursor: end,
          stops: [
            ...accumulator.stops,
            `${segment.color} ${start}deg ${end}deg`
          ]
        };
      },
      { cursor: 0, stops: [] }
    )
    .stops.join(", ");
  const donutStyle = {
    background: `conic-gradient(${gradient})`
  } satisfies CSSProperties;

  return (
    <section className="card route-panel distribution-card" data-slot="card">
      <header className="card-header">
        <div>
          <h2>Control Surface</h2>
          <p>Coverage by operational control type.</p>
        </div>
      </header>
      <div className="distribution-layout">
        <div
          className="donut-chart"
          style={donutStyle}
          aria-label="Control surface distribution"
        >
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
function DefaultDashboard({
  locale,
  dashboardCopy,
  workstreamSearch,
  statusFilter,
  sortMode,
  onWorkstreamSearch,
  onStatusFilter,
  onSortMode,
  onClearFilters
}: {
  locale: string;
  dashboardCopy: StudioUiCopy["dashboard"];
  workstreamSearch: string;
  statusFilter: string;
  sortMode: string;
  onWorkstreamSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortMode: (value: string) => void;
  onClearFilters: () => void;
}) {
  const filteredWorkstreams = useMemo(() => {
    const query = workstreamSearch.trim().toLowerCase();
    const rows = workstreamRows.filter((workstream) => {
      const matchesQuery =
        !query ||
        [
          workstream.name,
          workstream.id,
          workstream.status,
          workstream.billing,
          workstream.plan
        ].some((value) => value.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" ||
        workstream.status.toLowerCase() === statusFilter;
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

      <section
        className="card activity-card"
        id="release-signal"
        data-slot="card"
      >
        <header className="card-header activity-header">
          <div>
            <h2>Release Activity</h2>
            <p>
              Release Signal across rollout volume, platform health, and
              incident noise.
            </p>
          </div>
          <div className="card-actions">
            <select
              className="native-select"
              defaultValue="quarter"
              aria-label="Period"
            >
              <option value="quarter">6 weeks</option>
              <option value="sprint">Current sprint</option>
            </select>
            <select
              className="native-select"
              defaultValue="all"
              aria-label="Segment"
            >
              <option value="all">All services</option>
              <option value="edge">Edge/API</option>
              <option value="workers">Workers</option>
            </select>
            <a
              href={APP_ROUTE.CV_PDF}
              className="outline-button"
              target="_blank"
              rel="noreferrer"
            >
              View report
            </a>
          </div>
        </header>
        <StudioDeliverySignalFeature
          locale={locale}
          routeId="default"
          routeKind="default"
        />
      </section>

      <section
        className="card records-card workstreams-card"
        id="system-workstreams"
        data-slot="card"
      >
        <header className="card-header table-header">
          <div>
            <h2>{dashboardCopy.workstreamCount(filteredWorkstreams.length)}</h2>
            <p>
              System Workstreams with status, risk, area, and last-update
              activity.
            </p>
          </div>
          <a
            href={APP_ROUTE.CV_PDF}
            className="outline-button"
            target="_blank"
            rel="noreferrer"
          >
            <LuDownload aria-hidden="true" />
            Export
          </a>
        </header>

        <div className="table-toolbar">
          <label className="workstream-search">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search workstreams</span>
            <input
              type="search"
              placeholder="Search workstreams..."
              value={workstreamSearch}
              onChange={(event) => onWorkstreamSearch(event.target.value)}
            />
          </label>
          <select
            className="native-select"
            value={statusFilter}
            onChange={(event) => onStatusFilter(event.target.value)}
            aria-label="Status filter"
          >
            <option value="all">Status</option>
            <option value="healthy">Healthy</option>
            <option value="watching">Watching</option>
            <option value="blocked">Blocked</option>
            <option value="queued">Queued</option>
          </select>
          <span className="toolbar-spacer" />
          <select
            className="native-select"
            value={sortMode}
            onChange={(event) => onSortMode(event.target.value)}
            aria-label="Sort workstreams"
          >
            <option value="joined">Last update</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="Select all workstreams" />
                </th>
                <th>Workstream</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Area</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkstreams.length === 0 ? (
                <tr className="workstream-empty-row">
                  <td colSpan={6}>
                    <div className="table-empty-state" role="status">
                      <strong>{dashboardCopy.emptyTitle}</strong>
                      <p>{dashboardCopy.emptyDescription}</p>
                      <button
                        type="button"
                        className="outline-button"
                        onClick={onClearFilters}
                      >
                        {dashboardCopy.clearFilters}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkstreams.map((workstream) => (
                  <tr key={workstream.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${workstream.name}`}
                      />
                    </td>
                    <td data-label="Workstream">
                      <div className="workstream-cell">
                        <span className="workstream-avatar">
                          <LuServer aria-hidden="true" />
                        </span>
                        <span>
                          <strong>{workstream.name}</strong>
                          <small>{workstream.id}</small>
                        </span>
                      </div>
                    </td>
                    <td data-label="Status">
                      <span className="soft-pill">{workstream.status}</span>
                    </td>
                    <td data-label="Risk">
                      <span
                        className={`billing-pill billing-${workstream.billingTone}`}
                      >
                        {workstream.billingTone === "paid" && (
                          <LuCheck aria-hidden="true" />
                        )}
                        {workstream.billing}
                      </span>
                    </td>
                    <td data-label="Area">{workstream.plan}</td>
                    <td data-label="Updated">
                      <span className="joined-cell">
                        <strong>{workstream.joined}</strong>
                        <small>{workstream.time}</small>
                      </span>
                    </td>
                  </tr>
                ))
              )}
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

export default function StudioDefaultDashboardFeature({
  locale,
  dashboardCopy
}: {
  locale: string;
  dashboardCopy: StudioUiCopy["dashboard"];
}) {
  const [query, setQuery] = useState<StudioDashboardQueryState>(() =>
    typeof window === "undefined"
      ? defaultStudioDashboardQuery
      : readStudioDashboardQuery(window.location.search)
  );

  const updateQuery = (change: Partial<StudioDashboardQueryState>) => {
    const next = { ...query, ...change };
    const nextSearch = writeStudioDashboardQuery(window.location.search, next);
    window.history.replaceState(
      null,
      "",
      `${nextSearch}${window.location.hash}`
    );
    setQuery(next);
  };

  return (
    <DefaultDashboard
      locale={locale}
      dashboardCopy={dashboardCopy}
      workstreamSearch={query.workstreamSearch}
      statusFilter={query.statusFilter}
      sortMode={query.sortMode}
      onWorkstreamSearch={(value) => updateQuery({ workstreamSearch: value })}
      onStatusFilter={(value) =>
        updateQuery({
          statusFilter: value as StudioDashboardQueryState["statusFilter"]
        })
      }
      onSortMode={(value) =>
        updateQuery({
          sortMode: value as StudioDashboardQueryState["sortMode"]
        })
      }
      onClearFilters={() => updateQuery(defaultStudioDashboardQuery)}
    />
  );
}
