"use client";

import dynamic from "next/dynamic";
import StudioFeatureErrorBoundary from "./StudioFeatureErrorBoundary";
import type { StudioAuxiliaryDashboardsRuntimeProps } from "./StudioAuxiliaryDashboardsRuntime";

const StudioAuxiliaryDashboardsRuntime = dynamic<StudioAuxiliaryDashboardsRuntimeProps>(
  () => import("./StudioAuxiliaryDashboardsRuntime"),
  {
    ssr: false,
    loading: () => <div className="route-page studio-feature-loading" role="status" aria-label="Loading dashboard" />
  }
);

const fallbackCopy: Record<string, { title: string; detail: string; retry: string }> = {
  en: { title: "Dashboard unavailable", detail: "This dashboard could not be loaded. Studio navigation is still available.", retry: "Reload Studio" },
  vi: { title: "Không thể tải dashboard", detail: "Dashboard này chưa tải được. Navigation trong Studio vẫn hoạt động.", retry: "Tải lại Studio" },
  zh: { title: "仪表板暂时不可用", detail: "无法加载此仪表板，但 Studio 导航仍可使用。", retry: "重新加载 Studio" },
  ja: { title: "ダッシュボードを読み込めません", detail: "このダッシュボードを読み込めませんでした。Studio のナビゲーションは利用できます。", retry: "Studio を再読み込み" },
  ko: { title: "대시보드를 불러올 수 없습니다", detail: "이 대시보드를 불러오지 못했습니다. Studio 탐색은 계속 사용할 수 있습니다.", retry: "Studio 새로고침" },
  fr: { title: "Tableau de bord indisponible", detail: "Ce tableau de bord n’a pas pu être chargé. La navigation du Studio reste disponible.", retry: "Recharger Studio" }
};

export default function StudioAuxiliaryDashboardsFeature(
  props: StudioAuxiliaryDashboardsRuntimeProps
) {
  const copy = fallbackCopy[props.locale] ?? fallbackCopy["en"];

  return (
    <StudioFeatureErrorBoundary
      onRetry={() => window.location.reload()}
      renderFallback={(retry) => (
        <div className="route-page studio-feature-fallback" role="status">
          <strong>{copy.title}</strong>
          <p>{copy.detail}</p>
          <button type="button" className="outline-button" onClick={retry}>{copy.retry}</button>
        </div>
      )}
    >
      <StudioAuxiliaryDashboardsRuntime {...props} />
    </StudioFeatureErrorBoundary>
  );
}
