"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioRouteKind } from "./studio-route-catalog";
import type { StudioUiCopy } from "./studio-shell-copy";

type RouteProps = { route: StudioRoute; locale: string };
type DashboardProps = {
  locale: string;
  dashboardCopy: StudioUiCopy["dashboard"];
};
type Props = RouteProps & {
  loadingLabel: string;
  dashboardCopy: StudioUiCopy["dashboard"];
};
const AuxiliaryLoadingCopyContext = createContext<string | null>(null);

function AuxiliaryLoadingFallback() {
  const label = useContext(AuxiliaryLoadingCopyContext);
  return (
    <section className="card empty-route" role="status">
      {label}
    </section>
  );
}

const Mail = dynamic<RouteProps>(() => import("./StudioMailFeature"), {
  loading: AuxiliaryLoadingFallback
});
const Chat = dynamic<RouteProps>(() => import("./StudioChatFeature"), {
  loading: AuxiliaryLoadingFallback
});
const DefaultDashboard = dynamic<DashboardProps>(
  () => import("./StudioDefaultDashboardFeature"),
  { loading: AuxiliaryLoadingFallback }
);
const Utility = dynamic<RouteProps>(
  () => import("./StudioUtilityRoutesFeature"),
  { loading: AuxiliaryLoadingFallback }
);
const Dashboards = dynamic<RouteProps>(
  () => import("./StudioDashboardRoutesFeature"),
  { loading: AuxiliaryLoadingFallback }
);

function assertNeverRouteKind(kind: never): never {
  throw new Error(`Unsupported auxiliary Studio route kind: ${String(kind)}`);
}

export default function StudioAuxiliaryRoutesFeature(props: Props) {
  const routeProps = { route: props.route, locale: props.locale };
  const resolveRoute = (kind: StudioRouteKind) => {
    switch (kind) {
      case "mail":
        return <Mail {...routeProps} />;
      case "chat":
        return <Chat {...routeProps} />;
      case "default":
        return (
          <DefaultDashboard
            locale={props.locale}
            dashboardCopy={props.dashboardCopy}
          />
        );
      case "calendar":
      case "kanban":
      case "invoice":
      case "users":
      case "roles":
      case "auth":
        return <Utility {...routeProps} />;
      case "dashboard":
      case "finance":
      case "analytics":
      case "productivity":
      case "ecommerce":
      case "academy":
      case "logistics":
      case "infrastructure":
      case "legacy":
        return <Dashboards {...routeProps} />;
      case "welcome":
      case "ai-setup":
      case "ai-skills":
      case "checklists":
      case "flows":
        throw new Error(`Non-auxiliary Studio route kind: ${kind}`);
      default:
        return assertNeverRouteKind(kind);
    }
  };

  return (
    <AuxiliaryLoadingCopyContext.Provider value={props.loadingLabel}>
      {resolveRoute(props.route.kind)}
    </AuxiliaryLoadingCopyContext.Provider>
  );
}
