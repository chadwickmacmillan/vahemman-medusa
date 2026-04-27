import { MedusaService } from "@medusajs/framework/utils";
import NotificationPreference from "./models/notification_preference";

class NotificationPreferenceService extends MedusaService({
  NotificationPreference,
}) {
  async getPreference(userId: string, type: string) {
    const [pref] = await this.listNotificationPreferences({
      filters: { user_id: userId, type },
    });
    return pref ?? null;
  }

  async setPreference(userId: string, type: string, enabled: boolean) {
    const existing = await this.getPreference(userId, type);
    if (existing) {
      return this.updateNotificationPreferences({ id: existing.id, enabled });
    }
    return this.createNotificationPreferences({
      user_id: userId,
      type,
      enabled,
    });
  }
}

export default NotificationPreferenceService;
