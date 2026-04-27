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

export const useToggleNotificationPreference = (
  options?: UseMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, enabled }) =>
      sdk.client.fetch(`/admin/notification-preferences/${type}`, {
        method: "post",
        body: { enabled },
      }),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: [`notification_preferences`],
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useNotificationPreferences = (
  options?: Omit<
    UseQueryOptions<
      Record<any, any>,
      FetchError,
      { preferences: Record<any, any>[] },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) => {
  const fetchNotificationPreferences = async () => {
    return await sdk.client.fetch<Record<any, any>>(
      "/admin/notification-preferences",
    );
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchNotificationPreferences(),
    queryKey: [`notification_preferences`],
    ...options,
  });

  return { ...data, ...rest };
};
