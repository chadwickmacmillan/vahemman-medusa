import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { sdk } from "../lib/sdk";
import { FileType } from "../components/FileUpload";

const uploadMedia = async (files: FileType[]): Promise<string> => {
  const { files: uploadedFiles } = await sdk.admin.upload.create({
    files: files.map((f) => f.file),
  });
  return uploadedFiles[0].id;
};

export const useCreateColorMutation = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["color"],
    mutationFn: async (values) => {
      const media = values.media.length > 0 ? await uploadMedia(values.media) : null;
      return sdk.client.fetch(`/admin/color`, {
        method: "post",
        body: { ...values, media },
      });
    },
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
    mutationFn: async () => {
      const color = await sdk.client.fetch(`/admin/color/${id}`);

      if (color.media) {
        await sdk.client.fetch(`/admin/uploads/${color.media}`, {
          method: "delete",
        });
      }
      await sdk.client.fetch(`/admin/color/${id}`, {
        method: "delete",
      });
    },
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
    mutationFn: async (values: any) => {
      const color = await sdk.client.fetch(`/admin/color/${id}`);
      let media = color.media;

      if (values.mediaChange) {
        if (color.media) {
          await sdk.admin.upload.delete(color.media);
        }

        media =
          values.media.length > 0 ? await uploadMedia(values.media) : null;
      }

      return sdk.client.fetch(`/admin/color/${id}`, {
        method: "post",
        body: { ...values, media },
      });
    },
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
    queryFn: async ({ signal }) => {
      return await sdk.client.fetch(`/admin/product/${id}/color`, {
        signal,
      });
    },
  });
};
