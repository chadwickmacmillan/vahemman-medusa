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
        "items.*",
        "labels.*",
        "order",
        "order.*",
        "order.items.*",
        "order.customer.*",
        "shipped_at",
        "order.shipping_address",
        "order.shipping_address.*",
        "order.subtotal",
        "order.tax_total",
        "order.total",
        "order.item_total",
        "order.shipping_methods.*",
        "order.currency_code",
        "order.id",
        "order.display_id",
        "order.email",
        "order.discount_total",
        "order.shipping_total",
        "order.tax_total",
        "order.item_subtotal",
        "order.item_total",
        "order.item_tax_total",
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
        "*",
        "images.*",
        "variants.*",
        "variants.inventory_quantity",
        "variants.images.*",
        "variants.options.*",
        "variants.options.option.*",
      ],
    }).config({ name: "fetch-products" });

    const notification = when(
      { no_notification, fulfillments, products },
      (data) => !data.no_notification && !!data.fulfillments[0]?.order?.email
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
