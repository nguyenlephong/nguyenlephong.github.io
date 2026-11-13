import type { Locale } from "@/i18n/routing";
import {
  STUDIO_DEFAULT_ROUTE,
  studioCatalog,
  type StudioPublicModuleRouteId,
  type StudioRouteId,
  type StudioPublicModuleSlug
} from "./studio-route-catalog";

/** Studio prose is written natively in English and Vietnamese; other locales fall back to English. */
export type StudioContentLocale = "en" | "vi";

export type StudioStaticModuleCopy = {
  title: string;
  seoTitle: string;
  description: string;
  lead: string;
  openLabel: string;
};

export type StudioStaticModule = StudioStaticModuleCopy & {
  id: StudioPublicModuleRouteId;
  slug: StudioPublicModuleSlug;
};

type StudioStaticContentCopy = {
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  breadcrumbLabel: string;
  aiWorkflowHeading: string;
  aiNotesHeading: string;
  aiSkillsLink: string;
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
    intro:
      "The checklists and system maps I use to scope work, ship releases and roll them out safely. Take what helps your team.",
    breadcrumbLabel: "Engineering Studio",
    aiWorkflowHeading: "How I split the work",
    aiNotesHeading: "Setup notes",
    aiSkillsLink: "Browse the reusable AI skills",
    modules: {
      "delivery-checklists": {
        title: "Delivery checklists",
        seoTitle: "Delivery checklists: release readiness, rollout and ticket intake",
        description:
          "Release Readiness, Rollout Plan and the other checklists I walk through from ticket intake to the first days after a release.",
        lead:
          "The first two lists gate a release: Release Readiness before code leaves the branch, and Rollout Plan before the change reaches users. The rest cover the work before that: reading the ticket, planning the module, and asking the questions that surface hidden risk.",
        openLabel: "Read the delivery checklists"
      },
      "flow-react-flow-system-blueprint": {
        title: "System maps",
        seoTitle: "System maps: a request path from DNS to fan-out services",
        description:
          "The system blueprint I use in design reviews, from DNS and edge policy through load balancing, storage and queues to fan-out services.",
        lead:
          "One blueprint covers the full path of a request. When a review needs depth on one zone, I open its focused view: DNS and the edge, runtime and load balancing, storage and coordination, or media processing and fan-out.",
        openLabel: "Open the system maps"
      },
      "ai-agent-setup": {
        title: "AI agent setup",
        seoTitle: "AI agent setup: how I work with coding agents",
        description:
          "How I split research, planning, review and coding between AI tools, and what I install on a new machine for agent work.",
        lead:
          "These notes record which AI tool does which job, the order I use them in, and how I set up a new machine for agent work.",
        openLabel: "Read the AI setup notes"
      }
    }
  },
  vi: {
    title: "Engineering Studio",
    seoTitle: "Engineering Studio: checklist ra bản và sơ đồ hệ thống",
    description:
      "Những checklist và sơ đồ hệ thống tôi dùng để chốt phạm vi, ra bản release và rollout an toàn, cùng cách tôi thiết lập AI agent để làm việc.",
    intro:
      "Những checklist và sơ đồ hệ thống tôi dùng để chốt phạm vi, ra bản release và rollout an toàn. Bạn thấy hợp với team mình thì cứ lấy dùng.",
    breadcrumbLabel: "Engineering Studio",
    aiWorkflowHeading: "Cách tôi chia việc",
    aiNotesHeading: "Ghi chú thiết lập",
    aiSkillsLink: "Xem các AI skill dùng lại được",
    modules: {
      "delivery-checklists": {
        title: "Checklist từ ticket đến rollout",
        seoTitle: "Checklist từ ticket đến rollout: kiểm tra release, kế hoạch rollout, nhận việc",
        description:
          "Kiểm tra trước khi release, kế hoạch rollout và các checklist tôi dùng từ lúc nhận ticket đến mấy ngày đầu sau khi ra bản.",
        lead:
          "Hai checklist đầu chặn cửa mỗi lần ra bản: một cái rà trước khi code rời branch, một cái lên kế hoạch trước khi thay đổi đến tay người dùng. Các checklist còn lại lo phần việc trước đó: đọc ticket, lên kế hoạch cho module và hỏi những câu làm lộ ra rủi ro còn ẩn.",
        openLabel: "Đọc các checklist"
      },
      "flow-react-flow-system-blueprint": {
        title: "Sơ đồ hệ thống",
        seoTitle: "Sơ đồ hệ thống: đường đi của request từ DNS đến các service fan-out",
        description:
          "Bản blueprint tôi dùng khi review thiết kế, đi từ DNS và edge policy qua load balancing, storage, queue đến các service fan-out.",
        lead:
          "Một bản blueprint vẽ trọn đường đi của request. Khi buổi review cần đào sâu một vùng, tôi mở view riêng của vùng đó: DNS và edge, runtime và load balancing, storage và điều phối, hoặc xử lý media và fan-out.",
        openLabel: "Mở sơ đồ hệ thống"
      },
      "ai-agent-setup": {
        title: "Thiết lập AI agent",
        seoTitle: "Thiết lập AI agent: cách tôi làm việc với coding agent",
        description:
          "Cách tôi chia việc tìm hiểu, lên kế hoạch, review và viết code giữa các công cụ AI, cùng những thứ tôi cài trên máy mới để làm việc với agent.",
        lead:
          "Các ghi chú này ghi lại công cụ AI nào làm việc gì, tôi dùng chúng theo thứ tự nào và cách tôi chuẩn bị một máy mới để làm việc với agent.",
        openLabel: "Đọc ghi chú thiết lập"
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

/** Visible links stay on the route locale so the shell keeps the reader's language. */
export function getStudioStaticModuleHref(locale: string, module: Pick<StudioStaticModule, "slug">): string {
  return `/${locale}/studio/${module.slug}`;
}

export type StudioRoutePageTitles = { heading: string; documentTitle: string; lang: string };

/**
 * Heading and <title> for a route the shell opens client-side. Routes with a
 * server page reuse that page's h1 and metadata title verbatim, so a pushState
 * navigation and a reload of the same URL read the same. Query-only routes use
 * the shell's localized route title.
 */
export function getStudioRoutePageTitles(locale: string, routeId: StudioRouteId, routeTitle: string): StudioRoutePageTitles {
  const contentLocale = studioContentLocale(locale);
  const copy = studioStaticContentCopyByLocale[contentLocale];
  const modules: Partial<Record<StudioRouteId, StudioStaticModuleCopy>> = copy.modules;
  const page = routeId === STUDIO_DEFAULT_ROUTE ? copy : modules[routeId];
  if (page) return { heading: page.title, documentTitle: page.seoTitle, lang: contentLocale };
  return { heading: routeTitle, documentTitle: `${routeTitle} | ${copy.title}`, lang: locale };
}
