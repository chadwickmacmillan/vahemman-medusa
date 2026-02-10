import { ICacheService } from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { AVALARA_CUSTOMER_MODULE } from "../../modules/taxjar-customer";
import TaxjarCustomerModuleService from "../../modules/taxjar-customer/service";
import { TaxjarCustomerCache } from "../../types";
import { getTaxjarCustomerCacheKey } from "../../utils";
import { CACHE_TTL, FEED_BATCH_SIZE, MAX_FEED_ITERATIONS } from "../../const";

export const feedTaxjarCustomerCacheStep = createStep(
  "feed-taxjar-customer-cache-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const cache: ICacheService = container.resolve("cache");
    const taxjarCustomerService: TaxjarCustomerModuleService =
      container.resolve(AVALARA_CUSTOMER_MODULE);
    const customerService = container.resolve("customer");

    logger.debug("Feeding Taxjar customer cache...");
    let total = 0;

    try {
      let skip = 0;
      let i = 0;
      let hasMore = true;

      while (hasMore && i < MAX_FEED_ITERATIONS) {
        i += 1;

        const taxjarCustomers = await taxjarCustomerService.listTaxjarCustomers(
          {},
          {
            skip,
            take: FEED_BATCH_SIZE,
            order: { created_at: "DESC" },
          }
        );

        logger.debug(
          `Found ${taxjarCustomers.length} taxjar customers in batch ${i}`
        );

        if (taxjarCustomers.length === 0) {
          hasMore = false;
          break;
        }

        const customerIds = taxjarCustomers.map((ac) => ac.customer_id);
        const customers = await customerService.listCustomers({
          id: customerIds,
        });
        const customerMap = new Map(customers.map((c) => [c.id, c]));
        const enrichedTaxjarCustomers = taxjarCustomers.map(
          (taxjarCustomer) => ({
            ...taxjarCustomer,
            customer: customerMap.get(taxjarCustomer.customer_id),
          })
        );

        await Promise.all(
          enrichedTaxjarCustomers.map(async (taxjarCustomer) => {
            const value: TaxjarCustomerCache = {
              entity_use_code: taxjarCustomer.entity_use_code,
            };

            await cache.set(
              getTaxjarCustomerCacheKey(taxjarCustomer.customer_id),
              value,
              CACHE_TTL
            );
          })
        );

        logger.debug(
          `Fed ${taxjarCustomers.length} Taxjar customers into cache (iteration ${i})`
        );

        skip += FEED_BATCH_SIZE;
        total += taxjarCustomers.length;
        hasMore = taxjarCustomers.length === FEED_BATCH_SIZE;
      }

      logger.info(
        `Finished feeding Taxjar customer cache. Total customers fed: ${total}`
      );

      return new StepResponse({ total });
    } catch (error) {
      logger.error(
        `Failed to feed cache. Error: ${error.message}. Please make sure migration adding taxjar_customer table has been run and cache module is injected to the module via medusa-config.`
      );
      throw error;
    }
  }
);
