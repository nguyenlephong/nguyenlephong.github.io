"use client";

import { useState } from "react";
import { LuCommand, LuSparkles, LuWaves } from "react-icons/lu";
import { track } from "@/lib/analytics";
import { RouteHeading } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioProfileMenuItem } from "./studio-shell-navigation";
import { profileHref } from "./studio-shell-navigation";
import type { StudioFolder, StudioNote } from "./studio.data";

export type StudioAiWorkflowStep = { title: string; detail: string; state: string };

const aiRuntimeTargets = ["NotebookLM", "GPT", "Claude", "Codex", "Antigravity"];

function statusText(status: StudioNote["status"], copy: StudioUiCopy): string {
  return copy.status[status];
}

export default function StudioAiSetupFeature({
  route,
  locale,
  copy,
  profileActions,
  defaultNoteId,
  localizedFolders,
  localizedNotes,
  localizedWorkflowSteps
}: {
  route: StudioRoute;
  locale: string;
  copy: StudioUiCopy;
  profileActions: StudioProfileMenuItem[];
  defaultNoteId: string;
  localizedFolders: StudioFolder[];
  localizedNotes: StudioNote[];
  localizedWorkflowSteps: StudioAiWorkflowStep[];
}) {
  const setupFolder = localizedFolders.find((folder) => folder.id === "machine-bootstrap");
  const setupGroups = setupFolder?.groups ?? [];
  const setupNoteIds = new Set(setupGroups.flatMap((group) => group.noteIds));
  const setupNotes = localizedNotes.filter((note) => setupNoteIds.has(note.id));
  const initialNoteId = setupNotes.some((note) => note.id === defaultNoteId)
    ? defaultNoteId
    : setupNotes[0]?.id ?? defaultNoteId;
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const selectedNote = setupNotes.find((note) => note.id === selectedNoteId) ?? setupNotes[0] ?? localizedNotes[0];
  const workflowFolder = localizedFolders.find((folder) => folder.id === "ai-learning");
  const workflowNoteIds = new Set(workflowFolder?.groups.flatMap((group) => group.noteIds) ?? []);
  const workflowNotes = localizedNotes.filter((note) => workflowNoteIds.has(note.id));

  return (
    <section className="route-page ai-setup-route">
      <RouteHeading route={route} copy={copy}>
        <div className="route-actions">
          {profileActions.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                className="outline-button"
                href={profileHref(locale, item.href)}
                onClick={() => {
                  track("studio_profile_nav_click", {
                    target: item.id,
                    source: "route_actions",
                    external: Boolean(item.external)
                  });
                }}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </div>
      </RouteHeading>

      <div className="ai-setup-container card" data-studio-module="ai-agent-setup">
        <aside className="ai-setup-index" aria-label={copy.aiSetup.agentSetupNotes}>
          <div className="ai-pane-head">
            <span><LuSparkles aria-hidden="true" /></span>
            <div>
              <h2>{setupFolder?.label ?? copy.aiSetup.setupLibrary}</h2>
              <p>{setupFolder?.subtitle ?? copy.aiSetup.agentSetupNotes}</p>
            </div>
          </div>

          <div className="ai-runtime-strip" aria-label={copy.aiSetup.agentRuntimes}>
            {aiRuntimeTargets.map((target) => (
              <span key={target}>{target}</span>
            ))}
          </div>

          <div className="ai-setup-groups">
            {setupGroups.map((group) => (
              <section key={group.label} className="ai-setup-group">
                <p>{group.label}</p>
                <div>
                  {group.noteIds.map((noteId) => {
                    const note = localizedNotes.find((item) => item.id === noteId);
                    if (!note) return null;

                    return (
                      <button
                        key={note.id}
                        type="button"
                        className={`ai-note-button${selectedNote.id === note.id ? " is-active" : ""}`}
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        <span>
                          <strong>{note.title}</strong>
                          <small>{note.subtitle}</small>
                        </span>
                        <em>{statusText(note.status, copy)}</em>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <article id={selectedNote.id} className="ai-setup-reader" aria-label={copy.aiSetup.selectedNote}>
          <div className="ai-reader-head">
            <div>
              <span className={`ai-status-pill status-${selectedNote.status}`}>{statusText(selectedNote.status, copy)}</span>
              <h2>{selectedNote.title}</h2>
              <p>{selectedNote.summary}</p>
            </div>
            <small>{copy.aiSetup.updated} {selectedNote.updatedAt}</small>
          </div>

          <div className="ai-tag-list" aria-label={copy.aiSetup.setupNoteTags}>
            {selectedNote.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="ai-section-list">
            {selectedNote.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

          {selectedNote.commands?.length ? (
            <section className="ai-command-panel" aria-label={copy.aiSetup.setupCommands}>
              <div className="ai-panel-title">
                <LuCommand aria-hidden="true" />
                <div>
                  <h3>{copy.aiSetup.commandRunbook}</h3>
                  <p>{copy.aiSetup.commandRunbookDetail}</p>
                </div>
              </div>
              <div className="ai-command-list">
                {selectedNote.commands.map((command) => (
                  <article className="ai-command-card" key={`${command.label}-${command.command}`}>
                    <span>{command.label}</span>
                    <code>{command.command}</code>
                    {command.note && <p>{command.note}</p>}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {selectedNote.links?.length ? (
            <section className="ai-link-grid" aria-label={copy.aiSetup.referenceLinks}>
              {selectedNote.links.map((link) => (
                <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
                  <strong>{link.label}</strong>
                  {link.note && <span>{link.note}</span>}
                </a>
              ))}
            </section>
          ) : null}
        </article>

        <aside className="ai-workflow-rail" aria-label={copy.aiSetup.aiWorkflow}>
          <div className="ai-pane-head">
            <span><LuWaves aria-hidden="true" /></span>
            <div>
              <h2>{copy.aiSetup.aiWorkflow}</h2>
              <p>{copy.aiSetup.aiWorkflowDetail}</p>
            </div>
          </div>

          <div className="ai-workflow-steps">
            {localizedWorkflowSteps.map((step, index) => (
              <article key={step.title} className={`ai-workflow-step state-${step.state}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <section className="ai-checklist-panel">
            <h3>{copy.aiSetup.setupChecklist}</h3>
            <div>
              {selectedNote.checklist?.map((item) => (
                <label className="check-row checklist-row" key={item.label}>
                  <input type="checkbox" defaultChecked={item.checked} />
                  <span>
                    <strong>{item.label}</strong>
                    {item.detail && <small>{item.detail}</small>}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="ai-research-queue">
            <h3>{copy.aiSetup.researchQueue}</h3>
            {workflowNotes.map((note) => (
              <article key={note.id}>
                <strong>{note.title}</strong>
                <p>{note.subtitle}</p>
              </article>
            ))}
          </section>
        </aside>
      </div>
    </section>
  );
}
