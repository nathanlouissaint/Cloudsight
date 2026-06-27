import { z } from "zod";

export const AlertSchema =
  z.object({

    id:
      z.string(),

    type:
      z.enum([
        "cost_spike",
        "budget_risk",
        "forecast_risk",
      ]),

    severity:
      z.enum([
        "info",
        "warning",
        "critical",
      ]),

    status:
      z.enum([
        "active",
        "resolved",
        "monitoring",
      ]),

    title:
      z.string(),

    description:
      z.string(),

    recommendation:
      z.string(),

    metric:
      z.string(),

    currentValue:
      z.number(),

    threshold:
      z.number(),

    date:
      z.string(),

  });

export const AlertsContract =
  z.array(AlertSchema);

export type AlertsResponse =
  z.infer<
    typeof AlertsContract
  >;
