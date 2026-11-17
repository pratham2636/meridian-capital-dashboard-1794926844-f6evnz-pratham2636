
"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { X } from "lucide-react";
import type { WidgetProps } from "../types/widget";

type Period = "1M" | "3M" | "6M";
type ChartMode = "grouped" | "stacked";

type AttributionItem = {
  name: string;
  contribution: number;
  previousContribution: number;
  details: string;
};

const attributionData: AttributionItem[] = [
  {
    name: "Equities",
    contribution: 2.8,
    previousContribution: 2.2,
    details: "Positive equity allocation contributed to portfolio returns.",
  },
  {
    name: "Technology",
    contribution: 1.9,
    previousContribution: 1.5,
    details: "Technology sector exposure supported portfolio performance.",
  },
  {
    name: "Banking",
    contribution: 1.4,
    previousContribution: 1.1,
    details: "Banking allocation delivered a positive contribution.",
  },
  {
    name: "Healthcare",
    contribution: 0.9,
    previousContribution: 0.7,
    details: "Healthcare holdings contributed positively to returns.",
  },
  {
    name: "Energy",
    contribution: -0.7,
    previousContribution: -0.4,
    details: "Energy allocation negatively affected portfolio performance.",
  },
  {
    name: "Real Estate",
    contribution: 0.6,
    previousContribution: 0.3,
    details: "Real estate exposure added a positive contribution.",
  },
];

const periodMultipliers: Record<Period, number> = {
  "1M": 0.45,
  "3M": 1,
  "6M": 1.65,
};

export default function PerformanceAttributionWidget({
  settings,
}: WidgetProps) {
  const [period, setPeriod] = useState<Period>("3M");
  const [chartMode, setChartMode] = useState<ChartMode>("grouped");
  const [selectedItem, setSelectedItem] =
    useState<AttributionItem | null>(null);

  const chartData = useMemo(() => {
    const multiplier = periodMultipliers[period];

    return attributionData.map((item) => ({
      ...item,
      current: Number((item.contribution * multiplier).toFixed(2)),
      previous: Number(
        (item.previousContribution * multiplier).toFixed(2)
      ),
    }));
  }, [period]);

  const totalContribution = chartData.reduce(
    (total, item) => total + item.current,
    0
  );

  const previousTotal = chartData.reduce(
    (total, item) => total + item.previous,
    0
  );

  return (
    <section className="attribution-widget">
      <div className="attribution-summary">
        <div>
          <span>Total contribution · {period}</span>
          <strong>{totalContribution.toFixed(2)}%</strong>
          <small>
            Previous comparison: {previousTotal.toFixed(2)}%
          </small>
        </div>

        <span className="attribution-period">
          Illustrative data
        </span>
      </div>

      <div
        className="attribution-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          className="attribution-period-options"
          style={{ display: "flex", gap: 6 }}
        >
          {(["1M", "3M", "6M"] as Period[]).map((item) => (
            <button
              key={item}
              type="button"
              className={period === item ? "active" : ""}
              onClick={() => setPeriod(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div
          className="attribution-mode-options"
          style={{ display: "flex", gap: 6 }}
        >
          <button
            type="button"
            className={chartMode === "grouped" ? "active" : ""}
            onClick={() => setChartMode("grouped")}
          >
            Grouped
          </button>

          <button
            type="button"
            className={chartMode === "stacked" ? "active" : ""}
            onClick={() => setChartMode("stacked")}
          >
            Stacked
          </button>
        </div>
      </div>

      <div className="attribution-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid
              stroke="#29404A"
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              tick={{ fill: "#8BA7B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />

            <YAxis
              type="category"
              dataKey="name"
              width={95}
              tick={{ fill: "#B8CDD5", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#14252D",
                border: "1px solid #29404A",
                borderRadius: "8px",
                color: "#EAF4F5",
              }}
              formatter={(value, name) => [
                `${Number(value).toFixed(2)}%`,
                name === "current" ? "Current period" : "Previous period",
              ]}
            />

            <Legend
              wrapperStyle={{
                color: "#B8CDD5",
                fontSize: 11,
              }}
              formatter={(value) =>
                value === "current" ? "Current period" : "Previous period"
              }
            />

            <Bar
              dataKey="current"
              name="current"
              stackId={chartMode === "stacked" ? "comparison" : undefined}
              radius={[0, 4, 4, 0]}
              barSize={chartMode === "stacked" ? 18 : 12}
              onClick={(data) => {
                const item = attributionData.find(
                  (entry) => entry.name === data.name
                );
                if (item) setSelectedItem(item);
              }}
              cursor="pointer"
            >
              {chartData.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.current >= 0 ? "#55D5C4" : "#F07878"}
                />
              ))}
            </Bar>

            <Bar
              dataKey="previous"
              name="previous"
              stackId={chartMode === "stacked" ? "comparison" : undefined}
              radius={[0, 4, 4, 0]}
              barSize={chartMode === "stacked" ? 18 : 12}
              onClick={(data) => {
                const item = attributionData.find(
                  (entry) => entry.name === data.name
                );
                if (item) setSelectedItem(item);
              }}
              cursor="pointer"
            >
              {chartData.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.previous >= 0 ? "#648BD8" : "#C17A9A"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="attribution-note">
        Click any bar to view contribution details. Demo values are
        illustrative and not calculated from live market data.
      </p>

      {selectedItem && (
        <div
          role="presentation"
          onClick={() => setSelectedItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="attribution-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(100%, 400px)",
              padding: 22,
              borderRadius: 14,
              background: "#14252D",
              color: "#EAF4F5",
              border: "1px solid #29404A",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h3
                id="attribution-detail-title"
                style={{ margin: 0 }}
              >
                {selectedItem.name}
              </h3>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close details"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#EAF4F5",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: "#9CB3BE", fontSize: 13 }}>
              Contribution analysis · {period}
            </p>

            <div style={{ margin: "20px 0" }}>
              <span style={{ color: "#9CB3BE", fontSize: 12 }}>
                Current contribution
              </span>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color:
                    selectedItem.contribution >= 0
                      ? "#55D5C4"
                      : "#F07878",
                }}
              >
                {(
                  selectedItem.contribution *
                  periodMultipliers[period]
                ).toFixed(2)}
                %
              </strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ color: "#9CB3BE", fontSize: 12 }}>
                Previous contribution
              </span>
              <strong style={{ display: "block", fontSize: 18 }}>
                {(
                  selectedItem.previousContribution *
                  periodMultipliers[period]
                ).toFixed(2)}
                %
              </strong>
            </div>

            <p
              style={{
                color: "#B8CDD5",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {selectedItem.details}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
