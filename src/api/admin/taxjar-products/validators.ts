import { z } from "@medusajs/framework/zod";
import { PaginationSchema } from "../../../utils";

export const GetTaxjarProductsSchema = PaginationSchema;

export const PutTaxjarProductsSchema = z.object({
  taxjar_products: z.array(
    z.object({
      product_id: z.string(),
      tax_code: z.string(),
    })
  ),
});
