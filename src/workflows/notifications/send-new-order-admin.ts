import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { getAdminEmailsForNotificationTypeStep } from "./steps/get-admin-emails";

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

    const adminEmails = getAdminEmailsForNotificationTypeStep({
      type: "order-placed",
    });

    const notifications = transform({ adminEmails, orders }, (data) =>
      data.adminEmails.map((email) => ({
        to: email,
        channel: "email",
        template: "order-placed-admin",
        data: { order: data.orders[0] },
      })),
    );

    const notification = when(
      { adminEmails },
      (data) => !!data.adminEmails.length && data.adminEmails.length > 0,
    ).then(() => {
      return sendNotificationStep(notifications);
    });

    return new WorkflowResponse({
      notification,
    });
  },
);
