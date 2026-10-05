import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/framework/http";
import { StorePromotionalPrices } from "./validators";

export const storePromotionalPricesRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/promotional-prices",
    middlewares: [validateAndTransformBody(StorePromotionalPrices)],
  },
];
