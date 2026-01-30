import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import TaxjarTaxModuleProvider from "../../../modules/taxjar/service";
import { UpdateOrderParams } from "taxjar/dist/types/paramTypes";

type StepInput = UpdateOrderParams;

export const updateTransactionStep = createStep(
  "update-transaction",
  async (input: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    const response = await taxjarProviderService.updateTransaction(input);

    return new StepResponse(response, response);
  }
);
