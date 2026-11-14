import type { ReactNode } from "react";
import type { StudioChecklistStep } from "./studio.data";
import {
  getStudioAiSetup,
  getStudioDeliveryChecklists,
  getStudioSystemMapViews
} from "./studio-module-sources";
import {
  getStudioStaticContent,
  studioFallbackNoticeByLocale,
  type StudioContentLocale,
  type StudioStaticContent,
  type StudioStaticModule
} from "./studio-static-content";

function ChecklistSteps({ steps }: Readonly<{ steps: StudioChecklistStep[] }>) {
  return (
    <ol>
      {steps.map((step) => (
        <li key={step.id}>
          {step.label}
          {step.detail && <span className="studio-step-detail"> {step.detail}</span>}
          {step.children?.length ? <ChecklistSteps steps={step.children} /> : null}
        </li>
      ))}
    </ol>
  );
}

function ChecklistsBody({ locale }: Readonly<{ locale: StudioContentLocale }>) {
  return getStudioDeliveryChecklists(locale).map((checklist) => (
    <section key={checklist.id} id={checklist.id} aria-labelledby={`${checklist.id}-heading`}>
      <h2 id={`${checklist.id}-heading`}>{checklist.title}</h2>
      <p>{checklist.summary} {checklist.whenToUse}</p>
      {checklist.sections.map((section) => (
        <section key={section.id}>
          <h3>{section.title}</h3>
          <p>{section.detail}</p>
          <ChecklistSteps steps={section.steps} />
        </section>
      ))}
    </section>
  ));
}

function SystemMapsBody({ locale }: Readonly<{ locale: StudioContentLocale }>) {
  return getStudioSystemMapViews(locale).map((view) => (
    <section key={view.id} id={view.id} aria-labelledby={`${view.id}-heading`}>
      <h2 id={`${view.id}-heading`}>{view.title}</h2>
      <p>{view.description}</p>
      <ul className="studio-static-list">
        {view.nodes.map((node) => (
          <li key={node.id}>
            <strong>{node.title}</strong>
            <span>{node.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  ));
}

function AiSetupBody({ locale, content }: Readonly<{ locale: StudioContentLocale; content: StudioStaticContent }>) {
  const { workflowSteps, notes } = getStudioAiSetup(locale);
  return (
    <>
      <section aria-labelledby="ai-workflow-heading">
        <h2 id="ai-workflow-heading">{content.aiWorkflowHeading}</h2>
        <ol>
          {workflowSteps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}.</strong> <span className="studio-step-detail">{step.detail}</span>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="ai-notes-heading">
        <h2 id="ai-notes-heading">{content.aiNotesHeading}</h2>
        <ul className="studio-static-list">
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              <span>{note.summary}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** Server-rendered text of one Studio module, shown until the interactive shell takes over. */
export default function StudioModuleArticle({
  locale,
  module
}: Readonly<{ locale: string; module: StudioStaticModule }>) {
  const content = getStudioStaticContent(locale);
  const fallbackNotice = studioFallbackNoticeByLocale[locale as keyof typeof studioFallbackNoticeByLocale];
  const bodies: Record<StudioStaticModule["id"], ReactNode> = {
    "delivery-checklists": <ChecklistsBody locale={content.contentLocale} />,
    "flow-react-flow-system-blueprint": <SystemMapsBody locale={content.contentLocale} />,
    "ai-agent-setup": <AiSetupBody locale={content.contentLocale} content={content} />
  };

  return (
    <main
      className="studio-static-overview"
      data-studio-static-module-page={module.id}
      lang={content.contentLocale === locale ? undefined : content.contentLocale}
    >
      <header>
        <p className="studio-static-crumb">
          <a href={`/${locale}/studio`}>{content.breadcrumbLabel}</a>
        </p>
        {fallbackNotice && <p className="studio-static-notice" lang={locale}>{fallbackNotice}</p>}
        <p className="studio-static-intro">{module.lead}</p>
      </header>
      {bodies[module.id]}
      {module.id === "ai-agent-setup" && (
        <p>
          <a href={`/${locale}/studio?route=ai-skills#ai-skills`}>{content.aiSkillsLink}</a>
        </p>
      )}
    </main>
  );
}
