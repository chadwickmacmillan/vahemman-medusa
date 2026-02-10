import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedTaxjarCustomerCacheStep } from "./steps/feed-taxjar-customer-cache";
import { feedTaxjarProductCacheStep } from "./steps/feed-taxjar-product-cache";

const feedTaxjarCacheWorkflow = createWorkflow(
  "feed-taxjar-cache-workflow",
  function () {
    const productResult = feedTaxjarProductCacheStep();
    const customerResult = feedTaxjarCustomerCacheStep();

    return new WorkflowResponse({
      products: productResult,
      customers: customerResult,
    });
  }
);

export default feedTaxjarCacheWorkflow;
