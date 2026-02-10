import { ExecArgs } from "@medusajs/framework/types";
import { logger } from "@medusajs/framework";
import TaxCodeService from "../modules/tax_code/service";
import { TAX_CODE_SERVICE } from "../modules/tax_code";
import Taxjar from "taxjar";
import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";

export default async function seedTaxCodes({ container }: ExecArgs) {
  try {
    if (!process.env.TAXJAR_API_KEY) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_DATA,
        "Taxjar API Key not found"
      );
    }

    const taxCodeService = container.resolve(
      TAX_CODE_SERVICE
    ) as TaxCodeService;

    const taxjarClient = new Taxjar({ apiKey: process.env.TAXJAR_API_KEY });

    const { categories } = await taxjarClient.categories();

    await taxCodeService.createTaxCodes(
      categories.map((category) => {
        return {
          name: category.name,
          description: category.description,
          code: category.product_tax_code,
        };
      })
    );
    logger.log(`Created ${categories.length} entries!`);
  } catch (error) {
    throw new MedusaError(
      MedusaErrorTypes.INVALID_DATA,
      "Unable to seed tax codes",
      error
    );
  }
}
