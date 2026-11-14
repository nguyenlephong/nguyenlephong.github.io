import type { ReactNode } from "react";
import { LuLineChart } from "react-icons/lu";
import type { StudioMetric, StudioRoute } from "./studio-route-contract";

type StudioRouteSurfaceCopy = {
  routeKicker: {
    studio: string;
  };
  routeMetricsLabel: string;
};

const defaultSurfaceCopy: StudioRouteSurfaceCopy = {
  routeKicker: { studio: "Studio" },
  routeMetricsLabel: "Route metrics"
};

function MetricCard({ item }: Readonly<{ item: StudioMetric }>) {
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

export function RouteHeading({
  route,
  copy = defaultSurfaceCopy,
  children
}: Readonly<{
  route: StudioRoute;
  copy?: StudioRouteSurfaceCopy;
  children?: ReactNode;
}>) {
  const Icon = route.icon;
  return (
    <div className="route-heading">
      <div>
        <div className="route-kicker">
          <Icon aria-hidden="true" />
          <span>{copy.routeKicker.studio}</span>
        </div>
        <h2>{route.title}</h2>
        <p>{route.description}</p>
      </div>
      {children}
    </div>
  );
}

export function RouteMetricGrid({
  metrics,
  copy = defaultSurfaceCopy
}: Readonly<{
  metrics: StudioMetric[];
  copy?: StudioRouteSurfaceCopy;
}>) {
  return (
    <section className="metric-grid" aria-label={copy.routeMetricsLabel}>
      {metrics.map((item) => (
        <MetricCard key={item.label} item={item} />
      ))}
    </section>
  );
}
