import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { TaxjarProductModuleService } from "../../../modules/taxjar-product/service";
import { TAXJAR_PRODUCT_MODULE } from "../../../modules/taxjar-product";
import {
  ContainerRegistrationKeys,
  MedusaError,
  MedusaErrorTypes,
} from "@medusajs/framework/utils";
import feedTaxjarProductCacheWorkflow from "../../../workflows/feed-taxjar-product-cache";
import { z } from "@medusajs/framework/zod";
import { GetTaxjarProductsSchema, PutTaxjarProductsSchema } from "./validators";

type GetTaxjarProductsType = z.infer<typeof GetTaxjarProductsSchema>;
type PutTaxjarProductsType = z.infer<typeof PutTaxjarProductsSchema>;

export async function GET(
  req: MedusaRequest<GetTaxjarProductsType>,
  res: MedusaResponse
): Promise<void> {
  const taxjarProductModuleService: TaxjarProductModuleService =
    req.scope.resolve(TAXJAR_PRODUCT_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const { offset, limit } = req.validatedQuery;

    logger.debug(
      `GET /admin/taxjar-products - Retrieving Taxjar products with offset: ${offset}, limit: ${limit}`
    );

    const [taxjarProducts, count] =
      await taxjarProductModuleService.listAndCountTaxjarProducts(undefined, {
        skip: offset,
        take: limit,
        order: { created_at: "DESC" },
      });

    logger.debug(
      `GET /admin/taxjar-products - Successfully retrieved ${taxjarProducts.length} of ${count} Taxjar products`
    );

    res.json({
      taxjar_products: taxjarProducts,
      count,
      offset,
      limit,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `GET /admin/taxjar-products - Failed to retrieve taxjar products: ${error.message}`
      );

      res.status(500).json({
        error: "Failed to retrieve taxjar products",
        details: error.message,
      });
    }
  }
}

export async function PUT(
  req: MedusaRequest<PutTaxjarProductsType>,
  res: MedusaResponse
): Promise<void> {
  const taxjarProductModuleService: TaxjarProductModuleService =
    req.scope.resolve(TAXJAR_PRODUCT_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const { taxjar_products } = req.validatedBody;

  logger.debug(
    `PUT /admin/taxjar-products - Starting bulk update for ${
      taxjar_products?.length || 0
    } products`
  );

  if (!taxjar_products || !Array.isArray(taxjar_products)) {
    logger.error(
      "PUT /admin/taxjar-products - Invalid request: Products array is required"
    );
    res.status(400).json({
      error: "Products array is required",
    });
    return;
  }

  try {
    logger.debug(
      `PUT /admin/taxjar-products - Processing ${taxjar_products.length} product updates`
    );

    const results =
      await taxjarProductModuleService.bulkUpdateTaxjarProducts(
        taxjar_products
      );

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => r.error).length;

    await feedTaxjarProductCacheWorkflow(req.scope).run();

    logger.info(
      `PUT /admin/taxjar-products - Bulk update completed: ${successCount} successful, ${errorCount} failed`
    );

    res.json({
      message: "Bulk update completed",
      results,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `PUT /admin/taxjar-products - Internal server error: ${error.message}`
      );
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
