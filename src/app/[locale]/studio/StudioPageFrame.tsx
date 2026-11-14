import type { ReactNode } from "react";
import PageTracker from "@/components/analytics/PageTracker";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import StudioWorkspace from "./StudioWorkspace";

/*
 * Light-DOM styles for the route shell and the server-rendered reading view
 * that stands in for the shell until it loads (and for readers without JS).
 */
const studioFrameStyles = `
body:has(.studio-route-shell),
body.studio-app-shell-active {
  overflow: hidden;
  background: var(--bg, #fafafa) !important;
}
body:has(.studio-route-shell) .studio-route-shell,
body.studio-app-shell-active .studio-route-shell {
  height: 100vh !important;
  min-height: 100vh !important;
  overflow: hidden !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
body:has(.studio-route-shell) [data-studio-shadow-host][data-shadow-ready="true"],
body.studio-app-shell-active [data-studio-shadow-host][data-shadow-ready="true"] {
  height: 100vh !important;
  min-height: 100vh !important;
  overflow: hidden !important;
}
[data-studio-shadow-host][data-shadow-ready="false"] {
  --studio-ink: #171717;
  --studio-muted: #525252;
  --studio-rule: #e5e5e5;
  --studio-gutter: clamp(1.25rem, 5vw, 4rem);
  height: 100vh;
  overflow: auto !important;
  color: var(--studio-ink);
  background: #fafafa;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
[data-studio-shadow-host] > .studio-page-heading { box-sizing: border-box; color: inherit; }
[data-studio-shadow-host][data-shadow-ready="false"] > .studio-page-heading,
.studio-static-overview > * {
  width: min(40rem, calc(100% - 2 * var(--studio-gutter, 1.25rem)));
  margin-inline: auto;
}
[data-studio-shadow-host][data-shadow-ready="false"] > .studio-page-heading { padding-top: clamp(2.5rem, 7vw, 5.5rem); }
.studio-page-heading h1 {
  margin: 0;
  font-size: clamp(2.25rem, 6vw, 4.25rem);
  letter-spacing: -0.04em;
  line-height: 1;
  text-wrap: balance;
}
[data-studio-shadow-host][data-shadow-ready="true"] > .studio-page-heading {
  display: block;
  max-width: min(28vw, 18rem);
  overflow: hidden;
}
[data-studio-shadow-host][data-shadow-ready="true"] .studio-page-heading__title {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.studio-static-overview {
  box-sizing: border-box;
  padding: 1.25rem 0 clamp(3rem, 8vw, 6rem);
  line-height: 1.65;
}
.studio-static-overview * { box-sizing: border-box; }
.studio-static-overview p, .studio-static-overview li { color: var(--studio-muted); }
.studio-static-overview strong, .studio-static-overview a { color: var(--studio-ink); }
.studio-static-overview a { text-decoration-thickness: 0.07em; text-underline-offset: 0.22em; }
.studio-static-overview a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; border-radius: 2px; }
.studio-static-intro { margin: 0; font-size: clamp(1.05rem, 2vw, 1.25rem); }
.studio-static-overview section { margin-top: clamp(2.75rem, 7vw, 4.5rem); }
.studio-static-overview section section { margin-top: 2.25rem; }
.studio-static-overview h2, .studio-static-overview h3 { margin: 0 0 0.6rem; color: var(--studio-ink); letter-spacing: -0.015em; line-height: 1.25; }
.studio-static-overview h2 { font-size: clamp(1.35rem, 3vw, 1.65rem); }
.studio-static-overview h3 { font-size: 1.05rem; }
.studio-static-overview ul, .studio-static-overview ol { margin: 1.1rem 0 0; padding-left: 1.25rem; }
.studio-static-overview li { margin-top: 0.45rem; }
.studio-static-overview li::marker { color: var(--studio-muted); }
.studio-static-overview ol > li { color: var(--studio-ink); }
.studio-static-overview .studio-step-detail { color: var(--studio-muted); }
.studio-static-list { padding: 0 !important; list-style: none; border-top: 1px solid var(--studio-rule); }
.studio-static-list > li { margin: 0; padding: 0.85rem 0; border-bottom: 1px solid var(--studio-rule); }
.studio-static-list > li > strong, .studio-static-list > li > a { display: block; font-weight: 650; }
.studio-static-list > li > span { display: block; margin-top: 0.2rem; }
.studio-static-crumb, .studio-static-notice { margin: 0 0 1.25rem; font-size: 0.875rem; }
.studio-static-module-link { display: inline-flex; align-items: center; min-height: 44px; margin-top: 0.75rem; font-weight: 650; }
@media (prefers-color-scheme: dark) {
  [data-studio-shadow-host][data-shadow-ready="false"] {
    --studio-ink: #f5f5f5;
    --studio-muted: #a3a3a3;
    --studio-rule: #262626;
    background: #0a0a0a;
  }
}
`;

type StudioPageFrameProps = {
  locale: string;
  title: string;
  /** Set when the visible prose falls back to another language than the route. */
  contentLang?: string;
  jsonLd: readonly object[];
  trackerContext?: Readonly<Record<string, unknown>>;
  children: ReactNode;
};

export default function StudioPageFrame({
  locale,
  title,
  contentLang,
  jsonLd,
  trackerContext,
  children
}: StudioPageFrameProps) {
  return (
    <div className="studio-route-shell">
      <style dangerouslySetInnerHTML={{ __html: studioFrameStyles }} />
      {jsonLd.map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}
        />
      ))}
      <PageTracker page="studio" eventName="studio_view" section="notes_admin" context={trackerContext} />
      <StudioWorkspace
        locale={locale}
        heading={(
          <div
            slot="studio-page-heading"
            className="studio-page-heading"
            data-studio-page-heading="true"
            lang={contentLang}
          >
            <h1 className="studio-page-heading__title">{title}</h1>
          </div>
        )}
        fallback={children}
      />
    </div>
  );
}
