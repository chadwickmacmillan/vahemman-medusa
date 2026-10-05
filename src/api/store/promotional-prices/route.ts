import type {
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http";
import type {
  ComputeActionContext,
  ComputeActionItemLine,
} from "@medusajs/framework/types";
import {
  ApplicationMethodAllocation,
  ApplicationMethodTargetType,
  CampaignBudgetType,
  ComputedActions,
  ContainerRegistrationKeys,
  MathBN,
  MedusaError,
  Modules,
  PromotionType,
  QueryContext,
} from "@medusajs/framework/utils";
import { StorePromotionalPricesType } from "./validators";

type PromotionalPrice = {
  /** Price before any price list */
  original_amount: number;
  /** Price after price lists */
  calculated_amount: number;
  /** Price after price lists and automatic per-item promotions */
  promotional_amount: number;
  promotion_codes: string[];
};

type VariantCalculatedPrice = {
  calculated_amount?: number | null;
  original_amount?: number | null;
};

/**
 * Prices product variants the same way the cart would, so catalog pages can
 * show discounts before anything is added to the cart.
 *
 * Each variant becomes a mock line item (quantity 1, priced after price
 * lists) in a context built from the shopper's cart, then runs through the
 * promotion module's `computeActions`. Only automatic, standard promotions
 * that target items with an "each" allocation are applied, since those are
 * the only ones whose discount on a single item is known up front. Target
 * rules (included products, categories, collections...) and promotion rules
 * (customer group, region, country...) are evaluated by Medusa itself.
 */
export async function POST(
  req: MedusaStoreRequest<StorePromotionalPricesType>,
  res: MedusaResponse
) {
  const { product_ids, region_id, cart_id } = req.validatedBody;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const promotionModule = req.scope.resolve(Modules.PROMOTION);

  const {
    data: [region],
  } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
    filters: { id: region_id },
  });

  if (!region) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Region with id '${region_id}' not found`
    );
  }

  const cart = cart_id
    ? (
        await query.graph({
          entity: "cart",
          fields: [
            "id",
            "email",
            "sales_channel_id",
            "customer.id",
            "customer.groups.id",
            "shipping_address.country_code",
          ],
          filters: { id: cart_id },
        })
      ).data[0]
    : undefined;

  const customer = cart?.customer
    ? {
        id: cart.customer.id,
        groups: (cart.customer.groups ?? []).flatMap((group) =>
          group ? [{ id: group.id }] : []
        ),
      }
    : undefined;

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "discountable",
      "collection_id",
      "type_id",
      "categories.id",
      "tags.id",
      "variants.id",
      "variants.calculated_price.*",
    ],
    filters: { id: product_ids },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region.id,
          currency_code: region.currency_code,
          ...(customer && { customer: { groups: customer.groups } }),
        }),
      },
    },
  });

  const items: ComputeActionItemLine[] = [];
  const prices: Record<string, PromotionalPrice> = {};

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (!variant) continue;
      const { calculated_price: calculatedPrice } = variant as {
        calculated_price?: VariantCalculatedPrice;
      };
      const calculatedAmount = calculatedPrice?.calculated_amount;
      if (typeof calculatedAmount !== "number") continue;

      prices[variant.id] = {
        original_amount:
          calculatedPrice?.original_amount ?? calculatedAmount,
        calculated_amount: calculatedAmount,
        promotional_amount: calculatedAmount,
        promotion_codes: [],
      };

      if (product.discountable === false || calculatedAmount <= 0) continue;

      items.push({
        id: variant.id,
        quantity: 1,
        subtotal: calculatedAmount,
        original_total: calculatedAmount,
        is_discountable: true,
        product_id: product.id,
        variant_id: variant.id,
        product: {
          id: product.id,
          collection_id: product.collection_id,
          type_id: product.type_id,
          categories: (product.categories ?? []).flatMap((c) =>
            c ? [{ id: c.id }] : []
          ),
          tags: (product.tags ?? []).flatMap((t) => (t ? [{ id: t.id }] : [])),
        },
      } as ComputeActionItemLine);
    }
  }

  const promotions = await promotionModule.listPromotions(
    { is_automatic: true, type: [PromotionType.STANDARD] },
    { relations: ["application_method", "campaign", "campaign.budget"] }
  );

  const promotionCodes = promotions
    .filter(
      (promotion) =>
        promotion.code &&
        promotion.application_method?.target_type ===
          ApplicationMethodTargetType.ITEMS &&
        promotion.application_method?.allocation ===
          ApplicationMethodAllocation.EACH &&
        // Per-customer budgets can't be checked without a customer attribute
        promotion.campaign?.budget?.type !== CampaignBudgetType.USE_BY_ATTRIBUTE
    )
    .map((promotion) => promotion.code!);

  if (items.length && promotionCodes.length) {
    const context = {
      currency_code: region.currency_code,
      region_id: region.id,
      region: { id: region.id },
      sales_channel_id:
        cart?.sales_channel_id ??
        req.publishable_key_context?.sales_channel_ids?.[0],
      email: cart?.email,
      customer,
      shipping_address: cart?.shipping_address ?? undefined,
      items,
    } as ComputeActionContext;

    const actions = await promotionModule.computeActions(
      promotionCodes,
      context,
      { prevent_auto_promotions: true }
    );

    for (const action of actions) {
      if (action.action !== ComputedActions.ADD_ITEM_ADJUSTMENT) continue;

      const price = prices[action.item_id];
      if (!price) continue;

      price.promotional_amount = Math.max(
        MathBN.sub(price.promotional_amount, action.amount).toNumber(),
        0
      );
      price.promotion_codes.push(action.code);
    }
  }

  res.json({ prices });
}
