import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import Taxcode from "../modules/tax_code";

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
  },
  Taxcode.linkable.taxCode
);
