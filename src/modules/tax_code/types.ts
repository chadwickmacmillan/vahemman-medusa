import type { ProductDTO } from "@medusajs/framework/types";

export type TaxCode = {
  id: string;
  name: string;
  description: string;
  code: string;
};

export type ProductDTOWithTaxCode = ProductDTO & {
  tax_code?: TaxCode;
};
