import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { FetchError } from "@medusajs/js-sdk";
import { sdk } from "../lib/sdk";

type Notification = {
  id: string;
  to: string;
  channel: string;
  template: string;
  status: string;
  created_at: string;
  data: Record<string, unknown>;
};

type NotificationsResponse = {
  notifications: Notification[];
  count: number;
};

export const useOrderNotifications = (
  orderId: string,
  options?: Omit<
    UseQueryOptions<
      NotificationsResponse,
      FetchError,
      NotificationsResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      sdk.client.fetch<NotificationsResponse>(`/admin/notifications`, {
        query: {
          resource_type: "order",
          resource_id: orderId,
          order: "-created_at",
          limit: 20,
        },
      }),
    queryKey: [`order_notifications_${orderId}`],
    ...options,
  });

  return {
    notifications: data?.notifications ?? [],
    count: data?.count ?? 0,
    ...rest,
  };
};
