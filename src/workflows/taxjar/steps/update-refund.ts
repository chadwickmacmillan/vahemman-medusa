import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import TaxjarTaxModuleProvider from "../../../modules/taxjar/service";
import { UpdateRefundParams } from "taxjar/dist/types/paramTypes";

type StepInput = UpdateRefundParams;

export const updateRefundStep = createStep(
  "update-refund",
  async (input: StepInput, { container }) => {
    const taxModuleService = container.resolve("tax");
    const taxjarProviderService = taxModuleService.getProvider(
      `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`
    ) as TaxjarTaxModuleProvider;

    const response = await taxjarProviderService.updateRefund(input);

    return new StepResponse(response, response);
  }
);
