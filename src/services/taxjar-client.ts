import { LogLevel } from "avatax/lib/utils/logger";
import { Logger } from "@medusajs/framework/types";
import TaxjarClient from "taxjar";
import { TaxjarPluginOptions } from "../types/taxjarPluginOptions";

export class TaxjarClientFactory {
  private client: TaxjarClient;
  private readonly pluginVersion: string;

  constructor(
    private readonly logger: Logger,
    private readonly options: TaxjarPluginOptions
  ) {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = new TaxjarClient({
      apiKey: this.options.apiKey,
    });

    this.logger.info(`Taxjar client initialized.`);
  }

  getClient(): TaxjarClient {
    return this.client;
  }
}
