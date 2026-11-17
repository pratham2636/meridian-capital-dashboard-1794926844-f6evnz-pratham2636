
"use client";

import { useMemo, useState } from "react";
import { hierarchy, treemap, treemapSquarify } from "d3-hierarchy";
import type { WidgetProps } from "../types/widget";
import { ChevronRight, Home } from "lucide-react";

type Metric = "value" | "risk" | "pnl";

type ExposureNode = {
  name: string;
  value?: number;
  risk?: number;
  pnl?: number;
  children?: ExposureNode[];
};

const exposureData: ExposureNode = {
  name: "Portfolio",
  children: [
    {
      name: "India",
      children: [
        {
          name: "Technology",
          children: [
            { name: "Infosys", value: 18, risk: 14, pnl: 8 },
            { name: "TCS", value: 12, risk: 10, pnl: 4 },
          ],
        },
        {
          name: "Financial",
          children: [
            { name: "HDFC Bank", value: 15, risk: 12, pnl: 5 },
            { name: "ICICI Bank", value: 10, risk: 8, pnl: 3 },
          ],
        },
        {
          name: "Healthcare",
          children: [
            { name: "Healthcare Fund", value: 15, risk: 12, pnl: 6 },
          ],
        },
        {
          name: "Fixed Income",
          children: [
            { name: "Government Bonds", value: 20, risk: 8, pnl: 3 },
          ],
        },
      ],
    },
    {
      name: "US",
      children: [
        {
          name: "Technology",
          children: [
            { name: "US Tech Fund", value: 20, risk: 16, pnl: 10 },
            { name: "NASDAQ ETF", value: 15, risk: 12, pnl: 5 },
          ],
        },
        {
          name: "Healthcare",
          children: [
            { name: "Healthcare ETF", value: 15, risk: 12, pnl: 5 },
          ],
        },
        {
          name: "Derivatives",
          children: [
            { name: "Options", value: 10, risk: 18, pnl: -4 },
          ],
        },
      ],
    },
    {
      name: "UK",
      children: [
        {
          name: "Financial",
          children: [
            { name: "UK Financial Fund", value: 20, risk: 14, pnl: 5 },
          ],
        },
        {
          name: "Fixed Income",
          children: [
            { name: "UK Bonds", value: 10, risk: 5, pnl: 2 },
          ],
        },
      ],
    },
    {
      name: "Singapore",
      children: [
        {
          name: "Technology",
          children: [
            { name: "Singapore Tech Fund", value: 12, risk: 10, pnl: 4 },
          ],
        },
        {
          name: "Financial",
          children: [
            { name: "Singapore Financial Fund", value: 8, risk: 6, pnl: 2 },
          ],
        },
      ],
    },
  ],
};

const COLORS = [
  "#55D5C4",
  "#7798E8",
  "#D5A96C",
  "#8C9EAD",
  "#B18BE8",
  "#E18B9B",
];

function getMetricValue(node: ExposureNode, metric: Metric): number {
  if (node.children?.length) {
    return node.children.reduce(
      (total, child) => total + getMetricValue(child, metric),
      0
    );
  }

  if (metric === "risk") return node.risk ?? 0;
  if (metric === "pnl") return Math.abs(node.pnl ?? 0);

  return node.value ?? 0;
}

function getNodeColor(node: ExposureNode, index: number) {
  if (node.pnl !== undefined && node.pnl < 0) {
    return "#F07878";
  }

  return COLORS[index % COLORS.length];
}

export default function ExposureTreemapWidget({
  settings,
}: WidgetProps) {
  const [metric, setMetric] = useState<Metric>("value");
  const [path, setPath] = useState<string[]>([]);

  const currentNode = useMemo(() => {
    let node = exposureData;

    for (const segment of path) {
      const next = node.children?.find(
        (child) => child.name === segment
      );

      if (!next) return exposureData;
      node = next;
    }

    return node;
  }, [path]);

  const layoutData = useMemo(() => {
    const root = hierarchy(currentNode)
      .sum((node) =>
        node.children?.length ? 0 : getMetricValue(node, metric)
      )
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return treemap<ExposureNode>()
      .tile(treemapSquarify)
      .size([800, 420])
      .paddingOuter(5)
      .paddingInner(4)
      .paddingTop(22)
      .round(true)(root);
  }, [currentNode, metric]);

  const visibleNodes = layoutData.children ?? [];

  const totalValue = getMetricValue(currentNode, metric);

  const formatMetric = (value: number) =>
    metric === "pnl" ? `${value.toFixed(1)}` : value.toFixed(1);

  const navigateTo = (index: number) => {
    setPath(path.slice(0, index));
  };

  return (
    <section className="exposure-widget">
      <div className="exposure-toolbar">
        <div>
          <strong>Portfolio exposure</strong>
          <span>Geographic and sector breakdown</span>
        </div>

        <select
          value={metric}
          onChange={(event) => setMetric(event.target.value as Metric)}
          aria-label="Treemap sizing metric"
        >
          <option value="value">Market Value</option>
          <option value="risk">Risk Contribution</option>
          <option value="pnl">P&amp;L</option>
        </select>
      </div>

      {/* Breadcrumb navigation */}
      <div
        className="exposure-breadcrumbs"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 7,
          margin: "14px 0",
          fontSize: 12,
        }}
      >
        <button
          type="button"
          onClick={() => setPath([])}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "transparent",
            border: "none",
            color: path.length === 0 ? "#55D5C4" : "#9CB3BE",
            cursor: "pointer",
          }}
        >
          <Home size={14} />
          Portfolio
        </button>

        {path.map((segment, index) => (
          <span
            key={`${segment}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <ChevronRight size={13} color="#718995" />

            <button
              type="button"
              onClick={() => navigateTo(index + 1)}
              style={{
                background: "transparent",
                border: "none",
                color:
                  index === path.length - 1
                    ? "#55D5C4"
                    : "#9CB3BE",
                cursor: "pointer",
              }}
            >
              {segment}
            </button>
          </span>
        ))}
      </div>

      <div
        className="exposure-treemap"
        style={{
          width: "100%",
          minHeight: 280,
          position: "relative",
        }}
      >
        <svg
          viewBox="0 0 800 420"
          width="100%"
          height="100%"
          role="img"
          aria-label="Interactive portfolio exposure treemap"
          style={{ display: "block", minHeight: 280 }}
        >
          {visibleNodes.map((node, index) => {
            const width = node.x1 - node.x0;
            const height = node.y1 - node.y0;
            const data = node.data;

            const isExpandable = Boolean(data.children?.length);
            const fill = getNodeColor(data, index);
            const value = getMetricValue(data, metric);

            return (
              <g
                key={`${data.name}-${index}`}
                onClick={() => {
                  if (isExpandable) {
                    setPath((previous) => [...previous, data.name]);
                  }
                }}
                style={{
                  cursor: isExpandable ? "pointer" : "default",
                }}
              >
                <rect
                  x={node.x0}
                  y={node.y0}
                  width={Math.max(0, width)}
                  height={Math.max(0, height)}
                  rx={5}
                  fill={fill}
                  fillOpacity={0.82}
                  stroke="#0B171D"
                  strokeWidth={2}
                />

                <text
                  x={node.x0 + 10}
                  y={node.y0 + 21}
                  fill="#0B171D"
                  fontSize={Math.min(15, Math.max(10, width / 12))}
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {width > 55 && height > 32 ? data.name : ""}
                </text>

                <text
                  x={node.x0 + 10}
                  y={node.y0 + 41}
                  fill="#0B171D"
                  fontSize="12"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {width > 65 && height > 48
                    ? formatMetric(value)
                    : ""}
                </text>

                {isExpandable && width > 90 && height > 65 && (
                  <text
                    x={node.x0 + 10}
                    y={node.y1 - 12}
                    fill="#0B171D"
                    fontSize="10"
                    pointerEvents="none"
                  >
                    Click to explore →
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {visibleNodes.length === 0 && (
        <p style={{ color: "#9CB3BE", textAlign: "center" }}>
          No exposure data available.
        </p>
      )}

      <div
        className="exposure-footer"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 12,
        }}
      >
        <span>
          Selected metric:{" "}
          {metric === "value"
            ? "Market Value"
            : metric === "risk"
              ? "Risk Contribution"
              : "P&L"}
        </span>

        <span>Total: {formatMetric(totalValue)}</span>
      </div>

      <p className="exposure-note">
        Illustrative demo data · Click regions and sectors to drill down.
        Values are not live portfolio exposures.
      </p>
    </section>
  );
}
