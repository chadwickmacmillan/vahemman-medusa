import * as React from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import {
  Container,
  Heading,
  Text,
  Button,
  Drawer,
  IconButton,
} from "@medusajs/ui";
import { PlusMini } from "@medusajs/icons";
import { z } from "@medusajs/framework/zod";
import { useEffect } from "react";

import {
  useCreateColorMutation,
  useProductColors,
  useUpdateColorMutation,
} from "../hooks/color";
import { Form } from "../components/Form";
import FormField from "../components/FormField";

const addColorFormSchema = z.object({
  name: z.string().min(1),
  hex_code: z.string().min(7).max(7),
});

const AddColorDrawer = ({
  name,
  children,
  onColorAdd,
}: {
  name: string;
  children: React.ReactNode;
  onColorAdd?: () => void;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const createColorMutation = useCreateColorMutation({
    onSuccess: () => {
      setIsDrawerOpen(false);
      onColorAdd?.();
    },
  });

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Add new color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">
          <Form
            schema={addColorFormSchema}
            onSubmit={async (values) => {
              createColorMutation.mutate(values);
            }}
            defaultValues={{
              name,
            }}
            formProps={{
              id: `add-color-${name.toLowerCase().replace(/[^\w]/g, "-")}`,
            }}
          >
            <div className="flex flex-col gap-4">
              <fieldset disabled>
                <FormField name="name" label="Name" />
              </fieldset>
              <FormField
                name="hex_code"
                label="Hex code"
                type="color"
                inputProps={{
                  className: "max-w-8",
                }}
              />
            </div>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            type="submit"
            form={`add-color-${name.toLowerCase().replace(/[^\w]/g, "-")}`}
            isLoading={createColorMutation.isPending}
            disabled={createColorMutation.isPending}
          >
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const EditColorDrawer = ({
  id,
  name,
  hexCode,
  children,
  onColorEdit,
}: {
  id: string;
  name: string;
  hexCode: string;
  children: React.ReactNode;
  onColorEdit?: () => void;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const updateColorMutation = useUpdateColorMutation(id, {
    onSuccess: () => {
      setIsDrawerOpen(false);
      onColorEdit?.();
    },
  });

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">
          <Form
            schema={addColorFormSchema}
            onSubmit={async (values) => {
              updateColorMutation.mutate(values);
            }}
            defaultValues={{
              name,
              hex_code: hexCode,
            }}
            formProps={{
              id: `edit-color-${name.toLowerCase().replace(/[^\w]/g, "-")}`,
            }}
          >
            <div className="flex flex-col gap-4">
              <fieldset disabled>
                <FormField name="name" label="Name" />
              </fieldset>
              <FormField
                name="hex_code"
                label="Hex code"
                type="color"
                inputProps={{
                  className: "max-w-8",
                }}
              />
            </div>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            type="submit"
            form={`edit-color-${name.toLowerCase().replace(/[^\w]/g, "-")}`}
            isLoading={updateColorMutation.isPending}
            disabled={updateColorMutation.isPending}
          >
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const ProductFashionWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productColors = useProductColors(data.id);

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-row items-center justify-between px-6 py-4 gap-6">
        <Heading>Colors</Heading>
      </div>
      <div className="text-fg-subtle dark:text-fg-subtle-dark px-6 py-4">
        {productColors.isLoading ? (
          <Text>Loading...</Text>
        ) : productColors.isError ? (
          <Text>Error loading product materials</Text>
        ) : productColors.isSuccess && productColors.data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-4">
            {productColors.data.colors.map((color) => (
              <div key={color.id} className="flex flex-col items-center gap-1">
                <EditColorDrawer
                  name={color.name}
                  id={color.id}
                  hexCode={color.hex_code}
                >
                  <IconButton
                    variant="transparent"
                    style={{ backgroundColor: color.hex_code }}
                    className="w-10 h-10 border-2 border-grayscale-40 rounded-full"
                  />
                </EditColorDrawer>
                <Text size="xsmall" leading="compact" className="text-center">
                  {color.name}
                </Text>
              </div>
            ))}
            {productColors.data.missing_colors.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <AddColorDrawer
                  name={color}
                  onColorAdd={() => productColors.refetch()}
                >
                  <IconButton
                    variant="transparent"
                    className="w-10 h-10 bg-grayscale-20 border-2 border-dashed border-button-danger dark:border-button-danger-dark rounded-full"
                  >
                    <PlusMini />
                  </IconButton>
                </AddColorDrawer>
                <Text size="xsmall" leading="compact" className="text-center">
                  {color}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text>No color details set</Text>
        )}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
});

export default ProductFashionWidget;
