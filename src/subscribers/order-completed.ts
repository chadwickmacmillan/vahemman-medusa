import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { createOrderTransactionWorkflow } from "../workflows/taxjar/create-order-transaction";

export default async function orderCompletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createOrderTransactionWorkflow(container).run({
    input: {
      id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.completed",
};
