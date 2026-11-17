
"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Brush,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usePerformance } from "../hooks/usePortfolioData";
import type { WidgetProps } from "../types/widget";

type Benchmark = "Nifty 50" | "S&P 500";

export default function PerformanceLineWidget({
  settings,
}: WidgetProps) {
  const [benchmark, setBenchmark] = useState<Benchmark>(
    settings.benchmark === "S&P 500" ? "S&P 500" : "Nifty 50"
  );

  const [dateRange, setDateRange] = useState("1Y");
  const [scale, setScale] = useState<"linear" | "log">("linear");

  const [zoomStart, setZoomStart] = useState<string | null>(null);
  const [zoomEnd, setZoomEnd] = useState<string | null>(null);

  const [zoomRange, setZoomRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const {
    data: performance = [],
    isLoading,
    isError,
  } = usePerformance();

  const benchmarkColor =
    benchmark === "Nifty 50" ? "#7798E8" : "#D5A96C";

  const baseData = useMemo(() => {
    const count =
      dateRange === "3M"
        ? 3
        : dateRange === "6M"
          ? 6
          : performance.length;

    return performance.slice(-count);
  }, [dateRange, performance]);

  const visibleData = useMemo(() => {
    if (!zoomRange) return baseData;

    const startIndex = baseData.findIndex(
      (item) => item.date === zoomRange.start
    );

    const endIndex = baseData.findIndex(
      (item) => item.date === zoomRange.end
    );

    if (startIndex === -1 || endIndex === -1) {
      return baseData;
    }

    const first = Math.min(startIndex, endIndex);
    const last = Math.max(startIndex, endIndex);

    return baseData.slice(first, last + 1);
  }, [baseData, zoomRange]);

  const handleChartClick = (state: any) => {
    const label = state?.activeLabel;

    if (label === undefined || label === null) return;

    const selectedLabel = String(label);

    if (!zoomStart) {
      setZoomStart(selectedLabel);
      setZoomEnd(null);
      return;
    }

    if (!zoomEnd) {
      if (selectedLabel === zoomStart) {
        setZoomStart(null);
        return;
      }

      setZoomEnd(selectedLabel);

      setZoomRange({
        start: zoomStart,
        end: selectedLabel,
      });

      setZoomStart(null);
      return;
    }
  };

  const resetZoom = () => {
    setZoomStart(null);
    setZoomEnd(null);
    setZoomRange(null);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    resetZoom();
  };

  if (isLoading) {
    return (
      <section className="performance-widget">
        <p>Loading performance data...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="performance-widget">
        <p>Unable to load performance data.</p>
      </section>
    );
  }

  if (performance.length === 0) {
    return (
      <section className="performance-widget">
        <p>No performance data available.</p>
      </section>
    );
  }

  return (
    <section className="performance-widget">
      <div className="performance-widget-controls">
        <label>
          Benchmark
          <select
            value={benchmark}
            onChange={(event) =>
              setBenchmark(event.target.value as Benchmark)
            }
          >
            <option value="Nifty 50">Nifty 50</option>
            <option value="S&P 500">S&P 500</option>
          </select>
        </label>

        <label>
          Date range
          <select
            value={dateRange}
            onChange={(event) =>
              handleDateRangeChange(event.target.value)
            }
          >
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
          </select>
        </label>

        <label>
          Scale
          <select
            value={scale}
            onChange={(event) =>
              setScale(event.target.value as "linear" | "log")
            }
          >
            <option value="linear">Linear</option>
            <option value="log">Logarithmic</option>
          </select>
        </label>

        {zoomRange && (
          <button type="button" onClick={resetZoom}>
            Reset Zoom
          </button>
        )}
      </div>

      {zoomStart && !zoomRange && (
        <p className="performance-zoom-hint">
          Starting point: {zoomStart}. Now click the ending month.
        </p>
      )}

      <div className="performance-widget-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{ top: 15, right: 20, left: 5, bottom: 15 }}
            onClick={handleChartClick}
          >
            <CartesianGrid
              stroke="#29404A"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#8BA7B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              scale={scale}
              domain={["auto", "auto"]}
              tick={{ fill: "#8BA7B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              shared
              cursor={{
                stroke: "#55D5C4",
                strokeWidth: 1.5,
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                background: "#14252D",
                border: "1px solid #29404A",
                borderRadius: "8px",
                color: "#EAF4F5",
                padding: "10px 12px",
              }}
              labelStyle={{
                color: "#55D5C4",
                fontWeight: 600,
                marginBottom: "6px",
              }}
              formatter={(value, name) => [
                Number(value).toFixed(2),
                String(name),
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />

            {zoomStart && zoomEnd && (
              <ReferenceArea
                x1={zoomStart}
                x2={zoomEnd}
                strokeOpacity={0.3}
                fill="#55D5C4"
                fillOpacity={0.2}
              />
            )}

            <Line
              type="monotone"
              dataKey="portfolio"
              name="Portfolio"
              stroke="#55D5C4"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={500}
            />

            <Line
              type="monotone"
              dataKey="benchmark"
              name={benchmark}
              stroke={benchmarkColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={500}
            />

            <Brush
              dataKey="date"
              height={22}
              stroke="#55D5C4"
              fill="#14252D"
              travellerWidth={8}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
