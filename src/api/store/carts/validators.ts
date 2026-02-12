import { z } from "@medusajs/framework/zod";
import { createSelectParams } from "../../utils/validators";

export type StoreGetPromotionType = z.infer<typeof StoreGetCartsCart>;
export const StoreGetCartsCart = createSelectParams();

export type StoreCalculateCartTaxesType = z.infer<
  typeof StoreCalculateCartTaxes
>;
export const StoreCalculateCartTaxes = createSelectParams();
