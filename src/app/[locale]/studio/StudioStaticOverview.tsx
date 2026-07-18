import {
  getStudioStaticContent,
  getStudioStaticModuleHref
} from "./studio-static-content";

export default function StudioStaticOverview({ locale }: Readonly<{ locale: string }>) {
  const content = getStudioStaticContent(locale);

  return (
    <main className="studio-static-overview" data-studio-static-overview="true">
      <style>{`
        .studio-static-overview {
          box-sizing: border-box;
          min-height: calc(100vh - 9rem);
          padding: 1.35rem clamp(1.25rem, 5vw, 4rem) clamp(2rem, 6vw, 5.5rem);
          color: inherit;
          background: transparent;
          font: inherit;
        }
        .studio-static-overview * { box-sizing: border-box; }
        .studio-static-overview > header,
        .studio-static-overview > section { width: min(72rem, 100%); margin-inline: auto; }
        .studio-static-overview .studio-static-intro {
          max-width: 48rem;
          margin: 0;
          color: #525252;
          font-size: clamp(1rem, 2vw, 1.2rem);
          line-height: 1.7;
        }
        .studio-static-overview > section { margin-top: clamp(2.5rem, 6vw, 5rem); }
        .studio-static-overview h2 { margin: 0 0 1.25rem; font-size: 1.1rem; }
        .studio-static-overview ul {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
          gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .studio-static-overview li {
          min-height: 13rem;
          padding: 1.4rem;
          border: 1px solid #e5e5e5;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 1rem 3rem rgba(23, 23, 23, 0.05);
        }
        .studio-static-overview h3 { margin: 0; font-size: 1.05rem; }
        .studio-static-overview h3 a { color: inherit; text-decoration-thickness: 0.08em; text-underline-offset: 0.2em; }
        .studio-static-overview li p { margin: 0.9rem 0 1.2rem; color: #525252; line-height: 1.65; }
        .studio-static-overview li > a { color: #171717; font-size: 0.82rem; font-weight: 700; }
        @media (prefers-color-scheme: dark) {
          .studio-static-overview .studio-static-intro,
          .studio-static-overview li p { color: #a3a3a3; }
          .studio-static-overview li { border-color: #262626; background: #171717; }
          .studio-static-overview h3 a,
          .studio-static-overview li > a { color: #f5f5f5; }
        }
      `}</style>
      <header>
        <p className="studio-static-intro">{content.intro}</p>
      </header>
      <section aria-labelledby="studio-static-modules-heading">
        <h2 id="studio-static-modules-heading">{content.moduleHeading}</h2>
        <ul>
          {content.modules.map((module) => {
            const href = getStudioStaticModuleHref(locale, module);
            return (
              <li key={module.id} id={module.id} data-studio-static-module={module.id}>
                <h3><a href={href}>{module.title}</a></h3>
                <p>{module.description}</p>
                <a href={href} data-studio-module-link={module.id}>{content.openLabel}</a>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
