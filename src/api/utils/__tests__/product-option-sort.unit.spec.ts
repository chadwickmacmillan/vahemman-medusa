import {
  buildProductOptionOrder,
  readProductOptionOrder,
  withSortedProductOptions,
} from "../product-option-sort";

const option = (
  id: string,
  rank: number | string | null,
  values: { id: string; value: string; rank?: number | null }[] = [],
) => ({
  id,
  title: id,
  metadata: rank === null ? null : { rank },
  values,
});

const value = (id: string, rank?: number | null) => ({
  id,
  value: id,
  ...(rank === undefined ? {} : { rank }),
});

const product = (options: ReturnType<typeof option>[], order?: unknown) => ({
  product: {
    id: "prod_1",
    metadata: order === undefined ? null : { option_order: order },
    options,
  },
});

const optionIds = (body: unknown) =>
  (body as { product: { options: { id: string }[] } }).product.options.map(
    (o) => o.id,
  );

const valuesOf = (body: unknown, index: number) =>
  (
    body as {
      product: { options: { values: { id: string; rank?: number }[] }[] };
    }
  ).product.options[index].values;

describe("withSortedProductOptions", () => {
  describe("per-product ordering", () => {
    it("orders options by the product's saved order", () => {
      const body = product(
        [option("size", 1), option("color", 2), option("fit", 3)],
        { options: ["fit", "color", "size"] },
      );

      expect(optionIds(withSortedProductOptions(body))).toEqual([
        "fit",
        "color",
        "size",
      ]);
    });

    it("orders values by the product's saved order", () => {
      const body = product(
        [
          option("size", 1, [
            value("s", 1),
            value("m", 2),
            value("l", 3),
          ]),
        ],
        { options: ["size"], values: { size: ["l", "s", "m"] } },
      );

      expect(valuesOf(withSortedProductOptions(body), 0).map((v) => v.id)).toEqual(
        ["l", "s", "m"],
      );
    });

    it("rewrites value rank to the per-product position", () => {
      // Without this the dashboard's own client-side rank sort would put these
      // straight back into 1, 2, 3 order and discard the product's ordering.
      const body = product(
        [option("size", 1, [value("s", 1), value("m", 2), value("l", 3)])],
        { options: ["size"], values: { size: ["l", "s", "m"] } },
      );

      expect(valuesOf(withSortedProductOptions(body), 0)).toEqual([
        { id: "l", value: "l", rank: 1 },
        { id: "s", value: "s", rank: 2 },
        { id: "m", value: "m", rank: 3 },
      ]);
    });

    it("does not leak one product's order onto another", () => {
      const options = [
        option("color", 1, [value("red", 1), value("blue", 2)]),
        option("size", 2),
      ];

      const ordered = withSortedProductOptions(
        product(options, {
          options: ["size", "color"],
          values: { color: ["blue", "red"] },
        }),
      );
      const unordered = withSortedProductOptions(product(options));

      expect(optionIds(ordered)).toEqual(["size", "color"]);
      expect(valuesOf(ordered, 1).map((v) => v.id)).toEqual(["blue", "red"]);

      expect(optionIds(unordered)).toEqual(["color", "size"]);
      expect(valuesOf(unordered, 0).map((v) => v.id)).toEqual(["red", "blue"]);
    });

    it("appends options and values the saved order doesn't mention", () => {
      // A newly linked option, and a value added after the order was saved.
      const body = product(
        [
          option("fit", 3),
          option("size", 1, [value("m", 2), value("s", 1), value("xl", 9)]),
        ],
        { options: ["size"], values: { size: ["m", "s"] } },
      );

      const sorted = withSortedProductOptions(body);

      expect(optionIds(sorted)).toEqual(["size", "fit"]);
      expect(valuesOf(sorted, 0).map((v) => v.id)).toEqual(["m", "s", "xl"]);
    });

    it("ignores stale IDs left in the saved order", () => {
      const body = product([option("size", 1), option("color", 2)], {
        options: ["removed", "color", "size"],
      });

      expect(optionIds(withSortedProductOptions(body))).toEqual([
        "color",
        "size",
      ]);
    });

    it("falls back to the global order for hand-edited junk metadata", () => {
      const body = product([option("size", 2), option("color", 1)], {
        options: "color, size",
        values: { size: 3 },
      });

      expect(optionIds(withSortedProductOptions(body))).toEqual([
        "color",
        "size",
      ]);
    });
  });

  describe("global fallback", () => {
    it("orders options by metadata.rank when the product has no order", () => {
      const body = product([
        option("size", 2),
        option("color", 1),
        option("fit", 3),
      ]);

      expect(optionIds(withSortedProductOptions(body))).toEqual([
        "color",
        "size",
        "fit",
      ]);
    });

    it("orders values by their stored rank", () => {
      const body = product([
        option("size", 1, [value("l", 3), value("s", 1), value("m", 2)]),
      ]);

      expect(valuesOf(withSortedProductOptions(body), 0).map((v) => v.id)).toEqual(
        ["s", "m", "l"],
      );
    });

    it("puts unranked entries last, keeping their original order", () => {
      const body = product([
        option("fit", null, [value("cropped"), value("regular", 1), value("relaxed", null)]),
        option("color", 1),
        option("size", null),
      ]);

      const sorted = withSortedProductOptions(body);

      expect(optionIds(sorted)).toEqual(["color", "fit", "size"]);
      expect(valuesOf(sorted, 1).map((v) => v.id)).toEqual([
        "regular",
        "cropped",
        "relaxed",
      ]);
    });

    it("reads ranks typed into the metadata editor as strings", () => {
      const body = product([option("size", "10"), option("color", "2")]);

      expect(optionIds(withSortedProductOptions(body))).toEqual([
        "color",
        "size",
      ]);
    });

    it("treats a non-numeric metadata rank as unranked rather than as zero", () => {
      const body = product([option("fit", "soon"), option("color", 5)]);

      expect(optionIds(withSortedProductOptions(body))).toEqual([
        "color",
        "fit",
      ]);
    });
  });

  describe("product option responses", () => {
    it("sorts values by stored rank without reordering the list", () => {
      const body = {
        product_options: [
          option("size", 9, [value("m", 2), value("s", 1)]),
          option("color", 1),
        ],
        count: 2,
      };

      const sorted = withSortedProductOptions(body) as typeof body;

      expect(sorted.product_options.map((o) => o.id)).toEqual([
        "size",
        "color",
      ]);
      expect(sorted.product_options[0].values.map((v) => v.id)).toEqual([
        "s",
        "m",
      ]);
    });

    it("leaves the stored rank untouched, unlike product responses", () => {
      const body = {
        product_option: option("size", 1, [value("m", 20), value("s", 10)]),
      };

      const sorted = withSortedProductOptions(body) as typeof body;

      expect(sorted.product_option.values.map((v) => v.rank)).toEqual([10, 20]);
    });
  });

  it("leaves the input untouched and passes unrelated payloads through", () => {
    const body = product([option("size", 2), option("color", 1)]);

    withSortedProductOptions(body);
    expect(body.product.options.map((o) => o.id)).toEqual(["size", "color"]);

    expect(withSortedProductOptions({ deleted: true })).toEqual({
      deleted: true,
    });
    expect(withSortedProductOptions(null)).toBeNull();
  });
});

describe("readProductOptionOrder", () => {
  it("returns an empty order when there is nothing saved", () => {
    expect(readProductOptionOrder({ metadata: null })).toEqual({
      options: [],
      values: {},
    });
    expect(readProductOptionOrder(null)).toEqual({ options: [], values: {} });
  });

  it("keeps only ID strings", () => {
    const order = readProductOptionOrder({
      metadata: {
        option_order: {
          options: ["opt_1", 7, null, "opt_2"],
          values: { opt_1: ["val_1", {}], opt_2: "nope", opt_3: [] },
        },
      },
    });

    expect(order).toEqual({
      options: ["opt_1", "opt_2"],
      values: { opt_1: ["val_1"] },
    });
  });
});

describe("buildProductOptionOrder", () => {
  it("captures options and their values in the given order", () => {
    expect(
      buildProductOptionOrder([
        { id: "opt_size", values: [{ id: "val_l" }, { id: "val_s" }] },
        { id: "opt_color", values: [] },
        { id: "opt_fit" },
      ]),
    ).toEqual({
      options: ["opt_size", "opt_color", "opt_fit"],
      values: { opt_size: ["val_l", "val_s"] },
    });
  });

  it("round-trips through readProductOptionOrder", () => {
    const built = buildProductOptionOrder([
      { id: "opt_size", values: [{ id: "val_l" }, { id: "val_s" }] },
    ]);

    expect(
      readProductOptionOrder({ metadata: { option_order: built } }),
    ).toEqual(built);
  });
});
