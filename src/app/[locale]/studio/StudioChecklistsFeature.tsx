"use client";

import { useState } from "react";
import { LuCheck, LuClipboardList, LuCopy } from "react-icons/lu";
import { track } from "@/lib/analytics";
import { RouteHeading } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioChecklistStep, StudioWorkflowChecklist } from "./studio.data";

function renderChecklistStepMarkdown(step: StudioChecklistStep, depth = 0): string {
  const indent = "  ".repeat(depth);
  const detail = step.detail ? " - " + step.detail : "";
  const children = step.children?.length
    ? "\n" + step.children.map((child) => renderChecklistStepMarkdown(child, depth + 1)).join("\n")
    : "";
  return indent + "- [ ] " + step.label + detail + children;
}

function renderChecklistMarkdown(checklist: StudioWorkflowChecklist, copy: StudioUiCopy): string {
  return [
    "# " + checklist.title, "", checklist.summary, "",
    copy.checklists.markdownUseWhen + ": " + checklist.whenToUse, "",
    ...checklist.sections.flatMap((section) => [
      "## " + section.title, section.detail, "",
      ...section.steps.map((step) => renderChecklistStepMarkdown(step)), ""
    ])
  ].join("\n").trim();
}

function countChecklistSteps(steps: StudioChecklistStep[]): number {
  return steps.reduce((total, step) => total + 1 + countChecklistSteps(step.children ?? []), 0);
}

function ChecklistStepNode({
  checklistId,
  sectionId,
  step,
  depth = 0
}: {
  checklistId: string;
  sectionId: string;
  step: StudioChecklistStep;
  depth?: number;
}) {
  return (
    <li className="checklist-step-node" data-depth={depth}>
      <label className="check-row checklist-row">
        <input
          type="checkbox"
          onChange={(event) => {
            track("studio_checklist_item_toggle", {
              checklist_id: checklistId,
              section_id: sectionId,
              step_id: step.id,
              checked: event.currentTarget.checked
            });
          }}
        />
        <span>
          <strong>{step.label}</strong>
          {step.detail && <small>{step.detail}</small>}
        </span>
      </label>
      {step.children?.length ? (
        <ol>
          {step.children.map((child) => (
            <ChecklistStepNode
              key={child.id}
              checklistId={checklistId}
              sectionId={sectionId}
              step={child}
              depth={depth + 1}
            />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

export default function StudioChecklistsFeature({ route, copy, localizedChecklists }: { route: StudioRoute; copy: StudioUiCopy; localizedChecklists: StudioWorkflowChecklist[] }) {
  const [selectedChecklistId, setSelectedChecklistId] = useState(localizedChecklists[0]?.id ?? "");
  const [copiedChecklistId, setCopiedChecklistId] = useState<string | null>(null);
  const selectedChecklist = localizedChecklists.find((checklist) => checklist.id === selectedChecklistId) ?? localizedChecklists[0];
  const selectedMarkdown = selectedChecklist ? renderChecklistMarkdown(selectedChecklist, copy) : "";
  const totalSteps = selectedChecklist?.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0) ?? 0;

  const handleChecklistSelect = (checklist: StudioWorkflowChecklist) => {
    setSelectedChecklistId(checklist.id);
    track("studio_checklist_select", {
      checklist_id: checklist.id,
      section_count: checklist.sections.length,
      step_count: checklist.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0)
    });
  };

  const copyChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      await navigator.clipboard.writeText(selectedMarkdown);
      setCopiedChecklistId(selectedChecklist.id);
      window.setTimeout(() => setCopiedChecklistId(null), 1600);
      track("studio_checklist_copy", {
        checklist_id: selectedChecklist.id,
        markdown_length: selectedMarkdown.length,
        section_count: selectedChecklist.sections.length,
        step_count: totalSteps
      });
    } catch {
      track("studio_checklist_copy", {
        checklist_id: selectedChecklist.id,
        failed: true
      });
    }
  };

  if (!selectedChecklist) {
    return (
      <section className="empty-route card">
        <LuClipboardList aria-hidden="true" />
        <strong>{copy.checklists.emptyTitle}</strong>
        <p>{copy.checklists.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="route-page delivery-checklists-route">
      <RouteHeading route={route} copy={copy}>
        <button type="button" className="outline-button" onClick={copyChecklist}>
          {copiedChecklistId === selectedChecklist.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copiedChecklistId === selectedChecklist.id ? copy.checklists.copied : copy.checklists.copyChecklist}
        </button>
      </RouteHeading>

      <div className="checklist-workbench card" data-studio-module="delivery-checklists">
        <aside className="checklist-index-pane" aria-label={copy.checklists.workflowListLabel}>
          <div className="ai-pane-head">
            <span><LuClipboardList aria-hidden="true" /></span>
            <div>
              <h2>{copy.checklists.menu}</h2>
              <p>{copy.checklists.menuDetail}</p>
            </div>
          </div>

          <div className="checklist-list">
            {localizedChecklists.map((checklist) => (
              <button
                key={checklist.id}
                type="button"
                className={`checklist-list-button${selectedChecklist.id === checklist.id ? " is-active" : ""}`}
                onClick={() => handleChecklistSelect(checklist)}
              >
                <span>
                  <strong>{checklist.title}</strong>
                  <small>{checklist.summary}</small>
                </span>
                <em>{checklist.sections.length} {copy.checklists.sections}</em>
              </button>
            ))}
          </div>
        </aside>

        <article className="checklist-reader-pane" aria-label={copy.checklists.selectedChecklist}>
          <div className="skill-reader-head">
            <div>
              <span className="ai-status-pill status-ready">{totalSteps} {copy.checklists.steps}</span>
              <h2>{selectedChecklist.title}</h2>
              <p>{selectedChecklist.summary}</p>
            </div>
            <button type="button" className="outline-button" onClick={copyChecklist}>
              {copiedChecklistId === selectedChecklist.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              {copiedChecklistId === selectedChecklist.id ? copy.checklists.copied : copy.checklists.copy}
            </button>
          </div>

          <div className="ai-tag-list" aria-label={copy.checklists.checklistTags}>
            {selectedChecklist.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="checklist-section-list">
            {selectedChecklist.sections.map((section) => (
              <section key={section.id} className="checklist-section-card">
                <header>
                  <h3>{section.title}</h3>
                  <p>{section.detail}</p>
                </header>
                <ol>
                  {section.steps.map((step) => (
                    <ChecklistStepNode
                      key={step.id}
                      checklistId={selectedChecklist.id}
                      sectionId={section.id}
                      step={step}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </article>

        <aside className="checklist-side-pane" aria-label={copy.checklists.detailsLabel}>
          <section>
            <h3>{copy.checklists.whenToUse}</h3>
            <p>{selectedChecklist.whenToUse}</p>
          </section>
          <section>
            <h3>{copy.checklists.structure}</h3>
            <p>{copy.checklists.structureDetail(selectedChecklist.sections.length, totalSteps)}</p>
          </section>
          <section>
            <h3>{copy.checklists.markdownCopy}</h3>
            <pre><code>{selectedMarkdown}</code></pre>
          </section>
        </aside>
      </div>
    </section>
  );
}
