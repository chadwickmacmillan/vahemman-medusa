import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { createRefundTransactionWorkflow } from "../workflows/taxjar/create-refund-transaction";

export default async function refundCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createRefundTransactionWorkflow(container).run({
    input: {
      id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: ["payment.refunded"],
};
