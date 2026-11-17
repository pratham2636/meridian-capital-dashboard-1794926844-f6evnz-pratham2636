
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WidgetProps } from "../types/widget";

const drawdownData = [
  { month: "Jan", drawdown: 0 },
  { month: "Feb", drawdown: -1.8 },
  { month: "Mar", drawdown: -4.5 },
  { month: "Apr", drawdown: -2.1 },
  { month: "May", drawdown: -3.2 },
  { month: "Jun", drawdown: -6.4 },
  { month: "Jul", drawdown: -2.8 },
  { month: "Aug", drawdown: -1.2 },
  { month: "Sep", drawdown: -3.7 },
  { month: "Oct", drawdown: -1.5 },
  { month: "Nov", drawdown: -2.4 },
  { month: "Dec", drawdown: 0 },
];

export default function DrawdownChartWidget({ settings }: WidgetProps) {
  const maxDrawdown = Math.min(
    ...drawdownData.map((item) => item.drawdown)
  );

  return (
    <section className="drawdown-widget">
      <div className="drawdown-summary">
        <div>
          <span>Maximum drawdown</span>
          <strong>{maxDrawdown.toFixed(2)}%</strong>
        </div>
        <span className="drawdown-period">12-month sample</span>
      </div>

      <div className="drawdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={drawdownData}
            margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F07878" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F07878" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#29404A"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#8BA7B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[-8, 0]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#8BA7B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <ReferenceLine y={0} stroke="#8BA7B8" />

            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(2)}%`, "Drawdown"]}
              contentStyle={{
                background: "#14252D",
                border: "1px solid #29404A",
                borderRadius: "8px",
                color: "#EAF4F5",
              }}
            />

            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#F07878"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="drawdown-note">
        Illustrative demo data only. Not calculated from live portfolio returns.
      </p>
    </section>
  );
}
