import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { FetchError } from "@medusajs/js-sdk";
import { sdk } from "../lib/sdk";

export const useTaxCode = (
  id: string,
  query?: Record<any, any>,
  options?: Omit<
    UseQueryOptions<
      Record<any, any>,
      FetchError,
      { sanity_document: Record<any, any>; studio_url: string },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const fetchTaxCode = async (query?: Record<any, any>) => {
    return await sdk.client.fetch<Record<any, any>>(
      `/admin/category/${id}/taxcode`,
      {
        query,
      }
    );
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchTaxCode(query),
    queryKey: [`taxcode_${id}`],
    ...options,
  });

  return { ...data, ...rest };
};

// export const useTriggerSanitySync = (options?: UseMutationOptions) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: () =>
//       sdk.client.fetch(`/admin/sanity/syncs`, {
//         method: "post",
//       }),
//     onSuccess: (data: any, variables: any, context: any) => {
//       queryClient.invalidateQueries({
//         queryKey: [`sanity_sync`],
//       });

//       options?.onSuccess?.(data, variables, context);
//     },
//     ...options,
//   });
// };

export const useTaxCodes = (
  query?: Record<any, any>,
  options?: Omit<
    UseQueryOptions<
      Record<any, any>,
      FetchError,
      { sanity_document: Record<any, any>; studio_url: string },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const fetchTaxCodes = async (query?: Record<any, any>) => {
    return await sdk.client.fetch<Record<any, any>>(`/admin/taxcodes`, {
      query,
    });
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchTaxCodes(query),
    queryKey: [`taxcodes`],
    ...options,
  });

  return { ...data, ...rest };
};
