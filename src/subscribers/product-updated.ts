import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await updateProductItemWorkflow(container).run({
    input: {
      product_id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: `product.updated`,
};
