import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Switch, Text, toast } from "@medusajs/ui";
import {
  useNotificationPreferences,
  useToggleNotificationPreference,
} from "../hooks/email-notifications";

const notificationTypeMap: Record<string, string> = {
  "order-placed": "New order",
};

const EmailNotificationsWidget = () => {
  const { preferences, isLoading } = useNotificationPreferences();
  const { mutate: toggle } = useToggleNotificationPreference();

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Email Notifications</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Manage which emails you receive as an admin.
        </Text>
      </div>
      {isLoading && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      )}
      {preferences?.map((pref) => (
        <div
          key={pref.type}
          className="flex items-center justify-between px-6 py-4"
        >
          <Text size="small" weight="plus">
            {notificationTypeMap[pref.type] ?? pref.type}
          </Text>
          <Switch
            checked={pref.enabled}
            onCheckedChange={(enabled) => toggle({ type: pref.type, enabled })}
          />
        </div>
      ))}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "profile.details.after",
});

export default EmailNotificationsWidget;
