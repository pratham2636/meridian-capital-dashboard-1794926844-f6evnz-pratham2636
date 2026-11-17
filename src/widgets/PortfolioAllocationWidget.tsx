
"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useHoldings } from "../hooks/usePortfolioData";
import type { WidgetProps } from "../types/widget";

const ASSET_COLORS: Record<string, string> = {
  Equities: "#38bdf8",
  "Fixed Income": "#a78bfa",
  Alternatives: "#34d399",
  Cash: "#fbbf24",
};

type AllocationItem = {
  name: string;
  value: number;
  color: string;
};

export default function PortfolioAllocationWidget({
  settings,
}: WidgetProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedAssetClass, setSelectedAssetClass] = useState<string | null>(
    null
  );

  const [chartStyle, setChartStyle] = useState<"pie" | "donut">(
    settings.chartStyle === "pie" ? "pie" : "donut"
  );

  const showLabels = settings.showLabels !== false;

  const {
    data: holdings = [],
    isLoading,
    isError,
  } = useHoldings();

  const totalValue = useMemo(
    () => holdings.reduce((total, item) => total + item.marketValue, 0),
    [holdings]
  );

  const assetAllocations = useMemo<AllocationItem[]>(() => {
    const grouped = new Map<string, number>();

    holdings.forEach((holding) => {
      grouped.set(
        holding.assetClass,
        (grouped.get(holding.assetClass) ?? 0) + holding.marketValue
      );
    });

    return Array.from(grouped.entries()).map(([name, value]) => ({
      name,
      value,
      color: ASSET_COLORS[name] ?? "#94a3b8",
    }));
  }, [holdings]);

  const selectedHoldings = useMemo(
    () => holdings.filter((item) => item.assetClass === selectedAssetClass),
    [holdings, selectedAssetClass]
  );

  const chartData = useMemo<AllocationItem[]>(() => {
    if (!selectedAssetClass) {
      return assetAllocations;
    }

    return selectedHoldings.map((item) => ({
      name: item.name,
      value: item.marketValue,
      color: ASSET_COLORS[selectedAssetClass] ?? "#94a3b8",
    }));
  }, [assetAllocations, selectedAssetClass, selectedHoldings]);

  const chartTotal = selectedAssetClass
    ? selectedHoldings.reduce((total, item) => total + item.marketValue, 0)
    : totalValue;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const getPercentage = (value: number) =>
    chartTotal > 0 ? (value / chartTotal) * 100 : 0;

  if (isLoading) {
    return (
      <section className="allocation-widget">
        <p>Loading portfolio allocation...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="allocation-widget">
        <p>Unable to load portfolio allocation.</p>
      </section>
    );
  }

  if (holdings.length === 0) {
    return (
      <section className="allocation-widget">
        <p>No portfolio holdings available.</p>
      </section>
    );
  }

  return (
    <section className="allocation-widget">
      <div className="allocation-widget-controls">
        <div>
          {selectedAssetClass ? (
            <button
              type="button"
              onClick={() => {
                setSelectedAssetClass(null);
                setActiveIndex(null);
              }}
            >
              ← Back to allocation
            </button>
          ) : (
            <strong>Asset Allocation</strong>
          )}
        </div>

        <select
          id="allocation-chart-style"
          value={chartStyle}
          onChange={(event) =>
            setChartStyle(event.target.value as "pie" | "donut")
          }
          aria-label="Chart style"
        >
          <option value="donut">Donut</option>
          <option value="pie">Pie</option>
        </select>
      </div>

      <div
        className="allocation-widget-chart"
        role="group"
        aria-label="Portfolio allocation chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartStyle === "donut" ? 65 : 0}
              outerRadius={85}
              paddingAngle={3}
              animationDuration={500}
              label={
                showLabels
                  ? ({ value }) =>
                      `${getPercentage(Number(value)).toFixed(0)}%`
                  : false
              }
              
                onClick={(data) => {
                if (!selectedAssetClass && typeof data.name === "string") {
                setSelectedAssetClass(data.name);
                setActiveIndex(null);
                }
            }}

              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={item.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.4
                  }
                  stroke="transparent"
                  style={{ cursor: "pointer", transition: "opacity 150ms" }}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, _name, item) => [
                selectedAssetClass
                  ? formatCurrency(Number(value))
                  : `${getPercentage(Number(value)).toFixed(2)}%`,
                item.payload.name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="allocation-widget-legend">
        {chartData.map((item, index) => (
          <button
            type="button"
            key={item.name}
            className="allocation-widget-legend-item"
            onClick={() => {
              if (!selectedAssetClass) {
                setSelectedAssetClass(item.name);
                setActiveIndex(null);
              }
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            aria-label={
              selectedAssetClass
                ? `${item.name}: ${formatCurrency(item.value)}`
                : `${item.name}: ${getPercentage(item.value).toFixed(1)}%. View holdings`
            }
          >
            <span
              className="allocation-widget-dot"
              style={{ backgroundColor: item.color }}
            />

            <span>{item.name}</span>

            <strong>
              {selectedAssetClass
                ? formatCurrency(item.value)
                : `${getPercentage(item.value).toFixed(1)}%`}
            </strong>
          </button>
        ))}
      </div>

      <div className="allocation-widget-total">
        <span>
          {selectedAssetClass
            ? `${selectedAssetClass} value`
            : "Total portfolio value"}
        </span>
        <strong>{formatCurrency(chartTotal)}</strong>
      </div>
    </section>
  );
}
