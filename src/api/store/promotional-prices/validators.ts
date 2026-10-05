import { z } from "@medusajs/framework/zod";

export type StorePromotionalPricesType = z.infer<typeof StorePromotionalPrices>;
export const StorePromotionalPrices = z.object({
  product_ids: z.array(z.string()).min(1).max(200),
  region_id: z.string(),
  cart_id: z.string().optional(),
});
