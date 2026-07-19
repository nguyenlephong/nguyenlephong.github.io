
"use client";

import { APP_ROUTE } from "@/app/app.const";
import {
  LuCalendarDays, LuClipboardList, LuCommand, LuDownload, LuFingerprint,
  LuKanbanSquare, LuLock, LuUserPlus, LuUsers
} from "react-icons/lu";
import { RouteHeading, RouteMetricGrid } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import { routeMetrics } from "./studio-auxiliary-route-metrics";

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
        <h3>{route.title}</h3>
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

export default function StudioUtilityRoutesFeature({ route }: { route: StudioRoute }) {
  const enrichedRoute = { ...route, metrics: routeMetrics[route.id] ?? [] };
  if (route.kind === "calendar") return <CalendarPage route={enrichedRoute} />;
  if (route.kind === "kanban") return <KanbanPage route={enrichedRoute} />;
  if (route.kind === "invoice") return <InvoicePage route={enrichedRoute} />;
  if (route.kind === "users" || route.kind === "roles") return <UsersRolesPage route={enrichedRoute} />;
  return <AuthPage route={enrichedRoute} />;
}
