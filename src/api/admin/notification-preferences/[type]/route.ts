import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { NOTIFICATION_PREFERENCE_MODULE } from "../../../../modules/notification_preference";
import NotificationPreferencesService from "../../../../modules/notification_preference/service";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const userId = req.auth_context.actor_id;
  const type = req.params.type;
  const { enabled } = req.body as { enabled: boolean };

  const service = req.scope.resolve<NotificationPreferencesService>(
    NOTIFICATION_PREFERENCE_MODULE,
  );

  const preference = await service.setPreference(userId, type, enabled);
  res.json({ preference });
};
