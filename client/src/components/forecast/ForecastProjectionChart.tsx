import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ForecastProjectionPoint,
} from "../../types/forecast";

import type {
  HistoricalTrend,
} from "../../hooks/useHistoricalTrends";

interface Props {
  historical: HistoricalTrend[];
  projection: ForecastProjectionPoint[];
  budget: number;
}

export default function ForecastProjectionChart({
  historical,
  projection,
  budget,
}: Props) {
  const historicalData = historical.map(
    (point) => ({
      date: point.date,
      historicalSpend: point.spend,
      forecastSpend: null,
    })
  );

  const forecastData = projection.map(
    (point) => ({
      date: new Date(point.date).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      ),
      historicalSpend: null,
      forecastSpend: point.projectedSpend,
    })
  );

  const divider =
    historicalData.length > 0
      ? historicalData[
          historicalData.length - 1
        ].date
      : "";

  const chartData = [
    ...historicalData,
    ...forecastData,
  ];

  return (
    <div
      style={{
        marginTop: 32,
      }}
    >
      <h2>Forecast Projection</h2>

      <ResponsiveContainer
        width="100%"
        height={420}
      >
        <LineChart data={chartData}>
          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => {
              if (
                typeof value !==
                "number"
              ) {
                return "";
              }

              return [
                `$${value.toLocaleString()}`,
                "",
              ];
            }}
          />

          <Legend />

          <ReferenceLine
            y={budget}
            stroke="#EF4444"
            strokeDasharray="6 6"
            label="Budget"
          />

          <ReferenceLine
            x={divider}
            stroke="#94A3B8"
            strokeDasharray="3 3"
            label="Today"
          />

          <Line
            type="monotone"
            dataKey="historicalSpend"
            name="Historical Spend"
            stroke="#60A5FA"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey="forecastSpend"
            name="Forecast"
            stroke="#F59E0B"
            strokeWidth={3}
            strokeDasharray="8 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}