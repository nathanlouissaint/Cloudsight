import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useHistoricalTrends,
} from "../../hooks/useHistoricalTrends";

export default function SpendTrendChart() {
  const {
    data = [],
    isLoading,
  } =
    useHistoricalTrends();

  if (isLoading) {
    return (
      <div>
        Loading trends...
      </div>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={320}
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="spendGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#3B82F6"
              stopOpacity={0.45}
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

        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
        />

        <Tooltip />

        <Area
          type="monotone"
          dataKey="spend"
          stroke="#60A5FA"
          strokeWidth={3}
          fill="url(#spendGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
