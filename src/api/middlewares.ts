import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import {
  GetTaxjarProductsSchema,
  PutTaxjarProductsSchema,
} from "./admin/taxjar-products/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/taxjar-products",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetTaxjarProductsSchema, {})],
    },
    {
      matcher: "/admin/avalara-products",
      method: "PUT",
      middlewares: [validateAndTransformBody(PutTaxjarProductsSchema)],
    },
  ],
});
