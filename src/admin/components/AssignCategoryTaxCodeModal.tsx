import {
  Button,
  Container,
  FocusModal,
  Heading,
  Select,
  Text,
  toast,
} from "@medusajs/ui";

import { SectionRow } from "./SectionRow";
import { useTaxCodes, useTriggerTaxCodeProductSave } from "../hooks/taxcode";
import { useEffect, useState } from "react";

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
  productId: string;
};

const AssignCategoryTaxCodeModal = ({
  isOpen,
  onOpenChange,
  taxCode,
  productId,
}: Props) => {
  const { tax_codes } = useTaxCodes();

  const [selectedValue, setSelectedValue] = useState(
    () => taxCode?.id ?? tax_codes?.[0]?.id ?? ""
  );

  const selectedTaxCode = tax_codes?.find(
    (taxCode) => taxCode.id === selectedValue
  );

  const { mutateAsync, isPending } = useTriggerTaxCodeProductSave(
    productId,
    selectedValue
  );

  const save = async () => {
    try {
      await mutateAsync();
      toast.success(`Assigned tax code to product`);
      onOpenChange?.(false);
    } catch (err) {
      toast.error(
        `Couldn't trigger sync: ${(err as Record<string, unknown>).message}`
      );
    }
  };

  return (
    <FocusModal open={isOpen} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>Assign Tax Code</FocusModal.Title>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div className="flex flex-col gap-y-1">
              <Heading>Assign Tax Code</Heading>
              <Text className="text-ui-fg-subtle">
                Assign US Tax Code to a product from the list below.
              </Text>
            </div>
            <div className="pt-4">
              <Select
                value={selectedValue}
                onValueChange={(val) => setSelectedValue(val)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Name" />
                </Select.Trigger>
                <Select.Content>
                  {tax_codes?.map((taxCode) => (
                    <Select.Item key={taxCode.id} value={taxCode.id}>
                      {taxCode.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <Container className="pt-4">
              <SectionRow title="Code" value={selectedTaxCode?.code ?? "-"} />
              <SectionRow title="Name" value={selectedTaxCode?.name ?? "-"} />
              <SectionRow
                title="Description"
                value={selectedTaxCode?.description ?? "-"}
              />
            </Container>
          </div>
        </FocusModal.Body>
        <FocusModal.Footer>
          <Button onClick={save} isLoading={isPending}>
            Save
          </Button>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  );
};

export default AssignCategoryTaxCodeModal;
