"use client";

import { useState } from "react";
import {
  LuChevronDown,
  LuCreditCard,
  LuDownload,
  LuGauge,
  LuListTodo,
  LuRotateCw,
  LuSettings,
  LuSlidersHorizontal
} from "react-icons/lu";
import StudioDeliverySignalFeature from "./StudioDeliverySignalFeature";
import { RouteHeading, RouteMetricGrid } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";

export type StudioAuxiliaryDashboardsRuntimeProps = Readonly<{
  route: StudioRoute;
  locale: string;
}>;

function TimelineCard({ route }: Readonly<{ route: StudioRoute }>) {
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

function PanelsCard({ route }: Readonly<{ route: StudioRoute }>) {
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

function DashboardRoutePage({ route, locale }: StudioAuxiliaryDashboardsRuntimeProps) {
  return (
    <section className="route-page" data-studio-auxiliary-dashboard={route.kind}>
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
          <StudioDeliverySignalFeature locale={locale} />
        </section>
        <TimelineCard route={route} />
        <PanelsCard route={route} />
      </div>
    </section>
  );
}

function FinanceLikePage({ route }: Readonly<{ route: StudioRoute }>) {
  const [tab, setTab] = useState("dashboard");
  return (
    <section className="route-page" data-studio-auxiliary-dashboard={route.kind}>
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

function AnalyticsPage({ route, locale }: StudioAuxiliaryDashboardsRuntimeProps) {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "audience", "acquisition", "engagement", "conversions"];
  return (
    <section className="route-page" data-studio-auxiliary-dashboard={route.kind}>
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
              <StudioDeliverySignalFeature locale={locale} />
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

function ProductivityPage({ route }: Readonly<{ route: StudioRoute }>) {
  return (
    <section className="route-page" data-studio-auxiliary-dashboard={route.kind}>
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

function CommerceAcademyPage({ route }: Readonly<{ route: StudioRoute }>) {
  return (
    <section className="route-page" data-studio-auxiliary-dashboard={route.kind}>
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

export default function StudioAuxiliaryDashboardsRuntime({
  route,
  locale
}: StudioAuxiliaryDashboardsRuntimeProps) {
  if (route.kind === "finance") return <FinanceLikePage route={route} />;
  if (route.kind === "analytics") return <AnalyticsPage route={route} locale={locale} />;
  if (route.kind === "productivity") return <ProductivityPage route={route} />;
  if (["ecommerce", "academy", "logistics", "infrastructure"].includes(route.kind)) {
    return <CommerceAcademyPage route={route} />;
  }
  return <DashboardRoutePage route={route} locale={locale} />;
}
