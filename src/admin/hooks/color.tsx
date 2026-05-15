import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { sdk } from "../lib/sdk";

export const useCreateColorMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["color"],
    mutationFn: async (colorObj) =>
      await sdk.client.fetch(`/admin/color`, {
        method: "post",
        body: colorObj,
      }),
    onSuccess: async (data: any, variables: any, context: any) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("color"),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteColorMutation = (
  id: string,
  options?: UseMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationKey: [`color_${id}`],
    mutationFn: async () =>
      await sdk.client.fetch(`/admin/color/${id}`, {
        method: "delete",
      }),
    onSuccess: async (data: any, variables: any, context: any) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("color"),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useRestoreColorMutation = (
  id: string,
  options?: UseMutationOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationKey: [`color_${id}`],
    mutationFn: async () =>
      await sdk.client.fetch(`/admin/color/${id}/restore`, {
        method: "post",
      }),
    onSuccess: async (data: any, variables: any, context: any) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("color"),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateColorMutation = (
  id: string,
  options?: UseMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationKey: [`color_${id}`],
    mutationFn: async (values) =>
      await sdk.client.fetch(`/admin/color/${id}`, {
        method: "post",
        body: values,
      }),
    onSuccess: async (data: any, variables: any, context: any) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("color"),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useColors = (page: number, deleted?: boolean) => {
  return useQuery({
    queryKey: ["color", { deleted, page }],
    queryFn: async () =>
      await sdk.client.fetch(`/admin/color`, {
        query: {
          deleted: deleted ? "true" : undefined,
          page,
        },
      }),
  });
};

export const useProductColors = (id: string) => {
  return useQuery({
    queryKey: [`product_${id}`, `color`],
    queryFn: async ({ signal }) =>
      await sdk.client.fetch(`/admin/product/${id}/color`, { signal }),
  });
};
