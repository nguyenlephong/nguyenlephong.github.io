import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type PanelKind = "sidebar" | "index" | "reader" | "rail";

export function DashboardFrame({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      data-slot="studio-kit-dashboard"
      className={cn("studio-kit-scope", "sdk-dashboard", className)}
      {...props}
    />
  );
}

export function DashboardHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header data-slot="studio-kit-dashboard-header" className={cn("sdk-dashboard-header", className)} {...props} />;
}

export function MetricGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-metric-grid" className={cn("sdk-metric-grid", className)} {...props} />;
}

type MetricCardProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  label: string;
  value: string;
};

export function MetricCard({ className, icon, label, value, ...props }: MetricCardProps) {
  return (
    <div data-slot="studio-kit-metric-card" className={cn("sdk-metric-card", className)} {...props}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function DashboardGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-dashboard-grid" className={cn("sdk-dashboard-grid", className)} {...props} />;
}

type DashboardPanelProps = HTMLAttributes<HTMLElement> & {
  as?: "aside" | "article" | "section";
  kind?: PanelKind;
};

export function DashboardPanel({
  as = "aside",
  kind = "sidebar",
  className,
  ...props
}: DashboardPanelProps) {
  const Comp = as;
  return (
    <Comp
      data-slot="studio-kit-dashboard-panel"
      data-kind={kind}
      className={cn("sdk-panel", `sdk-panel--${kind}`, className)}
      {...props}
    />
  );
}

