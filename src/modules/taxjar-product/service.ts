import { MedusaService } from "@medusajs/framework/utils";
import { TaxjarProduct, TaxjarProductModel } from "./models/taxjar-product";
import { MedusaContainer } from "@medusajs/framework";

export type BulkUpdateRequest = {
  product_id: string;
  tax_code: string;
};

export type BulkUpdateResult = {
  product_id: string;
  success?: boolean;
  error?: string;
  data?: TaxjarProductModel;
};

export class TaxjarProductModuleService extends MedusaService({
  TaxjarProduct,
}) {
  private readonly container: MedusaContainer;

  constructor(container: MedusaContainer) {
    super(container);
    this.container = container;
  }

  private async upsertTaxjarProduct(
    product_id: string,
    tax_code: string
  ): Promise<TaxjarProductModel> {
    const [existingRecords, count] = await this.listAndCountTaxjarProducts({
      product_id,
    });

    if (count > 1) {
      throw new Error(`Multiple records found for product ${product_id}`);
    }

    let result: TaxjarProductModel;

    if (count === 1) {
      result = await this.updateTaxjarProducts({
        ...existingRecords[0],
        tax_code,
      });
    } else {
      result = await this.createTaxjarProducts({
        product_id,
        tax_code,
      });
    }

    return result;
  }

  async bulkUpdateTaxjarProducts(
    taxjar_products: BulkUpdateRequest[]
  ): Promise<BulkUpdateResult[]> {
    const results: BulkUpdateResult[] = [];

    for (const productData of taxjar_products) {
      const { product_id, tax_code } = productData;
      try {
        const taxjarProduct = await this.upsertTaxjarProduct(
          product_id,
          tax_code
        );

        results.push({
          product_id,
          success: true,
          data: taxjarProduct,
        });
      } catch (error) {
        results.push({
          product_id,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default TaxjarProductModuleService;
