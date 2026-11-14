import type { Locale } from "@/i18n/routing";
import {
  studioCatalog,
  type StudioPublicModuleRouteId,
  type StudioPublicModuleSlug
} from "./studio-route-catalog";

/** Studio prose is written natively in English and Vietnamese; other locales fall back to English. */
export type StudioContentLocale = "en" | "vi";

export type StudioStaticModuleCopy = {
  title: string;
  seoTitle: string;
  description: string;
  /** The reader's question the module answers, set beside the title. */
  question: string;
  lead: string;
  openLabel: string;
  /** Short label for the module's stop on the index line. */
  stage: string;
};

export type StudioStaticModule = StudioStaticModuleCopy & {
  id: StudioPublicModuleRouteId;
  slug: StudioPublicModuleSlug;
};

/** Labels for the controls and meta lines; `{count}` is replaced at render. */
export type StudioUiLabels = {
  breadcrumb: string;
  copyMarkdown: string;
  showMarkdown: string;
  copied: string;
  copyFailed: string;
  tickNote: string;
  lastRead: string;
  checklistMeta: string;
  stepCount: string;
  checklistStages: Record<string, string>;
  useWhen: string;
  mapMeta: string;
  mapLabel: string;
  wholeMap: string;
  zoomIn: string;
  zoomOut: string;
  mapHint: string;
  mapStages: Record<string, string>;
  aiMeta: string;
  aiStages: { workflow: string; notes: string; skills: string };
  aiSkillsHeading: string;
  aiSkillsLead: string;
  indexMeta: string;
  nextModule: string;
};

type StudioStaticContentCopy = {
  title: string;
  seoTitle: string;
  description: string;
  question: string;
  intro: string;
  aiWorkflowHeading: string;
  aiNotesHeading: string;
  ui: StudioUiLabels;
  modules: Record<StudioPublicModuleRouteId, StudioStaticModuleCopy>;
};

export type StudioStaticContent = Omit<StudioStaticContentCopy, "modules"> & {
  contentLocale: StudioContentLocale;
  modules: StudioStaticModule[];
};

export const studioStaticContentCopyByLocale: Record<StudioContentLocale, StudioStaticContentCopy> = {
  en: {
    title: "Engineering Studio",
    seoTitle: "Engineering Studio: delivery checklists and system maps",
    description:
      "The checklists and system maps I use to scope work, ship releases and roll them out safely, plus how I set up AI coding agents.",
    question: "How I scope work, ship a release and roll it out without surprises.",
    intro:
      "The checklists and system maps I use to scope work, ship releases and roll them out safely. Take what helps your team.",
    aiWorkflowHeading: "How I split the work",
    aiNotesHeading: "Setup notes",
    ui: {
      breadcrumb: "Studio",
      copyMarkdown: "Copy as Markdown",
      showMarkdown: "Show the prompt",
      copied: "Copied",
      copyFailed: "Copy failed. Select the text instead.",
      tickNote: "Ticks stay in this browser only.",
      lastRead: "you were here",
      checklistMeta: "{count} checklists · {steps} steps · copy any as Markdown",
      stepCount: "{count} steps",
      checklistStages: {
        "release-readiness": "before merge",
        "rollout-plan": "before users",
        "ticket-intake-to-start": "new ticket",
        "engineering-delivery-checklist": "risky task",
        "module-creation": "new module",
        "senior-engineer-reflex": "looks simple",
        "ai-assisted-feature-workflow": "with AI"
      },
      useWhen: "Use when",
      mapMeta: "{zones} zones · {nodes} components · pick a zone to zoom in",
      mapLabel: "System blueprint",
      wholeMap: "Whole map",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      mapHint: "Pick a zone on the line or on the map. Its components are listed below the map.",
      mapStages: {
        "blueprint-dns-request": "edge",
        "blueprint-runtime": "runtime",
        "blueprint-storage": "storage",
        "blueprint-media-fanout": "fan-out"
      },
      aiMeta: "{steps} steps · {notes} notes · {skills} reusable skills",
      aiStages: { workflow: "the loop", notes: "the machine", skills: "the prompts" },
      aiSkillsHeading: "Reusable skills",
      aiSkillsLead: "Prompts I keep for jobs that repeat. Copy one into your agent as it is, then adjust it to your repo.",
      indexMeta: "{count} modules · English and Vietnamese",
      nextModule: "Next"
    },
    modules: {
      "delivery-checklists": {
        title: "Delivery checklists",
        seoTitle: "Delivery checklists: ticket intake, release readiness, rollout",
        description:
          "Release Readiness, Rollout Plan and the other checklists I walk through from ticket intake to the first days after a release.",
        question: "What I check before a change leaves the branch, and again before it reaches users.",
        lead:
          "The first two lists gate a release: Release Readiness before code leaves the branch, and Rollout Plan before the change reaches users. The rest cover the work before that: reading the ticket, planning the module, and asking the questions that surface hidden risk.",
        openLabel: "Read the delivery checklists",
        stage: "ship safely"
      },
      "flow-react-flow-system-blueprint": {
        title: "System maps",
        seoTitle: "System maps: a request path from DNS to fan-out services",
        description:
          "The system blueprint I use in design reviews, from DNS and edge policy through load balancing, storage and queues to fan-out services.",
        question: "Where a request goes, from the domain lookup to the services that fan out behind it.",
        lead:
          "One blueprint covers the full path of a request. When a review needs depth on one zone, I zoom into it: DNS and the edge, runtime and load balancing, storage and coordination, or media processing and fan-out.",
        openLabel: "Open the system maps",
        stage: "design review"
      },
      "ai-agent-setup": {
        title: "AI agent setup",
        seoTitle: "AI agent setup: how I work with coding agents",
        description:
          "How I split research, planning, review and coding between AI tools, and what I install on a new machine for agent work.",
        question: "Which AI tool does which job, in what order, and what a new machine needs.",
        lead:
          "These notes record which AI tool does which job, the order I use them in, and how I set up a new machine for agent work.",
        openLabel: "Read the AI setup notes",
        stage: "daily tools"
      }
    }
  },
  vi: {
    title: "Engineering Studio",
    seoTitle: "Engineering Studio: checklist ra bản và sơ đồ hệ thống",
    description:
      "Những checklist và sơ đồ hệ thống tôi dùng để chốt phạm vi, ra bản release và rollout an toàn, cùng cách tôi thiết lập AI agent để làm việc.",
    question: "Tôi chốt phạm vi, ra bản và rollout thế nào để không bị bất ngờ.",
    intro:
      "Những checklist và sơ đồ hệ thống tôi dùng để chốt phạm vi, ra bản release và rollout an toàn. Bạn thấy hợp với team mình thì cứ lấy dùng.",
    aiWorkflowHeading: "Cách tôi chia việc",
    aiNotesHeading: "Ghi chú thiết lập",
    ui: {
      breadcrumb: "Studio",
      copyMarkdown: "Copy dạng Markdown",
      showMarkdown: "Xem prompt",
      copied: "Đã copy",
      copyFailed: "Không copy được. Bạn bôi đen rồi copy tay nhé.",
      tickNote: "Dấu tick chỉ lưu trên trình duyệt này.",
      lastRead: "đang đọc dở",
      checklistMeta: "{count} checklist · {steps} bước · copy được dạng Markdown",
      stepCount: "{count} bước",
      checklistStages: {
        "release-readiness": "trước khi merge",
        "rollout-plan": "trước khi tới user",
        "ticket-intake-to-start": "ticket mới",
        "engineering-delivery-checklist": "task rủi ro",
        "module-creation": "module mới",
        "senior-engineer-reflex": "tưởng đơn giản",
        "ai-assisted-feature-workflow": "làm cùng AI"
      },
      useWhen: "Dùng khi",
      mapMeta: "{zones} vùng · {nodes} thành phần · chọn một vùng để zoom",
      mapLabel: "Blueprint hệ thống",
      wholeMap: "Toàn bộ",
      zoomIn: "Phóng to",
      zoomOut: "Thu nhỏ",
      mapHint: "Chọn một vùng trên dòng hoặc trên sơ đồ. Các thành phần của vùng nằm ngay dưới sơ đồ.",
      mapStages: {
        "blueprint-dns-request": "edge",
        "blueprint-runtime": "runtime",
        "blueprint-storage": "storage",
        "blueprint-media-fanout": "fan-out"
      },
      aiMeta: "{steps} bước · {notes} ghi chú · {skills} skill dùng lại được",
      aiStages: { workflow: "vòng làm việc", notes: "máy mới", skills: "prompt" },
      aiSkillsHeading: "Skill dùng lại được",
      aiSkillsLead: "Những prompt tôi giữ lại cho các việc lặp đi lặp lại. Copy nguyên vào agent, rồi chỉnh cho hợp repo của bạn.",
      indexMeta: "{count} phần · tiếng Anh và tiếng Việt",
      nextModule: "Tiếp theo"
    },
    modules: {
      "delivery-checklists": {
        title: "Checklist từ ticket đến rollout",
        seoTitle: "Checklist ra bản: nhận ticket, kiểm tra release và rollout",
        description:
          "Kiểm tra trước khi release, kế hoạch rollout và các checklist tôi dùng từ lúc nhận ticket đến mấy ngày đầu sau khi ra bản.",
        question: "Tôi rà gì trước khi code rời branch, và rà lại gì trước khi thay đổi tới tay người dùng.",
        lead:
          "Hai checklist đầu chặn cửa mỗi lần ra bản: một cái rà trước khi code rời branch, một cái lên kế hoạch trước khi thay đổi đến tay người dùng. Các checklist còn lại lo phần việc trước đó: đọc ticket, lên kế hoạch cho module và hỏi những câu làm lộ ra rủi ro còn ẩn.",
        openLabel: "Đọc các checklist",
        stage: "ra bản an toàn"
      },
      "flow-react-flow-system-blueprint": {
        title: "Sơ đồ hệ thống",
        seoTitle: "Sơ đồ hệ thống: đường đi của request từ DNS đến service fan-out",
        description:
          "Bản blueprint tôi dùng khi review thiết kế, đi từ DNS và edge policy qua load balancing, storage, queue đến các service fan-out.",
        question: "Một request đi qua những đâu, từ lúc tra tên miền tới các service nhận việc phía sau.",
        lead:
          "Một bản blueprint vẽ trọn đường đi của request. Khi buổi review cần đào sâu một vùng, tôi zoom vào vùng đó: DNS và edge, runtime và load balancing, storage và điều phối, hoặc xử lý media và fan-out.",
        openLabel: "Mở sơ đồ hệ thống",
        stage: "review thiết kế"
      },
      "ai-agent-setup": {
        title: "Thiết lập AI agent",
        seoTitle: "Thiết lập AI agent: cách tôi làm việc với coding agent",
        description:
          "Cách tôi chia việc tìm hiểu, lên kế hoạch, review và viết code giữa các công cụ AI, cùng những thứ tôi cài trên máy mới để làm việc với agent.",
        question: "Công cụ AI nào làm việc gì, dùng theo thứ tự nào, và máy mới cần cài những gì.",
        lead:
          "Các ghi chú này ghi lại công cụ AI nào làm việc gì, tôi dùng chúng theo thứ tự nào và cách tôi chuẩn bị một máy mới để làm việc với agent.",
        openLabel: "Đọc ghi chú thiết lập",
        stage: "công cụ hằng ngày"
      }
    }
  }
};

/** Shown above English fallback content on locales without native Studio prose. */
export const studioFallbackNoticeByLocale: Partial<Record<Locale, string>> = {
  zh: "此页面目前只有英文版。",
  ja: "このページは英語版のみです。",
  ko: "이 페이지는 영어로만 제공됩니다.",
  fr: "Cette page est disponible en anglais uniquement."
};

export function studioContentLocale(locale: string): StudioContentLocale {
  return locale === "vi" ? "vi" : "en";
}

export function getStudioStaticContent(locale: string): StudioStaticContent {
  const contentLocale = studioContentLocale(locale);
  const copy = studioStaticContentCopyByLocale[contentLocale];
  return {
    ...copy,
    contentLocale,
    modules: studioCatalog.publicModules.map((module) => ({
      id: module.routeId,
      slug: module.slug,
      ...copy.modules[module.routeId]
    }))
  };
}

export function getStudioStaticModule(locale: string, slug: string): StudioStaticModule | undefined {
  return getStudioStaticContent(locale).modules.find((module) => module.slug === slug);
}

/** Visible links stay on the route locale so navigation keeps the reader's language. */
export function getStudioStaticModuleHref(locale: string, module: Pick<StudioStaticModule, "slug">): string {
  return `/${locale}/studio/${module.slug}`;
}

/** Fills `{name}` placeholders in a UI label. */
export function formatStudioLabel(template: string, values: Readonly<Record<string, number | string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
