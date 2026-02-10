import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedTaxjarCustomerCacheStep } from "./steps";

const feedTaxjarCustomerCacheWorkflow = createWorkflow(
  "feed-taxjar-customer-cache-workflow",
  function () {
    const result = feedTaxjarCustomerCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedTaxjarCustomerCacheWorkflow;
