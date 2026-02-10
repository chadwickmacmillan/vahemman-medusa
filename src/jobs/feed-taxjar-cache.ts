import { MedusaContainer } from "@medusajs/framework/types";
import feedTaxjarCacheWorkflow from "../workflows/feed-taxjar-cache";

export default async function feedTaxjarCacheJob(container: MedusaContainer) {
  const logger = container.resolve("logger");
  logger.debug(`Starting ${config.name} job...`);

  await feedTaxjarCacheWorkflow(container).run();

  logger.debug(`${config.name} job completed.`);
}

export const config = {
  name: "feed-taxjar-cache",
  schedule: "0 0 * * *", // Every midnight
};
