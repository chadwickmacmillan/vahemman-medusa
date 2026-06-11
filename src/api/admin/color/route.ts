import { z } from "@medusajs/framework/zod";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { IFileModuleService } from "@medusajs/framework/types";
import { COLOR_SERVICE } from "../../../modules/color";
import ColorService from "../../../modules/color/service";

const materialsListQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  deleted: z.coerce.boolean().optional().default(false),
});

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { page, deleted } = materialsListQuerySchema.parse(req.query);

  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  const [colors, count] = await service.listAndCountColors(
    deleted
      ? {
          deleted_at: { $lte: new Date() },
        }
      : undefined,
    {
      skip: 20 * (page - 1),
      take: 20,
      withDeleted: deleted,
    },
  );

  const last_page = Math.ceil(count / 20);

  const fileService = req.scope.resolve(Modules.FILE) as IFileModuleService;

  const colorsWithUrl = await Promise.all(
    colors.map(async (color) => {
      if (!color.media) return color;
      const file = await fileService.retrieveFile(color.media);
      return { ...color, media_url: file.url };
    }),
  );

  res.status(200).json({ colors: colorsWithUrl, count, page, last_page });
};

const createColorBodySchema = z.object({
  name: z.string(),
  hex_code: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullable(),
  media: z.string().nullable(),
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  const validatedData = createColorBodySchema.parse(req.body);

  const color = await service.createColors(validatedData);

  res.status(201).json(color);
};
