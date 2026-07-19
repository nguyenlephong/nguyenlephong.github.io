
"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  LuAlarmClock, LuArrowLeft, LuBriefcase, LuCheckCircle2, LuChevronRight, LuCopy,
  LuFilter, LuGlobe, LuLink, LuMail, LuMapPin, LuMessageSquare, LuMonitor,
  LuMoreVertical, LuPaperclip, LuPhone, LuPhoneCall, LuSearch, LuSend, LuSmile,
  LuSparkles, LuTag, LuType, LuUser, LuX
} from "react-icons/lu";
import { RouteHeading, RouteMetricGrid } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import { routeMetrics } from "./studio-auxiliary-route-metrics";

function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

type ChatMessage = {
  id: number;
  side: "in" | "out";
  text: string;
  time: string;
};

type ChatContact = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  timezone: string;
  status: string;
  qualifiedAt: string;
  tags: string[];
};

type StudioConversation = {
  id: number;
  group: "Pinned" | "Today" | "Yesterday";
  name: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isOnline: boolean;
  unreadCount: number;
  contact: ChatContact;
  messages: ChatMessage[];
};
const studioConversations: StudioConversation[] = [
  {
    id: 1,
    group: "Pinned",
    name: "Olivia Rhye",
    subject: "Deployment pipeline failing on staging",
    preview: "502s started after the latest build. Rollback did not clear the readiness failure.",
    time: "Just now",
    isUnread: true,
    isOnline: true,
    unreadCount: 4,
    contact: {
      name: "Olivia Rhye",
      role: "Senior DevOps Engineer",
      company: "Railway Systems Inc.",
      email: "olivia.rhye@railway.co",
      phone: "+1 (415) 555-0123",
      website: "railway.co",
      location: "San Francisco, CA",
      timezone: "PDT (UTC-7)",
      status: "P0",
      qualifiedAt: "Mar 5, 2026",
      tags: ["DevOps", "Gateway", "Enterprise"]
    },
    messages: [
      { id: 101, side: "in", text: "We are seeing 502s on staging right after the latest build. Rollback finished, but health checks are still red.", time: "10 min ago" },
      { id: 102, side: "out", text: "Thanks, Olivia. I am checking deploy logs, service selectors, and the gateway routing config now.", time: "8 min ago" },
      { id: 103, side: "in", text: "API traffic looks fine. The web container keeps failing readiness probes.", time: "5 min ago" },
      { id: 104, side: "out", text: "Found a staging env mismatch on the web workload. I am applying the fix and will confirm once probes recover.", time: "3 min ago" }
    ]
  },
  {
    id: 2,
    group: "Pinned",
    name: "Phoenix Baker",
    subject: "Refund for order #8823 double charged",
    preview: "Payment retry created a duplicate transaction this morning.",
    time: "5m",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Phoenix Baker",
      role: "Operations Lead",
      company: "Meridian Retail Group",
      email: "phoenix.baker@meridianretail.com",
      phone: "+1 (312) 555-0184",
      website: "meridianretail.com",
      location: "Chicago, IL",
      timezone: "CDT (UTC-5)",
      status: "Partner",
      qualifiedAt: "Jan 18, 2026",
      tags: ["Billing", "Enterprise"]
    },
    messages: [
      { id: 201, side: "in", text: "I was charged twice for order #8823. One payment cleared on the 3rd and the duplicate posted this morning.", time: "5 min ago" },
      { id: 202, side: "out", text: "I can see both transactions. I am checking which one was attached to the invoice.", time: "4 min ago" },
      { id: 203, side: "out", text: "The duplicate was a retry from the old payment method. I started the refund and sent the receipt to billing.", time: "2 min ago" }
    ]
  },
  {
    id: 3,
    group: "Today",
    name: "Lana Steiner",
    subject: "Analytics dashboard 403 after role update",
    preview: "Exports work, but dashboard views reject the new custom role.",
    time: "8m",
    isUnread: true,
    isOnline: false,
    unreadCount: 2,
    contact: {
      name: "Lana Steiner",
      role: "Data Platform Lead",
      company: "Monsoon Analytics",
      email: "lana.steiner@monsoonanalytics.in",
      phone: "+91 98765 43210",
      website: "monsoonanalytics.in",
      location: "Bengaluru, India",
      timezone: "IST (UTC+5:30)",
      status: "Qualified",
      qualifiedAt: "Apr 2, 2026",
      tags: ["IAM", "Analytics", "High Value"]
    },
    messages: [
      { id: 301, side: "in", text: "I am getting a 403 on analytics dashboards since yesterday's role update. Clearing cache did not help.", time: "8 min ago" },
      { id: 302, side: "out", text: "I will compare your new role against the dashboard permission set.", time: "7 min ago" },
      { id: 303, side: "out", text: "Analytics Viewer was dropped from your custom role. I reattached it for the workspace.", time: "3 min ago" }
    ]
  },
  {
    id: 4,
    group: "Today",
    name: "Candice Wu",
    subject: "Bulk export times out near 60 percent",
    preview: "The full shipment history export hits a gateway timeout during peak.",
    time: "10:15 AM",
    isUnread: false,
    isOnline: false,
    unreadCount: 0,
    contact: {
      name: "Candice Wu",
      role: "Data Engineer",
      company: "Harbor Ops",
      email: "candice.wu@harborops.com",
      phone: "+1 (206) 555-0172",
      website: "harborops.com",
      location: "Seattle, WA",
      timezone: "PDT (UTC-7)",
      status: "Lead",
      qualifiedAt: "May 10, 2026",
      tags: ["Data", "Performance"]
    },
    messages: [
      { id: 401, side: "in", text: "The bulk export keeps timing out. It reaches about 60 percent and then throws a gateway error.", time: "10:15 AM" },
      { id: 402, side: "out", text: "I will queue it as an async export and email the download link once it finishes.", time: "10:12 AM" }
    ]
  },
  {
    id: 5,
    group: "Yesterday",
    name: "Drew Cano",
    subject: "Onboarding docs for new backend hire",
    preview: "Need repo access, staging credentials, and branch naming rules.",
    time: "Yesterday",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Drew Cano",
      role: "Engineering Manager",
      company: "AtlasWorks",
      email: "drew.cano@atlasworks.co",
      phone: "+1 (512) 555-0166",
      website: "atlasworks.co",
      location: "Austin, TX",
      timezone: "CDT (UTC-5)",
      status: "Partner",
      qualifiedAt: "Aug 3, 2025",
      tags: ["Onboarding", "Platform"]
    },
    messages: [
      { id: 501, side: "in", text: "We have a backend developer starting Monday. What is the best onboarding path for repo access and environment setup?", time: "Yesterday" },
      { id: 502, side: "out", text: "I will send the standard engineering checklist with staging access and repository conventions.", time: "Yesterday" }
    ]
  }
];
function ChatRoutePage({ route }: { route: StudioRoute }) {
  const [selectedConversationId, setSelectedConversationId] = useState(studioConversations[0]?.id ?? 0);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "snoozed" | "closed">("all");
  const [profileOpen, setProfileOpen] = useState(true);
  const activeConversation = studioConversations.find((conversation) => conversation.id === selectedConversationId) ?? studioConversations[0];
  const groupedConversations = studioConversations.reduce<Array<{ group: StudioConversation["group"]; items: StudioConversation[] }>>((groups, conversation) => {
    const group = groups.find((item) => item.group === conversation.group);
    if (group) group.items.push(conversation);
    else groups.push({ group: conversation.group, items: [conversation] });
    return groups;
  }, []);

  return (
    <section className="route-page chat-route">
      <RouteHeading route={route}>
        <div className="route-actions">
          <button type="button" className="outline-button"><LuMessageSquare aria-hidden="true" />New thread</button>
          <button type="button" className="outline-button" onClick={() => setProfileOpen((value) => !value)}>
            <LuUser aria-hidden="true" />
            Profile
          </button>
        </div>
      </RouteHeading>

      <RouteMetricGrid metrics={route.metrics} />

      <div className={`chat-workbench card${profileOpen ? " has-profile" : ""}`} data-studio-module="chat">
        <aside className="chat-list-pane" aria-label="Chat conversations">
          <div className="mail-pane-toolbar">
            <div>
              <h2>Inbox</h2>
              <p>24 open conversations</p>
            </div>
            <button type="button" className="icon-ghost" aria-label="Filter conversations"><LuFilter aria-hidden="true" /></button>
          </div>

          <div className="chat-tabs" role="tablist" aria-label="Conversation states">
            {(["all", "open", "snoozed", "closed"] as const).map((tab) => (
              <button key={tab} type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <div className="chat-groups">
            {groupedConversations.map((group) => (
              <section className="chat-group" key={group.group}>
                <p className="mail-group-title">{group.group}</p>
                {group.items.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`chat-row${conversation.id === activeConversation.id ? " is-active" : ""}`}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <span className="chat-avatar" aria-hidden="true">
                      {getInitials(conversation.name)}
                      {conversation.isOnline && <i />}
                    </span>
                    <span className="chat-row-body">
                      <span className="mail-row-top"><strong>{conversation.name}</strong><small>{conversation.time}</small></span>
                      <span className="mail-row-subject">{conversation.subject}</span>
                      <span className="mail-row-preview">{conversation.preview}</span>
                    </span>
                    {conversation.isUnread && <span className="unread-count">{conversation.unreadCount}</span>}
                  </button>
                ))}
              </section>
            ))}
          </div>
        </aside>

        <article className="chat-thread-pane" aria-label="Active chat thread">
          <div className="chat-thread-head">
            <div className="chat-contact-summary">
              <span className="chat-avatar is-large" aria-hidden="true">
                {getInitials(activeConversation.contact.name)}
                {activeConversation.isOnline && <i />}
              </span>
              <div>
                <h2>{activeConversation.contact.name}</h2>
                <p>{activeConversation.contact.role}</p>
              </div>
            </div>
            <div className="mail-toolbar-actions">
              <button type="button" className="icon-ghost" aria-label="Call"><LuPhoneCall aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Tag"><LuTag aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Snooze"><LuAlarmClock aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="View profile" onClick={() => setProfileOpen(true)}><LuUser aria-hidden="true" /></button>
            </div>
          </div>

          <div className="thread-date-divider"><span>May 6, 2026</span></div>

          <div className="message-list">
            {activeConversation.messages.map((message) => {
              const isOutbound = message.side === "out";
              return (
                <div key={message.id} className={`message-row${isOutbound ? " is-outbound" : ""}`}>
                  <span className="chat-avatar" aria-hidden="true">{getInitials(isOutbound ? "Nguyen Le Phong" : activeConversation.contact.name)}</span>
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <small>{message.time}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chat-composer">
            <div className="chat-composer-tabs">
              <button type="button" className="is-active">Reply</button>
              <button type="button">Internal note</button>
            </div>
            <textarea placeholder="Type your message..." aria-label="Type your message" />
            <div className="composer-actions">
              <button type="button" className="icon-ghost" aria-label="Format"><LuType aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Emoji"><LuSmile aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Attach file"><LuPaperclip aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Insert link"><LuLink aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="AI assist"><LuSparkles aria-hidden="true" /></button>
              <button type="button" className="primary-icon" aria-label="Send message"><LuSend aria-hidden="true" /></button>
            </div>
          </div>
        </article>

        {profileOpen && (
          <aside className="chat-profile-pane" aria-label="Contact profile">
            <div className="profile-head">
              <span className="chat-avatar is-large" aria-hidden="true">{getInitials(activeConversation.contact.name)}</span>
              <div>
                <h2>{activeConversation.contact.name}</h2>
                <p>{activeConversation.contact.role}</p>
              </div>
              <button type="button" className="icon-ghost" aria-label="Close profile" onClick={() => setProfileOpen(false)}><LuX aria-hidden="true" /></button>
            </div>
            <div className="profile-actions">
              <button type="button" className="icon-ghost" aria-label="Email"><LuMail aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Call"><LuPhoneCall aria-hidden="true" /></button>
              <button type="button" className="icon-ghost" aria-label="Copy link"><LuCopy aria-hidden="true" /></button>
            </div>
            <div className="profile-tabs" role="tablist" aria-label="Profile tabs">
              <button type="button" className="is-active">Details</button>
              <button type="button">Files</button>
              <button type="button">Activity</button>
            </div>
            <div className="profile-detail-list">
              {[
                [LuMail, "Email", activeConversation.contact.email],
                [LuPhone, "Phone", activeConversation.contact.phone],
                [LuGlobe, "Website", activeConversation.contact.website],
                [LuBriefcase, "Company", activeConversation.contact.company],
                [LuCheckCircle2, "Stage", activeConversation.contact.status],
                [LuMonitor, "Timezone", activeConversation.contact.timezone],
                [LuMapPin, "Location", activeConversation.contact.location]
              ].map(([Icon, label, value]) => {
                const DetailIcon = Icon as IconType;
                return (
                  <div className="profile-detail-row" key={label as string}>
                    <DetailIcon aria-hidden="true" />
                    <span>{label as string}</span>
                    <strong>{value as string}</strong>
                  </div>
                );
              })}
            </div>
            <div className="profile-tags" aria-label="Contact tags">
              {activeConversation.contact.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

export default function StudioChatFeature({ route }: { route: StudioRoute }) {
  return <ChatRoutePage route={{ ...route, metrics: routeMetrics[route.id] ?? [] }} />;
}
