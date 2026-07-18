import type { IconType } from "react-icons";
import type { StudioRouteId, StudioRouteKind } from "./studio-route-catalog";

export type StudioMetric = {
  label: string;
  value: string;
  helper: string;
  badge: string;
  trend: "up" | "down";
  icon: IconType;
};

export type StudioRoute = {
  id: StudioRouteId;
  title: string;
  description: string;
  kind: StudioRouteKind;
  icon: IconType;
  badge?: "new" | "soon";
  metrics: StudioMetric[];
  panels: string[];
  timeline: string[];
};
