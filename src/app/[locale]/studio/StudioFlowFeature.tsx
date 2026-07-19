
"use client";

import { useState } from "react";
import { APP_ROUTE } from "@/app/app.const";
import { track } from "@/lib/analytics";
import { LuCheck, LuLink, LuShare2, LuWorkflow } from "react-icons/lu";
import StudioFlowChart from "./StudioFlowChart";
import { RouteHeading } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioRouteId } from "./studio-route-catalog";
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioRouteActivationSource } from "./studio-shell-navigation";
import { routeHref } from "./studio-shell-navigation";
import type { StudioFlow, StudioFlowGroup } from "./studio.data";

type StudioFlowId = StudioFlow["id"];

function flowRouteId(flowId: StudioFlowId): StudioRouteId {
  return ("flow-" + flowId) as StudioRouteId;
}

function flowIdFromRoute(routeId: StudioRouteId): StudioFlowId | null {
  return routeId.startsWith("flow-") ? routeId.slice("flow-".length) : null;
}

function studioFlowHref(locale: string, flowId: StudioFlowId): string {
  const prefix = locale ? "/" + locale : "";
  return prefix + APP_ROUTE.STUDIO + routeHref(flowRouteId(flowId));
}

export default function StudioFlowFeature({
  route,
  locale,
  copy,
  onActivate,
  localizedFlows,
  localizedGroups
}: {
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  onActivate: (routeId: StudioRouteId, source?: StudioRouteActivationSource) => void;
  localizedFlows: StudioFlow[];
  localizedGroups: StudioFlowGroup[];
}) {
  const [copiedFlowId, setCopiedFlowId] = useState<string | null>(null);
  const selectedFlowId = flowIdFromRoute(route.id) ?? localizedFlows[0]?.id ?? "";
  const selectedFlow = localizedFlows.find((flow) => flow.id === selectedFlowId) ?? localizedFlows[0];
  const selectedGroup = selectedFlow ? localizedGroups.find((group) => group.id === selectedFlow.groupId) : undefined;

  const handleGroupSelect = (groupId: string) => {
    const firstFlowId = localizedGroups.find((group) => group.id === groupId)?.flowIds[0];
    if (!firstFlowId) return;
    track("studio_flow_group_select", {
      group_id: groupId,
      selected_flow_id: selectedFlow?.id,
      flow_count: localizedFlows.filter((flow) => flow.groupId === groupId).length
    });
    onActivate(flowRouteId(firstFlowId), "route_actions");
  };

  const handleFlowSelect = (flowId: StudioFlowId) => {
    onActivate(flowRouteId(flowId), "route_actions");
  };

  const copyFlowLink = async () => {
    if (!selectedFlow) return;
    const href = `${window.location.origin}${studioFlowHref(locale, selectedFlow.id)}`;

    try {
      await navigator.clipboard.writeText(href);
      setCopiedFlowId(selectedFlow.id);
      window.setTimeout(() => setCopiedFlowId(null), 1600);
      track("studio_flow_share", {
        flow_id: selectedFlow.id,
        group_id: selectedFlow.groupId,
        share_path: studioFlowHref(locale, selectedFlow.id)
      });
    } catch {
      track("studio_flow_share", {
        flow_id: selectedFlow.id,
        group_id: selectedFlow.groupId,
        failed: true
      });
    }
  };

  if (!selectedFlow) {
    return (
      <section className="empty-route card">
        <LuWorkflow aria-hidden="true" />
        <strong>{copy.flows.emptyTitle}</strong>
        <p>{copy.flows.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="route-page studio-flow-route">
      {selectedFlow.architectureDemo && <h2 className="sr-only">{selectedFlow.title}</h2>}
      {!selectedFlow.architectureDemo && (
        <>
          <RouteHeading route={route} copy={copy}>
            <button type="button" className="outline-button" onClick={copyFlowLink}>
              {copiedFlowId === selectedFlow.id ? <LuCheck aria-hidden="true" /> : <LuShare2 aria-hidden="true" />}
              {copiedFlowId === selectedFlow.id ? copy.flows.copied : copy.flows.shareFlow}
            </button>
          </RouteHeading>

        </>
      )}

      <div
        className={`flow-workbench card${selectedFlow.architectureDemo ? " is-architecture-demo" : ""}`}
        data-studio-module="flow-menu"
      >
        {!selectedFlow.architectureDemo && (
          <aside className="flow-index-pane" aria-label={copy.flows.flowListLabel}>
            <div className="ai-pane-head">
              <span><LuWorkflow aria-hidden="true" /></span>
              <div>
                <h2>{copy.flows.menu}</h2>
                <p>{copy.flows.menuDetail}</p>
              </div>
            </div>

            <div className="flow-group-list" aria-label={copy.flows.groupMenuLabel}>
              {localizedGroups.map((group) => {
                const active = selectedFlow.groupId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`flow-group-button${active ? " is-active" : ""}`}
                    onClick={() => handleGroupSelect(group.id)}
                  >
                    <strong>{group.title}</strong>
                    <small>{group.subtitle}</small>
                  </button>
                );
              })}
            </div>

            <div className="flow-list">
              {localizedFlows.map((flow) => {
                const active = selectedFlow.id === flow.id;
                return (
                  <a
                    key={flow.id}
                    href={studioFlowHref(locale, flow.id)}
                    className={`flow-list-button${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      handleFlowSelect(flow.id);
                    }}
                  >
                    <span>
                      <strong>{flow.title}</strong>
                      <small>{flow.summary}</small>
                    </span>
                    <em>{flow.architectureDemo?.views.length ?? flow.steps.length}</em>
                  </a>
                );
              })}
            </div>
          </aside>
        )}

        <article id={`flow-${selectedFlow.id}`} className="flow-reader-pane" aria-label={copy.flows.selectedFlow}>
          {!selectedFlow.architectureDemo && (
            <>
              <div className="skill-reader-head">
                <div>
                  <span className="ai-status-pill status-ready">{selectedGroup?.title ?? selectedFlow.groupId}</span>
                  <h2>{selectedFlow.title}</h2>
                  <p>{selectedFlow.summary}</p>
                </div>
                <a className="outline-button" href={studioFlowHref(locale, selectedFlow.id)}>
                  <LuLink aria-hidden="true" />
                  {copy.flows.openFlow}
                </a>
              </div>

              <div className="ai-tag-list" aria-label={copy.flows.tags}>
                {selectedFlow.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </>
          )}

          <StudioFlowChart
            key={`${locale}:${selectedFlow.id}`}
            flow={selectedFlow}
            copy={copy}
            locale={locale}
            routeId={route.id}
          />

          {!selectedFlow.architectureDemo && (
            <ol className="flow-step-map" aria-label={`${copy.flows.evidence} / ${copy.flows.output}`}>
              {selectedFlow.steps.map((step, index) => (
                <li key={step.id} className="flow-step-node">
                  <span className="flow-step-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                    <dl>
                      <div>
                        <dt>{copy.flows.evidence}</dt>
                        <dd>{step.evidence}</dd>
                      </div>
                      <div>
                        <dt>{copy.flows.output}</dt>
                        <dd>{step.output}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        {!selectedFlow.architectureDemo && (
          <aside className="flow-side-pane" aria-label={copy.flows.details}>
            <section>
              <h3>{copy.flows.useWhen}</h3>
              <p>{selectedFlow.useWhen}</p>
            </section>
            <section>
              <h3>{copy.flows.outcome}</h3>
              <p>{selectedFlow.outcome}</p>
            </section>
            <section>
              <h3>{copy.flows.officeExample}</h3>
              <p>{selectedFlow.officeExample}</p>
            </section>
            <section>
              <h3>{copy.flows.artifacts}</h3>
              <ul>
                {selectedFlow.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{copy.flows.cvSignals}</h3>
              <ul>
                {selectedFlow.cvSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </section>
          </aside>
        )}
      </div>
    </section>
  );
}
