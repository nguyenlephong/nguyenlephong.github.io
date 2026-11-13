import type { ReactNode } from "react";
import {
  getStudioAiSetup,
  getStudioDeliveryChecklists,
  getStudioSystemMapViews
} from "./studio-module-sources";
import {
  getStudioStaticContent,
  getStudioStaticModuleHref,
  studioFallbackNoticeByLocale,
  type StudioStaticModule
} from "./studio-static-content";

type ListItem = { id: string; title: string; detail: string; href?: string };

function ModuleSummary({ items }: Readonly<{ items: ListItem[] }>) {
  return (
    <ul className="studio-static-list">
      {items.map((item) => (
        <li key={item.id}>
          {item.href ? <a href={item.href}>{item.title}</a> : <strong>{item.title}</strong>}
          <span>{item.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/** Server-rendered Studio index: the text crawlers and no-JS readers get before the shell loads. */
export default function StudioStaticOverview({ locale }: Readonly<{ locale: string }>) {
  const content = getStudioStaticContent(locale);
  const fallbackNotice = studioFallbackNoticeByLocale[locale as keyof typeof studioFallbackNoticeByLocale];
  const aiSetup = getStudioAiSetup(content.contentLocale);

  const summaries: Record<StudioStaticModule["id"], (href: string) => ReactNode> = {
    "delivery-checklists": (href) => (
      <ModuleSummary
        items={getStudioDeliveryChecklists(content.contentLocale).map((checklist) => ({
          id: checklist.id,
          title: checklist.title,
          detail: checklist.summary,
          href: `${href}#${checklist.id}`
        }))}
      />
    ),
    "flow-react-flow-system-blueprint": (href) => (
      <ModuleSummary
        items={getStudioSystemMapViews(content.contentLocale).map((view) => ({
          id: view.id,
          title: view.title,
          detail: view.description,
          href: `${href}#${view.id}`
        }))}
      />
    ),
    "ai-agent-setup": () => (
      <>
        <ModuleSummary
          items={aiSetup.workflowSteps.map((step) => ({ id: step.title, title: step.title, detail: step.detail }))}
        />
        <p>
          <a href={`/${locale}/studio?route=ai-skills#ai-skills`}>{content.aiSkillsLink}</a>
        </p>
      </>
    )
  };

  return (
    <main
      className="studio-static-overview"
      data-studio-static-overview="true"
      lang={content.contentLocale === locale ? undefined : content.contentLocale}
    >
      <header>
        {fallbackNotice && <p className="studio-static-notice" lang={locale}>{fallbackNotice}</p>}
        <p className="studio-static-intro">{content.intro}</p>
      </header>
      {content.modules.map((module) => {
        const href = getStudioStaticModuleHref(locale, module);
        return (
          <section key={module.id} id={module.slug} aria-labelledby={`studio-${module.slug}-heading`} data-studio-static-module={module.id}>
            <h2 id={`studio-${module.slug}-heading`}>{module.title}</h2>
            <p>{module.lead}</p>
            {summaries[module.id](href)}
            <a className="studio-static-module-link" href={href} data-studio-module-link={module.id}>
              {module.openLabel}
            </a>
          </section>
        );
      })}
    </main>
  );
}
