import { model } from "@medusajs/framework/utils";
import { InferTypeOf } from "@medusajs/framework/types";

const Color = model.define("color", {
  id: model.id().primaryKey(),
  name: model.text(),
  hex_code: model.text().nullable(),
  media: model.text().nullable(),
});

export type ColorModelType = InferTypeOf<typeof Color>;

export default Color;
