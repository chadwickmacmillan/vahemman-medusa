import { MedusaContainer } from "@medusajs/framework/types";
import feedTaxjarCacheWorkflow from "../workflows/feed-taxjar-cache";

export default async function initFeedTaxjarCacheJob(
  container: MedusaContainer
) {
  const logger = container.resolve("logger");
  logger.debug(`Starting ${config.name} job...`);

  await feedTaxjarCacheWorkflow(container).run();

  logger.debug(`${config.name} job completed.`);
}

// on startup
export const config = {
  name: "init-feed-taxjar-cache",
  schedule: "*/10 * * * * *",
  numberOfExecutions: 1,
};
