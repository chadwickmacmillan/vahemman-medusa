import { Button, Container, FocusModal, Select } from "@medusajs/ui";

import { SectionRow } from "./SectionRow";
import { useTaxCodes } from "../hooks/taxcode";
import { useState } from "react";

type TaxCode = {
  id: string;
  name: string;
  description: string;
  code: string;
};

type Props = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  taxCode?: TaxCode;
  categoryId?: string;
};

const AssignCategoryTaxCodeModal = ({
  isOpen,
  onOpenChange,
  taxCode,
  categoryId,
}: Props) => {
  const save = () => {
    onOpenChange?.(false);
  };
  const { taxCodes } = useTaxCodes();

  const [selectedValue, setSelectedValue] = useState(
    () => taxCode?.id ?? taxCodes[0].id
  );

  const selectedTaxCode = taxCodes.find(
    (taxCode) => taxCode.id === selectedValue
  );

  return (
    <FocusModal open={isOpen} onOpenChange={onOpenChange}>
      <div>
        <Select
          value={selectedValue}
          onValueChange={(val) => setSelectedValue(val)}
        >
          <Select.Trigger>
            <Select.Value placeholder="Name" />
          </Select.Trigger>
          <Select.Content>
            {taxCodes.map((taxCode) => (
              <Select.Item key={taxCode.id} value={taxCode.id}>
                {taxCode.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Container>
          <SectionRow title="Code" value={selectedTaxCode?.code ?? "-"} />
          <SectionRow title="Name" value={selectedTaxCode?.name ?? "-"} />
          <SectionRow
            title="Description"
            value={selectedTaxCode?.description ?? "-"}
          />
          <Button
            size="small"
            variant="secondary"
            onClick={save}
            disabled={!selectedValue}
          >
            Save
          </Button>
        </Container>
      </div>
    </FocusModal>
  );
};

export default AssignCategoryTaxCodeModal;
