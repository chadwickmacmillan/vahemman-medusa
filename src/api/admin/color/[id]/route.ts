import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { COLOR_SERVICE } from "../../../../modules/color";
import ColorService from "../../../../modules/color/service";
import { z } from "@medusajs/framework/zod";
import { Modules } from "@medusajs/framework/utils";
import { IFileModuleService } from "@medusajs/framework/types";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  const color = await service.retrieveColor(req.params.id, {
    withDeleted: true,
  });
  res.status(200).json(color);
};

const colorsUpdateBodySchema = z.object({
  name: z.string(),
  hex_code: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullable(),
  media: z.string().nullable(),
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  const validatedData = colorsUpdateBodySchema.parse(req.body);

  const color = await service.updateColors({
    ...validatedData,
    id: req.params.id,
  });

  res.status(200).json(color);
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  await service.updateColors({ media: null, id: req.params.id });
  await service.softDeleteColors(req.params.id);

  const deleted = await service.retrieveColor(req.params.id, {
    withDeleted: true,
  });

  res.status(200).json(deleted);
};
