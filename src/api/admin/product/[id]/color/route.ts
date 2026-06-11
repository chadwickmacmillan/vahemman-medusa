import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import {
  IFileModuleService,
  IProductModuleService,
} from "@medusajs/framework/types";
import { COLOR_SERVICE } from "../../../../../modules/color";
import ColorService from "../../../../../modules/color/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productId = req.params.id;

  const productService = req.scope.resolve(
    Modules.PRODUCT,
  ) as IProductModuleService;

  const colorService = req.scope.resolve(COLOR_SERVICE) as ColorService;
  const fileService = req.scope.resolve(Modules.FILE) as IFileModuleService;

  const product = await productService.retrieveProduct(productId, {
    relations: ["options", "variants", "variants.options"],
  });

  const colorOption = product.options.find(
    (option) => option.title === "Color",
  );

  const productColors = Array.from(
    new Set(
      product.variants.flatMap((variant) =>
        variant.options
          .filter((option) => option.option_id === colorOption?.id)
          .map((option) => option.value),
      ),
    ),
  );

  const colors = await colorService.listColors({ name: productColors });

  const colorsWithUrl = await Promise.all(
    colors.map(async (color) => {
      if (!color.media) return color;
      const file = await fileService.retrieveFile(color.media);
      return { ...color, media_url: file.url };
    }),
  );

  res.status(200).json({
    colors: colorsWithUrl,
    missing_colors: productColors.filter(
      (name) => !colors.some((color) => color.name === name),
    ),
  });
};
