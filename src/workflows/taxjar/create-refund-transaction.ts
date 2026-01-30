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

type WorkflowInput = {
  refund_id: string;
};

export const createRefundTransactionWorkflow = createWorkflow(
  "create-refund-transaction-workflow",
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

    const { data: orders } = useQueryGraphStep({
      entity: "order",
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
      filters: {},
    });

    const transactionInput = transform(
      { refunds, orders },
      ({ refunds, orders }) => {
        const providerId = `tp_${TaxjarTaxModuleProvider.identifier}_taxjar`;
        const lineItems = orders[0]?.items?.map((item) => {
          return {
            id: item?.id ?? "",
            quantity: item?.quantity ?? 0,
            product_identifier: item?.product_id ?? "",
            description: item?.product_description ?? "",
            product_tax_code:
              item?.tax_lines?.find(
                (taxLine) => taxLine?.provider_id === providerId
              )?.code ?? "",
            unit_price: item?.unit_price ?? 0,
            discount:
              (item?.discount_total ?? 0) - (item?.discount_tax_total ?? 0),
            sales_tax: item?.tax_total ?? 0,
          } satisfies LineItem;
        });
        const input: CreateRefundParams = {
          transaction_id: "taxjar_refund-" + (orders[0]?.id ?? ""),
          transaction_date:
            (refunds[0]?.created_at as string) ?? new Date().toISOString(),
          to_country:
            orders[0]?.shipping_address?.country_code?.toUpperCase() ?? "",
          to_zip: orders[0]?.shipping_address?.postal_code ?? "",
          to_state: orders[0]?.shipping_address?.province ?? "",
          to_city: orders[0]?.shipping_address?.city ?? "",
          to_street: orders[0]?.shipping_address?.address_1 ?? "",
          amount: orders[0]?.total - orders[0]?.tax_total, // Total amount of the order with shipping, excluding sales tax in dollars
          line_items: lineItems ?? [],
          shipping: orders[0]?.shipping_total - orders[0]?.shipping_tax_total, // Total amount of shipping for the order in dollars.
          sales_tax: orders[0]?.tax_total, // Total amount of sales tax collected for the order in dollars.
          customer_id: orders[0]?.customer?.id ?? "",
        };
        return input;
      }
    );

    const response = updateTransactionStep(transactionInput);

    const order = updateOrderWorkflow.runAsStep({
      input: {
        id: input.order_id,
        user_id: "",
        metadata: {
          taxjar_transaction_id: response.order.transaction_id,
        },
      },
    });

    return new WorkflowResponse(order);
  }
);
