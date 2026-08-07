import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "../lib/sdk";
import {
  buildProductOptionOrder,
  PRODUCT_OPTION_ORDER_METADATA_KEY,
} from "../../api/utils/product-option-sort";

type SaveOptionOrderInput = {
  product: HttpTypes.AdminProduct;
  /** The product's options in display order, each with its values in order. */
  options: HttpTypes.AdminProductOption[];
};

/**
 * Saves a product's own option and value ordering to
 * `product.metadata.option_order`. Nothing global is touched, so the same
 * options ordered differently on another product are unaffected.
 */
export const useUpdateProductOptionOrderMutation = (
  options?: UseMutationOptions<void, Error, SaveOptionOrderInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationKey: ["products", "option_order"],
    mutationFn: async ({ product, options: orderedOptions }) => {
      // A product update replaces metadata wholesale, so carry the rest over.
      await sdk.admin.product.update(product.id, {
        metadata: {
          ...(product.metadata ?? {}),
          [PRODUCT_OPTION_ORDER_METADATA_KEY]:
            buildProductOptionOrder(orderedOptions),
        },
      });
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("products"),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
};
