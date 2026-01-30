import { Text, clx } from "@medusajs/ui";

export type SectionRowProps = {
  title: string;
  value?: React.ReactNode | string | null;
  actions?: React.ReactNode;
};

export const SectionRow = ({ title, value, actions }: SectionRowProps) => {
  return (
    <div
      className={clx(
        `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`,
        {
          "grid-cols-[1fr_1fr_28px]": !!actions,
        }
      )}
    >
      <Text size="small" weight="plus" leading="compact">
        {title}
      </Text>
      <Text
        size="small"
        leading="compact"
        className="whitespace-pre-line text-pretty"
      >
        {value ?? "-"}
      </Text>
      {actions && <div>{actions}</div>}
    </div>
  );
};
