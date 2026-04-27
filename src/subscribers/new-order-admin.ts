import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendNewOrderAdminWorkflow } from "../workflows/notifications/send-new-order-admin";

export default async function newOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendNewOrderAdminWorkflow(container).run({
    input: {
      id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
