import { model } from "@medusajs/framework/utils";

const NotificationPreference = model.define("notification_preference", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  type: model.text(),
  enabled: model.boolean().default(true),
});

export default NotificationPreference;
