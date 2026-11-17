
"use client";

import { useMemo, useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { interpolateRdBu } from "d3-scale-chromatic";
import type { WidgetProps } from "../types/widget";

const assets = ["HDFC Bank", "Infosys", "ICICI Bank", "TCS", "Reliance"];

const matrix = [
  [1.00, 0.62, 0.78, 0.55, 0.41],
  [0.62, 1.00, 0.48, 0.86, 0.35],
  [0.78, 0.48, 1.00, 0.52, 0.69],
  [0.55, 0.86, 0.52, 1.00, 0.38],
  [0.41, 0.35, 0.69, 0.38, 1.00],
];

type SelectedPair = {
  rowAsset: string;
  columnAsset: string;
  value: number;
};

function getColor(value: number) {
  const normalized = Math.max(0, Math.min(1, (value + 1) / 2));
  return interpolateRdBu(normalized);
}

function generateScatterPoints(correlation: number) {
  const points = [];
  const noiseFactor = Math.sqrt(1 - correlation * correlation);

  for (let i = 0; i < 25; i++) {
    const x = -0.9 + (i / 24) * 1.8;
    const noise =
      Math.sin(i * 2.37) * 0.45 +
      Math.cos(i * 1.41) * 0.25;

    const y = Math.max(
      -1,
      Math.min(1, correlation * x + noiseFactor * noise)
    );

    points.push({
      x: 25 + ((x + 1) / 2) * 250,
      y: 235 - ((y + 1) / 2) * 210,
    });
  }

  return points;
}

export default function CorrelationMatrixWidget({
  settings,
}: WidgetProps) {
  const [selectedAsset, setSelectedAsset] = useState("All");
  const [selectedPair, setSelectedPair] = useState<SelectedPair | null>(
    null
  );

  const visibleAssets =
    selectedAsset === "All"
      ? assets
      : assets.filter((asset) => asset === selectedAsset);

  const scatterPoints = useMemo(() => {
    if (!selectedPair) return [];

    return generateScatterPoints(selectedPair.value);
  }, [selectedPair]);

  return (
    <section className="correlation-widget">
      <div className="correlation-toolbar">
        <div>
          <strong>Asset correlation</strong>
          <span>Illustrative correlation coefficients</span>
        </div>

        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          aria-label="Filter correlation asset"
        >
          <option value="All">All assets</option>

          {assets.map((asset) => (
            <option key={asset} value={asset}>
              {asset}
            </option>
          ))}
        </select>
      </div>

      <div className="correlation-table-wrap">
        <table className="correlation-table">
          <thead>
            <tr>
              <th>Asset</th>

              {visibleAssets.map((asset) => (
                <th key={asset}>{asset}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleAssets.map((rowAsset) => {
              const rowIndex = assets.indexOf(rowAsset);

              return (
                <tr key={rowAsset}>
                  <th>{rowAsset}</th>

                  {visibleAssets.map((columnAsset) => {
                    const columnIndex = assets.indexOf(columnAsset);
                    const value = matrix[rowIndex][columnIndex];

                    return (
                      <td
                        key={columnAsset}
                        style={{
                          background: getColor(value),
                          padding: 0,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPair({
                              rowAsset,
                              columnAsset,
                              value,
                            })
                          }
                          title={`View scatter plot: ${rowAsset} / ${columnAsset}`}
                          aria-label={`View correlation between ${rowAsset} and ${columnAsset}: ${value.toFixed(2)}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: 42,
                            border: "none",
                            background: "transparent",
                            color: "inherit",
                            font: "inherit",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {value.toFixed(2)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="correlation-legend">
        <span>
          <i className="corr-low" /> Low
        </span>
        <span>
          <i className="corr-medium" /> Moderate
        </span>
        <span>
          <i className="corr-high" /> High
        </span>
      </div>

      <p className="correlation-note">
        Demo values for UI demonstration only. Not calculated from live
        market data. Click any cell to explore its scatter plot.
      </p>

      {selectedPair && (
        <div
          role="presentation"
          onClick={() => setSelectedPair(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="correlation-modal-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(100%, 520px)",
              background: "#17252d",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    color: "#9aabb4",
                    fontSize: 11,
                    letterSpacing: 1,
                  }}
                >
                  CORRELATION ANALYSIS
                </span>

                <h3
                  id="correlation-modal-title"
                  style={{ margin: "7px 0", fontSize: 18 }}
                >
                  {selectedPair.rowAsset} vs {selectedPair.columnAsset}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                aria-label="Close scatter plot"
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  padding: 5,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "18px 0",
              }}
            >
              <TrendingUp size={21} color="#55d5c4" />

              <strong style={{ fontSize: 25 }}>
                {selectedPair.value.toFixed(2)}
              </strong>

              <span style={{ color: "#aabac2", fontSize: 13 }}>
                Correlation coefficient
              </span>
            </div>

            <svg
              viewBox="0 0 310 275"
              role="img"
              aria-label="Illustrative scatter plot showing correlation"
              style={{
                width: "100%",
                display: "block",
                overflow: "visible",
              }}
            >
              {/* Grid lines */}
              {[25, 77, 130, 182, 235].map((y) => (
                <line
                  key={`h-${y}`}
                  x1="25"
                  y1={y}
                  x2="275"
                  y2={y}
                  stroke="rgba(255,255,255,0.10)"
                  strokeDasharray="4 4"
                />
              ))}

              {[25, 87, 150, 212, 275].map((x) => (
                <line
                  key={`v-${x}`}
                  x1={x}
                  y1="25"
                  x2={x}
                  y2="235"
                  stroke="rgba(255,255,255,0.10)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Axes */}
              <line
                x1="25"
                y1="235"
                x2="280"
                y2="235"
                stroke="#91a4ad"
              />
              <line
                x1="25"
                y1="25"
                x2="25"
                y2="235"
                stroke="#91a4ad"
              />

              {/* Scatter points */}
              {scatterPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#55d5c4"
                  opacity="0.85"
                />
              ))}

              <text
                x="150"
                y="266"
                textAnchor="middle"
                fill="#aabac2"
                fontSize="10"
              >
                {selectedPair.rowAsset}
              </text>

              <text
                x="10"
                y="130"
                textAnchor="middle"
                fill="#aabac2"
                fontSize="10"
                transform="rotate(-90 10 130)"
              >
                {selectedPair.columnAsset}
              </text>
            </svg>

            <p
              style={{
                color: "#9aabb4",
                fontSize: 12,
                marginBottom: 0,
                lineHeight: 1.5,
              }}
            >
              Illustrative scatter points generated from the demo
              correlation coefficient. They are not actual historical
              market observations.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
