import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { createOrderTransactionWorkflow } from "../../workflows/taxjar/create-order-transaction";
import { logWorkflowResult } from "../../utils/logWorkflowResult";

export default async function orderCompletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  logger.debug(`Order completed event received for order: ${data.id}`);

  const result = await createOrderTransactionWorkflow(container).run({
    input: {
      id: data.id,
    },
  });

  logWorkflowResult(`order.completed.avalara.${data.id}`, result, logger);
}

export const config: SubscriberConfig = {
  event: "order.completed",
};
