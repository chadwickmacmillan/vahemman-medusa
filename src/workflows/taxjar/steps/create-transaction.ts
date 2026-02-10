import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import TaxjarTaxModuleProvider from "../../../providers/taxjar/service";
import { CreateOrderParams } from "taxjar/dist/types/paramTypes";

type StepInput = CreateOrderParams;

export const createTransactionStep = createStep(
  "create-transaction",
  async (input: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    const response = await taxjarProviderService.createTransaction(input);

    return new StepResponse(response, {
      transaction_id: response.transaction_id,
    });
  },
  async (data, { container }) => {
    if (!data?.transaction_id) {
      return;
    }
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    await taxjarProviderService.deleteTransaction(data.transaction_id);
  }
);
