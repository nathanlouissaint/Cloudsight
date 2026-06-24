import { useAlerts } from "../hooks/useAlerts";

export default function AlertsPage() {
  const { data, isLoading, error } = useAlerts();

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  if (error) {
    return <div>{error?.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Alert Center
      </h1>

      <div className="space-y-4">
        {data?.alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {alert.title}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  alert.severity === "critical"
                    ? "bg-red-500/20 text-red-400"
                    : alert.severity === "warning"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <p className="text-slate-400">
              {alert.description}
            </p>

            <p className="text-xs text-slate-500 mt-3">
              {alert.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
