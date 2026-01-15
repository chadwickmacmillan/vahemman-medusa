import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { sendOrderConfirmationWorkflow } from "../workflows/notifications/send-order-confirmation";
import { createOrderTransactionWorkflow } from "../workflows/avalara/create-order-transaction";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderConfirmationWorkflow(container).run({
    input: {
      id: data.id,
    },
  });
  await createOrderTransactionWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
