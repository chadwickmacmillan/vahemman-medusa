import {
  ITaxProvider,
  TaxTypes,
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
  IProductModuleService,
} from "@medusajs/framework/types";
import Taxjar from "taxjar";
import { MedusaError, Modules } from "@medusajs/framework/utils";
import { ModuleOptions } from "./types";
import { Logger } from "@medusajs/medusa";
import {
  CreateOrderParams,
  CreateRefundParams,
  TaxLineItem,
  UpdateOrderParams,
  UpdateRefundParams,
} from "taxjar/dist/types/paramTypes";
import { ProductDTOWithTaxCode } from "../tax_code/types";

type InjectedDependencies = {
  logger: Logger;
  [Modules.PRODUCT]: IProductModuleService;
};

class TaxjarTaxModuleProvider implements ITaxProvider {
  static identifier = "taxjar";
  protected logger_: Logger;
  protected options_: ModuleOptions;
  protected client: Taxjar;
  protected defaultTaxCode?: string;
  protected productService_: IProductModuleService;

  constructor(
    { product, logger }: InjectedDependencies,
    options: ModuleOptions
  ) {
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Taxjar module options are required: apiKey"
      );
    }
    this.logger_ = logger;
    this.options_ = options;
    this.productService_ = product;

    this.client = new Taxjar(options);
    this.defaultTaxCode = options?.defaultTaxCode;
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
        itemLines.map(async (line) => {
          const productTaxCode = await this.getProductTaxCode(
            line.line_item.product_id
          );
          return {
            id: line.line_item.id,
            quantity: Number(line.line_item.quantity?.toString()),
            unit_price: Number(line.line_item.unit_price?.toString()),
            product_tax_code: productTaxCode,
          };
        })
      );

      const shipping = shippingLines.reduce((acc, l) => {
        return (acc += Number(l.shipping_line.unit_price?.toString()));
      }, 0);

      console.log(context.address.province_code, "province code");

      const { tax } = await this.client.taxForOrder({
        to_country: context.address.country_code ?? "",
        to_zip: context.address.postal_code ?? "",
        to_state: context.address.province_code ?? "",
        to_city: context.address.city ?? "",
        to_street: context.address.address_1 ?? "",
        shipping,
        line_items: taxLineItems,
        customer_id: context.customer?.id ?? "",
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
            code: "shipping",
            name: "shipping",
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

  async createTransaction(params: Omit<CreateOrderParams, "provider">) {
    try {
      const res = await this.client.createOrder({
        ...params,
        provider: "medusa",
      });
      return res.order;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while creating transaction for Taxjar: ${error}`
      );
    }
  }
  async deleteTransaction(transactionId: string) {
    try {
      const res = await this.client.deleteOrder(transactionId, {
        provider: "medusa",
      });
      return res.order;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while deleting transaction for Taxjar: ${error}`
      );
    }
  }
  async updateTransaction(params: UpdateOrderParams) {
    try {
      const res = await this.client.updateOrder(params);
      return res.order;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while updating transaction for Taxjar: ${error}`
      );
    }
  }
  async showTransaction(transactionId: string) {
    try {
      const res = await this.client.showOrder(transactionId, {
        provider: "medusa",
      });
      return res.order;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while fetching transaction for Taxjar: ${error}`
      );
    }
  }
  async createRefund(params: Omit<CreateRefundParams, "provider">) {
    try {
      const res = await this.client.createRefund({
        ...params,
        provider: "medusa",
      });
      return res.refund;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while creating refund for Taxjar: ${error}`
      );
    }
  }
  async deleteRefund(transactionId: string) {
    try {
      const res = await this.client.deleteRefund(transactionId, {
        provider: "medusa",
      });
      return res.refund;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while deleting refund for Taxjar: ${error}`
      );
    }
  }
  async updateRefund(params: UpdateRefundParams) {
    try {
      const res = await this.client.updateRefund(params);
      return res.refund;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while updating refund for Taxjar: ${error}`
      );
    }
  }
  async showRefund(transactionId: string) {
    try {
      const res = await this.client.showRefund(transactionId, {
        provider: "medusa",
      });
      return res.refund;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while fetching refund for Taxjar: ${error}`
      );
    }
  }
  private async getProductTaxCode(productId: string) {
    const result = await this.productService_.retrieveProduct(productId, {
      relations: ["categories"],
    });
    if (!result.categories) {
      return this?.defaultTaxCode ?? "";
    }
    const category = result.categories[0] as unknown as ProductDTOWithTaxCode;
    return category.tax_code?.code || this?.defaultTaxCode || "";
  }
}

export default TaxjarTaxModuleProvider;
