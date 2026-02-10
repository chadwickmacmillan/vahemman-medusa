import { Module } from "@medusajs/framework/utils";
import { TaxjarFactoryService } from "./service";
import taxjarFactoryLoader from "./loader";

export const TAXJAR_FACTORY_MODULE = "taxjar_factory_module";

export default Module(TAXJAR_FACTORY_MODULE, {
  service: TaxjarFactoryService,
  loaders: [taxjarFactoryLoader],
});
