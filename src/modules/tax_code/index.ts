import { Module } from "@medusajs/framework/utils";
import TaxCodeService from "./service";

export const TAX_CODE_SERVICE = "tax_code";

export default Module(TAX_CODE_SERVICE, {
  service: TaxCodeService,
});
