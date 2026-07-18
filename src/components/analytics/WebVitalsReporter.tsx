"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { getAnalyticsPathname, track } from "@/lib/analytics";
import type { WebVitalAnalyticsPayload } from "@/lib/analytics";
import { resolveWebVitalSurface } from "./web-vitals-context";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

type WebVitalsReporterProps = {
  locale: string;
};

export default function WebVitalsReporter({ locale }: WebVitalsReporterProps) {
  const pathname = usePathname();
  const contextRef = useRef({ locale, pathname });

  useEffect(() => {
    contextRef.current = { locale, pathname };
  }, [locale, pathname]);

  const reportWebVitals = useCallback<ReportWebVitalsCallback>((metric) => {
    const context = contextRef.current;
    const path = getAnalyticsPathname();

    const payload = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      id: metric.id,
      navigation_type: metric.navigationType,
      path,
      surface: resolveWebVitalSurface(context.pathname),
      locale: context.locale
    } satisfies WebVitalAnalyticsPayload;

    track("web_vital", payload);
  }, []);

  useReportWebVitals(reportWebVitals);
  return null;
}
