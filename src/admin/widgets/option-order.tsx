import * as React from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { HttpTypes } from "@medusajs/types";
import { Button, Container, Heading, Label, Text, toast } from "@medusajs/ui";

import { SortableList } from "../components/SortableList";
import { useUpdateProductOptionOrderMutation } from "../hooks/product-option-order";

type Option = HttpTypes.AdminProductOption;

/** The saved order, flattened to IDs, for comparing against the edited one. */
const orderSignature = (options: Option[]): string =>
  options
    .map(
      (option) =>
        `${option.id}:${(option.values ?? []).map((value) => value.id).join(",")}`,
    )
    .join("|");

const OptionOrderWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  // The API already returns these in their saved display order.
  const saved = React.useMemo<Option[]>(
    () => data.options ?? [],
    [data.options],
  );

  const [order, setOrder] = React.useState<Option[]>(saved);

  // Reset to the saved order when it actually changes — after a save, or if the
  // product is edited elsewhere. Keyed on the signature rather than the array
  // identity so a routine background refetch doesn't wipe an in-progress drag.
  const savedSignature = orderSignature(saved);
  const appliedSignature = React.useRef(savedSignature);

  React.useEffect(() => {
    if (appliedSignature.current !== savedSignature) {
      appliedSignature.current = savedSignature;
      setOrder(saved);
    }
  }, [saved, savedSignature]);

  const updateOrderMutation = useUpdateProductOptionOrderMutation({
    onSuccess: () => toast.success("Option order updated."),
    onError: (error) => {
      console.error(error);
      toast.error(
        error.message || "There was an error saving the option order.",
      );
    },
  });

  const reorderValues = (optionId: string, values: Option["values"]) =>
    setOrder((current) =>
      current.map((option) =>
        option.id === optionId ? { ...option, values } : option,
      ),
    );

  const isDirty = orderSignature(order) !== savedSignature;
  const isSaving = updateOrderMutation.isPending;

  const hasSomethingToOrder =
    saved.length > 1 ||
    saved.some((option) => (option.values?.length ?? 0) > 1);

  if (!hasSomethingToOrder) {
    return null;
  }

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="px-6 py-4 flex flex-col gap-1">
        <Heading level="h2">Option order</Heading>
      </div>

      {saved.length > 1 && (
        <SortableList
          label="Product option order"
          items={order}
          onReorder={setOrder}
          getLabel={(option) => option.title}
          disabled={isSaving}
          renderItem={(option) => (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-x-3">
              <Text size="small" className="truncate">
                {option.title}
              </Text>
              <Text size="small" className="text-ui-fg-muted shrink-0">
                {option.values?.length ?? 0} value
                {option.values?.length === 1 ? "" : "s"}
              </Text>
            </div>
          )}
        />
      )}

      {order.map((option) =>
        (option.values?.length ?? 0) > 1 ? (
          <div key={option.id} className="border-ui-border-base border-t">
            <Label
              size="small"
              weight="plus"
              className="text-ui-fg-subtle block px-6 pt-4 pb-1"
            >
              {option.title} values
            </Label>
            <SortableList
              label={`${option.title} value order`}
              items={option.values ?? []}
              onReorder={(values) => reorderValues(option.id, values)}
              getLabel={(value) => value.value}
              disabled={isSaving}
              renderItem={(value) => (
                <Text size="small" className="min-w-0 flex-1 truncate">
                  {value.value}
                </Text>
              )}
            />
          </div>
        ) : null,
      )}

      <div className="border-ui-border-base flex items-center justify-end gap-x-2 border-t px-6 py-4">
        <Button
          size="small"
          variant="secondary"
          disabled={!isDirty || isSaving}
          onClick={() => setOrder(saved)}
        >
          Reset
        </Button>
        <Button
          size="small"
          disabled={!isDirty}
          isLoading={isSaving}
          onClick={() =>
            updateOrderMutation.mutate({ product: data, options: order })
          }
        >
          Save
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default OptionOrderWidget;
