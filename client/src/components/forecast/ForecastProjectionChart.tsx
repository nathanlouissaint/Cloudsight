import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

import { useHistoricalTrends } from "../../hooks/useHistoricalTrends";
import { useForecast } from "../../hooks/useForecast";

export default function ForecastProjectionChart() {
  const { data: trends = [] } =
    useHistoricalTrends();

  const { data: forecast } =
    useForecast();

  if (!forecast) {
    return null;
  }

  const chartData = [
    ...trends,
    {
      date: "Forecast",
      spend: forecast.projectedSpend,
    },
  ];

  return (
    <div
      style={{
        height: "400px",
        marginTop: "32px",
      }}
    >
      <h2>
        Forecast Projection
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id="forecastGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#3B82F6"
                stopOpacity={0.4}
              />

              <stop
                offset="95%"
                stopColor="#3B82F6"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <ReferenceLine
            y={forecast.budget}
            stroke="#EF4444"
            strokeDasharray="6 6"
            label="Budget"
          />

          <Area
            type="monotone"
            dataKey="spend"
            stroke="#60A5FA"
            fill="url(#forecastGradient)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
