import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendShipmentCreatedWorkflow } from "../workflows/notifications/send-shipment-created";

export default async function orderShipmetn({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification: boolean }>) {
  await sendShipmentCreatedWorkflow(container).run({
    input: {
      id: data.id,
      no_notification: data.no_notification,
    },
  });
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};
