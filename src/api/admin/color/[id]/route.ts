import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { COLOR_SERVICE } from "../../../../modules/color";
import ColorService from "../../../../modules/color/service";
import { z } from "@medusajs/framework/zod";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  const color = await service.retrieveColor(req.params.id, {
    withDeleted: true,
  });
  res.status(200).json(color);
};

const colorsUpdateBodySchema = z.object({
  name: z.string().min(1),
  hex_code: z
    .string()
    .min(1)
    .transform((val) => val.toUpperCase())
    .refine((val) => /^#([A-F0-9]{6}|[A-F0-9]{3})$/.test(val), {
      message: "Invalid hex code",
    }),
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

  await service.softDeleteColors(req.params.id);

  const color = await service.retrieveColor(req.params.id, {
    withDeleted: true,
  });

  res.status(200).json(color);
};
