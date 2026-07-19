
"use client";

import { track } from "@/lib/analytics";
import StudioAuxiliaryDashboardsRuntime from "./StudioAuxiliaryDashboardsRuntime";
import StudioFeatureErrorBoundary from "./StudioFeatureErrorBoundary";
import { createStudioFeatureLoadErrorCallback } from "./studio-feature-load-error";
import type { StudioRoute } from "./studio-route-contract";
import { routeMetrics } from "./studio-auxiliary-route-metrics";

const fallbackCopy: Record<string, { title: string; detail: string; retry: string }> = {
  en: { title: "Dashboard unavailable", detail: "This dashboard could not be loaded. Studio navigation is still available.", retry: "Reload Studio" },
  vi: { title: "Không thể tải dashboard", detail: "Dashboard này chưa tải được. Navigation trong Studio vẫn hoạt động.", retry: "Tải lại Studio" },
  zh: { title: "仪表板暂时不可用", detail: "无法加载此仪表板，但 Studio 导航仍可使用。", retry: "重新加载 Studio" },
  ja: { title: "ダッシュボードを読み込めません", detail: "このダッシュボードを読み込めませんでした。Studio のナビゲーションは利用できます。", retry: "Studio を再読み込み" },
  ko: { title: "대시보드를 불러올 수 없습니다", detail: "이 대시보드를 불러오지 못했습니다. Studio 탐색은 계속 사용할 수 있습니다.", retry: "Studio 새로고침" },
  fr: { title: "Tableau de bord indisponible", detail: "Ce tableau de bord n’a pas pu être chargé. La navigation du Studio reste disponible.", retry: "Recharger Studio" }
};

export default function StudioDashboardRoutesFeature({ route, locale }: { route: StudioRoute; locale: string }) {
  const copy = fallbackCopy[locale] ?? fallbackCopy["en"];

  return (
    <StudioFeatureErrorBoundary
      onError={createStudioFeatureLoadErrorCallback(
        {
          featureId: "auxiliary-dashboard",
          routeId: route.id,
          routeKind: route.kind,
          locale
        },
        track
      )}
      onRetry={() => window.location.reload()}
      renderFallback={(retry) => (
        <div className="route-page studio-feature-fallback" role="status">
          <strong>{copy.title}</strong>
          <p>{copy.detail}</p>
          <button type="button" className="outline-button" onClick={retry}>
            {copy.retry}
          </button>
        </div>
      )}
    >
      <StudioAuxiliaryDashboardsRuntime
        route={{ ...route, metrics: routeMetrics[route.id] ?? [] }}
        locale={locale}
      />
    </StudioFeatureErrorBoundary>
  );
}
