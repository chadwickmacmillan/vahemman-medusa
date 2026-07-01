import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import {
  IFileModuleService,
  IProductModuleService,
} from "@medusajs/framework/types";
import { COLOR_SERVICE } from "../../../../../modules/color";
import ColorService from "../../../../../modules/color/service";

/**
 * Returns the color records for a product option's values (matched by name),
 * plus the value names that don't have a color record yet. Mirrors
 * /admin/product/[id]/color, but scoped to a (global) option instead of a
 * single product's variants — used by the Color option admin widget.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const optionId = req.params.id;

  const productService = req.scope.resolve(
    Modules.PRODUCT,
  ) as IProductModuleService;

  const colorService = req.scope.resolve(COLOR_SERVICE) as ColorService;
  const fileService = req.scope.resolve(Modules.FILE) as IFileModuleService;

  const option = await productService.retrieveProductOption(optionId, {
    relations: ["values"],
  });

  const optionColors = Array.from(
    new Set((option.values ?? []).map((value) => value.value)),
  );

  const colors = optionColors.length
    ? await colorService.listColors({ name: optionColors })
    : [];

  const colorsWithUrl = await Promise.all(
    colors.map(async (color) => {
      if (!color.media) return color;
      const file = await fileService.retrieveFile(color.media);
      return { ...color, media_url: file.url };
    }),
  );

  res.status(200).json({
    colors: colorsWithUrl,
    missing_colors: optionColors.filter(
      (name) => !colors.some((color) => color.name === name),
    ),
  });
};
