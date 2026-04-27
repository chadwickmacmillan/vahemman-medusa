import {
  createWorkflow,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";

type WorkflowInput = {
  id: string;
};

export const sendNewOrderAdminWorkflow = createWorkflow(
  "send-new-order-admin",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "shipping_address.*",
        "subtotal",
        "shipping_total",
        "currency_code",
        "discount_total",
        "tax_total",
        "total",
        "items.*",
        "original_total",
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
      { orders },
      (data) => !!data.orders[0].email,
    ).then(() => {
      return sendNotificationStep([
        {
          to: orders[0].email!,
          channel: "email",
          template: "order-placed-admin",
          data: {
            order: orders[0],
          },
        },
      ]);
    });

    return new WorkflowResponse({
      notification,
    });
  },
);
