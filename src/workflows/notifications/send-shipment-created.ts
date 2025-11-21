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
      fields: [
        "id",
        "items*",
        "labels*",
        "shipped_at",
        "*order",
        "*order.customer.*",
      ],
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

    console.log(no_notification, fulfillments, products);

    const notification = when(
      { no_notification, fulfillments, products },
      (data) =>
        !data.no_notification &&
        !!data.fulfillments[0] &&
        !!data.fulfillments[0]?.order?.email &&
        !!data.products
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
