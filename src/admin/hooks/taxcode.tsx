import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import { FetchError } from "@medusajs/js-sdk";
import { sdk } from "../lib/sdk";

import { TaxCode } from "../../modules/tax_code/types";

export const useTaxCode = (
  id: string,
  query?: Record<any, any>,
  options?: Omit<
    UseQueryOptions<
      Record<any, any>,
      FetchError,
      { tax_code: TaxCode },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const fetchTaxCode = async (query?: Record<any, any>) => {
    return await sdk.client.fetch<Record<any, any>>(
      `/admin/product/${id}/tax_code`,
      {
        query,
      }
    );
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchTaxCode(query),
    queryKey: [`tax_code_product_${id}`],
    ...options,
  });

  return { ...data, ...rest };
};

export const useTaxCodes = (
  query?: Record<any, any>,
  options?: Omit<
    UseQueryOptions<
      Record<any, any>,
      FetchError,
      { tax_codes: TaxCode[] },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const fetchTaxCodes = async (query?: Record<any, any>) => {
    return await sdk.client.fetch<{ tax_codes: TaxCode[] }>(
      `/admin/tax_codes`,
      {
        query,
      }
    );
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchTaxCodes(query),
    queryKey: [`tax_codes`],
    ...options,
  });

  return { ...data, ...rest };
};

export const useTriggerTaxCodeProductSave = (
  productId: string,
  taxCodeId: string,
  options?: UseMutationOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/product/${productId}/tax_code`, {
        method: "post",
        body: { taxCodeId },
      }),
    onSuccess: (data: unknown, variables: void, context: unknown) => {
      queryClient.invalidateQueries({
        queryKey: [`tax_code_product_${productId}`],
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
