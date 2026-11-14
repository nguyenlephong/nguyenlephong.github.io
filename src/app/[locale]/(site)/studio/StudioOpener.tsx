import type { ReactNode } from "react";

export type StudioLineStop = {
  id: string;
  stage: string;
  title: string;
  href: string;
};

type StudioOpenerProps = {
  title: string;
  question: string;
  meta: string;
  /** Module pages link back to the Studio index; the index itself has none. */
  crumb?: { href: string; label: string; current: string };
  notice?: string;
  noticeLang?: string;
  children?: ReactNode;
};

/** The chapter opener: title on the left, the reader's question and a meta line on the right. */
export function StudioOpener({ title, question, meta, crumb, notice, noticeLang, children }: StudioOpenerProps) {
  return (
    <header className="studio-opener">
      {crumb && (
        <nav className="studio-crumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={crumb.href} data-track="studio_module_open" data-track-target="index" data-track-source="crumb">
                {crumb.label}
              </a>
            </li>
            <li aria-current="page">{crumb.current}</li>
          </ol>
        </nav>
      )}
      {notice && <p className="studio-notice" lang={noticeLang}>{notice}</p>}
      <div className="studio-opener__grid">
        <h1 className="studio-opener__title">{title}</h1>
        <div className="studio-opener__aside">
          <p className="studio-opener__question">{question}</p>
          <p className="studio-opener__meta">{meta}</p>
        </div>
      </div>
      {children}
    </header>
  );
}

type StudioLineProps = {
  label: string;
  module: string;
  stops: readonly StudioLineStop[];
  lastReadLabel: string;
  /** Module pages start with their first part current; the index has no current stop. */
  startCurrent?: boolean;
};

/** The dashed line that threads a module's parts, one node per part. */
export function StudioLine({ label, module, stops, lastReadLabel, startCurrent = true }: StudioLineProps) {
  return (
    <nav className="studio-line" aria-label={label} data-studio-line={module}>
      <ol style={{ ["--studio-stops" as string]: stops.length }}>
        {stops.map((stop, index) => (
          <li key={stop.id}>
            <a
              className="studio-stop"
              href={stop.href}
              data-studio-stop={stop.id}
              aria-current={startCurrent && index === 0 ? "true" : undefined}
              data-track="studio_part_select"
              data-track-module={module}
              data-track-part={stop.id}
            >
              <span className="studio-stop__dot" aria-hidden="true" />
              <span className="studio-stop__stage">{stop.stage}</span>
              <span className="studio-stop__title">{stop.title}</span>
              <span className="studio-stop__flag">{lastReadLabel}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
