import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  updateOrderWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
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
        "created_at",
        "shipping_total",
        "shipping_tax_total",
        "tax_total",
        "total",
        "customer.id",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "shipping_address.province",
        "items.id",
        "items.quantity",
        "items.product_id",
        "items.product_description",
        "items.product.tax_code.*",
        "items.unit_price",
        "items.discount_total",
        "items.discount_tax_total",
        "items.tax_total",
      ],
      filters: {
        id: input.id,
      },
    });

    const transactionInput = transform({ orders }, ({ orders }) => {
      const order = orders[0];
      const lineItems = order.items?.map((item) => {
        return {
          id: item?.id ?? "",
          quantity: item?.quantity ?? 0,
          product_identifier: item?.product_id ?? "",
          description: item?.product_description ?? "",
          product_tax_code: item?.product?.tax_code?.code ?? "",
          unit_price: item?.unit_price ?? 0,
          discount:
            (item?.discount_total ?? 0) - (item?.discount_tax_total ?? 0),
          sales_tax: item?.tax_total ?? 0,
        } satisfies LineItem;
      });
      const input: CreateOrderParams = {
        transaction_id: "Taxjar-" + order.id,
        transaction_date:
          (order.created_at as string) ?? new Date().toISOString(),
        provider: "medusa",
        to_country: order?.shipping_address?.country_code?.toUpperCase() ?? "",
        to_zip: order?.shipping_address?.postal_code ?? "",
        to_state: order?.shipping_address?.province ?? "",
        to_city: order?.shipping_address?.city ?? "",
        to_street: order?.shipping_address?.address_1 ?? "",
        amount: order.total - order.tax_total, // Total amount of the order with shipping, excluding sales tax in dollars
        line_items: lineItems ?? [],
        shipping: order.shipping_total - order.shipping_tax_total, // Total amount of shipping for the order in dollars.
        sales_tax: order.tax_total, // Total amount of sales tax collected for the order in dollars.
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
