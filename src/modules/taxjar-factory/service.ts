import { MedusaService } from "@medusajs/framework/utils";
import TaxjarClient from "taxjar";
import { TaxjarPluginOptions, InjectedDependencies } from "../../types";
import { TaxjarConverter } from "../../services";

export class TaxjarFactoryService extends MedusaService({}) {
  private readonly client: TaxjarClient;
  private readonly converter: TaxjarConverter;
  private readonly options: TaxjarPluginOptions;

  constructor(container: InjectedDependencies, options: TaxjarPluginOptions) {
    super(container);
    this.client = container.taxjarClient;
    this.converter = new TaxjarConverter(
      container.cache,
      container.logger,
      options
    );
    this.options = options;
  }

  getClient(): TaxjarClient {
    return this.client;
  }

  getConverter(): TaxjarConverter {
    return this.converter;
  }

  getOptions(): TaxjarPluginOptions {
    return this.options;
  }
}

export default TaxjarFactoryService;
