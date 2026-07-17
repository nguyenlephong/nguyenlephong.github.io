import type { Locale } from "@/i18n/routing";

export type StudioStaticModule = {
  id: "ai-agent-setup" | "ai-skills" | "delivery-checklists" | "flow-react-flow-architecture-demo";
  title: string;
  description: string;
  flowId?: "react-flow-architecture-demo";
};

export type StudioStaticContent = {
  eyebrow: string;
  title: string;
  intro: string;
  moduleHeading: string;
  openLabel: string;
  modules: StudioStaticModule[];
};

const contentByLocale: Record<Locale, StudioStaticContent> = {
  en: {
    eyebrow: "Public engineering workspace",
    title: "Engineering Studio",
    intro:
      "Explore practical notes, reusable checklists, AI operating guides, and interactive system-design flows built from real software delivery work.",
    moduleHeading: "Explore the Studio modules",
    openLabel: "Open module",
    modules: [
      {
        id: "ai-agent-setup",
        title: "AI agent setup",
        description: "Repeatable setup notes for capable, secure, and reviewable AI-assisted engineering workflows."
      },
      {
        id: "ai-skills",
        title: "AI engineering skills",
        description: "Reusable skills for architecture reviews, implementation planning, debugging, testing, and delivery."
      },
      {
        id: "delivery-checklists",
        title: "Software delivery checklists",
        description: "Concrete quality gates for design, implementation, release readiness, rollout, and post-release review."
      },
      {
        id: "flow-react-flow-architecture-demo",
        flowId: "react-flow-architecture-demo",
        title: "System architecture flows",
        description: "Visual, interactive maps for understanding boundaries, dependencies, failure paths, and operational ownership."
      }
    ]
  },
  vi: {
    eyebrow: "Không gian kỹ thuật công khai",
    title: "Engineering Studio",
    intro:
      "Khám phá ghi chú thực tiễn, checklist tái sử dụng, hướng dẫn vận hành AI và system-design flows được đúc kết từ quá trình phát triển phần mềm thực tế.",
    moduleHeading: "Khám phá các module trong Studio",
    openLabel: "Mở module",
    modules: [
      {
        id: "ai-agent-setup",
        title: "Thiết lập AI agent",
        description: "Ghi chú thiết lập có thể lặp lại cho quy trình AI-assisted engineering an toàn và dễ review."
      },
      {
        id: "ai-skills",
        title: "Kỹ năng AI cho kỹ sư",
        description: "Các kỹ năng tái sử dụng cho architecture review, lập kế hoạch, debugging, testing và delivery."
      },
      {
        id: "delivery-checklists",
        title: "Checklist phát triển phần mềm",
        description: "Quality gates cụ thể cho thiết kế, triển khai, release readiness, rollout và review sau release."
      },
      {
        id: "flow-react-flow-architecture-demo",
        flowId: "react-flow-architecture-demo",
        title: "System architecture flows",
        description: "Bản đồ trực quan giúp hiểu boundaries, dependencies, failure paths và operational ownership."
      }
    ]
  },
  zh: {
    eyebrow: "公开工程工作空间",
    title: "工程 Studio",
    intro: "探索来自真实软件交付经验的实践笔记、可复用清单、AI 工作指南和交互式系统设计流程。",
    moduleHeading: "探索 Studio 模块",
    openLabel: "打开模块",
    modules: [
      { id: "ai-agent-setup", title: "AI Agent 设置", description: "用于安全、可审查的 AI 辅助工程流程的可复用设置指南。" },
      { id: "ai-skills", title: "AI 工程技能", description: "面向架构评审、规划、调试、测试和交付的可复用技能。" },
      { id: "delivery-checklists", title: "软件交付清单", description: "覆盖设计、开发、发布准备、上线和发布后复盘的质量门槛。" },
      { id: "flow-react-flow-architecture-demo", flowId: "react-flow-architecture-demo", title: "系统架构流程", description: "用于理解边界、依赖、故障路径和运维责任的交互式图谱。" }
    ]
  },
  ja: {
    eyebrow: "公開エンジニアリング・ワークスペース",
    title: "エンジニアリング Studio",
    intro: "実際のソフトウェア開発から得た実践ノート、再利用可能なチェックリスト、AI 運用ガイド、システム設計フローを公開しています。",
    moduleHeading: "Studio のモジュールを見る",
    openLabel: "モジュールを開く",
    modules: [
      { id: "ai-agent-setup", title: "AI Agent セットアップ", description: "安全でレビュー可能な AI 支援開発のための再現可能なセットアップノート。" },
      { id: "ai-skills", title: "AI エンジニアリングスキル", description: "設計レビュー、計画、デバッグ、テスト、デリバリーに使えるスキル集。" },
      { id: "delivery-checklists", title: "ソフトウェアデリバリー・チェックリスト", description: "設計からリリース後レビューまでを支える具体的な品質ゲート。" },
      { id: "flow-react-flow-architecture-demo", flowId: "react-flow-architecture-demo", title: "システムアーキテクチャ・フロー", description: "境界、依存関係、障害経路、運用責任を理解するためのインタラクティブな図。" }
    ]
  },
  ko: {
    eyebrow: "공개 엔지니어링 워크스페이스",
    title: "엔지니어링 Studio",
    intro: "실제 소프트웨어 딜리버리에서 얻은 실용적인 노트, 재사용 가능한 체크리스트, AI 운영 가이드와 시스템 설계 흐름을 살펴보세요.",
    moduleHeading: "Studio 모듈 살펴보기",
    openLabel: "모듈 열기",
    modules: [
      { id: "ai-agent-setup", title: "AI Agent 설정", description: "안전하고 검토 가능한 AI 보조 엔지니어링을 위한 반복 가능한 설정 가이드입니다." },
      { id: "ai-skills", title: "AI 엔지니어링 스킬", description: "아키텍처 리뷰, 계획, 디버깅, 테스트와 딜리버리를 위한 재사용 가능한 스킬입니다." },
      { id: "delivery-checklists", title: "소프트웨어 딜리버리 체크리스트", description: "설계부터 출시 후 리뷰까지 적용하는 구체적인 품질 기준입니다." },
      { id: "flow-react-flow-architecture-demo", flowId: "react-flow-architecture-demo", title: "시스템 아키텍처 플로우", description: "경계, 의존성, 장애 경로와 운영 책임을 이해하기 위한 인터랙티브 맵입니다." }
    ]
  },
  fr: {
    eyebrow: "Espace d’ingénierie public",
    title: "Studio d’ingénierie",
    intro: "Explorez des notes pratiques, des checklists réutilisables, des guides d’usage de l’IA et des flux de conception issus de projets logiciels réels.",
    moduleHeading: "Explorer les modules du Studio",
    openLabel: "Ouvrir le module",
    modules: [
      { id: "ai-agent-setup", title: "Configuration des agents IA", description: "Des procédures reproductibles pour une ingénierie assistée par IA sûre et révisable." },
      { id: "ai-skills", title: "Compétences d’ingénierie IA", description: "Des compétences réutilisables pour l’architecture, la planification, le débogage, les tests et la livraison." },
      { id: "delivery-checklists", title: "Checklists de livraison logicielle", description: "Des critères de qualité concrets, de la conception jusqu’à la revue après mise en production." },
      { id: "flow-react-flow-architecture-demo", flowId: "react-flow-architecture-demo", title: "Flux d’architecture système", description: "Des cartes interactives pour comprendre les frontières, dépendances, pannes et responsabilités opérationnelles." }
    ]
  }
};

export function getStudioStaticContent(locale: string): StudioStaticContent {
  return contentByLocale[locale as Locale] ?? contentByLocale.en;
}

export function getStudioStaticModuleHref(locale: string, module: StudioStaticModule): string {
  const flowQuery = module.flowId ? `&flow=${encodeURIComponent(module.flowId)}` : "";
  return `/${locale}/studio?route=${encodeURIComponent(module.id)}${flowQuery}#${module.id}`;
}
