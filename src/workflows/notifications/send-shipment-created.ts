import {
  createWorkflow,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";

type WorkflowInput = {
  id: string;
  no_notification: boolean;
};

export const sendShipmentCreatedWorkflow = createWorkflow(
  "send-shipment-created",
  ({ id, no_notification }: WorkflowInput) => {
    const { data: fulfillments } = useQueryGraphStep({
      entity: "fulfillment",
      fields: ["id", "items*", "labels*", "shipped_at", "*order.customer.*"],
      filters: {
        id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    });

    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "*variants",
        "*variants.calculated_price",
        "+variants.inventory_quantity",
        "*variants.images",
        "*variants.options",
        "*variants.options.option",
      ],
      options: {
        throwIfKeyNotFound: true,
      },
    }).config({ name: "fetch-products" });

    const notification = when(
      { fulfillments },
      (data) =>
        !no_notification &&
        !!data.fulfillments[0] &&
        !!data.fulfillments[0]?.order?.email
    ).then(() => {
      return sendNotificationStep([
        {
          to: fulfillments[0]?.order?.email!,
          channel: "email",
          template: "shipment-created",
          data: {
            fulfillment: fulfillments[0],
            products: products,
          },
        },
      ]);
    });

    return new WorkflowResponse({
      notification,
    });
  }
);
