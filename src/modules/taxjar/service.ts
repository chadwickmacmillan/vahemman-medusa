import { ITaxProvider, TaxTypes } from "@medusajs/framework/types";
import Taxjar from "taxjar";
import { MedusaError } from "@medusajs/framework/utils";
import {
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
} from "@medusajs/framework/types";
import { ModuleOptions } from "./types";
import { Logger } from "@medusajs/medusa";
import {
  CreateOrderParams,
  CreateRefundParams,
  TaxLineItem,
  UpdateOrderParams,
  UpdateRefundParams,
} from "taxjar/dist/types/paramTypes";

type InjectedDependencies = {
  logger: Logger;
};

class TaxjarTaxModuleProvider implements ITaxProvider {
  static identifier = "taxjar";
  protected logger_: Logger;
  protected options_: ModuleOptions;
  protected client: Taxjar;

  constructor({ logger }: InjectedDependencies, options: ModuleOptions) {
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Taxjar module options are required: apiKey"
      );
    }
    this.logger_ = logger;
    this.options_ = options;

    // assuming you're initializing a client
    this.client = new Taxjar(options);
  }

  getIdentifier(): string {
    return TaxjarTaxModuleProvider.identifier;
  }
  async getTaxLines(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext
  ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
    try {
      const taxLineItems: TaxLineItem[] = await Promise.all(
        itemLines.map(async (item) => {
          return {
            id: item.line_item.id,
            discount: 0,
            quantity: Number(item.line_item.quantity?.toString()),
            unit_price: Number(item.line_item.unit_price?.toString()),
            product_tax_code: "", // TODO,
          };
        })
      );

      const shipping = shippingLines.reduce((acc, l) => {
        return (acc += Number(l.shipping_line.unit_price?.toString()));
      }, 0);
      const { tax } = await this.client.taxForOrder({
        to_country: context.address.country_code,
        to_zip: context.address.postal_code,
        to_state: context.address.province_code ?? undefined,
        to_city: context.address.city,
        to_street: context.address.address_1,
        shipping,
        line_items: taxLineItems,
        customer_id: context.customer?.id,
      });

      if (!tax.breakdown) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Taxjar did not return tax breakdown"
        );
      }

      const itemTaxLines: TaxTypes.ItemTaxLineDTO[] =
        tax.breakdown?.line_items?.map((item) => {
          const itemVal = taxLineItems.find((i) => i.id === item.id);
          return {
            line_item_id: item.id ?? "",
            rate: (item.combined_tax_rate ?? 0) * 100, // Fraction to percent conversion
            code: itemVal?.product_tax_code ?? "",
            provider_id: this.getIdentifier(),
            name: `TaxJar-${itemVal?.product_tax_code}`,
          };
        }) ?? [];

      const shippingTaxLines: TaxTypes.ShippingTaxLineDTO[] = shippingLines.map(
        (i) => {
          return {
            shipping_line_id: i.shipping_line.id,
            code: "SHIPPING",
            name: "SHIPPING",
            provider_id: this.getIdentifier(),
            rate: tax.freight_taxable
              ? (tax.breakdown?.shipping?.combined_tax_rate ?? 0) * 100 // Fraction to percent conversion
              : 0,
          };
        }
      );

      return [...itemTaxLines, ...shippingTaxLines];
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while getting tax lines from Taxjar: ${error}`
      );
    }
  }
  async createTransaction(transactionParams: CreateOrderParams) {
    try {
      return await this.client.createOrder(transactionParams);
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while creating transaction for Taxjar: ${error}`
      );
    }
  }
  async deleteTransaction(transactionId: string) {
    try {
      return await this.client.deleteOrder(transactionId, {
        provider: "medusa",
      });
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while deleting transaction for Taxjar: ${error}`
      );
    }
  }
  async updateTransaction(transactionParams: UpdateOrderParams) {
    try {
      return await this.client.updateOrder(transactionParams);
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while updating transaction for Taxjar: ${error}`
      );
    }
  }
  async createRefund(refundParams: CreateRefundParams) {
    try {
      return await this.client.createRefund(refundParams);
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while creating refund for Taxjar: ${error}`
      );
    }
  }
  async deleteRefund(transactionId: string) {
    try {
      return await this.client.deleteRefund(transactionId, {
        provider: "medusa",
      });
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while deleting refund for Taxjar: ${error}`
      );
    }
  }
  async updateRefund(refundParams: UpdateRefundParams) {
    try {
      return await this.client.updateRefund(refundParams);
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while updating refund for Taxjar: ${error}`
      );
    }
  }
}

export default TaxjarTaxModuleProvider;
