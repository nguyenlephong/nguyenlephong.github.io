"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";
import { track } from "@/lib/analytics";
import StudioFeatureErrorBoundary from "./StudioFeatureErrorBoundary";
import StudioAuxiliaryRoutesFeatureAdapter from "./StudioAuxiliaryRoutesFeatureAdapter";
import StudioWelcomeFeatureAdapter from "./StudioWelcomeFeatureAdapter";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { createStudioFeatureLoadErrorCallback } from "./studio-feature-load-error";
import { studioCatalog, type StudioRouteKind } from "./studio-route-catalog";
import { normalizeStudioLocale } from "./studio-shell-copy";

const StudioFeatureLoadingCopyContext = createContext<string | null>(null);

function StudioFeatureLoadingFallback() {
  const label = useContext(StudioFeatureLoadingCopyContext);
  return (
    <section className="card empty-route" role="status" aria-live="polite">
      <span className="studio-feature-spinner" aria-hidden="true" />
      {label && <strong>{label}</strong>}
    </section>
  );
}

const AiSetupEn = dynamic<StudioFeatureProps>(
  () => import("./StudioAiSetupFeature.en"),
  { loading: StudioFeatureLoadingFallback }
);
const AiSetupVi = dynamic<StudioFeatureProps>(
  () => import("./StudioAiSetupFeature.vi"),
  { loading: StudioFeatureLoadingFallback }
);
const AiSkillsEn = dynamic<StudioFeatureProps>(
  () => import("./StudioAiSkillsFeature.en"),
  { loading: StudioFeatureLoadingFallback }
);
const AiSkillsVi = dynamic<StudioFeatureProps>(
  () => import("./StudioAiSkillsFeature.vi"),
  { loading: StudioFeatureLoadingFallback }
);
const ChecklistsEn = dynamic<StudioFeatureProps>(
  () => import("./StudioChecklistsFeature.en"),
  { loading: StudioFeatureLoadingFallback }
);
const ChecklistsVi = dynamic<StudioFeatureProps>(
  () => import("./StudioChecklistsFeature.vi"),
  { loading: StudioFeatureLoadingFallback }
);
const FlowsEn = dynamic<StudioFeatureProps>(
  () => import("./StudioFlowFeature.en"),
  { loading: StudioFeatureLoadingFallback }
);
const FlowsVi = dynamic<StudioFeatureProps>(
  () => import("./StudioFlowFeature.vi"),
  { loading: StudioFeatureLoadingFallback }
);

function assertNeverRouteKind(kind: never): never {
  throw new Error(`Unsupported Studio route kind: ${String(kind)}`);
}

function StudioResolvedFeature(props: StudioFeatureProps) {
  const kind = studioCatalog.routeKindById[props.routeId];
  const locale = normalizeStudioLocale(props.locale);
  switch (kind) {
    case "welcome":
      return <StudioWelcomeFeatureAdapter {...props} />;
    case "ai-setup":
      return locale === "vi" ? (
        <AiSetupVi {...props} />
      ) : (
        <AiSetupEn {...props} />
      );
    case "ai-skills":
      return locale === "vi" ? (
        <AiSkillsVi {...props} />
      ) : (
        <AiSkillsEn {...props} />
      );
    case "checklists":
      return locale === "vi" ? (
        <ChecklistsVi {...props} />
      ) : (
        <ChecklistsEn {...props} />
      );
    case "flows":
      return locale === "vi" ? <FlowsVi {...props} /> : <FlowsEn {...props} />;
    case "default":
    case "dashboard":
    case "finance":
    case "analytics":
    case "productivity":
    case "ecommerce":
    case "academy":
    case "logistics":
    case "infrastructure":
    case "mail":
    case "chat":
    case "calendar":
    case "kanban":
    case "invoice":
    case "users":
    case "roles":
    case "auth":
    case "legacy":
      return <StudioAuxiliaryRoutesFeatureAdapter {...props} />;
    default:
      return assertNeverRouteKind(kind satisfies never);
  }
}

export default function StudioRouteFeatureRegistry(props: StudioFeatureProps) {
  const locale = normalizeStudioLocale(props.locale);
  const routeKind: StudioRouteKind = studioCatalog.routeKindById[props.routeId];

  return (
    <StudioFeatureLoadingCopyContext.Provider
      value={props.copy.runtime.loading}
    >
      <StudioFeatureErrorBoundary
        key={`${props.routeId}:${locale}`}
        onError={createStudioFeatureLoadErrorCallback(
          {
            featureId: "route-feature",
            routeId: props.routeId,
            routeKind,
            locale
          },
          track
        )}
        onRetry={() => window.location.reload()}
        renderFallback={(reload) => (
          <section className="card empty-route" role="alert">
            <strong>{props.copy.runtime.loadErrorTitle}</strong>
            <p>{props.copy.runtime.loadErrorDetail}</p>
            <button type="button" className="outline-button" onClick={reload}>
              {props.copy.runtime.reload}
            </button>
          </section>
        )}
      >
        <StudioResolvedFeature {...props} />
      </StudioFeatureErrorBoundary>
    </StudioFeatureLoadingCopyContext.Provider>
  );
}
