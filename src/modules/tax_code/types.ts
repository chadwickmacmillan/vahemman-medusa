import type { ProductDTO } from "@medusajs/framework/types";

export type ProductDTOWithTaxCode = ProductDTO & {
  tax_code?: {
    name: string;
    description: string;
    code: string;
  };
};
