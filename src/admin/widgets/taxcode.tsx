import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading } from "@medusajs/ui";
import { useState } from "react";
import { SectionRow } from "../components/SectionRow";
import { useTaxCode } from "../hooks/taxcode";
import {
  AdminProductCategory,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import AssignCategoryTaxCodeModal from "../components/AssignCategoryTaxCodeModal";

const TaxCodeWidget = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
  const [editMode, setEditMode] = useState(false);
  const { taxCode } = useTaxCode(data.id);

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading>US Taxcode</Heading>
          <Button
            onClick={() => setEditMode(true)}
            type="button"
            size="small"
            variant="transparent"
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover flex-shrink-0"
          >
            {editMode ? "Cancel" : "Assign code"}
          </Button>
        </div>
        <div>
          {taxCode?.code ? (
            <>
              <SectionRow title="Code" value={taxCode.code} />
              <SectionRow title="Name" value={taxCode.name} />
              <SectionRow title="Description" value={taxCode.description} />
            </>
          ) : (
            <SectionRow title="Code" value="-" />
          )}
        </div>
      </Container>
      <AssignCategoryTaxCodeModal
        isOpen={editMode}
        onOpenChange={(isEnabled) => setEditMode(isEnabled)}
        taxCode={taxCode}
      />
    </>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
});

export default TaxCodeWidget;
