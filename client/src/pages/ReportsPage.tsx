import { useReport } from "../hooks/useReport";

export default function ReportsPage() {
  const { data, isLoading, error } = useReport();

  if (isLoading) {
    return <div>Loading report...</div>;
  }

  if (error) {
    return <div>{error?.message}</div>;
  }

  if (!data) {
    return <div>No report data</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Executive Report
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Metric
          label="Total Spend"
          value={`$${data.totalSpend.toLocaleString()}`}
        />

        <Metric
          label="Forecasted Spend"
          value={`$${data.forecastedSpend.toLocaleString()}`}
        />

        <Metric
          label="Budget"
          value={`$${data.budget.toLocaleString()}`}
        />
      </div>

      <div className="bg-slate-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Executive Summary
        </h2>

        <p className="text-slate-400">
          {data.summary}
        </p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-6">
      <div className="text-slate-400">
        {label}
      </div>

      <div className="text-2xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}
