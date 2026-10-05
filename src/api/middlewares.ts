import { validateAndTransformBody } from "@medusajs/framework";
import { authenticate, defineMiddlewares } from "@medusajs/medusa";
import { adminProductOptionSortMiddlewares } from "./admin/middlewares";
import { AssignTaxCodeValidator } from "./admin/validators";
import { storeCartRoutesMiddlewares } from "./store/carts/middlewares";
import { storePromotionalPricesRoutesMiddlewares } from "./store/promotional-prices/middlewares";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/product/:productId/tax_code",
      method: ["POST"],
      middlewares: [validateAndTransformBody(AssignTaxCodeValidator)],
    },
    {
      matcher: "/admin/notification-preferences*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    ...adminProductOptionSortMiddlewares,
    ...storeCartRoutesMiddlewares,
    ...storePromotionalPricesRoutesMiddlewares,
  ],
});
