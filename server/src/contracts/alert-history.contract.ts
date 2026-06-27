import { z } from "zod";

export const AlertHistoryItemSchema =
  z.object({

    id:
      z.string(),

    alertId:
      z.string(),

    type:
      z.string(),

    severity:
      z.string(),

    status:
      z.string(),

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

    occurredAt:
      z.string(),

    resolvedAt:
      z.string().nullable(),

    createdAt:
      z.string(),

  });

export const AlertHistoryContract =
  z.array(
    AlertHistoryItemSchema
  );

export type AlertHistoryResponse =
  z.infer<
    typeof AlertHistoryContract
  >;
