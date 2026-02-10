import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedTaxjarProductCacheStep } from "./steps";

const feedTaxjarProductCacheWorkflow = createWorkflow(
  "feed-taxjar-product-cache-workflow",
  function () {
    const result = feedTaxjarProductCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedTaxjarProductCacheWorkflow;
