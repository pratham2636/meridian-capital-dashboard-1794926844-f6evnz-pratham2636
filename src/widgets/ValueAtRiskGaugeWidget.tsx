
"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { WidgetProps } from "../types/widget";
import { useRiskMetrics } from "../hooks/usePortfolioData";

const MAX_VAR = 5;
const CENTER = 120;
const RADIUS = 82;

function polarToCartesian(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function describeArc(radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(radius, startAngle);
  const end = polarToCartesian(radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export default function ValueAtRiskGaugeWidget({
  settings,
}: WidgetProps) {
  const [confidence, setConfidence] = useState<"95" | "99">("95");

  const {
    data: riskData,
    isLoading,
    isError,
  } = useRiskMetrics();

  const varValue =
    confidence === "95" ? riskData?.var95 : riskData?.var99;

  const threshold = 3;
  const safeValue = typeof varValue === "number" ? varValue : 0;

  const gaugePercent = Math.max(
    0,
    Math.min((safeValue / MAX_VAR) * 100, 100)
  );

  const needleAngle = -135 + (gaugePercent / 100) * 270;
  const isHighRisk = safeValue >= threshold;

  const needleEnd = useMemo(() => {
    const radians = (needleAngle * Math.PI) / 180;

    return {
      x: CENTER + 65 * Math.sin(radians),
      y: CENTER - 65 * Math.cos(radians),
    };
  }, [needleAngle]);

  const gaugeColor = isHighRisk
    ? "#ef6262"
    : safeValue >= 2
      ? "#e6b85c"
      : "#55d5c4";

  const historicalBandStart = polarToCartesian(RADIUS + 12, -54);
  const historicalBandEnd = polarToCartesian(RADIUS + 12, 54);

  if (isLoading) {
    return (
      <section className="var-widget">
        <div className="var-empty">Loading risk metrics...</div>
      </section>
    );
  }

  if (isError || !riskData || typeof varValue !== "number") {
    return (
      <section className="var-widget">
        <div className="var-empty">
          <AlertTriangle size={22} />
          <strong>Unable to load VaR metrics</strong>
          <span>Please try again later.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="var-widget">
      <div className="var-top">
        <div>
          <span className="var-label">DAILY VALUE AT RISK</span>
          <h2>{safeValue.toFixed(2)}%</h2>
          <p>Portfolio risk estimate at {confidence}% confidence</p>
        </div>

        <span className={`var-status ${isHighRisk ? "high" : "normal"}`}>
          {isHighRisk ? (
            <AlertTriangle size={15} />
          ) : (
            <ShieldCheck size={15} />
          )}
          {isHighRisk ? "Above threshold" : "Within threshold"}
        </span>
      </div>

      <div className="var-gauge-wrap">
        <svg
          className="var-svg-gauge"
          viewBox="0 0 240 240"
          role="img"
          aria-label={`Daily Value at Risk is ${safeValue.toFixed(
            2
          )} percent at ${confidence} percent confidence`}
        >
          {/* Background track */}
          <path
            d={describeArc(RADIUS, -135, 135)}
            fill="none"
            stroke="#29434b"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Green risk zone: 0–2% */}
          <path
            d={describeArc(RADIUS, -135, -27)}
            fill="none"
            stroke="#55d5c4"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Amber risk zone: 2–3% */}
          <path
            d={describeArc(RADIUS, -27, 27)}
            fill="none"
            stroke="#e6b85c"
            strokeWidth="15"
          />

          {/* Red risk zone: 3–5% */}
          <path
            d={describeArc(RADIUS, 27, 135)}
            fill="none"
            stroke="#ef6262"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Historical reference band (illustrative) */}
          <path
            d={describeArc(RADIUS + 12, -54, 54)}
            fill="none"
            stroke="#9aaeb7"
            strokeWidth="3"
            strokeDasharray="4 5"
            opacity="0.65"
          />

          {/* Gauge labels */}
          <text x="29" y="151" className="var-svg-label">
            0%
          </text>
          <text x="120" y="22" textAnchor="middle" className="var-svg-label">
            2.5%
          </text>
          <text x="211" y="151" textAnchor="end" className="var-svg-label">
            5%
          </text>

          {/* Animated needle */}
          <motion.line
            x1={CENTER}
            y1={CENTER}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={gaugeColor}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r="9"
            fill={gaugeColor}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r="4"
            fill="#ffffff"
          />

          {/* Center value */}
          <text
            x={CENTER}
            y="174"
            textAnchor="middle"
            className="var-svg-value"
          >
            {safeValue.toFixed(2)}%
          </text>
          <text
            x={CENTER}
            y="192"
            textAnchor="middle"
            className="var-svg-caption"
          >
            Daily VaR
          </text>
        </svg>
      </div>

      <div className="var-historical-legend">
        <span className="var-history-dot" />
        Historical reference band · Illustrative
      </div>

      <div className="var-settings">
        <label>Confidence level</label>

        <div className="var-confidence-options">
          <button
            type="button"
            className={confidence === "95" ? "active" : ""}
            onClick={() => setConfidence("95")}
          >
            95%
          </button>

          <button
            type="button"
            className={confidence === "99" ? "active" : ""}
            onClick={() => setConfidence("99")}
          >
            99%
          </button>
        </div>
      </div>

      <div className="var-details">
        <div>
          <span>Risk threshold</span>
          <strong>{threshold.toFixed(1)}%</strong>
        </div>

        <div>
          <span>Confidence level</span>
          <strong>{confidence}%</strong>
        </div>

        <div>
          <span>Risk status</span>
          <strong className={isHighRisk ? "var-danger" : "var-safe"}>
            {isHighRisk ? "Elevated" : "Normal"}
          </strong>
        </div>
      </div>

      <div className="var-risk-legend">
        <span><i className="safe" /> Low</span>
        <span><i className="moderate" /> Moderate</span>
        <span><i className="danger" /> High</span>
      </div>

      <p className="var-disclaimer">
        Mock API risk metrics · Historical reference band is illustrative.
        Not a live financial risk calculation.
      </p>
    </section>
  );
}
