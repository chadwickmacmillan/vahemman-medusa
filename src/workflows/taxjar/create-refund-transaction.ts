import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import TaxjarTaxModuleProvider from "../../modules/taxjar/service";
import { CreateRefundParams, LineItem } from "taxjar/dist/types/paramTypes";
import { createRefundStep } from "./steps/create-refund";
import { PaymentSessionStatus } from "@medusajs/framework/utils";

type WorkflowInput = {
  id: string;
};

export const createRefundTransactionWorkflow = createWorkflow(
  "create-refund-transaction-workflow",
  (input: WorkflowInput) => {
    const { data: paymentCollections } = useQueryGraphStep({
      entity: "payment_collection",
      fields: [
        "order.items.id",
        "order.items.quantity",
        "order.items.product_id",
        "order.items.product_description",
        "order.items.unit_price",
        "order.items.tax_lines.id",
        "order.items.tax_lines.description",
        "order.items.tax_lines.code",
        "order.items.tax_lines.rate",
        "order.items.tax_lines.provider_id",
        "order.items.variant.sku",
        "order.shipping_methods.id",
        "order.shipping_methods.amount",
        "order.shipping_methods.tax_lines.id",
        "order.shipping_methods.tax_lines.description",
        "order.shipping_methods.tax_lines.code",
        "order.shipping_methods.tax_lines.rate",
        "order.shipping_methods.tax_lines.provider_id",
        "order.shipping_methods.shipping_option_id",
        "order.customer.id",
        "order.customer.email",
        "order.customer.metadata",
        "order.customer.groups.id",
        "sorder.hipping_address.id",
        "order.shipping_address.address_1",
        "order.shipping_address.address_2",
        "order.shipping_address.city",
        "order.shipping_address.postal_code",
        "order.shipping_address.country_code",
        "order.shipping_address.region_code",
        "order.shipping_address.province",
        "order.shipping_address.metadata",
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
        const [paymentCollection] = paymentCollections;
        const { order } = paymentCollection;

        const refund = paymentCollection.payments?.[0]?.refunds?.[0];

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
