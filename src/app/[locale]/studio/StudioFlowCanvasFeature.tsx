"use client";

import dynamic from "next/dynamic";
import StudioFeatureErrorBoundary from "./StudioFeatureErrorBoundary";
import type { StudioFlowCanvasRuntimeProps } from "./StudioFlowCanvasRuntime";

const StudioFlowCanvasRuntime = dynamic<StudioFlowCanvasRuntimeProps>(
  () => import("./StudioFlowCanvasRuntime"),
  { ssr: false, loading: () => <div className="flow-react-surface" aria-hidden="true" /> }
);

const fallbackCopy: Record<string, { title: string; detail: string; retry: string }> = {
  en: { title: "Flow canvas unavailable", detail: "The interactive canvas could not be loaded. Studio navigation and flow details are still available.", retry: "Reload Studio" },
  vi: { title: "Không thể tải flow canvas", detail: "Interactive canvas chưa tải được. Navigation và thông tin flow trong Studio vẫn hoạt động.", retry: "Tải lại Studio" },
  zh: { title: "流程画布暂时不可用", detail: "无法加载交互式画布，但 Studio 导航和流程详情仍可使用。", retry: "重新加载 Studio" },
  ja: { title: "フローキャンバスを読み込めません", detail: "インタラクティブキャンバスを読み込めませんでした。Studio のナビゲーションと詳細は利用できます。", retry: "Studio を再読み込み" },
  ko: { title: "플로우 캔버스를 불러올 수 없습니다", detail: "인터랙티브 캔버스를 불러오지 못했습니다. Studio 탐색과 플로우 정보는 계속 사용할 수 있습니다.", retry: "Studio 새로고침" },
  fr: { title: "Canvas de flux indisponible", detail: "Le canvas interactif n’a pas pu être chargé. La navigation et les détails restent disponibles.", retry: "Recharger Studio" }
};

export default function StudioFlowCanvasFeature({
  locale,
  ...runtimeProps
}: StudioFlowCanvasRuntimeProps & Readonly<{ locale: string }>) {
  const copy = fallbackCopy[locale] ?? fallbackCopy["en"];

  return (
    <StudioFeatureErrorBoundary
      onRetry={() => window.location.reload()}
      renderFallback={(retry) => (
        <div className="flow-react-surface studio-feature-fallback" role="status">
          <strong>{copy.title}</strong>
          <p>{copy.detail}</p>
          <button type="button" className="outline-button" onClick={retry}>{copy.retry}</button>
        </div>
      )}
    >
      <StudioFlowCanvasRuntime {...runtimeProps} />
    </StudioFeatureErrorBoundary>
  );
}
