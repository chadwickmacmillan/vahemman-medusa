import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  updateOrderWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import TaxjarTaxModuleProvider from "../../modules/taxjar/service";
import { CreateRefundParams, LineItem } from "taxjar/dist/types/paramTypes";
import { updateTransactionStep } from "./steps/update-transaction";
import { deleteRefundStep } from "./steps/delete-refund";

type WorkflowInput = {
  refund_id: string;
};

export const deleteRefundTransactionWorkflow = createWorkflow(
  "delete-refund-transaction-workflow",
  (input: WorkflowInput) => {
    const { data: refunds } = useQueryGraphStep({
      entity: "refund",
      fields: [
        "id",
        "currency_code",
        "items.quantity",
        "items.id",
        "items.unit_price",
        "items.product_id",
        "items.tax_lines.id",
        "items.tax_lines.description",
        "items.tax_lines.code",
        "items.tax_lines.rate",
        "items.tax_lines.provider_id",
        "items.variant.sku",
        "shipping_methods.id",
        "shipping_methods.amount",
        "shipping_methods.tax_lines.id",
        "shipping_methods.tax_lines.description",
        "shipping_methods.tax_lines.code",
        "shipping_methods.tax_lines.rate",
        "shipping_methods.tax_lines.provider_id",
        "shipping_methods.shipping_option_id",
        "customer.id",
        "customer.email",
        "customer.metadata",
        "customer.groups.id",
        "shipping_address.id",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "shipping_address.region_code",
        "shipping_address.province",
        "shipping_address.metadata",
      ],
      filters: {
        id: input.refund_id,
      },
    });

    const refundInput = transform({ refunds }, ({ refunds }) => {
      const input = refunds[0]?.id;
      return input;
    });

    const response = deleteRefundStep(transactionInput);

    const order = updateOrderWorkflow.runAsStep({
      input: {
        id: input.order_id,
        user_id: "",
        metadata: {
          taxjar_transaction_id: response.order.transaction_id,
          taxjar_refund_transaction_id: response.
        },
      },
    });

    return new WorkflowResponse(order);
  }
);
