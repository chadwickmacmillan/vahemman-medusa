import { defineLink } from "@medusajs/framework/utils";

import ProductModule from "@medusajs/medusa/product";

import { SANITY_MODULE } from "../_modules/sanity";

defineLink(
  {
    linkable: ProductModule.linkable.product.id,
    field: "id",
  },
  {
    linkable: {
      serviceName: SANITY_MODULE,
      alias: "sanity_product",
      primaryKey: "id",
    },
  },
  {
    readOnly: true,
  }
);
