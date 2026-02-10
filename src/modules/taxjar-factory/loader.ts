import { LoaderOptions } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  TaxjarClientFactory,
  TaxjarConnectionValidator,
  TaxjarOptionsValidator,
} from "../../services";
import { asValue } from "awilix";

export default async function taxjarFactoryLoader({
  options,
  container,
}: LoaderOptions<Record<string, unknown>>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  if (process.argv.includes("db:migrate")) {
    return logger.debug(
      "Skipping Taxjar connection validation during migration"
    );
  }

  if (!(options && typeof options === "object")) {
    throw new Error("Taxjar options must be provided");
  }

  if (!TaxjarOptionsValidator.validateOptions(options)) {
    throw new Error("Taxjar plugin options are invalid");
  }

  const client = new TaxjarClientFactory(logger, options).getClient();
  const connectionValidator = new TaxjarConnectionValidator(
    logger,
    client,
    options
  );
  await connectionValidator.validateConnection();

  container.register("taxjarClient", asValue(client));
}
