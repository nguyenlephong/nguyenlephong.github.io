"use client";
import { useRef, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LuArrowUpRight } from "react-icons/lu";
import type { ExperienceRole } from "@/app/app.type";
import { track } from "@/lib/analytics";
import CareerGraph, { type NodeKind } from "./CareerGraph";

type Props = { data: ExperienceRole[] };

const bold = (chunks: ReactNode) => <b>{chunks}</b>;

// The current role shows three contributions, past roles two; the rest sit behind "All contributions".
const topCount = (role: ExperienceRole): number => (role.end ? 2 : 3);
// The boomerang: Zalo PC forks to NDSVN and merges back as Lead.
const NODE: Record<string, NodeKind> = {
  zaloLead: "merge",
  ndsvn: "branch",
  zaloSenior: "fork"
};

// Fixed tables, not Intl: build-time Node ICU and visitor browsers disagree on short months
// (e.g. fr "sept."), which would break hydration of the <time> text.
const MONTHS: Record<string, string[]> = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  fr: [
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc."
  ]
};

function formatMonth(ym: string, locale: string): string {
  const [year, month] = ym.split("-").map(Number);
  switch (locale) {
    case "vi":
      return `${String(month).padStart(2, "0")}/${year}`;
    case "ja":
    case "zh":
      return `${year}年${month}月`;
    case "ko":
      return `${year}년 ${month}월`;
    default:
      return `${(MONTHS[locale] ?? MONTHS["en"])[month - 1]} ${year}`;
  }
}

type DatesProps = {
  role: ExperienceRole;
  locale: string;
  now: string;
  node: NodeKind;
};

function Dates({ role, locale, now, node }: DatesProps) {
  return (
    <p className="xp-dates" data-node={node}>
      <time dateTime={role.start}>{formatMonth(role.start, locale)}</time>
      {" – "}
      {role.end ? (
        <time dateTime={role.end}>{formatMonth(role.end, locale)}</time>
      ) : (
        now
      )}
    </p>
  );
}

export default function Experience({ data }: Props) {
  const t = useTranslations("Experience");
  const locale = useLocale();
  const listRef = useRef<HTMLOListElement>(null);
  const now = t("labels.now");
  const main = data.filter((r) => !r.earlier);
  const earlier = data.filter((r) => r.earlier);

  return (
    <div className="xp-wrap">
      <CareerGraph
        listRef={listRef}
        forkNote={t("labels.forkNote")}
        mergeNote={t("labels.mergeNote")}
      />
      <ol ref={listRef} className="xp">
        {main.map((role) => {
          // Precompiled messages have no arrays or t.raw: contributions are keyed "0", "1", … (MEP-71).
          const items: ReactNode[] = [];
          while (t.has(`roles.${role.id}.contributions.${items.length}`))
            items.push(
              t.rich(`roles.${role.id}.contributions.${items.length}`, {
                b: bold
              })
            );
          const top = topCount(role);
          const rest = items.slice(top);
          return (
            <li key={role.id} className="xp-row" id={`xp-${role.id}`}>
              <Dates
                role={role}
                locale={locale}
                now={now}
                node={NODE[role.id] ?? "commit"}
              />
              <div className="xp-body">
                <h3 className="xp-title">{role.title}</h3>
                <p className="xp-org">
                  <span className="xp-company">{role.company}</span>
                  <span className="xp-env">{t(`env.${role.env}`)}</span>
                </p>
                <p className="xp-scope">{t(`roles.${role.id}.scope`)}</p>
                <ul className="xp-list">
                  {items.slice(0, top).map((item, i) => (
                    <li key={i}>
                      <span>{item}</span>
                      {i === 0 && role.evidence && (
                        <Evidence
                          role={role}
                          label={t("labels.readCoverage", {
                            publisher: role.evidence.publisher
                          })}
                        />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="xp-foot">
                  {rest.length > 0 && (
                    <details
                      className="xp-more"
                      onToggle={(e) => {
                        if (e.currentTarget.open)
                          track("cv_experience_expand", { role: role.id });
                      }}
                    >
                      <summary>
                        {t("labels.allContributions", { count: items.length })}
                      </summary>
                      <ul className="xp-list">
                        {rest.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <p className="xp-tech">{role.techs.join(" · ")}</p>
                </div>
              </div>
            </li>
          );
        })}

        {earlier.length > 0 && (
          <li className="xp-row is-group">
            <h3 className="xp-group">{t("labels.earlier")}</h3>
          </li>
        )}
        {earlier.map((role) => (
          <li key={role.id} className="xp-row is-earlier" id={`xp-${role.id}`}>
            <Dates role={role} locale={locale} now={now} node="leaf" />
            <div className="xp-body">
              <h4 className="xp-title">{role.title}</h4>
              <p className="xp-org">
                <span className="xp-company">{role.company}</span>
                <span className="xp-env">{t(`env.${role.env}`)}</span>
              </p>
              <p className="xp-scope">{t(`roles.${role.id}.line`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Evidence({ role, label }: { role: ExperienceRole; label: string }) {
  const evidence = role.evidence;
  if (!evidence) return null;
  return (
    <>
      {" "}
      <a
        className="xp-evidence"
        href={evidence.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track(
            "cv_experience_evidence_click",
            {
              company: role.company,
              role: role.title,
              publisher: evidence.publisher,
              published_at: evidence.publishedAt
            },
            { beacon: true }
          )
        }
      >
        {label}
        <LuArrowUpRight size={13} aria-hidden="true" />
      </a>
    </>
  );
}
