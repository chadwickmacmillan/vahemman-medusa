import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  updateOrderWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import TaxjarTaxModuleProvider from "../../providers/taxjar/service";
import { createTransactionStep } from "./steps/create-transaction";
import { CreateOrderParams, LineItem } from "taxjar/dist/types/paramTypes";

type WorkflowInput = {
  id: string;
};

export const createOrderTransactionWorkflow = createWorkflow(
  "create-order-transaction-workflow",
  (input: WorkflowInput) => {
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
      filters: {
        id: input.id,
      },
    });

    const transactionInput = transform({ orders }, ({ orders }) => {
      const [order] = orders;
      const lineItems = order?.items?.map((item) => {
        return {
          id: item?.id ?? "",
          quantity: item?.quantity ?? 0,
          product_identifier: item?.product_id ?? "",
          description: item?.product_description ?? "",
          product_tax_code: "", // TODO
          unit_price: item?.unit_price ?? 0,
          discount:
            (item?.discount_total ?? 0) - (item?.discount_tax_total ?? 0),
          sales_tax: item?.tax_total ?? 0,
        } satisfies LineItem;
      });
      const input: CreateOrderParams = {
        transaction_id: "Taxjar-" + (order?.id ?? ""),
        transaction_date:
          (order?.created_at as string) ?? new Date().toISOString(),
        provider: "medusa",
        to_country: order?.shipping_address?.country_code?.toUpperCase() ?? "",
        to_zip: order?.shipping_address?.postal_code ?? "",
        to_state: order?.shipping_address?.province ?? "",
        to_city: order?.shipping_address?.city ?? "",
        to_street: order?.shipping_address?.address_1 ?? "",
        amount: order?.total - order?.tax_total, // Total amount of the order with shipping, excluding sales tax in dollars
        line_items: lineItems ?? [],
        shipping: order?.shipping_total - order?.shipping_tax_total, // Total amount of shipping for the order in dollars.
        sales_tax: order?.tax_total, // Total amount of sales tax collected for the order in dollars.
        customer_id: order?.customer?.id ?? "",
      };
      return input;
    });

    const response = createTransactionStep(transactionInput);

    const order = updateOrderWorkflow.runAsStep({
      input: {
        id: input.id,
        user_id: "",
        metadata: {
          taxjar_transaction_id: response.transaction_id,
        },
      },
    });

    return new WorkflowResponse(order);
  }
);
