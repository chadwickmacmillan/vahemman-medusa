import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import Taxcode from "../modules/tax_code";

export default defineLink(
  {
    linkable: ProductModule.linkable.productCategory,
    isList: true,
  },
  Taxcode.linkable.taxCode
);
