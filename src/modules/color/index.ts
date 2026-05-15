import { Module } from "@medusajs/framework/utils";
import ColorModuleService from "./service";

export const COLOR_SERVICE = "color";

export default Module(COLOR_SERVICE, {
  service: ColorModuleService,
});
