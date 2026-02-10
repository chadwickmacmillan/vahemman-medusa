import { InferTypeOf } from "@medusajs/framework/types";
import { model } from "@medusajs/framework/utils";

export const TaxjarProduct = model
  .define("taxjar_product", {
    id: model.id().primaryKey(),
    tax_code: model.text().searchable(),
    product_id: model.text().index("IDX_taxjar_product_product_id"),
  })
  .indexes([
    {
      name: "UQ_taxjar_product_product_id_active",
      on: ["product_id"],
      where: { deleted_at: null },
      unique: true,
    },
  ]);

export type TaxjarProductModel = InferTypeOf<typeof TaxjarProduct>;

export default TaxjarProduct;
