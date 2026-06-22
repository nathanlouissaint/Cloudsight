import { useCosts } from "../hooks/useCosts";
import SpendTrendChart from "../components/charts/SpendTrendChart";
import ServiceBreakdownChart from "../components/shared/charts/ServiceBreakdownChart";
import { serviceBreakdownMock } from "../mocks/serviceBreakdown.mock";

export default function CostsPage() {
  const {
    data,
    loading,
    error,
  } = useCosts();

  if (loading) {
    return <div>Loading costs...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const chartData = data.map(item => ({
    date: item.date,
    spend: item.cost,
  }));

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Cost Analytics
      </h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Spend Trend
          </h2>

          <SpendTrendChart />
        </div>

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Service Breakdown
          </h2>

          <ServiceBreakdownChart
            data={serviceBreakdownMock}
          />
        </div>

      </div>

      <div className="bg-slate-900 rounded-xl p-6">

        <h2 className="text-lg font-semibold mb-4">
          Daily Costs
        </h2>

        <table className="w-full">

          <thead>
            <tr>
              <th className="text-left">
                Date
              </th>

              <th className="text-right">
                Cost
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.date}
                className="border-t border-slate-800"
              >
                <td className="py-3">
                  {item.date}
                </td>

                <td className="text-right py-3">
                  ${item.cost}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
