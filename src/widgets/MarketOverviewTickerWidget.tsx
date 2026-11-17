
"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import type { WidgetProps } from "../types/widget";

type MarketItem = {
  name: string;
  value: string;
  change: string;
  positive: boolean;
  history: number[];
};

const initialMarketData: MarketItem[] = [
  {
    name: "NIFTY 50",
    value: "24,850.50",
    change: "+0.82%",
    positive: true,
    history: [35, 42, 38, 50, 46, 58, 54, 68, 63, 78],
  },
  {
    name: "SENSEX",
    value: "81,550.20",
    change: "+0.65%",
    positive: true,
    history: [30, 38, 35, 44, 41, 55, 50, 61, 58, 70],
  },
  {
    name: "S&P 500",
    value: "5,920.30",
    change: "-0.24%",
    positive: false,
    history: [75, 68, 72, 60, 64, 52, 58, 44, 49, 35],
  },
  {
    name: "NASDAQ",
    value: "19,120.45",
    change: "+1.12%",
    positive: true,
    history: [25, 32, 30, 48, 43, 57, 55, 68, 64, 82],
  },
  {
    name: "BANK NIFTY",
    value: "56,230.10",
    change: "-0.38%",
    positive: false,
    history: [80, 73, 77, 65, 69, 57, 61, 48, 52, 38],
  },
  {
    name: "DOW JONES",
    value: "43,850.60",
    change: "+0.31%",
    positive: true,
    history: [30, 36, 33, 46, 43, 52, 49, 60, 57, 67],
  },
];

function Sparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 180;
      const y = 55 - (value / 100) * 48;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 180 60"
      width="100%"
      height="65"
      role="img"
      aria-label="Illustrative market price trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#55D5C4" : "#F07878"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MarketOverviewTickerWidget({
  settings,
}: WidgetProps) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [visibleSymbols, setVisibleSymbols] = useState<string[]>(
    initialMarketData.map((item) => item.name)
  );

  const marketData = useMemo(
    () =>
      initialMarketData.filter((item) =>
        visibleSymbols.includes(item.name)
      ),
    [visibleSymbols]
  );

  const selectedItem = marketData.find(
    (item) => item.name === selectedMarket
  );

  const toggleSymbol = (symbol: string) => {
    setVisibleSymbols((previous) =>
      previous.includes(symbol)
        ? previous.filter((item) => item !== symbol)
        : [...previous, symbol]
    );
  };

  return (
    <section className="market-ticker-widget">
      <div className="market-ticker-heading">
        <div>
          <strong>Global Market Indices</strong>
          <span>Market overview and price movements</span>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings((previous) => !previous)}
          aria-label="Configure market symbols"
          title="Configure symbols"
          style={{
            background: "transparent",
            color: "#9CB3BE",
            border: "1px solid #29404A",
            borderRadius: 7,
            padding: 7,
            cursor: "pointer",
          }}
        >
          <Settings2 size={17} />
        </button>
      </div>

      {showSettings && (
        <div
          className="market-symbol-settings"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 0",
          }}
        >
          {initialMarketData.map((market) => (
            <label
              key={market.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#B8CDD5",
              }}
            >
              <input
                type="checkbox"
                checked={visibleSymbols.includes(market.name)}
                onChange={() => toggleSymbol(market.name)}
              />
              {market.name}
            </label>
          ))}
        </div>
      )}

      <div className="market-ticker-viewport">
        <div className="market-ticker-track">
          {[...marketData, ...marketData].map((market, index) => (
            <button
              type="button"
              className="market-ticker-item"
              key={`${market.name}-${index}`}
              onClick={() =>
                setSelectedMarket((previous) =>
                  previous === market.name ? null : market.name
                )
              }
              aria-label={`View ${market.name} price trend`}
              style={{
                textAlign: "left",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <div>
                <strong>{market.name}</strong>
                <span>{market.value}</span>
              </div>

              <span
                className={
                  market.positive
                    ? "ticker-positive"
                    : "ticker-negative"
                }
              >
                {market.positive ? "▲" : "▼"} {market.change}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div
          className="market-sparkline-panel"
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid #29404A",
            borderRadius: 9,
            background: "#14252D",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div>
              <strong style={{ color: "#EAF4F5" }}>
                {selectedItem.name}
              </strong>
              <div
                style={{
                  color: selectedItem.positive ? "#55D5C4" : "#F07878",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {selectedItem.value} · {selectedItem.change}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMarket(null)}
              aria-label="Collapse sparkline"
              style={{
                background: "transparent",
                border: "none",
                color: "#9CB3BE",
                cursor: "pointer",
              }}
            >
              <ChevronUp size={19} />
            </button>
          </div>

          <Sparkline
            data={selectedItem.history}
            positive={selectedItem.positive}
          />

          <span style={{ color: "#8BA7B8", fontSize: 11 }}>
            Illustrative price trend
          </span>
        </div>
      )}

      {marketData.length === 0 && (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            color: "#9CB3BE",
          }}
        >
          No market symbols selected. Enable symbols in settings.
        </div>
      )}

      <p className="market-ticker-note">
        Sample market figures and sparkline trends for UI demonstration
        only. Not live market data.
      </p>
    </section>
  );
}
