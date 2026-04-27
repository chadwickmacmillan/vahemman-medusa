import { Module } from "@medusajs/framework/utils";
import NotificationPreferenceService from "./service";

export const NOTIFICATION_PREFERENCE_MODULE = "notification_preference";

export default Module(NOTIFICATION_PREFERENCE_MODULE, {
  service: NotificationPreferenceService,
});
