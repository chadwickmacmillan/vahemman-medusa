import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    logger.debug(
      `POST /admin/taxjar-cache/feed - Initiating Taxjar cache refresh (products)...`
    );

    const result = await feedAvalaraCacheWorkflow(req.scope).run();

    logger.info("Manual Avalara cache feed completed successfully");

    res.json({
      message: "Cache refresh completed successfully",
      result,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `POST /admin/avalara-cache/feed - Internal server error: ${error.message}`
      );

      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
