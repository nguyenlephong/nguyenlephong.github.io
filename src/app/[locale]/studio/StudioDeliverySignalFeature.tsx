"use client";

import dynamic from "next/dynamic";
import { track } from "@/lib/analytics";
import StudioFeatureErrorBoundary from "./StudioFeatureErrorBoundary";
import { createStudioFeatureLoadErrorCallback } from "./studio-feature-load-error";
import type { StudioRouteId, StudioRouteKind } from "./studio-route-catalog";

const DeliverySignalChart = dynamic(() => import("./StudioDeliverySignalChart"), {
  ssr: false,
  loading: () => <div className="studio-chart-shell" aria-hidden="true" />
});

const fallbackCopy: Record<string, { title: string; detail: string; retry: string }> = {
  en: { title: "Chart unavailable", detail: "The release signals could not be loaded. The rest of Studio is still available.", retry: "Reload Studio" },
  vi: { title: "Không thể tải biểu đồ", detail: "Release signals chưa tải được. Các phần còn lại của Studio vẫn hoạt động.", retry: "Tải lại Studio" },
  zh: { title: "图表暂时不可用", detail: "无法加载发布信号，但 Studio 的其他部分仍可使用。", retry: "重新加载 Studio" },
  ja: { title: "チャートを読み込めません", detail: "リリースシグナルを読み込めませんでした。Studio の他の機能は利用できます。", retry: "Studio を再読み込み" },
  ko: { title: "차트를 불러올 수 없습니다", detail: "릴리스 신호를 불러오지 못했습니다. Studio의 다른 기능은 계속 사용할 수 있습니다.", retry: "Studio 새로고침" },
  fr: { title: "Graphique indisponible", detail: "Les signaux de livraison n’ont pas pu être chargés. Le reste du Studio reste disponible.", retry: "Recharger Studio" }
};

type StudioDeliverySignalFeatureProps = Readonly<{
  locale: string;
  routeId: StudioRouteId;
  routeKind: StudioRouteKind;
}>;

export default function StudioDeliverySignalFeature({
  locale,
  routeId,
  routeKind
}: StudioDeliverySignalFeatureProps) {
  const copy = fallbackCopy[locale] ?? fallbackCopy["en"];

  return (
    <StudioFeatureErrorBoundary
      onError={createStudioFeatureLoadErrorCallback(
        { featureId: "delivery-signal", routeId, routeKind, locale },
        track
      )}
      onRetry={() => window.location.reload()}
      renderFallback={(retry) => (
        <div className="studio-chart-shell studio-feature-fallback" role="status">
          <strong>{copy.title}</strong>
          <p>{copy.detail}</p>
          <button type="button" className="outline-button" onClick={retry}>{copy.retry}</button>
        </div>
      )}
    >
      <DeliverySignalChart />
    </StudioFeatureErrorBoundary>
  );
}
