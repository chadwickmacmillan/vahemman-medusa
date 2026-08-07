/**
 * Ordering for product options and their values ("variations") as they are
 * returned to the admin dashboard.
 *
 * Order is per-product. Medusa 2.18 shares options between products — the same
 * "Color" option is linked to every product using it — and the join model
 * (`ProductProductOption`) carries no rank or metadata column we could extend,
 * so a product's own ordering is stored on the product instead, under
 * `metadata.option_order`:
 *
 *   {
 *     "options": ["opt_color", "opt_size"],
 *     "values": { "opt_size": ["optval_s", "optval_m", "optval_l"] }
 *   }
 *
 * Anything a product hasn't explicitly ordered falls back to the global order:
 * `metadata.rank` on the option, and the option value's own `rank` column.
 * Unranked entries keep the order the query returned and sort last.
 *
 * `medusa exec ./src/scripts/backfillOptionRanks.ts` seeds the global fallback.
 */

/** On a product option — the global fallback position. */
export const OPTION_RANK_METADATA_KEY = "rank";

/** On a product — this product's own ordering. */
export const PRODUCT_OPTION_ORDER_METADATA_KEY = "option_order";

export type ProductOptionOrder = {
  /** Option IDs, in display order. */
  options: string[];
  /** Option value IDs in display order, keyed by option ID. */
  values: Record<string, string[]>;
};

type Unknown = Record<string, unknown>;

const isRecord = (value: unknown): value is Unknown =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];

/**
 * Ranks typed into the admin's metadata editor arrive as strings, so accept
 * both. Anything non-numeric is treated as "unranked" rather than as 0.
 */
const parseRank = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const getOptionRank = (option: unknown): number | null =>
  isRecord(option) && isRecord(option.metadata)
    ? parseRank(option.metadata[OPTION_RANK_METADATA_KEY])
    : null;

export const getOptionValueRank = (value: unknown): number | null =>
  isRecord(value) ? parseRank(value.rank) : null;

/** Ranked ascending, unranked last in their original (stable) order. */
const byRank =
  <T>(getRank: (item: T) => number | null) =>
  (a: T, b: T): number => {
    const rankA = getRank(a);
    const rankB = getRank(b);

    if (rankA === null && rankB === null) {
      return 0;
    }
    if (rankA === null) {
      return 1;
    }
    if (rankB === null) {
      return -1;
    }

    return rankA - rankB;
  };

export const compareOptions = byRank(getOptionRank);
export const compareOptionValues = byRank(getOptionValueRank);

/**
 * Reads a product's saved ordering. Tolerant of hand-edited metadata: anything
 * that isn't a list of ID strings is discarded rather than throwing, leaving
 * that part of the ordering to fall back to the global one.
 */
export const readProductOptionOrder = (product: unknown): ProductOptionOrder => {
  const raw =
    isRecord(product) && isRecord(product.metadata)
      ? product.metadata[PRODUCT_OPTION_ORDER_METADATA_KEY]
      : undefined;

  if (!isRecord(raw)) {
    return { options: [], values: {} };
  }

  const values: Record<string, string[]> = {};

  if (isRecord(raw.values)) {
    for (const [optionId, valueIds] of Object.entries(raw.values)) {
      const ids = asIdList(valueIds);
      if (ids.length) {
        values[optionId] = ids;
      }
    }
  }

  return { options: asIdList(raw.options), values };
};

/**
 * Builds the metadata value to save for a product, from its options in display
 * order, each carrying its values in display order. Only current IDs are
 * written, so options and values removed from the product prune themselves.
 */
export const buildProductOptionOrder = (
  options: { id: string; values?: { id: string }[] | null }[],
): ProductOptionOrder => ({
  options: options.map((option) => option.id),
  values: Object.fromEntries(
    options
      .map((option) => [option.id, (option.values ?? []).map((value) => value.id)])
      .filter(([, valueIds]) => valueIds.length),
  ),
});

/**
 * Explicitly ordered items first, in that order; everything else after, in the
 * fallback order. Returns a copy.
 */
const sortByExplicitOrder = <T>(
  items: T[],
  orderedIds: string[],
  getId: (item: T) => unknown,
  fallbackCompare: (a: T, b: T) => number,
): T[] => {
  const position = new Map(orderedIds.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const positionA = position.get(String(getId(a)));
    const positionB = position.get(String(getId(b)));

    if (positionA !== undefined && positionB !== undefined) {
      return positionA - positionB;
    }
    if (positionA !== undefined) {
      return -1;
    }
    if (positionB !== undefined) {
      return 1;
    }

    return fallbackCompare(a, b);
  });
};

const getId = (item: unknown): unknown => (isRecord(item) ? item.id : undefined);

/**
 * Sorts an option's values for display *within a product*, and rewrites each
 * `rank` to its resulting position.
 *
 * The rewrite is what makes per-product value order stick: the dashboard
 * re-sorts values by `rank` on the client (in the product detail Options
 * section and the "Manage options" drawer), so a server order alone would be
 * discarded. On these routes `rank` therefore means "position within this
 * product". The canonical stored rank is still served as-is by the
 * /admin/product-options routes, which is where it is edited.
 */
const withProductValueOrder = (option: unknown, orderedValueIds: string[]): unknown => {
  if (!isRecord(option) || !Array.isArray(option.values)) {
    return option;
  }

  const values = sortByExplicitOrder(
    option.values,
    orderedValueIds,
    getId,
    compareOptionValues,
  ).map((value, index) =>
    isRecord(value) ? { ...value, rank: index + 1 } : value,
  );

  return { ...option, values };
};

/** Sorts an option's values by their stored rank, leaving the rank untouched. */
const withGlobalValueOrder = (option: unknown): unknown => {
  if (!isRecord(option) || !Array.isArray(option.values)) {
    return option;
  }

  return { ...option, values: [...option.values].sort(compareOptionValues) };
};

const withProductOrder = (product: unknown): unknown => {
  if (!isRecord(product) || !Array.isArray(product.options)) {
    return product;
  }

  const order = readProductOptionOrder(product);

  const options = sortByExplicitOrder(
    product.options,
    order.options,
    getId,
    compareOptions,
  ).map((option) =>
    withProductValueOrder(option, order.values[String(getId(option))] ?? []),
  );

  return { ...product, options };
};

/**
 * Reorders the options and option values found in an admin product or product
 * option response. Any other payload is passed through unchanged.
 *
 * Note that `product_options` list responses only get their *values* sorted —
 * the order of the list itself belongs to the caller's `order` query param,
 * which drives the sortable Product Options table.
 */
export const withSortedProductOptions = (body: unknown): unknown => {
  if (!isRecord(body)) {
    return body;
  }

  const next: Unknown = { ...body };

  if (isRecord(next.product)) {
    next.product = withProductOrder(next.product);
  }

  if (Array.isArray(next.products)) {
    next.products = next.products.map(withProductOrder);
  }

  if (isRecord(next.product_option)) {
    next.product_option = withGlobalValueOrder(next.product_option);
  }

  if (Array.isArray(next.product_options)) {
    next.product_options = next.product_options.map(withGlobalValueOrder);
  }

  return next;
};
