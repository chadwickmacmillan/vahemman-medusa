import { listShippingOptionsForCartWorkflow } from "@medusajs/medusa/core-flows";
import { listShippingOptionsForCartWithPricingWorkflow } from "@medusajs/medusa/core-flows";
import { StepResponse } from "@medusajs/workflows-sdk";

listShippingOptionsForCartWorkflow.hooks.setShippingOptionsContext(
  async ({ cart }, { container }) => {
    const query = container.resolve("query");

    // Fetch cart with customer_id if not already present
    let customerId = cart.customer_id;
    if (!customerId) {
      const { data: carts } = await query.graph({
        entity: "cart",
        filters: { id: cart.id },
        fields: ["customer_id"],
      });
      customerId = carts[0].customer_id;
    }

    // Fetch the stock location linked to the fulfillment set
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name", "address.*"],
    });

    return new StepResponse({
      customer_id: customerId,
      from_location: stockLocations[0], // or filter by the relevant location
    });
  },
);

// Also apply to the pricing workflow for consistency
listShippingOptionsForCartWithPricingWorkflow.hooks.setShippingOptionsContext(
  async ({ cart }, { container }) => {
    const query = container.resolve("query");

    let customerId = cart.customer_id;
    if (!customerId) {
      const { data: carts } = await query.graph({
        entity: "cart",
        filters: { id: cart.id },
        fields: ["customer_id"],
      });
      customerId = carts[0].customer_id;
    }

    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name", "address.*"],
    });

    return new StepResponse({
      customer_id: customerId,
      from_location: stockLocations[0],
    });
  },
);
