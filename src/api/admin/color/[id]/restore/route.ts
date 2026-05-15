import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { COLOR_SERVICE } from "../../../../../modules/color";
import ColorService from "../../../../../modules/color/service";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(COLOR_SERVICE) as ColorService;

  await service.restoreColors(req.params.id);

  const color = await service.retrieveColor(req.params.id, {
    withDeleted: true,
  });

  res.status(200).json(color);
};
