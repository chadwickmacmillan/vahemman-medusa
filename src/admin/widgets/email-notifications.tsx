import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { ArrowUpRightOnBox } from "@medusajs/icons";
import {
  Button,
  Checkbox,
  CodeBlock,
  Container,
  Label,
  StatusBadge,
  Text,
  toast,
} from "@medusajs/ui";
import { useState } from "react";
import {
  useSanityDocument,
  useTriggerSanityProductSync,
} from "../hooks/sanity";

const EmailNotificationsWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const { mutateAsync, isPending } = useTriggerSanityProductSync(data.id);
  const { sanity_document, studio_url, isLoading } = useSanityDocument(data.id);
  const [showCodeBlock, setShowCodeBlock] = useState(false);

  const handleSync = async () => {
    try {
      await mutateAsync(undefined);
      toast.success(`Sync triggered.`);
    } catch (err) {
      toast.error(
        `Couldn't trigger sync: ${(err as Record<string, unknown>).message}`,
      );
    }
  };

  return (
    <Container>
      <div className="flex justify-between w-full items-center">
        <div className="flex gap-2 items-center">
          <h2>Email Notifications</h2>
          <Text>Receive email notifications for updates.</Text>
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-4 flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="order-created" />
            <Label htmlFor="order-created">Order placed</Label>
          </div>
          <Button size="small" variant="secondary">
            Save
          </Button>
        </div>
      </div>
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "user.details.after",
});

export default EmailNotificationsWidget;
