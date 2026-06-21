import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "May 21", spend: 110 },
  { date: "May 24", spend: 135 },
  { date: "May 27", spend: 185 },
  { date: "May 30", spend: 120 },
  { date: "Jun 2", spend: 145 },
  { date: "Jun 5", spend: 82 },
  { date: "Jun 8", spend: 115 },
  { date: "Jun 11", spend: 190 },
  { date: "Jun 14", spend: 240 },
  { date: "Jun 17", spend: 128 },
  { date: "Jun 20", spend: 170 },
];

export default function SpendTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
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
          tick={{
            fill: "#94A3B8",
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{
            fill: "#94A3B8",
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
          }}
        />

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