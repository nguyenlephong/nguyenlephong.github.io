"use client";

import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const rolloutPulseMap = new Map([
  [0, 44],
  [6, 28],
  [11, 52],
  [15, 38],
  [23, 26],
  [30, 50],
  [36, 36],
  [45, 62],
  [53, 34],
  [60, 45],
  [66, 31],
  [73, 54],
  [79, 39],
  [86, 30]
]);

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const releaseSignalChartData = Array.from({ length: 89 }, (_, index) => {
  const date = new Date(2026, 2, 24);
  date.setDate(date.getDate() + index);

  const baseline = 38 + ((index * 13) % 22) + Math.round(Math.sin(index * 0.62) * 6);
  const pulse = rolloutPulseMap.get(index) ?? 0;

  return {
    date: formatDateKey(date),
    rolloutVolume: Math.min(124, Math.max(24, baseline + pulse)),
    platformHealth: 64 + Math.round(Math.sin(index * 0.22) * 2) + (index % 11 === 0 ? 1 : 0),
    incidentNoise: 56 + Math.round(Math.cos(index * 0.18) * 2) - (index % 17 === 0 ? 1 : 0)
  };
});

const releaseSignalSeries = [
  { key: "platformHealth", label: "Platform health", color: "#525252" },
  { key: "rolloutVolume", label: "Rollout volume", color: "#d4d4d4" },
  { key: "incidentNoise", label: "Incident noise", color: "#171717" }
] as const;

type ReleaseSignalSeriesKey = (typeof releaseSignalSeries)[number]["key"];

function parseChartDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatChartTick(value: string): string {
  return parseChartDate(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatChartTooltipLabel(value: string): string {
  return parseChartDate(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

type StudioTooltipPayload = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
};

function StudioChartTooltip({
  active,
  label,
  payload
}: {
  active?: boolean;
  label?: string | number;
  payload?: StudioTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="studio-chart-tooltip">
      <strong>{typeof label === "string" ? formatChartTooltipLabel(label) : label}</strong>
      <div>
        {payload.map((item) => {
          const series = releaseSignalSeries.find((entry) => entry.key === item.dataKey);
          if (!series || item.value == null) return null;

          return (
            <span key={series.key}>
              <i style={{ background: series.color }} />
              <em>{series.label}</em>
              <b>{Number(item.value).toLocaleString("en-US")}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function StudioDeliverySignalChart() {
  const [activeSeries, setActiveSeries] = useState<ReleaseSignalSeriesKey | "all">("all");
  const isDimmed = (key: ReleaseSignalSeriesKey) => activeSeries !== "all" && activeSeries !== key;

  return (
    <div className="studio-chart-shell">
      <div className="chart-legend interactive" aria-label="Release signal series">
        {releaseSignalSeries.map((series) => (
          <button
            key={series.key}
            type="button"
            className={activeSeries === series.key ? "is-active" : undefined}
            onBlur={() => setActiveSeries("all")}
            onClick={() => setActiveSeries((current) => (current === series.key ? "all" : series.key))}
            onFocus={() => setActiveSeries(series.key)}
            onMouseEnter={() => setActiveSeries(series.key)}
            onMouseLeave={() => setActiveSeries("all")}
          >
            <i style={{ background: series.color }} />
            {series.label}
          </button>
        ))}
      </div>
      <div className="studio-chart" role="img" aria-label="Release volume, platform health, and incident noise chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height: 320 }}>
          <ComposedChart data={releaseSignalChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="studioFillRolloutVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4d4d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#d4d4d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e5e5e5" strokeOpacity={0.72} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={42} tickFormatter={formatChartTick} />
            <YAxis hide domain={[0, 128]} />
            <Tooltip cursor={false} content={<StudioChartTooltip />} />
            <Area
              dataKey="rolloutVolume"
              type="natural"
              fill="url(#studioFillRolloutVolume)"
              stroke="#d4d4d4"
              strokeWidth={1.35}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              fillOpacity={isDimmed("rolloutVolume") ? 0.28 : 1}
              opacity={isDimmed("rolloutVolume") ? 0.35 : 1}
              isAnimationActive
              animationDuration={850}
            />
            <Line dataKey="platformHealth" type="natural" stroke="#525252" strokeWidth={1.55} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} opacity={isDimmed("platformHealth") ? 0.25 : 1} isAnimationActive animationDuration={900} />
            <Line dataKey="incidentNoise" type="natural" stroke="#171717" strokeWidth={1.35} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} opacity={isDimmed("incidentNoise") ? 0.25 : 1} isAnimationActive animationDuration={950} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
