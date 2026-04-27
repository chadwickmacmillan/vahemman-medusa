import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { NOTIFICATION_PREFERENCE_MODULE } from "../../../modules/notification_preference";
import NotificationPreferencesService from "../../../modules/notification_preference/service";

const PREFERENCE_TYPES = ["order-placed"];

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const userId = req.auth_context.actor_id;
  const service = req.scope.resolve<NotificationPreferencesService>(
    NOTIFICATION_PREFERENCE_MODULE,
  );

  const prefs = await service.listNotificationPreferences({
    filters: { user_id: userId },
  });

  const prefMap = Object.fromEntries(prefs.map((p) => [p.type, p.enabled]));

  const result = PREFERENCE_TYPES.map((type) => ({
    type,
    enabled: prefMap[type] ?? true,
  }));

  res.json({ preferences: result });
};
