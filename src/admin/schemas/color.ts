import { z } from "@medusajs/framework/zod";

export const addColorFormSchema = z
  .object({
    name: z.string().min(1),
    hex_code: z.string().min(7).max(7).nullable(),
    media: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        file: z.file(),
      }),
    ),
  })
  .refine((data) => data.hex_code !== null || data.media.length > 0, {
    message: "Image or hex code must be provided",
  });

export const editColorFormSchema = z
  .object({
    name: z.string().min(1),
    hex_code: z.string().min(7).max(7).nullable(),
    media: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        file: z.file(),
      }),
    ),
  })
  .refine((data) => data.hex_code !== null || data.media.length > 0, {
    message: "Image or hex code must be provided",
  });
