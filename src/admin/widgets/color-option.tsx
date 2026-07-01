import * as React from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProductOption } from "@medusajs/framework/types";
import {
  Button,
  Container,
  Drawer,
  DropdownMenu,
  Heading,
  IconButton,
  Input,
  Kbd,
  Prompt,
  Table,
  Text,
  toast,
} from "@medusajs/ui";
import { EllipsisHorizontal, PencilSquare, Plus, Trash } from "@medusajs/icons";
import { z } from "@medusajs/framework/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";

import {
  OptionColor,
  useCreateColorMutation,
  useDeleteColorMutation,
  useProductOptionColors,
  useUpdateColorMutation,
} from "../hooks/color";
import { addColorFormSchema, editColorFormSchema } from "../schemas/color";
import { UploadMediaFormItem } from "../components/UploadMediaFormItem";
import { Form } from "../components/Form";

type Color = OptionColor;

const AddColorDrawer = ({
  children,
  initialValues,
  onColorAdd,
}: {
  children: React.ReactNode;
  initialValues: z.infer<typeof addColorFormSchema>;
  onColorAdd?: () => void;
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
    // @ts-ignore — media is uploaded inside the mutation
    createColorMutation.mutate(values);
  };

  const handleError: SubmitErrorHandler<z.infer<typeof addColorFormSchema>> = (
    errors,
  ) => {
    console.error(errors);
    toast.error("There was an error saving the color. Please try again.");
  };

  const { append } = useFieldArray({
    name: "media",
    control: form.control,
    keyName: "field_id",
  });

  const formId = `add-color-${initialValues.name?.toLowerCase().replace(/[^\w]/g, "-")}`;

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Set Color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleError)} id={formId}>
              <div className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="hex_code"
                  render={({ field: { onChange, value, name } }) => (
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
                  )}
                />
                <UploadMediaFormItem form={form} append={append} singleton />
              </div>
            </form>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button type="submit" form={formId} isLoading={createColorMutation.isPending}>
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
  initialImage,
  children,
}: {
  id: string;
  initialValues: z.infer<typeof editColorFormSchema>;
  initialImage?: string;
  children: React.ReactNode;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [mediaChanged, setMediaChanged] = React.useState(false);
  const updateColorMutation = useUpdateColorMutation(id, {
    onSuccess: () => {
      setIsDrawerOpen(false);
    },
  });

  const form = useForm<z.infer<typeof editColorFormSchema>>({
    defaultValues: initialValues,
    resolver: zodResolver(editColorFormSchema),
  });

  const handleSubmit: SubmitHandler<z.infer<typeof editColorFormSchema>> = (
    values,
  ) => {
    // @ts-ignore — the mutation uploads media and accepts the extra flag
    updateColorMutation.mutate({ ...values, mediaChange: mediaChanged });
  };

  const handleError: SubmitErrorHandler<z.infer<typeof editColorFormSchema>> = (
    errors,
  ) => {
    console.error(errors);
    toast.error("There was an error saving the color. Please try again.");
  };

  const { append } = useFieldArray({
    name: "media",
    control: form.control,
    keyName: "field_id",
  });

  const formId = `edit-color-${form.getValues("name")?.toLowerCase().replace(/[^\w]/g, "-")}`;

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit Color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleError)} id={formId}>
              <div className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="hex_code"
                  render={({ field: { onChange, value, name } }) => (
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
                  )}
                />
                <UploadMediaFormItem
                  form={form}
                  append={append}
                  singleton
                  initialImage={initialImage}
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
          <Button type="submit" form={formId} isLoading={updateColorMutation.isPending}>
            Update
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const DeleteColorPrompt = ({
  name,
  id,
  children,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
}) => {
  const [isPromptOpen, setIsPromptOpen] = React.useState(false);
  const deleteColorMutation = useDeleteColorMutation(id, {
    onSuccess: () => setIsPromptOpen(false),
    onError: (error) => {
      toast.error("There was an error deleting the color. Please try again.");
      console.error(error);
      setIsPromptOpen(false);
    },
  });

  return (
    <Prompt open={isPromptOpen} onOpenChange={setIsPromptOpen}>
      <Prompt.Trigger asChild>{children}</Prompt.Trigger>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Delete {name} color?</Prompt.Title>
          <Prompt.Description>
            Are you sure you want to delete the color {name}?
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action onClick={() => deleteColorMutation.mutate()}>
            Delete
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

const ColorSwatch = ({ color }: { color: Color }) =>
  color.media_url ? (
    <div
      className="w-6 h-6 rounded-full border border-ui-tag-neutral-border"
      style={{
        backgroundImage: `url(${color.media_url})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    />
  ) : (
    <Kbd className="flex flex-row gap-1 items-center font-mono">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color.hex_code ?? undefined }}
      />
      {color.hex_code}
    </Kbd>
  );

const ColorOptionWidget = ({ data }: DetailWidgetProps<AdminProductOption>) => {
  // Only the Color option carries swatch data.
  if (data.title !== "Color") {
    return null;
  }

  const { data: colorData, isLoading, isError, isSuccess, refetch } =
    useProductOptionColors(data.id);

  const colors: Color[] = colorData?.colors ?? [];
  const missingColors: string[] = colorData?.missing_colors ?? [];
  const isEmpty = isSuccess && colors.length === 0 && missingColors.length === 0;

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="px-6 py-4 flex flex-col gap-1">
        <Heading level="h2">Colors</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          The swatch (hex code or image) shown for each value of this option.
        </Text>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Swatch</Table.HeaderCell>
            <Table.HeaderCell>&nbsp;</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading && (
            <Table.Row>
              {/* @ts-ignore colSpan is valid on the underlying td */}
              <Table.Cell colSpan={3}>
                <Text>Loading...</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {isError && (
            <Table.Row>
              {/* @ts-ignore */}
              <Table.Cell colSpan={3}>
                <Text>Error loading colors</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {isEmpty && (
            <Table.Row>
              {/* @ts-ignore */}
              <Table.Cell colSpan={3}>
                <Text>No values on this option</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {colors.map((color) => (
            <Table.Row key={color.id}>
              <Table.Cell>{color.name}</Table.Cell>
              <Table.Cell>
                <ColorSwatch color={color} />
              </Table.Cell>
              <Table.Cell className="text-right">
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <IconButton>
                      <EllipsisHorizontal />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item asChild>
                      <EditColorDrawer
                        id={color.id}
                        initialValues={{
                          name: color.name,
                          hex_code: color.hex_code,
                          media: [],
                        }}
                        initialImage={color.media_url}
                      >
                        <Button
                          variant="transparent"
                          className="flex flex-row gap-2 items-center w-full justify-start"
                        >
                          <PencilSquare className="text-fg-subtle dark:text-fg-subtle-dark" />
                          Edit
                        </Button>
                      </EditColorDrawer>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item asChild>
                      <DeleteColorPrompt id={color.id} name={color.name}>
                        <Button
                          variant="transparent"
                          className="flex flex-row gap-2 items-center w-full justify-start"
                        >
                          <Trash className="text-fg-subtle dark:text-fg-subtle-dark" />
                          Delete
                        </Button>
                      </DeleteColorPrompt>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </Table.Cell>
            </Table.Row>
          ))}
          {missingColors.map((name) => (
            <Table.Row key={name}>
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell>
                <Text size="small" className="text-ui-fg-muted">
                  Not set
                </Text>
              </Table.Cell>
              <Table.Cell className="text-right">
                <AddColorDrawer
                  initialValues={{ name, hex_code: null, media: [] }}
                  onColorAdd={() => refetch()}
                >
                  <Button
                    variant="secondary"
                    size="small"
                    className="flex flex-row gap-1 items-center"
                  >
                    <Plus />
                    Set color
                  </Button>
                </AddColorDrawer>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_option.details.after",
});

export default ColorOptionWidget;
