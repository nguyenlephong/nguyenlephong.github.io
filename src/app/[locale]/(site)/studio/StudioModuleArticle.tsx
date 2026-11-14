import type { ReactNode } from "react";
import { LuArrowRight } from "react-icons/lu";
import StudioChecklistTicks from "./StudioChecklistTicks";
import StudioCopyButton from "./StudioCopyButton";
import { StudioLine, StudioOpener } from "./StudioOpener";
import StudioReadingState from "./StudioReadingState";
import StudioSystemMapViewer from "./StudioSystemMapViewer";
import type { StudioChecklistStep, StudioWorkflowChecklist } from "./studio.data";
import {
  checklistMarkdown,
  countChecklistSteps,
  getStudioAiSetup,
  getStudioDeliveryChecklists,
  getStudioSystemMap
} from "./studio-module-sources";
import {
  formatStudioLabel,
  getStudioStaticContent,
  getStudioStaticModuleHref,
  studioFallbackNoticeByLocale,
  type StudioStaticContent,
  type StudioStaticModule
} from "./studio-static-content";

type BodyProps = Readonly<{ locale: string; content: StudioStaticContent; module: StudioStaticModule }>;

function ChecklistSteps({ checklistId, sectionId, steps }: Readonly<{ checklistId: string; sectionId: string; steps: StudioChecklistStep[] }>) {
  return (
    <ul className="studio-steps">
      {steps.map((step) => (
        <li key={step.id}>
          <label className="studio-step">
            <input type="checkbox" data-studio-step={`${checklistId}/${sectionId}/${step.id}`} />
            <span>
              {step.label}
              {step.detail && <span className="studio-step__detail"> {step.detail}</span>}
            </span>
          </label>
          {step.children?.length ? <ChecklistSteps checklistId={checklistId} sectionId={sectionId} steps={step.children} /> : null}
        </li>
      ))}
    </ul>
  );
}

function Checklist({ checklist, content }: Readonly<{ checklist: StudioWorkflowChecklist; content: StudioStaticContent }>) {
  const { ui } = content;
  const steps = checklist.sections.reduce((total, section) => total + countChecklistSteps(section.steps), 0);
  const sourceId = `${checklist.id}-markdown`;
  return (
    <section id={checklist.id} className="studio-part" data-studio-part={checklist.id} aria-labelledby={`${checklist.id}-heading`}>
      <div className="studio-part__main">
        <h2 id={`${checklist.id}-heading`}>{checklist.title}</h2>
        <p className="studio-lead">{checklist.summary}</p>
        <p className="studio-when">
          <span>{ui.useWhen}</span> {checklist.whenToUse}
        </p>
        {checklist.sections.map((section) => (
          <section key={section.id} className="studio-gate" aria-labelledby={`${checklist.id}-${section.id}`}>
            <h3 id={`${checklist.id}-${section.id}`}>{section.title}</h3>
            <p>{section.detail}</p>
            <ChecklistSteps checklistId={checklist.id} sectionId={section.id} steps={section.steps} />
          </section>
        ))}
      </div>
      <aside className="studio-part__aside">
        <StudioCopyButton
          sourceId={sourceId}
          label={ui.copyMarkdown}
          copiedLabel={ui.copied}
          failedLabel={ui.copyFailed}
          event="studio_checklist_copy"
          eventProps={{ checklist_id: checklist.id }}
        />
        <p>
          <span className="studio-mono">{formatStudioLabel(ui.stepCount, { count: steps })}</span>
          <br />
          {ui.tickNote}
        </p>
        <pre id={sourceId} hidden>{checklistMarkdown(checklist, ui.useWhen)}</pre>
      </aside>
    </section>
  );
}

function ChecklistsBody({ content, module }: BodyProps) {
  const checklists = getStudioDeliveryChecklists(content.contentLocale);
  const steps = checklists.reduce(
    (total, checklist) => total + checklist.sections.reduce((sum, section) => sum + countChecklistSteps(section.steps), 0),
    0
  );
  return {
    meta: formatStudioLabel(content.ui.checklistMeta, { count: checklists.length, steps }),
    line: (
      <StudioLine
        label={module.title}
        module={module.slug}
        lastReadLabel={content.ui.lastRead}
        stops={checklists.map((checklist) => ({
          id: checklist.id,
          stage: content.ui.checklistStages[checklist.id] ?? "",
          title: checklist.title,
          href: `#${checklist.id}`
        }))}
      />
    ),
    body: (
      <>
        <StudioReadingState module={module.slug} />
        <StudioChecklistTicks />
        {checklists.map((checklist) => (
          <Checklist key={checklist.id} checklist={checklist} content={content} />
        ))}
      </>
    )
  };
}

function SystemMapsBody({ content, module }: BodyProps) {
  const map = getStudioSystemMap(content.contentLocale);
  const { ui } = content;
  return {
    meta: formatStudioLabel(ui.mapMeta, { zones: map.zones.length, nodes: map.nodes.length }),
    line: (
      <StudioSystemMapViewer
          map={map}
          labels={{
            line: module.title,
            map: ui.mapLabel,
            wholeMap: ui.wholeMap,
            zoomIn: ui.zoomIn,
            zoomOut: ui.zoomOut,
            hint: ui.mapHint,
          stages: ui.mapStages
        }}
      />
    ),
    body: (
      <>
        {map.views.map((view) => (
          <section key={view.id} id={view.id} className="studio-part" data-studio-part={view.id} aria-labelledby={`${view.id}-heading`}>
            <div className="studio-part__main">
              <h2 id={`${view.id}-heading`}>{view.title}</h2>
              <p className="studio-lead">{view.description}</p>
              {map.zones
                .filter((zone) => view.zoneIds.includes(zone.id))
                .map((zone) => {
                  const zoneNodes = map.nodes.filter((node) => node.zoneId === zone.id && view.nodeIds.includes(node.id));
                  if (!zoneNodes.length) return null;
                  return (
                    <div key={zone.id}>
                      <h3 className="studio-zone-title">{zone.title}</h3>
                      <ul className="studio-components">
                        {zoneNodes.map((node) => (
                          <li key={node.id}>
                            <button type="button" className="studio-component" data-studio-map-node={node.id}>
                              <span className="studio-component__title">{node.title}</span>
                              <span className="studio-component__detail">{node.detail}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </>
    )
  };
}

function AiSetupBody({ content, module }: BodyProps) {
  const { workflowSteps, notes, skills } = getStudioAiSetup(content.contentLocale);
  const { ui } = content;
  const parts = [
    { id: "ai-workflow", stage: ui.aiStages.workflow, title: content.aiWorkflowHeading },
    { id: "ai-notes", stage: ui.aiStages.notes, title: content.aiNotesHeading },
    { id: "ai-skills", stage: ui.aiStages.skills, title: ui.aiSkillsHeading }
  ];
  return {
    meta: formatStudioLabel(ui.aiMeta, { steps: workflowSteps.length, notes: notes.length, skills: skills.length }),
    line: (
      <StudioLine
        label={module.title}
        module={module.slug}
        lastReadLabel={ui.lastRead}
        stops={parts.map((part) => ({ ...part, href: `#${part.id}` }))}
      />
    ),
    body: (
      <>
        <StudioReadingState module={module.slug} />
        <section id="ai-workflow" className="studio-part" data-studio-part="ai-workflow" aria-labelledby="ai-workflow-heading">
          <div className="studio-part__main">
            <h2 id="ai-workflow-heading">{content.aiWorkflowHeading}</h2>
            <ol className="studio-flow">
              {workflowSteps.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section id="ai-notes" className="studio-part" data-studio-part="ai-notes" aria-labelledby="ai-notes-heading">
          <div className="studio-part__main">
            <h2 id="ai-notes-heading">{content.aiNotesHeading}</h2>
            <ul className="studio-rows">
              {notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.title}</strong>
                  <p>{note.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section id="ai-skills" className="studio-part" data-studio-part="ai-skills" aria-labelledby="ai-skills-heading">
          <div className="studio-part__main">
            <h2 id="ai-skills-heading">{ui.aiSkillsHeading}</h2>
            <p className="studio-lead">{ui.aiSkillsLead}</p>
            <ul className="studio-rows studio-skills">
              {skills.map((skill) => {
                const sourceId = `skill-${skill.id}`;
                return (
                  <li key={skill.id} id={`skill-row-${skill.id}`}>
                    <div className="studio-skill__head">
                      <strong>{skill.title}</strong>
                      <span className="studio-mono">{skill.category}</span>
                    </div>
                    <p>{skill.summary}</p>
                    <div className="studio-skill__actions">
                      <details>
                        <summary>{ui.showMarkdown}</summary>
                        <pre id={sourceId}>{skill.markdown}</pre>
                      </details>
                      <StudioCopyButton
                      sourceId={sourceId}
                      label={ui.copyMarkdown}
                      copiedLabel={ui.copied}
                      failedLabel={ui.copyFailed}
                      event="studio_ai_skill_copy"
                        eventProps={{ skill_id: skill.id, category: skill.category }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </>
    )
  };
}

const bodies: Record<StudioStaticModule["id"], (props: BodyProps) => { meta: string; line: ReactNode; body: ReactNode }> = {
  "delivery-checklists": ChecklistsBody,
  "flow-react-flow-system-blueprint": SystemMapsBody,
  "ai-agent-setup": AiSetupBody
};

/** One Studio module page: chapter opener, its line, the reading column, and the way to the next module. */
export default function StudioModuleArticle({ locale, module }: Readonly<{ locale: string; module: StudioStaticModule }>) {
  const content = getStudioStaticContent(locale);
  const notice = studioFallbackNoticeByLocale[locale as keyof typeof studioFallbackNoticeByLocale];
  const { meta, line, body } = bodies[module.id]({ locale, content, module });
  const index = content.modules.findIndex((candidate) => candidate.id === module.id);
  const next = content.modules[(index + 1) % content.modules.length];

  return (
    <main
      id="main-content"
      className="studio-page container"
      data-studio-module-page={module.id}
      lang={content.contentLocale === locale ? undefined : content.contentLocale}
    >
      <StudioOpener
        title={module.title}
        question={module.question}
        meta={meta}
        crumb={{ href: `/${locale}/studio`, label: content.ui.breadcrumb, current: module.title }}
        notice={notice}
        noticeLang={locale}
      />
      {line}
      <p className="studio-intro">{module.lead}</p>
      {body}
      {next && (
        <nav className="studio-next" aria-label={content.ui.nextModule}>
          <a
            href={getStudioStaticModuleHref(locale, next)}
            data-track="studio_module_open"
            data-track-target={next.slug}
            data-track-source="next"
          >
            <span className="studio-mono">{content.ui.nextModule}</span>
            <span className="studio-next__title">{next.title}</span>
            <LuArrowRight aria-hidden="true" />
          </a>
        </nav>
      )}
    </main>
  );
}
