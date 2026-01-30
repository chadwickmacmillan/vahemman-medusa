import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import TaxjarTaxModuleProvider from "../../../modules/taxjar/service";

type StepInput = string;

export const deleteTransaction = createStep(
  "delete-transaction",
  async (input: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    const response = await taxjarProviderService.deleteTransaction(input);

    return new StepResponse(response, response);
  }
);
