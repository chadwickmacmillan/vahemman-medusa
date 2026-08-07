import * as React from "react";
import { DotsSix } from "@medusajs/icons";
import { clx } from "@medusajs/ui";
import {
  DropIndicator,
  GridList,
  GridListItem,
  useDragAndDrop,
} from "react-aria-components";

/**
 * A drag-to-reorder list.
 *
 * The dashboard has its own `SortableList`, but it isn't part of the package's
 * public exports, and its @dnd-kit dependency isn't declared by this project.
 * This is built on react-aria-components instead, which is already a direct
 * dependency and gives pointer, touch, and keyboard reordering (focus a row and
 * use the drag button its screen-reader affordance exposes) for free.
 */

export type SortableListItem = { id: string };

type SortableListProps<TItem extends SortableListItem> = {
  items: TItem[];
  /** Called with the full list in its new order. */
  onReorder: (items: TItem[]) => void;
  renderItem: (item: TItem) => React.ReactNode;
  /** Plain-text label for each row, used by assistive technology. */
  getLabel: (item: TItem) => string;
  label: string;
  /** Blocks interaction and dims the list, e.g. while a save is in flight. */
  disabled?: boolean;
};

export const SortableList = <TItem extends SortableListItem>({
  items,
  onReorder,
  renderItem,
  getLabel,
  label,
  disabled,
}: SortableListProps<TItem>) => {
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => {
        const item = items.find((candidate) => candidate.id === key);
        return { "text/plain": item ? getLabel(item) : String(key) };
      }),
    // Only fires for drags originating in this list — a drop from elsewhere
    // would need an onInsert/onRootDrop handler, which we deliberately omit.
    onReorder: (event) => {
      // Drops are ignored while disabled rather than the drag hooks being
      // withheld — see the note on the GridList below.
      if (disabled) {
        return;
      }

      const moved = items.filter((item) => event.keys.has(item.id));
      const rest = items.filter((item) => !event.keys.has(item.id));
      const targetIndex = rest.findIndex(
        (item) => item.id === event.target.key,
      );

      // targetIndex is -1 when the row was dropped onto itself.
      if (!moved.length || targetIndex === -1) {
        return;
      }

      const insertAt =
        event.target.dropPosition === "before" ? targetIndex : targetIndex + 1;

      onReorder([
        ...rest.slice(0, insertAt),
        ...moved,
        ...rest.slice(insertAt),
      ]);
    },
    renderDropIndicator: (target) => (
      <DropIndicator
        target={target}
        className="bg-ui-fg-interactive h-0.5 outline-none opacity-0 data-[drop-target]:opacity-100"
      />
    ),
  });

  return (
    <div
      className={clx(disabled && "pointer-events-none opacity-60")}
      aria-disabled={disabled || undefined}
    >
      <GridList
        aria-label={label}
        items={items}
        selectionMode="none"
        // Must never be withheld once provided: GridList calls its drag hooks
        // inside `if (dragAndDropHooks)`, so swapping this to undefined changes
        // the hook count mid-lifecycle and React throws "Should have a queue".
        // Disabling is handled by the wrapper above and the onReorder guard.
        dragAndDropHooks={dragAndDropHooks}
        className="flex flex-col"
      >
        {(item) => (
          <GridListItem
            id={item.id}
            textValue={getLabel(item)}
            className={clx(
              "border-ui-border-base flex items-center gap-x-3 border-b px-6 py-3 outline-none last:border-b-0",
              "data-[focus-visible]:bg-ui-bg-base-hover",
              disabled
                ? "cursor-default"
                : "cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:opacity-50",
            )}
          >
            <DotsSix
              className={clx(
                "shrink-0",
                disabled ? "text-ui-fg-disabled" : "text-ui-fg-muted",
              )}
            />
            {renderItem(item)}
          </GridListItem>
        )}
      </GridList>
    </div>
  );
};
