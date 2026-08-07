import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  MiddlewareRoute,
} from "@medusajs/framework/http";
import { withSortedProductOptions } from "../utils/product-option-sort";

/**
 * Applies the option / option value ordering to the response on its way out,
 * so every admin surface that reads these routes (the product detail page's
 * Options section, the "Manage options" drawer, the Product Options pages)
 * sees the same order without patching the dashboard.
 */
const sortProductOptions = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) => {
  const json = res.json.bind(res);

  res.json = (body: unknown) => json(withSortedProductOptions(body));

  next();
};

export const adminProductOptionSortMiddlewares: MiddlewareRoute[] = [
  {
    methods: ["GET", "POST"],
    matcher: "/admin/products*",
    middlewares: [sortProductOptions],
  },
  {
    methods: ["GET", "POST"],
    matcher: "/admin/product-options*",
    middlewares: [sortProductOptions],
  },
];
