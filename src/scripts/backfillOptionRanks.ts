import { logger } from "@medusajs/framework";
import { ExecArgs, IProductModuleService } from "@medusajs/framework/types";
import {
  MedusaError,
  MedusaErrorTypes,
  Modules,
} from "@medusajs/framework/utils";
import {
  compareOptionValues,
  getOptionRank,
  getOptionValueRank,
  OPTION_RANK_METADATA_KEY,
} from "../api/utils/product-option-sort";

/**
 * Gives every product option a `metadata.rank` and every option value a `rank`,
 * so the *global fallback* order is fully defined rather than partly falling
 * back to query order.
 *
 * This is the order used for a product that has no ordering of its own. A
 * product's own order lives in `product.metadata.option_order` and is set by
 * drag-and-drop in the "Option order" section of the product page; it always
 * wins over these ranks. See src/api/utils/product-option-sort.ts.
 *
 * Existing ranks are preserved — the current order is simply renumbered 1..n,
 * with anything unranked appended after what is already ranked. Nothing moves
 * visually; the ordering just becomes fully defined. Safe to re-run: a second
 * pass finds nothing to change.
 *
 *   npx medusa exec ./src/scripts/backfillOptionRanks.ts
 *   npx medusa exec ./src/scripts/backfillOptionRanks.ts dry-run
 *
 * The fallback is then edited under /product-options/:id/metadata (`rank`) for
 * options, and by drag-and-drop under /product-options/:id/edit for values.
 */
export default async function backfillOptionRanks({
  container,
  args,
}: ExecArgs) {
  // `medusa exec` collects script arguments as yargs positionals, so the bare
  // `dry-run` form is the one that actually reaches us; the flag spelling is
  // accepted too in case it is passed after a `--` separator.
  const isDryRun = args.some((arg) => arg === "dry-run" || arg === "--dry-run");

  const productService = container.resolve<IProductModuleService>(
    Modules.PRODUCT,
  );

  const options = await productService.listProductOptions(
    {},
    {
      relations: ["values"],
      order: { created_at: "ASC" },
      take: null,
    },
  );

  if (!options.length) {
    logger.log("No product options found — nothing to backfill.");
    return;
  }

  // Ranked options first (in rank order), then the unranked ones in creation
  // order. Renumbering from 1 also closes gaps left by deleted options.
  const orderedOptions = [...options].sort((a, b) => {
    const rankA = getOptionRank(a);
    const rankB = getOptionRank(b);

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
  });

  // Plan every write before making any of them, so a bad option aborts the run
  // rather than leaving half the catalog renumbered.
  const plan = orderedOptions.map((option, index) => {
    const optionRank = index + 1;
    const orderedValues = [...(option.values ?? [])].sort(compareOptionValues);
    const ranks = Object.fromEntries(
      orderedValues.map((value, valueIndex) => [value.value, valueIndex + 1]),
    );

    // `ranks` is keyed by value string, so duplicates would silently collapse
    // and leave a value unranked.
    if (Object.keys(ranks).length !== orderedValues.length) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_DATA,
        `Product option "${option.title}" (${option.id}) has duplicate values. Resolve them before backfilling ranks.`,
      );
    }

    return {
      option,
      optionRank,
      orderedValues,
      ranks,
      optionRankChanged: getOptionRank(option) !== optionRank,
      changedValueCount: orderedValues.filter(
        (value, valueIndex) => getOptionValueRank(value) !== valueIndex + 1,
      ).length,
    };
  });

  const pending = plan.filter(
    (entry) => entry.optionRankChanged || entry.changedValueCount > 0,
  );

  if (!pending.length) {
    logger.log(
      `All ${plan.length} product option(s) and their values are already ranked.`,
    );
    return;
  }

  const prefix = isDryRun ? "[dry-run] " : "";

  for (const entry of pending) {
    const { option, optionRank, orderedValues, ranks, changedValueCount } =
      entry;

    logger.log(
      `${prefix}${option.title} (${option.id}) → rank ${optionRank}, ` +
        `${changedValueCount} of ${orderedValues.length} value rank(s) to set` +
        (orderedValues.length
          ? `: ${orderedValues.map((value) => value.value).join(", ")}`
          : ""),
    );

    if (isDryRun) {
      continue;
    }

    await productService.updateProductOptions(option.id, {
      metadata: {
        ...(option.metadata ?? {}),
        [OPTION_RANK_METADATA_KEY]: optionRank,
      },
      // Passing `ranks` without `values` updates the ranks of the existing
      // values in place; the map covers all of them, so none are cleared.
      ...(orderedValues.length ? { ranks } : {}),
    });
  }

  const optionCount = pending.filter(
    (entry) => entry.optionRankChanged,
  ).length;
  const valueCount = pending.reduce(
    (total, entry) => total + entry.changedValueCount,
    0,
  );

  logger.log(
    `${isDryRun ? "Would rank" : "Ranked"} ${optionCount} option(s) and ` +
      `${valueCount} option value(s) across ${plan.length} option(s).`,
  );
}
