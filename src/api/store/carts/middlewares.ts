import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/framework/http";
import * as QueryConfig from "./query-config";
import { StoreCalculateCartTaxes, StoreGetCartsCart } from "./validators";

export const storeCartRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/carts/:id/taxes_with_tax_codes",
    middlewares: [
      validateAndTransformBody(StoreCalculateCartTaxes),
      validateAndTransformQuery(
        StoreGetCartsCart,
        QueryConfig.retrieveTransformQueryConfig
      ),
    ],
  },
];
