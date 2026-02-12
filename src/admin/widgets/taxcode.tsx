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
  const { tax_code } = useTaxCode(data.id);

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
            Assign code
          </Button>
        </div>
        <div>
          {tax_code?.code ? (
            <>
              <SectionRow title="Code" value={tax_code.code} />
              <SectionRow title="Name" value={tax_code.name} />
              <SectionRow title="Description" value={tax_code.description} />
            </>
          ) : (
            <SectionRow title="Code" value="-" />
          )}
        </div>
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
