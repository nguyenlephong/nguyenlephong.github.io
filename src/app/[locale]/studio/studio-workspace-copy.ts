import type { StudioLocale } from "./studio-shell-copy";

type StudioWorkspaceCopy = {
  label: string;
  loadErrorTitle: string;
  loadErrorDetail: string;
  reload: string;
};

export const studioWorkspaceCopy: Record<StudioLocale, StudioWorkspaceCopy> = {
  en: {
    label: "Nguyen Le Phong's personal Studio workspace",
    loadErrorTitle: "Studio could not be loaded",
    loadErrorDetail: "The interactive workspace failed to start. Reload the page to try again.",
    reload: "Reload Studio"
  },
  vi: {
    label: "Không gian làm việc Studio của Nguyễn Lê Phong",
    loadErrorTitle: "Không thể tải Studio",
    loadErrorDetail: "Không gian tương tác chưa thể khởi động. Hãy tải lại trang để thử lại.",
    reload: "Tải lại Studio"
  },
  zh: {
    label: "Nguyen Le Phong 的个人 Studio 工作区",
    loadErrorTitle: "无法加载 Studio",
    loadErrorDetail: "交互式工作区无法启动。请重新加载页面后重试。",
    reload: "重新加载 Studio"
  },
  ja: {
    label: "Nguyen Le Phong のパーソナル Studio ワークスペース",
    loadErrorTitle: "Studio を読み込めませんでした",
    loadErrorDetail: "インタラクティブワークスペースを起動できませんでした。ページを再読み込みしてください。",
    reload: "Studio を再読み込み"
  },
  ko: {
    label: "Nguyen Le Phong의 개인 Studio 워크스페이스",
    loadErrorTitle: "Studio를 불러올 수 없습니다",
    loadErrorDetail: "대화형 워크스페이스를 시작하지 못했습니다. 페이지를 새로고침해 주세요.",
    reload: "Studio 새로고침"
  },
  fr: {
    label: "Studio personnel de Nguyen Le Phong",
    loadErrorTitle: "Impossible de charger Studio",
    loadErrorDetail: "L'espace interactif n'a pas pu démarrer. Rechargez la page pour réessayer.",
    reload: "Recharger Studio"
  }
};
