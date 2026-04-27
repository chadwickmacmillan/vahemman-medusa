import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { NOTIFICATION_PREFERENCE_MODULE } from "../../../modules/notification_preference";
import NotificationPreferenceService from "../../../modules/notification_preference/service";

export const getAdminEmailsForNotificationTypeStep = createStep(
  "get-admin-emails-for-notification-type",
  async ({ type }: { type: string }, { container }) => {
    const userService = container.resolve(Modules.USER);
    const prefService = container.resolve(
      NOTIFICATION_PREFERENCE_MODULE,
    ) as NotificationPreferenceService;

    const users = await userService.listUsers({}, { select: ["id", "email"] });

    const disabledPrefs = await prefService.listNotificationPreferences({
      user_id: users.map((u) => u.id),
      type,
      enabled: false,
    });

    const disabledUserIds = new Set(disabledPrefs.map((p) => p.user_id));

    const emails = users
      .filter((u) => u.email && !disabledUserIds.has(u.id))
      .map((u) => u.email!);

    return new StepResponse(emails);
  },
);
