import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import TaxjarTaxModuleProvider from "../../../modules/taxjar/service";
import { CreateRefundParams } from "taxjar/dist/types/paramTypes";

type StepInput = CreateRefundParams;

export const createRefundStep = createStep(
  "create-refund",
  async (input: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    const response = await taxjarProviderService.createRefund(input);

    return new StepResponse(response, response);
  },
  async (data, { container }) => {
    if (!data?.refund?.transaction_id) {
      return;
    }
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    await taxjarProviderService.deleteRefund(data.refund.transaction_id);
  }
);
