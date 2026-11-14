import { LuArrowRight } from "react-icons/lu";
import { StudioLine, StudioOpener } from "./StudioOpener";
import {
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
  type StudioStaticModule
} from "./studio-static-content";

/** Studio index: the opener, one stop per module on the line, then each module as a short chapter. */
export default function StudioStaticOverview({ locale }: Readonly<{ locale: string }>) {
  const content = getStudioStaticContent(locale);
  const { ui } = content;
  const notice = studioFallbackNoticeByLocale[locale as keyof typeof studioFallbackNoticeByLocale];

  const checklists = getStudioDeliveryChecklists(content.contentLocale);
  const map = getStudioSystemMap(content.contentLocale);
  const ai = getStudioAiSetup(content.contentLocale);
  const metaById: Record<StudioStaticModule["id"], string> = {
    "delivery-checklists": formatStudioLabel(ui.checklistMeta, {
      count: checklists.length,
      steps: checklists.reduce(
        (total, checklist) => total + checklist.sections.reduce((sum, section) => sum + countChecklistSteps(section.steps), 0),
        0
      )
    }),
    "flow-react-flow-system-blueprint": formatStudioLabel(ui.mapMeta, { zones: map.zones.length, nodes: map.nodes.length }),
    "ai-agent-setup": formatStudioLabel(ui.aiMeta, { steps: ai.workflowSteps.length, notes: ai.notes.length, skills: ai.skills.length })
  };

  const partsById: Record<StudioStaticModule["id"], { id: string; title: string }[]> = {
    "delivery-checklists": checklists.map(({ id, title }) => ({ id, title })),
    "flow-react-flow-system-blueprint": map.views.map(({ id, title }) => ({ id, title })),
    "ai-agent-setup": [
      { id: "ai-workflow", title: content.aiWorkflowHeading },
      { id: "ai-notes", title: content.aiNotesHeading },
      { id: "ai-skills", title: ui.aiSkillsHeading }
    ]
  };

  return (
    <main
      id="main-content"
      className="studio-page container"
      data-studio-static-overview="true"
      lang={content.contentLocale === locale ? undefined : content.contentLocale}
    >
      <StudioOpener
        title={content.title}
        question={content.question}
        meta={formatStudioLabel(ui.indexMeta, { count: content.modules.length })}
        notice={notice}
        noticeLang={locale}
      />
      <StudioLine
        label={content.title}
        module="index"
        lastReadLabel={ui.lastRead}
        startCurrent={false}
        stops={content.modules.map((module) => ({
          id: module.slug,
          stage: module.stage,
          title: module.title,
          href: `#${module.slug}`
        }))}
      />
      <p className="studio-intro">{content.intro}</p>
      {content.modules.map((module) => {
        const href = getStudioStaticModuleHref(locale, module);
        return (
          <section
            key={module.id}
            id={module.slug}
            className="studio-chapter"
            aria-labelledby={`studio-${module.slug}-heading`}
            data-studio-static-module={module.id}
          >
            <div className="studio-chapter__head">
              <h2 id={`studio-${module.slug}-heading`}>
                <a href={href} data-track="studio_module_open" data-track-target={module.slug} data-track-source="index">
                  {module.title}
                </a>
              </h2>
              <ul className="studio-chapter__parts">
                {partsById[module.id].map((part) => (
                  <li key={part.id}>
                    <a
                      href={`${href}#${part.id}`}
                      data-track="studio_module_open"
                      data-track-target={module.slug}
                      data-track-part={part.id}
                      data-track-source="index_part"
                    >
                      {part.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="studio-chapter__body">
              <p className="studio-chapter__question">{module.question}</p>
              <p>{module.lead}</p>
              <p className="studio-opener__meta">{metaById[module.id]}</p>
              <a
                className="studio-chapter__link"
                href={href}
                data-studio-module-link={module.id}
                data-track="studio_module_open"
                data-track-target={module.slug}
                data-track-source="index"
              >
                {module.openLabel}
                <LuArrowRight aria-hidden="true" />
              </a>
            </div>
          </section>
        );
      })}
    </main>
  );
}
