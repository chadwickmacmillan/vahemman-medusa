import { validateAndTransformBody } from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { AssignTaxCodeValidator } from "./admin/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/product/:productId/tax_code",
      method: ["POST"],
      middlewares: [validateAndTransformBody(AssignTaxCodeValidator)],
    },
  ],
});
