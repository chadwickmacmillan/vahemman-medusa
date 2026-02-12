import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, DropdownMenu, Heading } from "@medusajs/ui";
import { useState } from "react";
import { SectionRow } from "../components/SectionRow";
import { useTaxCode } from "../hooks/taxcode";
import {
  AdminProductCategory,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import AssignCategoryTaxCodeModal from "../components/AssignCategoryTaxCodeModal";
import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons";

const TaxCodeWidget = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
  const [editMode, setEditMode] = useState(false);
  const { tax_code } = useTaxCode(data.id);

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">US Taxcode</Heading>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <EllipsisHorizontal />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item className="gap-x-2">
                <PencilSquare
                  className="text-ui-fg-subtle"
                  onSelect={() => setEditMode(true)}
                />
                Edit
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        {tax_code?.code ? (
          <>
            <SectionRow title="Code" value={tax_code.code} />
            <SectionRow title="Name" value={tax_code.name} />
            <SectionRow title="Description" value={tax_code.description} />
          </>
        ) : (
          <SectionRow title="Code" value="-" />
        )}
      </Container>
      <AssignCategoryTaxCodeModal
        isOpen={editMode}
        onOpenChange={(isEnabled) => setEditMode(isEnabled)}
        taxCode={tax_code}
        productId={data.id}
      />
    </>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default TaxCodeWidget;
