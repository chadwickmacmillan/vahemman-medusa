import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { CreateRefundParams, LineItem } from "taxjar/dist/types/paramTypes";
import { createRefundStep } from "./steps/create-refund";

type WorkflowInput = {
  id: string;
};

export const createRefundTransactionWorkflow = createWorkflow(
  "create-refund-transaction-workflow",
  (input: WorkflowInput) => {
    const { data: paymentCollections } = useQueryGraphStep({
      entity: "payment_collection",
      fields: [
        "order.id",
        "order.created_at",
        "order.shipping_total",
        "order.shipping_tax_total",
        "order.tax_total",
        "order.total",
        "order.customer.id",
        "order.shipping_address.address_1",
        "order.shipping_address.address_2",
        "order.shipping_address.city",
        "order.shipping_address.postal_code",
        "order.shipping_address.country_code",
        "order.shipping_address.province",
        "order.items.id",
        "order.items.quantity",
        "order.items.product_id",
        "order.items.product_description",
        "order.items.product.tax_code.*",
        "order.items.unit_price",
        "order.items.discount_total",
        "order.items.discount_tax_total",
        "order.items.tax_total",
        "payments.id", // payments in this collection
        "payments.refunds.id",
        "payments.refunds.amount",
        "payments.refunds.created_at",
      ],
      filters: {
        payments: {
          id: input.id,
        },
      },
    });

    const transactionInput = transform(
      { paymentCollections },
      ({ paymentCollections }) => {
        const paymentCollection = paymentCollections[0];
        const { order } = paymentCollection;

        const refund = paymentCollection.payments?.[0]?.refunds?.sort((a, b) =>
          a && b
            ? (a.created_at as string).localeCompare(b.created_at as string)
            : 0
        )?.[0];

        const lineItems = order?.items?.map((item) => {
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
        const input: CreateRefundParams = {
          transaction_id: refund?.id ?? "",
          transaction_reference_id: order?.id ?? "",
          transaction_date:
            refund && typeof refund.created_at === "string"
              ? refund.created_at
              : new Date().toISOString(),
          to_country:
            order?.shipping_address?.country_code?.toUpperCase() ?? "",
          to_zip: order?.shipping_address?.postal_code ?? "",
          to_state: order?.shipping_address?.province ?? "",
          to_city: order?.shipping_address?.city ?? "",
          to_street: order?.shipping_address?.address_1 ?? "",
          amount: (order?.total ?? 0) - (order?.tax_total ?? 0), // Total amount of the order with shipping, excluding sales tax in dollars
          line_items: lineItems ?? [],
          shipping:
            (order?.shipping_total ?? 0) - (order?.shipping_tax_total ?? 0), // Total amount of shipping for the order in dollars.
          sales_tax: order?.tax_total ?? 0, // Total amount of sales tax collected for the order in dollars.
          customer_id: order?.customer?.id ?? "",
        };
        return input;
      }
    );

    const response = createRefundStep(transactionInput);

    return new WorkflowResponse(response);
  }
);
