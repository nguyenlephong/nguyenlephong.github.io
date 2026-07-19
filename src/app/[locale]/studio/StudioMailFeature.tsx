
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  LuArchive, LuArrowLeft, LuChevronRight, LuDownload, LuFilter, LuFlag, LuForward,
  LuMail, LuMailOpen, LuMoreVertical, LuPaperclip, LuPin, LuReply, LuReplyAll,
  LuRotateCw, LuSearch, LuSend, LuSmile, LuTag, LuX
} from "react-icons/lu";
import { RouteHeading, RouteMetricGrid } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import { routeMetrics } from "./studio-auxiliary-route-metrics";

function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

type MailAttachment = {
  id: string;
  name: string;
  size: string;
  kind: string;
};

type StudioMail = {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  receivedAt: string;
  folder: "inbox" | "drafts" | "sent" | "archive";
  isRead: boolean;
  isPinned: boolean;
  isPriority: boolean;
  labels: string[];
  attachments?: MailAttachment[];
  messageCount?: number;
};
const studioMails: StudioMail[] = [
  {
    id: "mail-incident-rollback",
    from: { name: "Olivia Rhye", email: "olivia.rhye@railway.co" },
    to: ["Nguyen Le Phong"],
    cc: ["Platform Team"],
    subject: "Staging gateway still returns 502 after rollback",
    body: "Hi Phong,\n\nThe latest rollback finished, but the staging gateway is still returning intermittent 502s. API traffic looks healthy; only the web container readiness probe keeps failing.\n\nCan you check whether the ingress path and service selector still match after the deployment rollback?\n\nThanks,\nOlivia",
    receivedAt: "Just now",
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["incident", "staging", "gateway"],
    attachments: [
      { id: "readiness-log", name: "readiness-log.txt", size: "42 KB", kind: "log" },
      { id: "ingress-diff", name: "ingress-diff.yaml", size: "18 KB", kind: "yaml" }
    ],
    messageCount: 5
  },
  {
    id: "mail-feature-flag",
    from: { name: "Drew Cano", email: "drew.cano@atlasworks.co" },
    to: ["Nguyen Le Phong"],
    subject: "Feature flag rollout plan for enterprise tenants",
    body: "Can we roll the new dashboard to three enterprise tenants first, then expand by percentage after the support window? I want the rollout notes to include rollback criteria and PostHog checks.",
    receivedAt: "12 min ago",
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["feature flag", "enterprise"],
    attachments: [{ id: "rollout-plan", name: "rollout-plan.md", size: "9 KB", kind: "doc" }],
    messageCount: 3
  },
  {
    id: "mail-certificate",
    from: { name: "Lana Steiner", email: "lana.steiner@monsoonanalytics.in" },
    to: ["Nguyen Le Phong"],
    cc: ["Security Review"],
    subject: "Partner certificate rotation confirmation",
    body: "The partner has issued a new certificate for the mTLS channel. Their old certificate expires next Friday. Please confirm whether we can overlap both certificates during the cutover window.",
    receivedAt: "1h ago",
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["mTLS", "security"],
    attachments: [{ id: "partner-cert", name: "partner-cert.pem", size: "3 KB", kind: "cert" }]
  },
  {
    id: "mail-observability",
    from: { name: "Andi Lane", email: "andi.lane@ledgerloop.io" },
    to: ["Nguyen Le Phong"],
    subject: "PostHog anomaly review after mobile release",
    body: "The mobile release looks stable overall, but checkout conversion dipped for one tenant after 10 AM. Can you review the event path and see whether this is a tracking gap or a product regression?",
    receivedAt: "Yesterday",
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: true,
    labels: ["PostHog", "release"]
  },
  {
    id: "mail-draft-runbook",
    from: { name: "Nguyen Le Phong", email: "phongnguyen.itengineer@gmail.com" },
    to: ["Delivery Team"],
    subject: "Draft: production recovery checklist",
    body: "Drafting a shorter runbook for production recovery: identify changed release, verify health checks, inspect ingress and load balancer path, confirm database migration status, decide rollback or hotfix owner.",
    receivedAt: "Draft",
    folder: "drafts",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["runbook", "draft"]
  }
];
function MailRoutePage({ route }: { route: StudioRoute }) {
  const [selectedMailId, setSelectedMailId] = useState(studioMails[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const selectedMail = studioMails.find((mail) => mail.id === selectedMailId) ?? studioMails[0];
  const filteredMails = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return studioMails;
    return studioMails.filter((mail) =>
      [mail.from.name, mail.from.email, mail.subject, mail.body, ...mail.labels].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query]);
  const mailGroups = [
    { id: "pinned", title: "Pinned", items: filteredMails.filter((mail) => mail.isPinned) },
    { id: "inbox", title: "Inbox", items: filteredMails.filter((mail) => !mail.isPinned && mail.folder === "inbox") },
    { id: "drafts", title: "Drafts", items: filteredMails.filter((mail) => mail.folder === "drafts") }
  ].filter((group) => group.items.length > 0);

  return (
    <section className="route-page mail-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <a className="outline-button" href="mailto:phongnguyen.itengineer@gmail.com">
            <LuMail aria-hidden="true" />
            Compose
          </a>
          <button type="button" className="outline-button">
            <LuArchive aria-hidden="true" />
            Archive
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className="mail-workbench card" data-studio-module="mail">
        <aside className="mail-list-pane" aria-label="Mail inbox">
          <div className="mail-pane-toolbar">
            <div>
              <h2>Inbox</h2>
              <p>{filteredMails.length} messages</p>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Filter mail"><LuFilter aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Refresh mail"><LuRotateCw aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="More mail actions"><LuMoreVertical aria-hidden="true" /></button>
            </div>
          </div>

          <label className="studio-search-field">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">Search mail</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mail..." />
          </label>

          <div className="mail-groups">
            {mailGroups.map((group) => (
              <section className="mail-group" key={group.id}>
                <p className="mail-group-title">{group.title} ({group.items.length})</p>
                <div className="mail-row-list">
                  {group.items.map((mail) => (
                    <button
                      key={mail.id}
                      type="button"
                      className={`mail-row${mail.id === selectedMail.id ? " is-active" : ""}${!mail.isRead ? " is-unread" : ""}`}
                      onClick={() => setSelectedMailId(mail.id)}
                    >
                      <span className="mail-avatar" aria-hidden="true">{getInitials(mail.from.name)}</span>
                      <span className="mail-row-body">
                        <span className="mail-row-top">
                          <strong>{mail.from.name}</strong>
                          <small>{mail.receivedAt}</small>
                        </span>
                        <span className="mail-row-subject">
                          {mail.subject}
                          {!mail.isRead && <i aria-label="Unread message" />}
                        </span>
                        <span className="mail-row-preview">{mail.body}</span>
                        <span className="mail-labels" aria-label="Mail labels">
                          {mail.isPinned && <span><LuPin aria-hidden="true" />Pinned</span>}
                          {mail.labels.slice(0, 2).map((label) => <span key={label}>{label}</span>)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <article className="mail-detail-pane" aria-label="Selected email">
          <div className="mail-detail-toolbar">
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Close message"><LuX aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Previous message"><LuArrowLeft aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Next message"><LuChevronRight aria-hidden="true" /></button>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Pin thread"><LuPin aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Archive message"><LuArchive aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Reply"><LuReply aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="More actions"><LuMoreVertical aria-hidden="true" /></button>
            </div>
          </div>

          <div className="mail-message-head">
            <div>
              <h2>{selectedMail.subject}</h2>
              <p>{selectedMail.receivedAt}</p>
            </div>
            {selectedMail.isPriority && <span className="priority-pill"><LuFlag aria-hidden="true" />Priority</span>}
          </div>

          <div className="mail-recipient-row">
            <span className="mail-avatar" aria-hidden="true">{getInitials(selectedMail.from.name)}</span>
            <div>
              <strong>{selectedMail.from.name}</strong>
              <p>{selectedMail.from.email}</p>
              <small>To: {selectedMail.to.join(", ")}{selectedMail.cc?.length ? `; Cc: ${selectedMail.cc.join(", ")}` : ""}</small>
            </div>
          </div>

          {selectedMail.attachments?.length ? (
            <div className="attachment-list" aria-label="Attachments">
              <strong>Attachments ({selectedMail.attachments.length})</strong>
              <div>
                {selectedMail.attachments.map((attachment) => (
                  <button type="button" className="attachment-pill" key={attachment.id}>
                    <LuPaperclip aria-hidden="true" />
                    <span>{attachment.name}</span>
                    <small>{attachment.size}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mail-body">{selectedMail.body}</p>

          <div className="composer-box">
            <div className="composer-input">
              <LuReply aria-hidden="true" />
              <input placeholder={`Reply ${selectedMail.from.name}...`} />
            </div>
            <div className="composer-actions">
              <button type="button" className="icon-ghost" aria-label="Reply all"><LuReplyAll aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Forward"><LuForward aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Add emoji"><LuSmile aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Attach file"><LuPaperclip aria-hidden="true" /></button>
              <button type="button" className="primary-icon" aria-label="Send reply"><LuSend aria-hidden="true" /></button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function StudioMailFeature({ route }: { route: StudioRoute }) {
  return <MailRoutePage route={{ ...route, metrics: routeMetrics[route.id] ?? [] }} />;
}
