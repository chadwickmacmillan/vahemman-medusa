import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { sendOrderConfirmationWorkflow } from "../workflows/notifications/send-order-confirmation";
import { createOrderTransactionWorkflow } from "../workflows/taxjar/create-order-transaction";

export default async function orderUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createOrderTransactionWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.updated",
};
