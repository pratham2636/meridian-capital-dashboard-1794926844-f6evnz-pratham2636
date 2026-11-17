
"use client";

import { useMemo, useState } from "react";
import {
  hierarchy,
  treemap,
  treemapSquarify,
  type HierarchyRectangularNode,
} from "d3-hierarchy";

import { useHoldings } from "../hooks/usePortfolioData";
import type { WidgetProps } from "../types/widget";

type TreeNode = {
  name: string;
  value?: number;
  change?: number;
  children?: TreeNode[];
};

type SectorItem = {
  name: string;
  change: number;
  value: number;
  holdingsCount: number;
};

const SYMBOL_SECTORS: Record<string, string> = {
  RELIANCE: "Energy",
  HDFCBANK: "Financial Services",
  GSEC: "Fixed Income",
  GOLDBEES: "Alternatives",
};

const WIDTH = 1000;
const HEIGHT = 500;

function getPerformanceColor(change: number): string {
  const intensity = Math.min(Math.abs(change) / 10, 1);

  if (change > 0) {
    return `rgb(20, ${Math.round(75 + intensity * 100)}, 105)`;
  }

  if (change < 0) {
    return `rgb(${Math.round(100 + intensity * 120)}, 48, 58)`;
  }

  return "#64748b";
}

export default function SectorHeatMapWidget(_props: WidgetProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<SectorItem | null>(null);

  const {
    data: holdings = [],
    isLoading,
    isError,
    refetch,
  } = useHoldings();

  const sectors = useMemo<SectorItem[]>(() => {
    const grouped = new Map<
      string,
      { value: number; gainLoss: number; holdingsCount: number }
    >();

    holdings.forEach((holding) => {
      const sector =
        SYMBOL_SECTORS[holding.symbol] ?? holding.assetClass;

      const current = grouped.get(sector) ?? {
        value: 0,
        gainLoss: 0,
        holdingsCount: 0,
      };

      current.value += holding.marketValue;
      current.gainLoss += holding.gainLoss;
      current.holdingsCount += 1;

      grouped.set(sector, current);
    });

    return Array.from(grouped.entries()).map(([name, item]) => ({
      name,
      value: item.value,
      holdingsCount: item.holdingsCount,
      change:
        item.value - item.gainLoss > 0
          ? (item.gainLoss / (item.value - item.gainLoss)) * 100
          : 0,
    }));
  }, [holdings]);

  const visibleSectors = useMemo(
    () =>
      selectedSector
        ? sectors.filter((sector) => sector.name === selectedSector)
        : sectors,
    [sectors, selectedSector]
  );

  const tree = useMemo<HierarchyRectangularNode<TreeNode>>(() => {
    const data: TreeNode = {
      name: "Portfolio",
      children: visibleSectors.map((sector) => ({
        name: sector.name,
        children: selectedSector
          ? holdings
              .filter(
                (holding) =>
                  (SYMBOL_SECTORS[holding.symbol] ?? holding.assetClass) ===
                  sector.name
              )
              .map((holding) => ({
                name: holding.name,
                value: holding.marketValue,
                change: holding.gainLossPercent,
              }))
          : [
              {
                name: sector.name,
                value: sector.value,
                change: sector.change,
              },
            ],
      })),
    };

    const root = hierarchy<TreeNode>(data)
      .sum((node) => node.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return treemap<TreeNode>()
      .tile(treemapSquarify)
      .size([WIDTH, HEIGHT])
      .paddingOuter(5)
      .paddingInner(5)
      .paddingTop(selectedSector ? 0 : 28)
      .round(true)(root);
  }, [holdings, selectedSector, visibleSectors]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <section className="sector-heatmap-widget">
        <p>Loading sector heat map...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="sector-heatmap-widget">
        <p>Unable to load sector data.</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </section>
    );
  }

  if (!sectors.length) {
    return (
      <section className="sector-heatmap-widget">
        <p>No sector data available.</p>
      </section>
    );
  }

  const leaves = tree.leaves();

  return (
    <section className="sector-heatmap-widget">
      <div className="sector-heatmap-summary">
        <div>
          <strong>
            {selectedSector
              ? `${selectedSector} Holdings`
              : "Sector Performance"}
          </strong>
          <span>
            {selectedSector
              ? "Selected sector holdings"
              : "P&L-based portfolio heat map"}
          </span>
        </div>

        {selectedSector && (
          <button
            type="button"
            onClick={() => {
              setSelectedSector(null);
              setHoveredItem(null);
            }}
          >
            ← Back to sectors
          </button>
        )}

        <span>Mock data</span>
      </div>

      <div
        className="sector-heatmap-grid"
        style={{
          width: "100%",
          minHeight: 320,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          role="group"
          aria-label="Interactive portfolio sector treemap"
          style={{
            display: "block",
            width: "100%",
            minHeight: 320,
          }}
        >
          {leaves.map((node, index) => {
            const name = node.data.name;

            const sector = selectedSector
              ? sectors.find((item) => item.name === selectedSector)
              : sectors.find((item) => item.name === name);

            const holding = selectedSector
              ? holdings.find((item) => item.name === name)
              : undefined;

            const change =
              holding?.gainLossPercent ?? sector?.change ?? 0;

            const value = node.value ?? 0;
            const rectWidth = Math.max(0, node.x1 - node.x0);
            const rectHeight = Math.max(0, node.y1 - node.y0);

            return (
              <g
                key={`${name}-${index}`}
                transform={`translate(${node.x0}, ${node.y0})`}
                onClick={() => {
                  if (!selectedSector && sector) {
                    setSelectedSector(sector.name);
                    setHoveredItem(null);
                  }
                }}
                onMouseEnter={() =>
                  setHoveredItem({
                    name,
                    change,
                    value,
                    holdingsCount: sector?.holdingsCount ?? 1,
                  })
                }
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  cursor: selectedSector ? "default" : "pointer",
                }}
                role="button"
                tabIndex={0}
                aria-label={`${name}, ${change.toFixed(2)}% return`}
                onKeyDown={(event) => {
                  if (
                    !selectedSector &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    if (sector) setSelectedSector(sector.name);
                  }
                }}
              >
                <rect
                  width={rectWidth}
                  height={rectHeight}
                  rx={7}
                  fill={getPerformanceColor(change)}
                  stroke="#14252D"
                  strokeWidth={3}
                />

                {rectWidth > 65 && rectHeight > 42 && (
                  <>
                    <text
                      x={12}
                      y={24}
                      fill="#ffffff"
                      fontSize={rectWidth < 150 ? 13 : 17}
                      fontWeight={700}
                      pointerEvents="none"
                    >
                      {name.length > 22
                        ? `${name.slice(0, 20)}...`
                        : name}
                    </text>

                    <text
                      x={12}
                      y={rectHeight > 75 ? 51 : 44}
                      fill="#ffffff"
                      fontSize={16}
                      fontWeight={600}
                      pointerEvents="none"
                    >
                      {change > 0 ? "+" : ""}
                      {change.toFixed(2)}%
                    </text>

                    {rectHeight > 100 && (
                      <text
                        x={12}
                        y={76}
                        fill="#ffffff"
                        fontSize={12}
                        pointerEvents="none"
                      >
                        {formatCurrency(value)}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredItem && (
        <div className="sector-heatmap-tooltip" role="status">
          <strong>{hoveredItem.name}</strong>
          <span>
            Return: {hoveredItem.change > 0 ? "+" : ""}
            {hoveredItem.change.toFixed(2)}%
          </span>
          <span>Value: {formatCurrency(hoveredItem.value)}</span>
        </div>
      )}

      <div className="sector-heatmap-legend">
        <span><i className="heat-negative" /> Negative</span>
        <span><i className="heat-neutral" /> Neutral</span>
        <span><i className="heat-positive" /> Positive</span>
      </div>
    </section>
  );
}
