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
  toast,
  Input,
} from "@medusajs/ui";
import { PlusMini } from "@medusajs/icons";
import { z } from "@medusajs/framework/zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateColorMutation,
  useProductColors,
  useUpdateColorMutation,
} from "../hooks/color";
import { Form } from "../components/Form";
import {
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { UploadMediaFormItem } from "../components/UploadMediaFormItem";
import { addColorFormSchema, editColorFormSchema } from "../schemas/color";

const AddColorDrawer = ({
  children,
  onColorAdd,
  initialValues,
}: {
  children: React.ReactNode;
  onColorAdd?: () => void;
  initialValues: z.infer<typeof addColorFormSchema>;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const createColorMutation = useCreateColorMutation({
    onSuccess: () => {
      setIsDrawerOpen(false);
      onColorAdd?.();
    },
  });

  const form = useForm<z.infer<typeof addColorFormSchema>>({
    defaultValues: initialValues,
    resolver: zodResolver(addColorFormSchema),
  });

  const handleSubmit: SubmitHandler<z.infer<typeof addColorFormSchema>> = (
    values,
  ) => {
    //@ts-ignore
    createColorMutation.mutate(values);
  };

  const handleError: SubmitErrorHandler<z.infer<typeof addColorFormSchema>> = (
    errors,
  ) => {
    console.error(errors);
    toast.error("There was an error saving the color. Please try again.");
  };

  const { append, delete: deleteItem } = useFieldArray({
    name: "media",
    control: form.control,
    keyName: "field_id",
  });

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Add new color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, handleError)}
              id={`add-color-${form.getValues("name")?.toLowerCase().replace(/[^\w]/g, "-")}`}
            >
              <div className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>Name</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="hex_code"
                  render={({ field: { onChange, value, name } }) => {
                    return (
                      <Form.Item>
                        <Form.Label>Hex Code</Form.Label>
                        <Form.Control>
                          <input
                            name={name}
                            type="color"
                            onChange={onChange}
                            value={value ?? ""}
                          />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
                <UploadMediaFormItem form={form} singleton append={append} />
              </div>
            </form>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            type="submit"
            form={`add-color-${form.getValues("name")?.toLowerCase().replace(/[^\w]/g, "-")}`}
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
  initialValues,
  children,
  onColorEdit,
  initialImage,
}: {
  id: string;
  initialValues: z.infer<typeof editColorFormSchema>;
  children: React.ReactNode;
  onColorEdit?: () => void;
  initialImage?: string;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [mediaChanged, setMediaChanged] = React.useState(false);
  const updateColorMutation = useUpdateColorMutation(id, {
    onSuccess: () => {
      setIsDrawerOpen(false);
      onColorEdit?.();
    },
  });

  const form = useForm<z.infer<typeof editColorFormSchema>>({
    defaultValues: initialValues,
    resolver: zodResolver(editColorFormSchema),
  });

  const handleSubmit: SubmitHandler<z.infer<typeof editColorFormSchema>> = (
    values,
  ) => {
    updateColorMutation.mutate({
      ...values,
      mediaChange: mediaChanged,
    });
  };

  const handleError: SubmitErrorHandler<z.infer<typeof editColorFormSchema>> = (
    errors,
  ) => {
    console.error(errors);
    toast.error("There was an error saving the color. Please try again.");
  };

  const { append, delete: deleteItem } = useFieldArray({
    name: "media",
    control: form.control,
    keyName: "field_id",
  });

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, handleError)}
              id={`edit-color-${form.getValues("name")?.toLowerCase().replace(/[^\w]/g, "-")}`}
            >
              <div className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>Name</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="hex_code"
                  render={({ field: { onChange, value, name } }) => {
                    return (
                      <Form.Item>
                        <Form.Label>Hex code</Form.Label>
                        <Form.Control>
                          <input
                            name={name}
                            type="color"
                            onChange={onChange}
                            value={value ?? ""}
                          />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
                <UploadMediaFormItem
                  form={form}
                  append={append}
                  delete={deleteItem}
                  initialImage={initialImage}
                  singleton
                  onChanged={() => setMediaChanged(true)}
                />
              </div>
            </form>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            type="submit"
            form={`edit-color-${form.getValues("name")?.toLowerCase().replace(/[^\w]/g, "-")}`}
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
                  initialValues={{
                    name: color.name,
                    hex_code: color.hex_code,
                    media: [],
                  }}
                  initialImage={color.media_url}
                  id={color.id}
                >
                  <IconButton
                    variant="transparent"
                    style={{
                      backgroundColor: color.hex_code,
                      backgroundImage: `url(${color.media_url})`,
                    }}
                    className="w-10 h-10 border-2 border-grayscale-40 rounded-full bg-cover bg-center"
                  ></IconButton>
                </EditColorDrawer>
                <Text size="xsmall" leading="compact" className="text-center">
                  {color.name}
                </Text>
              </div>
            ))}
            {productColors.data.missing_colors.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <AddColorDrawer
                  initialValues={{ name: color, hex_code: null, media: [] }}
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
