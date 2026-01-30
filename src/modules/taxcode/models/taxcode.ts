import { model } from "@medusajs/utils";

export const TaxCode = model.define("tax_code", {
  id: model.id().primaryKey(),
  name: model.text().default(""),
  description: model.text().default(""),
  tax_code: model.text().unique(),
});
