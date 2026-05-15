import { z } from "@medusajs/framework/zod";
import {
  Button,
  Container,
  Drawer,
  DropdownMenu,
  Heading,
  IconButton,
  Kbd,
  Label,
  Prompt,
  Switch,
  Table,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import {
  useColors,
  useCreateColorMutation,
  useDeleteColorMutation,
  useRestoreColorMutation,
  useUpdateColorMutation,
} from "../../hooks/color";
import { Form } from "../../components/Form";
import FormField from "../../components/FormField";
import { useSearchParams } from "react-router-dom";
import {
  ArrowPath,
  EllipsisHorizontal,
  PencilSquare,
  Swatch,
  Trash,
} from "@medusajs/icons";
import { defineRouteConfig } from "@medusajs/admin-sdk";

const colorFormSchema = z.object({
  name: z.string().min(1),
  hex_code: z.string().min(7).max(7),
});

const EditColorDrawer = ({
  id,
  initialValues,
  children,
}: {
  id: string;
  initialValues: z.infer<typeof colorFormSchema>;
  children: React.ReactNode;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const updateColorMutation = useUpdateColorMutation(id, {
    onSuccess: () => {
      setIsDrawerOpen(false);
    },
  });

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit Color</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Form
            schema={colorFormSchema}
            onSubmit={async (values) => {
              await updateColorMutation.mutateAsync(values);
              setIsDrawerOpen(false);
            }}
            formProps={{
              id: `edit-color-${id}-form`,
            }}
            defaultValues={initialValues}
          >
            <div className="flex flex-col gap-4">
              <fieldset disabled>
                <FormField name="name" label="Name" />
              </fieldset>
              <FormField
                name="hex_code"
                label="Hex Code"
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
            form={`edit-color-${id}-form`}
            isLoading={updateColorMutation.isPending}
          >
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
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const deleteColorMutation = useDeleteColorMutation(id, {
    onSuccess: () => {
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
          <Prompt.Action
            onClick={() => {
              deleteColorMutation.mutate();
            }}
          >
            Delete
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

const RestoreColorPrompt = ({
  name,
  id,
  children,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
}) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const restoreColorMutation = useRestoreColorMutation(id, {
    onSuccess: () => {
      setIsPromptOpen(false);
    },
  });

  return (
    <Prompt
      open={isPromptOpen}
      onOpenChange={setIsPromptOpen}
      variant="confirmation"
    >
      <Prompt.Trigger asChild>{children}</Prompt.Trigger>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Restore {name} color?</Prompt.Title>
          <Prompt.Description>
            Are you sure you want to restore the color {name}?
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action
            onClick={() => {
              restoreColorMutation.mutate();
            }}
          >
            Restore
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

const ColorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const setPage = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", page.toString());
      return next;
    });
  };

  const deleted = searchParams.has("deleted");

  const toggleDeleted = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (prev.has("page")) {
        next.delete("page");
      }

      if (!prev.has("deleted")) {
        next.set("deleted", "");
      } else {
        next.delete("deleted");
      }

      return next;
    });
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, isError, isSuccess } = useColors(page, deleted);

  const createColorMutation = useCreateColorMutation();

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="px-6 py-4 flex justify-between">
        <Heading className="font-sans font-medium h1-core">Colors</Heading>
        <div className="flex flex-row gap-4">
          <div className="flex items-center gap-x-2">
            <Switch
              id="deleted-flag"
              checked={deleted}
              onClick={() => {
                toggleDeleted();
              }}
            />
            <Label htmlFor="deleted-flag">Show Deleted</Label>
          </div>
          <Drawer open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <Drawer.Trigger asChild>
              <Button variant="secondary" size="small">
                Create
              </Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Create Color</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <Form
                  schema={colorFormSchema}
                  onSubmit={async (values) => {
                    await createColorMutation.mutateAsync(values);
                    setIsCreateModalOpen(false);
                  }}
                  formProps={{
                    id: "create-color-form",
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <FormField name="name" label="Name" />
                    <FormField
                      name="hex_code"
                      label="Hex Code"
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
                  form="create-color-form"
                  isLoading={createColorMutation.isPending}
                >
                  Create
                </Button>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
        </div>
      </div>
      <div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Hex Code</Table.HeaderCell>
              <Table.HeaderCell>&nbsp;</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading && (
              <Table.Row>
                {/* @ts-ignore */}
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
            {isSuccess && data.colors.length === 0 && (
              <Table.Row>
                {/* @ts-ignore */}
                <Table.Cell colSpan={3}>
                  <Text>No colors found</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {isSuccess &&
              data.colors.length > 0 &&
              data.colors.map((color) => (
                <Table.Row key={color.id}>
                  <Table.Cell>{color.name}</Table.Cell>
                  <Table.Cell>
                    <Kbd className="flex flex-row gap-1 items-center font-mono">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `${color.hex_code}` }}
                      />
                      {color.hex_code}
                    </Kbd>
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
                          <EditColorDrawer id={color.id} initialValues={color}>
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
                        {color.deleted_at ? (
                          <DropdownMenu.Item asChild>
                            <RestoreColorPrompt id={color.id} name={color.name}>
                              <Button
                                variant="transparent"
                                className="flex flex-row gap-2 items-center w-full justify-start"
                              >
                                <ArrowPath className="text-fg-subtle dark:text-fg-subtle-dark" />
                                Restore
                              </Button>
                            </RestoreColorPrompt>
                          </DropdownMenu.Item>
                        ) : (
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
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
        <Table.Pagination
          count={data?.count || 0}
          pageSize={20}
          pageIndex={page - 1}
          pageCount={data?.last_page ?? 1}
          canPreviousPage={page > 1}
          canNextPage={page < (data?.last_page ?? 1)}
          previousPage={() => setPage(Math.max(1, page - 1))}
          nextPage={() => setPage(Math.min(page + 1, data?.last_page ?? 1))}
        />
      </div>
    </Container>
  );
};

export default ColorPage;

export const config = defineRouteConfig({
  label: "Colors",
  icon: Swatch,
});
