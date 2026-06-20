"use client";

import { useEffect } from "react";
import type { IconType } from "react-icons";
import {
  LuBadgeDollarSign,
  LuBanknote,
  LuBoxes,
  LuBriefcase,
  LuCalendarDays,
  LuBarChart,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuCommand,
  LuDownload,
  LuFingerprint,
  LuGauge,
  LuGithub,
  LuGraduationCap,
  LuInbox,
  LuKanbanSquare,
  LuLayoutDashboard,
  LuLineChart,
  LuListTodo,
  LuLock,
  LuMail,
  LuMessageSquare,
  LuMoon,
  LuMoreVertical,
  LuPanelLeft,
  LuPlusCircle,
  LuReceipt,
  LuSearch,
  LuSettings,
  LuShoppingBag,
  LuArrowUpDown,
  LuUserPlus,
  LuUsers,
  LuWaves
} from "react-icons/lu";
import { ShadowIsland } from "@/components/studio-kit";
import { studioShadowStyles } from "./studio.shadow-styles";

type StudioWorkspaceProps = {
  locale: string;
};

type SidebarLink = {
  label: string;
  icon?: IconType;
  active?: boolean;
  badge?: string;
  hasChildren?: boolean;
};

const dashboardLinks: SidebarLink[] = [
  { label: "Default", icon: LuLayoutDashboard, active: true },
  { label: "CRM", icon: LuBarChart },
  { label: "Finance", icon: LuBanknote },
  { label: "Analytics", icon: LuGauge },
  { label: "Productivity", icon: LuListTodo },
  { label: "E-commerce", icon: LuShoppingBag },
  { label: "Academy", icon: LuGraduationCap },
  { label: "Logistics", icon: LuBoxes },
  { label: "Infrastructure", icon: LuBriefcase, badge: "New" }
];

const pageLinks: SidebarLink[] = [
  { label: "Email", icon: LuMail },
  { label: "Chat", icon: LuMessageSquare },
  { label: "Calendar", icon: LuCalendarDays },
  { label: "Kanban", icon: LuKanbanSquare },
  { label: "Invoice", icon: LuReceipt },
  { label: "Users", icon: LuUsers },
  { label: "Roles", icon: LuLock },
  { label: "Authentication", icon: LuFingerprint, hasChildren: true }
];

const legacyLinks: SidebarLink[] = [{ label: "Dashboards", hasChildren: true }];

const metricCards = [
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
] satisfies Array<{
  label: string;
  value: string;
  helper: string;
  badge: string;
  trend: "up" | "down";
  icon: IconType;
}>;

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

const xTicks = [
  "Mar 25",
  "Apr 1",
  "Apr 8",
  "Apr 15",
  "Apr 22",
  "Apr 29",
  "May 6",
  "May 13",
  "May 21",
  "May 28",
  "Jun 4",
  "Jun 11",
  "Jun 20"
];

const newCustomerValues = [
  72, 22, 28, 18, 20, 42, 18, 24, 19, 21, 34, 68, 28, 25, 23, 22, 76, 26, 34, 20, 22, 24, 22, 21,
  33, 24, 66, 22, 28, 31, 33, 31, 26, 24, 48, 20, 22, 24, 44, 27, 35, 26, 76
];

const activeAccountValues = [
  18, 17, 16, 17, 16, 18, 17, 16, 17, 18, 17, 16, 18, 17, 18, 17, 16, 17, 18, 17, 18, 16, 17, 18,
  17, 16, 17, 18, 17, 16, 17, 16, 17, 18, 17, 17, 16, 18, 17, 18, 17, 16, 17
];

const returningUserValues = [
  14, 13, 12, 13, 12, 12, 13, 14, 13, 12, 13, 12, 12, 13, 12, 13, 12, 13, 12, 12, 13, 14, 13, 12,
  13, 12, 13, 12, 12, 13, 12, 13, 12, 13, 12, 12, 13, 12, 13, 12, 13, 12, 13
];

function linePoints(values: number[], maxValue = 82): string {
  const width = 390;
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

function SidebarGroup({ title, items }: { title: string; items: SidebarLink[] }) {
  return (
    <section className="sidebar-group" aria-label={title}>
      <p className="sidebar-group-label">{title}</p>
      <div className="sidebar-menu">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-menu-button${item.active ? " is-active" : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              {Icon ? <Icon aria-hidden="true" /> : <span className="sidebar-fallback" />}
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              {item.hasChildren && <LuChevronRight className="sidebar-chevron" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({ item }: { item: (typeof metricCards)[number] }) {
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

function StudioAdminReplica({ locale }: StudioWorkspaceProps) {
  return (
    <div className="studio-admin" data-locale={locale}>
      <aside className="studio-sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <a className="sidebar-brand" href="#dashboard" aria-label="Studio Admin">
            <LuCommand aria-hidden="true" />
            <span>Studio Admin</span>
          </a>
        </div>

        <div className="sidebar-create">
          <button type="button" className="quick-create">
            <LuPlusCircle aria-hidden="true" />
            <span>Quick Create</span>
          </button>
          <button type="button" className="mail-button" aria-label="Inbox">
            <LuInbox aria-hidden="true" />
          </button>
        </div>

        <div className="sidebar-scroll">
          <SidebarGroup title="Dashboards" items={dashboardLinks} />
          <SidebarGroup title="Pages" items={pageLinks} />
          <SidebarGroup title="Legacy" items={legacyLinks} />
        </div>

        <div className="sidebar-footer">
          <section className="support-card">
            <strong>Looking for something more?</strong>
            <p>
              Open an issue or do reach out to me on <a href="https://x.com/arhamkhnz">X</a>.
            </p>
          </section>

          <div className="user-card">
            <span className="user-avatar">N</span>
            <span>
              <strong>Arham Khan</strong>
              <small>hello@arhamkhnz.com</small>
            </span>
            <button type="button" aria-label="User menu">
              <LuMoreVertical aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <main className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-left">
            <button type="button" className="icon-button" aria-label="Toggle Sidebar">
              <LuPanelLeft aria-hidden="true" />
            </button>
            <span className="topbar-separator" aria-hidden="true" />
            <button type="button" className="search-command">
              <LuSearch aria-hidden="true" />
              <span>Search</span>
              <kbd>⌘ J</kbd>
            </button>
          </div>

          <div className="topbar-actions">
            <button type="button" className="topbar-icon" aria-label="Settings">
              <LuSettings aria-hidden="true" />
            </button>
            <button type="button" className="topbar-icon" aria-label="Toggle theme">
              <LuMoon aria-hidden="true" />
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
            <span className="topbar-avatar">AK</span>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="metric-grid" aria-label="Dashboard metrics">
            {metricCards.map((item) => (
              <MetricCard key={item.label} item={item} />
            ))}
          </section>

          <section className="card activity-card" data-slot="card">
            <header className="card-header activity-header">
              <div>
                <h2>Customer Activity</h2>
                <p>Customer activity for the last 3 months</p>
              </div>
              <div className="card-actions">
                <button type="button" className="select-button">
                  3 months
                  <LuChevronDown aria-hidden="true" />
                </button>
                <button type="button" className="select-button">
                  All segments
                  <LuChevronDown aria-hidden="true" />
                </button>
                <button type="button" className="outline-button">
                  View report
                </button>
              </div>
            </header>
            <div className="chart-legend" aria-hidden="true">
              <span>
                <i className="legend-active" />
                Active Accounts
              </span>
              <span>
                <i className="legend-new" />
                New Customers
              </span>
              <span>
                <i className="legend-returning" />
                Returning Users
              </span>
            </div>
            <CustomerActivityChart />
          </section>

          <section className="card customers-card" data-slot="card">
            <header className="card-header table-header">
              <div>
                <h2>18,426 Customers</h2>
                <p>Recent customer records with plan, billing, status, and signup activity.</p>
              </div>
              <button type="button" className="outline-button">
                <LuDownload aria-hidden="true" />
                Export
              </button>
            </header>

            <div className="table-toolbar">
              <label className="customer-search">
                <LuSearch aria-hidden="true" />
                <span className="sr-only">Search customers</span>
                <input type="search" placeholder="Search customers..." />
              </label>
              <button type="button" className="outline-button">
                <LuUsers aria-hidden="true" />
                Status
              </button>
              <button type="button" className="outline-button">
                <LuCalendarDays aria-hidden="true" />
                Joined date
              </button>
              <span className="toolbar-spacer" />
              <button type="button" className="outline-button">
                <LuBadgeDollarSign aria-hidden="true" />
                Billing
              </button>
              <button type="button" className="outline-button">
                <LuArrowUpDown aria-hidden="true" />
                Sort
              </button>
            </div>

            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>
                      <span className="checkbox" aria-hidden="true" />
                    </th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Billing</th>
                    <th>Plan</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <span className="checkbox" aria-hidden="true" />
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-avatar">
                            <LuUsers aria-hidden="true" />
                          </span>
                          <span>
                            <strong>{customer.name}</strong>
                            <small>{customer.id}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="soft-pill">{customer.status}</span>
                      </td>
                      <td>
                        <span className={`billing-pill billing-${customer.billingTone}`}>
                          {customer.billingTone === "paid" && <LuCheck aria-hidden="true" />}
                          {customer.billing}
                        </span>
                      </td>
                      <td>{customer.plan}</td>
                      <td>
                        <span className="joined-cell">
                          <strong>{customer.joined}</strong>
                          <small>{customer.time}</small>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function StudioWorkspace({ locale }: StudioWorkspaceProps) {
  useEffect(() => {
    document.body.classList.add("studio-app-shell-active");
    return () => document.body.classList.remove("studio-app-shell-active");
  }, []);

  return (
    <ShadowIsland styles={studioShadowStyles} label="Studio Admin dashboard">
      <StudioAdminReplica locale={locale} />
    </ShadowIsland>
  );
}
